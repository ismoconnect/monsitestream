import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

class StreamingService {
  constructor() {
    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
  }

  // --- VIEWER SIDE (Client) ---

  async joinStream(streamId, onRemoteStream) {
    this.pc = new RTCPeerConnection(servers);
    this.remoteStream = new MediaStream();

    this.pc.ontrack = (event) => {
      const stream = event.streams[0] || new MediaStream([event.track]);
      stream.getTracks().forEach((track) => {
        if (!this.remoteStream.getTracks().find(t => t.id === track.id)) {
          this.remoteStream.addTrack(track);
        }
      });
      onRemoteStream(this.remoteStream);
    };

    const streamDoc = doc(db, 'streams', streamId);
    const answerCandidates = collection(streamDoc, 'answerCandidates');
    const offerCandidates = collection(streamDoc, 'offerCandidates');

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    const streamSnapshot = await getDoc(streamDoc);
    if (!streamSnapshot.exists()) return;

    const { offer } = streamSnapshot.data();
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answerDescription = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(streamDoc, { answer });

    const iceCandidatesQueue = [];
    onSnapshot(offerCandidates, (snapshot) => {
      if (!this.pc) return;
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          if (this.pc?.remoteDescription) {
            this.pc.addIceCandidate(candidate);
          } else {
            iceCandidatesQueue.push(candidate);
          }
        }
      });
    });

    const checkAndFlushIce = setInterval(() => {
      if (this.pc?.remoteDescription && iceCandidatesQueue.length > 0) {
        iceCandidatesQueue.forEach(candidate => this.pc.addIceCandidate(candidate));
        iceCandidatesQueue.length = 0;
        clearInterval(checkAndFlushIce);
      }
    }, 500);

    return streamId;
  }

  // --- BROADCASTER SIDE (Admin) ---

  async startStream(userId, title, onLocalStream) {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.remoteStream = new MediaStream();

    this.pc = new RTCPeerConnection(servers);

    this.localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, this.localStream);
    });

    this.pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
    };

    onLocalStream(this.localStream);

    const streamDoc = doc(collection(db, 'streams'));
    const offerCandidates = collection(streamDoc, 'offerCandidates');
    const answerCandidates = collection(streamDoc, 'answerCandidates');

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    const offerDescription = await this.pc.createOffer();
    await this.pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(streamDoc, { 
      offer, 
      status: 'live', 
      hostId: userId, 
      title,
      createdAt: new Date().toISOString()
    });

    onSnapshot(streamDoc, (snapshot) => {
      const data = snapshot.data();
      if (!this.pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        this.pc.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          this.pc.addIceCandidate(candidate);
        }
      });
    });

    return streamDoc.id;
  }

  async stopStream(streamId) {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (streamId) {
      await updateDoc(doc(db, 'streams', streamId), { status: 'ended' });
    }
  }

  async getActiveStreams() {
    try {
      const q = query(
        collection(db, 'streams'), 
        where('status', '==', 'live')
      );
      const snapshot = await getDocs(q);
      const streams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Tri manuel par date décroissante
      return streams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error("Error getting streams:", err);
      const q = query(collection(db, 'streams'), where('status', '==', 'live'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  }
}

export const streamingService = new StreamingService();

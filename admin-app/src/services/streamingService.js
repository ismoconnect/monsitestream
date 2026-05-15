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

class WebMixer {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.ctx = this.canvas.getContext('2d');
    
    this.screenVideo = document.createElement('video');
    this.screenVideo.autoplay = true;
    this.screenVideo.muted = true;
    
    this.mediaVideo = document.createElement('video');
    this.mediaVideo.autoplay = false;
    this.mediaVideo.muted = true;
    this.mediaVideo.loop = true;
    this.mediaVideo.crossOrigin = "anonymous";
    this.mediaVideo.style.display = "none";
    document.body.appendChild(this.mediaVideo);
    
    this.logo = new Image();
    this.overlayText = "";
    this.layout = 'media_only'; 
    this.isMixing = false;
  }

  setLogo(url) {
    this.logo.src = url;
  }

  setOverlayText(text) {
    this.overlayText = text;
  }

  setLayout(layout) {
    this.layout = layout;
  }

  setMediaSource(url) {
    this.mediaVideo.src = url;
    this.mediaVideo.load();
  }

  setMediaPlaying(playing) {
    if (playing) {
      this.mediaVideo.play().catch(e => console.warn("Video play blocked:", e));
    } else {
      this.mediaVideo.pause();
    }
  }

  async start(screenStream = null) {
    if (screenStream) this.screenVideo.srcObject = screenStream;
    
    this.isMixing = true;
    this.render();
    
    return this.canvas.captureStream(30);
  }

  stop() {
    this.isMixing = false;
    if (this.screenVideo.srcObject) {
      this.screenVideo.srcObject.getTracks().forEach(t => t.stop());
      this.screenVideo.srcObject = null;
    }
    this.mediaVideo.pause();
    this.mediaVideo.src = "";
  }

  render() {
    if (!this.isMixing) return;

    const { ctx, canvas, screenVideo, mediaVideo, logo, overlayText, layout } = this;
    
    try {
      // Nettoyer le canvas avec un fond pro
      ctx.fillStyle = '#0f172a'; // Slate-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Background (Screen)
      if ((layout === 'screen_only' || layout === 'pip') && screenVideo.srcObject) {
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      }

      // Draw Media Video (Only if ready)
      if ((layout === 'media_only' || layout === 'media_pip') && mediaVideo.readyState >= 2) {
        ctx.drawImage(mediaVideo, 0, 0, canvas.width, canvas.height);
      }

      // Overlays
      if (logo.complete && logo.src) {
        ctx.globalAlpha = 0.8;
        ctx.drawImage(logo, 40, 40, 120, 40);
        ctx.globalAlpha = 1.0;
      }

      if (overlayText) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(overlayText.toUpperCase(), canvas.width / 2, canvas.height - 22);
      }
    } catch (err) {
      console.warn("Mixer render frame skip:", err);
    }

    requestAnimationFrame(() => this.render());
  }
}

class StreamingService {
  constructor() {
    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
    this.mixer = new WebMixer();
  }

  async initPreview() {
    if (!this.localStream) {
      this.localStream = await this.mixer.start();
    }
    return this.localStream;
  }

  async getDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        video: devices.filter(device => device.kind === 'videoinput'),
        audio: devices.filter(device => device.kind === 'audioinput')
      };
    } catch (err) {
      console.error("Enumerate devices error:", err);
      return { video: [], audio: [] };
    }
  }

  async joinStream(streamId, onRemoteStream) {
    this.pc = new RTCPeerConnection(servers);
    this.remoteStream = new MediaStream();

    this.pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
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

    this.pc.oniceconnectionstatechange = () => {
      if (this.pc?.iceConnectionState === 'connected') {
        iceCandidatesQueue.forEach(candidate => this.pc.addIceCandidate(candidate));
      }
    };

    return streamId;
  }

  async startStream(userId, title, onLocalStream, videoDeviceId = null, audioDeviceId = null) {
    // Nettoyage : Terminer les anciens lives de cet utilisateur avant d'en créer un nouveau
    try {
      const q = query(collection(db, 'streams'), where('hostId', '==', userId), where('status', '==', 'live'));
      const oldStreams = await getDocs(q);
      const batchPromises = oldStreams.docs.map(d => updateDoc(d.ref, { status: 'ended' }));
      await Promise.all(batchPromises);
    } catch (err) {
      console.warn("Cleanup old streams failed:", err);
    }

    const rawStream = await (async () => {
      try {
        if (!audioDeviceId) return null; // No audio requested
        const constraints = {
          video: false, // Force no camera
          audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true
        };
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn("Audio capture failed:", err);
        return null;
      }
    })();

    // Toujours recréer un flux propre pour le live
    this.localStream = await this.mixer.start();
    
    // Add audio tracks if available
    if (rawStream) {
      rawStream.getAudioTracks().forEach(track => this.localStream.addTrack(track));
    }

    this.remoteStream = new MediaStream();
    this.pc = new RTCPeerConnection(servers);

    this.localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, this.localStream);
    });

    if (onLocalStream) onLocalStream(this.localStream);

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
      createdAt: new Date().toISOString(),
      // Meta pour Sync Player (Alternative)
      mediaUrl: this.mixer.mediaVideo.src || null,
      isMediaPlaying: true,
      mediaStartTime: Date.now(),
      layout: this.mixer.layout
    });

    onSnapshot(streamDoc, (snapshot) => {
      if (!this.pc) return;
      const data = snapshot.data();
      if (!this.pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        this.pc.setRemoteDescription(answerDescription);
      }
    });

    const answerIceQueue = [];
    onSnapshot(answerCandidates, (snapshot) => {
      if (!this.pc) return;
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          if (this.pc.remoteDescription) {
            this.pc.addIceCandidate(candidate);
          } else {
            answerIceQueue.push(candidate);
          }
        }
      });
    });

    // On remote description set, flush queue
    const checkAndFlushQueue = setInterval(() => {
      if (this.pc?.remoteDescription && answerIceQueue.length > 0) {
        answerIceQueue.forEach(candidate => this.pc.addIceCandidate(candidate));
        answerIceQueue.length = 0;
        clearInterval(checkAndFlushQueue);
      }
    }, 500);

    return streamDoc.id;
  }

  async stopStream(streamId) {
    this.mixer.stop();
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (streamId) {
      try {
        await updateDoc(doc(db, 'streams', streamId), { status: 'ended' });
      } catch (e) {
        console.error("Error closing stream doc:", e);
      }
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
      return [];
    }
  }
}

export const streamingService = new StreamingService();

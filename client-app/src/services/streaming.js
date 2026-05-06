// WebRTC Streaming Service
import { io } from 'socket.io-client';

class StreamingService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.socket = null;
    this.roomId = null;
    this.isStreaming = false;
    this.isConnected = false;
    
    // ICE servers configuration
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ];

    // Event callbacks
    this.onLocalStream = null;
    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
    this.onError = null;
  }

  // Initialize the streaming service
  async initialize() {
    try {
      // Initialize socket connection
      this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
        transports: ['websocket'],
        upgrade: true
      });

      this.setupSocketListeners();
      
      // Initialize peer connection
      await this.initializePeerConnection();
      
      return true;
    } catch (error) {
      console.error('Error initializing streaming service:', error);
      this.handleError(error);
      return false;
    }
  }

  // Setup socket event listeners
  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      this.isConnected = false;
    });

    this.socket.on('room-joined', (data) => {
      console.log('Joined room:', data.roomId);
      this.roomId = data.roomId;
    });

    this.socket.on('user-joined', async (data) => {
      console.log('User joined:', data.userId);
      await this.createOffer();
    });

    this.socket.on('user-left', (data) => {
      console.log('User left:', data.userId);
      this.handleRemoteStreamEnd();
    });

    this.socket.on('offer', async (data) => {
      console.log('Received offer');
      await this.handleOffer(data.offer);
    });

    this.socket.on('answer', async (data) => {
      console.log('Received answer');
      await this.handleAnswer(data.answer);
    });

    this.socket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate');
      await this.handleIceCandidate(data.candidate);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.handleError(error);
    });
  }

  // Initialize peer connection
  async initializePeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers
      });

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.socket) {
          this.socket.emit('ice-candidate', {
            candidate: event.candidate,
            roomId: this.roomId
          });
        }
      };

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote stream');
        this.remoteStream = event.streams[0];
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection.connectionState);
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(this.peerConnection.connectionState);
        }
      };

      // Handle ICE connection state changes
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);
      };

    } catch (error) {
      console.error('Error initializing peer connection:', error);
      this.handleError(error);
    }
  }

  // Start local stream
  async startStream(constraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      this.isStreaming = true;
      
      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }

      return this.localStream;
    } catch (error) {
      console.error('Error starting stream:', error);
      this.handleError(error);
      throw error;
    }
  }

  // Stop local stream
  stopStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
    this.isStreaming = false;
  }

  // Join a room
  async joinRoom(roomId, userId) {
    try {
      if (!this.socket) {
        throw new Error('Socket not initialized');
      }

      this.roomId = roomId;
      this.socket.emit('join-room', { roomId, userId });
      
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      this.handleError(error);
      return false;
    }
  }

  // Leave current room
  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', { roomId: this.roomId });
    }
    this.roomId = null;
    this.stopStream();
  }

  // Create offer for peer connection
  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      if (this.socket) {
        this.socket.emit('offer', {
          offer: offer,
          roomId: this.roomId
        });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      this.handleError(error);
    }
  }

  // Handle incoming offer
  async handleOffer(offer) {
    try {
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      if (this.socket) {
        this.socket.emit('answer', {
          answer: answer,
          roomId: this.roomId
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
      this.handleError(error);
    }
  }

  // Handle incoming answer
  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
      this.handleError(error);
    }
  }

  // Handle incoming ICE candidate
  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      this.handleError(error);
    }
  }

  // Handle remote stream end
  handleRemoteStreamEnd() {
    this.remoteStream = null;
    if (this.onRemoteStream) {
      this.onRemoteStream(null);
    }
  }

  // Toggle camera
  toggleCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle microphone
  toggleMicrophone() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Switch camera (if multiple cameras available)
  async switchCamera() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length > 1) {
        const currentDeviceId = this.localStream.getVideoTracks()[0].getSettings().deviceId;
        const newDeviceId = videoDevices.find(device => device.deviceId !== currentDeviceId)?.deviceId;
        
        if (newDeviceId) {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: newDeviceId } },
            audio: true
          });
          
          // Replace video track
          const newVideoTrack = newStream.getVideoTracks()[0];
          const sender = this.peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
          
          // Update local stream
          this.localStream.removeTrack(this.localStream.getVideoTracks()[0]);
          this.localStream.addTrack(newVideoTrack);
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error switching camera:', error);
      this.handleError(error);
      return false;
    }
  }

  // Get connection statistics
  async getConnectionStats() {
    if (!this.peerConnection) return null;
    
    try {
      const stats = await this.peerConnection.getStats();
      const connectionStats = {};
      
      stats.forEach(report => {
        if (report.type === 'inbound-rtp' || report.type === 'outbound-rtp') {
          connectionStats[report.type] = {
            bytesReceived: report.bytesReceived,
            bytesSent: report.bytesSent,
            packetsLost: report.packetsLost,
            packetsReceived: report.packetsReceived,
            packetsSent: report.packetsSent,
            timestamp: report.timestamp
          };
        }
      });
      
      return connectionStats;
    } catch (error) {
      console.error('Error getting connection stats:', error);
      return null;
    }
  }

  // Handle errors
  handleError(error) {
    console.error('Streaming service error:', error);
    if (this.onError) {
      this.onError(error);
    }
  }

  // Cleanup resources
  cleanup() {
    this.leaveRoom();
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.stopStream();
    this.isConnected = false;
  }

  // Set event callbacks
  setOnLocalStream(callback) {
    this.onLocalStream = callback;
  }

  setOnRemoteStream(callback) {
    this.onRemoteStream = callback;
  }

  setOnConnectionStateChange(callback) {
    this.onConnectionStateChange = callback;
  }

  setOnError(callback) {
    this.onError = callback;
  }
}

// Create singleton instance
const streamingService = new StreamingService();
export default streamingService;

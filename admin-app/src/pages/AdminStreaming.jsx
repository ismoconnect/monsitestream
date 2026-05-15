import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Mic, 
  MicOff, 
  StopCircle, 
  Play, 
  Users, 
  MessageSquare,
  Send,
  Settings,
  X,
  Layout,
  Type,
  ImageIcon,
  AlertCircle,
  Zap,
  ShieldCheck,
  Activity,
  Maximize2
} from 'lucide-react';
import { streamingService } from '../services/streamingService';
import { galleryService } from '../services/galleryService';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const AdminStreaming = () => {
  const { currentUser } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [streamId, setStreamId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [streamTitle, setStreamTitle] = useState('Liliana Live Session');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Système', text: 'Mixeur Haute Couture initialisé. Prêt pour la diffusion.', type: 'system' }
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Mixer states
  const [layout, setLayout] = useState('media_only');
  const [overlayText, setOverlayText] = useState('LILIANA • EXCLUSIVE SESSION');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Device selection
  const [devices, setDevices] = useState({ audio: [] });
  const [selectedAudio, setSelectedAudio] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hwError, setHwError] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    loadDevices();
    loadMedia();
    startPreview();
  }, []);

  const startPreview = async () => {
    const stream = await streamingService.initPreview();
    setLocalStream(stream);
  };

  const loadMedia = async () => {
    try {
      const items = await galleryService.getGalleryItems();
      setMediaItems(items.filter(item => item.type === 'video'));
    } catch (err) {
      console.error("Load media error:", err);
    }
  };

  const loadDevices = async () => {
    setHwError(null);
    try {
      // Tenter d'obtenir l'autorisation sans bloquer si le matériel est occupé
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
        console.warn("Initial hardware access warning:", err.name);
        if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setHwError('Busy');
        } else {
          setHwError(err.name);
        }
        return null;
      });
      
      // Libérer immédiatement le flux temporaire
      if (tempStream) {
        tempStream.getTracks().forEach(t => t.stop());
      }

      const devList = await streamingService.getDevices();
      setDevices({ audio: devList.audio });
      if (devList.audio.length > 0) setSelectedAudio(devList.audio[0].deviceId);
      
      // Si on a réussi à lister les périphériques, on peut potentiellement ignorer l'erreur Busy pour le preview
      if (devList.audio.length > 0 && !hwError) setHwError(null);
    } catch (err) {
      console.error("Hardware error:", err);
      setHwError(err.name);
    }
  };

  useEffect(() => {
    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Mixer Sync
  useEffect(() => {
    streamingService.mixer.setOverlayText(overlayText);
  }, [overlayText]);

  useEffect(() => {
    streamingService.mixer.setLayout(layout);
  }, [layout]);

  const handleStartLive = async (forceNoHardware = false) => {
    try {
      setHwError(null);
      const id = await streamingService.startStream(
        currentUser.id || currentUser.uid, 
        streamTitle, 
        (stream) => setLocalStream(stream),
        null, // videoDeviceId (camera-free studio)
        forceNoHardware ? null : (selectedAudio || true) // audioDeviceId
      );
      setStreamId(id);
      setIsLive(true);
    } catch (error) {
      console.error('Start stream error:', error);
      setHwError(error.name);
    }
  };

  const handleStopLive = async () => {
    await streamingService.stopStream(streamId);
    setLocalStream(null);
    setIsLive(false);
    setStreamId(null);
    setIsScreenSharing(false);
  };

  const handleMediaToggle = async (playing) => {
    streamingService.mixer.setMediaPlaying(playing);
    setIsMediaPlaying(playing);
    
    // Sync avec Firestore si on est en live
    if (isLive && streamId) {
      try {
        await updateDoc(doc(db, 'streams', streamId), { 
          isMediaPlaying: playing,
          // On rafraîchit le point de départ pour la reprise
          mediaStartTime: Date.now() - (streamingService.mixer.mediaVideo.currentTime * 1000)
        });
      } catch (err) {
        console.error("Sync pause failed:", err);
      }
    }
  };

  const handleMediaSelect = (item) => {
    setSelectedMedia(item);
    streamingService.mixer.setMediaSource(item.url);
    handleMediaToggle(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      await galleryService.uploadMedia(file, {
        title: file.name,
        category: 'public'
      });
      await loadMedia();
    } catch (err) {
      alert("Erreur upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };



  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Background Decorative Gradients - Plus prononcés */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-pink-500/15 rounded-full blur-[140px]"></div>
        </div>

        {/* 💎 PREMIUM HEADER */}
        <header className="flex items-center justify-between px-6 py-3 backdrop-blur-xl bg-slate-900/60 border-b border-white/10 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase">Studio Haute Couture</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {isLive ? 'Session en cours de diffusion' : 'Prêt pour le direct'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isLive ? (
              <div className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-2xl border border-white/5">
                <input 
                  type="text" 
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold w-48 px-2"
                />
                <button 
                  onClick={() => setShowSettings(true)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                  <Settings size={18} />
                </button>
                <button 
                  onClick={() => handleStartLive(false)}
                  className="bg-white text-slate-950 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl flex items-center gap-2"
                >
                  <Play size={14} fill="currentColor" />
                  Démarrer
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
                  <Activity size={16} className="text-rose-500" />
                  <span className="text-xs font-black uppercase text-rose-500 tracking-tighter">Live 1080p • 60fps</span>
                </div>
                <button 
                  onClick={handleStopLive}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-2"
                >
                  <StopCircle size={14} fill="currentColor" />
                  Terminer
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-2 lg:p-4 flex flex-col lg:flex-row gap-4 overflow-hidden relative z-10">
          
          {/* 📺 VIDEO MASTER AREA */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border-2 border-white/5 group">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              />

              {/* Overlays UI on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                      <Maximize2 size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              {hwError && !isLive && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={40} className="text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-black uppercase mb-3">Matériel Occupé ou Indisponible</h2>
                  <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
                    Votre caméra ou votre micro est utilisé par une autre application (ex: Chrome, Skype, OBS) ou est désactivé. Veuillez libérer le matériel et rafraîchir la page.
                  </p>
                  <button 
                    onClick={() => handleStartLive(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                  >
                    Démarrer en Mode Mixeur Seul
                  </button>
                </div>
              )}
            </div>

            {/* 🎚️ MIXER CONSOLE */}
            <div className="bg-slate-800/40 backdrop-blur-2xl rounded-[24px] border border-white/10 p-4 flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Scènes & Régie</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signal crypté</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <SceneButton 
                  active={layout === 'media_only'} 
                  onClick={() => setLayout('media_only')}
                  icon={Play}
                  label="Diffusion Vidéo"
                  disabled={!selectedMedia}
                />
              </div>

              <div className="h-px bg-white/5"></div>

              {/* 📂 MÉDIAS SOURCE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sources Médias (Cloudinary)</label>
                  <label className="cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all">
                    {isUploading ? "Upload..." : "+ Ajouter Vidéo"}
                    <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                  </label>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {mediaItems.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => handleMediaSelect(item)}
                      className={`flex-shrink-0 w-24 aspect-video rounded-lg border-2 overflow-hidden transition-all relative ${
                        selectedMedia?.id === item.id ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-white/5 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={item.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                      {selectedMedia?.id === item.id && (
                        <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-indigo-600">
                            <Play size={12} fill="currentColor" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                  {mediaItems.length === 0 && (
                    <div className="text-[10px] text-slate-600 italic py-2">Aucune vidéo dans votre bibliothèque...</div>
                  )}
                </div>

                {selectedMedia && (
                  <div className="flex items-center justify-between bg-slate-950/30 p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{selectedMedia.title}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleMediaToggle(!isMediaPlaying)}
                        className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                          isMediaPlaying ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        }`}
                      >
                        {isMediaPlaying ? (
                          <>
                            <X size={12} />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play size={12} fill="currentColor" />
                            Lecture
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/5"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Overlay Texte (Live Ticker)</label>
                  <div className="relative">
                    <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      placeholder="Texte défilant..."
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Branding Studio</label>
                  <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 flex items-center justify-center gap-2 transition-all">
                    <ImageIcon size={20} className="text-slate-400" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Logo Haute Couture</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 💬 LIVE CHAT MODERATION */}
          <aside className="w-full lg:w-[400px] flex flex-col bg-slate-800/60 backdrop-blur-3xl rounded-[45px] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <MessageSquare size={18} className="text-indigo-400" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">Modération Live</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {chatMessages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id} 
                  className="group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      msg.type === 'system' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 bg-white/5'
                    }`}>
                      {msg.user}
                    </span>
                  </div>
                  <div className={`p-4 rounded-[24px] text-[12px] font-medium leading-relaxed ${
                    msg.type === 'system' ? 'bg-indigo-500/5 text-indigo-300 border border-indigo-500/10' : 'bg-white/5 text-white border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 bg-black/20">
              <div className="relative">
                <input 
                  type="text" 
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Envoyer un message..."
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </aside>

        </main>
      </div>

      {/* ⚙️ HARDWARE MODAL */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[40px] p-12 max-w-xl w-full shadow-3xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Configuration Régie</h2>
                <button onClick={() => setShowSettings(false)} className="p-3 hover:bg-white/5 rounded-full"><X /></button>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Source Audio (Micro)</label>
                  <select 
                    value={selectedAudio}
                    onChange={(e) => setSelectedAudio(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  >
                    {devices.audio.map(dev => <option key={dev.deviceId} value={dev.deviceId}>{dev.label || 'Micro'}</option>)}
                  </select>
                </div>
              </div>
              
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest mt-12 hover:bg-indigo-50 transition-all"
              >
                Valider la Configuration
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SceneButton = ({ active, onClick, icon: Icon, label, disabled, highlight }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center gap-1 p-2 rounded-[20px] border-2 transition-all relative overflow-hidden group ${
      active 
        ? 'border-indigo-500 bg-indigo-500/10 text-white' 
        : highlight 
          ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
          : 'border-white/5 bg-slate-950/30 text-slate-500 hover:border-white/10'
    } disabled:opacity-20`}
  >
    {active && (
      <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none"></div>
    )}
    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default AdminStreaming;

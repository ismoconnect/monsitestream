import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Play,
  Clock,
  Users,
  Lock,
  Crown,
  Calendar,
  Star,
  Heart,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Eye,
  Euro,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Gift,
  Share2,
  Maximize,
  Settings,
  MoreVertical,
  Wifi,
  Volume2,
  VolumeX,
  Send
} from 'lucide-react';
import { streamingService } from '../../../services/streamingService';
import { db } from '../../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ClientStreamingSectionSimple = ({ currentUser }) => {
  const [isInStream, setIsInStream] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const [activeStreams, setActiveStreams] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showHearts, setShowHearts] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'System', text: 'Bienvenue dans la session live !', type: 'system' },
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const videoRef = useRef(null);

  const isPremium = currentUser?.subscription?.status === 'active' &&
    (currentUser?.subscription?.type === 'premium' || currentUser?.subscription?.type === 'vip');

  // Fetch real active streams from Firestore
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const streams = await streamingService.getActiveStreams();
        setActiveStreams(streams);
      } catch (err) {
        console.error("Error fetching streams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
    // Refresh every 30s
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinStream = async (session) => {
    setCurrentStream(session);
    setIsInStream(true);
    
    // WebRTC Join
    try {
      // Si une URL média est présente, on privilégie le mode Sync Player (Alternative stable)
      if (session.mediaUrl) {
        console.log("Using Sync Player mode...");
        if (videoRef.current) videoRef.current.srcObject = null;
        return; 
      }

      // Sinon, on tente le WebRTC classique
      await streamingService.joinStream(session.id, (remoteStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = remoteStream;
          videoRef.current.play().catch(err => console.warn("Autoplay interaction required", err));
        }
      });
      // Écouter les changements en temps réel (Pause/Play/Sync)
      onSnapshot(doc(db, 'streams', session.id), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setCurrentStream(prev => ({ ...prev, ...data }));
        }
      });
    } catch (err) {
      console.error("Failed to join stream:", err);
    }
  };

  const handleSendHeart = () => {
    const id = Date.now();
    setShowHearts(prev => [...prev, id]);
    setTimeout(() => {
      setShowHearts(prev => prev.filter(h => h !== id));
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages([...chatMessages, { id: Date.now(), user: 'Moi', text: newMsg, type: 'user' }]);
    setNewMsg('');
  };

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-[30px] flex items-center justify-center mb-8 relative">
          <Lock size={40} className="text-slate-400" />
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center border-4 border-white">
            <Crown size={20} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Accès Restreint</h2>
        <p className="text-slate-500 font-medium max-w-md mb-8">
          Le streaming interactif est une exclusivité **Premium**. Améliorez votre compte pour accéder aux sessions privées et aux salons VIP.
        </p>
        <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
          Devenir Premium
        </button>
      </div>
    );
  }

  // Sync Pause/Play from Admin
  useEffect(() => {
    if (!videoRef.current || !currentStream) return;
    
    if (currentStream.isMediaPlaying === false) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [currentStream?.isMediaPlaying]);

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {!isInStream ? (
        <>
          {/* 📽️ Stream Lobby Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <Video size={20} className="text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Live Stream</h2>
              </div>
              <p className="text-slate-500 font-medium">Découvrez les sessions en direct et à venir.</p>
            </div>
            
            <div className="flex gap-2">
              {['all', 'live'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedFilter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all' ? 'Tous' : 'En Direct'}
                </button>
              ))}
            </div>
          </div>

          {/* 📱 Stream Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[35px]"></div>)}
            </div>
          ) : activeStreams.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <Eye size={40} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Aucun live pour le moment</h3>
              <p className="text-xs text-slate-400 mt-2">Revenez plus tard pour les prochaines sessions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeStreams.map((session) => (
                <motion.div
                  key={session.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-[35px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col group"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    
                    <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      En Direct
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div>
                        <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/20">
                          {session.type || 'LIVE'}
                        </span>
                        <h3 className="text-white font-bold mt-1 line-clamp-1">{session.title}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>Lancé il y a peu</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>Illimité</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleJoinStream(session)}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Play size={14} fill="currentColor" />
                      Rejoindre le Live
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* 🎬 FULL INDEPENDENT LIVE INTERFACE */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 bg-slate-950 rounded-[40px] overflow-hidden p-4 lg:p-6 shadow-2xl relative"
        >
          {/* Main Player Area */}
          <div className="flex-1 relative bg-black rounded-[30px] overflow-hidden group shadow-inner">
            
            {/* REAL VIDEO ELEMENT */}
            <video 
              ref={videoRef} 
              autoPlay 
              loop
              muted={isMuted}
              playsInline 
              src={currentStream?.mediaUrl}
              className="w-full h-full object-cover"
              onLoadedMetadata={(e) => {
                if (currentStream?.mediaStartTime) {
                  const duration = e.target.duration;
                  const totalOffset = (Date.now() - currentStream.mediaStartTime) / 1000;
                  // Si boucle, on calcule la position relative dans la durée
                  const syncOffset = totalOffset % duration;
                  if (syncOffset > 0) e.target.currentTime = syncOffset;
                }
              }}
            />
            
            {!currentStream?.mediaUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-white/20 pointer-events-none">
                <div className="text-center">
                  <Wifi size={60} className="mx-auto mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Flux WebRTC sécurisé</p>
                </div>
              </div>
            )}

            {/* Custom Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Top Controls */}
              <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    Live
                  </div>
                  <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
                    {currentStream.title}
                  </div>
                </div>
                <button 
                  onClick={() => setIsInStream(false)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <button 
                    className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all"
                  >
                    <Settings size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSendHeart}
                    className="w-14 h-14 bg-pink-500 hover:bg-pink-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-500/20 transition-all active:scale-90"
                  >
                    <Heart size={24} fill="currentColor" />
                  </button>
                  <button className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex items-center justify-center text-white transition-all">
                    <Gift size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Rising Hearts Animation */}
            <div className="absolute bottom-24 right-10 pointer-events-none">
              <AnimatePresence>
                {showHearts.map((h) => (
                  <motion.div
                    key={h}
                    initial={{ y: 0, opacity: 1, scale: 0.5, x: 0 }}
                    animate={{ y: -200, opacity: 0, scale: 1.5, x: (Math.random() - 0.5) * 50 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-pink-500"
                  >
                    <Heart size={32} fill="currentColor" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Independent Custom Chat Panel */}
          <div className="w-full lg:w-96 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle size={18} className="text-indigo-400" />
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Chat Privé</h4>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-300 uppercase">
                <Eye size={12} />
                <span>Interactif</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {chatMessages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id} 
                  className={`flex flex-col ${msg.user === 'Moi' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{msg.user}</span>
                  <div className={`px-4 py-2 rounded-2xl text-[11px] font-medium max-w-[80%] ${
                    msg.type === 'system' ? 'bg-indigo-500/20 text-indigo-200 italic' :
                    msg.user === 'Moi' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/10">
              <div className="relative">
                <input 
                  type="text" 
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Écrire un message..."
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-[11px] text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ClientStreamingSectionSimple;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { simpleChatService } from '../../../services/simpleChat';
import { presenceService } from '../../../services/presenceService';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Heart,
  Video,
  Phone,
  Mic,
  Image,
  Crown,
  Smile,
  Paperclip,
  Plus,
  CheckCircle2
} from 'lucide-react';

const ClientMessagesSectionReal = ({ currentUser }) => {
  const navigate = useNavigate();
  // États pour la discussion avec Liliana
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState('');
  const [adminPresence, setAdminPresence] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  const sub = currentUser?.subscription;
  const currentPlan = (sub?.plan || sub?.type || sub?.planName || 'basic').toLowerCase();
  const subStatus = sub?.status;

  const isPremium = subStatus === 'active' && (currentPlan.includes('premium') || currentPlan.includes('vip'));
  const isVIP = subStatus === 'active' && currentPlan.includes('vip');

  const [requiredPlan, setRequiredPlan] = useState('Premium');

  // Gérer les fonctionnalités premium/VIP
  const handleFeatureAccess = (featureName, requiredLevel = 'premium') => {
    const hasAccess = requiredLevel === 'vip' ? isVIP : isPremium;

    if (!hasAccess) {
      setPremiumFeatureName(featureName);
      setRequiredPlan(requiredLevel === 'vip' ? 'VIP Elite' : 'Premium');
      setShowPremiumModal(true);
      return false;
    }
    return true;
  };

  // Auto-scroll vers le bas
  const scrollToBottom = (immediate = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: immediate ? 'instant' : 'smooth'
    });
  };

  // Scroll immédiatement vers le dernier message quand on ouvre la conversation
  useEffect(() => {
    if (messages.length > 0) {
      // Premier chargement : scroll immédiat
      const isFirstLoad = messages.length > 1;
      scrollToBottom(isFirstLoad);
    }
  }, [messages]);

  // Scroll immédiat lors de l'initialisation de la conversation
  useEffect(() => {
    if (conversationId && !isInitializing) {
      // Petit délai pour s'assurer que les messages sont chargés
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [conversationId, isInitializing]);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.options-menu') && !event.target.closest('.plus-button')) {
        setShowOptions(false);
      }
      if (!event.target.closest('.stickers-panel') && !event.target.closest('.stickers-button')) {
        setShowStickers(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Démarrer la présence client
  useEffect(() => {
    const userId = currentUser?.uid || currentUser?.id;
    if (userId) {
      presenceService.startPresence(userId, 'client');

      return () => {
        presenceService.stopPresence(userId);
      };
    }
  }, [currentUser]);

  // Écouter le statut de l'admin
  useEffect(() => {
    const unsubscribe = presenceService.listenToPresence('admin', (presence) => {
      setAdminPresence(presence);
    });

    return unsubscribe;
  }, []);

  // Initialiser la conversation
  useEffect(() => {
    const initializeChat = async () => {
      // Utiliser id ou uid selon ce qui est disponible
      const userId = currentUser?.uid || currentUser?.id;

      if (!currentUser || !userId) {
        console.log('Utilisateur non connecté ou ID manquant:', currentUser);
        setIsInitializing(false);
        return;
      }

      try {
        setIsInitializing(true);
        console.log('Initialisation du chat pour:', userId);
        const convId = await simpleChatService.getOrCreateConversation(
          userId,
          currentUser.displayName || currentUser.email || currentUser.profile?.name || 'Utilisateur'
        );
        setConversationId(convId);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du chat:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [currentUser]);

  // Écouter les messages
  useEffect(() => {
    const userId = currentUser?.uid || currentUser?.id;
    if (!conversationId || !userId) return;

    const unsubscribe = simpleChatService.listenToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
      // Marquer les messages comme lus
      if (userId) {
        simpleChatService.markMessagesAsRead(conversationId, userId);
      }
    });

    return unsubscribe;
  }, [conversationId, currentUser]);

  // Écouter les indicateurs de frappe
  useEffect(() => {
    const userId = currentUser?.uid || currentUser?.id;
    if (!conversationId || !userId) return;

    const unsubscribe = simpleChatService.listenToTyping(conversationId, userId, (typing) => {
      setTypingUsers(typing);
    });

    return unsubscribe;
  }, [conversationId, currentUser]);

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userId = currentUser?.uid || currentUser?.id;
    if (!newMessage.trim() || isLoading || !conversationId || !userId) return;

    setIsLoading(true);
    const messageToSend = newMessage.trim();
    setNewMessage(''); // Effacer immédiatement pour une meilleure UX

    // Arrêter l'indicateur de frappe
    await simpleChatService.setTyping(conversationId, userId, false);

    try {
      await simpleChatService.sendMessage(conversationId, userId, messageToSend);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setNewMessage(messageToSend); // Restaurer le message en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaires pour les fonctionnalités premium
  const handleVideoCall = () => {
    if (handleFeatureAccess('Appel vidéo', 'vip')) {
      // Logique d'appel vidéo ici
      console.log('Lancement appel vidéo avec Liliana');
    }
  };

  const handleAudioCall = () => {
    if (handleFeatureAccess('Appel audio', 'vip')) {
      // Logique d'appel audio ici
      console.log('Lancement appel audio avec Liliana');
    }
  };

  const handleVoiceNote = () => {
    if (handleFeatureAccess('Note vocale', 'vip')) {
      // Logique d'enregistrement vocal ici
      console.log('Enregistrement note vocale');
    }
  };

  const handleImageUpload = () => {
    if (handleFeatureAccess('Envoi d\'image', 'premium')) {
      setShowOptions(false);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log('Image sélectionnée:', file.name);
          // Logique d'envoi d'image ici
        }
      };
      input.click();
    }
  };

  const handleFileUpload = () => {
    if (handleFeatureAccess('Envoi de fichier', 'premium')) {
      setShowOptions(false);
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log('Fichier sélectionné:', file.name);
          // Logique d'envoi de fichier ici
        }
      };
      input.click();
    }
  };

  const handleStickers = () => {
    setShowOptions(false);
    setShowStickers(!showStickers);
  };

  const handleStickerSelect = (sticker) => {
    // Ajouter le sticker au message (accessible à tous)
    setNewMessage(prev => prev + sticker);
    setShowStickers(false);
  };

  // Liste des stickers disponibles
  const stickers = [
    '😍', '🥰', '😘', '💋', '❤️', '💕', '💖', '💗', '💓', '💝',
    '🔥', '✨', '⭐', '💫', '🌹', '🌺', '🦋', '💎', '👑', '🍾',
    '🥂', '🍓', '🍒', '🍑', '🍯', '🧁', '🍰', '🎂', '🎉', '🎊'
  ];

  // Formater l'heure
  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const userId = currentUser?.uid || currentUser?.id;

  if (!currentUser || !userId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connexion requise</h3>
          <p className="text-gray-500">Vous devez être connecté pour accéder à la messagerie.</p>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Initialisation du chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-[calc(100vh-80px)] overflow-hidden sm:p-4 lg:p-6 flex flex-col">
      {/* Bloc de Chat Principal - Mobile Independent Absolute Layout */}
      {/* Bloc de Chat Principal - Mobile Fixed / Desktop Flex */}
      <div className="fixed top-[65px] left-0 right-0 bottom-0 z-0 bg-[#fafafa] lg:relative lg:flex lg:flex-col lg:w-full lg:h-full lg:max-w-[480px] lg:ml-auto lg:mr-0 lg:rounded-3xl lg:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.15)] lg:border lg:border-gray-100/80 overflow-hidden transition-all duration-300 flex flex-col">

        {/* Pro Header - Rectangular & Sharp */}
        <div className="flex-shrink-0 h-[110px] z-10 bg-gradient-to-r from-[#1e1b4b] via-[#4338ca] to-[#701a75] p-6 flex items-center justify-between border-b border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle light effect for pro feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center space-x-5 relative z-10">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 shadow-2xl">
                <span className="text-3xl font-black tracking-tighter opacity-90">L</span>
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-md bg-green-500 border-2 border-[#312e81] shadow-sm"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none mb-1.5 drop-shadow-md">Liliana</h3>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-300/60 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100/70">
                  {adminPresence.isOnline ? 'Active Maintenant' : 'Hors ligne • 7h'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-white/90 relative z-10">
            {[
              { icon: Video, action: handleVideoCall, vip: true },
              { icon: Phone, action: handleAudioCall, vip: true },
              { icon: Heart, action: null, vip: false }
            ].map((btn, i) => (
              <motion.button
                key={i}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)', y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={btn.action}
                className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-all relative"
              >
                <btn.icon size={20} className="stroke-[2]" />
                {btn.vip && <Crown size={8} className="absolute top-1.5 right-1.5 text-yellow-300 fill-yellow-300" />}
              </motion.button>
            ))}
          </div>
        </div>


        {/* Messages - Flex Grow with Scroll */}
        <div className="flex-1 overflow-y-auto bg-[#fcfaff] px-4 sm:px-8 py-4 sm:py-8 space-y-6 scrollbar-hide font-sans overscroll-contain z-0 relative">
          {/* Subtle Decorative Elements for "Life" */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[100px]" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[100px]" />
          </div>
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const mUserId = currentUser?.uid || currentUser?.id;
              const isOwn = message.senderId === mUserId;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${isOwn ? 'ml-12' : 'mr-12'}`}>
                    <div className={`
                      px-6 py-4 relative group rounded-2xl
                      ${isOwn
                        ? 'bg-gradient-to-br from-[#4338ca] via-[#6366f1] to-[#a855f7] text-white font-bold rounded-tr-sm'
                        : 'bg-gradient-to-br from-indigo-200/70 via-white to-purple-300/60 backdrop-blur-sm text-gray-800 border border-indigo-300/30 rounded-tl-sm'
                      }
                    `}>
                      <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed tracking-wide">{message.content}</p>
                    </div>
                    <div className={`flex mt-2.5 px-1 items-center space-x-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                        {formatTime(message.timestamp)}
                      </span>
                      {isOwn && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 opacity-60" />}
                    </div>
                  </div>
                </motion.div>

              );
            })}
          </AnimatePresence>

          {/* Indicateur de frappe Minimal */}
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start px-2"
              >
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest">Liliana est en train d'écrire...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Pro Input Area */}
        <div className="flex-shrink-0 z-20 bg-white/80 backdrop-blur-md p-5 border-t border-indigo-50 shadow-[0_-15px_50px_rgba(0,0,0,0.03)]">
          <div className="flex items-center space-x-4 max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center bg-[#fcfcfc] border border-gray-100 rounded-2xl group focus-within:border-indigo-200 transition-all overflow-hidden">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="w-14 h-14 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:bg-indigo-50/50 border-r border-gray-50 transition-colors"
              >
                <Plus size={20} className="stroke-[3]" />
              </button>

              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  const uId = currentUser?.uid || currentUser?.id;
                  if (conversationId && uId) {
                    simpleChatService.setTyping(conversationId, uId, true);
                    if (typingTimeout) clearTimeout(typingTimeout);
                    const timeout = setTimeout(() => {
                      simpleChatService.setTyping(conversationId, uId, false);
                    }, 3000);
                    setTypingTimeout(timeout);
                  }
                }}
                placeholder="Message à Liliana..."
                className="flex-1 bg-transparent border-none px-5 py-4 focus:ring-0 resize-none text-[14px] font-bold text-gray-800 placeholder-gray-400 min-h-[56px] max-h-[150px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />

              <button
                type="button"
                onClick={handleStickers}
                className="px-4 text-gray-300 hover:text-indigo-500 transition-colors"
              >
                <Smile size={22} />
              </button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={!newMessage.trim() || isLoading}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white disabled:opacity-20 flex items-center justify-center transition-all m-1 shadow-lg shadow-indigo-100"
              >
                <Send size={20} className="fill-white" />
              </motion.button>
            </form>
          </div>
        </div>


          {/* Panels d'options */}
          <AnimatePresence>
            {showStickers && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-32 left-4 right-4 bg-white/95 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-gray-100 z-50"
              >
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-3 max-h-48 overflow-y-auto">
                  {stickers.map((s, i) => (
                    <button key={i} onClick={() => handleStickerSelect(s)} className="text-3xl hover:scale-125 transition-transform">{s}</button>
                  ))}
                </div>
              </motion.div>
            )}
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-32 left-6 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-2 min-w-[240px] z-50 flex flex-col"
              >
                <button onClick={handleImageUpload} className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left group">
                  <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors relative">
                    <Image className="w-5 h-5" />
                    {!isPremium && <Crown className="w-2.5 h-2.5 absolute -top-1 -right-1 text-yellow-500" />}
                  </div>
                  <span className="text-sm font-bold text-gray-700">Envoyer une image</span>
                </button>
                <button onClick={handleFileUpload} className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left group">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors relative">
                    <Paperclip className="w-5 h-5" />
                    {!isPremium && <Crown className="w-2.5 h-2.5 absolute -top-1 -right-1 text-yellow-500" />}
                  </div>
                  <span className="text-sm font-bold text-gray-700">Envoyer un fichier</span>
                </button>
                <button onClick={handleVoiceNote} className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left group">
                  <div className="p-2 bg-purple-50 text-purple-500 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors relative">
                    <Mic className="w-5 h-5" />
                    {!isVIP && <Crown className="w-2.5 h-2.5 absolute -top-1 -right-1 text-yellow-500" />}
                  </div>
                  <span className="text-sm font-bold text-gray-700 flex-1">Note vocale</span>
                  {!isVIP && <span className="text-[10px] font-bold text-purple-400 bg-purple-50 px-2 py-0.5 rounded-full">VIP</span>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Premium */}
        <AnimatePresence>
          {showPremiumModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
              onClick={(e) => e.target === e.currentTarget && setShowPremiumModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="bg-gradient-to-br from-indigo-500 to-purple-700 text-white p-8 text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 rotate-3">
                    <Crown className="h-10 w-10 text-yellow-300" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">{requiredPlan === 'VIP Elite' ? 'VIP Elite' : 'Expérience Premium'}</h2>
                  <p className="text-indigo-100 font-medium">Accès Privilégié</p>
                </div>

                <div className="p-8">
                  <div className="bg-indigo-50 rounded-2xl p-4 mb-8 border border-indigo-100 italic text-center">
                    <p className="text-indigo-700 font-bold text-sm">
                      "La fonction {premiumFeatureName} est réservée à mes membres {requiredPlan === 'VIP Elite' ? 'VIP Elite' : 'Premium'}."
                    </p>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowPremiumModal(false);
                        navigate('/dashboard/payment', { state: { from: premiumFeatureName } });
                      }}
                      className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl shadow-indigo-100 font-black text-sm"
                    >
                      DÉCOUVRIR LES PLANS
                    </motion.button>
                    <button onClick={() => setShowPremiumModal(false)} className="w-full py-3 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600">
                      Plus tard
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};

export default ClientMessagesSectionReal;

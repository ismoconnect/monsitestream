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

  // Vérifier si l'utilisateur est premium ou VIP
  const isPremiumUser = () => {
    const userPlan = currentUser?.subscription?.plan || currentUser?.plan;
    return userPlan === 'premium' || userPlan === 'vip';
  };

  // Gérer les fonctionnalités premium
  const handlePremiumFeature = (featureName) => {
    if (!isPremiumUser()) {
      setPremiumFeatureName(featureName);
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
    if (handlePremiumFeature('Appel vidéo')) {
      // Logique d'appel vidéo ici
      console.log('Lancement appel vidéo avec Liliana');
    }
  };

  const handleAudioCall = () => {
    if (handlePremiumFeature('Appel audio')) {
      // Logique d'appel audio ici
      console.log('Lancement appel audio avec Liliana');
    }
  };

  const handleVoiceNote = () => {
    if (handlePremiumFeature('Note vocale')) {
      // Logique d'enregistrement vocal ici
      console.log('Enregistrement note vocale');
    }
  };

  const handleImageUpload = () => {
    if (handlePremiumFeature('Envoi d\'image')) {
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
    <div className="flex-1 flex flex-col w-full h-full sm:p-4 lg:p-6">
      {/* Bloc de Chat Principal - Mobile Fullscreen Fixed */}
      <div className="fixed inset-x-0 bottom-0 top-[56px] z-40 bg-white flex flex-col sm:static sm:z-auto sm:inset-auto sm:h-[555px] sm:max-w-5xl sm:mx-auto sm:rounded-[3rem] sm:shadow-[0_20px_70px_-10px_rgba(0,0,0,0.05)] sm:border sm:border-gray-100/80 overflow-hidden transition-all duration-300">

        {/* Header - Rose Officiel Liliana */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 sm:p-5 flex-shrink-0 flex items-center justify-between z-20 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30">
                <span className="text-xl font-bold tracking-tight">L</span>
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${adminPresence.isOnline ? 'bg-green-400' : 'bg-gray-300'}`}></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight leading-none mb-1">Liliana</h3>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-100/80">
                  {presenceService.getStatusText(adminPresence)}
                </span>
                {adminPresence.isOnline && <span className="flex h-1.5 w-1.5 rounded-full bg-green-400"></span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 text-white">
            {[
              { icon: Video, action: handleVideoCall, premium: true },
              { icon: Phone, action: handleAudioCall, premium: true }
            ].map((item, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={item.action}
                className="p-3 hover:text-white rounded-xl transition-all relative"
              >
                <item.icon className="w-5 h-5 stroke-[2]" />
                {!isPremiumUser() && <Crown className="w-3 h-3 absolute top-1 right-1 text-yellow-300" />}
              </motion.button>
            ))}
            <button className="p-3 opacity-50 hover:opacity-100 transition-opacity">
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Zone des messages - Blanc Pur Clean */}
        <div className="flex-1 overflow-y-auto bg-white px-4 sm:px-8 py-8 space-y-6 scrollbar-hide font-sans">
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const mUserId = currentUser?.uid || currentUser?.id;
              const isOwn = message.senderId === mUserId;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[70%] ${isOwn ? 'ml-10' : ''}`}>
                    <div className={`
                      px-5 py-3 rounded-[1.4rem] text-[15px] leading-snug shadow-sm
                      ${isOwn
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-tr-none font-medium'
                        : 'bg-gray-50 text-gray-700 rounded-tl-none border border-gray-100'
                      }
                    `}>
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <div className={`flex mt-2 px-1 items-center space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {formatTime(message.timestamp)}
                      </span>
                      {isOwn && <CheckCircle2 className="w-3 h-3 text-pink-200" />}
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

        {/* Barre de saisie - Accents Roses */}
        <div className="bg-white p-4 sm:p-6 border-t border-gray-50 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3 max-w-5xl mx-auto">
            <button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowOptions(!showOptions)}
              className="p-3 text-pink-500 bg-pink-50/50 rounded-xl transition-all hover:bg-pink-100/50"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex-1 relative">
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
                placeholder="Écrivez votre message..."
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 pr-10 focus:ring-2 focus:ring-pink-100 transition-all resize-none text-[13px] sm:text-[14px] font-medium text-gray-700 placeholder-gray-500"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-pink-400 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px -5px rgba(236,72,153,0.3)' }}
              whileTap={{ scale: 0.95 }}
              disabled={!newMessage.trim() || isLoading}
              className="h-12 w-12 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-xl shadow-lg shadow-pink-100 disabled:opacity-30 disabled:shadow-none flex items-center justify-center flex-shrink-0 transition-all"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </form>

          {/* Panels d'options */}
          <AnimatePresence>
            {showStickers && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-28 left-4 right-4 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-gray-100 z-50"
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
                className="absolute bottom-28 left-6 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 min-w-[240px] z-50 flex flex-col"
              >
                <button onClick={handleImageUpload} className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left group">
                  <div className="p-2 bg-pink-50 text-pink-500 rounded-xl group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <Image className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Envoyer une image</span>
                </button>
                <button onClick={handleVoiceNote} className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left group">
                  <div className="p-2 bg-purple-50 text-purple-500 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Note vocale</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
              <div className="bg-gradient-to-br from-pink-500 to-purple-700 text-white p-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 rotate-3">
                  <Crown className="h-10 w-10 text-yellow-300" />
                </div>
                <h2 className="text-2xl font-black mb-2">Expérience Premium</h2>
                <p className="text-pink-100 font-medium">Libérez tout le potentiel</p>
              </div>

              <div className="p-8">
                <div className="bg-pink-50 rounded-2xl p-4 mb-8 border border-pink-100 italic text-center">
                  <p className="text-pink-700 font-bold text-sm">
                    "La fonction {premiumFeatureName} est réservée à mes membres privilégiés."
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
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl shadow-xl shadow-pink-100 font-black text-sm"
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

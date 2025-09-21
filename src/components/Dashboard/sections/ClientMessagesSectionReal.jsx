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
  Plus
} from 'lucide-react';

const ClientMessagesSectionReal = ({ currentUser }) => {
  const navigate = useNavigate();
  // États pour la discussion avec Sophie
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
      console.log('Lancement appel vidéo avec Sophie');
    }
  };

  const handleAudioCall = () => {
    if (handlePremiumFeature('Appel audio')) {
      // Logique d'appel audio ici
      console.log('Lancement appel audio avec Sophie');
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
    <div className="relative h-full min-h-[540px] lg:h-[615px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* En-tête de discussion - Sophie */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 sm:p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          {/* Avatar de Sophie */}
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold">S</span>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Sophie</h1>
            <div className="text-pink-100 text-sm flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                adminPresence.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span>
                Accompagnatrice de luxe • {presenceService.getStatusText(adminPresence)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Boutons d'actions premium */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleVideoCall}
              className={`p-2 rounded-full transition-colors ${
                isPremiumUser() 
                  ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                  : 'bg-white bg-opacity-10 opacity-60'
              }`}
              title={isPremiumUser() ? 'Appel vidéo' : 'Appel vidéo (Premium/VIP uniquement)'}
            >
              <Video className="h-4 w-4" />
              {!isPremiumUser() && <Crown className="h-2 w-2 absolute -top-1 -right-1" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAudioCall}
              className={`p-2 rounded-full transition-colors ${
                isPremiumUser() 
                  ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                  : 'bg-white bg-opacity-10 opacity-60'
              }`}
              title={isPremiumUser() ? 'Appel audio' : 'Appel audio (Premium/VIP uniquement)'}
            >
              <Phone className="h-4 w-4" />
              {!isPremiumUser() && <Crown className="h-2 w-2 absolute -top-1 -right-1" />}
            </motion.button>

            <div className="text-pink-100">
              <Heart className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Zone des messages - scrollable avec padding bottom pour la zone de saisie */}
      <div className="absolute top-[88px] sm:top-[96px] bottom-[76px] sm:bottom-[88px] left-0 right-0 overflow-y-auto bg-gray-50 p-2 sm:p-4 pb-6">
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {messages.map((message) => {
              const messageUserId = currentUser?.uid || currentUser?.id;
              const isOwn = message.senderId === messageUserId;
              const isAdmin = message.senderId === 'admin';
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md xl:max-w-lg`}>
                    {/* Avatar et nom pour Sophie */}
                    {!isOwn && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">S</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                          Sophie
                        </p>
                      </div>
                    )}
                    
                    {/* Bulle de message */}
                    <div
                      className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm ${
                        isOwn
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
                        {message.content}
                      </p>
                    </div>
                    
                    {/* Heure */}
                    <div className={`flex mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-500 px-2">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Indicateur de frappe */}
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start mb-4"
              >
                <div className="max-w-[85%] sm:max-w-xs lg:max-w-md xl:max-w-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">S</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Sophie
                    </p>
                  </div>
                  
                  <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-md px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">en train d'écrire</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Zone de saisie - FIXE en bas */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        {/* Panel des stickers */}
        <AnimatePresence>
          {showStickers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="stickers-panel border-b border-gray-200 p-2 sm:p-3 bg-gray-50"
            >
              <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 gap-1 sm:gap-2 max-h-32 overflow-y-auto">
                {stickers.map((sticker, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleStickerSelect(sticker)}
                    className="text-lg sm:text-xl lg:text-2xl p-1 sm:p-1.5 rounded-lg hover:bg-white transition-colors flex items-center justify-center aspect-square"
                  >
                    {sticker}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barre de saisie principale */}
        <div className="p-2 sm:p-3">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
            {/* Bouton plus pour les options */}
            <div className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowOptions(!showOptions)}
                className="plus-button p-2 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
              >
                <Plus className="h-4 w-4" />
              </motion.button>

              {/* Menu des options */}
              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="options-menu absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px] z-10"
                  >
                    <motion.button
                      type="button"
                      whileHover={{ backgroundColor: '#fdf2f8' }}
                      onClick={handleImageUpload}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors text-left ${
                        isPremiumUser() ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      <div className="relative">
                        <Image className="h-4 w-4" />
                        {!isPremiumUser() && (
                          <Crown className="h-2 w-2 absolute -top-1 -right-1 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-sm">Envoyer une image</span>
                      {!isPremiumUser() && <span className="text-xs text-yellow-600 ml-auto">Premium</span>}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ backgroundColor: '#fdf2f8' }}
                      onClick={handleVoiceNote}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors text-left ${
                        isPremiumUser() ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      <div className="relative">
                        <Mic className="h-4 w-4" />
                        {!isPremiumUser() && (
                          <Crown className="h-2 w-2 absolute -top-1 -right-1 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-sm">Note vocale</span>
                      {!isPremiumUser() && <span className="text-xs text-yellow-600 ml-auto">Premium</span>}
                    </motion.button>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  // Auto-resize du textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  
                  // Gestion de l'indicateur de frappe
                  const userId = currentUser?.uid || currentUser?.id;
                  if (conversationId && userId) {
                    // Indiquer qu'on tape
                    simpleChatService.setTyping(conversationId, userId, true);
                    
                    // Arrêter l'indicateur après 3 secondes d'inactivité
                    if (typingTimeout) {
                      clearTimeout(typingTimeout);
                    }
                    
                    const timeout = setTimeout(() => {
                      simpleChatService.setTyping(conversationId, userId, false);
                    }, 3000);
                    
                    setTypingTimeout(timeout);
                  }
                }}
                placeholder="Écrivez votre message à Sophie..."
                className="w-full px-3 py-2 pr-10 sm:px-4 sm:py-3 sm:pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none bg-gray-50 hover:bg-white focus:bg-white transition-all duration-200 text-sm sm:text-base"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '100px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              
              {/* Bouton stickers dans le textarea */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleStickers}
                className="stickers-button absolute right-2 top-2 sm:top-3 p-1 text-gray-500 hover:text-pink-500 transition-colors flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7"
                title="Choisir un sticker"
              >
                <Smile className="h-4 w-4" />
              </motion.button>
            </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </motion.button>
          </form>
        </div>
      </div>

      {/* Modal Premium */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowPremiumModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header avec gradient */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Fonctionnalité Premium</h2>
                <p className="text-pink-100 text-sm">Accès exclusif requis</p>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 font-medium text-sm">
                      🔒 <strong>{premiumFeatureName}</strong> est disponible uniquement pour les abonnés Premium et VIP.
                    </p>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Mettez à niveau votre abonnement pour accéder à toutes les fonctionnalités exclusives et profiter d'une expérience complète avec Sophie !
                  </p>
                </div>

                {/* Avantages Premium */}
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">Avec Premium/VIP, débloquez :</h3>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Video className="h-3 w-3 text-pink-500" />
                      <span>Appels vidéo illimités</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 text-pink-500" />
                      <span>Appels audio haute qualité</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Image className="h-3 w-3 text-pink-500" />
                      <span>Partage d'images privées</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mic className="h-3 w-3 text-pink-500" />
                      <span>Messages vocaux personnalisés</span>
                    </div>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPremiumModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Plus tard
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowPremiumModal(false);
                      // Redirection vers la page de paiement Premium
                      navigate('/dashboard/payment', {
                        state: {
                          plan: {
                            id: 'premium',
                            name: 'Premium',
                            price: 79,
                            features: [
                              'Appels vidéo illimités',
                              'Messages vocaux personnalisés',
                              'Partage d\'images privées',
                              'Appels audio haute qualité',
                              'Accès prioritaire',
                              'Support VIP'
                            ],
                            description: 'Débloquez toutes les fonctionnalités premium'
                          },
                          user: {
                            uid: currentUser?.uid,
                            email: currentUser?.email,
                            displayName: currentUser?.displayName
                          },
                          fromFeature: premiumFeatureName
                        }
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg text-sm font-medium"
                  >
                    Passer Premium
                  </motion.button>
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

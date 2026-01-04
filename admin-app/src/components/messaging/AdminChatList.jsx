import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Clock, ArrowLeft, Menu, Video, Phone, Mic, Image, Crown, Smile, Plus, Shield, Diamond } from 'lucide-react';
import { simpleChatService } from '../../services/simpleChat';
import { presenceService } from '../../services/presenceService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import SimpleChat from './SimpleChat';

const AdminChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [clientPresence, setClientPresence] = useState({});
  const [clientInfo, setClientInfo] = useState({});

  // Vérifier si le client a accès aux fonctionnalités premium
  const clientHasPremiumAccess = () => {
    const plan = clientInfo.plan || 'basic';
    return plan === 'premium' || plan === 'vip';
  };

  // Gestionnaires pour les fonctionnalités admin (dans l'en-tête)
  const handleVideoCall = () => {
    if (clientHasPremiumAccess()) {
      setInfoMessage('Appel vidéo initié avec le client');
      setShowInfoModal(true);
      console.log('Admin - Lancement appel vidéo');
    } else {
      setInfoMessage('Le client doit avoir un abonnement Premium ou VIP pour les appels vidéo');
      setShowInfoModal(true);
    }
  };

  const handleAudioCall = () => {
    if (clientHasPremiumAccess()) {
      setInfoMessage('Appel audio initié avec le client');
      setShowInfoModal(true);
      console.log('Admin - Lancement appel audio');
    } else {
      setInfoMessage('Le client doit avoir un abonnement Premium ou VIP pour les appels audio');
      setShowInfoModal(true);
    }
  };

  // Démarrer la présence admin
  useEffect(() => {
    presenceService.startPresence('admin', 'admin');

    return () => {
      presenceService.stopPresence('admin');
    };
  }, []);

  // Écouter toutes les conversations
  useEffect(() => {
    const unsubscribe = simpleChatService.listenToAllConversations((newConversations) => {
      setConversations(newConversations);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Écouter le statut et les infos du client sélectionné
  useEffect(() => {
    if (selectedConversation) {
      const clientId = selectedConversation.participants.find(p => p !== 'admin');
      if (clientId) {
        // Écouter la présence
        const unsubscribePresence = presenceService.listenToPresence(clientId, (presence) => {
          setClientPresence(presence);
        });

        // Écouter les infos du client (plan d'abonnement, etc.)
        const userRef = doc(db, 'users', clientId);
        const unsubscribeUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setClientInfo({
              ...userData,
              plan: userData.subscription?.plan || userData.plan || 'basic',
              displayName: userData.displayName || userData.profile?.name || selectedConversation.participantNames?.[clientId] || 'Client'
            });
          } else {
            // Fallback si pas de document utilisateur
            setClientInfo({
              plan: 'basic',
              displayName: selectedConversation.participantNames?.[clientId] || 'Client'
            });
          }
        }, (error) => {
          console.error('Erreur lors de l\'écoute des infos client:', error);
          setClientInfo({
            plan: 'basic',
            displayName: selectedConversation.participantNames?.[clientId] || 'Client'
          });
        });

        return () => {
          unsubscribePresence();
          unsubscribeUser();
        };
      }
    }
  }, [selectedConversation]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowChatOnMobile(true);
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
    setSelectedConversation(null);
  };

  // Obtenir l'icône du plan
  const getPlanIcon = (plan) => {
    const icons = {
      basic: Shield,
      premium: Crown,
      vip: Diamond
    };
    return icons[plan] || Shield;
  };

  // Obtenir la couleur du plan
  const getPlanColor = (plan) => {
    const colors = {
      basic: 'text-blue-600 bg-blue-100',
      premium: 'text-pink-600 bg-pink-100',
      vip: 'text-purple-600 bg-purple-100'
    };
    return colors[plan] || 'text-blue-600 bg-blue-100';
  };

  // Obtenir le texte du plan
  const getPlanText = (plan) => {
    const texts = {
      basic: 'Gratuit',
      premium: 'Premium',
      vip: 'VIP'
    };
    return texts[plan] || 'Gratuit';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
      <div className="flex h-full">
        {/* Liste des conversations - Responsive */}
        <div className={`w-full lg:w-80 border-r border-gray-200 bg-gray-50 flex-shrink-0 flex flex-col ${showChatOnMobile ? 'hidden lg:flex' : 'flex'
          }`}>
          <div className="p-4 border-b border-gray-200 bg-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <h2 className="font-semibold">Vos clients privés</h2>
              </div>
              <button
                onClick={async () => {
                  try {
                    const deleted = await simpleChatService.cleanupDuplicateConversations();
                    if (deleted > 0) {
                      alert(`${deleted} conversation(s) en double supprimée(s)`);
                    } else {
                      alert('Aucune conversation en double trouvée');
                    }
                  } catch (error) {
                    alert('Erreur lors du nettoyage');
                  }
                }}
                className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
              >
                🧹 Nettoyer
              </button>
            </div>
            <p className="text-primary-200 text-sm mt-1">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} • Accompagnement de luxe
            </p>
          </div>

          {/* Liste scrollable des conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune conversation</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const clientId = conversation.participants.find(p => p !== 'admin');
                const clientName = conversation.participantNames?.[clientId] || 'Client';

                return (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-3 lg:p-4 border-b border-gray-200 cursor-pointer transition-colors ${selectedConversation?.id === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {clientName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage || 'Nouvelle conversation'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className={`flex-1 flex flex-col ${!showChatOnMobile ? 'hidden lg:flex' : 'flex'
          }`}>
          {selectedConversation ? (
            <>
              {/* En-tête de la conversation */}
              <div className="p-3 lg:p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center space-x-3">
                  {/* Bouton retour mobile */}
                  <button
                    onClick={handleBackToList}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>

                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 lg:h-5 lg:w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm lg:text-base">
                        {clientInfo.displayName || selectedConversation.participantNames?.[
                          selectedConversation.participants.find(p => p !== 'admin')
                        ] || 'Client'}
                      </h3>
                      {/* Badge du plan */}
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(clientInfo.plan)}`}>
                        {React.createElement(getPlanIcon(clientInfo.plan), { className: 'w-3 h-3' })}
                        {getPlanText(clientInfo.plan)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${clientPresence.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                        }`}></div>
                      <p className="text-xs lg:text-sm text-gray-500">
                        {presenceService.getStatusText(clientPresence)}
                      </p>
                    </div>
                  </div>

                  {/* Boutons d'actions admin */}
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleVideoCall}
                      className={`relative p-2 rounded-full transition-colors ${clientHasPremiumAccess()
                          ? 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                          : 'text-gray-400 opacity-60 cursor-not-allowed'
                        }`}
                      title={clientHasPremiumAccess() ? 'Appel vidéo' : `Appel vidéo non disponible (client ${getPlanText(clientInfo.plan)})`}
                    >
                      <Video className="h-4 w-4" />
                      {!clientHasPremiumAccess() && (
                        <Crown className="h-2 w-2 absolute -top-0.5 -right-0.5 text-yellow-500" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleAudioCall}
                      className={`relative p-2 rounded-full transition-colors ${clientHasPremiumAccess()
                          ? 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                          : 'text-gray-400 opacity-60 cursor-not-allowed'
                        }`}
                      title={clientHasPremiumAccess() ? 'Appel audio' : `Appel audio non disponible (client ${getPlanText(clientInfo.plan)})`}
                    >
                      <Phone className="h-4 w-4" />
                      {!clientHasPremiumAccess() && (
                        <Crown className="h-2 w-2 absolute -top-0.5 -right-0.5 text-yellow-500" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Composant de chat avec hauteur fixe */}
              <div className="flex-1 flex flex-col min-h-0">
                <AdminChatInterface
                  conversationId={selectedConversation.id}
                  selectedConversation={selectedConversation}
                  clientInfo={clientInfo}
                  showInfoModal={showInfoModal}
                  setShowInfoModal={setShowInfoModal}
                  infoMessage={infoMessage}
                  setInfoMessage={setInfoMessage}
                />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-500">
                  Choisissez une conversation dans la liste pour commencer à discuter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant de chat spécifique pour l'admin
const AdminChatInterface = ({ conversationId, selectedConversation, clientInfo, showInfoModal, setShowInfoModal, infoMessage, setInfoMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas
  const scrollToBottom = (immediate = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: immediate ? 'instant' : 'smooth'
    });
  };

  // Écouter les messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = simpleChatService.listenToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
    });

    return unsubscribe;
  }, [conversationId]);

  // Écouter les indicateurs de frappe
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = simpleChatService.listenToTyping(conversationId, 'admin', (typing) => {
      setTypingUsers(typing);
    });

    return unsubscribe;
  }, [conversationId]);

  // Scroll automatique vers le dernier message
  useEffect(() => {
    if (messages.length > 0) {
      // Premier chargement : scroll immédiat
      const isFirstLoad = messages.length > 1;
      scrollToBottom(isFirstLoad);
    }
  }, [messages]);

  // Scroll immédiat lors du changement de conversation
  useEffect(() => {
    if (conversationId) {
      // Petit délai pour s'assurer que les messages sont chargés
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [conversationId]);

  // Envoyer un message en tant qu'admin
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading || !conversationId) return;

    setIsLoading(true);

    // Arrêter l'indicateur de frappe
    await simpleChatService.setTyping(conversationId, 'admin', false);

    try {
      await simpleChatService.sendMessage(conversationId, 'admin', newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Vérifier si le client a accès aux fonctionnalités premium (dans AdminChatInterface)
  const clientHasPremiumAccess = () => {
    const plan = clientInfo?.plan || 'basic';
    return plan === 'premium' || plan === 'vip';
  };

  // Gestionnaires pour les fonctionnalités de saisie
  const handleVoiceNote = () => {
    if (clientHasPremiumAccess()) {
      setInfoMessage('Enregistrement de note vocale démarré');
      setShowInfoModal(true);
      setShowOptions(false);
      console.log('Admin - Enregistrement note vocale');
    } else {
      setInfoMessage(`Le client (${clientInfo?.displayName || 'Client'}) doit avoir un abonnement Premium ou VIP pour recevoir des notes vocales`);
      setShowInfoModal(true);
      setShowOptions(false);
    }
  };

  const handleImageUpload = () => {
    if (clientHasPremiumAccess()) {
      setShowOptions(false);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setInfoMessage(`Image "${file.name}" sélectionnée pour envoi`);
          setShowInfoModal(true);
          console.log('Admin - Image sélectionnée:', file.name);
          // Logique d'envoi d'image ici
        }
      };
      input.click();
    } else {
      setInfoMessage(`Le client (${clientInfo?.displayName || 'Client'}) doit avoir un abonnement Premium ou VIP pour recevoir des images`);
      setShowInfoModal(true);
      setShowOptions(false);
    }
  };

  const handleStickers = () => {
    setShowOptions(false);
    setShowStickers(!showStickers);
  };

  const handleStickerSelect = (sticker) => {
    // Ajouter le sticker au message
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
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages - Hauteur calculée pour laisser place à la zone de saisie */}
      <div className="flex-1 overflow-y-auto p-4 pb-12 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isAdmin = message.senderId === 'admin';

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[85%] sm:max-w-xs lg:max-w-md">
                {!isAdmin && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-5 h-5 lg:w-6 lg:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(clientInfo?.displayName || 'Client').charAt(0)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      {clientInfo?.displayName || 'Client'}
                    </p>
                  </div>
                )}

                <div
                  className={`px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-sm ${isAdmin
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                    }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm lg:text-base">
                    {message.content}
                  </p>
                </div>

                <div className={`flex mt-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-400 px-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}


        <div ref={messagesEndRef} />
      </div>

      {/* Indicateur de frappe fixe au-dessus de la zone de saisie */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-50 px-4 py-2 border-t border-gray-100"
          >
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-xs lg:max-w-md">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 lg:w-5 lg:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {(clientInfo?.displayName || 'Client').charAt(0)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-600">
                      {clientInfo?.displayName || 'Client'} en train d'écrire
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone de saisie - FIXE EN BAS */}
      <div className="border-t border-gray-200 bg-white flex-shrink-0">
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

        <div className="p-2 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
          <p className="text-xs text-pink-700 font-medium text-center">
            💬 Répondre en tant que <strong>Liliana</strong>
          </p>
        </div>

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
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors text-left ${clientHasPremiumAccess() ? 'text-gray-700' : 'text-gray-400'
                        }`}
                    >
                      <div className="relative">
                        <Image className="h-4 w-4" />
                        {!clientHasPremiumAccess() && (
                          <Crown className="h-2 w-2 absolute -top-1 -right-1 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-sm">Envoyer une image</span>
                      {!clientHasPremiumAccess() && (
                        <span className="text-xs text-yellow-600 ml-auto">Premium requis</span>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ backgroundColor: '#fdf2f8' }}
                      onClick={handleVoiceNote}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors text-left ${clientHasPremiumAccess() ? 'text-gray-700' : 'text-gray-400'
                        }`}
                    >
                      <div className="relative">
                        <Mic className="h-4 w-4" />
                        {!clientHasPremiumAccess() && (
                          <Crown className="h-2 w-2 absolute -top-1 -right-1 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-sm">Note vocale</span>
                      {!clientHasPremiumAccess() && (
                        <span className="text-xs text-yellow-600 ml-auto">Premium requis</span>
                      )}
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
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';

                  // Gestion de l'indicateur de frappe
                  if (conversationId) {
                    // Indiquer qu'on tape
                    simpleChatService.setTyping(conversationId, 'admin', true);

                    // Arrêter l'indicateur après 3 secondes d'inactivité
                    if (typingTimeout) {
                      clearTimeout(typingTimeout);
                    }

                    const timeout = setTimeout(() => {
                      simpleChatService.setTyping(conversationId, 'admin', false);
                    }, 3000);

                    setTypingTimeout(timeout);
                  }
                }}
                placeholder="Réponse à ce client..."
                className="w-full px-3 py-2 pr-10 sm:px-4 sm:py-3 sm:pr-12 border-2 border-pink-200 rounded-2xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none bg-gray-50 hover:bg-white focus:bg-white transition-all duration-200 text-sm sm:text-base"
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
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </motion.button>
          </form>
        </div>
      </div>

      {/* Modal d'information Admin */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header admin */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Action Admin</h2>
                <p className="text-gray-300 text-sm">Fonctionnalité activée</p>
              </div>

              {/* Contenu */}
              <div className="p-6 text-center">
                <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 font-medium text-sm">
                    ✅ {infoMessage}
                  </p>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  En tant qu'administratrice, vous avez accès à toutes les fonctionnalités pour offrir la meilleure expérience à vos clients.
                </p>

                {/* Bouton */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowInfoModal(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all shadow-lg text-sm font-medium"
                >
                  Continuer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminChatList;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Clock, ArrowLeft, Menu, Video, Phone, Mic, Image, Crown, Smile, Plus, Shield, Diamond, Trash2, X } from 'lucide-react';
import { simpleChatService } from '../../services/simpleChat';
import { presenceService } from '../../services/presenceService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AdminChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [clientPresence, setClientPresence] = useState({});
  const [clientInfo, setClientInfo] = useState({});

  const clientHasPremiumAccess = () => {
    const plan = clientInfo.plan || 'basic';
    return plan === 'premium' || plan === 'vip';
  };

  const handleVideoCall = () => {
    if (clientHasPremiumAccess()) {
      setInfoMessage('Appel vidéo initié avec le client');
      setShowInfoModal(true);
    } else {
      setInfoMessage('Le client doit avoir un abonnement Premium ou VIP pour les appels vidéo');
      setShowInfoModal(true);
    }
  };

  const handleAudioCall = () => {
    if (clientHasPremiumAccess()) {
      setInfoMessage('Appel audio initié avec le client');
      setShowInfoModal(true);
    } else {
      setInfoMessage('Le client doit avoir un abonnement Premium ou VIP pour les appels audio');
      setShowInfoModal(true);
    }
  };

  useEffect(() => {
    presenceService.startPresence('admin', 'admin');
    return () => presenceService.stopPresence('admin');
  }, []);

  useEffect(() => {
    const unsubscribe = simpleChatService.listenToAllConversations((newConversations) => {
      setConversations(newConversations);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const clientId = selectedConversation.participants.find(p => p !== 'admin');
      if (clientId) {
        const unsubscribePresence = presenceService.listenToPresence(clientId, (presence) => {
          setClientPresence(presence);
        });

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
            setClientInfo({
              plan: 'basic',
              displayName: selectedConversation.participantNames?.[clientId] || 'Client'
            });
          }
        }, () => {
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

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f172a]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowChatOnMobile(true);
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      try {
        await simpleChatService.deleteConversation(conversationId);
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
          setShowChatOnMobile(false);
        }
      } catch (error) {
        alert('Erreur lors de la suppression.');
      }
    }
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
    setSelectedConversation(null);
  };

  const getPlanIcon = (plan) => {
    const icons = { basic: Shield, premium: Crown, vip: Diamond };
    return icons[plan] || Shield;
  };

  const getPlanColor = (plan) => {
    const colors = {
      basic: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      premium: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      vip: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    };
    return colors[plan] || 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  const getPlanText = (plan) => {
    const texts = { basic: 'Basic', premium: 'Premium', vip: 'VIP' };
    return texts[plan] || 'Basic';
  };

  return (
    <div className="bg-[#0f172a] h-full flex flex-col md:flex-row rounded-2xl overflow-hidden">
      {/* Liste des conversations - Responsive */}
      <div className={`w-full lg:w-80 border-r border-white/8 bg-white/5 flex-shrink-0 flex-col ${showChatOnMobile ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/8 bg-white/5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <h2 className="font-black text-sm uppercase tracking-widest text-gray-300">Vos Clients</h2>
            </div>
            <button
              onClick={async () => {
                try {
                  const deleted = await simpleChatService.cleanupDuplicateConversations();
                  if (deleted > 0) alert(`${deleted} doublons supprimés`);
                } catch (error) {
                  alert('Erreur lors du nettoyage');
                }
              }}
              className="text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md transition-colors text-gray-400"
            >
              Nettoyer
            </button>
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} actives
          </p>
        </div>

        {/* Liste scrollable des conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-gray-600" />
              <p className="text-sm">Aucune conversation</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const clientId = conversation.participants.find(p => p !== 'admin');
              const clientName = conversation.participantNames?.[clientId] || 'Client';

              return (
                <motion.div
                  key={conversation.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-colors group ${
                    selectedConversation?.id === conversation.id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                      <User className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-bold text-sm truncate ${selectedConversation?.id === conversation.id ? 'text-indigo-300' : 'text-gray-300'}`}>
                          {clientName}
                        </h3>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conversation.lastMessage || 'Nouvelle conversation'}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteConversation(e, conversation.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-rose-400 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div className={`flex-1 flex-col ${!showChatOnMobile ? 'hidden lg:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* En-tête de la conversation */}
            <div className="p-4 border-b border-white/8 bg-white/5 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToList}
                  className="lg:hidden p-2 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                  <User className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-white text-sm lg:text-base">
                      {clientInfo.displayName || selectedConversation.participantNames?.[
                        selectedConversation.participants.find(p => p !== 'admin')
                      ] || 'Client'}
                    </h3>
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 border rounded-md text-[8px] font-black uppercase tracking-widest ${getPlanColor(clientInfo.plan)}`}>
                      {React.createElement(getPlanIcon(clientInfo.plan), { className: 'w-2.5 h-2.5' })}
                      {getPlanText(clientInfo.plan)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${clientPresence.isOnline ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                      {clientPresence.isOnline ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                </div>

                {/* Boutons d'actions admin */}
                <div className="flex items-center space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVideoCall}
                    className={`relative p-2.5 rounded-xl transition-colors ${clientHasPremiumAccess()
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 bg-white/5 cursor-not-allowed'
                      }`}
                  >
                    <Video className="h-4 w-4" />
                    {!clientHasPremiumAccess() && <Crown className="h-2 w-2 absolute top-1.5 right-1.5 text-yellow-500/50" />}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAudioCall}
                    className={`relative p-2.5 rounded-xl transition-colors ${clientHasPremiumAccess()
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 bg-white/5 cursor-not-allowed'
                      }`}
                  >
                    <Phone className="h-4 w-4" />
                    {!clientHasPremiumAccess() && <Crown className="h-2 w-2 absolute top-1.5 right-1.5 text-yellow-500/50" />}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Composant de chat avec hauteur fixe */}
            <div className="flex-1 flex flex-col min-h-0 bg-transparent">
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
          <div className="h-full flex items-center justify-center bg-transparent p-4">
            <div className="text-center p-8 bg-white/5 border border-white/8 rounded-3xl max-w-sm w-full">
              <MessageSquare className="h-10 w-10 text-gray-600 mx-auto mb-4" />
              <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-2">
                Aucune Sélection
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Choisissez une conversation pour démarrer le support.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'information Admin */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-indigo-400" />
                 </div>
                 <button onClick={() => setShowInfoModal(false)} className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <h2 className="text-lg font-black text-white mb-2">Avis Système</h2>
              <p className="text-sm text-gray-400 mb-6">{infoMessage}</p>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all"
              >
                Compris
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminChatInterface = ({ conversationId, clientInfo, setShowInfoModal, setInfoMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (immediate = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth' });
  };

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = simpleChatService.listenToMessages(conversationId, setMessages);
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = simpleChatService.listenToTyping(conversationId, 'admin', setTypingUsers);
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom(messages.length > 1);
  }, [messages]);

  useEffect(() => {
    if (conversationId) setTimeout(() => scrollToBottom(true), 100);
  }, [conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading || !conversationId) return;
    setIsLoading(true);
    await simpleChatService.setTyping(conversationId, 'admin', false);
    try {
      await simpleChatService.sendMessage(conversationId, 'admin', newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clientHasPremiumAccess = () => {
    const plan = clientInfo?.plan || 'basic';
    return plan === 'premium' || plan === 'vip';
  };

  const handleAction = (type) => {
    setShowOptions(false);
    if (clientHasPremiumAccess()) {
      if (type === 'image') {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.onchange = (e) => {
          if (e.target.files[0]) {
            setInfoMessage(`Image "${e.target.files[0].name}" prête à l'envoi.`);
            setShowInfoModal(true);
          }
        };
        input.click();
      } else {
        setInfoMessage(`Action vocale initiée.`);
        setShowInfoModal(true);
      }
    } else {
      setInfoMessage(`Le client doit être Premium/VIP pour cette action.`);
      setShowInfoModal(true);
    }
  };

  const stickers = ['😍', '🥰', '😘', '💋', '❤️', '💕', '💖', '💗', '🔥', '✨', '⭐', '💫', '🌹', '🦋', '💎', '👑', '🍾', '🥂', '🎉', '🎊'];

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-transparent relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isAdmin = message.senderId === 'admin';
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] lg:max-w-md flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl ${
                    isAdmin
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white/10 text-gray-200 border border-white/5 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                </div>
                <span className="text-[10px] font-bold text-gray-500 mt-1 px-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="px-6 py-2 bg-transparent absolute bottom-[80px] left-0">
            <div className="flex items-center space-x-2 bg-white/10 border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Le client écrit</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-white/8 bg-white/5 flex-shrink-0 relative">
        <AnimatePresence>
          {showStickers && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="border-b border-white/5 p-3 bg-[#0f172a]">
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {stickers.map((s, i) => (
                  <button key={i} onClick={() => { setNewMessage(p => p + s); setShowStickers(false); }}
                    className="text-xl p-2 rounded-xl hover:bg-white/10 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-3">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
            <div className="relative">
              <button type="button" onClick={() => setShowOptions(!showOptions)}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <Plus size={20} />
              </button>
              <AnimatePresence>
                {showOptions && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full left-0 mb-2 bg-[#1e293b] rounded-2xl shadow-xl border border-white/10 p-2 min-w-[200px] z-10">
                    <button type="button" onClick={() => handleAction('image')} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${clientHasPremiumAccess() ? 'text-gray-300 hover:bg-white/5 hover:text-white' : 'text-gray-600'}`}>
                      <Image size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Image</span>
                    </button>
                    <button type="button" onClick={() => handleAction('audio')} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${clientHasPremiumAccess() ? 'text-gray-300 hover:bg-white/5 hover:text-white' : 'text-gray-600'}`}>
                      <Mic size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Audio</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                  if (conversationId) {
                    simpleChatService.setTyping(conversationId, 'admin', true);
                    if (typingTimeout) clearTimeout(typingTimeout);
                    setTypingTimeout(setTimeout(() => simpleChatService.setTyping(conversationId, 'admin', false), 3000));
                  }
                }}
                placeholder="Votre message..."
                className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-indigo-500/50 resize-none transition-all placeholder:text-gray-600"
                rows={1} style={{ minHeight: '44px', maxHeight: '100px' }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
              />
              <button type="button" onClick={() => setShowStickers(!showStickers)} className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors">
                <Smile size={20} />
              </button>
            </div>

            <button type="submit" disabled={!newMessage.trim() || isLoading}
              className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-50 disabled:bg-white/5 disabled:text-gray-500 transition-all">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <MessageSquare size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminChatList;

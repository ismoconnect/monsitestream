import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import { simpleChatService } from '../../services/simpleChat';
import { useAuth } from '../../contexts/AuthContext';

const SimpleChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialiser la conversation
  useEffect(() => {
    const initializeChat = async () => {
      const userId = currentUser?.uid || currentUser?.id;
      if (!currentUser || !userId) return;
      
      try {
        setIsInitializing(true);
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

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userId = currentUser?.uid || currentUser?.id;
    if (!newMessage.trim() || isLoading || !conversationId || !userId) return;

    setIsLoading(true);
    const messageToSend = newMessage.trim();
    setNewMessage(''); // Effacer immédiatement pour une meilleure UX
    
    try {
      await simpleChatService.sendMessage(conversationId, userId, messageToSend);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setNewMessage(messageToSend); // Restaurer le message en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="h-screen bg-white flex flex-col">
      {/* En-tête de discussion - Sophie */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 shadow-lg flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* Avatar de Sophie */}
          <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">S</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Sophie</h1>
            <p className="text-pink-100 text-sm flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Accompagnatrice de luxe • En ligne
            </p>
          </div>
          <div className="text-pink-100">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Zone des messages - scrollable */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          <AnimatePresence>
            {messages.map((message) => {
              const userId = currentUser?.uid || currentUser?.id;
              const isOwn = message.senderId === userId;
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
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
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
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        isOwn
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
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
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">S</span>
                </div>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Zone de saisie - fixe en bas */}
      <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  // Auto-resize du textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                placeholder="Écrivez votre message à Sophie..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none bg-gray-50 hover:bg-white focus:bg-white transition-all duration-200"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim() || isLoading}
              className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimpleChat;

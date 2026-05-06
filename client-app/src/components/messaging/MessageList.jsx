import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import messagingService from '../../services/messaging';
import { useAuth } from '../../contexts/AuthContext';

const MessageList = ({ conversationId, onFileUpload }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = (immediate = false) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: immediate ? 'instant' : 'smooth' 
    });
  };

  // Scroll automatique vers le dernier message
  useEffect(() => {
    if (messages.length > 0) {
      // Premier chargement : scroll immédiat pour pointer directement sur le dernier message
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

  // Listen to messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = messagingService.listenToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
    });

    return unsubscribe;
  }, [conversationId]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await messagingService.sendMessage(conversationId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      await messagingService.sendFile(conversationId, file, fileType);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (status, createdAt) => {
    const isRecent = Date.now() - createdAt?.toDate() < 5000; // 5 seconds
    
    switch (status) {
      case 'sent':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return isRecent ? <Clock className="h-3 w-3 text-gray-400" /> : null;
    }
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
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

  // Render message content
  const renderMessageContent = (message) => {
    if (message.type === 'system') {
      return (
        <div className="text-center text-sm text-gray-500 italic">
          {message.decryptedContent}
        </div>
      );
    }

    if (message.type === 'image') {
      try {
        const fileMetadata = JSON.parse(message.decryptedContent);
        return (
          <div className="space-y-2">
            <img 
              src={fileMetadata.url} 
              alt={fileMetadata.name}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(fileMetadata.url, '_blank')}
            />
            <p className="text-sm text-gray-600">{message.decryptedContent}</p>
          </div>
        );
      } catch (error) {
        return (
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Erreur de décryptage</span>
          </div>
        );
      }
    }

    if (message.type === 'file') {
      try {
        const fileMetadata = JSON.parse(message.decryptedContent);
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Paperclip className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{fileMetadata.name}</p>
              <p className="text-xs text-gray-500">
                {(fileMetadata.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <a 
              href={fileMetadata.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Télécharger
            </a>
          </div>
        );
      } catch (error) {
        return (
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Erreur de décryptage</span>
          </div>
        );
      }
    }

    return (
      <p className="text-gray-900 whitespace-pre-wrap break-words">
        {message.decryptedContent}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => {
            const isOwn = message.senderId === currentUser?.uid;
            const isSystem = message.type === 'system';
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center' : ''}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isSystem ? 'w-full' : ''}`}>
                  {!isSystem && !isOwn && (
                    <p className="text-xs text-gray-500 mb-1 px-2">
                      {message.senderName}
                    </p>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isSystem
                        ? 'bg-transparent'
                        : isOwn
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {renderMessageContent(message)}
                  </div>
                  
                  {!isSystem && (
                    <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-400">
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {isOwn && getMessageStatusIcon(message.status, message.createdAt)}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Image className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </label>
            
            <label className="cursor-pointer">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Paperclip className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </label>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim() || isLoading}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageList;

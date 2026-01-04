import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Heart,
  Image,
  Mic,
  Smile,
  Paperclip,
  Calendar,
  VideoCamera
} from 'lucide-react';

const ClientMessagesSection = ({ currentUser }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Liliana',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      online: true,
      lastMessage: 'Merci pour cette magnifique soirée...',
      lastMessageTime: '14:30',
      unreadCount: 2,
      messages: [
        {
          id: 1,
          content: 'Bonjour ! Comment allez-vous ?',
          timestamp: '10:30',
          senderId: 'Liliana',
          isRead: true
        },
        {
          id: 2,
          content: 'Très bien merci ! Et vous ?',
          timestamp: '10:32',
          senderId: 'me',
          isRead: true
        },
        {
          id: 3,
          content: 'Parfait ! J\'aimerais réserver un créneau pour demain soir si possible.',
          timestamp: '10:35',
          senderId: 'Liliana',
          isRead: true
        },
        {
          id: 4,
          content: 'Bien sûr ! Je suis disponible à partir de 20h. Cela vous convient-il ?',
          timestamp: '10:37',
          senderId: 'me',
          isRead: true
        },
        {
          id: 5,
          content: 'Parfait ! Merci pour cette magnifique soirée...',
          timestamp: '14:30',
          senderId: 'Liliana',
          isRead: false
        }
      ]
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // Simuler l'envoi du message
      console.log('Message envoyé:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <MessageSquare className="w-6 h-6 text-indigo-500 mr-2" />
            Messages Privés
          </h2>
          <p className="text-gray-600">Communiquez en toute discrétion avec Liliana</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-96">
        {/* Liste des conversations */}
        <div className="col-span-4 bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {filteredConversations.map(conversation => (
              <motion.button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${selectedConversation?.id === conversation.id ? 'bg-indigo-50 border-indigo-200' : ''
                  }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={conversation.avatar}
                      className="w-10 h-10 rounded-full"
                      alt="Avatar"
                    />
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {conversation.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">{conversation.lastMessageTime}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-block bg-indigo-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="col-span-8 bg-white rounded-xl border">
          {selectedConversation ? (
            <>
              {/* Header du chat */}
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedConversation.avatar}
                    className="w-8 h-8 rounded-full"
                    alt="Avatar"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">{selectedConversation.name}</h4>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.online ? 'En ligne' : 'Vu récemment'}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Video className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ height: '300px' }}>
                {selectedConversation.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === 'me'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${message.senderId === 'me' ? 'text-indigo-100' : 'text-gray-500'
                          }`}>
                          {message.timestamp}
                        </p>
                        {message.senderId === 'me' && (
                          <div className="ml-2">
                            {message.isRead ? (
                              <CheckCheck className="w-3 h-3 text-blue-300" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-300" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input message */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Image className="w-4 h-4" />
                  </motion.button>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Tapez votre message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Sélectionnez une conversation</h3>
                <p className="text-gray-600">Choisissez une conversation pour commencer à échanger</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
          >
            <Heart className="w-6 h-6 text-pink-500 mr-3" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">Message d'amour</p>
              <p className="text-sm text-gray-600">Envoyez un message romantique</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <Calendar className="w-6 h-6 text-purple-500 mr-3" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">Demander un RDV</p>
              <p className="text-sm text-gray-600">Proposez un rendez-vous</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <VideoCamera className="w-6 h-6 text-blue-500 mr-3" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">Appel vidéo</p>
              <p className="text-sm text-gray-600">Demander un appel privé</p>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ClientMessagesSection;

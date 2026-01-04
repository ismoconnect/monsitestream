import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter, 
  MoreVertical, 
  Star, 
  Heart,
  Image,
  Video,
  Mic,
  Phone,
  Clock,
  Check,
  CheckCheck,
  Reply,
  Archive,
  Trash2
} from 'lucide-react';

const MessagesSection = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const [conversations] = useState([
    {
      id: 1,
      client: {
        name: 'Alexandre M.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        isOnline: true,
        isPremium: true
      },
      lastMessage: {
        text: 'Merci pour cette magnifique soirée...',
        timestamp: '14:30',
        isRead: true,
        sender: 'client'
      },
      unreadCount: 0,
      isPinned: true,
      tags: ['VIP', 'Régulier']
    },
    {
      id: 2,
      client: {
        name: 'Thomas L.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        isOnline: false,
        isPremium: false
      },
      lastMessage: {
        text: 'Quand serais-tu disponible pour...',
        timestamp: '12:15',
        isRead: false,
        sender: 'client'
      },
      unreadCount: 2,
      isPinned: false,
      tags: ['Nouveau']
    },
    {
      id: 3,
      client: {
        name: 'Julien R.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        isOnline: true,
        isPremium: true
      },
      lastMessage: {
        text: 'Parfait, à demain alors !',
        timestamp: '11:45',
        isRead: true,
        sender: 'me'
      },
      unreadCount: 0,
      isPinned: false,
      tags: ['VIP']
    }
  ]);

  const [messages] = useState([
    {
      id: 1,
      text: 'Bonjour Sophie, j\'espère que vous allez bien !',
      timestamp: '10:30',
      sender: 'client',
      isRead: true
    },
    {
      id: 2,
      text: 'Bonjour Alexandre ! Oui très bien merci, et vous ?',
      timestamp: '10:32',
      sender: 'me',
      isRead: true
    },
    {
      id: 3,
      text: 'Très bien aussi ! J\'aimerais réserver un créneau pour demain soir si possible.',
      timestamp: '10:35',
      sender: 'client',
      isRead: true
    },
    {
      id: 4,
      text: 'Bien sûr ! Je suis disponible à partir de 20h. Cela vous convient-il ?',
      timestamp: '10:37',
      sender: 'me',
      isRead: true
    },
    {
      id: 5,
      text: 'Parfait ! Merci pour cette magnifique soirée...',
      timestamp: '14:30',
      sender: 'client',
      isRead: true
    }
  ]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && conv.unreadCount > 0) ||
      (filter === 'premium' && conv.client.isPremium) ||
      (filter === 'pinned' && conv.isPinned);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <MessageSquare className="w-6 h-6 text-indigo-500 mr-2" />
            Messages Privés
          </h2>
          <p className="text-gray-600">Communiquez avec vos clients en toute discrétion</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Nouveau Message
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Messages Aujourd'hui</p>
              <p className="text-2xl font-bold text-blue-600">24</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Non Lus</p>
              <p className="text-2xl font-bold text-orange-600">3</p>
            </div>
            <Check className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clients Actifs</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <Heart className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temps Réponse</p>
              <p className="text-2xl font-bold text-purple-600">2m</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des Conversations */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Filtres */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une conversation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex space-x-1">
                {[
                  { id: 'all', label: 'Toutes' },
                  { id: 'unread', label: 'Non lues' },
                  { id: 'premium', label: 'Premium' },
                  { id: 'pinned', label: 'Épinglées' }
                ].map(filterOption => (
                  <button
                    key={filterOption.id}
                    onClick={() => setFilter(filterOption.id)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filter === filterOption.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations */}
            <div className="max-h-96 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-indigo-50 border-indigo-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={conversation.client.avatar}
                        alt={conversation.client.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.client.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-800 truncate">
                          {conversation.client.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {conversation.isPinned && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                          {conversation.client.isPremium && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {conversation.lastMessage.text}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage.timestamp}
                        </span>
                        <div className="flex items-center space-x-1">
                          {conversation.lastMessage.sender === 'me' && (
                            conversation.lastMessage.isRead ? (
                              <CheckCheck className="w-3 h-3 text-blue-500" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-400" />
                            )
                          )}
                          {conversation.unreadCount > 0 && (
                            <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {conversation.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone de Chat */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex flex-col">
              {/* Header du Chat */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedConversation.client.avatar}
                      alt={selectedConversation.client.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {selectedConversation.client.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.client.isOnline ? 'En ligne' : 'Hors ligne'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'me'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'me' ? 'text-indigo-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Image className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Mic className="w-4 h-4" />
                  </button>
                  
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Tapez votre message..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Sélectionnez une conversation</h3>
                <p className="text-gray-600">Choisissez une conversation pour commencer à échanger</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesSection;

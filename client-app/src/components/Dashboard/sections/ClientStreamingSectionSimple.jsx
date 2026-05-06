import React, { useState } from 'react';
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
  Eye,
  Euro,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ClientStreamingSectionSimple = ({ currentUser }) => {
  const [isInStream, setIsInStream] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isPremium = currentUser?.subscription?.status === 'active' &&
    (currentUser?.subscription?.type === 'premium' || currentUser?.subscription?.type === 'vip');

  const upcomingSessions = [
    {
      id: 1,
      title: 'Session Privée - Soirée Relaxante',
      scheduledFor: '2024-01-20T20:00:00',
      duration: 60,
      type: 'private',
      maxViewers: 1,
      price: 50,
      description: 'Moment de détente et de conversation privée',
      category: 'relaxation',
      thumbnail: '/api/placeholder/300/200',
      tags: ['relaxation', 'conversation', 'privé']
    },
    {
      id: 2,
      title: 'Streaming Group - Soirée Jeux',
      scheduledFor: '2024-01-22T19:00:00',
      duration: 90,
      type: 'group',
      maxViewers: 10,
      price: 25,
      description: 'Jeux interactifs et moments de partage',
      category: 'games',
      thumbnail: '/api/placeholder/300/200',
      tags: ['jeux', 'interactif', 'groupe']
    },
    {
      id: 3,
      title: 'Session VIP - Danse Sensuelle',
      scheduledFor: '2024-01-25T21:00:00',
      duration: 45,
      type: 'vip',
      maxViewers: 5,
      price: 75,
      description: 'Performance artistique exclusive',
      category: 'performance',
      thumbnail: '/api/placeholder/300/200',
      tags: ['vip', 'danse', 'exclusif']
    }
  ];

  const pastSessions = [
    {
      id: 4,
      title: 'Session Privée - Conversation',
      date: '2024-01-15T20:00:00',
      duration: 45,
      type: 'private',
      viewers: 1,
      rating: 5,
      feedback: 'Moment parfait, très agréable',
      thumbnail: '/api/placeholder/300/200',
      category: 'conversation'
    },
    {
      id: 5,
      title: 'Streaming Group - Danse',
      date: '2024-01-12T19:30:00',
      duration: 60,
      type: 'group',
      viewers: 8,
      rating: 4,
      feedback: 'Super ambiance, à refaire !',
      thumbnail: '/api/placeholder/300/200',
      category: 'performance'
    },
    {
      id: 6,
      title: 'Session VIP - Relaxation',
      date: '2024-01-10T20:30:00',
      duration: 90,
      type: 'vip',
      viewers: 3,
      rating: 5,
      feedback: 'Expérience inoubliable, merci !',
      thumbnail: '/api/placeholder/300/200',
      category: 'relaxation'
    }
  ];

  const filters = [
    { id: 'all', label: 'Toutes', icon: Video },
    { id: 'private', label: 'Privées', icon: Lock },
    { id: 'group', label: 'Groupes', icon: Users },
    { id: 'vip', label: 'VIP', icon: Crown }
  ];

  const filteredSessions = upcomingSessions.filter(session => {
    if (selectedFilter === 'all') return true;
    return session.type === selectedFilter;
  });

  const handleJoinStream = (session) => {
    setCurrentStream(session);
    setIsInStream(true);
  };

  const handleLeaveStream = () => {
    setIsInStream(false);
    setCurrentStream(null);
  };

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-pink-50 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center py-16 sm:py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-2xl opacity-20"></div>
              <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-6 sm:p-8 rounded-full mx-auto w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Contenu Premium Exclusif
            </h3>
            <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-md mx-auto">
              Les sessions de streaming interactives sont réservées aux abonnés Premium.
              Découvrez un univers de divertissement personnalisé.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 mx-auto transition-all duration-300 shadow-lg shadow-pink-500/25 font-medium text-lg"
            >
              <Crown className="w-6 h-6" />
              Passer Premium
            </motion.button>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-xl mb-3">
                  <Video className="w-8 h-8 text-pink-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Sessions Privées</h4>
                <p className="text-sm text-gray-600">Moment intime et personnalisé</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-xl mb-3">
                  <Users className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Groupes VIP</h4>
                <p className="text-sm text-gray-600">Ambiance conviviale et exclusive</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-indigo-100 to-pink-100 p-4 rounded-xl mb-3">
                  <Zap className="w-8 h-8 text-indigo-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Contenu Live</h4>
                <p className="text-sm text-gray-600">Interactions en temps réel</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-pink-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Élégant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-2 sm:p-3 rounded-full">
                    <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Sessions Live
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                    Rejoignez les sessions interactives en temps réel
                  </p>
                </div>
              </div>

              {/* Stats Élégantes */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6 mt-3 sm:mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {upcomingSessions.length} sessions disponibles
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {upcomingSessions.reduce((sum, s) => sum + s.maxViewers, 0)} places total
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Euro className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {upcomingSessions.reduce((sum, s) => sum + s.price, 0)}€ total
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 mt-4 md:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 font-medium shadow-lg shadow-pink-500/25 transition-all duration-300 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Nouvelle Session</span>
                <span className="sm:hidden">Nouveau</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filtres Élégants */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all duration-200 ${selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">{filter.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Current Stream */}
        <AnimatePresence>
          {isInStream && currentStream && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-lg shadow-pink-500/25 mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className="text-lg sm:text-xl font-semibold">{currentStream.title}</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveStream}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Quitter</span>
                </motion.button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>1/{currentStream.maxViewers} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>45:30 / {currentStream.duration}min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>En direct</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sessions à Venir */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-pink-600" />
              </div>
              Sessions à Venir
            </h3>
            <div className="text-sm text-gray-500">
              {filteredSessions.length} session{filteredSessions.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-pink-200 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 group"
              >
                {/* Thumbnail et Type */}
                <div className="relative mb-4">
                  <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <Video className="w-12 h-12 text-pink-400" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.type === 'private'
                      ? 'bg-purple-100 text-purple-600'
                      : session.type === 'vip'
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                      }`}>
                      {session.type === 'private' ? 'Privé' : session.type === 'vip' ? 'VIP' : 'Groupe'}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base line-clamp-2">{session.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{session.description}</p>
                  </div>

                  {/* Détails */}
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(session.scheduledFor).toLocaleDateString('fr-FR')} à {new Date(session.scheduledFor).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{session.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Max {session.maxViewers} participant{session.maxViewers > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="font-semibold text-pink-600">{session.price}€</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {session.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Bouton */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleJoinStream(session)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-pink-500/25 font-medium text-sm sm:text-base"
                  >
                    <Play className="w-4 h-4" />
                    Rejoindre
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sessions Passées */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-gradient-to-r from-gray-100 to-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
              Historique des Sessions
            </h3>
            <div className="text-sm text-gray-500">
              {pastSessions.length} session{pastSessions.length > 1 ? 's' : ''} terminée{pastSessions.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {pastSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <Video className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base truncate">{session.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-1">{session.feedback}</p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{session.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{session.viewers} participant{session.viewers > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                            <span className="font-medium">{session.rating}/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.type === 'private'
                      ? 'bg-purple-100 text-purple-600'
                      : session.type === 'vip'
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                      }`}>
                      {session.type === 'private' ? 'Privé' : session.type === 'vip' ? 'VIP' : 'Groupe'}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-pink-500 hover:text-pink-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-pink-50 transition-colors"
                    >
                      Détails
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientStreamingSectionSimple;

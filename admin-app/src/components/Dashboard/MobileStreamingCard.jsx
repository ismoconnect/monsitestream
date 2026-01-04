import React from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Eye, Clock, Crown, Lock } from 'lucide-react';

const MobileStreamingCard = ({ stream, onAction, isPremium = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ended':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'live':
        return '🔴 EN DIRECT';
      case 'scheduled':
        return '📅 Programmé';
      case 'ended':
        return '⏹️ Terminé';
      default:
        return 'Inconnu';
    }
  };

  // Données d'exemple si pas de stream fourni
  const defaultStream = {
    id: 1,
    title: 'Session Privée Premium',
    description: 'Une session exclusive pour mes abonnés premium',
    status: 'scheduled',
    scheduledTime: '2024-01-15T20:00:00',
    duration: '45 min',
    viewers: 0,
    maxViewers: 10,
    premium: true,
    thumbnail: '/api/placeholder/400/225'
  };

  const str = stream || defaultStream;
  const isLocked = str.premium && !isPremium;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-purple-100">
        {/* Premium Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center text-white">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              <div className="flex items-center space-x-1 justify-center">
                <Crown className="w-5 h-5" />
                <span className="text-sm font-medium">Premium Requis</span>
              </div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(str.status)}`}>
            {getStatusText(str.status)}
          </div>
        </div>

        {/* Premium Badge */}
        {str.premium && (
          <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm rounded-full p-2">
            <Crown className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Play Button */}
        {str.status === 'live' && !isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAction?.('join', str)}
              className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
            >
              <Play className="w-8 h-8 text-pink-500 ml-1" />
            </motion.button>
          </div>
        )}

        {/* Viewers Count (if live) */}
        {str.status === 'live' && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
            <Eye className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-medium">{str.viewers}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
          {str.title}
        </h3>
        
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {str.description}
        </p>

        {/* Stream Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
            {str.status === 'scheduled' && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(str.scheduledTime).toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>Max {str.maxViewers}</span>
            </div>
          </div>
          <span>{str.duration}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {str.status === 'live' && !isLocked && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction?.('join', str)}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-3 rounded-lg text-xs font-medium"
            >
              Rejoindre le Live
            </motion.button>
          )}
          
          {str.status === 'scheduled' && !isLocked && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction?.('notify', str)}
              className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-xs font-medium"
            >
              Me notifier
            </motion.button>
          )}

          {isLocked && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction?.('upgrade', str)}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-3 rounded-lg text-xs font-medium"
            >
              Passer Premium
            </motion.button>
          )}
          
          {str.status === 'ended' && !isLocked && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction?.('replay', str)}
              className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg text-xs font-medium"
            >
              Voir le Replay
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MobileStreamingCard;

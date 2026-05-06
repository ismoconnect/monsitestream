import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, Heart } from 'lucide-react';

const MobileMessageCard = ({ message, onClick, isUnread = false }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white rounded-lg p-4 shadow-sm border ${isUnread ? 'border-pink-200 bg-pink-50/30' : 'border-gray-100'
        } cursor-pointer transition-all duration-200`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">L</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-800 truncate">Liliana</h3>
            <div className="flex items-center space-x-2">
              {isUnread && (
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              )}
              <span className="text-xs text-gray-500">Il y a 5 min</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {message || "Salut ! Comment ça va aujourd'hui ? J'espère que tu passes une excellente journée..."}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">12</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-xs text-gray-500">5</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">En ligne</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileMessageCard;

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, User, Crown, Menu } from 'lucide-react';
import ValidationBadge from './ValidationBadge';

const ClientHeader = ({ currentUser, onMobileMenuToggle }) => {
  const isPremium = currentUser?.subscription?.status === 'active' &&
    (currentUser?.subscription?.type === 'premium' || currentUser?.subscription?.type === 'vip');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-3 lg:px-6 py-3 lg:py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Mobile Menu */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Center - Validation Badge (Mobile only) */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
            <ValidationBadge user={currentUser} />
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Validation Badge - Desktop only */}
            <div className="hidden lg:block">
              <ValidationBadge user={currentUser} />
            </div>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center text-[10px] lg:text-xs">
                  3
                </span>
              </motion.button>
            </div>

            {/* Messages non lus */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center text-[10px] lg:text-xs">
                  2
                </span>
              </motion.button>
            </div>

            {/* Profile - Moved after messages */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                {isPremium && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center">
                    <Crown className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div className="hidden sm:block">
                <h2 className="font-semibold text-gray-800">Bonjour {currentUser?.displayName?.split(' ')[0] || 'Cher client'}</h2>
                <p className="text-sm text-gray-500">
                  {isPremium ? 'Membre Premium' : 'Membre Standard'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;

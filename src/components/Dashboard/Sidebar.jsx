import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  DollarSign, 
  Video, 
  Image, 
  MessageSquare, 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  CreditCard, 
  Shield, 
  Bell,
  Camera,
  Mic,
  FileText,
  Star,
  Heart,
  Gift,
  Zap,
  Crown,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'overview',
      label: 'Aperçu',
      icon: Home,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'pricing',
      label: 'Tarifs & Abonnements',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      id: 'streaming',
      label: 'Stream Privé',
      icon: Video,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'gallery',
      label: 'Galerie Photos',
      icon: Image,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'videos',
      label: 'Vidéos Exclusives',
      icon: Camera,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      id: 'messages',
      label: 'Messages Privés',
      icon: MessageSquare,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'bookings',
      label: 'Réservations',
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'clients',
      label: 'Gestion Clients',
      icon: Users,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50'
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: CreditCard,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'security',
      label: 'Sécurité',
      icon: Shield,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50'
    },
    {
      id: 'content',
      label: 'Gestion Contenu',
      icon: FileText,
      color: 'text-violet-500',
      bgColor: 'bg-violet-50'
    },
    {
      id: 'reviews',
      label: 'Avis & Notes',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'promotions',
      label: 'Promotions',
      icon: Gift,
      color: 'text-fuchsia-500',
      bgColor: 'bg-fuchsia-50'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50'
    }
  ];

  const premiumFeatures = [
    {
      id: 'premium-content',
      label: 'Contenu Premium',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      id: 'private-calls',
      label: 'Appels Privés',
      icon: Mic,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'exclusive-access',
      label: 'Accès Exclusif',
      icon: Lock,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`bg-white shadow-lg border-r border-gray-200 h-full transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
              <p className="text-sm text-gray-500">Sophie - Admin</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </motion.div>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2 overflow-y-auto h-full">
        {/* Menu Principal */}
        <div className="space-y-1">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Navigation Principale
            </h3>
          )}
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? `${item.bgColor} ${item.color} shadow-sm`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 bg-current rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Fonctionnalités Premium */}
        {!isCollapsed && (
          <div className="mt-8 space-y-1">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Fonctionnalités Premium
            </h3>
            
            {premiumFeatures.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? `${item.bgColor} ${item.color} shadow-sm`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-current rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Statut en ligne */}
        {!isCollapsed && (
          <div className="mt-8 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">En ligne</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Prêt pour les streams</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;

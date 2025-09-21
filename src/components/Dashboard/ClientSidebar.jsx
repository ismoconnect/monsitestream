import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Image, 
  MessageSquare, 
  Calendar, 
  Video, 
  CreditCard, 
  User, 
  Settings,
  Heart,
  Star,
  Crown,
  Lock,
  X,
  LogOut,
  Search
} from 'lucide-react';
import ValidationBadge from './ValidationBadge';

const ClientSidebar = ({ currentUser, onMobileClose, onSignOut, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: Home,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      path: '/dashboard/overview'
    },
    {
      id: 'gallery',
      label: 'Galerie Premium',
      icon: Image,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      premium: true,
      path: '/dashboard/gallery'
    },
    {
      id: 'messages',
      label: 'Messages Privés',
      icon: MessageSquare,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      path: '/dashboard/messages'
    },
    {
      id: 'appointments',
      label: 'Mes Rendez-vous',
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      path: '/dashboard/appointments'
    },
    {
      id: 'streaming',
      label: 'Sessions Live',
      icon: Video,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      premium: true,
      path: '/dashboard/streaming'
    },
    {
      id: 'subscription',
      label: 'Mon Abonnement',
      icon: CreditCard,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      path: '/dashboard/subscription'
    },
    {
      id: 'payment-tracking',
      label: 'Suivi Paiements',
      icon: Search,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      path: '/dashboard/payment-tracking'
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: User,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      path: '/dashboard/profile'
    }
  ];

  const isPremium = currentUser?.subscription?.status === 'active' && 
                   (currentUser?.subscription?.type === 'premium' || currentUser?.subscription?.type === 'vip');

  // Contenu de la sidebar
  const SidebarContent = () => (
    <div className="bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 h-full flex flex-col overflow-hidden"
    >
      {/* Header Compact */}
      <div className="relative p-2 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Sophie</h2>
              <p className="text-xs text-white/80">Premium</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded bg-white/20 hover:bg-white/30"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

      {/* User Status Mini */}
      <div className="p-2 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            {isPremium && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-1.5 h-1.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 truncate text-xs">{currentUser?.displayName}</h3>
            <p className="text-xs text-gray-500">{isPremium ? 'Premium' : 'Standard'}</p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        
        {/* Validation Badge Mobile */}
        <div className="mt-2 lg:hidden">
          <ValidationBadge user={currentUser} />
        </div>
      </div>

      {/* Navigation Ultra-Compacte */}
      <div className="flex-1 px-2 py-1 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (location.pathname === '/dashboard' && item.id === 'overview');
          const isLocked = item.premium && !isPremium;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                if (!isLocked) {
                  navigate(item.path);
                  if (setIsMobileMenuOpen) {
                    setIsMobileMenuOpen(false);
                  }
                  if (onMobileClose) {
                    onMobileClose();
                  }
                }
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLocked}
              className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : isLocked
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${
                isActive ? 'text-white' : isLocked ? 'text-gray-400' : item.color
              }`} />
              
              <span className="font-medium text-xs flex-1 text-left truncate">{item.label}</span>
              
              {item.premium && (
                <div className="flex items-center">
                  {isLocked ? (
                    <Lock className="w-3 h-3 text-gray-400" />
                  ) : (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Premium CTA Augmentée */}
      {!isPremium && (
        <div className="p-2 border-t border-gray-200">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-xl p-3 text-white text-center shadow-lg"
          >
            <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-sm mb-1">Passez Premium</h3>
            <p className="text-xs text-white/90 mb-3">Contenu exclusif</p>
            <button
              onClick={() => {
                navigate('/dashboard/subscription');
                if (setIsMobileMenuOpen) {
                  setIsMobileMenuOpen(false);
                }
                if (onMobileClose) {
                  onMobileClose();
                }
              }}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-300 border border-white/20"
            >
              Découvrir les plans
            </button>
          </motion.div>
        </div>
      )}

      {/* Quick Stats Mini */}
      <div className="p-2 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-1">
          <div className="bg-gray-50 rounded p-1.5 text-center">
            <MessageSquare className="w-3 h-3 text-indigo-500 mx-auto mb-0.5" />
            <p className="text-xs text-gray-600">Messages</p>
            <p className="text-xs font-bold text-gray-800">12</p>
          </div>
          <div className="bg-gray-50 rounded p-1.5 text-center">
            <Calendar className="w-3 h-3 text-orange-500 mx-auto mb-0.5" />
            <p className="text-xs text-gray-600">RDV</p>
            <p className="text-xs font-bold text-gray-800">3</p>
          </div>
        </div>
      </div>

      {/* Logout Button Mini */}
      <div className="p-2 border-t border-gray-200">
        <motion.button
          onClick={onSignOut}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-xs">Se déconnecter</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-64 max-w-sm"
          >
            {/* Close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <SidebarContent />
          </motion.div>
        </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ClientSidebar;

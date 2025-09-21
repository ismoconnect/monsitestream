import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Shield, 
  LogOut,
  Home,
  Menu,
  X,
  CreditCard
} from 'lucide-react';

const AdminSidebar = ({ currentAdmin, onSignOut, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/admin',
      description: 'Vue d\'ensemble'
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Users,
      path: '/admin',
      description: 'Gestion des comptes'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      path: '/admin/messages',
      description: 'Conversations clients'
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: CreditCard,
      path: '/admin/payments',
      description: 'Gestion des paiements'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      description: 'Statistiques'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      path: '/admin/settings',
      description: 'Configuration'
    }
  ];

  const handleNavigation = (item) => {
    if (item.id === 'users') {
      // Rester sur le dashboard principal pour la gestion des utilisateurs
      navigate('/admin');
    } else {
      navigate(item.path);
    }
    // Fermer le menu mobile après navigation
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (item) => {
    if (item.id === 'users' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname === item.path;
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Admin Panel</h2>
              <p className="text-gray-400 text-sm">Sophie - Accompagnatrice</p>
            </div>
          </div>
          {/* Bouton fermer pour mobile */}
          <button
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">S</span>
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Sophie</div>
            <div className="text-gray-400 text-xs">Administratrice</div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSignOut}
          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Déconnexion</span>
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-gray-900 text-white flex-col h-screen">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-gray-900 text-white flex flex-col z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;

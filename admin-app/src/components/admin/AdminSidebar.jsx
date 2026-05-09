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
  CreditCard,
  Calendar,
  Image
} from 'lucide-react';

const AdminSidebar = ({ currentAdmin, onSignOut, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      description: 'Vue d\'ensemble'
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Users,
      path: '/dashboard',
      description: 'Gestion des comptes'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      path: '/messages',
      description: 'Conversations clients'
    },
    {
      id: 'appointments',
      label: 'Rendez-vous',
      icon: Calendar,
      path: '/appointments',
      description: 'Calendrier des RDV'
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: CreditCard,
      path: '/payments',
      description: 'Gestion des paiements'
    },
    {
      id: 'gallery',
      label: 'Galerie',
      icon: Image,
      path: '/gallery',
      description: 'Photos & Vidéos'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      description: 'Statistiques'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      path: '/settings',
      description: 'Configuration'
    }
  ];

  const handleNavigation = (item) => {
    if (item.id === 'users') {
      // Rester sur le dashboard principal pour la gestion des utilisateurs
      navigate('/dashboard');
    } else {
      navigate(item.path);
    }
    // Fermer le menu mobile après navigation
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (item) => {
    if (item.id === 'users' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname === item.path;
  };

  const SidebarContent = () => (
    <div className="bg-gray-950 h-full flex flex-col overflow-hidden text-white border-r border-white/5">
      {/* Admin Header Premium */}
      <div className="p-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-black relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tighter uppercase italic">SiteStream</h2>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Admin Control</p>
            </div>
          </div>
          {/* Mobile Close */}
          <button
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Card Admin */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg">
            L
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">Liliana</p>
            <p className="text-[10px] text-gray-400">Propriétaire</p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/50"></div>
        </div>
      </div>

      {/* Navigation Admin Scrollable - Plus compact pour éviter le scroll */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}} />
        
        {/* Section: Analyse */}
        <div>
          <h4 className="px-3 text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Analyse</h4>
          <div className="space-y-0.5">
            {menuItems.slice(0, 1).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 2 }}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${active 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Section: Gestion */}
        <div>
          <h4 className="px-3 text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Gestion</h4>
          <div className="space-y-0.5">
            {menuItems.slice(1, 6).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 2 }}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${active 
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Section: Système */}
        <div>
          <h4 className="px-3 text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Système</h4>
          <div className="space-y-0.5">
            {menuItems.slice(6).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 2 }}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${active 
                    ? 'bg-slate-700 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Logout */}
      <div className="p-4 bg-black/20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSignOut}
          className="w-full flex items-center justify-center space-x-2 py-2 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-red-500/30 transition-all font-bold text-[10px] uppercase tracking-widest"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </motion.button>
      </div>
    </div>
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

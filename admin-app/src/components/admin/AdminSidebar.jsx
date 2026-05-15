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
  Image,
  Crown,
  Gift,
  Video,
  ShieldCheck
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
      path: '/users',
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
      id: 'gifts',
      label: 'Cadeaux',
      icon: Gift,
      path: '/gifts',
      description: 'Codes Transcash & PCS'
    },
    {
      id: 'streaming',
      label: 'Studio Live',
      icon: Video,
      path: '/streaming',
      description: 'Diffuser en direct'
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
      id: 'plans',
      label: 'Abonnements',
      icon: Crown,
      path: '/plans',
      description: 'Gérer les forfaits'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      path: '/settings',
      description: 'Configuration'
    },
    {
      id: 'admin-management',
      label: 'Gestion Admins',
      icon: ShieldCheck,
      path: '/admin-management',
      description: 'Comptes administrateurs'
    }
  ];

  const handleNavigation = (item) => {
    navigate(item.path);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (item) => {
    return location.pathname === item.path;
  };

  const SidebarContent = () => (
    <div className="bg-[#0a0c10] h-full flex flex-col overflow-hidden text-white border-r border-white/5">
      {/* Admin Header Premium - Compact */}
      <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-black relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tighter uppercase italic leading-none">SiteStream</h2>
              <p className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Admin Control</p>
            </div>
          </div>
          {/* Mobile Close */}
          <button
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Card Admin - Compact */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">
            L
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold truncate">Liliana</p>
            <p className="text-[8px] text-gray-500 uppercase font-black">Propriétaire</p>
          </div>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
        </div>
      </div>

      {/* Navigation Admin - Optimized spacing */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-3 custom-scrollbar">
        {/* Section: Analyse */}
        <div>
          <h4 className="px-3 text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Analyse</h4>
          <div className="space-y-0.5">
            {menuItems.slice(0, 1).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 2 }}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg transition-all ${active 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Section: Gestion */}
        <div>
          <h4 className="px-3 text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Gestion</h4>
          <div className="space-y-0.5">
            {menuItems.slice(1, 8).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 2 }}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg transition-all ${active 
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Section: Système */}
        <div>
          <h4 className="px-3 text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Système</h4>
          <div className="space-y-0.5">
            {menuItems.slice(8, 11).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 2 }}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg transition-all ${active 
                    ? 'bg-slate-700 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Section: Administration */}
        <div>
          <h4 className="px-3 text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Administration</h4>
          <div className="space-y-0.5">
            {menuItems.slice(11).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 2 }}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg transition-all ${active 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-indigo-500/10'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Logout - Compact */}
      <div className="p-3 bg-black/40 border-t border-white/5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSignOut}
          className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-red-500/30 transition-all font-black text-[9px] uppercase tracking-widest"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Déconnexion</span>
        </motion.button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-60 bg-gray-950 text-white flex-col h-screen shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-gray-950 text-white flex flex-col z-[110]"
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

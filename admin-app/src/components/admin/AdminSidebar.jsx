import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Settings,
  BarChart3,
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

  const menuGroups = [
    {
      title: 'Dashboard',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' }
      ]
    },
    {
      title: 'Clients',
      items: [
        { id: 'users', label: 'Utilisateurs', icon: Users, path: '/users' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' }
      ]
    },
    {
      title: 'Business',
      items: [
        { id: 'appointments', label: 'Rendez-vous', icon: Calendar, path: '/appointments' },
        { id: 'payments', label: 'Paiements', icon: CreditCard, path: '/payments' },
        { id: 'plans', label: 'Abonnements', icon: Crown, path: '/plans' },
        { id: 'gifts', label: 'Cadeaux', icon: Gift, path: '/gifts' }
      ]
    },
    {
      title: 'Média',
      items: [
        { id: 'streaming', label: 'Studio Live', icon: Video, path: '/streaming' },
        { id: 'gallery', label: 'Galerie', icon: Image, path: '/gallery' }
      ]
    },
    {
      title: 'Système',
      items: [
        { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
        { id: 'admin-management', label: 'Gestion Admins', icon: ShieldCheck, path: '/admin-management' }
      ]
    }
  ];

  const isActive = (item) => {
    if (item.path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (item.path !== '/dashboard' && location.pathname.startsWith(item.path)) return true;
    return false;
  };

  const handleNavigation = (item) => {
    navigate(item.path);
    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-950 border-r border-white/5">
      {/* Header Profile - Premium Style */}
      <div className="p-6 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5 shadow-xl">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-pink-500/20">
              {currentAdmin?.name?.charAt(0) || 'L'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-gray-950 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-white truncate uppercase tracking-tight">{currentAdmin?.name || 'Liliana'}</h3>
            <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Propriétaire</p>
          </div>
        </div>
      </div>

      {/* Navigation Admin - Reorganized Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h4 className="px-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 opacity-50">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                
                const getActiveStyle = () => {
                  switch(group.title) {
                    case 'Dashboard': return 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20';
                    case 'Clients': return 'bg-rose-600 text-white shadow-lg shadow-rose-500/20';
                    case 'Business': return 'bg-amber-600 text-white shadow-lg shadow-amber-500/20';
                    case 'Média': return 'bg-violet-600 text-white shadow-lg shadow-violet-500/20';
                    default: return 'bg-slate-700 text-white shadow-lg';
                  }
                };

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 2 }}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${active 
                      ? getActiveStyle() 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                    <span className={`text-[13px] font-bold tracking-tight ${active ? 'text-white' : 'text-gray-400'}`}>{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Logout - Compact */}
      <div className="p-4 bg-black/40 border-t border-white/5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSignOut}
          className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-rose-600/10 hover:border-rose-500/30 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </motion.button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { 
          width: 4px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 10px; 
          transition: all 0.3s;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #db2777; /* Rose pour le rappel Haute Couture */
        }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-gray-950 text-white flex-col h-screen shrink-0">
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

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Home, Image, MessageSquare, Calendar, Video, CreditCard, User, Heart, Crown, Lock, LogOut, Search, Receipt, Shield } from 'lucide-react';

const ClientSidebar = ({ currentUser, onSignOut, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'overview', label: 'Accueil', icon: Home, path: '/dashboard/overview' },
    { id: 'gallery', label: 'Galerie Premium', icon: Image, path: '/dashboard/gallery' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar, path: '/dashboard/appointments' },
    { id: 'streaming', label: 'Live Stream', icon: Video, vipOnly: true, path: '/dashboard/streaming' },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard, path: '/dashboard/subscription' },
    { id: 'payment-tracking', label: 'Paiements', icon: Search, path: '/dashboard/payment-tracking' },
    { id: 'billing', label: 'Factures', icon: Receipt, path: '/dashboard/billing' },
    { id: 'profile', label: 'Profil', icon: User, path: '/dashboard/profile' }
  ];

  const sub = currentUser?.subscription;
  const currentPlan = (sub?.plan || sub?.type || sub?.planName || 'basic').toLowerCase();
  const isPremium = sub?.status === 'active' && (currentPlan.includes('premium') || currentPlan.includes('vip'));
  const isVIP = sub?.status === 'active' && currentPlan.includes('vip');

  const SidebarContent = () => (
    <div className="bg-white h-full flex flex-col border-r-2 border-gray-200 shadow-[8px_0_15px_-5px_rgba(0,0,0,0.08)] relative z-20">
      {/* Brand Section - Deep Night Indigo */}
      <div className="p-5 bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 text-white shadow-lg relative overflow-hidden border-b border-white/5">
        {/* Subtle decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard/overview')}>
            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <h2 className="text-sm font-black tracking-[0.2em] uppercase">SiteStream</h2>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1.5 text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* User Card - Glassmorphism */}
        <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 relative z-10">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-white/50 overflow-hidden shadow-sm">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-indigo-200" />
              )}
            </div>
            {isPremium && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-slate-800 shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-pulse">
                <Crown size={10} className="text-white fill-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate tracking-tight">{currentUser?.displayName || 'Utilisateur'}</p>
            <div className="flex items-center space-x-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isVIP ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : isPremium ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-gray-400'}`} />
              <p className={`text-[9px] font-black uppercase tracking-widest ${isPremium ? 'text-amber-400' : 'text-indigo-100'}`}>
                {isVIP ? 'VIP ELITE' : isPremium ? 'PREMIUM MEMBER' : 'STANDARD'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Dense */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <h4 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Navigation</h4>
          <div className="space-y-0.5">
            {menuItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (location.pathname === '/dashboard' && item.id === 'overview');
              return (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.path); if (setIsMobileMenuOpen) setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <Icon size={18} />
                  <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Services</h4>
          <div className="space-y-0.5">
            {menuItems.slice(4, 7).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isLocked = item.vipOnly && !isVIP;
              return (
                <button
                  key={item.id}
                  onClick={() => { if (!isLocked) { navigate(item.path); if (setIsMobileMenuOpen) setIsMobileMenuOpen(false); } }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-md' : isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'text-gray-500 hover:bg-indigo-50/50 hover:text-indigo-600 hover:translate-x-1'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                    <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                  </div>
                  {isLocked && <Lock size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Paramètres</h4>
          <div className="space-y-0.5">
            {menuItems.slice(7).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.path); if (setIsMobileMenuOpen) setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 hover:translate-x-1 ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' : 'text-gray-500 hover:bg-indigo-50/50 hover:text-indigo-600'}`}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'} />
                  <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-50">
        <button 
          onClick={onSignOut} 
          className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-lg shadow-red-100 hover:shadow-red-200 hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span className="text-xs font-black uppercase tracking-widest">Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-60 h-full">
        <SidebarContent />
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-60 bg-white">
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ClientSidebar;

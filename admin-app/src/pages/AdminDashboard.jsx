import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Calendar, MessageSquare,
  CreditCard, Activity, ArrowRight, Zap,
  Shield, Clock, CheckCircle, Video, Crown, Image
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { presenceService } from '../services/presenceService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, signOut, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      const adminId = currentUser.id || currentUser.uid;
      presenceService.startPresence(adminId, 'admin');
      return () => presenceService.stopPresence(adminId);
    }
  }, [currentUser]);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadStats();
  }, [currentUser, authLoading]);

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-sm font-medium">Chargement...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAdminStats();
      setStats(data);
    } catch (e) {
      console.error('Erreur chargement stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = stats ? [
    {
      label: 'Total Membres',
      value: stats.total ?? 0,
      icon: Users,
      link: '/users',
      accent: null, // monochrome
    },
    {
      label: 'En Attente',
      value: stats.pending ?? 0,
      icon: Clock,
      link: '/users',
      accent: { border: 'border-l-amber-500/60', icon: 'text-amber-400', num: 'text-amber-300' },
    },
    {
      label: 'Membres Actifs',
      value: stats.active ?? 0,
      icon: CheckCircle,
      link: '/users',
      accent: { border: 'border-l-emerald-500/60', icon: 'text-emerald-400', num: 'text-emerald-300' },
    },
    {
      label: 'Nouveaux (7j)',
      value: stats.recentRegistrations ?? 0,
      icon: TrendingUp,
      link: '/users',
      accent: { border: 'border-l-indigo-500/60', icon: 'text-indigo-400', num: 'text-indigo-300' },
    },
  ] : [];

  const quickActions = [
    { label: 'Utilisateurs',  icon: Users,         path: '/users',         hover: 'hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300' },
    { label: 'Messages',      icon: MessageSquare, path: '/messages',      hover: 'hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-300' },
    { label: 'Rendez-vous',   icon: Calendar,      path: '/appointments',  hover: 'hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300' },
    { label: 'Paiements',     icon: CreditCard,    path: '/payments',      hover: 'hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300' },
    { label: 'Studio Live',   icon: Video,         path: '/streaming',     hover: 'hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-300' },
    { label: 'Galerie',       icon: Image,         path: '/gallery',       hover: 'hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300' },
    { label: 'Abonnements',   icon: Crown,         path: '/plans',         hover: 'hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300' },
    { label: 'Cadeaux',       icon: Zap,           path: '/gifts',         hover: 'hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-300' },
  ];

  const v = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } })
  };

  return (
    <div className="h-screen bg-[#0f172a] flex overflow-hidden">
      <AdminSidebar
        currentAdmin={{ name: 'Liliana' }}
        onSignOut={handleSignOut}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          title="Tableau de Bord"
          subtitle="Vue d'ensemble de l'administration"
          onRefresh={loadStats}
          loading={loading}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

          {/* KPI Cards — monochrome */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                ))
              : kpiCards.map((kpi, i) => {
                  const Icon = kpi.icon;
                  const a = kpi.accent;
                  return (
                    <motion.div
                      key={kpi.label}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={v}
                      onClick={() => navigate(kpi.link)}
                      className={`cursor-pointer bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/10 hover:border-white/15 transition-all duration-200 group ${a ? `border-l-2 ${a.border}` : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-white/8 rounded-xl">
                          <Icon size={15} className={a ? a.icon : 'text-gray-400 group-hover:text-white transition-colors'} />
                        </div>
                        <ArrowRight size={12} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
                      </div>
                      <p className={`text-2xl font-black ${a ? a.num : 'text-white'}`}>{kpi.value}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mt-1">{kpi.label}</p>
                    </motion.div>
                  );
                })
            }
          </div>

          {/* Quick Actions — monochrome grid */}
          <div>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3 px-1">Accès Rapides</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={v}
                    onClick={() => navigate(action.path)}
                    className={`flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-gray-400 transition-all duration-200 ${action.hover}`}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="text-[12px] font-semibold">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Brand footer card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 border border-white/8 rounded-2xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Plateforme Haute Couture</p>
              <h2 className="text-lg font-black text-white">SiteStream — Admin Control</h2>
              <p className="text-xs text-gray-600 mt-1">Données synchronisées en temps réel via Firebase.</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="p-4 bg-white/5 border border-white/8 rounded-2xl">
                <Shield size={24} className="text-gray-500" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

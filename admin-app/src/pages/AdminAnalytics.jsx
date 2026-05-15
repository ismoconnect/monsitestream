import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, Calendar, MessageSquare,
  CreditCard, Activity, ArrowUp, ArrowDown, Eye, Zap,
  Clock, CheckCircle, XCircle, Crown, Menu
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, signOut } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
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
      console.error('Erreur stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } })
  };

  const total = stats?.total || 0;
  const active = stats?.active || 0;
  const pending = stats?.pending || 0;
  const suspended = stats?.suspended || 0;
  const rejected = stats?.rejected || 0;
  const recent = stats?.recentRegistrations || 0;

  const conversionRate = total > 0 ? Math.round((active / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;

  const planBreakdown = [
    { label: 'Standard', value: Math.max(0, active - Math.floor(active * 0.4)), color: 'bg-slate-400', pct: 60 },
    { label: 'Premium', value: Math.floor(active * 0.28), color: 'bg-indigo-500', pct: 28 },
    { label: 'VIP', value: Math.floor(active * 0.12), color: 'bg-amber-400', pct: 12 },
  ];

  const statusMetrics = [
    { label: 'Actifs', value: active, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'En attente', value: pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Suspendus', value: suspended, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Rejetés', value: rejected, icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
  ];

  return (
    <div className="h-screen bg-[#0f172a] flex overflow-hidden">
      <AdminSidebar
        currentAdmin={{ name: 'Liliana' }}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onSignOut={signOut}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          title="Analytics"
          subtitle="Statistiques et indicateurs de performance de la plateforme"
          onRefresh={loadStats}
          loading={loading}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

          {/* Top KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Membres', value: total, icon: Users, gradient: 'from-indigo-600 to-indigo-800', delta: `+${recent} ce mois`, up: true },
              { label: 'Taux d\'Activation', value: `${conversionRate}%`, icon: Activity, gradient: 'from-emerald-500 to-green-700', delta: 'membres actifs', up: true },
              { label: 'En Attente', value: pending, icon: Clock, gradient: 'from-amber-500 to-orange-600', delta: `${pendingRate}% du total`, up: false },
              { label: 'Nouveaux (7j)', value: recent, icon: TrendingUp, gradient: 'from-pink-500 to-rose-700', delta: 'inscriptions récentes', up: true },
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <motion.div key={kpi.label} custom={i} initial="hidden" animate="visible" variants={cardVariants}
                  className={`bg-gradient-to-br ${kpi.gradient} rounded-2xl p-5 shadow-xl`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-white/20 rounded-xl"><Icon size={16} className="text-white" /></div>
                    {kpi.up ? <ArrowUp size={14} className="text-white/70" /> : <ArrowDown size={14} className="text-white/70" />}
                  </div>
                  <p className="text-3xl font-black text-white">{loading ? '—' : kpi.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/70 mt-1">{kpi.label}</p>
                  <p className="text-[9px] text-white/50 mt-1">{kpi.delta}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Répartition des statuts */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Répartition des Statuts</h3>
              <div className="space-y-3">
                {statusMetrics.map((m) => {
                  const Icon = m.icon;
                  const pct = total > 0 ? Math.round((m.value / total) * 100) : 0;
                  return (
                    <div key={m.label} className={`flex items-center gap-4 p-3 rounded-xl border ${m.bg}`}>
                      <Icon size={16} className={m.color} />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${m.color}`}>{m.label}</span>
                          <span className="text-[10px] font-black text-white">{loading ? '—' : m.value}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className={`h-full rounded-full ${m.color.replace('text-', 'bg-')}`}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-gray-500 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Répartition des plans */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Répartition des Plans</h3>
              <div className="space-y-3">
                {planBreakdown.map((plan) => (
                  <div key={plan.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider">{plan.label}</span>
                      <span className="text-[10px] font-black text-white">{plan.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${plan.pct}%` }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className={`h-full rounded-full ${plan.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-3 gap-3">
                {planBreakdown.map((plan) => (
                  <div key={plan.label} className="text-center">
                    <div className={`w-3 h-3 rounded-full ${plan.color} mx-auto mb-1`} />
                    <p className="text-[9px] font-black text-gray-400 uppercase">{plan.label}</p>
                    <p className="text-lg font-black text-white">{loading ? '—' : plan.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Résumé */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-pink-900/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Indicateur Clé</p>
              <p className="text-2xl font-black text-white">{conversionRate}% de conversion</p>
              <p className="text-xs text-gray-400 mt-1">{active} membres actifs sur {total} inscrits</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hidden md:block">
              <BarChart3 size={28} className="text-indigo-400" />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

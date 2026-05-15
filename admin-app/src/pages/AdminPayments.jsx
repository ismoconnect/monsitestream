import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  User,
  RefreshCw,
  Euro,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Wallet
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { paymentService, PAYMENT_STATUS } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';

const AdminPayments = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, signOut } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userPaymentStats, setUserPaymentStats] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  const loadData = () => {
    setLoading(true);
    // Simuler un rechargement si nécessaire, le listener s'occupe du reste
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    if (authLoading || !currentUser || currentUser.role !== 'admin') return;

    const unsubscribe = paymentService.listenToAllPayments(
      (paymentsData) => {
        setPayments(paymentsData);

        const userStats = {};
        paymentsData.forEach(payment => {
          const userEmail = payment.userEmail;
          if (!userStats[userEmail]) {
            userStats[userEmail] = {
              email: userEmail,
              userId: payment.userId,
              totalPayments: 0,
              totalAmount: 0,
              pending: 0,
              waitingPayment: 0,
              validating: 0,
              completed: 0,
              rejected: 0,
              expired: 0,
              lastPaymentDate: null,
              plans: new Set()
            };
          }

          const stats = userStats[userEmail];
          stats.totalPayments++;
          stats.totalAmount += payment.amount || 0;
          const statusKey = payment.status.replace('-', '');
          if (stats[statusKey] !== undefined) stats[statusKey]++;
          stats.plans.add(payment.plan?.name);

          const paymentDate = payment.createdAt?.toDate ? payment.createdAt.toDate() : new Date(payment.createdAt);
          if (!stats.lastPaymentDate || paymentDate > stats.lastPaymentDate) {
            stats.lastPaymentDate = paymentDate;
          }
        });

        const statsArray = Object.values(userStats).map(stats => ({
          ...stats,
          plans: Array.from(stats.plans)
        })).sort((a, b) => (b.lastPaymentDate || 0) - (a.lastPaymentDate || 0));

        setUserPaymentStats(statsArray);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur chargement paiements:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authLoading, currentUser]);

  const globalStats = useMemo(() => {
    return {
      totalRevenue: payments.filter(p => p.status === PAYMENT_STATUS.COMPLETED).reduce((sum, p) => sum + (p.amount || 0), 0),
      totalUsers: userPaymentStats.length,
      pendingValidation: payments.filter(p => p.status === PAYMENT_STATUS.VALIDATING).length,
      completedCount: payments.filter(p => p.status === PAYMENT_STATUS.COMPLETED).length
    };
  }, [payments, userPaymentStats]);

  const getStatusBadge = (status, count) => {
    if (count <= 0) return null;
    
    const configs = {
      pending: { label: 'En attente', dot: 'bg-amber-400', classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
      waitingPayment: { label: 'Attente paiement', dot: 'bg-blue-400', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
      validating: { label: 'En validation', dot: 'bg-indigo-400', classes: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
      completed: { label: 'Terminé', dot: 'bg-emerald-400', classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
      rejected: { label: 'Rejeté', dot: 'bg-rose-400', classes: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
    };

    const config = configs[status] || configs.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${config.classes}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {count} {config.label}{count > 1 ? 's' : ''}
      </span>
    );
  };

  return (
    <div className="h-screen bg-[#0f172a] flex overflow-hidden font-sans text-slate-200">
      <AdminSidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        onSignOut={signOut}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
        </div>

        <AdminHeader 
          title="Gestion des Paiements" 
          onRefresh={loadData}
          loading={loading}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-8 relative z-10">
          {/* 💎 STATS DASHBOARD */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Revenu Total', value: `${globalStats.totalRevenue}€`, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { title: 'Clients Actifs', value: globalStats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { title: 'À Valider', value: globalStats.pendingValidation, icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
              { title: 'Transactions', value: globalStats.completedCount, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
            ].map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 flex items-center gap-5 shadow-2xl hover:bg-white/10 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${s.border} ${s.bg} shadow-lg group-hover:scale-110 transition-transform`}>
                  <s.icon className={`w-7 h-7 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.title}</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 🔍 FILTERS & SEARCH */}
          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white/5 backdrop-blur-md p-2 rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="flex overflow-x-auto w-full xl:w-auto hide-scrollbar gap-1 p-1">
              {[
                { id: 'all', label: 'Tous' },
                { id: PAYMENT_STATUS.VALIDATING, label: 'En Validation' },
                { id: PAYMENT_STATUS.WAITING_PAYMENT, label: 'En Attente' },
                { id: PAYMENT_STATUS.COMPLETED, label: 'Terminés' },
                { id: PAYMENT_STATUS.REJECTED, label: 'Rejetés' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    statusFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative w-full xl:w-80 px-2 xl:px-0 pb-2 xl:pb-0 pr-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-xs font-bold text-white focus:bg-white/10 focus:border-indigo-500 transition-all placeholder:text-slate-600 shadow-inner"
              />
            </div>
          </div>

          {/* 👥 USERS GRID */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Chargement des données...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {userPaymentStats
                  .filter(userStats => {
                    if (searchTerm) {
                      return userStats.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        userStats.plans.some(plan => plan?.toLowerCase().includes(searchTerm.toLowerCase()));
                    }
                    return true;
                  })
                  .filter(userStats => {
                    if (statusFilter !== 'all') {
                      return userStats[statusFilter.replace('-', '')] > 0;
                    }
                    return true;
                  })
                  .map((userStats, index) => (
                    <motion.div
                      key={userStats.email}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/5 backdrop-blur-sm rounded-[2.5rem] border border-white/10 overflow-hidden hover:bg-white/10 transition-all group flex flex-col shadow-xl"
                    >
                      {/* Premium Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                            <User className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-white text-sm uppercase tracking-tight truncate">{userStats.email.split('@')[0]}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{userStats.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Payé</p>
                            <p className="text-lg font-black text-white">{userStats.totalAmount}€</p>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Transactions</p>
                            <p className="text-lg font-black text-white">{userStats.totalPayments}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {getStatusBadge('pending', userStats.pending)}
                          {getStatusBadge('waitingPayment', userStats.waitingPayment)}
                          {getStatusBadge('validating', userStats.validating)}
                          {getStatusBadge('completed', userStats.completed)}
                          {getStatusBadge('rejected', userStats.rejected)}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <ShieldCheck className="w-3 h-3" /> Plans Souscrits
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {userStats.plans.map((plan, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-white/5 text-white/70 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/10">
                                  {plan}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between py-3 border-t border-white/5">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                              Dernière activité
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {userStats.lastPaymentDate?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Zone */}
                      <div className="p-4 bg-white/5 border-t border-white/5">
                        <button
                          onClick={() => navigate(`/payments/${encodeURIComponent(userStats.email)}`)}
                          className="w-full bg-indigo-600 text-white py-4 px-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 group-hover:bg-indigo-500"
                        >
                          Gérer le Dossier
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          )}

          {/* 📭 EMPTY STATE */}
          {!loading && userPaymentStats.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Wallet className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Aucun dossier trouvé</h3>
              <p className="text-slate-500 text-sm font-medium">
                {searchTerm || statusFilter !== 'all'
                  ? 'Modifiez vos critères de recherche pour trouver un client.'
                  : 'Aucune transaction n\'a été enregistrée pour le moment.'
                }
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPayments;
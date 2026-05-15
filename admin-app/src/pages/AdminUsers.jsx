import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, CheckCircle, XCircle, Crown, Shield, Diamond, Eye,
  Pause, Play, Search, AlertTriangle, TrendingUp, X
} from 'lucide-react';
import { adminService } from '../services/adminService';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, onSnapshot, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { presenceService } from '../services/presenceService';
import { planService } from '../services/planService';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { currentUser, signOut, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      const adminId = currentUser.id || currentUser.uid;
      presenceService.startPresence(adminId, 'admin');
      return () => presenceService.stopPresence(adminId);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = planService.onPlansSnapshot((fetchedPlans) => {
      const uniquePlans = [];
      const seenIds = new Set();
      fetchedPlans.forEach(plan => {
        if (['basic', 'premium', 'vip'].includes(plan.id) && !seenIds.has(plan.id)) {
          uniquePlans.push(plan);
          seenIds.add(plan.id);
        }
      });
      setPlans(uniquePlans);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const userRef = doc(db, 'users', selectedUser.id);
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        try {
          const aptsRef = collection(db, 'users', selectedUser.id, 'appointments');
          const aptsSnap = await getCountFromServer(aptsRef);
          
          const convsRef = collection(db, 'conversations');
          const convsQuery = query(convsRef, where('participants', 'array-contains', selectedUser.id));
          const convsSnap = await getCountFromServer(convsQuery);

          setSelectedUser({ 
            id: docSnap.id, 
            ...data,
            realStats: { appointments: aptsSnap.data().count, messages: convsSnap.data().count }
          });
        } catch (error) {
          console.error("Erreur calcul stats réelles:", error);
          setSelectedUser({ id: docSnap.id, ...data });
        }
      }
    });
    return () => unsubscribe();
  }, [selectedUser?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadData();
  }, [activeTab, currentUser, authLoading]);

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-sm font-medium">Vérification de la session admin...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        activeTab === 'pending'
          ? adminService.getPendingSubscriptions()
          : adminService.getAllUsers({ status: activeTab === 'all' ? null : activeTab }),
        adminService.getAdminStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAccount = async (userId) => {
    setActionLoading(true);
    try {
      await adminService.validateAccount(userId, currentUser.uid);
      await loadData();
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la validation du compte');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubscription = async (userId) => {
    const reason = prompt('Raison du rejet (optionnel):');
    if (reason === null) return;
    setActionLoading(true);
    try {
      await adminService.rejectSubscription(userId, currentUser.uid, reason);
      await loadData();
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      alert('Erreur lors du rejet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    const reason = prompt('Raison de la suspension:');
    if (!reason) return;
    setActionLoading(true);
    try {
      await adminService.suspendUser(userId, currentUser.uid, reason);
      await loadData();
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la suspension');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePlan = async (userId, planId) => {
    const plan = plans.find(p => p.id === planId) || { name: planId, id: planId };
    if (!window.confirm(`Passer cet utilisateur au plan ${plan.name} ?`)) return;
    setActionLoading(true);
    try {
      await adminService.changeUserPlan(userId, currentUser.uid, planId);
    } catch (error) {
      console.error(error);
      alert('Erreur changement plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminService.reactivateUser(userId, currentUser.uid);
      await loadData();
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      alert('Erreur réactivation');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      suspended: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      rejected: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const getPlanIcon = (subscription) => {
    const plan = subscription?.plan || subscription?.type || (subscription?.planName?.toLowerCase().includes('vip') ? 'vip' : subscription?.planName?.toLowerCase().includes('premium') ? 'premium' : 'basic');
    const icons = { basic: Shield, premium: Crown, vip: Diamond };
    return icons[plan] || Shield;
  };

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'all', label: 'Tous', icon: Users, count: stats?.total || 0 },
    { id: 'pending', label: 'En attente', icon: Clock, count: stats?.pending || 0 },
    { id: 'active', label: 'Actifs', icon: CheckCircle, count: stats?.active || 0 },
    { id: 'suspended', label: 'Suspendus', icon: Pause, count: stats?.suspended || 0 },
    { id: 'rejected', label: 'Rejetés', icon: XCircle, count: stats?.rejected || 0 },
  ];

  const v = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } })
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
          title="Gestion des Utilisateurs" 
          subtitle="Administration des comptes et abonnements"
          onRefresh={loadData}
          loading={loading}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">
          
          {/* Stats Cards - Monochrome dark */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Total Utilisateurs', value: stats.total, icon: Users, accent: null },
                { label: 'En Attente', value: stats.pending, icon: Clock, accent: { border: 'border-l-amber-500/60', icon: 'text-amber-400', num: 'text-amber-300' } },
                { label: 'Actifs', value: stats.active, icon: CheckCircle, accent: { border: 'border-l-emerald-500/60', icon: 'text-emerald-400', num: 'text-emerald-300' } },
                { label: 'Inscriptions 7j', value: stats.recentRegistrations, icon: TrendingUp, accent: { border: 'border-l-indigo-500/60', icon: 'text-indigo-400', num: 'text-indigo-300' } },
              ].map((kpi, i) => {
                const Icon = kpi.icon;
                const a = kpi.accent;
                return (
                  <motion.div key={kpi.label} custom={i} initial="hidden" animate="visible" variants={v}
                    className={`bg-white/5 border border-white/8 rounded-2xl p-5 ${a ? `border-l-2 ${a.border}` : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-white/8 rounded-xl"><Icon size={15} className={a ? a.icon : 'text-gray-400'} /></div>
                    </div>
                    <p className={`text-2xl font-black ${a ? a.num : 'text-white'}`}>{kpi.value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">{kpi.label}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Filters & Search */}
          <div className="bg-white/5 border border-white/8 rounded-2xl flex flex-col md:flex-row items-center justify-between p-2 gap-2">
            
            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                    <Icon size={14} />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden w-full px-2 pt-2">
               <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}
                 className="w-full bg-white/10 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500">
                 {tabs.map(t => <option key={t.id} value={t.id} className="bg-slate-800">{t.label} ({t.count})</option>)}
               </select>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64 px-2 pb-2 md:pb-0 md:px-0 md:pr-2 shrink-0">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
              ))
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-10 text-center">
                <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              filteredUsers.map((user, i) => {
                const PlanIcon = getPlanIcon(user.subscription?.plan);
                return (
                  <motion.div key={user.id} custom={i} initial="hidden" animate="visible" variants={v}
                    className="flex flex-col lg:flex-row items-start lg:items-center gap-4 bg-white/5 border border-white/8 rounded-2xl p-4 lg:p-5 hover:bg-white/10 transition-all">
                    
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-300 font-black text-lg shrink-0">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="font-bold text-white text-sm truncate">{user.displayName}</h3>
                          <div className="flex items-center gap-1">
                            {plans.map((p) => (
                              <button key={p.id} onClick={(e) => { e.stopPropagation(); handleUpdatePlan(user.id, p.id); }}
                                disabled={actionLoading || (user.subscription?.plan === p.id)}
                                className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                  user.subscription?.plan === p.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10'
                                }`}>
                                {p.name.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-1">{user.email}</p>
                        <div className="flex items-center gap-3 text-[10px] font-medium text-gray-600">
                          <span>Inscrit le {user.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                      <span className={`px-2.5 py-1 border rounded-md text-[10px] font-black uppercase tracking-widest ${getStatusColor(user.subscription?.status)}`}>
                        {user.subscription?.status === 'pending' ? 'En attente' :
                         user.subscription?.status === 'active' ? 'Actif' :
                         user.subscription?.status === 'suspended' ? 'Suspendu' :
                         user.subscription?.status === 'rejected' ? 'Rejeté' : 'Inconnu'}
                      </span>

                      <button onClick={() => setSelectedUser(user)} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Voir détails">
                        <Eye size={16} />
                      </button>

                      {user.subscription?.status === 'pending' && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleValidateAccount(user.id)} disabled={actionLoading}
                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50" title="Valider">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleRejectSubscription(user.id)} disabled={actionLoading}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50" title="Rejeter">
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}

                      {user.subscription?.status === 'active' && (
                        <button onClick={() => handleSuspendUser(user.id)} disabled={actionLoading}
                          className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all disabled:opacity-50" title="Suspendre">
                          <Pause size={16} />
                        </button>
                      )}

                      {user.subscription?.status === 'suspended' && (
                        <button onClick={() => handleReactivateUser(user.id)} disabled={actionLoading}
                          className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50" title="Réactiver">
                          <Play size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-white/8 flex items-center justify-between sticky top-0 bg-[#0f172a]/90 backdrop-blur z-10">
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Dossier Client</p>
                  <h2 className="text-xl font-black text-white">Détails Utilisateur</h2>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Info */}
                  <div>
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Users size={12}/> Profil</h3>
                    <div className="bg-white/5 border border-white/8 rounded-xl p-4 space-y-3">
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Nom</p>
                        <p className="text-white font-bold text-sm">{selectedUser.displayName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Email</p>
                        <p className="text-gray-300 text-sm truncate">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Téléphone</p>
                        <p className="text-gray-300 text-sm">{selectedUser.phone || selectedUser.phoneNumber || selectedUser.profile?.phone || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp size={12}/> Activité</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                        <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Rendez-vous</p>
                        <p className="text-xl font-black text-indigo-400">{selectedUser.realStats?.appointments ?? selectedUser.stats?.appointments ?? 0}</p>
                      </div>
                      <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                        <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Messages</p>
                        <p className="text-xl font-black text-pink-400">{selectedUser.realStats?.messages ?? selectedUser.stats?.messages ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Abonnement Actuel */}
                  <div>
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Crown size={12}/> Abonnement</h3>
                    <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30 shrink-0">
                        <Crown size={20} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-indigo-300 uppercase tracking-wider">
                          {selectedUser.subscription?.planName || selectedUser.subscription?.plan || 'Standard'}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 border rounded-md text-[8px] font-black uppercase tracking-widest ${getStatusColor(selectedUser.subscription?.status)}`}>
                          {selectedUser.subscription?.status || 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Plan */}
                  <div>
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Changer le Niveau</h3>
                    <div className="bg-white/5 border border-white/8 rounded-xl p-3 space-y-2">
                      {plans.map((plan) => {
                        const isCurrent = selectedUser.subscription?.plan === plan.id;
                        return (
                          <button
                            key={plan.id}
                            onClick={() => handleUpdatePlan(selectedUser.id, plan.id)}
                            disabled={actionLoading || isCurrent}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              isCurrent 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <span>{plan.name}</span>
                            {isCurrent && <CheckCircle size={14} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;

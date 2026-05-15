import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { 
  Gift, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Copy,
  Menu,
  RefreshCw,
  TrendingUp,
  Zap,
  Sparkles,
  Shield,
  CreditCard,
  History,
  Trash2,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Check,
  X,
  Mail,
  User,
  Eye
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { adminChatService } from '../services/adminChatService';

const AdminGifts = () => {
  const { currentUser, loading: authLoading, signOut } = useAuth();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'gifts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const giftsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGifts(giftsData);
      setLoading(false);
    }, (error) => {
      console.error('Erreur listenToGifts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (giftId, newStatus) => {
    setActionLoading(giftId);
    try {
      const gift = gifts.find(g => g.id === giftId);
      if (!gift) return;

      await updateDoc(doc(db, 'gifts', giftId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      let message = "";
      if (newStatus === 'validated') {
        message = `✅ Ton cadeau ${gift.voucherType} a été validé ! Merci beaucoup pour ton soutien ! 😍💎`;
      } else if (newStatus === 'rejected') {
        const reason = prompt('Raison du rejet (optionnel) :');
        message = `❌ Désolée, ton code ${gift.voucherType} n'a pas pu être validé.${reason ? ` Raison : ${reason}` : " Peux-tu vérifier les chiffres et me le renvoyer ? 😕"}`;
      }

      if (message && gift.userId) {
        await adminChatService.sendAutomatedMessage(gift.userId, gift.userName, message);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteGift = async (giftId) => {
    if (!window.confirm('Supprimer définitivement cet enregistrement ?')) return;
    try {
      await deleteDoc(doc(db, 'gifts', giftId));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const filteredGifts = useMemo(() => {
    return gifts.filter(gift => {
      const matchesSearch = 
        gift.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.voucherType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || gift.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [gifts, searchTerm, filterStatus]);

  const stats = useMemo(() => ({
    total: gifts.length,
    pending: gifts.filter(g => g.status === 'pending').length,
    validated: gifts.filter(g => g.status === 'validated').length,
    rejected: gifts.filter(g => g.status === 'rejected').length
  }), [gifts]);

  const [expandedUsers, setExpandedUsers] = useState({});

  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const groupedGifts = useMemo(() => {
    const groups = {};
    filteredGifts.forEach(gift => {
      const key = gift.userId || gift.userEmail || 'anonymous';
      if (!groups[key]) {
        groups[key] = {
          userId: gift.userId,
          userName: gift.userName || 'Utilisateur Inconnu',
          userEmail: gift.userEmail,
          gifts: [],
          stats: { total: 0, pending: 0, validated: 0, rejected: 0 }
        };
      }
      groups[key].gifts.push(gift);
      groups[key].stats.total++;
      if (gift.status === 'pending') groups[key].stats.pending++;
      if (gift.status === 'validated') groups[key].stats.validated++;
      if (gift.status === 'rejected') groups[key].stats.rejected++;
    });
    return Object.values(groups).sort((a, b) => b.stats.pending - a.stats.pending || b.stats.total - a.stats.total);
  }, [filteredGifts]);

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Accès au Coffre-Fort...</p>
      </div>
    );
  }

  const GiftCard = ({ gift, index }) => {
    const isPending = gift.status === 'pending';
    const isValidated = gift.status === 'validated';
    const isRejected = gift.status === 'rejected';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        className="bg-white/5 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/8 shadow-sm hover:bg-white/10 transition-all group relative overflow-hidden"
      >
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-lg border ${
              gift.voucherType === 'Transcash' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
              gift.voucherType === 'PCS' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
              'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
            }`}>
              <Gift size={20} />
            </div>
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">{gift.voucherType}</h3>
               <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                 isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                 isValidated ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                 'bg-rose-500/10 text-rose-400 border-rose-500/20'
               }`}>
                 {isPending ? 'En attente' : isValidated ? 'Validé' : 'Refusé'}
               </span>
            </div>
          </div>
          <div className="text-right">
             <div className="flex items-center gap-1.5 justify-end text-white/40">
                <Clock size={10} />
                <p className="text-[9px] font-bold">
                  {gift.createdAt?.toDate ? gift.createdAt.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '...'}
                </p>
             </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-6 flex items-center justify-between group-hover:bg-white/10 transition-colors">
          <code className="text-sm font-black text-indigo-400 tracking-[0.3em] truncate block select-all">
            {gift.code}
          </code>
          <button 
            onClick={() => copyToClipboard(gift.code)}
            className="p-2 text-indigo-400 hover:text-white transition-all shrink-0 ml-2 group/copy"
          >
            <Copy size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/5">
          <div className="flex gap-2">
            {isPending && (
              <>
                <button 
                  onClick={() => handleUpdateStatus(gift.id, 'validated')}
                  disabled={actionLoading === gift.id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-1.5"
                >
                  {actionLoading === gift.id ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                  Valider
                </button>
                <button 
                  onClick={() => handleUpdateStatus(gift.id, 'rejected')}
                  disabled={actionLoading === gift.id}
                  className="px-4 py-2 bg-white/5 border border-rose-500/20 text-rose-400 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <X size={12} />
                  Refuser
                </button>
              </>
            )}
            {!isPending && (
              <button 
                onClick={() => handleUpdateStatus(gift.id, 'pending')}
                className="px-3 py-1.5 bg-white/5 text-slate-500 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
              >
                Reset
              </button>
            )}
          </div>
          
          <button 
            onClick={() => handleDeleteGift(gift.id)}
            className="p-2 text-slate-700 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      <AdminSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onSignOut={signOut}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-rose-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Header Section */}
        <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 p-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5"
              >
                <Menu className="w-6 h-6 text-slate-400" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Flux de Soutien</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                  Coffre-Fort Cadeaux
                </h1>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center flex-1 max-w-3xl justify-end">
               <div className="relative flex-1 w-full md:w-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filtrer par code ou utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:bg-white/10 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all placeholder:text-slate-600"
                  />
               </div>
               <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter size={14} className="text-slate-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 md:w-48 bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-rose-500/20 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#1a2133]">Tous les statuts</option>
                    <option value="pending" className="bg-[#1a2133]">En attente</option>
                    <option value="validated" className="bg-[#1a2133]">Validés</option>
                    <option value="rejected" className="bg-[#1a2133]">Refusés</option>
                  </select>
               </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-10 space-y-10 relative z-10">
          
          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
             {[
               { label: 'Total Reçus', value: stats.total, icon: Gift, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
               { label: 'En Attente', value: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
               { label: 'Validés', value: stats.validated, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
               { label: 'Refusés', value: stats.rejected, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
             ].map((stat, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 lg:p-8 border border-white/10 flex flex-col items-center text-center group hover:bg-white/10 transition-all"
               >
                 <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform`}>
                   <stat.icon size={24} />
                 </div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                 <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
               </motion.div>
             ))}
          </div>

          {/* Grouped List Section */}
          <section className="space-y-8">
             <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-rose-400" />
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Registre par Utilisateur</h2>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {groupedGifts.length} donateurs identifiés
                </div>
             </div>

             {loading ? (
                <div className="py-32 flex flex-col items-center">
                   <RefreshCw className="w-12 h-12 text-rose-500 animate-spin mb-6" />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Synchronisation du registre...</p>
                </div>
             ) : (
                <div className="space-y-6">
                   <AnimatePresence mode="popLayout">
                      {groupedGifts.length === 0 ? (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-32 flex flex-col items-center text-center bg-white/5 rounded-[3.5rem] border border-dashed border-white/10"
                        >
                          <Gift size={64} className="text-slate-800 mb-6" />
                          <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Le coffre est vide</h3>
                          <p className="text-sm text-slate-600 mt-2">Aucun code ne correspond à vos critères.</p>
                        </motion.div>
                      ) : (
                        groupedGifts.map((group) => (
                          <motion.div 
                            key={group.userId || group.userEmail}
                            layout
                            className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden"
                          >
                            <div className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-2xl shadow-xl">
                                  <User className="text-white/60" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{group.userName}</h3>
                                  <p className="text-xs font-bold text-slate-500 truncate max-w-xs">{group.userEmail}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                  <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-center min-w-[80px]">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-lg font-black text-white">{group.stats.total}</p>
                                  </div>
                                  {group.stats.pending > 0 && (
                                    <div className="bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 text-center min-w-[80px]">
                                      <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Attente</p>
                                      <p className="text-lg font-black text-amber-400">{group.stats.pending}</p>
                                    </div>
                                  )}
                                </div>

                                <button 
                                  onClick={() => toggleUserExpansion(group.userId || group.userEmail)}
                                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                    expandedUsers[group.userId || group.userEmail] 
                                      ? 'bg-white text-[#0f172a] shadow-xl' 
                                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                  }`}
                                >
                                  {expandedUsers[group.userId || group.userEmail] ? (
                                    <>
                                      <History size={16} />
                                      Masquer
                                    </>
                                  ) : (
                                    <>
                                      <Eye size={16} />
                                      Détails
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            <AnimatePresence>
                              {expandedUsers[group.userId || group.userEmail] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-white/5 bg-black/20"
                                >
                                  <div className="p-6 lg:p-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {group.gifts.map((gift, idx) => (
                                      <GiftCard key={gift.id} gift={gift} index={idx} />
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))
                      )}
                   </AnimatePresence>
                </div>
             )}
          </section>
        </main>
      </div>
    </div>
  );
};


export default AdminGifts;


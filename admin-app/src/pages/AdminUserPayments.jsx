import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CreditCard,
  Search,
  Check,
  X,
  Clock,
  AlertCircle,
  Mail,
  Copy,
  RefreshCw,
  Calendar,
  Euro,
  Gift,
  Banknote,
  Ticket,
  CheckCircle,
  XCircle,
  Menu,
  Trash2,
  Shield,
  Crown,
  Diamond,
  Gem,
  Edit,
  Save,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Info,
  Coins,
  BatteryCharging,
  History,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { paymentService, PAYMENT_STATUS } from '../services/paymentService';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { adminChatService } from '../services/adminChatService';

const AdminUserPayments = () => {
  const { userEmail } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, signOut } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Hook 22: First useEffect
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  // Hook 23: Second useEffect
  useEffect(() => {
    if (authLoading || !currentUser || currentUser.role !== 'admin' || !userEmail) return;

    let unsubscribe;

    const setupListener = async () => {
      try {
        setLoading(true);
        const allPayments = await paymentService.getAllPayments();
        const userPayment = (allPayments || []).find(p => p.userEmail === decodeURIComponent(userEmail));

        if (userPayment?.userId) {
          unsubscribe = paymentService.listenToUserPayments(userPayment.userId, (userPayments) => {
            setPayments(userPayments || []);
            setLoading(false);
          });

          const users = await adminService.getAllUsers();
          const user = (users || []).find(u => u.id === userPayment.userId);
          setUserData(user || null);
          setUserLoading(false);
        } else {
          setLoading(false);
          setUserLoading(false);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setLoading(false);
        setUserLoading(false);
      }
    };

    setupListener();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [userEmail, authLoading, currentUser]);

  const handleApprovePayment = async (paymentId) => {
    setActionLoading(true);
    try {
      const payment = (payments || []).find(p => p.id === paymentId);
      await paymentService.approvePayment(paymentId, 'Approuvé via interface admin');
      
      if (payment) {
        const msg = `🌟 Félicitations ! Ton abonnement ${payment.plan?.name || 'Elite'} est maintenant ACTIF ! Tu as désormais accès à tous mes contenus exclusifs. 😍💎`;
        await adminChatService.sendAutomatedMessage(payment.userId, payment.userName || userData?.displayName, msg);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'approbation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt('Raison du rejet (ex: Code invalide) :');
    if (reason === null) return;
    setActionLoading(true);
    try {
      const payment = (payments || []).find(p => p.id === paymentId);
      await paymentService.rejectPayment(paymentId, reason || 'Paiement rejeté');
      
      if (payment) {
        const msg = `❌ Ton paiement pour le plan ${payment.plan?.name || 'Elite'} n'a pas pu être validé. ${reason ? `Raison : ${reason}` : "Vérifie tes informations et réessaie."}`;
        await adminChatService.sendAutomatedMessage(payment.userId, payment.userName || userData?.displayName, msg);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePlan = async (newPlan) => {
    if (!userData || !currentUser) return;
    if (!window.confirm(`Confirmer le passage manuel au plan ${newPlan.toUpperCase()} ?`)) return;

    setActionLoading(true);
    try {
      await adminService.changeUserPlan(userData.id, currentUser.uid, newPlan);
      setUserData(prev => prev ? ({
        ...prev,
        subscription: { ...prev.subscription, plan: newPlan, status: 'active' }
      }) : null);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefillCredits = async () => {
    if (!userData) return;
    const plan = userData?.subscription?.plan || userData?.subscription?.type || 'basic';
    const credits = plan === 'vip' ? 999999 : plan === 'premium' ? 1000 : 50;
    if (!window.confirm(`Recharger les crédits de cet utilisateur ? (${credits} crédits pour le plan ${plan.toUpperCase()})`)) return;

    setActionLoading(true);
    try {
      await adminService.refillUserCredits(userData.id, plan);
      alert(`✅ Crédits rechargés avec succès ! (${credits} crédits)`);
    } catch (error) {
      console.error('Erreur recharge crédits:', error);
      alert('Erreur lors de la recharge des crédits');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Supprimer définitivement cet enregistrement ?')) return;
    setActionLoading(true);
    try {
      await paymentService.deletePayment(paymentId);
      setShowModal(false);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case PAYMENT_STATUS.COMPLETED: return { label: 'Terminé', dot: 'bg-emerald-400', classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case PAYMENT_STATUS.REJECTED: return { label: 'Rejeté', dot: 'bg-rose-400', classes: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case PAYMENT_STATUS.VALIDATING: return { label: 'En Validation', dot: 'bg-amber-400', classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case PAYMENT_STATUS.PENDING: return { label: 'En Attente', dot: 'bg-blue-400', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      default: return { label: 'Inconnu', dot: 'bg-gray-400', classes: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
    }
  };

  const safePayments = payments || [];

  const userStats = {
    total: safePayments.length,
    amount: safePayments.reduce((sum, p) => sum + (p.amount || 0), 0),
    validating: safePayments.filter(p => p?.status === PAYMENT_STATUS.VALIDATING).length,
    completed: safePayments.filter(p => p?.status === PAYMENT_STATUS.COMPLETED).length
  };


  const currentPlan = userData?.subscription?.plan || userData?.subscription?.type || 'basic';

  const PaymentCard = ({ payment }) => {
    const statusConf = getStatusConfig(payment.status);
    const isGiftCard = payment.type === 'gift_card';

    return (
      <motion.div
        layout
        whileHover={{ y: -4 }}
        className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10 shadow-xl hover:bg-white/10 transition-all cursor-pointer group"
        onClick={() => { setSelectedPayment(payment); setShowModal(true); }}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg ${statusConf.classes} !bg-opacity-20`}>
              {payment.status === PAYMENT_STATUS.COMPLETED ? <CheckCircle className="w-7 h-7" /> : 
               payment.status === PAYMENT_STATUS.REJECTED ? <XCircle className="w-7 h-7" /> : 
               <Clock className="w-7 h-7" />}
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{formatDate(payment.createdAt)}</p>
               <h4 className="text-lg font-black text-white uppercase tracking-tight">{payment.plan?.name || 'Abonnement'}</h4>
            </div>
          </div>
          <div className="text-right">
             <p className="text-2xl font-black text-white tracking-tighter">{payment.amount}€</p>
             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border ${statusConf.classes}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
               {statusConf.label}
             </span>
          </div>
        </div>

        {isGiftCard && payment.paymentDetails?.cardCode && (
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-6 flex items-center justify-between group-hover:bg-white/10 transition-colors">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Code {payment.paymentDetails.cardType}</p>
              <p className="font-mono text-sm font-black text-indigo-400 tracking-[0.2em] truncate">{payment.paymentDetails.cardCode}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(payment.paymentDetails.cardCode); }}
              className="p-3 bg-white/5 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shrink-0 ml-4"
            >
              <Copy size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{payment.referenceCode}</p>
           </div>
           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
             <ChevronRight size={16} className="text-slate-500 group-hover:text-white" />
           </div>
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
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
        </div>

        <header className="sticky top-0 z-30 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 p-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/payments')} 
              className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group"
            >
              <ArrowLeft className="h-6 w-6 text-slate-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <History className="w-4 h-4 text-indigo-400" />
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Dossier Financier</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase">{decodeURIComponent(userEmail)}</h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Transactionnel</p>
                <div className="flex items-center gap-2 justify-end">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <p className="text-3xl font-black text-white tracking-tighter">{userStats.amount}€</p>
                </div>
             </div>
             <div className="w-px h-12 bg-white/10"></div>
             <div className="bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/20">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{userStats.total} Transactions</p>
             </div>
          </div>
        </header>

        <main className="p-6 lg:p-10 space-y-10 relative z-10">
          
          {/* User Status Card */}
          <section className="bg-white/5 backdrop-blur-md rounded-[3.5rem] p-8 border border-white/10 shadow-2xl flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-indigo-600/10"></div>
             
             <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 group-hover:rotate-6 transition-transform duration-500">
                   <User size={56} className="text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 border-4 border-[#1a2133] rounded-2xl flex items-center justify-center shadow-lg">
                   <ShieldCheck size={24} className="text-white" />
                </div>
             </div>

             <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                   <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 min-w-[180px]">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Abonnement Actuel</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white uppercase tracking-tight">
                           {currentPlan}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                   </div>
                   <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 min-w-[180px]">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Membre depuis</p>
                      <p className="text-lg font-black text-white tracking-tight">{formatDate(userData?.createdAt).split(' à')[0]}</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                     <Zap size={16} className="text-amber-400" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions d'Administration</p>
                   </div>
                   
                   <div className="flex flex-wrap gap-3">
                      {[
                        { id: 'basic', label: 'Basic', color: 'bg-white/5 text-slate-400 hover:text-white', activeColor: 'bg-slate-700 text-white', icon: Shield },
                        { id: 'premium', label: 'Premium', color: 'bg-pink-500/10 text-pink-400 hover:bg-pink-500 hover:text-white', activeColor: 'bg-pink-500 text-white', icon: Crown },
                        { id: 'vip', label: 'Elite VIP', color: 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white', activeColor: 'bg-indigo-500 text-white', icon: Gem }
                      ].map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => handleUpdatePlan(plan.id)}
                          disabled={actionLoading || userLoading}
                          className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 shadow-sm group/btn ${
                            currentPlan === plan.id ? plan.activeColor : plan.color
                          }`}
                        >
                          <plan.icon size={18} className={currentPlan === plan.id ? 'animate-bounce' : ''} />
                          {plan.label}
                        </button>
                      ))}
                   </div>

                   <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-white/5">
                     <button
                       onClick={handleRefillCredits}
                       disabled={actionLoading || userLoading}
                       className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 shadow-lg shadow-emerald-500/10 disabled:opacity-50 group/refill"
                     >
                       <BatteryCharging size={20} className="group-hover/refill:animate-pulse" />
                       Recharger les crédits
                     </button>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dernier rechargement: automatique à l'activation</p>
                   </div>
                </div>
             </div>
          </section>

          {/* Payments Timeline */}
          <section className="space-y-8">
             <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <History size={18} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Flux des Transactions</h3>
                </div>
                <div className="flex gap-3">
                   <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-2">
                      <Clock size={12} />
                      {userStats.validating} En attente
                   </div>
                   <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                      <CheckCircle size={12} />
                      {userStats.completed} Validés
                   </div>
                </div>
             </div>

             {loading ? (
                <div className="py-32 flex flex-col items-center">
                   <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Synchronisation avec la blockchain...</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   <AnimatePresence mode="popLayout">
                      {payments.map(p => <PaymentCard key={p.id} payment={p} />)}
                   </AnimatePresence>
                </div>
             )}
          </section>
        </main>
      </div>

      {/* Modal Détails Premium */}
      <AnimatePresence>
        {showModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 lg:p-10"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-[#1a2133] w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-3xl border border-white/10"
            >
              <div className="p-8 lg:p-12 border-b border-white/5 flex items-center justify-between bg-white/5">
                 <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl ${getStatusConfig(selectedPayment.status).classes} !bg-opacity-20`}>
                       {selectedPayment.status === PAYMENT_STATUS.COMPLETED ? <CheckCircle className="w-8 h-8" /> : 
                        selectedPayment.status === PAYMENT_STATUS.REJECTED ? <XCircle className="w-8 h-8" /> : 
                        <Clock className="w-8 h-8" />}
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tight text-white">Validation de Transaction</h3>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Réf : {selectedPayment.referenceCode}</p>
                    </div>
                 </div>
                 <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
                   <X size={24} />
                 </button>
              </div>

              <div className="p-8 lg:p-12 space-y-10">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Montant Reçu</p>
                       <p className="text-4xl font-black text-white tracking-tighter">{selectedPayment.amount}€</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Service Demandé</p>
                       <p className="text-xl font-black text-indigo-400 uppercase tracking-tight truncate">{selectedPayment.plan?.name}</p>
                    </div>
                 </div>

                 {selectedPayment.type === 'gift_card' && (
                    <div className="bg-indigo-600/10 p-10 rounded-[3rem] border border-indigo-500/20 relative overflow-hidden group">
                       <Sparkles className="absolute top-6 right-6 text-indigo-500/20 group-hover:rotate-12 transition-transform" size={60} />
                       <div className="relative z-10 text-center">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Code {selectedPayment.paymentDetails?.cardType}</p>
                          <p className="text-4xl font-black text-white tracking-[0.4em] mb-8 select-all bg-indigo-500/10 py-4 rounded-2xl border border-indigo-500/10">{selectedPayment.paymentDetails?.cardCode}</p>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(selectedPayment.paymentDetails?.cardCode); }}
                            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                          >
                             <Copy size={16} />
                             Copier le code
                          </button>
                       </div>
                    </div>
                 )}

                 <div className="flex flex-col gap-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Décision Administrative</p>
                    <div className="grid grid-cols-2 gap-4">
                       <button
                         onClick={() => handleApprovePayment(selectedPayment.id)}
                         disabled={actionLoading}
                         className="group py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50"
                       >
                         {actionLoading ? <RefreshCw className="animate-spin" /> : <CheckCircle size={24} className="group-hover:scale-110 transition-transform" />}
                         Approuver
                       </button>
                       <button
                         onClick={() => handleRejectPayment(selectedPayment.id)}
                         disabled={actionLoading}
                         className="group py-6 bg-rose-600 hover:bg-rose-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-rose-600/20 transition-all disabled:opacity-50"
                       >
                         {actionLoading ? <RefreshCw className="animate-spin" /> : <XCircle size={24} className="group-hover:scale-110 transition-transform" />}
                         Rejeter
                       </button>
                    </div>
                    <button
                       onClick={() => handleDeletePayment(selectedPayment.id)}
                       disabled={actionLoading}
                       className="py-4 text-slate-600 hover:text-rose-500 font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                       <Trash2 size={14} />
                       Supprimer définitivement cet enregistrement
                    </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUserPayments;


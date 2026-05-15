import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Mail,
  CreditCard,
  Gift,
  Building2,
  Ticket,
  RefreshCw,
  Calendar,
  Euro,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronRight,
  Wallet,
  Zap
} from 'lucide-react';
import { paymentService, PAYMENT_STATUS } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import ClientSidebar from '../components/Dashboard/ClientSidebar';
import ClientHeader from '../components/Dashboard/ClientHeader';

const PaymentTrackingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPayments, setUserPayments] = useState([]);
  const [showUserPayments, setShowUserPayments] = useState(true);
  const [copied, setCopied] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Charger les paiements de l'utilisateur au démarrage
  useEffect(() => {
    if (currentUser) {
      loadUserPayments();
    }
  }, [currentUser]);

  // Charger automatiquement si un code de référence est passé dans l'URL (pour compatibilité)
  useEffect(() => {
    const codeFromState = location.state?.referenceCode;
    if (codeFromState) {
      // On pourrait scroller vers l'élément ou mettre en avant, mais on garde simple
    }
  }, [location.state]);

  const loadUserPayments = async () => {
    try {
      const userId = currentUser.uid || currentUser.id;
      if (userId) {
        const payments = await paymentService.getUserPayments(userId);
        setUserPayments(payments);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusConfig = (status) => {
    const statusInfo = paymentService.getStatusDisplay(status);
    const configs = {
      [PAYMENT_STATUS.PENDING]: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
      [PAYMENT_STATUS.WAITING_PAYMENT]: { icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
      [PAYMENT_STATUS.VALIDATING]: { icon: RefreshCw, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-100' },
      [PAYMENT_STATUS.COMPLETED]: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
      [PAYMENT_STATUS.REJECTED]: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
      [PAYMENT_STATUS.EXPIRED]: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100' }
    };
    return { ...statusInfo, ...(configs[status] || configs[PAYMENT_STATUS.PENDING]) };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  const PaymentCard = ({ payment }) => {
    const [showCode, setShowCode] = useState(false);
    const config = getStatusConfig(payment.status);
    const MethodIcon = payment.type === 'gift_card' ? Gift : Building2;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-[2rem] p-6 border transition-all duration-300 shadow-xl shadow-gray-100/50 ${config.border} hover:border-pink-200 group`}
      >
        <div className="flex items-start justify-between mb-6">
          <div className={`w-12 h-12 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center shadow-sm`}>
            <config.icon size={24} className={payment.status === PAYMENT_STATUS.VALIDATING ? 'animate-spin' : ''} />
          </div>
          <div className="text-right">
             <div className="flex items-center gap-1 justify-end font-black text-pink-500 text-lg">
                {payment.amount}€
             </div>
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{payment.plan?.name}</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Référence</span>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100">
               <code className="text-[10px] font-black text-gray-700 truncate mr-2">{payment.referenceCode}</code>
               <button onClick={() => copyText(payment.referenceCode)} className="text-gray-300 hover:text-pink-500 transition-colors">
                 {copied === payment.referenceCode ? <Check size={14} /> : <Copy size={14} />}
               </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Méthode</span>
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase">
                <MethodIcon size={12} /> {payment.paymentDetails?.method}
              </div>
            </div>
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Date</span>
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase">
                <Calendar size={12} /> {formatDate(payment.createdAt)}
              </div>
            </div>
          </div>

          {payment.type === 'gift_card' && payment.paymentDetails?.cardCode && (
             <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100/50 relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest block">Code Transmis</span>
                  <button 
                    onClick={() => setShowCode(!showCode)}
                    className="text-pink-400 hover:text-pink-600 transition-colors"
                  >
                    {showCode ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
                <p className="font-mono font-black text-pink-600 text-sm tracking-widest">
                  {showCode ? payment.paymentDetails.cardCode : '••••••••••••'}
                </p>
             </div>
          )}

          {payment.adminNote && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
               <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
               <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-wide">
                 Note : {payment.adminNote}
               </p>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            navigate('/dashboard/payment-status', { 
              state: { 
                paymentId: payment.id,
                referenceCode: payment.referenceCode,
                plan: payment.plan,
                paymentMethod: payment.type
              } 
            });
          }}
          className="w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all bg-gray-900 text-white hover:bg-pink-600 shadow-lg shadow-gray-200 group-hover:shadow-pink-200"
        >
          Voir le reçu
        </button>
      </motion.div>
    );
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden font-sans">
      <ClientSidebar
        currentUser={currentUser}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <ClientHeader
          currentUser={currentUser}
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-[80px] lg:pt-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Dashboard Style */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-pink-600 mb-2"
                >
                  <Wallet size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Finance & Abonnements</span>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">Suivi des Paiements</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Investi</span>
                  <span className="text-lg font-black text-gray-900">{userPayments.reduce((acc, p) => p.status === 'completed' ? acc + (p.amount || 0) : acc, 0)}€</span>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Transactions</span>
                  <span className="text-lg font-black text-gray-900">{userPayments.length}</span>
                </div>
              </div>
            </div>

            {/* Liste des paiements - Simplifiée */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Vos Transactions</h2>
                <div className="h-px flex-1 bg-gray-100 mx-6 hidden md:block" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{userPayments.length} Éléments</span>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                   <RefreshCw className="animate-spin text-pink-500" size={32} />
                </div>
              ) : userPayments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userPayments.map((p) => (
                    <PaymentCard key={p.id} payment={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                  <Wallet size={48} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Aucune transaction trouvée</p>
                </div>
              )}
            </div>

            {/* Aide & Support */}
            <div className="mt-20 p-10 bg-gradient-to-br from-indigo-900 to-gray-900 rounded-[3rem] text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <ShieldCheck size={140} />
               </div>
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Un problème avec un paiement ?</h3>
                    <p className="text-gray-400 font-medium text-sm leading-relaxed mb-8">
                      Notre équipe de support est disponible 24h/7j pour vous accompagner. Pour toute question, munissez-vous de votre code de référence.
                    </p>
                    <button 
                      onClick={() => navigate('/dashboard/messaging')}
                      className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all flex items-center gap-3"
                    >
                      Ouvrir un ticket support <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { title: "Code Perdu ?", text: "Retrouvez-le dans votre boîte mail ou via 'Mes Paiements Récents'." },
                      { title: "Sécurité", text: "Toutes vos transactions sont protégées par cryptage SSL 256 bits." }
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">{item.title}</h4>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.text}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentTrackingPage;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
  Sparkles,
  ShieldCheck,
  Check,
  Info,
  ChevronRight
} from 'lucide-react';
import { paymentService, PAYMENT_STATUS } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import ClientSidebar from '../components/Dashboard/ClientSidebar';
import ClientHeader from '../components/Dashboard/ClientHeader';

const PaymentStatusPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { paymentId, referenceCode, plan, paymentMethod } = location.state || {};

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  useEffect(() => {
    if (!paymentId) {
      navigate('/dashboard/subscription');
      return;
    }

    const unsubscribe = paymentService.listenToPaymentStatus(paymentId, (paymentData) => {
      setPayment(paymentData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [paymentId, navigate]);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      [PAYMENT_STATUS.PENDING]: {
        icon: Clock,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        label: 'Demande reçue',
        message: 'Votre demande de paiement a été créée et est en cours de traitement.'
      },
      [PAYMENT_STATUS.WAITING_PAYMENT]: {
        icon: Mail,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        label: 'Instructions envoyées',
        message: 'Les coordonnées de paiement vous ont été envoyées par message privé.'
      },
      [PAYMENT_STATUS.VALIDATING]: {
        icon: RefreshCw,
        color: 'text-pink-500',
        bg: 'bg-pink-50',
        border: 'border-pink-100',
        label: 'Validation en cours',
        message: 'Votre paiement est en cours de vérification. Un message vous sera envoyé dès que c\'est prêt !'
      },
      [PAYMENT_STATUS.COMPLETED]: {
        icon: CheckCircle2,
        color: 'text-green-500',
        bg: 'bg-green-50',
        border: 'border-green-100',
        label: 'Paiement Validé',
        message: 'Félicitations ! Votre abonnement est maintenant actif. Profitez bien ! 😍'
      },
      [PAYMENT_STATUS.REJECTED]: {
        icon: XCircle,
        color: 'text-red-500',
        bg: 'bg-red-50',
        border: 'border-red-100',
        label: 'Paiement Refusé',
        message: 'Désolé, votre paiement n\'a pas pu être validé. Vérifiez vos messages privés.'
      }
    };
    return configs[status] || configs[PAYMENT_STATUS.PENDING];
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-500 font-bold animate-pulse tracking-widest uppercase text-xs">Synchronisation...</p>
        </div>
      </div>
    );
  }

  const config = getStatusConfig(payment?.status);
  const StatusIcon = config.icon;

  return (
    <div className="h-screen bg-white flex overflow-hidden">
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
          <div className="max-w-4xl mx-auto">
            
            <div className="mb-8 flex items-center justify-between">
               <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Statut du Paiement</h1>
               <button 
                onClick={() => navigate('/dashboard/subscription')}
                className="text-gray-400 hover:text-gray-900 font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center gap-1"
               >
                 <ArrowLeft size={14} /> Retour
               </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Statut Principal */}
              <div className="lg:col-span-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 text-center border-2 ${config.border} ${config.bg} shadow-xl shadow-gray-200/50`}
                >
                  {/* Décoration */}
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <StatusIcon size={120} />
                  </div>

                  <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-white flex items-center justify-center shadow-lg ${config.color}`}>
                    <StatusIcon size={40} className={payment?.status === PAYMENT_STATUS.VALIDATING ? 'animate-spin' : ''} />
                  </div>

                  <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 ${config.color}`}>
                    {config.label}
                  </h2>
                  <p className="text-gray-600 font-medium max-w-lg mx-auto leading-relaxed">
                    {config.message}
                  </p>

                  {payment?.status === PAYMENT_STATUS.COMPLETED && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => navigate('/dashboard')}
                      className="mt-8 bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-200 hover:scale-105 transition-all"
                    >
                      Accéder à mes privilèges
                    </motion.button>
                  )}
                </motion.div>
              </div>

              {/* Détails du Paiement */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-100 border border-gray-100">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Récapitulatif de la transaction</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Abonnement</span>
                      <span className="font-black text-gray-900">{payment?.plan?.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</span>
                      <span className="font-black text-pink-500 text-lg">{payment?.amount}€</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Méthode</span>
                      <div className="flex items-center gap-2 font-black text-gray-900 uppercase text-[10px]">
                        <Gift size={14} />
                        {payment?.paymentDetails?.method}
                      </div>
                    </div>

                    {payment?.type === 'gift_card' && payment?.paymentDetails?.cardCode && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Code {payment.paymentDetails.cardType} transmis</p>
                          <p className="font-mono font-black text-gray-900 tracking-widest">{payment.paymentDetails.cardCode}</p>
                        </div>
                        <ShieldCheck size={20} className="text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-xl">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Besoin d'aide ?</h4>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <Info size={16} className="text-pink-400" />
                      </div>
                      <p className="text-[11px] font-bold text-gray-400 leading-relaxed uppercase tracking-wide">
                        Notre équipe valide généralement les demandes en moins de 2 heures.
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Référence Transaction</p>
                      <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                        <code className="text-[10px] font-black text-pink-400">{referenceCode}</code>
                        <button onClick={() => copyText(referenceCode)} className="text-gray-400 hover:text-white transition-colors">
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/dashboard/messaging')}
                      className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      Contacter le support <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentStatusPage;

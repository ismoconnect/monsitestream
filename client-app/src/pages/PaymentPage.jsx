import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Gift,
  ArrowLeft,
  Check,
  Shield,
  Crown,
  Diamond,
  Lock,
  Star,
  Sparkles,
  CreditCard,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { paymentService, GIFT_CARD_TYPES } from '../services/paymentService';
import ClientSidebar from '../components/Dashboard/ClientSidebar';
import ClientHeader from '../components/Dashboard/ClientHeader';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('gift_card');
  const [selectedGiftCardType, setSelectedGiftCardType] = useState('neosurf');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  useEffect(() => {
    if (currentUser === null) navigate('/');
  }, [currentUser, navigate]);

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-500 font-bold animate-pulse tracking-widest uppercase text-xs">Initialisation Sécurisée...</p>
        </div>
      </div>
    );
  }

  const selectedPlan = location.state?.plan || {
    id: 'premium',
    name: 'Premium Pass',
    price: 49,
    features: ['Galerie HD complète', 'Contenu privé exclusif', 'Chat prioritaire', 'Photos quotidiennes']
  };

  const paymentMethods = [
    {
      id: 'gift_card',
      name: 'Carte Cadeau',
      subtitle: 'Transcash, Neosurf, PCS...',
      icon: Gift,
      description: 'Validation après traitement sécurisé par notre service gestion',
      color: 'from-pink-500 to-rose-600'
    }
  ];

  const handlePayment = async () => {
    if (!giftCardCode) {
      alert('Veuillez entrer le code de votre carte cadeau');
      return;
    }

    setIsProcessing(true);
    try {
      const userId = currentUser.uid || currentUser.id;
      const giftCardType = GIFT_CARD_TYPES.find(type => type.id === selectedGiftCardType);
      
      const paymentRequest = await paymentService.createGiftCardRequest(
        userId,
        selectedPlan,
        currentUser.email,
        {
          type: selectedGiftCardType,
          typeName: giftCardType?.name || selectedGiftCardType,
          code: giftCardCode
        }
      );

      navigate('/dashboard/payment-status', {
        state: {
          paymentId: paymentRequest.id,
          referenceCode: paymentRequest.referenceCode,
          plan: selectedPlan,
          paymentMethod: 'gift_card'
        }
      });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors du traitement.');
    } finally {
      setIsProcessing(false);
    }
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
          <div className="max-w-6xl mx-auto">
            {/* Titre Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-pink-600 mb-2"
                >
                  <Lock size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Paiement 100% Sécurisé</span>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">Finaliser l'Abonnement</h1>
              </div>
              <button 
                onClick={() => navigate('/dashboard/subscription')}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-xs uppercase tracking-widest transition-colors"
              >
                <ArrowLeft size={16} /> Retour aux plans
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Colonne Gauche - Sélection Paiement */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider">Mode de règlement</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className="relative p-6 rounded-3xl border-2 transition-all duration-300 text-left flex flex-col gap-4 border-pink-500 bg-pink-50/30"
                      >
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center text-white shadow-lg`}>
                          <method.icon size={24} />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 uppercase text-sm tracking-wide">{method.name}</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">{method.subtitle}</p>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white">
                            <Check size={14} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Formulaires dynamiques */}
                  <div className="mt-10 pt-10 border-t border-gray-100">
                    <AnimatePresence mode="wait">
                        <motion.div
                          key="gift_card_form"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-8"
                        >
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">1. Choisissez votre carte</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {GIFT_CARD_TYPES.map((type) => (
                                <button
                                  key={type.id}
                                  onClick={() => setSelectedGiftCardType(type.id)}
                                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                                    selectedGiftCardType === type.id
                                      ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm'
                                      : 'border-gray-100 bg-gray-50/50 text-gray-400 hover:border-gray-200'
                                  }`}
                                >
                                  <span className="text-2xl">{type.icon}</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest">{type.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">2. Entrez le code secret</p>
                            <div className="relative">
                              <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                              <input 
                                type="text"
                                placeholder="VOTRE CODE ICI..."
                                value={giftCardCode}
                                onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-mono font-black text-lg tracking-widest focus:border-pink-500 focus:bg-white transition-all outline-none"
                              />
                            </div>
                            <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                              <Info size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                              <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-wider">
                                Votre demande d'accès est soumise à une validation sécurisée par notre service gestion. Vous serez notifié par message dès l'activation effective de vos services.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Colonne Droite - Résumé */}
              <div className="lg:col-span-4">
                <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-purple-500/20 sticky top-8 overflow-hidden">
                  {/* Décoration */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <Sparkles size={20} className="text-pink-400" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-widest">Votre Panier</h3>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Plan sélectionné</span>
                        <Crown size={16} className="text-yellow-400" />
                      </div>
                      <h4 className="text-xl font-black mb-2">{selectedPlan.name}</h4>
                      <p className="text-3xl font-black text-pink-400">{selectedPlan.price}€<span className="text-xs text-white/50 ml-1">/mois</span></p>
                    </div>

                    <div className="space-y-3">
                      {selectedPlan.features?.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-8 border-t border-white/10">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total à régler</span>
                        <span className="text-2xl font-black">{selectedPlan.price}€</span>
                      </div>

                      <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all duration-300 shadow-xl bg-pink-600 hover:bg-pink-500 shadow-pink-500/40 flex items-center justify-center gap-3"
                      >
                        {isProcessing ? (
                          <RefreshCw className="animate-spin" size={18} />
                        ) : (
                          <>
                            Valider le paiement
                            <Check size={18} />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-4">
                      <Shield size={14} className="text-gray-500" />
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Transaction Cryptée SSL</span>
                    </div>
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

const RefreshCw = ({ className, size }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.42L21 7" />
    <path d="M21 3v4h-4" />
  </svg>
);

export default PaymentPage;

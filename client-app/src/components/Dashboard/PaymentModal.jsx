import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ShieldCheck, CheckCircle2, Landmark, Gift, Ticket, Gamepad2, CreditCard, Banknote, Smartphone, Package, Target } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, appointment, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('carte_cadeau');
  const [giftCardType, setGiftCardType] = useState(null);
  const [codeInputValue, setCodeInputValue] = useState('');

  if (!isOpen || !appointment) return null;

  const handlePay = () => {
    if (!giftCardType || codeInputValue.trim() === '') return;
    
    setLoading(true);
    
    const details = {
      method: 'carte_cadeau',
      giftCardType: giftCards.find(c => c.id === giftCardType)?.label || giftCardType,
      giftCardCode: codeInputValue
    };

    // Simulation plus courte et plus fiable
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
      
      // On déclenche le succès après un court délai pour laisser voir l'animation de succès
      setTimeout(() => {
        onPaymentSuccess(details);
        // Le modal sera fermé par le parent via onPaymentSuccess
      }, 1500);
    }, 800);
  };

  const methods = [
    {
      id: 'carte_cadeau',
      title: 'Carte Cadeau',
      subtitle: 'Utiliser une carte cadeau',
      icon: <Gift className="w-6 h-6 text-pink-500" />,
      bgIcon: 'bg-pink-100',
      activeBorder: 'border-pink-500',
      activeBg: 'bg-pink-50'
    }
  ];

  const giftCards = [
    { id: 'google_play', label: 'Google Play', icon: <Gamepad2 className="w-6 h-6 text-indigo-500" /> },
    { id: 'neosurf', label: 'Neosurf', icon: <CreditCard className="w-6 h-6 text-sky-500" /> },
    { id: 'transcash', label: 'Transcash', icon: <Banknote className="w-6 h-6 text-amber-500" /> },
    { id: 'pcs', label: 'PCS', icon: <Landmark className="w-6 h-6 text-slate-500" /> },
    { id: 'toneofirst', label: 'Toneofirst', icon: <Smartphone className="w-6 h-6 text-purple-500" /> },
    { id: 'amazon', label: 'Amazon', icon: <Package className="w-6 h-6 text-orange-500" /> },
    { id: 'steam', label: 'Steam', icon: <Target className="w-6 h-6 text-rose-500" /> }
  ];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 sm:p-6"
          onClick={!loading && !isSuccess ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg mx-auto overflow-hidden relative border border-indigo-50"
            onClick={(e) => e.stopPropagation()}
          >
            {isSuccess ? (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle2 className="w-20 h-20 text-emerald-500" />
                </motion.div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Paiement Validé</h2>
                <p className="text-sm text-gray-500 font-medium">Votre demande est en attente de validation par Liliana.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1e1b4b] via-[#4338ca] to-[#7c3aed] p-4 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <Lock className="w-4 h-4" /> CHOISISSEZ VOTRE MODE DE PAIEMENT
                      </h2>
                    </div>
                    {!loading && (
                      <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                        <X className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Options de paiement */}
                  <div className="flex justify-center">
                    {methods.map((method) => (
                      <div
                        key={method.id}
                        className={`border-2 rounded-xl p-4 transition-all duration-200 flex flex-col items-center text-center gap-2 ${method.activeBorder} ${method.activeBg} shadow-md w-full max-w-[200px]`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${method.bgIcon}`}>
                          {React.cloneElement(method.icon, { className: 'w-6 h-6' })}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight">{method.title}</h3>
                          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{method.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Code & Carte Cadeau (Conditionnel) */}
                  {/* Input Code & Carte Cadeau */}
                  <div className="overflow-hidden">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mt-1 space-y-3">
                      
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Type de carte cadeau</p>
                        <div className="grid grid-cols-4 gap-2">
                          {giftCards.map((card) => (
                            <div
                              key={card.id}
                              onClick={() => setGiftCardType(card.id)}
                              className={`cursor-pointer bg-white border rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                                giftCardType === card.id
                                  ? 'border-pink-500 ring-1 ring-pink-500/20 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {React.cloneElement(card.icon, { className: 'w-4 h-4' })}
                              <span className="text-[9px] font-bold text-gray-700 whitespace-nowrap">{card.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {giftCardType && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-2 border-t border-gray-200/60"
                        >
                          <input
                            type="text"
                            value={codeInputValue}
                            onChange={(e) => setCodeInputValue(e.target.value)}
                            placeholder={`CODE DE LA CARTE ${giftCards.find(c => c.id === giftCardType)?.label.toUpperCase()}...`}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-xs font-bold text-gray-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/10 transition-all uppercase"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Bouton */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePay();
                    }}
                    disabled={
                      loading || 
                      !giftCardType || 
                      codeInputValue.trim() === ''
                    }
                    className="w-full bg-gradient-to-r from-[#4338ca] to-[#7c3aed] text-white py-4 rounded-xl font-black text-xs tracking-[0.2em] uppercase shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 disabled:scale-100 disabled:shadow-none relative z-20"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        VALIDER {appointment.price}€
                      </>
                    )}
                  </button>

                  <div className="flex flex-col items-center text-center mt-2">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Paiement 100% sécurisé
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentModal;

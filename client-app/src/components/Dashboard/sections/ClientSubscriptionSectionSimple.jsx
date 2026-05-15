import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Crown,
  Check,
  Star,
  Shield,
  Video,
  MessageSquare,
  Search,
  Loader,
  Zap,
  Gem,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { planService } from '../../../services/planService';

const ClientSubscriptionSectionSimple = ({ currentUser }) => {
  const navigate = useNavigate();
  const currentPlan = currentUser?.subscription?.plan || 'basic';
  const subscriptionStatus = currentUser?.subscription?.status || 'inactive';
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAndListen = async () => {
      // Tenter d'initialiser les plans s'ils n'existent pas
      if (currentUser?.role === 'admin' || currentUser?.email === 'chapelleolivier00@gmail.com') {
        try {
          await planService.seedDefaultPlans();
        } catch (e) {
          console.log("Impossible d'initialiser les plans (droits normaux)");
        }
      }

      const unsubscribe = planService.onPlansSnapshot((fetchedPlans) => {
        const getFixedFeatures = (id, originalFeatures) => {
          switch (id) {
            case 'basic': return ['50 CRÉDITS MESSAGES / Mois', ...originalFeatures.filter(f => !f.toLowerCase().includes('message'))];
            case 'premium': return ['1000 CRÉDITS MESSAGES / Mois', ...originalFeatures.filter(f => !f.toLowerCase().includes('message'))];
            case 'vip': return ['MESSAGES ILLIMITÉS', ...originalFeatures.filter(f => !f.toLowerCase().includes('message'))];
            default: return originalFeatures;
          }
        };

        if (fetchedPlans.length === 0) {
          setSubscriptionPlans([
            {
              id: 'basic',
              name: 'Pass Standard',
              price: 0,
              features: ['50 CRÉDITS MESSAGES / Mois', 'Accès Galerie Publique', 'Profil Voyageur'],
              popular: false,
              icon: User
            },
            {
              id: 'premium',
              name: 'Premium Pass',
              price: 49,
              features: ['1000 CRÉDITS MESSAGES / Mois', 'Galerie HD Privée', 'Chat Prioritaire 24/7', 'Photos exclusives'],
              popular: true,
              icon: Zap
            },
            {
              id: 'vip',
              name: 'Elite VIP',
              price: 199,
              features: ['MESSAGES ILLIMITÉS', 'Appels Vidéo Privés', 'WhatsApp Direct', 'Contenus sur Mesure'],
              popular: false,
              icon: Gem
            }
          ]);
        } else {
          const updatedPlans = fetchedPlans.map(plan => ({
            ...plan,
            features: getFixedFeatures(plan.id, plan.features || [])
          }));
          setSubscriptionPlans(updatedPlans.filter(p => p.isActive !== false));
        }
        setLoading(false);
      });
      return unsubscribe;
    };

    const unsubscribePromise = initAndListen();
    return () => {
      unsubscribePromise.then(unsub => unsub && unsub());
    };
  }, [currentUser]);

  const handlePurchase = (plan) => {
    navigate('/dashboard/payment', {
      state: {
        plan: { id: plan.id, name: plan.name, price: plan.price, features: plan.features },
        user: { uid: currentUser?.uid, email: currentUser?.email, displayName: currentUser?.displayName },
        fromDashboard: true
      }
    });
  };

  const getPlanStyles = (id) => {
    switch (id) {
      case 'vip':
        return {
          bg: 'bg-white',
          border: 'border-amber-200',
          accent: 'text-amber-600',
          btn: 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-amber-200',
          icon: <Gem size={20} className="text-amber-500" />,
          tag: 'ELITE'
        };
      case 'premium':
        return {
          bg: 'bg-white',
          border: 'border-pink-200',
          accent: 'text-pink-600',
          btn: 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-pink-200',
          icon: <Zap size={20} className="text-pink-500" />,
          tag: 'POPULAIRE'
        };
      default:
        return {
          bg: 'bg-gray-50/50',
          border: 'border-gray-200',
          accent: 'text-gray-600',
          btn: 'bg-gray-900 shadow-gray-200',
          icon: <Star size={20} className="text-gray-400" />,
          tag: 'ESSENTIEL'
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
      
      {/* Header Premium Raffiné */}
      <div className="relative mb-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-pink-50 border border-pink-100 mb-2 shadow-sm"
        >
          <Sparkles size={10} className="text-pink-500" />
          <span className="text-[8px] font-black text-pink-600 uppercase tracking-[0.3em]">Immersion Totale & Sensuelle</span>
        </motion.div>
        
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase mb-4">
          Abonnements <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Privilèges</span>
        </h1>

        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white rounded-2xl p-3 md:p-4 border border-gray-100 shadow-lg shadow-gray-100/30 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
             <Zap size={20} className="text-pink-500" />
          </div>
          <p className="text-gray-500 text-xs font-medium leading-tight text-left">
            Entrez dans mon univers le plus intime. Des contenus inédits, des lives sulfureux et des services personnalisés. Éveillez vos sens et profitez d'une expérience sans limites.
          </p>
        </motion.div>
      </div>

      {/* Statut actuel - Compact */}
      <div className="flex justify-center mb-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 p-3 bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-xl shadow-gray-200/40"
        >
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <Crown size={20} className="text-pink-500" />
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Statut Actuel</p>
            <div className="flex items-center gap-2">
               <h2 className="text-sm font-black text-gray-900 uppercase">
                  {currentPlan === 'vip' ? 'Elite VIP' : currentPlan === 'premium' ? 'Premium' : 'Standard'}
               </h2>
               <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 text-[7px] font-black uppercase tracking-widest">
                  {subscriptionStatus === 'active' ? 'Actif' : 'Attente'}
               </span>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-100 hidden sm:block"></div>
          <button 
            onClick={() => navigate('/dashboard/payment-tracking')}
            className="hidden sm:flex items-center gap-1 text-[9px] font-black text-pink-500 hover:text-pink-700 transition-colors uppercase tracking-widest"
          >
            Suivi <ChevronRight size={12} />
          </button>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Chargement des offres...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {subscriptionPlans.map((plan, index) => {
            const styles = getPlanStyles(plan.id);
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={`relative flex flex-col p-10 rounded-[3rem] border-2 transition-all duration-500 ${styles.bg} ${styles.border} ${plan.popular ? 'shadow-2xl shadow-pink-100' : 'shadow-xl shadow-gray-100'}`}
              >
                {/* Badge Tag */}
                <div className={`absolute top-0 right-10 -translate-y-1/2 px-4 py-2 rounded-xl text-[9px] font-black text-white uppercase tracking-widest ${styles.btn}`}>
                  {styles.tag}
                </div>

                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                      {styles.icon}
                    </div>
                    <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{plan.name}</h4>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gray-900">{plan.price}€</span>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">/ mois</span>
                  </div>
                </div>

                <div className="flex-1 space-y-6 mb-12">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">Privilèges inclus :</p>
                   <ul className="space-y-5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-4 group/item">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${plan.id === 'basic' ? 'bg-gray-100' : 'bg-pink-50 group-hover/item:bg-pink-500'}`}>
                            <Check size={14} className={plan.id === 'basic' ? 'text-gray-400' : 'text-pink-500 group-hover/item:text-white'} />
                          </div>
                          <span className="text-[13px] font-bold text-gray-600 uppercase tracking-wide">{feature}</span>
                        </li>
                      ))}
                   </ul>
                </div>

                <button 
                  onClick={() => handlePurchase(plan)}
                  disabled={plan.id === currentPlan || (plan.id === 'basic' && currentPlan !== 'basic')}
                  className={`group relative w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all overflow-hidden ${
                    plan.id === currentPlan 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : `text-white shadow-xl hover:scale-[1.02] active:scale-95 ${styles.btn}`
                  }`}
                >
                  <span className="relative z-10">
                    {plan.id === currentPlan ? 'Plan Actuel' : 'Débloquer Maintenant'}
                  </span>
                  {plan.id !== currentPlan && (
                    <motion.div 
                      className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer Info - Ultra Compact */}
      <div className="bg-gray-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          {[
            { icon: Shield, title: "Sécurisé" },
            { icon: Video, title: "HD Live" },
            { icon: MessageSquare, title: "Support" },
            { icon: Star, title: "Exclusif" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-3 group">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-pink-500 transition-all">
                <item.icon size={14} className="text-white" />
              </div>
              <h5 className="text-[9px] font-black uppercase tracking-widest">{item.title}</h5>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ClientSubscriptionSectionSimple;

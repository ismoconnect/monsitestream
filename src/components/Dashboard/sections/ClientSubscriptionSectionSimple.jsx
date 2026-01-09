import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import {
  CreditCard,
  Crown,
  Star,
  Check,
  Lock,
  Gift,
  Calendar,
  Heart,
  Video,
  Image,
  MessageSquare,
  Sparkles,
  Zap,
  Shield,
  Award,
  TrendingUp,
  Diamond,
  Gem,
  Settings,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Infinity,
  Target,
  ChevronRight
} from 'lucide-react';

const ClientSubscriptionSectionSimple = ({ currentUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { purchaseSubscription } = useAuth();
  const { showSuccess, showError } = useNotification();

  const isPremium = currentUser?.subscription?.status === 'active' &&
    (currentUser?.subscription?.plan === 'premium' || currentUser?.subscription?.plan === 'vip');

  const isFreeUser = currentUser?.subscription?.plan === 'free' || !currentUser?.subscription?.plan;

  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Accès Basic',
      price: 29,
      period: 'mois',
      features: [
        'Galerie photos exclusives',
        'Messages privés illimités',
        'Contenu hebdomadaire',
        'Support client'
      ],
      color: 'rose'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 59,
      period: 'mois',
      features: [
        'Tout du plan Basic',
        'Sessions de streaming privées',
        'Contenu quotidien exclusif',
        'Rendez-vous prioritaires',
        'Accès VIP'
      ],
      popular: true,
      color: 'rose'
    },
    {
      id: 'vip',
      name: 'VIP Elite',
      price: 99,
      period: 'mois',
      features: [
        'Tout du plan Premium',
        'Accès 24/7 Illimité',
        'Contenu personnalisé',
        'Sessions privées',
        'Cadeaux exclusifs'
      ],
      color: 'slate'
    }
  ];

  const currentPlan = currentUser?.subscription?.plan || 'free';
  const subscriptionStatus = currentUser?.subscription?.status || 'inactive';

  const handlePurchaseSubscription = (planId) => {
    const selectedPlan = subscriptionPlans.find(plan => plan.id === planId);
    if (selectedPlan) {
      navigate('/dashboard/payment', {
        state: {
          plan: {
            id: selectedPlan.id,
            name: selectedPlan.name,
            price: selectedPlan.price,
            features: selectedPlan.features,
          },
          user: {
            uid: currentUser?.uid,
            email: currentUser?.email,
            displayName: currentUser?.displayName
          },
          fromDashboard: true
        }
      });
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full p-3 sm:p-4 md:p-8 space-y-6 md:space-y-12">
      {/* Header - Sober Pink Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-[0_20px_50px_rgba(251,182,206,0.12)] relative overflow-hidden border border-rose-100"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-[60px] -mr-32 -mt-32 opacity-60" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-5xl font-black mb-1 md:mb-3 tracking-tight text-slate-800">
              Mon <span className="text-rose-500 uppercase">Abonnement</span>
            </h1>
            <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-80">
              Gérez votre accès aux services premium
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/payment-tracking')}
            className="flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-6 py-3.5 rounded-xl font-black text-[10px] md:text-xs tracking-widest border border-slate-100 hover:bg-white hover:shadow-md transition-all sm:w-fit"
          >
            <Search className="w-4 h-4" />
            SUIVI PAIEMENTS
          </motion.button>
        </div>
      </motion.div>

      {/* Current Plan Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-5 md:p-8 border border-rose-50 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-rose-50 rounded-3xl flex items-center justify-center border border-rose-100">
            <Crown className="w-10 h-10 md:w-12 md:h-12 text-rose-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
              <h3 className="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter">
                Plan {currentPlan === 'free' ? 'Gratuit' : currentPlan}
              </h3>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${subscriptionStatus === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                }`}>
                {subscriptionStatus === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <p className="text-slate-400 text-xs md:text-base font-medium">
              {subscriptionStatus === 'active'
                ? `Votre abonnement se renouvèle le ${new Date(currentUser?.subscription?.endDate || Date.now()).toLocaleDateString('fr-FR')}`
                : "Choisissez un plan ci-dessous pour débloquer l'expérience complète."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button className="px-6 py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95">
              MODIFIER
            </button>
            <button className="px-6 py-3 bg-white text-rose-400 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95">
              ANNULER
            </button>
          </div>
        </div>
      </motion.div>

      {/* Plans Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-1.5 h-8 bg-rose-500 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Nos Offres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-[2.5rem] p-8 md:p-10 border transition-all duration-500 flex flex-col relative overflow-hidden group ${plan.popular ? 'border-rose-400 shadow-xl shadow-rose-100 ring-2 ring-rose-50' : 'border-slate-50 shadow-sm hover:shadow-xl hover:border-rose-100'
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 p-6">
                  <span className="bg-rose-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                    Populaire
                  </span>
                </div>
              )}

              <div className="mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${plan.id === 'vip' ? 'bg-slate-900 text-white' : 'bg-rose-50 text-rose-500'
                  }`}>
                  {plan.id === 'basic' && <Shield size={28} />}
                  {plan.id === 'premium' && <Crown size={28} />}
                  {plan.id === 'vip' && <Diamond size={28} />}
                </div>
                <h4 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-800 tracking-tighter">{plan.price}€</span>
                  <span className="text-slate-400 text-sm font-bold uppercase">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-slate-500 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchaseSubscription(plan.id)}
                disabled={plan.id === currentPlan}
                className={`w-full py-5 rounded-[1.5rem] font-black text-xs tracking-[0.2em] transition-all active:scale-95 ${plan.id === currentPlan
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                  : plan.id === 'vip'
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
                    : 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-100'
                  }`}
              >
                {plan.id === currentPlan ? 'PLAN ACTUEL' : 'CHOISIR'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Perks Grid - More Compact on Mobile */}
      <div className="bg-slate-50/50 rounded-[3rem] p-8 md:p-12 border border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="text-2xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">Avantages Membres</h3>
          <p className="text-slate-400 text-sm md:text-base font-bold uppercase tracking-widest">Une expérience sans aucune limite</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {[
            { icon: Image, label: 'Photos', desc: 'Accès Illimité', color: 'text-rose-400' },
            { icon: Video, label: 'Streaming', desc: 'Direct Privé', color: 'text-rose-400' },
            { icon: MessageSquare, label: 'Chat VIP', desc: 'Surtaxe Offerte', color: 'text-rose-400' },
            { icon: Sparkles, label: 'Contenu', desc: 'Personnalisé', color: 'text-rose-400' }
          ].map((perk, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] text-center border border-slate-50 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${perk.color} bg-rose-50/50 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <perk.icon size={24} />
              </div>
              <h5 className="font-black text-slate-800 text-sm uppercase mb-1">{perk.label}</h5>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientSubscriptionSectionSimple;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Crown,
  Check,
  Star,
  Shield,
  Video,
  MessageSquare,
  Search
} from 'lucide-react';

const ClientSubscriptionSectionSimple = ({ currentUser }) => {
  const navigate = useNavigate();
  const currentPlan = currentUser?.subscription?.plan || 'basic';
  const subscriptionStatus = currentUser?.subscription?.status || 'inactive';

  const subscriptionPlans = [
    {
      id: 'premium',
      name: 'Premium Pass',
      price: 49,
      features: ['Galerie HD complète', 'Contenu privé exclusif', 'Chat prioritaire', 'Photos quotidiennes'],
      popular: true
    },
    {
      id: 'vip',
      name: 'Elite VIP',
      price: 199,
      features: ['Live Streaming illimité', 'Appels vidéo privés', 'WhatsApp direct', 'Contenu sur mesure'],
      popular: false
    }
  ];

  const handlePurchase = (plan) => {
    navigate('/dashboard/payment', {
      state: {
        plan: { id: plan.id, name: plan.name, price: plan.price },
        user: { uid: currentUser?.uid, email: currentUser?.email, displayName: currentUser?.displayName },
        fromDashboard: true
      }
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full p-4 md:p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Abonnements Elite</h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm">Débloquez l'accès exclusif à mes contenus privés et services VIP.</p>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Crown size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</p>
            <p className="text-sm font-bold text-gray-800">{currentPlan.toUpperCase()} — {subscriptionStatus.toUpperCase()}</p>
          </div>
          <button onClick={() => navigate('/dashboard/payment-tracking')} className="ml-4 p-2 text-gray-300 hover:text-indigo-600 border-l pl-4"><Search size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subscriptionPlans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-[2rem] p-8 border ${plan.popular ? 'border-indigo-600 shadow-xl shadow-indigo-50' : 'border-gray-100'} flex flex-col relative`}>
            {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Populaire</span>}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
              <div className="flex items-baseline mt-2">
                <span className="text-4xl font-black text-gray-900">{plan.price}€</span>
                <span className="text-gray-400 text-sm ml-1">/mois</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center"><Check size={12} className="text-indigo-600" /></div>
                  <span className="text-sm text-gray-600">{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => handlePurchase(plan)} disabled={plan.id === currentPlan} className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest transition-all ${plan.id === currentPlan ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-indigo-600 shadow-lg shadow-gray-200'}`}>
              {plan.id === currentPlan ? 'Plan Actuel' : 'Choisir ce plan'}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-gray-50">
        {[{ icon: Shield, label: 'Sécurisé' }, { icon: Video, label: 'HD Live' }, { icon: MessageSquare, label: 'Support' }, { icon: Star, label: 'Exclusif' }].map((p, i) => (
          <div key={i} className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300"><p.icon size={18} /></div>
            <p className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">{p.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientSubscriptionSectionSimple;

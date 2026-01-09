import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Shield,
  Diamond
} from 'lucide-react';

const ClientSubscriptionSection = ({ currentUser }) => {
  const navigate = useNavigate();
  const isPremium = currentUser?.subscription?.status === 'active' &&
    (currentUser?.subscription?.type === 'premium' || currentUser?.subscription?.type === 'vip');

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
        'Support prioritaire'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium VIP',
      price: 79,
      period: 'mois',
      features: [
        'Tout du Basic',
        'Vidéos exclusives HD',
        'Sessions streaming privées',
        'Contenu personnalisé',
        'Appels vidéo 1:1 (30min/mois)',
        'Accès prioritaire aux RDV'
      ],
      popular: true
    },
    {
      id: 'vip',
      name: 'VIP Exclusive',
      price: 149,
      period: 'mois',
      features: [
        'Tout du Premium',
        'Streaming illimité',
        'Contenu personnalisé quotidien',
        'Appels vidéo illimités',
        'Accès VIP aux événements',
        'Concierge personnel'
      ],
      popular: false
    }
  ];

  const currentPlan = subscriptionPlans.find(plan => plan.id === currentUser?.subscription?.type) || subscriptionPlans[0];

  // Fonction pour gérer l'achat d'abonnement
  const handleSubscribe = (planId) => {
    const selectedPlan = subscriptionPlans.find(plan => plan.id === planId);

    if (selectedPlan) {
      // Rediriger vers la page de paiement avec les détails du plan
      navigate('/dashboard/payment', {
        state: {
          plan: {
            id: selectedPlan.id,
            name: selectedPlan.name,
            price: selectedPlan.price,
            features: selectedPlan.features,
            description: `Abonnement ${selectedPlan.name} - Accès complet aux fonctionnalités`
          },
          user: {
            uid: currentUser?.uid,
            email: currentUser?.email,
            displayName: currentUser?.displayName
          }
        }
      });
    }
  };

  // Fonction pour modifier l'abonnement
  const handleModifySubscription = () => {
    // Rediriger vers la page d'abonnements pour changer de plan
    navigate('/payment', {
      state: {
        plan: currentPlan,
        user: {
          uid: currentUser?.uid,
          email: currentUser?.email,
          displayName: currentUser?.displayName
        },
        isModification: true
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <CreditCard className="w-6 h-6 text-pink-500 mr-2" />
            Mon Abonnement
          </h2>
          <p className="text-gray-600">Gérez votre abonnement et accédez au contenu premium</p>
        </div>
      </div>

      {/* Current Subscription Status */}
      {isPremium ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Crown className="w-8 h-8 text-yellow-300" />
                <h3 className="text-2xl font-bold">Abonnement Premium Actif</h3>
              </div>
              <p className="text-pink-100 mb-4">
                Vous profitez de tous les avantages premium
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span>Plan: {currentPlan.name}</span>
                <span>•</span>
                <span>Renouvelé le {new Date(currentUser?.subscription?.endDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Lock className="w-8 h-8 text-gray-300" />
                <h3 className="text-2xl font-bold">Aucun Abonnement Actif</h3>
              </div>
              <p className="text-gray-100 mb-4">
                Découvrez nos abonnements pour accéder au contenu exclusif
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features Comparison */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-6">Fonctionnalités Incluses</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-pink-500" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Galerie Premium</h4>
            <p className="text-sm text-gray-600">
              {isPremium ? 'Accès complet' : 'Accès limité'}
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-purple-500" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Sessions Live</h4>
            <p className="text-sm text-gray-600">
              {isPremium ? 'Illimitées' : 'Non disponible'}
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Messages Privés</h4>
            <p className="text-sm text-gray-600">
              {isPremium ? 'Illimités' : 'Limités'}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Plans d'Abonnement</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-xl border-2 p-6 ${plan.popular
                  ? 'border-pink-500 shadow-lg'
                  : 'border-gray-200 hover:border-pink-100'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Populaire
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h4>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-800">€{plan.price}</span>
                  <span className="text-gray-600 ml-1">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-pink-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => currentUser?.subscription?.type !== plan.id && handleSubscribe(plan.id)}
                disabled={currentUser?.subscription?.type === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${currentUser?.subscription?.type === plan.id
                    ? 'bg-pink-100 text-pink-800 cursor-not-allowed'
                    : plan.popular
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-pink-50'
                  }`}
              >
                {currentUser?.subscription?.type === plan.id ? 'Plan Actuel' : 'Choisir ce Plan'}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      {isPremium && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Historique des Factures</h3>

          <div className="space-y-3">
            {[
              { date: '2024-01-15', amount: 79, status: 'paid' },
              { date: '2023-12-15', amount: 79, status: 'paid' },
              { date: '2023-11-15', amount: 79, status: 'paid' }
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800">Facture #{index + 1}</p>
                    <p className="text-sm text-gray-500">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-800">€{invoice.amount}</span>
                  <span className="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-medium">
                    Payé
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {isPremium ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleModifySubscription}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Modifier l'Abonnement
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler l'Abonnement
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSubscribe('premium')}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            Commencer l'Abonnement Premium
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ClientSubscriptionSection;

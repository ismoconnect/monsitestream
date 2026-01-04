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
  Target
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
      popular: false
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
        'Accès VIP aux événements'
      ],
      popular: true
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 99,
      period: 'mois',
      features: [
        'Tout du plan Premium',
        'Accès 24/7',
        'Contenu personnalisé',
        'Sessions privées illimitées',
        'Support prioritaire',
        'Cadeaux exclusifs'
      ],
      popular: false
    }
  ];

  const currentPlan = currentUser?.subscription?.plan || 'free';
  const subscriptionStatus = currentUser?.subscription?.status || 'inactive';

  // Gérer l'achat d'abonnement - Redirection vers page de paiement
  const handlePurchaseSubscription = (planId) => {
    const selectedPlan = subscriptionPlans.find(plan => plan.id === planId);
    
    if (selectedPlan) {
      console.log('🛒 Redirection vers paiement pour:', planId);
      
      // Rediriger vers la page de paiement avec les détails du plan
      navigate('/dashboard/payment', {
        state: {
          plan: {
            id: selectedPlan.id,
            name: selectedPlan.name,
            price: selectedPlan.price,
            features: selectedPlan.features,
            description: selectedPlan.description || `Abonnement ${selectedPlan.name} - Accès complet`
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-2 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 w-full max-w-full min-w-0" style={{ maxWidth: '100%' }}>
        {/* Header Élégant */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 lg:mb-8 w-full max-w-full overflow-hidden"
        >
          <div className="flex flex-col space-y-3 sm:space-y-4 min-w-0 w-full max-w-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-lg opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 p-2 sm:p-3 rounded-full">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent truncate">
                        Mon Abonnement
                      </h2>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 truncate">
                        Gérez votre abonnement
                      </p>
                    </div>
                    
                    {/* Bouton Suivi des Paiements */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/dashboard/payment-tracking')}
                      className="hidden sm:flex items-center space-x-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 py-2 px-3 lg:px-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <Search className="h-4 w-4" />
                      <span className="hidden lg:inline">Suivi Paiements</span>
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Stats Élégantes */}
              <div className="flex flex-col space-y-1 sm:space-y-2 mt-2 sm:mt-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      subscriptionStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs sm:text-sm text-gray-600 truncate">
                      Plan {currentPlan === 'free' ? 'Gratuit' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Diamond className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <span className="text-xs sm:text-sm text-gray-600 truncate">
                      Premium
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="text-xs sm:text-sm text-gray-600 truncate">
                      {subscriptionStatus === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statut d'Abonnement Élégant */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-full overflow-hidden"
        >
          <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4 lg:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-lg opacity-30 ${
                  subscriptionStatus === 'active' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}></div>
                <div className={`relative p-2 sm:p-3 rounded-full ${
                  subscriptionStatus === 'active' 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200'
                }`}>
                  <Crown className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${
                    subscriptionStatus === 'active' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">
                  Plan {currentPlan === 'free' ? 'Gratuit' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </h3>
                <p className={`text-xs sm:text-sm ${
                  subscriptionStatus === 'active' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {subscriptionStatus === 'active' ? 'Abonnement actif' : 'Inactif'}
                </p>
              </div>
              {subscriptionStatus === 'active' && (
                <div className="flex-shrink-0">
                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Actif</span>
                    <span className="sm:hidden">✓</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Message pour utilisateurs gratuits */}
          {isFreeUser && subscriptionStatus === 'active' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl"
            >
              <div className="flex items-center gap-2 text-center justify-center">
                <Crown className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700 font-medium">
                  Votre compte est activé ! Choisissez un abonnement ci-dessous pour accéder au contenu premium.
                </p>
              </div>
            </motion.div>
          )}

          {subscriptionStatus === 'active' && !isFreeUser && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 gap-2 sm:gap-3 text-sm"
            >
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-1.5 sm:p-2 rounded-lg">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Renouvellement</p>
                  <p className="text-gray-700 font-medium truncate text-xs sm:text-sm">
                    {new Date(currentUser?.subscription?.endDate || Date.now()).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-1.5 sm:p-2 rounded-lg">
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Paiement</p>
                  <p className="text-gray-700 font-medium truncate text-xs sm:text-sm">Automatique</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-pink-50 rounded-xl">
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-1.5 sm:p-2 rounded-lg">
                  <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Avantages</p>
                  <p className="text-gray-700 font-medium truncate text-xs sm:text-sm">Premium actifs</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Plans d'Abonnement Élégants */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-full overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-1.5 sm:p-2 rounded-lg">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <span className="truncate">Plans d'abonnement</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 w-full max-w-full">
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className={`relative bg-white rounded-xl p-3 sm:p-4 lg:p-6 border-2 transition-all duration-300 w-full max-w-full overflow-hidden h-full flex flex-col ${
                  plan.popular
                    ? 'border-pink-500 shadow-lg shadow-pink-500/25'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                } ${plan.id === currentPlan ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-1 sm:gap-2">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Populaire</span>
                      <span className="sm:hidden">★</span>
                    </span>
                  </div>
                )}

                {plan.id === currentPlan && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Actuel</span>
                    </span>
                  </div>
                )}

                <div className="text-center mb-3 sm:mb-4 lg:mb-6 pt-1 sm:pt-2">
                  <div className="relative mb-2 sm:mb-3 lg:mb-4">
                    <div className={`absolute inset-0 rounded-full blur-lg opacity-20 ${
                      plan.id === 'basic' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                      plan.id === 'premium' ? 'bg-gradient-to-r from-pink-500 to-purple-600' :
                      'bg-gradient-to-r from-purple-500 to-indigo-600'
                    }`}></div>
                    <div className={`relative p-2 sm:p-3 lg:p-4 rounded-full mx-auto w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center ${
                      plan.id === 'basic' ? 'bg-gradient-to-r from-blue-100 to-cyan-100' :
                      plan.id === 'premium' ? 'bg-gradient-to-r from-pink-100 to-purple-100' :
                      'bg-gradient-to-r from-purple-100 to-indigo-100'
                    }`}>
                      {plan.id === 'basic' ? <Shield className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600`} /> :
                       plan.id === 'premium' ? <Crown className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-pink-600`} /> :
                       <Diamond className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600`} />}
                    </div>
                  </div>
                  <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-1 sm:mb-2 truncate">{plan.name}</h4>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                      plan.id === 'basic' ? 'from-blue-600 to-cyan-600' :
                      plan.id === 'premium' ? 'from-pink-600 to-purple-600' :
                      'from-purple-600 to-indigo-600'
                    }`}>{plan.price}€</span>
                    <span className="text-gray-600 text-xs sm:text-sm">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 mb-3 sm:mb-4 lg:mb-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <motion.li 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-start gap-2"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-0.5 sm:p-1 rounded-full">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <motion.button
                    onClick={() => handlePurchaseSubscription(plan.id)}
                    disabled={plan.id === currentPlan}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm lg:text-base ${
                      plan.id === currentPlan
                        ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25'
                        : plan.id === 'basic'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Activation...
                      </div>
                    ) : plan.id === currentPlan ? (
                      'Plan actuel'
                    ) : (
                      `Acheter ${plan.name}`
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Avantages Premium Élégants */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 sm:p-4 lg:p-6 w-full max-w-full overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-1.5 sm:p-2 rounded-lg">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              </div>
              <span className="truncate">Avantages Premium</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-20"></div>
                <div className="relative p-1.5 sm:p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
                  <Image className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-pink-600" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base truncate">Photos exclusives</h4>
                <p className="text-xs text-gray-600 truncate">Contenu privé</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full blur-lg opacity-20"></div>
                <div className="relative p-1.5 sm:p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                  <Video className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-purple-600" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base truncate">Streaming live</h4>
                <p className="text-xs text-gray-600 truncate">Sessions privées</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full blur-lg opacity-20"></div>
                <div className="relative p-1.5 sm:p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base truncate">Messages VIP</h4>
                <p className="text-xs text-gray-600 truncate">Réponse prioritaire</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-lg opacity-20"></div>
                <div className="relative p-1.5 sm:p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base truncate">Contenu personnalisé</h4>
                <p className="text-xs text-gray-600 truncate">Sur demande</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Actions de Gestion Élégantes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-2 sm:gap-3 w-full max-w-full"
        >
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/dashboard/payment-tracking')}
            className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base"
          >
            <Search className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span>Suivi de mes Paiements</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span>Modifier le paiement</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span>Annuler l'abonnement</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientSubscriptionSectionSimple;

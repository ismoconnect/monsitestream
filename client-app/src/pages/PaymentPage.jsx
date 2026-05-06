import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard,
  Building2,
  Gift,
  Ticket,
  ArrowLeft,
  Check,
  Shield,
  Crown,
  Diamond,
  Lock,
  Star,
  Heart,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { paymentService, GIFT_CARD_TYPES } from '../services/paymentService';
import ClientSidebar from '../components/Dashboard/ClientSidebar';
import ClientHeader from '../components/Dashboard/ClientHeader';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  // Debug de l'authentification
  console.log('PaymentPage - currentUser:', currentUser);
  console.log('PaymentPage - currentUser.uid:', currentUser?.uid);
  console.log('PaymentPage - currentUser.email:', currentUser?.email);

  // Redirection si pas d'utilisateur connecté
  useEffect(() => {
    if (currentUser === null) {
      console.log('Pas d\'utilisateur connecté, redirection vers accueil');
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Affichage de chargement si l'utilisateur n'est pas encore chargé
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Récupérer les données du plan depuis l'URL ou les props
  const selectedPlan = location.state?.plan || {
    id: 'premium',
    name: 'Premium',
    price: 99,
    features: ['Appels vidéo illimités', 'Messages privés', 'Galerie exclusive']
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGiftCardType, setSelectedGiftCardType] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    // Carte cadeau
    giftCardCode: '',

    // Coupon
    couponCode: ''
  });

  const paymentMethods = [
    {
      id: 'paypal',
      name: 'PayPal',
      icon: CreditCard,
      description: 'Paiement sécurisé via PayPal',
      color: 'from-blue-500 to-blue-600',
      available: true
    },
    {
      id: 'bank_transfer',
      name: 'Virement Bancaire',
      icon: Building2,
      description: 'Virement SEPA ou international',
      color: 'from-green-500 to-green-600',
      available: true
    },
    {
      id: 'gift_card',
      name: 'Carte Cadeau',
      icon: Gift,
      description: 'Utiliser une carte cadeau',
      color: 'from-pink-500 to-pink-600',
      available: true
    },
    {
      id: 'coupon',
      name: 'Coupon de Réduction',
      icon: Ticket,
      description: 'Code promo ou coupon',
      color: 'from-purple-500 to-purple-600',
      available: true
    }
  ];

  const getPlanIcon = (planId) => {
    const icons = {
      basic: Shield,
      premium: Crown,
      vip: Diamond
    };
    return icons[planId] || Crown;
  };

  const getPlanColor = (planId) => {
    const colors = {
      basic: 'from-blue-500 to-blue-600',
      premium: 'from-pink-500 to-pink-600',
      vip: 'from-purple-500 to-purple-600'
    };
    return colors[planId] || 'from-pink-500 to-pink-600';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getButtonText = () => {
    switch (selectedPaymentMethod) {
      case 'paypal':
        return 'Continuer vers votre paiement PayPal';
      case 'bank_transfer':
        return 'Demander les informations de virement';
      case 'gift_card':
        return 'Valider ma carte cadeau';
      case 'coupon':
        return 'Utiliser mon coupon de réduction';
      default:
        return `Confirmer l'abonnement ${selectedPlan.name} - ${selectedPlan.price}€`;
    }
  };

  const handlePayment = async () => {
    console.log('handlePayment appelé - currentUser:', currentUser);

    if (!selectedPaymentMethod) {
      alert('Veuillez sélectionner un mode de paiement');
      return;
    }

    if (!currentUser) {
      alert('Authentification en cours... Veuillez patienter ou vous reconnecter.');
      return;
    }

    const userId = currentUser.uid || currentUser.id;
    if (!userId) {
      alert('Erreur d\'authentification. ID utilisateur manquant.');
      console.error('currentUser sans uid/id:', currentUser);
      return;
    }

    // Validation spécifique selon la méthode
    if (selectedPaymentMethod === 'gift_card') {
      if (!selectedGiftCardType) {
        alert('Veuillez sélectionner un type de carte cadeau');
        return;
      }
      if (!formData.giftCardCode) {
        alert('Veuillez entrer le code de votre carte cadeau');
        return;
      }
    }

    // Pas de validation nécessaire pour le virement bancaire
    // L'admin fournira toutes les informations nécessaires

    if (selectedPaymentMethod === 'coupon') {
      if (!formData.couponCode) {
        alert('Veuillez entrer votre code coupon');
        return;
      }
    }

    console.log('Données utilisateur:', {
      uid: currentUser.uid,
      id: currentUser.id,
      userId: userId,
      email: currentUser.email,
      displayName: currentUser.displayName
    });
    console.log('Plan sélectionné:', selectedPlan);

    setIsProcessing(true);

    try {
      let paymentRequest;

      switch (selectedPaymentMethod) {
        case 'paypal':
          paymentRequest = await paymentService.createPayPalRequest(
            userId,
            selectedPlan,
            currentUser.email
          );
          break;

        case 'bank_transfer':
          paymentRequest = await paymentService.createBankTransferRequest(
            userId,
            selectedPlan,
            currentUser.email,
            {} // Pas de données bancaires utilisateur nécessaires
          );
          break;

        case 'gift_card':
          const giftCardType = GIFT_CARD_TYPES.find(type => type.id === selectedGiftCardType);
          paymentRequest = await paymentService.createGiftCardRequest(
            userId,
            selectedPlan,
            currentUser.email,
            {
              type: selectedGiftCardType,
              typeName: giftCardType?.name,
              code: formData.giftCardCode
            }
          );
          break;

        case 'coupon':
          paymentRequest = await paymentService.createPaymentRequest({
            userId: userId,
            userEmail: currentUser.email,
            plan: selectedPlan,
            type: 'coupon',
            amount: selectedPlan.price,
            currency: 'EUR',
            paymentDetails: {
              method: 'Coupon de recharge',
              couponCode: formData.couponCode,
              description: `Abonnement ${selectedPlan.name}`
            }
          });
          break;
      }

      // Redirection vers la page de statut de paiement
      navigate('/dashboard/payment-status', {
        state: {
          paymentId: paymentRequest.id,
          referenceCode: paymentRequest.referenceCode,
          plan: selectedPlan,
          paymentMethod: selectedPaymentMethod
        }
      });
    } catch (error) {
      console.error('Erreur de paiement:', error);
      alert('Erreur lors du traitement du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedPaymentMethod) {
      case 'paypal':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">💳 Processus PayPal :</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Après confirmation, notre équipe préparera votre demande de paiement</p>
                <p>• Vous recevrez un email avec le lien PayPal sécurisé personnalisé</p>
                <p>• Cliquez sur le lien pour effectuer votre paiement en toute sécurité</p>
                <p>• Votre abonnement sera activé dès réception du paiement</p>
              </div>
            </div>
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">🏦 Processus de virement :</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• Après confirmation, notre équipe préparera votre demande de virement</p>
                <p>• Vous recevrez un email avec notre RIB complet et la référence unique</p>
                <p>• Effectuez le virement depuis votre banque avec la référence fournie</p>
                <p>• Votre abonnement sera activé dès réception du paiement</p>
                <p>• <strong>Délai :</strong> 1-2 jours ouvrés pour les virements SEPA</p>
              </div>
            </div>
          </div>
        );

      case 'gift_card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de carte cadeau
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {GIFT_CARD_TYPES.map((cardType) => (
                  <motion.button
                    key={cardType.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGiftCardType(cardType.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${selectedGiftCardType === cardType.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-2xl mb-1">{cardType.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{cardType.name}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {selectedGiftCardType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de la carte cadeau
                </label>
                <input
                  type="text"
                  value={formData.giftCardCode}
                  onChange={(e) => handleInputChange('giftCardCode', e.target.value.toUpperCase())}
                  placeholder="Entrez le code de votre carte cadeau"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono"
                />
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-pink-800">
                    🎁 Votre paiement sera validé automatiquement après vérification de votre code.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'coupon':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code coupon de réduction
              </label>
              <input
                type="text"
                value={formData.couponCode}
                onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
                placeholder="COUPON2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
              />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800">
                🎫 Utilisez votre code coupon pour bénéficier d'une réduction ou d'un accès gratuit.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <ClientSidebar
        currentUser={currentUser}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ClientHeader
          currentUser={currentUser}
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        />

        {/* Content Area - Mobile optimized */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50 p-4 pt-[80px] lg:pt-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Finaliser votre abonnement</h1>
              <p className="text-gray-600">Choisissez votre mode de paiement préféré</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Résumé du plan */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
                >
                  <div className={`bg-gradient-to-r ${getPlanColor(selectedPlan.id)} text-white rounded-xl p-6 mb-6`}>
                    <div className="flex items-center justify-center mb-4">
                      {React.createElement(getPlanIcon(selectedPlan.id), { className: 'w-12 h-12' })}
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2">{selectedPlan.name}</h3>
                    <div className="text-center">
                      <span className="text-3xl font-bold">{selectedPlan.price}€</span>
                      <span className="text-sm opacity-90">/mois</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Fonctionnalités incluses :</h4>
                    {selectedPlan.features?.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total :</span>
                      <span className="text-pink-600">{selectedPlan.price}€</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Modes de paiement */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Choisissez votre mode de paiement</h2>

                  {/* Méthodes de paiement */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <motion.button
                          key={method.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`p-4 border-2 rounded-xl transition-all ${selectedPaymentMethod === method.id
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-800">{method.name}</h3>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Formulaire de paiement */}
                  <AnimatePresence mode="wait">
                    {selectedPaymentMethod && (
                      <motion.div
                        key={selectedPaymentMethod}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-50 rounded-xl p-6 mb-6"
                      >
                        <h3 className="font-semibold text-gray-800 mb-4">
                          Informations de paiement - {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                        </h3>
                        {renderPaymentForm()}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Sécurité et conditions */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Lock className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Paiement 100% sécurisé</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Vos données sont cryptées et protégées</p>
                      <p>• Aucune information bancaire stockée</p>
                      <p>• Annulation possible à tout moment</p>
                      <p>• Support client 24h/7j</p>
                    </div>
                  </div>

                  {/* Bouton de paiement */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={!selectedPaymentMethod || isProcessing}
                    className={`w-full py-4 px-6 bg-gradient-to-r ${selectedPaymentMethod === 'paypal'
                        ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                        : selectedPaymentMethod === 'bank_transfer'
                          ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                          : selectedPaymentMethod === 'gift_card'
                            ? 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
                            : selectedPaymentMethod === 'coupon'
                              ? 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                              : getPlanColor(selectedPlan.id)
                      } text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Traitement en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        {selectedPaymentMethod === 'paypal' && (
                          <>
                            <CreditCard className="h-5 w-5" />
                            <span>{getButtonText()}</span>
                            <span>→</span>
                          </>
                        )}
                        {selectedPaymentMethod === 'bank_transfer' && (
                          <>
                            <Building2 className="h-5 w-5" />
                            <span>{getButtonText()}</span>
                            <Sparkles className="h-5 w-5" />
                          </>
                        )}
                        {selectedPaymentMethod === 'gift_card' && (
                          <>
                            <Gift className="h-5 w-5" />
                            <span>{getButtonText()}</span>
                            <Check className="h-5 w-5" />
                          </>
                        )}
                        {selectedPaymentMethod === 'coupon' && (
                          <>
                            <Ticket className="h-5 w-5" />
                            <span>{getButtonText()}</span>
                            <Check className="h-5 w-5" />
                          </>
                        )}
                        {!selectedPaymentMethod && (
                          <>
                            <Heart className="h-5 w-5" />
                            <span>{getButtonText()}</span>
                            <Sparkles className="h-5 w-5" />
                          </>
                        )}
                      </div>
                    )}
                  </motion.button>

                  {/* Conditions */}
                  <p className="text-xs text-gray-500 text-center mt-4">
                    En confirmant, vous acceptez nos{' '}
                    <a href="#" className="text-pink-600 hover:underline">conditions d'utilisation</a> et notre{' '}
                    <a href="#" className="text-pink-600 hover:underline">politique de confidentialité</a>.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentPage;

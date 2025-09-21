import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Copy,
  Mail,
  CreditCard,
  Gift,
  Banknote,
  Ticket,
  RefreshCw
} from 'lucide-react';
import { paymentService, PAYMENT_STATUS } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import ClientSidebar from '../components/Dashboard/ClientSidebar';
import ClientHeader from '../components/Dashboard/ClientHeader';

const PaymentStatusPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };
  
  const { paymentId, referenceCode, plan, paymentMethod } = location.state || {};
  
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      navigate('/dashboard/subscription');
      return;
    }

    // Écouter les changements de statut en temps réel
    const unsubscribe = paymentService.listenToPaymentStatus(paymentId, (paymentData) => {
      setPayment(paymentData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [paymentId, navigate]);

  const copyReferenceCode = async () => {
    try {
      await navigator.clipboard.writeText(referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      paypal: CreditCard,
      bank_transfer: Banknote,
      gift_card: Gift,
      coupon: Ticket
    };
    return icons[method] || CreditCard;
  };

  const getStatusInfo = (status) => {
    const statusInfo = paymentService.getStatusDisplay(status);
    const statusConfig = {
      [PAYMENT_STATUS.PENDING]: {
        ...statusInfo,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800'
      },
      [PAYMENT_STATUS.WAITING_PAYMENT]: {
        ...statusInfo,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800'
      },
      [PAYMENT_STATUS.VALIDATING]: {
        ...statusInfo,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800'
      },
      [PAYMENT_STATUS.COMPLETED]: {
        ...statusInfo,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800'
      },
      [PAYMENT_STATUS.REJECTED]: {
        ...statusInfo,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800'
      },
      [PAYMENT_STATUS.EXPIRED]: {
        ...statusInfo,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800'
      }
    };

    return statusConfig[status] || statusConfig[PAYMENT_STATUS.PENDING];
  };

  const getStatusMessage = (status, method) => {
    switch (status) {
      case PAYMENT_STATUS.PENDING:
        return "Votre demande de paiement a été créée et est en cours de traitement.";
      
      case PAYMENT_STATUS.WAITING_PAYMENT:
        if (method === 'paypal') {
          return "Vous recevrez bientôt un email avec le lien PayPal pour effectuer votre paiement.";
        } else if (method === 'bank_transfer') {
          return "Vous recevrez bientôt un email avec les informations de virement bancaire.";
        }
        return "En attente des informations de paiement.";
      
      case PAYMENT_STATUS.VALIDATING:
        return "Votre paiement est en cours de validation par notre équipe.";
      
      case PAYMENT_STATUS.COMPLETED:
        return "Félicitations ! Votre paiement a été validé et votre abonnement est maintenant actif.";
      
      case PAYMENT_STATUS.REJECTED:
        return "Votre paiement a été rejeté. Contactez le support pour plus d'informations.";
      
      case PAYMENT_STATUS.EXPIRED:
        return "Cette demande de paiement a expiré. Veuillez créer une nouvelle demande.";
      
      default:
        return "Statut de paiement en cours de mise à jour...";
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex overflow-hidden">
        <ClientSidebar 
          currentUser={currentUser} 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onSignOut={handleSignOut}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <ClientHeader 
            currentUser={currentUser}
            onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
          />
          <main className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-8 w-8 text-purple-600" />
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(payment?.status);
  const PaymentMethodIcon = getPaymentMethodIcon(paymentMethod);

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
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4">
          <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Statut du Paiement</h1>
          <p className="text-gray-600">Suivez l'évolution de votre demande</p>
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2 rounded-xl p-6 mb-6`}
        >
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 ${statusInfo.bgColor} rounded-full flex items-center justify-center border-2 ${statusInfo.borderColor}`}>
              <span className="text-2xl">{statusInfo.icon}</span>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className={`text-xl font-semibold ${statusInfo.textColor} mb-2`}>
              {statusInfo.text}
            </h2>
            <p className={`${statusInfo.textColor} opacity-80`}>
              {getStatusMessage(payment?.status, paymentMethod)}
            </p>
          </div>
        </motion.div>

        {/* Payment Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Détails du Paiement</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plan sélectionné</span>
              <span className="font-medium text-gray-800">{plan?.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Montant</span>
              <span className="font-medium text-gray-800">{plan?.price}€</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Méthode de paiement</span>
              <div className="flex items-center space-x-2">
                <PaymentMethodIcon className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-800">
                  {paymentMethod === 'paypal' && 'PayPal'}
                  {paymentMethod === 'bank_transfer' && 'Virement bancaire'}
                  {paymentMethod === 'gift_card' && 'Carte cadeau'}
                  {paymentMethod === 'coupon' && 'Coupon'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Code de référence</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {referenceCode}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyReferenceCode}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-600" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        {payment?.status === PAYMENT_STATUS.WAITING_PAYMENT && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6"
          >
            <div className="flex items-start space-x-3">
              <Mail className="h-6 w-6 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Instructions de Paiement</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  Un email contenant les instructions de paiement sera envoyé à <strong>{currentUser?.email}</strong> dans les plus brefs délais. 
                  Vous pouvez également revenir sur cette page en utilisant votre code de référence.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/subscription')}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Retour à Mon Abonnement
            </motion.button>
            
            {payment?.status === PAYMENT_STATUS.COMPLETED && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Accéder au Dashboard
              </motion.button>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/payment-tracking', { 
              state: { referenceCode: referenceCode } 
            })}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium border border-gray-200 hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Voir tous mes paiements</span>
          </motion.button>
        </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentStatusPage;

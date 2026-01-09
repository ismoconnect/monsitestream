import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
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
  RefreshCw,
  Calendar,
  Euro,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { paymentService, PAYMENT_STATUS } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import ClientSidebar from '../components/Dashboard/ClientSidebar';
import ClientHeader from '../components/Dashboard/ClientHeader';

const PaymentTrackingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const [referenceCode, setReferenceCode] = useState('');
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPayments, setUserPayments] = useState([]);
  const [showUserPayments, setShowUserPayments] = useState(true);
  const [copied, setCopied] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Charger les paiements de l'utilisateur au démarrage
  useEffect(() => {
    if (currentUser) {
      loadUserPayments();
    }
  }, [currentUser]);

  // Charger automatiquement si un code de référence est passé dans l'URL
  useEffect(() => {
    const codeFromState = location.state?.referenceCode;
    if (codeFromState) {
      setReferenceCode(codeFromState);
      searchPayment(codeFromState);
    }
  }, [location.state]);

  const loadUserPayments = async () => {
    try {
      const userId = currentUser.uid || currentUser.id;
      if (userId) {
        const payments = await paymentService.getUserPayments(userId);
        setUserPayments(payments);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
    }
  };

  const searchPayment = async (code = referenceCode) => {
    if (!code.trim()) {
      setError('Veuillez entrer un code de référence');
      return;
    }

    setLoading(true);
    setError('');
    setPayment(null);

    try {
      const foundPayment = await paymentService.getPaymentByReference(code.trim().toUpperCase());

      if (foundPayment) {
        setPayment(foundPayment);
        setShowUserPayments(false);
      } else {
        setError('Aucun paiement trouvé avec ce code de référence');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError('Erreur lors de la recherche du paiement');
    } finally {
      setLoading(false);
    }
  };

  const copyReferenceCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(''), 2000);
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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PaymentCard = ({ payment, isDetailed = false }) => {
    const statusInfo = getStatusInfo(payment.status);
    const PaymentMethodIcon = getPaymentMethodIcon(payment.type);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2 rounded-xl p-4 lg:p-6`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${statusInfo.bgColor} rounded-full flex items-center justify-center border-2 ${statusInfo.borderColor}`}>
              <span className="text-xl">{statusInfo.icon}</span>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${statusInfo.textColor}`}>
                {statusInfo.text}
              </h3>
              <p className="text-sm text-gray-600">
                {payment.plan?.name} - {payment.amount}€
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <PaymentMethodIcon className="h-5 w-5 text-gray-600" />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Code de référence</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm bg-white/50 px-2 py-1 rounded">
                {payment.referenceCode}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyReferenceCode(payment.referenceCode)}
                className="p-1 hover:bg-white/30 rounded transition-colors"
              >
                {copied === payment.referenceCode ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-600" />
                )}
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Date de création</span>
            <span className="text-sm font-medium">
              {formatDate(payment.createdAt)}
            </span>
          </div>

          {payment.updatedAt && payment.updatedAt !== payment.createdAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dernière mise à jour</span>
              <span className="text-sm font-medium">
                {formatDate(payment.updatedAt)}
              </span>
            </div>
          )}

          {isDetailed && payment.paymentDetails && (
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Détails du paiement</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Méthode :</strong> {payment.paymentDetails.method}</p>
                {payment.paymentDetails.description && (
                  <p><strong>Description :</strong> {payment.paymentDetails.description}</p>
                )}
              </div>
            </div>
          )}

          {payment.adminNote && (
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Note de l'équipe</h4>
              <p className="text-sm text-gray-600 italic">"{payment.adminNote}"</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isDetailed && (
          <div className="mt-4 pt-3 border-t">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setReferenceCode(payment.referenceCode);
                searchPayment(payment.referenceCode);
              }}
              className="w-full bg-white/50 hover:bg-white/70 text-gray-700 py-2 px-4 rounded-lg transition-all text-sm font-medium"
            >
              Voir les détails
            </motion.button>
          </div>
        )}
      </motion.div>
    );
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

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-3 sm:p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Suivi des Paiements</h1>
              <p className="text-gray-600">Vérifiez l'avancement de vos demandes de paiement</p>
            </div>

            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Rechercher par Code de Référence
              </h2>

              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                    placeholder="PAY-XXXXXXX-XXXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                    maxLength={20}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => searchPayment()}
                  disabled={loading || !referenceCode.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </motion.button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Toggle User Payments */}
            {userPayments.length > 0 && (
              <div className="mb-6">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowUserPayments(!showUserPayments)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {showUserPayments ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {showUserPayments ? 'Masquer' : 'Afficher'} mes paiements ({userPayments.length})
                  </span>
                </motion.button>
              </div>
            )}

            {/* User Payments List */}
            <AnimatePresence>
              {showUserPayments && userPayments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Mes Paiements Récents
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {userPayments.slice(0, 4).map((userPayment) => (
                      <PaymentCard key={userPayment.id} payment={userPayment} />
                    ))}
                  </div>

                  {userPayments.length > 4 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUserPayments(userPayments.slice(0, userPayments.length))}
                      className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-all text-sm font-medium"
                    >
                      Voir tous mes paiements ({userPayments.length})
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Result */}
            <AnimatePresence>
              {payment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Détails du Paiement
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setPayment(null);
                        setReferenceCode('');
                        setShowUserPayments(true);
                      }}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                    </motion.button>
                  </div>

                  <PaymentCard payment={payment} isDetailed={true} />

                  {/* Timeline */}
                  {payment.notifications?.statusUpdates?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 bg-white rounded-xl shadow-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Historique des Statuts
                      </h3>
                      <div className="space-y-4">
                        {payment.notifications.statusUpdates.map((update, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-800">
                                  {paymentService.getStatusDisplay(update.status).text}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(update.timestamp)}
                                </span>
                              </div>
                              {update.note && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {update.note}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/payment')}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Nouveau Paiement</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/subscription')}
                  className="flex items-center justify-center space-x-2 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <User className="h-5 w-5" />
                  <span>Mon Abonnement</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                💡 Besoin d'aide ?
              </h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>• <strong>Code perdu ?</strong> Vérifiez vos emails ou consultez "Mes Paiements Récents"</p>
                <p>• <strong>Paiement en attente ?</strong> Un email avec les instructions vous sera envoyé</p>
                <p>• <strong>Problème de validation ?</strong> Contactez notre support avec votre code de référence</p>
                <p>• <strong>Paiement expiré ?</strong> Créez une nouvelle demande de paiement</p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentTrackingPage;

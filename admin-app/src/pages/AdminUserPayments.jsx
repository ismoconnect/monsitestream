import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CreditCard,
  Search,
  Check,
  X,
  Clock,
  AlertCircle,
  Mail,
  Copy,
  RefreshCw,
  Calendar,
  Euro,
  Gift,
  Banknote,
  Ticket,
  CheckCircle,
  XCircle,
  Menu
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { paymentService, PAYMENT_STATUS } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';

const AdminUserPayments = () => {
  const { userEmail } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  // Charger les paiements de l'utilisateur spécifique en temps réel
  useEffect(() => {
    if (authLoading || !currentUser || currentUser.role !== 'admin') return;

    let unsubscribe;

    const setupListener = async () => {
      try {
        setLoading(true);
        // On récupère d'abord tous les paiements pour trouver l'userId correspondant à l'email
        // (C'est nécessaire car on n'a que l'email dans l'URL)
        const allPayments = await paymentService.getAllPayments();
        const userPayment = allPayments.find(p => p.userEmail === decodeURIComponent(userEmail));

        if (userPayment?.userId) {
          unsubscribe = paymentService.listenToUserPayments(userPayment.userId, (userPayments) => {
            setPayments(userPayments);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paiements:', error);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userEmail, authLoading, currentUser]);

  const handleApprovePayment = async (paymentId) => {
    setActionLoading(true);
    try {
      await paymentService.approvePayment(paymentId, 'Paiement approuvé par l\'admin');
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation du paiement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt('Raison du rejet (optionnel):');
    setActionLoading(true);
    try {
      await paymentService.rejectPayment(paymentId, reason || 'Paiement rejeté par l\'admin');
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet du paiement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetWaitingPayment = async (paymentId) => {
    setActionLoading(true);
    try {
      await paymentService.updatePaymentStatus(paymentId, PAYMENT_STATUS.WAITING_PAYMENT, 'Instructions de paiement envoyées');
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const getStatusInfo = (status) => {
    return paymentService.getStatusDisplay(status);
  };

  const getPaymentMethodIcon = (type) => {
    const icons = {
      paypal: CreditCard,
      bank_transfer: Banknote,
      gift_card: Gift,
      coupon: Ticket
    };
    return icons[type] || CreditCard;
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

  const PaymentCard = ({ payment }) => {
    const statusInfo = getStatusInfo(payment.status);
    const PaymentMethodIcon = getPaymentMethodIcon(payment.type);

    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
        onClick={() => {
          setSelectedPayment(payment);
          setShowModal(true);
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.color === 'green' ? 'bg-green-100' :
              statusInfo.color === 'yellow' ? 'bg-yellow-100' :
                statusInfo.color === 'blue' ? 'bg-blue-100' :
                  statusInfo.color === 'orange' ? 'bg-orange-100' :
                    statusInfo.color === 'red' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
              <span className="text-lg">{statusInfo.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {payment.plan?.name} - {payment.amount}€
              </h3>
              <p className="text-sm text-gray-600">{payment.referenceCode}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <PaymentMethodIcon className="h-4 w-4 text-gray-600" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color === 'green' ? 'bg-green-100 text-green-700' :
              statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                    statusInfo.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Date de création:</span>
            <span>{formatDate(payment.createdAt)}</span>
          </div>
          {payment.paymentDetails?.method && (
            <div className="flex justify-between">
              <span>Méthode:</span>
              <span>{payment.paymentDetails.method}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Calculer les statistiques de l'utilisateur
  const userStats = {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    pending: payments.filter(p => p.status === PAYMENT_STATUS.PENDING).length,
    waitingPayment: payments.filter(p => p.status === PAYMENT_STATUS.WAITING_PAYMENT).length,
    validating: payments.filter(p => p.status === PAYMENT_STATUS.VALIDATING).length,
    completed: payments.filter(p => p.status === PAYMENT_STATUS.COMPLETED).length,
    rejected: payments.filter(p => p.status === PAYMENT_STATUS.REJECTED).length,
    expired: payments.filter(p => p.status === PAYMENT_STATUS.EXPIRED).length
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 animate-pulse font-medium">Vérification des accès...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/payments')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </motion.button>

              <div className="flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                  Paiements de {decodeURIComponent(userEmail)}
                </h1>
                <p className="text-sm text-gray-600">
                  Gérez tous les paiements de cet utilisateur
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* User Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{decodeURIComponent(userEmail)}</h2>
                <p className="text-gray-600">
                  {userStats.totalPayments} paiement{userStats.totalPayments > 1 ? 's' : ''} •
                  Total: {userStats.totalAmount}€
                </p>
              </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-700">{userStats.pending}</div>
                <div className="text-xs text-yellow-600">En attente</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{userStats.waitingPayment}</div>
                <div className="text-xs text-blue-600">Attente paiement</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-700">{userStats.validating}</div>
                <div className="text-xs text-orange-600">En validation</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-700">{userStats.completed}</div>
                <div className="text-xs text-green-600">Terminés</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-700">{userStats.rejected}</div>
                <div className="text-xs text-red-600">Rejetés</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-700">{userStats.expired}</div>
                <div className="text-xs text-gray-600">Expirés</div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Payments List */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {payments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State */}
          {!loading && payments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun paiement trouvé</h3>
              <p className="text-gray-500">
                Cet utilisateur n'a aucune demande de paiement pour le moment.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modal de détails */}
      <AnimatePresence>
        {showModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Détails du Paiement</h2>
                    <p className="text-blue-100">Code: {selectedPayment.referenceCode}</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Informations Client</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedPayment.userEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Utilisateur:</span>
                        <span className="font-mono text-xs">{selectedPayment.userId}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Détails du Paiement</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium">{selectedPayment.plan?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Montant:</span>
                        <span className="font-medium">{selectedPayment.amount}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Méthode:</span>
                        <span className="font-medium">{selectedPayment.paymentDetails?.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Créé le:</span>
                        <span className="font-medium">{formatDate(selectedPayment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                {selectedPayment.paymentDetails && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Détails Spécifiques</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm">
                      {selectedPayment.type === 'gift_card' && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Type de carte:</span>
                            <span className="font-medium">{selectedPayment.paymentDetails.cardType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Code de la carte:</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono">{selectedPayment.paymentDetails.cardCode}</span>
                              <button
                                onClick={() => copyToClipboard(selectedPayment.paymentDetails.cardCode)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedPayment.type === 'coupon' && (
                        <div className="flex justify-between">
                          <span>Code coupon:</span>
                          <span className="font-mono">{selectedPayment.paymentDetails.couponCode}</span>
                        </div>
                      )}
                      {selectedPayment.paymentDetails.description && (
                        <div>
                          <span className="text-gray-600">Description:</span>
                          <p className="mt-1">{selectedPayment.paymentDetails.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Note */}
                {selectedPayment.adminNote && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Note Admin</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {selectedPayment.adminNote}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  {selectedPayment.status === PAYMENT_STATUS.PENDING && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSetWaitingPayment(selectedPayment.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium"
                      >
                        Envoyer Instructions
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRejectPayment(selectedPayment.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all font-medium"
                      >
                        Rejeter
                      </motion.button>
                    </>
                  )}

                  {(selectedPayment.status === PAYMENT_STATUS.WAITING_PAYMENT ||
                    selectedPayment.status === PAYMENT_STATUS.VALIDATING) && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApprovePayment(selectedPayment.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-medium"
                        >
                          Approuver
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRejectPayment(selectedPayment.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all font-medium"
                        >
                          Rejeter
                        </motion.button>
                      </>
                    )}

                  {actionLoading && (
                    <div className="flex items-center justify-center py-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUserPayments;

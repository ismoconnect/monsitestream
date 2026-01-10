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
  Menu,
  Trash2,
  Shield,
  Crown,
  Diamond,
  Edit,
  Save
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { paymentService, PAYMENT_STATUS } from '../services/paymentService';
import { adminService } from '../services/adminService';
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
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showInstructionsForm, setShowInstructionsForm] = useState(false);
  const [instructionsData, setInstructionsData] = useState({
    iban: '',
    bic: '',
    beneficiary: '',
    paypalLink: ''
  });

  // États pour l'édition avancée
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    referenceCode: '',
    status: '',
    planName: ''
  });

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

          // Récupérer les données de l'utilisateur
          const userDoc = await adminService.getAllUsers(); // On cherche dans tous, car on n'a pas getOneUser exporté
          const user = userDoc.find(u => u.id === userPayment.userId);
          setUserData(user);
          setUserLoading(false);
        } else {
          setLoading(false);
          setUserLoading(false);
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

  const handleSendInstructions = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (!selectedPayment) return;

      const type = selectedPayment.type; // 'bank_transfer' ou 'paypal'

      await paymentService.sendPaymentInstructions(selectedPayment.id, type, instructionsData);

      setShowModal(false);
      setShowInstructionsForm(false);
      setInstructionsData({ iban: '', bic: '', beneficiary: '', paypalLink: '' });
      alert('Instructions envoyées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi des instructions:', error);
      alert('Erreur lors de l\'envoi des instructions');
    } finally {
      setActionLoading(false);
    }
  };

  const openInstructionsForm = () => {
    setShowInstructionsForm(true);
    // Pré-remplir avec des valeurs par défaut si nécessaire
    if (selectedPayment.type === 'bank_transfer') {
      setInstructionsData(prev => ({
        ...prev,
        beneficiary: 'Ismo Connect TV',
        // Vous pouvez ajouter des valeurs par défaut ici si vous voulez
      }));
    }
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setEditFormData({
      amount: payment.amount || 0,
      referenceCode: payment.referenceCode || '',
      status: payment.status || PAYMENT_STATUS.PENDING,
      planName: payment.plan?.name || 'Basic'
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (!selectedPayment) return;

      const updates = {
        amount: parseFloat(editFormData.amount),
        referenceCode: editFormData.referenceCode,
        status: editFormData.status,
        'plan.name': editFormData.planName
      };

      await paymentService.updatePaymentDetails(selectedPayment.id, updates);

      setShowEditModal(false);
      alert('Paiement modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification du paiement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePlan = async (newPlan) => {
    if (!userData || !currentUser) return;
    if (!window.confirm(`Passer cet utilisateur au plan ${newPlan.toUpperCase()} ?`)) return;

    setActionLoading(true);
    try {
      await adminService.changeUserPlan(userData.id, currentUser.uid, newPlan);
      // Mettre à jour l'état local
      setUserData(prev => ({
        ...prev,
        subscription: {
          ...prev.subscription,
          plan: newPlan
        }
      }));
    } catch (error) {
      console.error('Erreur lors du changement de plan:', error);
      alert('Erreur lors du changement de plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce paiement ?')) return;

    setActionLoading(true);
    try {
      await paymentService.deletePayment(paymentId);
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du paiement');
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

        {/* Actions Rapides */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditPayment(payment);
            }}
            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Éditer
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePayment(payment.id);
            }}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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

          {/* Plan Management Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-indigo-600" />
              Gestion du Plan de l'Utilisateur
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-4">
                  Modifiez manuellement le forfait de l'utilisateur. Cela changera ses accès immédiatement.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'basic', label: 'Basic', color: 'bg-blue-500', icon: Shield },
                    { id: 'premium', label: 'Premium', color: 'bg-pink-500', icon: Crown },
                    { id: 'vip', label: 'VIP Elite', color: 'bg-purple-600', icon: Diamond }
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handleUpdatePlan(plan.id)}
                      disabled={actionLoading || userLoading || (userData?.subscription?.plan || userData?.subscription?.type) === plan.id}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-w-[140px] ${(userData?.subscription?.plan || userData?.subscription?.type) === plan.id
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : `${plan.color} text-white hover:opacity-90 shadow-md active:scale-95`
                        }`}
                    >
                      <plan.icon className="w-4 h-4" />
                      {plan.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-64 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-xs text-gray-500 uppercase font-black mb-2 tracking-widest">Plan Actuel</div>
                <div className="flex items-center gap-3">
                  {((plan) => {
                    const p = userData?.subscription?.plan || userData?.subscription?.type || (userData?.subscription?.planName?.toLowerCase().includes('vip') ? 'vip' : userData?.subscription?.planName?.toLowerCase().includes('premium') ? 'premium' : 'basic');
                    if (p === 'vip') return (
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Diamond className="w-6 h-6 text-purple-600" />
                      </div>
                    );
                    if (p === 'premium') return (
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <Crown className="w-6 h-6 text-pink-600" />
                      </div>
                    );
                    return (
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                    );
                  })()}
                  <div>
                    <div className="font-bold text-gray-800 uppercase">
                      {userData?.subscription?.planName || userData?.subscription?.plan || userData?.subscription?.type || 'Inconnu'}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase">
                      {userData?.subscription?.status === 'active' ? 'Compte Actif' : 'Statut: ' + (userData?.subscription?.status || 'N/A')}
                    </div>
                  </div>
                </div>
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

                {/* Instruction Form */}
                {showInstructionsForm ? (
                  <form onSubmit={handleSendInstructions} className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      Envoyer les instructions de paiement
                    </h3>

                    {selectedPayment.type === 'bank_transfer' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaire</label>
                          <input
                            type="text"
                            value={instructionsData.beneficiary}
                            onChange={(e) => setInstructionsData({ ...instructionsData, beneficiary: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Nom du bénéficiaire"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                          <input
                            type="text"
                            value={instructionsData.iban}
                            onChange={(e) => setInstructionsData({ ...instructionsData, iban: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                            placeholder="FR76 ...."
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">BIC/SWIFT</label>
                          <input
                            type="text"
                            value={instructionsData.bic}
                            onChange={(e) => setInstructionsData({ ...instructionsData, bic: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                            placeholder="AGB...."
                            required
                          />
                        </div>
                      </div>
                    )}

                    {selectedPayment.type === 'paypal' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lien PayPal ou Email</label>
                          <input
                            type="text"
                            value={instructionsData.paypalLink}
                            onChange={(e) => setInstructionsData({ ...instructionsData, paypalLink: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://paypal.me/... ou email@exemple.com"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowInstructionsForm(false)}
                        className="flex-1 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                      >
                        {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        Envoyer
                      </button>
                    </div>
                  </form>
                ) : null}

                {/* Admin Note */}
                {selectedPayment.adminNote && !showInstructionsForm && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Note Admin</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {selectedPayment.adminNote}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  {selectedPayment.status === PAYMENT_STATUS.PENDING && !showInstructionsForm && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openInstructionsForm}
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

                  {/* Delete Button (Always available for Admin) */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeletePayment(selectedPayment.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2 border border-gray-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </motion.button>

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

      {/* Modal d'Édition Avancée */}
      <AnimatePresence>
        {showEditModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Modifier le Paiement
                </h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                  <input
                    type="text"
                    value={editFormData.referenceCode}
                    onChange={(e) => setEditFormData({ ...editFormData, referenceCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Montant & Plan */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Plan</label>
                    <select
                      value={editFormData.planName}
                      onChange={(e) => setEditFormData({ ...editFormData, planName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP Elite">VIP Elite</option>
                    </select>
                  </div>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={PAYMENT_STATUS.PENDING}>En attente</option>
                    <option value={PAYMENT_STATUS.WAITING_PAYMENT}>Attente paiement</option>
                    <option value={PAYMENT_STATUS.VALIDATING}>En validation</option>
                    <option value={PAYMENT_STATUS.COMPLETED}>Terminé (Payé)</option>
                    <option value={PAYMENT_STATUS.REJECTED}>Rejeté</option>
                    <option value={PAYMENT_STATUS.EXPIRED}>Expiré</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center gap-2"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUserPayments;

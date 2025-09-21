import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Search, 
  User,
  RefreshCw,
  Menu
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { paymentService, PAYMENT_STATUS } from '../services/paymentService';

const AdminPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userPaymentStats, setUserPaymentStats] = useState([]);

  // Charger tous les paiements et créer les statistiques par utilisateur
  useEffect(() => {
    const unsubscribe = paymentService.listenToAllPayments((paymentsData) => {
      setPayments(paymentsData);
      
      // Créer les statistiques par utilisateur
      const userStats = {};
      paymentsData.forEach(payment => {
        const userEmail = payment.userEmail;
        if (!userStats[userEmail]) {
          userStats[userEmail] = {
            email: userEmail,
            userId: payment.userId,
            totalPayments: 0,
            totalAmount: 0,
            pending: 0,
            waitingPayment: 0,
            validating: 0,
            completed: 0,
            rejected: 0,
            expired: 0,
            lastPaymentDate: null,
            plans: new Set()
          };
        }
        
        const stats = userStats[userEmail];
        stats.totalPayments++;
        stats.totalAmount += payment.amount || 0;
        stats[payment.status.replace('-', '')]++;
        stats.plans.add(payment.plan?.name);
        
        const paymentDate = payment.createdAt?.toDate ? payment.createdAt.toDate() : new Date(payment.createdAt);
        if (!stats.lastPaymentDate || paymentDate > stats.lastPaymentDate) {
          stats.lastPaymentDate = paymentDate;
        }
      });

      // Convertir en array et trier par date du dernier paiement
      const statsArray = Object.values(userStats).map(stats => ({
        ...stats,
        plans: Array.from(stats.plans)
      })).sort((a, b) => (b.lastPaymentDate || 0) - (a.lastPaymentDate || 0));

      setUserPaymentStats(statsArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
            <div className="flex justify-between items-center">
              {/* Left side - Mobile Menu & Title */}
              <div className="flex items-center space-x-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-6 h-6 text-gray-600" />
                </button>
                
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Gestion des Paiements</h1>
                  <p className="text-sm text-gray-600">Sélectionnez un utilisateur pour gérer ses paiements</p>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-blue-50 px-3 py-1 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">
                    {userPaymentStats.length} utilisateur{userPaymentStats.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="bg-green-50 px-3 py-1 rounded-lg">
                  <span className="text-sm font-medium text-green-700">
                    {payments.filter(p => p.status === PAYMENT_STATUS.COMPLETED).length} paiements terminés
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par email ou plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value={PAYMENT_STATUS.PENDING}>En attente</option>
                  <option value={PAYMENT_STATUS.WAITING_PAYMENT}>Attente paiement</option>
                  <option value={PAYMENT_STATUS.VALIDATING}>En validation</option>
                  <option value={PAYMENT_STATUS.COMPLETED}>Terminé</option>
                  <option value={PAYMENT_STATUS.REJECTED}>Rejeté</option>
                  <option value={PAYMENT_STATUS.EXPIRED}>Expiré</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Users List */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {userPaymentStats
                  .filter(userStats => {
                    if (searchTerm) {
                      return userStats.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             userStats.plans.some(plan => plan?.toLowerCase().includes(searchTerm.toLowerCase()));
                    }
                    return true;
                  })
                  .filter(userStats => {
                    if (statusFilter !== 'all') {
                      return userStats[statusFilter.replace('-', '')] > 0;
                    }
                    return true;
                  })
                  .map((userStats) => (
                    <motion.div
                      key={userStats.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
                    >
                      {/* User Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">{userStats.email}</h3>
                            <p className="text-sm text-gray-600">
                              {userStats.totalPayments} paiement{userStats.totalPayments > 1 ? 's' : ''} • {userStats.totalAmount}€
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="p-6">
                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {userStats.pending > 0 && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              {userStats.pending} En attente
                            </span>
                          )}
                          {userStats.waitingPayment > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {userStats.waitingPayment} Attente paiement
                            </span>
                          )}
                          {userStats.validating > 0 && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              {userStats.validating} En validation
                            </span>
                          )}
                          {userStats.completed > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {userStats.completed} Terminé{userStats.completed > 1 ? 's' : ''}
                            </span>
                          )}
                          {userStats.rejected > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              {userStats.rejected} Rejeté{userStats.rejected > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Plans */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Plans concernés:</p>
                          <div className="flex flex-wrap gap-1">
                            {userStats.plans.map((plan, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {plan}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Last Payment */}
                        <div className="mb-4">
                          <p className="text-xs text-gray-500">
                            Dernier paiement: {userStats.lastPaymentDate?.toLocaleDateString('fr-FR')}
                          </p>
                        </div>

                        {/* Action Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate(`/admin/payments/${encodeURIComponent(userStats.email)}`)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Gérer les Paiements
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State */}
          {!loading && userPaymentStats.length === 0 && (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres'
                  : 'Aucun utilisateur avec des paiements pour le moment'
                }
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPayments;
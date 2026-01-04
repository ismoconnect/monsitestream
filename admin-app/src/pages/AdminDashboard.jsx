import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  Shield,
  Diamond,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Activity,
  Filter,
  Search,
  MoreHorizontal,
  Pause,
  Play,
  MessageSquare,
  Menu
} from 'lucide-react';
import { adminService } from '../services/adminService';
import AdminChatList from '../components/messaging/AdminChatList';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { presenceService } from '../services/presenceService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, signOut, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Gérer la présence de l'admin
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      presenceService.startPresence(currentUser.uid, 'admin');

      return () => {
        presenceService.stopPresence(currentUser.uid);
      };
    }
  }, [currentUser]);

  useEffect(() => {
    if (authLoading) return;

    // Sécurité : Vérifier le rôle admin reel
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadData();
  }, [activeTab, currentUser, authLoading]);

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 animate-pulse font-medium">Vérification de la session admin...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        activeTab === 'pending'
          ? adminService.getPendingSubscriptions()
          : adminService.getAllUsers({ status: activeTab === 'all' ? null : activeTab }),
        adminService.getAdminStats()
      ]);

      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAccount = async (userId) => {
    setActionLoading(true);
    try {
      await adminService.validateAccount(userId, 'admin_demo');

      // Recharger les données
      await loadData();
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation du compte');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubscription = async (userId) => {
    const reason = prompt('Raison du rejet (optionnel):');
    if (reason === null) return; // Utilisateur a annulé

    setActionLoading(true);
    try {
      await adminService.rejectSubscription(userId, 'admin_demo', reason);
      await loadData();
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet de l\'abonnement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    const reason = prompt('Raison de la suspension:');
    if (!reason) return;

    setActionLoading(true);
    try {
      await adminService.suspendUser(userId, 'admin_demo', reason);
      await loadData();
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur lors de la suspension:', error);
      alert('Erreur lors de la suspension');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminService.reactivateUser(userId, 'admin_demo');
      await loadData();
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
      alert('Erreur lors de la réactivation');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPlanIcon = (plan) => {
    const icons = {
      basic: Shield,
      premium: Crown,
      vip: Diamond
    };
    return icons[plan] || Shield;
  };

  const getPlanColor = (plan) => {
    const colors = {
      basic: 'text-blue-600',
      premium: 'text-pink-600',
      vip: 'text-purple-600'
    };
    return colors[plan] || 'text-blue-600';
  };

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'pending', label: 'En attente', icon: Clock, count: stats?.pending || 0 },
    { id: 'active', label: 'Actifs', icon: CheckCircle, count: stats?.active || 0 },
    { id: 'suspended', label: 'Suspendus', icon: Pause, count: stats?.suspended || 0 },
    { id: 'rejected', label: 'Rejetés', icon: XCircle, count: stats?.rejected || 0 },
    { id: 'all', label: 'Tous', icon: Users, count: stats?.total || 0 }
  ];

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar Admin - Responsive */}
      <AdminSidebar
        currentAdmin={{ name: 'Liliana' }}
        onSignOut={handleSignOut}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Contenu principal */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-indigo-50 flex flex-col min-w-0">
        {/* Header Mobile avec bouton menu */}
        <div className="lg:hidden bg-white shadow-sm border-b p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header Desktop */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Gestion des Utilisateurs</h1>
              <p className="text-gray-600">Administration des comptes et abonnements</p>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm text-gray-600">Total Utilisateurs</p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="bg-blue-100 p-2 lg:p-3 rounded-lg">
                      <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm text-gray-600">En Attente</p>
                      <p className="text-2xl lg:text-3xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-yellow-100 p-2 lg:p-3 rounded-lg">
                      <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm text-gray-600">Actifs</p>
                      <p className="text-2xl lg:text-3xl font-bold text-green-600">{stats.active}</p>
                    </div>
                    <div className="bg-green-100 p-2 lg:p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm text-gray-600">Inscriptions 7j</p>
                      <p className="text-2xl lg:text-3xl font-bold text-purple-600">{stats.recentRegistrations}</p>
                    </div>
                    <div className="bg-purple-100 p-2 lg:p-3 rounded-lg">
                      <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                {/* Desktop Tabs */}
                <div className="hidden md:flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count > 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.id
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Tabs - Dropdown */}
                <div className="md:hidden px-4 py-3">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {tabs.map((tab) => (
                      <option key={tab.id} value={tab.id}>
                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search */}
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-8 lg:p-12 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 lg:p-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun utilisateur trouvé</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const PlanIcon = getPlanIcon(user.subscription?.plan);
                    return (
                      <div key={user.id} className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start lg:items-center justify-between flex-col lg:flex-row gap-4 lg:gap-0">
                          <div className="flex items-center space-x-3 lg:space-x-4 flex-1">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-lg flex-shrink-0">
                              {user.displayName?.charAt(0) || 'U'}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-800 text-sm lg:text-base truncate">{user.displayName}</h3>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getPlanColor(user.subscription?.plan)}`}>
                                  <PlanIcon className="w-3 h-3" />
                                  <span className="hidden sm:inline">{user.subscription?.plan}</span>
                                </div>
                              </div>
                              <p className="text-xs lg:text-sm text-gray-600 truncate">{user.email}</p>
                              <div className="flex items-center gap-2 lg:gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                                <span>Créé le {user.createdAt?.toDate?.()?.toLocaleDateString('fr-FR')}</span>
                                {user.subscription?.requestedAt && (
                                  <span className="hidden sm:inline">Demande le {user.subscription.requestedAt.toDate?.()?.toLocaleDateString('fr-FR')}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 lg:space-x-3 flex-wrap gap-2 w-full lg:w-auto justify-end">
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.subscription?.status)}`}>
                              {user.subscription?.status === 'pending' ? 'En attente' :
                                user.subscription?.status === 'active' ? 'Actif' :
                                  user.subscription?.status === 'suspended' ? 'Suspendu' :
                                    user.subscription?.status === 'rejected' ? 'Rejeté' : 'Inconnu'}
                            </span>

                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {user.subscription?.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleValidateAccount(user.id)}
                                  disabled={actionLoading}
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 lg:px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                  title="Valider le compte"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectSubscription(user.id)}
                                  disabled={actionLoading}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 lg:px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {user.subscription?.status === 'active' && (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                disabled={actionLoading}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 lg:px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            )}

                            {user.subscription?.status === 'suspended' && (
                              <button
                                onClick={() => handleReactivateUser(user.id)}
                                disabled={actionLoading}
                                className="bg-green-500 hover:bg-green-600 text-white px-2 lg:px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* User Detail Modal */}
          <AnimatePresence>
            {selectedUser && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                onClick={(e) => e.target === e.currentTarget && setSelectedUser(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Détails de l'utilisateur</h2>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* User Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Informations personnelles</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Nom:</span>
                            <p className="font-medium">{selectedUser.displayName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <p className="font-medium break-all">{selectedUser.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Téléphone:</span>
                            <p className="font-medium">{selectedUser.profile?.phone || 'Non renseigné'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Localisation:</span>
                            <p className="font-medium">{selectedUser.profile?.location || 'Non renseigné'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Subscription Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Abonnement</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Plan:</span>
                            <p className="font-medium">{selectedUser.subscription?.plan}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Statut:</span>
                            <p className={`font-medium ${selectedUser.subscription?.status === 'active' ? 'text-green-600' :
                              selectedUser.subscription?.status === 'pending' ? 'text-yellow-600' :
                                selectedUser.subscription?.status === 'suspended' ? 'text-red-600' :
                                  'text-gray-600'
                              }`}>
                              {selectedUser.subscription?.status}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Demandé le:</span>
                            <p className="font-medium">
                              {selectedUser.subscription?.requestedAt?.toDate?.()?.toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Expire le:</span>
                            <p className="font-medium">
                              {selectedUser.subscription?.expiresAt?.toLocaleDateString?.('fr-FR') || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Statistiques</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Rendez-vous:</span>
                            <p className="font-medium">{selectedUser.stats?.appointments || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Messages:</span>
                            <p className="font-medium">{selectedUser.stats?.messages || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Sessions:</span>
                            <p className="font-medium">{selectedUser.stats?.sessions || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Vues galerie:</span>
                            <p className="font-medium">{selectedUser.stats?.galleryViews || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

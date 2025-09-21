import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppointments } from '../../../hooks/useAppointments';
import { useNotification } from '../../../contexts/NotificationContext';
import CreateAppointmentModal from '../CreateAppointmentModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone,
  Mail,
  Euro,
  Check,
  X,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Star,
  Heart,
  Crown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  CreditCard,
  CalendarCheck,
  CalendarX,
  CalendarClock
} from 'lucide-react';

const ClientAppointmentsSectionReal = ({ currentUser }) => {
  // Hooks pour les données réelles
  const { appointments, stats, loading, createAppointment, confirmAppointment, cancelAppointment, completeAppointment } = useAppointments();
  const { showSuccess, showError } = useNotification();
  
  // États locaux
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filtres disponibles
  const filters = [
    { id: 'all', label: 'Tous', icon: Calendar, count: appointments?.length || 0 },
    { id: 'pending', label: 'En attente', icon: CalendarClock, count: appointments?.filter(a => a.status === 'pending').length || 0 },
    { id: 'confirmed', label: 'Confirmés', icon: CalendarCheck, count: appointments?.filter(a => a.status === 'confirmed').length || 0 },
    { id: 'completed', label: 'Terminés', icon: CheckCircle, count: appointments?.filter(a => a.status === 'completed').length || 0 },
    { id: 'cancelled', label: 'Annulés', icon: CalendarX, count: appointments?.filter(a => a.status === 'cancelled').length || 0 }
  ];

  // Fonction pour formater la date
  function formatAppointmentDate(timestamp) {
    if (!timestamp) return 'Date non définie';
    
    const appointmentDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return appointmentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Fonction pour formater l'heure
  function formatAppointmentTime(time) {
    if (!time) return 'Heure non définie';
    return time;
  }

  // Fonction pour obtenir la couleur selon le statut
  function getStatusColor(status) {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      completed: 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  // Fonction pour obtenir l'icône selon le statut
  function getStatusIcon(status) {
    const icons = {
      pending: CalendarClock,
      confirmed: CalendarCheck,
      cancelled: CalendarX,
      completed: CheckCircle
    };
    return icons[status] || Calendar;
  }

  // Filtrer les rendez-vous
  const filteredAppointments = (appointments || []).filter(appointment => {
    if (selectedFilter !== 'all' && appointment.status !== selectedFilter) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.clientName?.toLowerCase().includes(searchLower) ||
      appointment.service?.toLowerCase().includes(searchLower) ||
      appointment.location?.toLowerCase().includes(searchLower)
    );
  });

  // Fonctions de gestion
  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await confirmAppointment(appointmentId);
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId, 'Annulé par le client');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await completeAppointment(appointmentId, 'Rendez-vous terminé avec succès');
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-2 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 w-full max-w-full min-w-0" style={{ maxWidth: '100%' }}>
        {/* Header Élégant */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 lg:mb-8 w-full max-w-full overflow-hidden"
        >
          <div className="flex flex-col space-y-3 sm:space-y-4 min-w-0 w-full max-w-full">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-2 sm:mb-3">
                  {/* Bouton "Nouveau RDV" à gauche */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-1 sm:gap-2 mr-3 sm:mr-4 flex-shrink-0"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Nouveau RDV</span>
                    <span className="sm:hidden">+</span>
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur-lg opacity-30"></div>
                    <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-2 sm:p-3 rounded-full">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent truncate">
                      Mes Rendez-vous
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 truncate">
                      Gérez vos rendez-vous
                    </p>
                  </div>
                </div>
                
                {/* Stats Élégantes */}
                <div className="flex flex-col space-y-1 sm:space-y-2 mt-2 sm:mt-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">
                        {stats?.total || 0} rendez-vous
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <CalendarClock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">
                        {stats?.pending || 0} en attente
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">
                        {stats?.completed || 0} terminés
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtres Élégants */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 sm:mb-6 w-full max-w-full overflow-hidden"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 lg:gap-4 w-full max-w-full">
            {filters.map((filter, index) => {
              const Icon = filter.icon;
              const isActive = selectedFilter === filter.id;
              
              return (
                <motion.button
                  key={filter.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`relative flex items-center justify-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-orange-600 border border-gray-200 hover:border-orange-300'
                  } w-full max-w-full overflow-hidden`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  <span className="font-medium text-xs sm:text-sm lg:text-base truncate">{filter.label}</span>
                  {filter.count > 0 && (
                    <span className={`px-1 sm:px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Barre de recherche */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 sm:mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par client, service ou lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Liste des Rendez-vous */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => {
                const StatusIcon = getStatusIcon(appointment.status);
                const statusColor = getStatusColor(appointment.status);
                
                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Informations client */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${statusColor}`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg truncate">
                            {appointment.clientName || 'Client'}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {appointment.clientEmail || 'Email non renseigné'}
                          </p>
                          {appointment.clientPhone && (
                            <p className="text-xs text-gray-500 truncate">
                              📞 {appointment.clientPhone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Détails du rendez-vous */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700 truncate">
                              {formatAppointmentDate(appointment.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700">
                              {formatAppointmentTime(appointment.time)} ({appointment.duration || 60} min)
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700 truncate">
                              {appointment.service || 'Service non défini'}
                            </span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-700 truncate">
                                {appointment.location}
                              </span>
                            </div>
                          )}
                        </div>

                        {appointment.price && (
                          <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold text-green-600">
                              {appointment.price} {appointment.currency || 'EUR'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-700' 
                                : appointment.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {appointment.paymentStatus === 'paid' ? 'Payé' : 
                               appointment.paymentStatus === 'pending' ? 'En attente' : 'Non payé'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDetails(appointment)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmAppointment(appointment.id)}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                              title="Confirmer"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Annuler"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleCompleteAppointment(appointment.id)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Marquer comme terminé"
                          >
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Notes et demandes spéciales */}
                    {(appointment.notes || appointment.specialRequests) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {appointment.notes && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-500">Notes:</span>
                            <p className="text-sm text-gray-700 mt-1">{appointment.notes}</p>
                          </div>
                        )}
                        {appointment.specialRequests && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">Demandes spéciales:</span>
                            <p className="text-sm text-gray-700 mt-1">{appointment.specialRequests}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {selectedFilter === 'all' ? 'Aucun rendez-vous' : `Aucun rendez-vous ${filters.find(f => f.id === selectedFilter)?.label.toLowerCase()}`}
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedFilter === 'all' 
                  ? 'Créez votre premier rendez-vous pour commencer'
                  : 'Aucun rendez-vous ne correspond à ce filtre'
                }
              </p>
              {selectedFilter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Nouveau rendez-vous
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de détails (à implémenter si nécessaire) */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Détails du rendez-vous</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Informations client</h3>
                <p><strong>Nom:</strong> {selectedAppointment.clientName}</p>
                <p><strong>Email:</strong> {selectedAppointment.clientEmail}</p>
                {selectedAppointment.clientPhone && (
                  <p><strong>Téléphone:</strong> {selectedAppointment.clientPhone}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Détails du rendez-vous</h3>
                <p><strong>Service:</strong> {selectedAppointment.service}</p>
                <p><strong>Date:</strong> {formatAppointmentDate(selectedAppointment.date)}</p>
                <p><strong>Heure:</strong> {selectedAppointment.time}</p>
                <p><strong>Durée:</strong> {selectedAppointment.duration} minutes</p>
                {selectedAppointment.location && (
                  <p><strong>Lieu:</strong> {selectedAppointment.location}</p>
                )}
                <p><strong>Prix:</strong> {selectedAppointment.price} {selectedAppointment.currency}</p>
                <p><strong>Statut:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </p>
              </div>

              {(selectedAppointment.notes || selectedAppointment.specialRequests) && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
                  {selectedAppointment.notes && <p className="mb-2">{selectedAppointment.notes}</p>}
                  {selectedAppointment.specialRequests && (
                    <p><strong>Demandes spéciales:</strong> {selectedAppointment.specialRequests}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de rendez-vous */}
      <CreateAppointmentModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default ClientAppointmentsSectionReal;

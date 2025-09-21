import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Euro, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Star,
  Heart,
  Zap,
  Bell,
  User,
  Phone,
  Mail,
  MessageCircle,
  Download,
  Share2,
  Filter,
  Search,
  ChevronRight,
  CalendarDays,
  Timer,
  MapPinIcon,
  CreditCard,
  Info,
  CheckCircle2,
  X,
  MoreVertical
} from 'lucide-react';

const ClientAppointmentsSectionSimple = ({ currentUser }) => {
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const appointments = [
    {
      id: 1,
      service: 'Dîner Romantique',
      serviceType: 'premium',
      date: '2024-01-20',
      time: '20:00',
      duration: '3 heures',
      location: 'Restaurant Le Jardin',
      address: '123 Avenue des Champs-Élysées, Paris',
      price: 150,
      status: 'confirmed',
      notes: 'Anniversaire de rencontre - Préférence pour la table près de la fenêtre',
      client: {
        name: 'Pierre Dubois',
        phone: '+33 6 12 34 56 78',
        email: 'pierre.dubois@email.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      specialRequests: ['Fleurs roses', 'Champagne', 'Musique douce'],
      paymentStatus: 'paid',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      service: 'Soirée Privée',
      serviceType: 'vip',
      date: '2024-01-25',
      time: '19:30',
      duration: '4 heures',
      location: 'Appartement Privé',
      address: '45 Rue de Rivoli, Paris',
      price: 200,
      status: 'pending',
      notes: 'Préférences spéciales - Ambiance intime souhaitée',
      client: {
        name: 'Marc Laurent',
        phone: '+33 6 98 76 54 32',
        email: 'marc.laurent@email.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      specialRequests: ['Candles', 'Dinner privé', 'Massage'],
      paymentStatus: 'pending',
      createdAt: '2024-01-22T14:15:00Z'
    },
    {
      id: 3,
      service: 'Weekend Escapade',
      serviceType: 'luxury',
      date: '2024-02-01',
      time: '18:00',
      duration: '48 heures',
      location: 'Hôtel de Luxe',
      address: 'Hôtel Ritz, Place Vendôme, Paris',
      price: 500,
      status: 'cancelled',
      notes: 'Annulé par le client - Remboursement effectué',
      client: {
        name: 'Jean Moreau',
        phone: '+33 6 55 44 33 22',
        email: 'jean.moreau@email.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
      },
      specialRequests: ['Suite présidentielle', 'Spa privé', 'Dîner gastronomique'],
      paymentStatus: 'refunded',
      createdAt: '2024-01-28T09:45:00Z'
    },
    {
      id: 4,
      service: 'Déjeuner Business',
      serviceType: 'standard',
      date: '2024-01-18',
      time: '12:30',
      duration: '2 heures',
      location: 'Café de Flore',
      address: '172 Boulevard Saint-Germain, Paris',
      price: 80,
      status: 'completed',
      notes: 'Rendez-vous professionnel - Très satisfait',
      client: {
        name: 'Thomas Martin',
        phone: '+33 6 11 22 33 44',
        email: 'thomas.martin@email.com',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
      },
      specialRequests: ['Table calme', 'WiFi disponible'],
      paymentStatus: 'paid',
      createdAt: '2024-01-16T16:20:00Z'
    },
    {
      id: 5,
      service: 'Séance Photo',
      serviceType: 'premium',
      date: '2024-01-30',
      time: '15:00',
      duration: '2 heures',
      location: 'Studio Privé',
      address: '78 Rue de la Paix, Paris',
      price: 120,
      status: 'confirmed',
      notes: 'Séance photo professionnelle - Thème élégance',
      client: {
        name: 'Sophie Bernard',
        phone: '+33 6 77 88 99 00',
        email: 'sophie.bernard@email.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
      },
      specialRequests: ['Éclairage professionnel', 'Costumes fournis', 'Retouches incluses'],
      paymentStatus: 'paid',
      createdAt: '2024-01-25T11:10:00Z'
    }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200';
      case 'completed': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getServiceTypeColor = (type) => {
    switch (type) {
      case 'vip': return 'from-yellow-400 to-orange-500';
      case 'luxury': return 'from-purple-500 to-pink-500';
      case 'premium': return 'from-pink-500 to-purple-500';
      case 'standard': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getServiceTypeIcon = (type) => {
    switch (type) {
      case 'vip': return <Star className="w-4 h-4" />;
      case 'luxury': return <Sparkles className="w-4 h-4" />;
      case 'premium': return <Heart className="w-4 h-4" />;
      case 'standard': return <Calendar className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'refunded': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const openAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0">
      {/* Header Élégant */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-2 sm:p-3 rounded-full">
                  <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Mes Rendez-vous
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                  Gérez vos rendez-vous et réservations avec élégance
                </p>
              </div>
            </div>
            
            {/* Stats Élégantes */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6 mt-3 sm:mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  {appointments.length} RDV total
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {appointments.filter(a => a.status === 'confirmed').length} confirmés
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Euro className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {appointments.reduce((sum, a) => sum + a.price, 0)}€ total
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 font-medium shadow-lg shadow-pink-500/25 transition-all duration-300 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouveau RDV</span>
              <span className="sm:hidden">Nouveau</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filtres Élégants */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-2 sm:gap-3 overflow-x-hidden">
          {[
            { key: 'all', label: 'Tous', icon: <Zap className="w-4 h-4" />, count: appointments.length },
            { key: 'confirmed', label: 'Confirmés', icon: <CheckCircle className="w-4 h-4" />, count: appointments.filter(a => a.status === 'confirmed').length },
            { key: 'pending', label: 'En attente', icon: <AlertCircle className="w-4 h-4" />, count: appointments.filter(a => a.status === 'pending').length },
            { key: 'completed', label: 'Terminés', icon: <CheckCircle2 className="w-4 h-4" />, count: appointments.filter(a => a.status === 'completed').length },
            { key: 'cancelled', label: 'Annulés', icon: <XCircle className="w-4 h-4" />, count: appointments.filter(a => a.status === 'cancelled').length }
          ].map(({ key, label, icon, count }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(key)}
              className={`relative px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-300 rounded-xl text-xs sm:text-sm ${
                filter === key
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-md border border-gray-200/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {icon}
                <span className="truncate">{label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </div>
              {filter === key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Liste des Rendez-vous Élégante */}
      <motion.div 
        layout
        className="space-y-6"
      >
        <AnimatePresence>
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 sm:p-6 hover:shadow-xl hover:bg-white transition-all duration-300 cursor-pointer group"
              onClick={() => openAppointmentModal(appointment)}
            >
              <div className="flex items-start space-x-4 sm:space-x-6">
                {/* Avatar Client */}
                <div className="relative">
                  <img
                    src={appointment.client.avatar}
                    alt={appointment.client.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                  <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white flex items-center justify-center ${
                    appointment.status === 'confirmed' ? 'bg-green-500' :
                    appointment.status === 'pending' ? 'bg-yellow-500' :
                    appointment.status === 'completed' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`}>
                    {getStatusIcon(appointment.status)}
                  </div>
                </div>
                
                {/* Informations principales */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                    <h3 className="font-semibold text-gray-800 truncate text-base sm:text-lg min-w-0">{appointment.service}</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {/* Badge type de service */}
                      <span className={`bg-gradient-to-r ${getServiceTypeColor(appointment.serviceType)} text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 shadow-lg flex-shrink-0`}>
                        {getServiceTypeIcon(appointment.serviceType)}
                        <span className="capitalize hidden sm:inline">{appointment.serviceType}</span>
                        <span className="capitalize sm:hidden">{appointment.serviceType.charAt(0).toUpperCase()}</span>
                      </span>
                      
                      {/* Badge statut */}
                      <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium flex items-center gap-1 border ${getStatusColor(appointment.status)} flex-shrink-0`}>
                        {getStatusIcon(appointment.status)}
                        <span className="capitalize hidden sm:inline">
                          {appointment.status === 'confirmed' ? 'Confirmé' : 
                           appointment.status === 'pending' ? 'En attente' : 
                           appointment.status === 'completed' ? 'Terminé' : 'Annulé'}
                        </span>
                        <span className="capitalize sm:hidden">
                          {appointment.status === 'confirmed' ? 'OK' : 
                           appointment.status === 'pending' ? '?' : 
                           appointment.status === 'completed' ? '✓' : '✗'}
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Informations client */}
                  <div className="flex flex-col space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 min-w-0">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{appointment.client.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 min-w-0">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">{appointment.client.phone}</span>
                    </div>
                  </div>
                  
                  {/* Détails du rendez-vous */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500 flex-shrink-0" />
                      <span className="font-medium truncate">{new Date(appointment.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                      <span className="truncate">{appointment.time} <span className="text-gray-400 hidden sm:inline">({appointment.duration})</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{appointment.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Euro className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span className="font-semibold text-gray-800 text-sm sm:text-lg">{appointment.price}€</span>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  {appointment.notes && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm text-gray-600">
                        <strong className="text-gray-800">Notes :</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                  
                  {/* Demandes spéciales */}
                  {appointment.specialRequests && appointment.specialRequests.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {appointment.specialRequests.slice(0, 2).map((request, reqIndex) => (
                        <span key={reqIndex} className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium truncate max-w-[100px] sm:max-w-none">
                          ✨ <span className="hidden sm:inline">{request}</span>
                          <span className="sm:hidden">{request.length > 6 ? request.substring(0, 6) + '...' : request}</span>
                        </span>
                      ))}
                      {appointment.specialRequests.length > 2 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                          +{appointment.specialRequests.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Statut de paiement */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                        {appointment.paymentStatus === 'paid' ? 'Payé' :
                         appointment.paymentStatus === 'pending' ? 'En attente' : 'Remboursé'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 truncate">
                      Créé le {new Date(appointment.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-row space-x-1 sm:space-x-2">
                  {appointment.status === 'pending' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg shadow-green-500/30 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                    </>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/30 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-lg shadow-gray-500/30 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* État vide élégant */}
      {filteredAppointments.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 sm:py-16"
        >
          <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl sm:rounded-3xl p-6 sm:p-12 max-w-md mx-auto">
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-20"></div>
              <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Aucun rendez-vous</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {filter === 'all' 
                ? "Vous n'avez aucun rendez-vous pour le moment."
                : `Aucun rendez-vous ${filter === 'confirmed' ? 'confirmé' : 
                   filter === 'pending' ? 'en attente' : 
                   filter === 'completed' ? 'terminé' : 'annulé'} pour le moment.`
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:shadow-lg transition-shadow text-sm sm:text-base"
            >
              Créer un nouveau rendez-vous
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Modal de détail des rendez-vous */}
      <AnimatePresence>
        {showModal && selectedAppointment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-4xl w-full mx-4 max-h-full relative bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header du modal */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedAppointment.client.avatar}
                      alt={selectedAppointment.client.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white/20"
                    />
                    <div>
                      <h2 className="text-2xl font-bold">{selectedAppointment.service}</h2>
                      <p className="text-pink-100">avec {selectedAppointment.client.name}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Contenu du modal */}
              <div className="p-4 sm:p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                  {/* Informations du rendez-vous */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Détails du rendez-vous</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-pink-500" />
                          <div>
                            <p className="font-medium text-gray-800">
                              {new Date(selectedAppointment.date).toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-600">{selectedAppointment.time} - {selectedAppointment.duration}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-800">{selectedAppointment.location}</p>
                            <p className="text-sm text-gray-600">{selectedAppointment.address}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Euro className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-800 text-xl">{selectedAppointment.price}€</p>
                            <p className="text-sm text-gray-600">
                              Statut: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedAppointment.paymentStatus)}`}>
                                {selectedAppointment.paymentStatus === 'paid' ? 'Payé' :
                                 selectedAppointment.paymentStatus === 'pending' ? 'En attente' : 'Remboursé'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedAppointment.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-700">{selectedAppointment.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Demandes spéciales */}
                    {selectedAppointment.specialRequests && selectedAppointment.specialRequests.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Demandes spéciales</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAppointment.specialRequests.map((request, index) => (
                            <span key={index} className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-3 py-2 rounded-full text-sm font-medium">
                              ✨ {request}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informations client */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations client</h3>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <img
                            src={selectedAppointment.client.avatar}
                            alt={selectedAppointment.client.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">{selectedAppointment.client.name}</h4>
                            <p className="text-gray-600">Client VIP</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{selectedAppointment.client.phone}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{selectedAppointment.client.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Actions</h4>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-blue-500 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-blue-600 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">Appeler</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-green-500 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">Message</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-purple-500 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-purple-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">Modifier</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gray-500 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-gray-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">Exporter</span>
                        </motion.button>
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
  );
};

export default ClientAppointmentsSectionSimple;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Trash2
} from 'lucide-react';

const ClientAppointmentsSection = ({ currentUser }) => {
  const [filter, setFilter] = useState('all');

  const appointments = [
    {
      id: 1,
      service: 'Dîner romantique',
      date: '2024-01-20',
      time: '20:00',
      duration: '3 heures',
      location: 'Restaurant Le Jardin',
      price: 150,
      status: 'confirmed',
      notes: 'Anniversaire de rencontre'
    },
    {
      id: 2,
      service: 'Promenade en ville',
      date: '2024-01-25',
      time: '15:00',
      duration: '2 heures',
      location: 'Centre-ville',
      price: 80,
      status: 'pending',
      notes: 'Découverte des monuments'
    },
    {
      id: 3,
      service: 'Soirée privée',
      date: '2024-01-15',
      time: '19:30',
      duration: '4 heures',
      location: 'Appartement privé',
      price: 200,
      status: 'completed',
      notes: 'Soirée inoubliable'
    },
    {
      id: 4,
      service: 'Déjeuner d\'affaires',
      date: '2024-01-10',
      time: '12:30',
      duration: '1.5 heures',
      location: 'Restaurant d\'entreprise',
      price: 100,
      status: 'cancelled',
      notes: 'Annulé par le client'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return apt.status === 'confirmed' && new Date(apt.date) > new Date();
    if (filter === 'past') return apt.status === 'completed';
    if (filter === 'cancelled') return apt.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-6 h-6 text-orange-500 mr-2" />
            Mes Rendez-vous
          </h2>
          <p className="text-gray-600">Gérez vos rendez-vous avec Sophie</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau RDV
        </motion.button>
      </div>

      {/* Filtres */}
      <div className="flex space-x-4">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'upcoming', label: 'À venir' },
          { id: 'past', label: 'Passés' },
          { id: 'cancelled', label: 'Annulés' }
        ].map(filterType => (
          <button
            key={filterType.id}
            onClick={() => setFilter(filterType.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === filterType.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filterType.label}
          </button>
        ))}
      </div>

      {/* Liste des rendez-vous */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800">{appointment.service}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(appointment.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-1">
                    {appointment.status === 'confirmed' ? 'Confirmé' :
                     appointment.status === 'pending' ? 'En attente' :
                     appointment.status === 'cancelled' ? 'Annulé' :
                     appointment.status === 'completed' ? 'Terminé' : appointment.status}
                  </span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <span className="text-gray-500">Heure:</span>
                  <p className="font-medium">{appointment.time}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <span className="text-gray-500">Durée:</span>
                  <p className="font-medium">{appointment.duration}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <span className="text-gray-500">Lieu:</span>
                  <p className="font-medium">{appointment.location}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Euro className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <span className="text-gray-500">Prix:</span>
                  <p className="font-medium text-green-600">{appointment.price}€</p>
                </div>
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-sm">Notes:</span>
                <p className="text-sm text-gray-700 mt-1">{appointment.notes}</p>
              </div>
            )}

            {/* Actions */}
            {appointment.status === 'confirmed' && new Date(appointment.date) > new Date() && (
              <div className="mt-4 flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Reprogrammer
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Annuler
                </motion.button>
              </div>
            )}

            {appointment.status === 'completed' && (
              <div className="mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  Laisser un avis
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total RDV</p>
              <p className="text-2xl font-bold text-orange-600">{appointments.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">À venir</p>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(apt => apt.status === 'confirmed' && new Date(apt.date) > new Date()).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-blue-600">
                {appointments.filter(apt => apt.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dépensé</p>
              <p className="text-2xl font-bold text-purple-600">
                {appointments.reduce((total, apt) => total + apt.price, 0)}€
              </p>
            </div>
            <Euro className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientAppointmentsSection;

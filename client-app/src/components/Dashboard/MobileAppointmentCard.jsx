import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, Phone, User } from 'lucide-react';

const MobileAppointmentCard = ({ appointment, onAction }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <User className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  // Données d'exemple si pas d'appointment fourni
  const defaultAppointment = {
    id: 1,
    title: 'Session Premium',
    date: '2024-01-15',
    time: '14:30',
    duration: '60 min',
    type: 'video',
    status: 'confirmed',
    location: 'Vidéoconférence',
    description: 'Session privée premium avec Liliana'
  };

  const apt = appointment || defaultAppointment;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">{apt.title}</h3>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>
            {getStatusText(apt.status)}
          </div>
        </div>
        <div className="text-pink-500">
          {getTypeIcon(apt.type)}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(apt.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{apt.time} • {apt.duration}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">{apt.location}</span>
        </div>
      </div>

      {/* Description */}
      {apt.description && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
          {apt.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        {apt.status === 'confirmed' && (
          <>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction?.('join', apt)}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-3 rounded-lg text-xs font-medium"
            >
              Rejoindre
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction?.('reschedule', apt)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Reporter
            </motion.button>
          </>
        )}

        {apt.status === 'pending' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction?.('confirm', apt)}
            className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-xs font-medium"
          >
            Confirmer
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default MobileAppointmentCard;

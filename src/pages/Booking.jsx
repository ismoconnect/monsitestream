import React from 'react';
import { motion } from 'framer-motion';
import BookingCalendar from '../components/Booking/BookingCalendar';
import { ArrowLeft, Calendar, Heart, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Booking = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </button>
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-800">Sophie</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="py-12">
        <BookingCalendar />
      </div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white py-12"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confidentialité Totale</h3>
              <p className="text-gray-600 text-sm">
                Vos données et communications sont protégées par un chiffrement de niveau militaire
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Réservation Facile</h3>
              <p className="text-gray-600 text-sm">
                Système de réservation simple et sécurisé avec confirmation immédiate
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Personnalisé</h3>
              <p className="text-gray-600 text-sm">
                Chaque rendez-vous est adapté à vos préférences et besoins spécifiques
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Booking;

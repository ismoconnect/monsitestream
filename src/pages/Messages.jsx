import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Messages = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-primary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-600">Vous devez être connecté pour accéder à la messagerie.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* En-tête de la page */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Heart className="h-8 w-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">Messagerie Privée</h1>
              <Heart className="h-8 w-8 text-primary-600" />
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Accédez à votre messagerie privée depuis votre dashboard personnel.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-8 text-center"
        >
          <MessageSquare className="h-16 w-16 text-primary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accédez à votre Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Votre messagerie privée avec Liliana est disponible dans votre dashboard personnel.
          </p>
          <motion.a
            href="/dashboard"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200"
          >
            Aller au Dashboard
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Messages;

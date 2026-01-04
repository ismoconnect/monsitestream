import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Calendar,
  Video,
  Star,
  Clock,
  Heart,
  TrendingUp,
  Crown,
  Gift,
  Eye
} from 'lucide-react';

const ClientOverviewSection = ({ currentUser }) => {
  const isPremium = currentUser?.subscription?.status === 'active' &&
    (currentUser?.subscription?.type === 'premium' || currentUser?.subscription?.type === 'vip');

  const userStats = {
    totalMessages: 24,
    completedAppointments: 3,
    streamingSessions: 1,
    membershipDuration: '2 mois'
  };

  const activities = [
    {
      id: 1,
      type: 'message',
      title: 'Nouveau message de Liliana',
      description: 'Merci pour cette magnifique soirée...',
      timeAgo: 'Il y a 2h'
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Rendez-vous confirmé',
      description: 'Votre RDV du 15 janvier est confirmé',
      timeAgo: 'Il y a 1 jour'
    },
    {
      id: 3,
      type: 'streaming',
      title: 'Session live disponible',
      description: 'Nouvelle session privée disponible',
      timeAgo: 'Il y a 3 jours'
    },
    {
      id: 4,
      type: 'gallery',
      title: 'Nouveau contenu',
      description: '5 nouvelles photos ajoutées à la galerie',
      timeAgo: 'Il y a 1 semaine'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Bienvenue, {currentUser?.displayName?.split(' ')[0] || 'Cher client'} ! 👋
            </h2>
            <p className="text-pink-100">
              {isPremium
                ? 'Vous avez accès à tout le contenu premium'
                : 'Découvrez nos abonnements pour accéder au contenu exclusif'
              }
            </p>
          </div>
          {isPremium && (
            <div className="hidden md:block">
              <Crown className="w-16 h-16 text-yellow-300" />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Messages Envoyés</p>
              <p className="text-2xl font-bold">{userStats.totalMessages}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-pink-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Rendez-vous Réalisés</p>
              <p className="text-2xl font-bold">{userStats.completedAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Sessions Live</p>
              <p className="text-2xl font-bold">{userStats.streamingSessions}</p>
            </div>
            <Video className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Membre Depuis</p>
              <p className="text-2xl font-bold">{userStats.membershipDuration}</p>
            </div>
            <Star className="w-8 h-8 text-green-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité Récente */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-400" />
            Activité Récente
          </h3>

          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'message' ? 'bg-pink-100 text-pink-500' :
                  activity.type === 'appointment' ? 'bg-blue-100 text-blue-500' :
                    activity.type === 'streaming' ? 'bg-purple-100 text-purple-500' :
                      'bg-gray-100 text-gray-500'
                  }`}>
                  {activity.type === 'message' && <MessageSquare className="w-5 h-5" />}
                  {activity.type === 'appointment' && <Calendar className="w-5 h-5" />}
                  {activity.type === 'streaming' && <Video className="w-5 h-5" />}
                  {activity.type === 'gallery' && <Eye className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>

                <span className="text-xs text-gray-400">{activity.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Rapides */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all"
            >
              <Calendar className="w-6 h-6 text-pink-600 mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Réserver un RDV</p>
                <p className="text-sm text-gray-600">Planifiez votre prochain rendez-vous</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
            >
              <MessageSquare className="w-6 h-6 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Envoyer un message</p>
                <p className="text-sm text-gray-600">Communiquez en privé avec Liliana</p>
              </div>
            </motion.button>

            {isPremium ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <Video className="w-6 h-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Sessions Live</p>
                  <p className="text-sm text-gray-600">Rejoignez une session en direct</p>
                </div>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-all"
              >
                <Crown className="w-6 h-6 text-yellow-600 mr-3" />
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Passer Premium</p>
                  <p className="text-sm text-gray-600">Accédez au contenu exclusif</p>
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Gift className="w-5 h-5 mr-2 text-pink-500" />
          Recommandations pour vous
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
            <Heart className="w-8 h-8 text-pink-500 mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Contenu Personnalisé</h4>
            <p className="text-sm text-gray-600 mb-3">Recevez du contenu adapté à vos préférences</p>
            <button className="text-sm text-pink-600 font-medium hover:text-pink-700">
              Découvrir →
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <TrendingUp className="w-8 h-8 text-blue-500 mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Progression</h4>
            <p className="text-sm text-gray-600 mb-3">Suivez votre évolution sur la plateforme</p>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
              Voir les stats →
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <Star className="w-8 h-8 text-green-500 mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Fidélité</h4>
            <p className="text-sm text-gray-600 mb-3">Gagnez des points et des récompenses</p>
            <button className="text-sm text-green-600 font-medium hover:text-green-700">
              Voir les points →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOverviewSection;

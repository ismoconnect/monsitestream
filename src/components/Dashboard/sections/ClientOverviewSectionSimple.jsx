import React, { useState } from 'react';
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
  Eye,
  Loader
} from 'lucide-react';
import { useStats } from '../../../hooks/useStats';
import { motion } from 'framer-motion';
import CreateMessageModal from '../CreateMessageModal';
import CreateAppointmentModal from '../CreateAppointmentModal';

const ClientOverviewSectionSimple = ({ currentUser }) => {
  const { stats, recentActivity, loading, refreshStats } = useStats();
  const isPremium = currentUser?.subscription?.status === 'active' && 
                   (currentUser?.subscription?.type === 'premium' || currentUser?.subscription?.type === 'vip');
  
  // États pour les modals
  const [showCreateMessageModal, setShowCreateMessageModal] = useState(false);
  const [showCreateAppointmentModal, setShowCreateAppointmentModal] = useState(false);

  // Utiliser les stats réelles ou des valeurs par défaut
  const userStats = stats ? {
    totalMessages: stats.overview.totalMessages,
    completedAppointments: stats.appointments.completed,
    streamingSessions: stats.streaming.totalSessions,
    galleryViews: stats.overview.totalGalleryViews
  } : {
    totalMessages: 0,
    completedAppointments: 0,
    streamingSessions: 0,
    galleryViews: 0
  };

  // Utiliser les activités réelles ou des exemples par défaut
  const activities = recentActivity.length > 0 ? recentActivity.map(activity => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    timeAgo: activity.date ? formatTimeAgo(activity.date) : 'Récemment'
  })) : [
    {
      id: 'welcome',
      type: 'system',
      title: 'Bienvenue sur votre dashboard',
      description: 'Commencez à utiliser les services pour voir vos activités',
      timeAgo: 'Maintenant'
    }
  ];

  // Fonction pour formater le temps écoulé
  function formatTimeAgo(date) {
    if (!date) return 'Récemment';
    
    const now = new Date();
    let activityDate;
    
    if (date.toDate) {
      // Firestore Timestamp
      activityDate = date.toDate();
    } else if (date instanceof Date) {
      // JavaScript Date
      activityDate = date;
    } else {
      // String ou autre format
      activityDate = new Date(date);
    }
    
    const diffMs = now - activityDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Il y a moins d\'1h';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return activityDate.toLocaleDateString('fr-FR');
  }

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
          <div className="flex items-center gap-4">
            {loading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader className="w-6 h-6 text-white" />
              </motion.div>
            )}
            {isPremium && (
              <div className="hidden md:block">
                <Crown className="w-16 h-16 text-yellow-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl text-white cursor-pointer hover:shadow-lg transition-all" onClick={() => setShowCreateMessageModal(true)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Messages Envoyés</p>
              <p className="text-2xl font-bold">{userStats.totalMessages}</p>
              <p className="text-pink-200 text-xs mt-1">+ Nouveau message</p>
            </div>
            <MessageSquare className="w-8 h-8 text-pink-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white cursor-pointer hover:shadow-lg transition-all" onClick={() => setShowCreateAppointmentModal(true)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Rendez-vous Réalisés</p>
              <p className="text-2xl font-bold">{userStats.completedAppointments}</p>
              <p className="text-purple-200 text-xs mt-1">+ Nouveau RDV</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Sessions Live</p>
              <p className="text-2xl font-bold">{userStats.streamingSessions}</p>
            </div>
            <Video className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Vues Galerie</p>
              <p className="text-2xl font-bold">{userStats.galleryViews}</p>
            </div>
            <Eye className="w-8 h-8 text-green-200" />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Activités Récentes</h3>
          <button 
            onClick={refreshStats}
            disabled={loading}
            className="text-pink-500 hover:text-pink-600 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            Actualiser
          </button>
        </div>
        
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                {activity.type === 'message' && <MessageSquare className="w-5 h-5 text-pink-500" />}
                {activity.type === 'appointment' && <Calendar className="w-5 h-5 text-purple-500" />}
                {activity.type === 'streaming' && <Video className="w-5 h-5 text-blue-500" />}
                {activity.type === 'gallery' && <Eye className="w-5 h-5 text-green-500" />}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{activity.title}</h4>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <div className="text-sm text-gray-500">
                {activity.timeAgo}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mr-4">
              <MessageSquare className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Nouveau Message</h4>
              <p className="text-sm text-gray-600">Envoyez un message à Sophie</p>
            </div>
          </div>
          <button className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">
            Écrire
          </button>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Prendre RDV</h4>
              <p className="text-sm text-gray-600">Réservez votre prochain rendez-vous</p>
            </div>
          </div>
          <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
            Réserver
          </button>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <Video className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Session Live</h4>
              <p className="text-sm text-gray-600">Rejoignez une session en direct</p>
            </div>
          </div>
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
            Rejoindre
          </button>
        </div>
      </div>

      {/* Modals */}
      <CreateMessageModal 
        isOpen={showCreateMessageModal}
        onClose={() => setShowCreateMessageModal(false)}
      />
      
      <CreateAppointmentModal 
        isOpen={showCreateAppointmentModal}
        onClose={() => setShowCreateAppointmentModal(false)}
      />
    </div>
  );
};

export default ClientOverviewSectionSimple;

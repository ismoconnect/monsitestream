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
  Loader,
  Sparkles
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
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-8 space-y-4 md:space-y-8">
      {/* Welcome Section - More compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-[2rem] p-6 md:p-10 text-white shadow-xl shadow-pink-100/50"
      >
        <div className="flex items-center justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-4xl font-black mb-2 md:mb-4 tracking-tight">
              Bienvenue, {currentUser?.displayName?.split(' ')[0] || 'Cher client'} ! 👋
            </h2>
            <p className="text-pink-100 text-sm md:text-xl font-medium opacity-90 leading-relaxed">
              {isPremium
                ? 'Heureux de vous revoir ! Profitez de vos avantages Premium.'
                : 'Découvrez nos abonnements exclusifs Liliana.'
              }
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            {loading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader className="w-8 h-8 text-white/50" />
              </motion.div>
            )}
            {isPremium && (
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse" />
                <Crown className="w-20 h-20 text-yellow-300 relative z-10" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Grid 2x2 on mobile, 4 in a row on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-all group"
          onClick={() => setShowCreateMessageModal(true)}
        >
          <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
            <div className="p-2.5 md:p-3 bg-pink-50 rounded-2xl group-hover:bg-pink-500 transition-colors">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-pink-500 group-hover:text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Messages</p>
              <p className="text-xl md:text-2xl font-black text-gray-800 leading-none">{userStats.totalMessages}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-all group"
          onClick={() => setShowCreateAppointmentModal(true)}
        >
          <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
            <div className="p-2.5 md:p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-500 transition-colors">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-500 group-hover:text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none mb-1">RDV</p>
              <p className="text-xl md:text-2xl font-black text-gray-800 leading-none">{userStats.completedAppointments}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
        >
          <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
            <div className="p-2.5 md:p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-500 transition-colors">
              <Video className="w-5 h-5 md:w-6 md:h-6 text-blue-500 group-hover:text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Sessions</p>
              <p className="text-xl md:text-2xl font-black text-gray-800 leading-none">{userStats.streamingSessions}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
        >
          <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
            <div className="p-2.5 md:p-3 bg-green-50 rounded-2xl group-hover:bg-green-500 transition-colors">
              <Eye className="w-5 h-5 md:w-6 md:h-6 text-green-500 group-hover:text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Vues</p>
              <p className="text-xl md:text-2xl font-black text-gray-800 leading-none">{userStats.galleryViews}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">Activités</h3>
            <button
              onClick={refreshStats}
              disabled={loading}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-4 h-4 md:w-5 md:h-5 animate-spin text-pink-500" />
              ) : (
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-pink-500" />
              )}
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center p-3 md:p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center mr-3 md:mr-4 shadow-sm border border-gray-100">
                  {activity.type === 'message' && <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />}
                  {activity.type === 'appointment' && <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />}
                  {activity.type === 'streaming' && <Video className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />}
                  {activity.type === 'gallery' && <Eye className="w-4 h-4 md:w-5 md:h-5 text-green-500" />}
                  {activity.type === 'system' && <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-xs md:text-sm truncate">{activity.title}</h4>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">{activity.description}</p>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-2">
                  {activity.timeAgo}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
              <Sparkles size={60} />
            </div>
            <h4 className="text-lg md:text-xl font-black mb-1 md:mb-2 relative z-10">Une envie ?</h4>
            <p className="text-indigo-100 text-[11px] md:text-sm mb-4 md:mb-6 opacity-80 relative z-10">Demandes privées Liliana.</p>
            <button
              onClick={() => setShowCreateMessageModal(true)}
              className="w-full bg-white text-indigo-600 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[12px] md:text-sm shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              ÉCRIRE
            </button>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 md:mb-6 text-sm">Accès Rapides</h4>
            <div className="space-y-2 md:space-y-3">
              <button
                onClick={() => navigate('/dashboard/appointments')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center space-x-3 text-xs">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-gray-700">Mes RDV</span>
                </div>
                <TrendingUp size={14} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
              </button>
              <button
                onClick={() => navigate('/dashboard/subscription')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center space-x-3 text-xs">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-gray-700">Compte</span>
                </div>
                <TrendingUp size={14} className="text-gray-300 group-hover:text-yellow-500 transition-colors" />
              </button>
            </div>
          </div>
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

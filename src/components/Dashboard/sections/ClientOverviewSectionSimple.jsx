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
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useStats } from '../../../hooks/useStats';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CreateMessageModal from '../CreateMessageModal';
import CreateAppointmentModal from '../CreateAppointmentModal';

const ClientOverviewSectionSimple = ({ currentUser }) => {
  const { stats, recentActivity, loading, refreshStats } = useStats();
  const navigate = useNavigate();
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

  function formatTimeAgo(date) {
    if (!date) return 'Récemment';
    const now = new Date();
    let activityDate;
    if (date.toDate) activityDate = date.toDate();
    else if (date instanceof Date) activityDate = date;
    else activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return 'moins d\'1h';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return activityDate.toLocaleDateString('fr-FR');
  }

  const cardConfig = [
    { id: 'messages', label: 'Messages', value: userStats.totalMessages, icon: MessageSquare, color: 'text-rose-500', bgColor: 'bg-rose-50', border: 'border-rose-100', onClick: () => setShowCreateMessageModal(true) },
    { id: 'appointments', label: 'RDV', value: userStats.completedAppointments, icon: Calendar, color: 'text-rose-600', bgColor: 'bg-rose-50', border: 'border-rose-100', onClick: () => setShowCreateAppointmentModal(true) },
    { id: 'sessions', label: 'Sessions', value: userStats.streamingSessions, icon: Video, color: 'text-slate-400', bgColor: 'bg-slate-50', border: 'border-slate-100' },
    { id: 'views', label: 'Vues', value: userStats.galleryViews, icon: Eye, color: 'text-slate-400', bgColor: 'bg-slate-50', border: 'border-slate-100' }
  ];

  return (
    <div className="max-w-[1600px] mx-auto w-full p-3 sm:p-4 md:p-8 space-y-6 md:space-y-10">
      {/* Welcome Section - Soft Dusty Rose (Ultra Sober) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(251,182,206,0.15)] relative overflow-hidden text-slate-800 border border-rose-100"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50 rounded-full blur-[80px] -mr-40 -mt-40 opacity-70" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-50/50 rounded-full blur-[60px] -ml-24 -mb-24" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
              Bienvenue, <span className="text-rose-500 uppercase">{currentUser?.displayName?.split(' ')[0] || 'Cher client'}</span> ! 👋
            </h2>
            <p className="text-slate-500 text-base md:text-xl font-medium leading-relaxed max-w-xl">
              {isPremium
                ? 'Profitez d\'un accompagnement d\'exception et de services sur mesure.'
                : 'Accédez à l\'exclusivité Liliana en devenant membre Premium.'
              }
            </p>
          </div>
          <div className="hidden lg:flex items-center">
            {isPremium ? (
              <div className="p-4 bg-rose-50 rounded-3xl border border-rose-100 shadow-sm transition-transform hover:scale-110">
                <Crown className="w-12 h-12 text-rose-400" />
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, shadow: "0 20px 30px rgba(244,114,182,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard/subscription')}
                className="bg-rose-500 text-white px-10 py-5 rounded-[2rem] font-bold text-sm tracking-widest shadow-lg transition-all"
              >
                DEVENIR PREMIUM
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Chic & Minimalist Pink Accents */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {cardConfig.map((stat) => (
          <motion.div
            key={stat.id}
            whileHover={{ y: -4 }}
            className={`bg-white p-5 md:p-8 rounded-[2.5rem] border ${stat.border} shadow-sm cursor-pointer transition-all group hover:shadow-[0_15px_30px_rgba(251,182,206,0.1)]`}
            onClick={stat.onClick}
          >
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
              <div className={`p-4 ${stat.bgColor} rounded-2xl group-hover:bg-rose-100 transition-colors duration-300`}>
                <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color} transition-transform group-hover:scale-110`} />
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-2xl md:text-4xl font-black text-slate-800 lowercase tracking-tighter group-hover:text-rose-500 transition-colors">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <div className="w-1.5 h-8 bg-rose-500 rounded-full" />
                Activités
              </h3>
            </div>
            <button
              onClick={refreshStats}
              disabled={loading}
              className="p-3 text-rose-300 hover:text-rose-500 transition-colors"
            >
              <Loader className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center p-4 md:p-5 bg-white rounded-3xl hover:bg-rose-50/30 transition-colors group"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mr-4 md:mr-6 group-hover:bg-white transition-colors">
                  {activity.type === 'message' && <MessageSquare className="w-5 h-5 text-rose-400" />}
                  {activity.type === 'appointment' && <Calendar className="w-5 h-5 text-rose-400" />}
                  {activity.type === 'streaming' && <Video className="w-5 h-5 text-slate-300" />}
                  {activity.type === 'gallery' && <Eye className="w-5 h-5 text-slate-300" />}
                  {activity.type === 'system' && <Star className="w-5 h-5 text-rose-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-700 text-sm md:text-base leading-tight">{activity.title}</h4>
                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{activity.description}</p>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 ml-4">
                  {activity.timeAgo}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Softest Pink */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group border border-rose-100">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
              <Sparkles size={120} className="text-rose-400" />
            </div>

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MessageSquare className="w-8 h-8 text-rose-400" />
              </div>
              <h4 className="text-2xl font-black mb-3 text-slate-800">Une envie ?</h4>
              <p className="text-slate-500 text-sm mb-10 font-medium">Liliana est disponible pour vos demandes les plus privées.</p>
              <button
                onClick={() => setShowCreateMessageModal(true)}
                className="w-full bg-white text-rose-500 py-5 rounded-[2rem] font-bold text-sm tracking-[0.1em] shadow-sm hover:shadow-md hover:bg-rose-500 hover:text-white transition-all active:scale-95 border border-rose-200"
              >
                ÉCRIRE UN MESSAGE
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
            <h4 className="font-bold text-slate-400 mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] px-2">
              Navigation
            </h4>
            <div className="space-y-2">
              {[
                { label: 'Rendez-vous', path: '/dashboard/appointments', icon: Calendar, color: 'text-rose-400' },
                { label: 'Premium', path: '/dashboard/subscription', icon: Crown, color: 'text-rose-400' }
              ].map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="w-full flex items-center justify-between p-4 px-6 rounded-2xl hover:bg-rose-50/50 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <link.icon className={`w-5 h-5 ${link.color}`} />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-rose-500 transition-colors">{link.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-400 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateMessageModal isOpen={showCreateMessageModal} onClose={() => setShowCreateMessageModal(false)} />
      <CreateAppointmentModal isOpen={showCreateAppointmentModal} onClose={() => setShowCreateAppointmentModal(false)} />
    </div>
  );
};

export default ClientOverviewSectionSimple;

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
  ChevronRight,
  Settings,
  User,
  Lock,
  Compass
} from 'lucide-react';
import { useStats } from '../../../hooks/useStats';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { galleryService } from '../../../services/galleryService';
import CreateMessageModal from '../CreateMessageModal';
import CreateAppointmentModal from '../CreateAppointmentModal';
import { images } from '../../../utils/images';
import galleryBg from '../../../assets/gallery/gallery-1.jpg';



const ClientOverviewSectionSimple = ({ currentUser }) => {
  const { stats, recentActivity, loading, refreshStats } = useStats();
  const navigate = useNavigate();
  const isPremium = currentUser?.subscription?.status === 'active' &&
    (currentUser?.subscription?.type === 'premium' || currentUser?.subscription?.type === 'vip');

  const [showCreateMessageModal, setShowCreateMessageModal] = useState(false);
  const [showCreateAppointmentModal, setShowCreateAppointmentModal] = useState(false);
  const defaultBg = galleryBg;



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
    { id: 'welcome', type: 'system', title: 'Bienvenue', description: 'Commencez à utiliser les services.', timeAgo: 'Maintenant' }
  ];

  function formatTimeAgo(date) {
    if (!date) return 'Récemment';
    const now = new Date();
    let activityDate = date.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date));
    const diffMs = now - activityDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'moins d\'1h';
    if (diffHours < 24) return `${diffHours}h`;
    return activityDate.toLocaleDateString('fr-FR');
  }

  const cardConfig = [
    { id: 'messages', label: 'Messages', value: userStats.totalMessages, icon: MessageSquare, color: 'text-indigo-600', bgColor: 'bg-indigo-50', onClick: () => navigate('/dashboard/messages') },
    { id: 'appointments', label: 'Rendez-vous', value: userStats.completedAppointments, icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50', onClick: () => navigate('/dashboard/appointments') },
    { id: 'sessions', label: 'Live Stream', value: userStats.streamingSessions, icon: Video, color: 'text-purple-600', bgColor: 'bg-purple-50', onClick: () => navigate('/dashboard/stream') },
    { id: 'views', label: 'Vues Galerie', value: userStats.galleryViews, icon: Eye, color: 'text-pink-600', bgColor: 'bg-pink-50', onClick: () => navigate('/dashboard/gallery') }
  ];

  return (
    <div className="max-w-[1200px] mx-auto w-full p-4 md:p-8 space-y-10">
      {/* Header Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl overflow-hidden border-2 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
              <img 
                src={images.hero.main} 
                alt="Liliana" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg" title="En ligne" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Bonjour, {currentUser?.displayName ? (currentUser.displayName.includes('@') ? currentUser.displayName.split('@')[0] : currentUser.displayName) : 'Mon Compte'} ! 👋
            </h2>
            <p className="text-gray-500 mt-1 flex items-center font-medium">
              <Sparkles size={14} className={currentUser?.subscription?.type === 'vip' ? 'text-amber-400 mr-2' : 'text-indigo-400 mr-2'} />
              Voici l'aperçu de votre compte {currentUser?.subscription?.type === 'vip' ? 'Elite VIP' : currentUser?.subscription?.type === 'premium' ? 'Premium' : 'Standard'}.
            </p>
            {currentUser?.profile?.lookingFor && (
              <div className="mt-3 inline-flex items-center px-4 py-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] shadow-sm">
                <Compass size={12} className="mr-2 text-indigo-400" /> 
                Ma Cible : {
                  currentUser.profile.lookingFor === 'exclusive' ? 'Contenu Exclusif' :
                  currentUser.profile.lookingFor === 'chat' ? 'Échanges & Chat' :
                  currentUser.profile.lookingFor === 'appointments' ? 'Rendez-vous' :
                  currentUser.profile.lookingFor === 'support' ? 'Soutien Créatif' : 
                  currentUser.profile.lookingFor
                }
              </div>
            )}
          </div>
        </div>
        {!isPremium && (
          <button onClick={() => navigate('/dashboard/subscription')} className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all active:scale-95">
            DEVENIR PREMIUM
          </button>
        )}
      </div>


      {/* Stats Grid with Shared Continuous Background */}
      <div className="relative rounded-[2.5rem] overflow-hidden p-1 group shadow-2xl shadow-indigo-100/50">
        {/* Continuous Background Image */}
        <div className="absolute inset-0 z-0 scale-105 group-hover:scale-100 transition-transform duration-[2s]">
          <img 
            src={defaultBg} 
            alt="" 
            className="w-full h-full object-cover"
          />
          {/* Overlay very light, no blur */}
          <div className="absolute inset-0 bg-black/10" />
        </div>



        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 relative z-10">
          {cardConfig.map((stat) => {
            const isLocked = (stat.id === 'sessions' && currentUser?.subscription?.type !== 'vip') ||
                             (stat.id === 'appointments' && !isPremium);
            
            return (
              <motion.div
                key={stat.id}
                whileHover={!isLocked ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : {}}
                onClick={!isLocked ? stat.onClick : undefined}
                className={`bg-black/20 p-8 lg:py-12 transition-all duration-300 flex flex-col items-center text-center border border-white/10 ${
                  isLocked 
                    ? 'opacity-40 grayscale cursor-not-allowed' 
                    : 'cursor-pointer group/card hover:border-white/30'
                }`}
              >
                <div className={`relative p-4 ${stat.bgColor} rounded-2xl mb-6 shadow-xl ${!isLocked ? 'group-hover/card:scale-110' : ''} transition-transform duration-500`}>
                  <stat.icon size={24} className={stat.color} />
                  {isLocked && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
                      <Lock size={10} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white tracking-tight">{isLocked ? '—' : stat.value}</p>
                  <div className="flex items-center justify-center space-x-2">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                    {isLocked && <span className="px-1.5 py-0.5 bg-white/10 text-white/40 text-[7px] font-black uppercase rounded tracking-widest border border-white/10">{stat.id === 'sessions' ? 'VIP' : 'PREMIUM'}</span>}
                  </div>
                </div>
                {!isLocked && (
                  <div className="mt-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <ChevronRight size={16} className="text-white/40" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Activity */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Activités</h3>
            <button onClick={refreshStats} className="text-gray-300 hover:text-indigo-600">
              <Loader size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                  {activity.type === 'message' ? <MessageSquare size={18} className="text-indigo-500" /> : <Clock size={18} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-400 truncate">{activity.description}</p>
                </div>
                <span className="text-[10px] text-gray-300 font-bold uppercase ml-4">{activity.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action & Links */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-200/20">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2 tracking-tight">Une demande ?</h4>
              <p className="text-indigo-200 text-sm mb-6 opacity-90 leading-relaxed">Liliana est à votre écoute pour toute requête privée ou personnalisée.</p>
              <button 
                onClick={() => navigate('/dashboard/messages')} 
                className="w-full py-4 bg-white text-indigo-900 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-[0.98]"
              >
                Envoyer un message
              </button>
            </div>
            {/* Artistic elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-noise opacity-[0.03] pointer-events-none" />
            <Sparkles className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32 group-hover:scale-110 transition-transform duration-1000" />
          </div>

        </div>
      </div>

      <CreateMessageModal isOpen={showCreateMessageModal} onClose={() => setShowCreateMessageModal(false)} />
      <CreateAppointmentModal isOpen={showCreateAppointmentModal} onClose={() => setShowCreateAppointmentModal(false)} />
    </div>
  );
};

export default ClientOverviewSectionSimple;

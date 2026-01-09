import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppointments } from '../../../hooks/useAppointments';
import { useNotification } from '../../../contexts/NotificationContext';
import CreateAppointmentModal from '../CreateAppointmentModal';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Check,
  X,
  MoreVertical,
  Plus,
  Search,
  CheckCircle,
  Loader,
  Eye,
  ChevronRight,
  Sparkles,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  TrendingUp
} from 'lucide-react';

const ClientAppointmentsSectionReal = ({ currentUser }) => {
  const { appointments, stats, loading, confirmAppointment, cancelAppointment, completeAppointment } = useAppointments();
  const { showSuccess, showError } = useNotification();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filters = [
    { id: 'all', label: 'Tous', icon: Calendar, count: appointments?.length || 0 },
    { id: 'pending', label: 'Attente', icon: CalendarClock, count: appointments?.filter(a => a.status === 'pending').length || 0 },
    { id: 'confirmed', label: 'Confirmés', icon: CalendarCheck, count: appointments?.filter(a => a.status === 'confirmed').length || 0 },
    { id: 'completed', label: 'Terminés', icon: CheckCircle, count: appointments?.filter(a => a.status === 'completed').length || 0 },
    { id: 'cancelled', label: 'Annulés', icon: CalendarX, count: appointments?.filter(a => a.status === 'cancelled').length || 0 }
  ];

  const formatAppointmentDate = (timestamp) => {
    if (!timestamp) return 'Date non définie';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'completed': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'cancelled': return 'bg-rose-50 text-rose-400 border-rose-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const filteredAppointments = (appointments || []).filter(appointment => {
    if (selectedFilter !== 'all' && appointment.status !== selectedFilter) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.clientName?.toLowerCase().includes(searchLower) ||
      appointment.service?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-[1600px] mx-auto w-full p-3 sm:p-4 md:p-8 space-y-5 md:space-y-10">
      {/* Header - Dusty Rose Sober Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-[0_20px_50px_rgba(236,72,153,0.12)] relative overflow-hidden border border-pink-100"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-[60px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-5xl font-black mb-1 md:mb-3 tracking-tight text-slate-800">
              Mes <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent uppercase">Rendez-vous</span>
            </h1>
            <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-80">
              Gestion de vos sessions privées
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-xs md:text-sm tracking-widest shadow-lg shadow-pink-200 transition-all w-fit"
          >
            <Plus className="w-5 h-5" />
            RÉSERVER
          </motion.button>
        </div>
      </motion.div>

      {/* Filters Row - Centered & Sober */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] md:text-xs font-bold transition-all border ${selectedFilter === filter.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-500 shadow-md shadow-pink-100'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-pink-200'
                  }`}
              >
                <filter.icon className={`hidden sm:block w-3.5 h-3.5 ${selectedFilter === filter.id ? 'text-white' : 'text-pink-300'}`} />
                {filter.label}
                {filter.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-lg text-[10px] ${selectedFilter === filter.id ? 'bg-white/20 text-white' : 'bg-pink-50 text-pink-500'
                    }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-72">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-rose-400 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/5 focus:border-pink-400/30 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center">
              <Loader className="w-8 h-8 animate-spin text-pink-300" />
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:border-pink-100 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(appointment.status)}`}>
                    {appointment.status === 'confirmed' ? 'Confirmé' :
                      appointment.status === 'pending' ? 'Attente' :
                        appointment.status === 'completed' ? 'Terminé' : 'Annulé'}
                  </div>
                  <button className="text-slate-200 hover:text-pink-400 p-1">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-pink-400 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-600 group-hover:text-white transition-all duration-300 shadow-inner">
                      <User size={24} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-slate-800 truncate">
                        {appointment.service || 'Service'}
                      </h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter truncate">{appointment.clientName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-pink-200" />
                      <span className="text-xs font-bold text-slate-600 truncate">{formatAppointmentDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-pink-200" />
                      <span className="text-xs font-bold text-slate-600">{appointment.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-slate-300 min-w-0 flex-1 mr-4">
                      <MapPin size={12} />
                      <span className="text-[10px] font-medium truncate italic">{appointment.location || 'Virtuel'}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDetailsModal(true);
                      }}
                      className="text-[10px] font-black text-pink-400 uppercase tracking-widest hover:text-pink-600 transition-all"
                    >
                      DÉTAILS
                    </button>
                  </div>
                </div>

                {appointment.status === 'pending' && (
                  <div className="mt-6 flex gap-2">
                    <button
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl text-xs font-black shadow-md hover:opacity-90 shadow-pink-50 transition-all"
                      onClick={() => confirmAppointment(appointment.id)}
                    >
                      CONFIRMER
                    </button>
                    <button
                      className="px-4 bg-slate-50 text-slate-400 py-3 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-all"
                      onClick={() => cancelAppointment(appointment.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-pink-100 flex flex-col items-center text-center px-10">
              <CalendarX size={40} className="text-pink-100 mb-4" />
              <h3 className="text-2xl font-black text-slate-800 mb-2 font-black">Aucun rendez-vous</h3>
              <p className="text-slate-400 text-sm max-w-xs mb-8">Commencez dès maintenant votre expérience.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest shadow-lg shadow-pink-100"
              >
                RÉSERVER
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Details - Bottom Sheet Style Sober */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[200]">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-pink-50"
            >
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-800">Détails Session</h2>
                  <button onClick={() => setShowDetailsModal(false)} className="p-2 bg-pink-50 rounded-full text-pink-500">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-pink-50/30 rounded-3xl border border-pink-100">
                    <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-3">Client</p>
                    <p className="text-lg font-bold text-slate-800">{selectedAppointment.clientName}</p>
                    <p className="text-sm text-slate-400">{selectedAppointment.clientEmail}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service</p>
                      <p className="font-bold text-slate-700">{selectedAppointment.service || 'Standard'}</p>
                    </div>
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut</p>
                      <p className="font-bold text-pink-400 uppercase">{selectedAppointment.status}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full bg-slate-800 text-white py-5 rounded-2xl font-bold text-sm tracking-widest hover:bg-slate-900 transition-all"
                >
                  FERMER
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientAppointmentsSectionReal;

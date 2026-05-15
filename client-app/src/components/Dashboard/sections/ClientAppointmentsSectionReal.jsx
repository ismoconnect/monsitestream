import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppointments } from '../../../hooks/useAppointments';
import { useNotification } from '../../../contexts/NotificationContext';
import CreateAppointmentModal from '../CreateAppointmentModal';
import PaymentModal from '../PaymentModal';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  Plus,
  Search,
  CheckCircle,
  Loader,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  Euro,
  Crown,
  Sparkles,
  Heart,
  ChevronRight
} from 'lucide-react';

const ClientAppointmentsSectionReal = ({ currentUser }) => {
  const { appointments, stats, loading, confirmAppointment, cancelAppointment, updatePaymentStatus } = useAppointments();
  const { showSuccess, showError } = useNotification();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);

  const statusConfig = {
    pending:   { label: 'En attente de paiement', dot: 'bg-amber-400',   classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    confirmed: { label: 'Confirmé',   dot: 'bg-emerald-400', classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    completed: { label: 'Terminé',    dot: 'bg-indigo-400',  classes: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' },
    cancelled: { label: 'Annulé',     dot: 'bg-red-400',     classes: 'text-red-400 bg-red-500/10 border-red-500/20' },
  };

  const filters = [
    { id: 'all',       label: 'Tous',       count: appointments?.length || 0 },
    { id: 'pending',   label: 'À payer', count: appointments?.filter(a => a.status === 'pending').length || 0 },
    { id: 'confirmed', label: 'Confirmés',  count: appointments?.filter(a => a.status === 'confirmed').length || 0 },
    { id: 'completed', label: 'Terminés',   count: appointments?.filter(a => a.status === 'completed').length || 0 },
    { id: 'cancelled', label: 'Annulés',    count: appointments?.filter(a => a.status === 'cancelled').length || 0 },
  ];

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredAppointments = (appointments || []).filter(a => {
    if (selectedFilter !== 'all' && a.status !== selectedFilter) return false;
    const s = searchTerm.toLowerCase();
    return !s || a.clientName?.toLowerCase().includes(s) || a.service?.toLowerCase().includes(s);
  });

  const statsCards = [
    { label: 'Total',      value: appointments?.length || 0,                                        icon: <Calendar className="w-5 h-5" />,    color: 'from-[#4338ca] to-[#7c3aed]' },
    { label: 'Confirmés',  value: appointments?.filter(a => a.status === 'confirmed').length || 0,  icon: <CalendarCheck className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500' },
    { label: 'À payer', value: appointments?.filter(a => a.status === 'pending').length || 0,    icon: <Euro className="w-5 h-5" />, color: 'from-amber-500 to-orange-500' },
    { label: 'Terminés',   value: appointments?.filter(a => a.status === 'completed').length || 0,  icon: <CheckCircle className="w-5 h-5" />,   color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="w-full max-w-full space-y-6 pb-10">

      {/* ── HERO HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#4338ca] to-[#701a75] p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300/70 mb-2">Espace privé</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight leading-none">
              Mes Rendez-vous
            </h1>
            <p className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest mt-2">
              Gestion de vos sessions avec Liliana
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-white text-[#4338ca] px-6 py-3 rounded-xl font-black text-xs tracking-widest uppercase shadow-xl hover:bg-indigo-50 transition-colors w-fit flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Réserver
          </motion.button>
        </div>
      </motion.div>

      {/* ── STATS ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {statsCards.map((s, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── FILTRES + RECHERCHE ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
      >
        <div className="flex flex-wrap gap-2">
          {filters.map(({ id, label, count }) => (
            <motion.button
              key={id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedFilter(id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-2 border ${
                selectedFilter === id
                  ? 'bg-gradient-to-r from-[#4338ca] to-[#7c3aed] text-white border-transparent shadow-lg shadow-indigo-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${selectedFilter === id ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
                {count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Recherche */}
        <div className="relative sm:ml-auto w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 text-sm font-medium transition-all"
          />
        </div>
      </motion.div>

      {/* ── LISTE DES RDV ── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader className="w-8 h-8 animate-spin text-indigo-300" />
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appt, index) => {
              // Si c'est en attente mais déjà payé, on override le visuel
              let sc = statusConfig[appt.status] || statusConfig.pending;
              let customLabel = sc.label;
              let customClasses = sc.classes;
              let customDot = sc.dot;

              if (appt.status === 'pending' && appt.paymentStatus === 'paid') {
                customLabel = 'En attente de validation';
                customClasses = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
                customDot = 'bg-indigo-400';
              }

              return (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(67,56,202,0.08)' }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 group transition-all duration-200 cursor-pointer"
                  onClick={() => { setSelectedAppointment(appt); setShowDetailsModal(true); }}
                >
                  <div className="flex items-start gap-5">

                    {/* Icône */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4338ca] to-[#7c3aed] flex items-center justify-center text-white shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                      <CalendarCheck className="w-6 h-6" />
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-black text-gray-900 text-base uppercase tracking-tight">
                          {appt.service || 'Session privée'}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${customClasses}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${customDot}`} />
                          {customLabel}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {appt.clientName || 'Client'}
                      </p>

                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {formatDate(appt.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          {appt.time || '—'}
                        </span>
                        {appt.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-pink-400" />
                            {appt.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Droite */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      {appt.price && (
                        <p className="text-xl font-black text-gray-900">
                          {appt.price}<span className="text-sm text-gray-400 font-bold">€</span>
                        </p>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>

                  {/* Actions si en attente ET non payé */}
                  {appt.status === 'pending' && appt.paymentStatus !== 'paid' && (
                    <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => { e.stopPropagation(); setPaymentAppointment(appt); }}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                      >
                        <Euro className="w-3.5 h-3.5" />
                        Payer {appt.price ? `${appt.price}€` : ''}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => { e.stopPropagation(); cancelAppointment(appt.id); }}
                        className="px-4 bg-gray-50 text-gray-500 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center gap-1.5"
                      >
                        <X size={14} className="stroke-[3]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Annuler</span>
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 flex flex-col items-center text-center bg-white rounded-2xl border border-dashed border-indigo-100"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mx-auto mb-6">
                <CalendarX className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Aucun rendez-vous</h3>
              <p className="text-sm text-gray-400 font-medium mb-6 max-w-xs">
                {selectedFilter === 'all' ? "Vous n'avez aucun rendez-vous pour le moment." : `Aucun rendez-vous ${statusConfig[selectedFilter]?.label?.toLowerCase()}.`}
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4338ca] to-[#7c3aed] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg"
              >
                <Plus className="w-4 h-4" /> Réserver maintenant
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MODAL CRÉATION ── */}
      <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* ── MODAL PAIEMENT ── */}
      <PaymentModal
        isOpen={!!paymentAppointment}
        onClose={() => setPaymentAppointment(null)}
        appointment={paymentAppointment}
        onPaymentSuccess={(details) => {
          if (paymentAppointment) {
            updatePaymentStatus(paymentAppointment.id, 'paid', details);
            setPaymentAppointment(null);
          }
        }}
      />

      {/* ── MODAL DÉTAIL ── */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-[#1e1b4b] via-[#4338ca] to-[#701a75] p-7 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300/70 mb-1">Détail</p>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                      {selectedAppointment.service || 'Session privée'}
                    </h2>
                    <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${statusConfig[selectedAppointment.status]?.classes}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedAppointment.status]?.dot}`} />
                      {statusConfig[selectedAppointment.status]?.label}
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowDetailsModal(false)}
                    className="bg-white/10 text-white p-2.5 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Calendar className="w-4 h-4 text-indigo-500" />, label: 'Date',    value: formatDate(selectedAppointment.date) },
                    { icon: <Clock className="w-4 h-4 text-purple-500" />,   label: 'Heure',   value: selectedAppointment.time || '—' },
                    { icon: <MapPin className="w-4 h-4 text-pink-500" />,    label: 'Lieu',    value: selectedAppointment.location || 'Virtuel' },
                    { icon: <span className="text-emerald-500 font-black text-sm">€</span>,    label: 'Prix',    value: selectedAppointment.price ? `${selectedAppointment.price}€` : '—' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        {item.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>

                {selectedAppointment.notes && (
                  <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Notes</p>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{selectedAppointment.notes}</p>
                  </div>
                )}

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg mt-2"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientAppointmentsSectionReal;

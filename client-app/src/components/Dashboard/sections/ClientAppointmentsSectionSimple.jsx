import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Euro,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Sparkles,
  Star,
  Heart,
  Zap,
  Phone,
  MessageCircle,
  Download,
  ChevronRight,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  X,
  Crown
} from 'lucide-react';

const ClientAppointmentsSectionSimple = ({ currentUser }) => {
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const appointments = [
    {
      id: 1,
      service: 'Dîner Romantique',
      serviceType: 'premium',
      date: '2024-01-20',
      time: '20:00',
      duration: '3 heures',
      location: 'Restaurant Le Jardin',
      address: '123 Avenue des Champs-Élysées, Paris',
      price: 150,
      status: 'confirmed',
      notes: 'Anniversaire de rencontre — Préférence pour la table près de la fenêtre',
      specialRequests: ['Fleurs roses', 'Champagne', 'Musique douce'],
      paymentStatus: 'paid',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      service: 'Soirée Privée',
      serviceType: 'vip',
      date: '2024-01-25',
      time: '19:30',
      duration: '4 heures',
      location: 'Appartement Privé',
      address: '45 Rue de Rivoli, Paris',
      price: 200,
      status: 'pending',
      notes: 'Ambiance intime souhaitée — Préférences spéciales',
      specialRequests: ['Bougies', 'Dîner privé', 'Massage'],
      paymentStatus: 'pending',
      createdAt: '2024-01-22T14:15:00Z'
    },
    {
      id: 3,
      service: 'Weekend Escapade',
      serviceType: 'luxury',
      date: '2024-02-01',
      time: '18:00',
      duration: '48 heures',
      location: 'Hôtel Ritz',
      address: 'Place Vendôme, Paris',
      price: 500,
      status: 'cancelled',
      notes: 'Annulé par le client — Remboursement effectué',
      specialRequests: ['Suite présidentielle', 'Spa privé', 'Dîner gastronomique'],
      paymentStatus: 'refunded',
      createdAt: '2024-01-28T09:45:00Z'
    },
    {
      id: 4,
      service: 'Déjeuner Business',
      serviceType: 'standard',
      date: '2024-01-18',
      time: '12:30',
      duration: '2 heures',
      location: 'Café de Flore',
      address: '172 Boulevard Saint-Germain, Paris',
      price: 80,
      status: 'completed',
      notes: 'Rendez-vous professionnel — Très satisfait',
      specialRequests: ['Table calme', 'WiFi disponible'],
      paymentStatus: 'paid',
      createdAt: '2024-01-16T16:20:00Z'
    },
    {
      id: 5,
      service: 'Séance Photo',
      serviceType: 'premium',
      date: '2024-01-30',
      time: '15:00',
      duration: '2 heures',
      location: 'Studio Privé',
      address: '78 Rue de la Paix, Paris',
      price: 120,
      status: 'confirmed',
      notes: 'Séance photo professionnelle — Thème élégance',
      specialRequests: ['Éclairage professionnel', 'Costumes fournis', 'Retouches incluses'],
      paymentStatus: 'paid',
      createdAt: '2024-01-25T11:10:00Z'
    }
  ];

  const filteredAppointments = appointments.filter(a =>
    filter === 'all' ? true : a.status === filter
  );

  const statusConfig = {
    confirmed: { label: 'Confirmé', classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
    pending:   { label: 'En attente', classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
    cancelled: { label: 'Annulé', classes: 'text-red-400 bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
    completed: { label: 'Terminé', classes: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20', dot: 'bg-indigo-400' },
  };

  const serviceConfig = {
    vip:      { label: 'VIP Elite', gradient: 'from-amber-400 to-orange-500', icon: <Crown className="w-3 h-3" /> },
    luxury:   { label: 'Luxury',    gradient: 'from-purple-500 to-pink-500',  icon: <Sparkles className="w-3 h-3" /> },
    premium:  { label: 'Premium',   gradient: 'from-indigo-500 to-purple-600', icon: <Heart className="w-3 h-3" /> },
    standard: { label: 'Standard',  gradient: 'from-slate-500 to-slate-600',   icon: <Calendar className="w-3 h-3" /> },
  };

  const paymentConfig = {
    paid:    { label: 'Payé', classes: 'text-emerald-400 bg-emerald-500/10' },
    pending: { label: 'En attente', classes: 'text-amber-400 bg-amber-500/10' },
    refunded:{ label: 'Remboursé', classes: 'text-red-400 bg-red-500/10' },
  };

  const stats = [
    { label: 'Total RDV', value: appointments.length, icon: <CalendarDays className="w-5 h-5" />, color: 'from-indigo-500 to-purple-600' },
    { label: 'Confirmés', value: appointments.filter(a => a.status === 'confirmed').length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500' },
    { label: 'En attente', value: appointments.filter(a => a.status === 'pending').length, icon: <AlertCircle className="w-5 h-5" />, color: 'from-amber-500 to-orange-500' },
    { label: 'Chiffre d\'affaires', value: appointments.filter(a => a.paymentStatus === 'paid').reduce((s, a) => s + a.price, 0) + '€', icon: <Euro className="w-5 h-5" />, color: 'from-pink-500 to-rose-500' },
  ];

  const openModal = (appt) => { setSelectedAppointment(appt); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setSelectedAppointment(null); };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0 space-y-6 pb-8">

      {/* ── HERO HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#4338ca] to-[#701a75] p-8 shadow-2xl"
      >
        {/* Decorative blobs */}
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

          {currentUser?.subscription?.plan === 'basic' ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-end gap-2"
            >
              <button
                disabled
                className="flex items-center gap-2 bg-slate-100 text-slate-400 px-6 py-3 rounded-xl font-black text-xs tracking-widest uppercase cursor-not-allowed border border-slate-200"
              >
                <Lock className="w-4 h-4" />
                Plan Premium Requis
              </button>
              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-tight">
                Le plan standard ne permet pas de réserver
              </p>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 bg-white text-[#4338ca] px-6 py-3 rounded-xl font-black text-xs tracking-widest uppercase shadow-xl hover:bg-indigo-50 transition-colors w-fit flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Réserver
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── STATS ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── FILTRES ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex flex-wrap gap-2"
      >
        {[
          { key: 'all',       label: 'Tous',       count: appointments.length },
          { key: 'confirmed', label: 'Confirmés',   count: appointments.filter(a => a.status === 'confirmed').length },
          { key: 'pending',   label: 'En attente',  count: appointments.filter(a => a.status === 'pending').length },
          { key: 'completed', label: 'Terminés',    count: appointments.filter(a => a.status === 'completed').length },
          { key: 'cancelled', label: 'Annulés',     count: appointments.filter(a => a.status === 'cancelled').length },
        ].map(({ key, label, count }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-2 border ${
              filter === key
                ? 'bg-gradient-to-r from-[#4338ca] to-[#7c3aed] text-white border-transparent shadow-lg shadow-indigo-200'
                : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              filter === key ? 'bg-white/20' : 'bg-gray-100 text-gray-400'
            }`}>{count}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ── LISTE DES RDV ── */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAppointments.map((appt, index) => {
            const sc = serviceConfig[appt.serviceType] || serviceConfig.standard;
            const stc = statusConfig[appt.status] || statusConfig.pending;
            const pc = paymentConfig[appt.paymentStatus] || paymentConfig.pending;

            return (
              <motion.div
                key={appt.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
                onClick={() => openModal(appt)}
                className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer group transition-all duration-200"
              >
                <div className="flex items-start gap-5">

                  {/* Icône service */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sc.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                    <CalendarDays className="w-6 h-6" />
                  </div>

                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0">
                    {/* Ligne 1 — titre + badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-black text-gray-900 text-base uppercase tracking-tight">{appt.service}</h3>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${sc.gradient} text-white`}>
                        {sc.icon} {sc.label}
                      </span>

                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${stc.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stc.dot}`} />
                        {stc.label}
                      </span>
                    </div>

                    {/* Ligne 2 — détails */}
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500 font-semibold mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {new Date(appt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {appt.time} · {appt.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-pink-400" />
                        {appt.location}
                      </span>
                    </div>

                    {/* Ligne 3 — tags demandes spéciales */}
                    {appt.specialRequests?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {appt.specialRequests.slice(0, 3).map((r, i) => (
                          <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            ✦ {r}
                          </span>
                        ))}
                        {appt.specialRequests.length > 3 && (
                          <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-bold">
                            +{appt.specialRequests.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Colonne droite — prix + statut paiement */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-2xl font-black text-gray-900">{appt.price}<span className="text-sm text-gray-400 font-bold">€</span></p>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${pc.classes}`}>
                      {pc.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors mt-1" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── ÉTAT VIDE ── */}
      {filteredAppointments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Aucun rendez-vous</h3>
          <p className="text-sm text-gray-400 font-medium mb-6">
            {filter === 'all' ? "Vous n'avez aucun rendez-vous pour le moment." : `Aucun rendez-vous ${statusConfig[filter]?.label.toLowerCase()} pour le moment.`}
          </p>
          {currentUser?.subscription?.plan === 'basic' ? (
            <button
              disabled
              className="inline-flex items-center gap-2 bg-slate-100 text-slate-400 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed border border-slate-200"
            >
              <Lock className="w-4 h-4" /> Passer au Premium pour réserver
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4338ca] to-[#7c3aed] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg"
            >
              <Plus className="w-4 h-4" /> Réserver maintenant
            </motion.button>
          )}
        </motion.div>
      )}

      {/* ── MODAL DÉTAIL ── */}
      <AnimatePresence>
        {showModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-[#1e1b4b] via-[#4338ca] to-[#701a75] p-7 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300/70 mb-1">Détail du rendez-vous</p>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedAppointment.service}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${statusConfig[selectedAppointment.status]?.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedAppointment.status]?.dot}`} />
                        {statusConfig[selectedAppointment.status]?.label}
                      </span>
                      <span className="text-indigo-200/60 text-xs font-semibold">{selectedAppointment.price}€</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    className="bg-white/10 text-white p-2.5 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-7 space-y-6 max-h-[65vh] overflow-y-auto">
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Calendar className="w-4 h-4 text-indigo-500" />, label: 'Date', value: new Date(selectedAppointment.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                    { icon: <Clock className="w-4 h-4 text-purple-500" />, label: 'Horaire', value: `${selectedAppointment.time} · ${selectedAppointment.duration}` },
                    { icon: <MapPin className="w-4 h-4 text-pink-500" />, label: 'Lieu', value: selectedAppointment.location },
                    { icon: <CreditCard className="w-4 h-4 text-emerald-500" />, label: 'Paiement', value: paymentConfig[selectedAppointment.paymentStatus]?.label },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">{item.icon}<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</span></div>
                      <p className="text-sm font-bold text-gray-800 leading-snug">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Notes</p>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Demandes spéciales */}
                {selectedAppointment.specialRequests?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Demandes spéciales</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAppointment.specialRequests.map((r, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100">
                          ✦ {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { label: 'Appeler', icon: <Phone className="w-4 h-4" />, color: 'from-indigo-500 to-purple-600' },
                    { label: 'Message', icon: <MessageCircle className="w-4 h-4" />, color: 'from-pink-500 to-rose-500' },
                    { label: 'Modifier', icon: <Edit className="w-4 h-4" />, color: 'from-slate-600 to-slate-700' },
                    { label: 'Exporter', icon: <Download className="w-4 h-4" />, color: 'from-emerald-500 to-teal-600' },
                  ].map((btn, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center justify-center gap-2 bg-gradient-to-r ${btn.color} text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg`}
                    >
                      {btn.icon} {btn.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientAppointmentsSectionSimple;

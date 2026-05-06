import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, User, Phone, Mail, Euro, Heart, Sparkles } from 'lucide-react';
import { useAppointments } from '../../hooks/useAppointments';

const CreateAppointmentModal = ({ isOpen, onClose }) => {
  const { createAppointment } = useAppointments();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    service: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    price: '',
    notes: '',
    specialRequests: ''
  });

  const services = [
    'Massage relaxant',
    'Massage thérapeutique',
    'Accompagnement',
    'Dîner',
    'Soirée',
    'Week-end',
    'Autre'
  ];

  const locations = [
    'À domicile (client)',
    'À domicile (Liliana)',
    'Hôtel',
    'Restaurant',
    'Autre'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appointmentDate = new Date(`${formData.date}T${formData.time}`);

      await createAppointment({
        ...formData,
        date: appointmentDate,
        price: formData.price ? parseFloat(formData.price) : null,
        duration: parseInt(formData.duration),
        currency: 'EUR'
      });

      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        service: '',
        date: '',
        time: '',
        duration: 60,
        location: '',
        price: '',
        notes: '',
        specialRequests: ''
      });

      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl mx-auto overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Design - Soft Rose */}
            <div className="bg-gradient-to-r from-[#FFF1F2] to-[#FFE4E6] p-8 text-rose-900 relative overflow-hidden border-b border-rose-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-1">NOUVEAU RÉSERVÉ</h2>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Planifiez une session exclusive</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 max-h-[70dvh] overflow-y-auto scrollbar-hide space-y-8">
              {/* Client Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-4 bg-pink-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Informations Client</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-500" />
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      required
                      placeholder="Nom complet *"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-pink-500/30 focus:ring-4 focus:ring-pink-500/5 transition-all outline-none text-sm font-bold"
                    />
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-500" />
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      required
                      placeholder="Email *"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-pink-500/30 focus:ring-4 focus:ring-pink-500/5 transition-all outline-none text-sm font-bold"
                    />
                  </div>
                </div>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-500" />
                  <input
                    type="tel"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleChange}
                    placeholder="Téléphone"
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-pink-500/30 focus:ring-4 focus:ring-pink-500/5 transition-all outline-none text-sm font-bold"
                  />
                </div>
              </div>

              {/* Service & Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Détails de la Session</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500" />
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-500/30 transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionnez un service *</option>
                      {services.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500" />
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-500/30 transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
                    >
                      <option value="">Lieu de rencontre</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white outline-none text-sm font-bold"
                    />
                  </div>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white outline-none text-sm font-bold"
                    />
                  </div>
                  <div className="relative group">
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white outline-none text-sm font-bold appearance-none cursor-pointer"
                    >
                      <option value={30}>30 min</option>
                      <option value={60}>1 heure</option>
                      <option value={120}>2 heures</option>
                      <option value={180}>3 heures</option>
                    </select>
                  </div>
                </div>

                <div className="relative group">
                  <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Prix proposé (EUR)"
                    className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:border-emerald-500/30 outline-none text-sm font-bold"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-4 bg-gray-300 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Notes & Demandes</span>
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Notes ou préférences particulières..."
                  className="w-full p-6 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-gray-200 outline-none text-sm font-medium transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/3 py-5 rounded-[1.5rem] text-sm font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 bg-rose-500 text-white py-5 rounded-[1.5rem] font-black text-sm tracking-[0.2em] shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      CONFIRMER RDV
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default CreateAppointmentModal;

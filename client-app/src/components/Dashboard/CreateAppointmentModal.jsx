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
    clientPhone: '',
    service: '',
    date: '',
    time: '',
    duration: '60',
    location: '',
    price: '150',
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
        clientPhone: '',
        service: '',
        date: '',
        time: '',
        duration: '60',
        location: '',
        price: '150',
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
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Calcul automatique du prix selon la durée
    if (name === 'duration') {
      const pricing = {
        '30': 100,
        '60': 150,
        '120': 200,
        '180': 300,
        '720': 500, // Toute la journée (12h)
        '360': 500  // Toute la soirée (6h)
      };
      if (pricing[value]) {
        newFormData.price = pricing[value];
      }
    }

    setFormData(newFormData);
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl mx-auto overflow-hidden relative border border-indigo-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#1e1b4b] via-[#4338ca] to-[#701a75] p-5 sm:p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight mb-0.5">NOUVELLE RÉSERVATION</h2>
                  <p className="text-indigo-200/80 text-[10px] font-bold uppercase tracking-widest">Planifiez une session exclusive</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto scrollbar-hide space-y-5">
              {/* Client Info Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Informations Client</span>
                  <div className="flex-1 h-[1px] bg-indigo-50"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#4338ca] transition-colors" />
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      required
                      placeholder="Nom, Prénom ou Pseudonyme *"
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#4338ca] focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-bold text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#4338ca] transition-colors" />
                    <input
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      placeholder="Téléphone *"
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#4338ca] focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-bold text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Service & Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Détails de la Session</span>
                  <div className="flex-1 h-[1px] bg-purple-50"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative group md:col-span-2">
                    <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#7c3aed] transition-colors" />
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-500/10 transition-all outline-none text-sm font-bold text-gray-800 appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-gray-400">Sélectionnez un service *</option>
                      {services.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#7c3aed] transition-colors" />
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-500/10 transition-all outline-none text-sm font-bold text-gray-800 appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-gray-400">Lieu</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="relative group">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#4338ca] transition-colors" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#4338ca] focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-bold text-gray-800"
                    />
                  </div>
                  <div className="relative group">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#4338ca] transition-colors" />
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#4338ca] focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-bold text-gray-800"
                    />
                  </div>
                  <div className="relative group">
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#4338ca] focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-bold text-gray-800 appearance-none cursor-pointer text-center"
                    >
                      <option value="30">30 min</option>
                      <option value="60">1 heure</option>
                      <option value="120">2 heures</option>
                      <option value="180">3 heures</option>
                      <option value="720">Toute la journée</option>
                      <option value="360">Toute la soirée</option>
                    </select>
                  </div>
                  <div className="relative group">
                    <Euro className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Prix (EUR)"
                      className="w-full pl-10 pr-3 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-bold text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Notes & Demandes</span>
                  <div className="flex-1 h-[1px] bg-gray-100"></div>
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Préférences, demandes spéciales, instructions d'accès..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#4338ca] focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium text-gray-800 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/3 py-3 rounded-xl text-xs font-black text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 bg-gradient-to-r from-[#4338ca] to-[#7c3aed] text-white py-3 rounded-xl font-black text-xs tracking-widest uppercase shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      CONFIRMER RÉSERVATION
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

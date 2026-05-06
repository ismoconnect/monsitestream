import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';

const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [currentStep, setCurrentStep] = useState(1);

  const services = [
    { id: 'accompaniment', name: 'Accompagnement Événementiel', duration: 'Soirée', price: 'Sur devis' },
    { id: 'private', name: 'Rendez-vous Privé', duration: '1-2h', price: '€€€' },
    { id: 'streaming', name: 'Session Streaming Privée', duration: '30-60min', price: '€€' }
  ];

  const availableSlots = [
    '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const handleBooking = async () => {
    try {
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        service: selectedService,
        clientInfo,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('Réservation créée:', bookingData);
      alert('Réservation envoyée avec succès ! Vous recevrez une confirmation par email.');
      
      // Reset form
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedService('');
      setClientInfo({ name: '', email: '', phone: '', specialRequests: '' });
      setCurrentStep(1);
    } catch (error) {
      console.error('Erreur réservation:', error);
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Choisissez votre service</h3>
            <div className="grid gap-4">
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedService === service.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">{service.name}</h4>
                      <p className="text-sm text-gray-600">Durée: {service.duration}</p>
                    </div>
                    <span className="text-lg font-bold text-pink-600">{service.price}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Sélectionnez une date</h3>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                const isPast = date < new Date();
                
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isPast}
                    className={`p-3 text-sm rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-pink-500 text-white border-pink-500'
                        : isPast
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => !isPast && setSelectedDate(date)}
                  >
                    {date.getDate()}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Choisissez un créneau le {selectedDate?.toLocaleDateString('fr-FR')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {availableSlots.map((slot) => (
                <motion.button
                  key={slot}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTime === slot
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 hover:border-pink-300 text-gray-700'
                  }`}
                  onClick={() => setSelectedTime(slot)}
                >
                  <Clock className="w-5 h-5 mx-auto mb-2" />
                  {slot}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Vos informations</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="+33 6 XX XX XX XX"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demandes spéciales
                </label>
                <textarea
                  value={clientInfo.specialRequests}
                  onChange={(e) => setClientInfo({ ...clientInfo, specialRequests: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Décrivez vos préférences ou demandes particulières..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Réserver un Rendez-vous</h2>
          <p className="text-gray-600">Planifiez votre moment privilégié en quelques étapes</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-pink-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Service</span>
            <span>Date</span>
            <span>Horaire</span>
            <span>Informations</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Précédent
          </motion.button>

          {currentStep < 4 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !selectedService) ||
                (currentStep === 2 && !selectedDate) ||
                (currentStep === 3 && !selectedTime)
              }
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                (currentStep === 1 && !selectedService) ||
                (currentStep === 2 && !selectedDate) ||
                (currentStep === 3 && !selectedTime)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
            >
              Suivant
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBooking}
              disabled={!clientInfo.name || !clientInfo.email}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                !clientInfo.name || !clientInfo.email
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg'
              }`}
            >
              Confirmer la Réservation
            </motion.button>
          )}
        </div>

        {/* Summary */}
        {currentStep > 1 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Résumé de votre réservation</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {selectedService && (
                <p>Service: {services.find(s => s.id === selectedService)?.name}</p>
              )}
              {selectedDate && (
                <p>Date: {selectedDate.toLocaleDateString('fr-FR')}</p>
              )}
              {selectedTime && (
                <p>Horaire: {selectedTime}</p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BookingCalendar;

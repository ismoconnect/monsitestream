import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Heart, Video, Star, Clock, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../auth/AuthProvider';

const ServicesSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  const services = [
    {
      title: "Accompagnement Événementiel",
      duration: "Soirée",
      price: "Sur devis",
      description: "Accompagnement pour dîners, galas, événements professionnels",
      features: ["Tenue élégante", "Conversation raffinée", "Discrétion absolue"],
      icon: <Star className="w-8 h-8" />,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Rendez-vous Privé",
      duration: "1-2h",
      price: "€€€",
      description: "Moment intime et privilégié dans un cadre luxueux",
      features: ["Cadre luxueux", "Attention personnalisée", "Respect mutuel"],
      icon: <Heart className="w-8 h-8" />,
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "Session Streaming Privée",
      duration: "30-60min",
      price: "€€",
      description: "Moment exclusif via webcam haute qualité",
      features: ["Interaction personnalisée", "Contenu sur mesure", "Total anonymat"],
      icon: <Video className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-pink-50 w-full max-w-full overflow-hidden">
      <div className="container mx-auto px-6 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Mes Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Des expériences uniques et personnalisées, conçues pour votre plaisir et votre satisfaction
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
                  {service.title}
                </h3>

                <div className="flex items-center justify-center mb-4">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-600">{service.duration}</span>
                </div>

                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full mr-3`}></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center">
                  <div className={`font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent ${isAuthenticated ? 'text-3xl' : 'text-sm'}`}>
                    {isAuthenticated ? service.price : 'Connectez-vous pour voir les tarifs'}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate('/dashboard/appointments');
                      } else {
                        openAuthModal('signin');
                      }
                    }}
                    className={`w-full bg-gradient-to-r ${service.color} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300`}
                  >
                    Réserver
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-pink-500 mr-3" />
              <h3 className="text-2xl font-bold text-gray-800">Garanties de Service</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Confidentialité Totale</h4>
                <p className="text-sm text-gray-600">Vos données et communications sont protégées</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Service Premium</h4>
                <p className="text-sm text-gray-600">Expérience personnalisée et raffinée</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Flexibilité</h4>
                <p className="text-sm text-gray-600">Horaires adaptés à vos besoins</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Shield, Calendar } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen overflow-hidden pt-16">
      {/* Background avec overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-600/20">
        <div className="w-full h-full bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100"></div>
      </div>
      
      {/* Contenu principal */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-gray-800 px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Sophie
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-700 max-w-3xl mx-auto leading-relaxed px-4">
              Accompagnatrice de luxe - Discrétion & Élégance
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Me Découvrir
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/booking')}
                className="border-2 border-pink-500 text-pink-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-pink-50 transition-all duration-300"
              >
                Réserver un RDV
              </motion.button>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <Shield className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800">Discrétion Absolue</h3>
                <p className="text-sm text-gray-600">Confidentialité garantie</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <Star className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800">Service Premium</h3>
                <p className="text-sm text-gray-600">Expérience sur mesure</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <Calendar className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800">Disponibilité</h3>
                <p className="text-sm text-gray-600">Réservation facile</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-pink-500 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-pink-500 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

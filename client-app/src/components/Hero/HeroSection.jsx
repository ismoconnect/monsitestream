import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../auth/AuthProvider';
import { images } from '../../utils/images';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px = breakpoint md de Tailwind
    };

    // Vérifier au chargement
    checkMobile();

    // Vérifier lors du redimensionnement
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Choisir l'image appropriée selon la taille d'écran
  const heroImage = isMobile ? images.hero.mobile : images.hero.main;

  return (
    <section className="relative h-screen overflow-hidden pt-16">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0">
        {/* Image de Sophie - Responsive */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: isMobile ? 'center top' : 'center center'
          }}
        />
        {/* Overlay dégradé pour la lisibilité - Plus léger */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/40 via-purple-900/30 to-pink-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white px-4 sm:px-6 max-w-4xl mx-auto -mt-32 sm:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-4 sm:mb-6">
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-pink-300 mx-auto mb-3 sm:mb-4 drop-shadow-lg" />
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-pink-200 via-white to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
              Liliana
            </h1>

            <p className="text-base sm:text-lg md:text-2xl mb-6 sm:mb-8 text-white max-w-3xl mx-auto leading-relaxed px-2 sm:px-4 drop-shadow-lg font-medium">
              Accompagnatrice de luxe - Discrétion & Élégance
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-pink-400 to-purple-500 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base md:text-lg shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 border border-white/20"
              >
                Me Découvrir
              </motion.button>

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
                className="border-2 border-white/80 bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-white/20 transition-all duration-300 shadow-xl"
              >
                Réserver un RDV
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-1 sm:px-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-6 border border-white/20 flex flex-col items-center justify-center min-h-[90px] sm:min-h-0"
              >
                <Shield className="w-5 h-5 sm:w-8 sm:h-8 text-pink-300 mb-1 sm:mb-2" />
                <h3 className="font-semibold text-white text-[10px] sm:text-base leading-tight mb-1">Discrétion</h3>
                <p className="text-[9px] sm:text-sm text-pink-100 hidden sm:block">Confidentialité garantie</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-6 border border-white/20 flex flex-col items-center justify-center min-h-[90px] sm:min-h-0"
              >
                <Star className="w-5 h-5 sm:w-8 sm:h-8 text-pink-300 mb-1 sm:mb-2" />
                <h3 className="font-semibold text-white text-[10px] sm:text-base leading-tight mb-1">Premium</h3>
                <p className="text-[9px] sm:text-sm text-pink-100 hidden sm:block">Expérience sur mesure</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-6 border border-white/20 flex flex-col items-center justify-center min-h-[90px] sm:min-h-0"
              >
                <Calendar className="w-5 h-5 sm:w-8 sm:h-8 text-pink-300 mb-1 sm:mb-2" />
                <h3 className="font-semibold text-white text-[10px] sm:text-base leading-tight mb-1">Dispo</h3>
                <p className="text-[9px] sm:text-sm text-pink-100 hidden sm:block">Réservation facile</p>
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

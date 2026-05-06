import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Eye, Heart, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../auth/AuthProvider';

// Import des images de la galerie
import gallery1 from '../../assets/gallery/gallery-1.jpg';
import gallery2 from '../../assets/gallery/gallery-2.jpg';
import gallery3 from '../../assets/gallery/gallery-3.jpg';
import gallery4 from '../../assets/gallery/gallery-4.jpg';
import gallery5 from '../../assets/gallery/gallery-5.jpg';
import gallery6 from '../../assets/gallery/gallery-6.jpg';
import gallery7 from '../../assets/gallery/gallery-7.jpg';
import gallery8 from '../../assets/gallery/gallery-8.jpg';

const MediaGallery = () => {
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isSubscriber, setIsSubscriber] = useState(false);

  // Photos publiques
  const publicPhotos = [
    { id: 1, url: gallery1, type: 'image', title: 'Portrait élégant' },
    { id: 2, url: gallery2, type: 'image', title: 'Style et élégance' },
    { id: 3, url: gallery3, type: 'image', title: 'Sourire naturel' },
  ];

  // Contenu premium
  const premiumContent = [
    { id: 4, url: gallery4, type: 'image', title: 'Moment privé', premium: true },
    { id: 5, url: gallery5, type: 'image', title: 'Look exclusif', premium: true },
    { id: 6, url: gallery6, type: 'image', title: 'Collection été', premium: true },
    { id: 7, url: gallery7, type: 'image', title: 'Backstage', premium: true },
    { id: 8, url: gallery8, type: 'image', title: 'Contenu Privé', premium: true },
  ];

  const openModal = (media) => {
    if (media.premium && !isSubscriber) {
      // Afficher modal d'abonnement
      return;
    }
    setSelectedMedia(media);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  return (
    <section className="py-20 bg-white w-full max-w-full overflow-hidden">
      <div className="container mx-auto px-6 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Galerie
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez mes photos et vidéos exclusives
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Photos publiques */}
          {publicPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer"
              onClick={() => openModal(photo)}
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-2xl flex items-center justify-center">
                <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-2xl">
                <p className="text-white font-medium">{photo.title}</p>
              </div>
            </motion.div>
          ))}

          {/* Contenu premium avec blur */}
          {premiumContent.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index + 4) * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer"
              onClick={() => openModal(content)}
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={content.url}
                  alt={content.title}
                  className="w-full h-full object-cover blur-md"
                />
              </div>

              {/* Premium overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-2xl flex flex-col items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 mb-4">
                  <Lock className="w-8 h-8 text-pink-600" />
                </div>

                <div className="text-center">
                  <p className="text-white font-bold text-lg mb-2">Contenu Exclusif</p>
                  <p className="text-white/80 text-sm">Abonnement requis</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAuthenticated) {
                      navigate('/dashboard/subscription');
                    } else {
                      openAuthModal('signin');
                    }
                  }}
                  className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Débloquer
                </motion.button>
              </div>

              {/* Premium badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  PREMIUM
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4 pb-20 sm:pb-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[95vw] sm:max-w-4xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button - Optimized for touch */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full backdrop-blur-md transition-all duration-300"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 sm:w-6 h-6" />
              </button>

              {/* Media Container - Optimized Aspect Ratio */}
              <div className="bg-black flex items-center justify-center overflow-hidden max-h-[60vh] sm:max-h-[75vh]">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Information Overlay or Section */}
              <div className="p-5 sm:p-8 bg-white border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                      {selectedMedia.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 mt-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                      {selectedMedia.type === 'video' ? 'Vidéo exclusive' : 'Contenu public'}
                    </p>
                  </div>

                  {/* Action buttons (Optional) */}
                  <div className="flex items-center gap-3 mt-4 sm:mt-0">
                    <button
                      onClick={() => {
                        if (isAuthenticated) {
                          // Logique de like (pourrait être connectée à Firebase plus tard)
                          alert('Merci pour votre like !');
                        } else {
                          openAuthModal('signin');
                        }
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      <Heart className="w-4 h-4 mr-2" /> Like
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MediaGallery;

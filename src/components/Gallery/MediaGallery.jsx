import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Eye, Heart, Star } from 'lucide-react';

const MediaGallery = () => {
  const navigate = useNavigate();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isSubscriber, setIsSubscriber] = useState(false);

  // Photos publiques
  const publicPhotos = [
    { id: 1, url: '/api/placeholder/400/600', type: 'image', title: 'Portrait élégant' },
    { id: 2, url: '/api/placeholder/400/600', type: 'image', title: 'Sourire naturel' },
    { id: 3, url: '/api/placeholder/400/600', type: 'image', title: 'Regard mystérieux' },
    { id: 4, url: '/api/placeholder/400/600', type: 'image', title: 'Pose artistique' },
  ];

  // Contenu premium
  const premiumContent = [
    { id: 5, url: '/api/placeholder/400/600', type: 'image', title: 'Contenu exclusif 1', premium: true },
    { id: 6, url: '/api/placeholder/400/600', type: 'image', title: 'Contenu exclusif 2', premium: true },
    { id: 7, url: '/api/placeholder/400/600', type: 'video', title: 'Vidéo privée 1', premium: true },
    { id: 8, url: '/api/placeholder/400/600', type: 'image', title: 'Contenu exclusif 3', premium: true },
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
                <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                  <Heart className="w-16 h-16 text-pink-400" />
                </div>
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
                <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center blur-sm">
                  <Heart className="w-16 h-16 text-pink-400" />
                </div>
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
        
        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Accédez au contenu exclusif
            </h3>
            <p className="text-gray-600 mb-6">
              Découvrez mes photos et vidéos privées en vous abonnant à mon service premium
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('subscriptions')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Voir les abonnements
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="aspect-video bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                <Heart className="w-24 h-24 text-pink-400" />
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedMedia.title}
                </h3>
                <p className="text-gray-600">
                  {selectedMedia.type === 'video' ? 'Vidéo exclusive' : 'Photo exclusive'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MediaGallery;

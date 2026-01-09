import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Eye,
  Play,
  Lock,
  Crown,
  Heart,
  Download,
  Share2,
  Star,
  Filter,
  Search,
  Grid,
  List,
  Sparkles,
  Zap,
  X,
  Maximize2,
  Calendar,
  Clock
} from 'lucide-react';

// Import des images de la galerie
import gallery1 from '../../../assets/gallery/gallery-1.jpg';
import gallery2 from '../../../assets/gallery/gallery-2.jpg';
import gallery3 from '../../../assets/gallery/gallery-3.jpg';
import gallery4 from '../../../assets/gallery/gallery-4.jpg';
import gallery5 from '../../../assets/gallery/gallery-5.jpg';
import gallery6 from '../../../assets/gallery/gallery-6.jpg';
import gallery7 from '../../../assets/gallery/gallery-7.jpg';
import gallery8 from '../../../assets/gallery/gallery-8.jpg';

const ClientGallerySection = ({ currentUser }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [favorites, setFavorites] = useState([1, 3, 5]);

  const isPremium = currentUser?.subscription?.status === 'active' &&
    (currentUser?.subscription?.type === 'premium' || currentUser?.subscription?.type === 'vip');

  const content = [
    {
      id: 1,
      type: 'photo',
      category: 'public',
      thumbnail: gallery1,
      title: 'Portrait Élégant',
      date: '2024-01-15',
      views: 1250,
      likes: 89,
      isExclusive: false,
      description: 'Un moment de grâce capturé avec délicatesse',
      tags: ['portrait', 'élégance', 'naturel']
    },
    {
      id: 2,
      type: 'photo',
      category: 'premium',
      thumbnail: gallery4,
      title: 'Séance Intime',
      date: '2024-01-14',
      views: 450,
      likes: 120,
      isExclusive: true,
      description: 'Contenu exclusif pour les membres premium',
      tags: ['intime', 'exclusif', 'premium']
    },
    {
      id: 3,
      type: 'photo',
      category: 'premium',
      thumbnail: gallery5,
      title: 'Moment Privé',
      date: '2024-01-13',
      views: 234,
      likes: 67,
      isExclusive: true,
      description: 'Accès réservé aux abonnés premium',
      tags: ['privé', 'exclusif'],
    },
    {
      id: 4,
      type: 'photo',
      category: 'public',
      thumbnail: gallery2,
      title: 'Sourire Radieux',
      date: '2024-01-12',
      views: 890,
      likes: 156,
      isExclusive: false,
      description: 'La joie de vivre dans toute sa splendeur',
      tags: ['sourire', 'joie', 'lumière']
    },
    {
      id: 5,
      type: 'photo',
      category: 'vip',
      thumbnail: gallery4,
      title: 'Expérience VIP',
      date: '2024-01-11',
      views: 78,
      likes: 23,
      isExclusive: true,
      description: 'Contenu ultra-exclusif pour les membres VIP',
      tags: ['vip', 'ultra-exclusif', 'luxe'],
    },
    {
      id: 6,
      type: 'photo',
      category: 'public',
      thumbnail: gallery6,
      title: 'Style Moderne',
      date: '2024-01-10',
      views: 567,
      likes: 98,
      isExclusive: false,
      description: 'Une approche contemporaine de la beauté',
      tags: ['moderne', 'style', 'contemporain']
    },
    {
      id: 7,
      type: 'photo',
      category: 'premium',
      thumbnail: gallery7,
      title: 'Look Sophistiqué',
      date: '2024-01-09',
      views: 342,
      likes: 85,
      isExclusive: true,
      description: 'Détails et élégance pour nos membres',
      tags: ['élégance', 'lifestyle']
    },
    {
      id: 8,
      type: 'photo',
      category: 'vip',
      thumbnail: gallery8,
      title: 'Détente Exclusive',
      date: '2024-01-08',
      views: 156,
      likes: 42,
      isExclusive: true,
      description: 'Un moment de calme et de raffinement',
      tags: ['luxe', 'détente', 'vip']
    }
  ];

  const categories = [
    { id: 'all', label: 'Tout', count: content.length },
    { id: 'public', label: 'Public', count: content.filter(item => item.category === 'public').length },
    { id: 'premium', label: 'Premium', count: content.filter(item => item.category === 'premium').length },
    { id: 'vip', label: 'VIP', count: content.filter(item => item.category === 'vip').length }
  ];

  const filteredContent = content.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const toggleFavorite = (itemId) => {
    setFavorites(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const openLightbox = (item) => {
    if (item.category === 'premium' || item.category === 'vip') {
      if (!isPremium) {
        // Show upgrade modal
        return;
      }
    }
    setSelectedMedia(item);
    setLightboxOpen(true);
  };

  // Vérifier si l'utilisateur a accès au contenu
  const hasAccess = isPremium || selectedCategory === 'public';

  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0 p-4 sm:p-6 lg:p-8">
      {/* Header Élégant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Galerie Exclusif
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Découvrez l'univers raffiné de Liliana
                </p>
              </div>
            </div>

            {/* Stats Élégantes */}
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  {content.length} contenus disponibles
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm text-gray-600">
                  {content.reduce((sum, item) => sum + item.likes, 0)} likes total
                </span>
              </div>
            </div>
          </div>

          {isPremium && (
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="flex space-x-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1 shadow-inner">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                    ? 'bg-white shadow-md text-pink-600'
                    : 'hover:bg-white/50 text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Grid className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all duration-200 ${viewMode === 'list'
                    ? 'bg-white shadow-md text-pink-600'
                    : 'hover:bg-white/50 text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Message d'accès limité */}
      {!hasAccess && (
        <div className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-8 max-w-md mx-auto"
          >
            <Lock className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Contenu Premium</h3>
            <p className="text-gray-600 mb-4">
              Accédez à la galerie exclusive et aux contenus privés
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              Devenir Premium
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Filtres Élégants */}
      {hasAccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative px-6 py-3 font-medium transition-all duration-300 rounded-xl text-sm ${selectedCategory === category.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-md border border-gray-200/50'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {category.id === 'all' && <Zap className="w-4 h-4" />}
                  {category.id === 'public' && <Eye className="w-4 h-4" />}
                  {category.id === 'premium' && <Crown className="w-4 h-4" />}
                  {category.id === 'vip' && <Star className="w-4 h-4" />}
                  <span className="truncate">{category.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                    }`}>
                    {category.count}
                  </span>
                </div>
                {selectedCategory === category.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grille de contenu Élégante */}
      {hasAccess && viewMode === 'grid' ? (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8"
        >
          <AnimatePresence>
            {filteredContent.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-[3/4] shadow-lg hover:shadow-2xl transition-all duration-500 bg-white"
                onClick={() => openLightbox(item)}
              >
                {/* Image avec effet de parallaxe */}
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={item.thumbnail}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    alt={item.title}
                  />

                  {/* Overlay avec gradient animé */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-4"
                      >
                        {item.type === 'video' ? (
                          <Play className="w-8 h-8 text-white" />
                        ) : (
                          <Maximize2 className="w-8 h-8 text-white" />
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Badges Élégants */}
                <div className="absolute top-3 left-3 flex flex-col space-y-2">
                  {item.isExclusive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg backdrop-blur-sm"
                    >
                      ✨ Exclusif
                    </motion.span>
                  )}
                  {item.category === 'vip' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg backdrop-blur-sm"
                    >
                      👑 VIP
                    </motion.span>
                  )}
                  {item.type === 'video' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm"
                    >
                      🎥 {item.duration}
                    </motion.span>
                  )}
                </div>

                {/* Actions Élégantes */}
                <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 ${favorites.includes(item.id)
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                      : 'bg-white/80 text-gray-600 hover:bg-pink-500 hover:text-white hover:shadow-lg'
                      }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>

                {/* Infos Élégantes */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                  <motion.h3
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-semibold text-sm mb-2 truncate"
                  >
                    {item.title}
                  </motion.h3>

                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-gray-200 mb-3 line-clamp-2"
                  >
                    {item.description}
                  </motion.p>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{item.views}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{item.likes}</span>
                      </span>
                    </div>
                    <span className="flex items-center space-x-1 text-gray-300">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span key={tagIndex} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : hasAccess ? (
        <motion.div
          layout
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredContent.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl hover:bg-white transition-all duration-300 cursor-pointer group"
                onClick={() => openLightbox(item)}
              >
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 rounded-full p-2">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-800 truncate text-lg">{item.title}</h3>
                      {item.isExclusive && (
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full flex-shrink-0 shadow-lg">
                          ✨ Exclusif
                        </span>
                      )}
                      {item.category === 'vip' && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full flex-shrink-0 shadow-lg">
                          👑 VIP
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views} vues</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{item.likes} likes</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                      </span>
                      {item.duration && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.duration}</span>
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className={`p-3 rounded-xl transition-all duration-300 ${favorites.includes(item.id)
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                        : 'text-gray-400 hover:bg-pink-50 hover:text-pink-500'
                        }`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-300"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : null}

      {/* Lightbox Modal Élégant */}
      <AnimatePresence>
        {lightboxOpen && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-6xl max-h-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
                {/* Image principale */}
                <div className="relative">
                  <img
                    src={selectedMedia.thumbnail}
                    alt={selectedMedia.title}
                    className="w-full max-h-[70vh] object-cover"
                  />

                  {/* Overlay avec gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  {/* Bouton fermer */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setLightboxOpen(false)}
                    className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>

                  {/* Badges sur l'image */}
                  <div className="absolute top-6 left-6 flex space-x-2">
                    {selectedMedia.isExclusive && (
                      <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm px-4 py-2 rounded-full font-medium shadow-lg backdrop-blur-sm">
                        ✨ Exclusif
                      </span>
                    )}
                    {selectedMedia.category === 'vip' && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm px-4 py-2 rounded-full font-medium shadow-lg backdrop-blur-sm">
                        👑 VIP
                      </span>
                    )}
                    {selectedMedia.type === 'video' && (
                      <span className="bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full font-medium">
                        🎥 {selectedMedia.duration}
                      </span>
                    )}
                  </div>

                  {/* Actions sur l'image */}
                  <div className="absolute bottom-6 right-6 flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(selectedMedia.id);
                      }}
                      className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 ${favorites.includes(selectedMedia.id)
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                        : 'bg-white/20 text-white hover:bg-pink-500 hover:text-white'
                        }`}
                    >
                      <Heart className={`w-6 h-6 ${favorites.includes(selectedMedia.id) ? 'fill-current' : ''}`} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300"
                    >
                      <Download className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300"
                    >
                      <Share2 className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-gray-800 mb-3">{selectedMedia.title}</h2>
                      <p className="text-lg text-gray-600 mb-4">{selectedMedia.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedMedia.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-3 py-1.5 rounded-full text-sm font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats et métadonnées */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                      <Eye className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800">{selectedMedia.views}</div>
                      <div className="text-sm text-gray-600">Vues</div>
                    </div>

                    <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                      <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800">{selectedMedia.likes}</div>
                      <div className="text-sm text-gray-600">Likes</div>
                    </div>

                    <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                      <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-gray-800">
                        {new Date(selectedMedia.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-sm text-gray-600">Date</div>
                    </div>

                    <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                      <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-gray-800 capitalize">{selectedMedia.category}</div>
                      <div className="text-sm text-gray-600">Niveau</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientGallerySection;

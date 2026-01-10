import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Play,
  Lock,
  Crown,
  Maximize2,
  RefreshCw,
  X
} from 'lucide-react';
import { galleryService } from '../../../services/galleryService';

const ClientGallerySection = ({ currentUser }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Data States
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authentication & Plan Check
  const sub = currentUser?.subscription;
  const currentPlan = (sub?.plan || sub?.type || sub?.planName || 'basic').toLowerCase();
  const isPremium = sub?.status === 'active' && (currentPlan.includes('premium') || currentPlan.includes('vip'));
  const isVIP = sub?.status === 'active' && currentPlan.includes('vip');

  // Load Gallery Data
  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true);
      try {
        const items = await galleryService.getGalleryItems();
        setGalleryItems(items);
      } catch (error) {
        console.error("Erreur chargement galerie:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  // Filter & Sort Logic
  const filteredContent = galleryItems.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'exclusive') return item.isExclusive;
    return item.category === selectedCategory;
  });

  const sortedContent = [...filteredContent].sort((a, b) => {
    // Priority to exclusive content to drive sales
    if (a.isExclusive !== b.isExclusive) return a.isExclusive ? -1 : 1;
    return 0;
  });

  const categories = [
    { id: 'all', label: 'Tout', count: galleryItems.length },
    { id: 'public', label: 'Public', count: galleryItems.filter(item => item.category === 'public').length },
    { id: 'premium', label: 'Premium', count: galleryItems.filter(item => item.category === 'premium').length },
    { id: 'vip', label: 'VIP', count: galleryItems.filter(item => item.category === 'vip').length }
  ];

  // Helper: Lock Overlay
  const renderLockOverlay = (item) => {
    const isLocked = item.isExclusive && ((item.category === 'premium' && !isPremium) || (item.category === 'vip' && !isVIP));

    if (!isLocked) return null;

    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] transition-all duration-300">
        <div className="bg-white/20 backdrop-blur-md rounded-full p-4 mb-3 mx-auto w-fit border border-white/30">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/dashboard/subscription');
          }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-2xl border border-yellow-300 relative z-30 cursor-pointer hover:brightness-110"
        >
          DÉBLOQUER
        </motion.button>
      </div>
    );
  };

  return (
    <section className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              {cat.id === 'vip' && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
              {cat.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedCategory === cat.id ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-400'
                }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin text-purple-600">
            <RefreshCw size={40} />
          </div>
        </div>
      ) : sortedContent.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun contenu trouvé</h3>
          <p className="text-gray-500 mt-1">La galerie est vide pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode='popLayout'>
            {sortedContent.map((item) => {
              const isLocked = item.isExclusive && ((item.category === 'premium' && !isPremium) || (item.category === 'vip' && !isVIP));

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={() => {
                    if (!isLocked) {
                      setSelectedMedia(item);
                      setLightboxOpen(true);
                    }
                  }}
                  className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer ${isLocked ? 'grayscale-[0.5]' : ''}`}
                >
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" muted loop />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}

                    {renderLockOverlay(item)}

                    {!isLocked && (
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                      {item.isExclusive && (
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg backdrop-blur-sm">
                          ✨ Exclusif
                        </span>
                      )}
                      {item.type === 'video' && (
                        <span className="bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm">
                          <Play className="w-3 h-3 is-filled" fill="currentColor" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {item.category} • {new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
              >
                <X size={32} />
              </button>

              <div className="rounded-xl overflow-hidden shadow-2xl bg-black">
                {selectedMedia.type === 'video' ? (
                  <video src={selectedMedia.url} controls autoPlay className="w-full max-h-[85vh] object-contain" />
                ) : (
                  <img src={selectedMedia.url} alt={selectedMedia.title} className="w-full max-h-[85vh] object-contain" />
                )}
              </div>

              <div className="mt-4 text-white">
                <h3 className="text-xl font-bold">{selectedMedia.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{selectedMedia.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ClientGallerySection;

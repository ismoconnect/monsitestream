import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Play,
  Lock,
  Crown,
  Maximize2,
  RefreshCw,
  X,
  ChevronRight,
  ChevronLeft,
  Filter,
  Eye,
  Calendar
} from 'lucide-react';


import { galleryService } from '../../../services/galleryService';

const ClientGallerySection = ({ currentUser }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const sub = currentUser?.subscription;
  const currentPlan = (sub?.plan || sub?.type || sub?.planName || 'basic').toLowerCase();
  const isPremium = sub?.status === 'active' && (currentPlan.includes('premium') || currentPlan.includes('vip'));
  const isVIP = sub?.status === 'active' && currentPlan.includes('vip');

  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true);
      try {
        const items = await galleryService.getGalleryItems();
        setGalleryItems(items);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  const getSmartTitle = (item, index) => {
    const genericNames = [
      'Liliana Détente',
      'Balade en Ville',
      'Instant de Grâce',
      'Éclat de Luxe',
      'Regard Complice',
      'Douceur du Soir',
      'Escapade Chic',
      'Secret de Liliana',
      'Élégance Pure',
      'Moment Privé'
    ];

    // Si le titre est générique ou contient des ID bizarres
    const isGeneric = !item.title || 
                      item.title.toLowerCase().includes('gallery') || 
                      item.title.toLowerCase().includes('image') ||
                      /[0-9][a-zA-Z0-9]{5,}/.test(item.title);

    if (isGeneric) {
      return genericNames[index % genericNames.length];
    }

    return item.title.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const currentIndex = filteredItems.findIndex(item => item.id === selectedMedia.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedMedia(filteredItems[nextIndex]);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    const currentIndex = filteredItems.findIndex(item => item.id === selectedMedia.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedMedia(filteredItems[prevIndex]);
  };



  const filteredItems = galleryItems
    .filter(item => {
      if (selectedCategory === 'all') return true;
      return item.category === selectedCategory;
    })
    .sort((a, b) => {
      if (selectedCategory !== 'all') return 0;
      const priority = { 'vip': 1, 'premium': 2, 'public': 3 };
      const aPrio = priority[a.category?.toLowerCase()] || 4;
      const bPrio = priority[b.category?.toLowerCase()] || 4;
      return aPrio - bPrio;
    });


  const categories = [
    { id: 'all', label: 'Tout' },
    { id: 'public', label: 'Public' },
    { id: 'premium', label: 'Premium' },
    { id: 'vip', label: 'VIP' }
  ];

  return (
    <div className="max-w-[1400px] mx-auto w-full p-4 md:p-10 space-y-12">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-8 pb-10 border-b border-gray-100">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center space-x-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em]">
            <span className="w-8 h-[1px] bg-indigo-600"></span>
            <span>Contenu Exclusif</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
            Galerie Premium
          </h2>


          <p className="text-gray-500 text-lg font-medium leading-relaxed">
            Plongez dans mon univers à travers une sélection rigoureuse de photos et vidéos en haute définition.
          </p>
        </div>

        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${selectedCategory === cat.id ? 'bg-white text-indigo-600 shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>


      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <RefreshCw className="animate-spin text-indigo-500 w-10 h-10" />
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Chargement de la collection...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item, index) => {
            const isLocked = item.isExclusive && ((item.category === 'premium' && !isPremium) || (item.category === 'vip' && !isVIP));
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => { if (!isLocked) { setSelectedMedia(item); setLightboxOpen(true); } }}
                className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-100 cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" muted loop />
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}
                
                {/* Elegant Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                      {item.type === 'video' && (
                        <span className="bg-indigo-500 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full flex items-center">
                          <Play size={8} className="mr-1 fill-white" /> Video
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {getSmartTitle(item, index)}
                    </h3>


                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-white/60 text-[10px] font-bold flex items-center">
                        <Eye size={12} className="mr-1" /> Voir le média
                      </span>
                      <ChevronRight size={16} className="text-white" />
                    </div>
                  </div>
                </div>

                {isLocked && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-6 border border-white/20 shadow-2xl">
                      <Lock className="text-white" size={28} />
                    </div>
                    <h4 className="text-white font-black text-lg mb-2">Contenu Verrouillé</h4>
                    <p className="text-white/60 text-xs mb-8 font-medium px-4">Cet album est réservé aux membres {item.category}.</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/dashboard/subscription'); }} 
                      className="bg-white text-gray-900 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95"
                    >
                      Débloquer l'accès
                    </button>
                  </div>
                )}
                
                {item.isExclusive && !isLocked && (
                  <div className="absolute top-6 left-6 bg-amber-400 text-white p-2 rounded-xl shadow-2xl flex items-center justify-center">
                    <Crown size={16} className="fill-white" />
                  </div>
                )}

                {item.type === 'video' && !isLocked && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-2xl">
                    <Play size={24} className="text-white fill-white ml-1" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}


      {/* Premium Lightbox */}
      <AnimatePresence>
        {lightboxOpen && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 md:p-10"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button - Elegant */}
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-8 right-8 text-white/40 hover:text-white transition-all duration-300 z-[210] bg-white/5 p-3 rounded-full border border-white/10 hover:bg-white/10"
            >
              <X size={24} />
            </motion.button>

            {/* Navigation Arrows */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-10 z-[205] pointer-events-none">
              <motion.button
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                className="pointer-events-auto w-14 h-14 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 shadow-2xl"
              >
                <ChevronLeft size={32} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                className="pointer-events-auto w-14 h-14 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 shadow-2xl"
              >
                <ChevronRight size={32} />
              </motion.button>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="max-w-6xl w-full max-h-full flex flex-col items-center" 
              onClick={e => e.stopPropagation()}
            >
              <div className="relative group w-full flex justify-center">
                {selectedMedia.type === 'video' ? (
                  <div className="relative w-full max-w-4xl shadow-2xl rounded-[2rem] overflow-hidden border border-white/10">
                    <video src={selectedMedia.url} controls autoPlay className="w-full" />
                  </div>
                ) : (
                  <div className="relative group shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/10 max-h-[75vh]">
                    <img 
                      src={selectedMedia.url} 
                      alt="" 
                      className="max-w-full h-auto max-h-[75vh] object-contain" 
                    />
                  </div>
                )}
                
                {/* Media Metadata Tag */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-white/20">
                    {selectedMedia.category}
                  </span>
                  {selectedMedia.isExclusive && (
                    <span className="bg-amber-400 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg flex items-center">
                      <Crown size={10} className="mr-2 fill-white" /> Exclusive
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-10 text-center space-y-4 max-w-2xl">
                <div className="flex flex-col items-center space-y-2">
                  <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                    {getSmartTitle(selectedMedia, galleryItems.indexOf(selectedMedia))}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                </div>
                
                {selectedMedia.description && (
                  <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed">
                    {selectedMedia.description}
                  </p>
                )}

                <div className="pt-6 flex items-center justify-center space-x-8 text-white/40">
                  <div className="flex flex-col items-center">
                    <Calendar size={18} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Janvier 2024</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Maximize2 size={18} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">4K Ultra HD</span>
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

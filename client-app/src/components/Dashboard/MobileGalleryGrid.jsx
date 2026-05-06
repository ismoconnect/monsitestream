import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, Lock, Crown } from 'lucide-react';

const MobileGalleryGrid = ({ images = [], isPremium = false }) => {
  const sampleImages = [
    { id: 1, url: '/api/placeholder/300/400', likes: 24, views: 156, premium: false },
    { id: 2, url: '/api/placeholder/300/400', likes: 18, views: 89, premium: true },
    { id: 3, url: '/api/placeholder/300/400', likes: 32, views: 201, premium: false },
    { id: 4, url: '/api/placeholder/300/400', likes: 15, views: 67, premium: true },
    { id: 5, url: '/api/placeholder/300/400', likes: 28, views: 134, premium: false },
    { id: 6, url: '/api/placeholder/300/400', likes: 41, views: 298, premium: true },
  ];

  const displayImages = images.length > 0 ? images : sampleImages;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
      {displayImages.map((image, index) => (
        <motion.div
          key={image.id || index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-200">
            {/* Image */}
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 relative">
              {/* Premium Lock Overlay */}
              {image.premium && !isPremium && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center text-white">
                    <Lock className="w-6 h-6 mx-auto mb-2" />
                    <div className="flex items-center space-x-1">
                      <Crown className="w-4 h-4" />
                      <span className="text-xs font-medium">Premium</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Stats Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{image.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">{image.views}</span>
                    </div>
                  </div>
                  
                  {image.premium && (
                    <div className="bg-yellow-500/20 backdrop-blur-sm rounded-full p-1">
                      <Crown className="w-3 h-3 text-yellow-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MobileGalleryGrid;

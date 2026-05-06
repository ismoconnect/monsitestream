import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Image, 
  Upload, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Edit, 
  Trash2, 
  Download,
  Star,
  Heart,
  Plus,
  Filter,
  Search,
  Grid,
  List
} from 'lucide-react';

const GallerySection = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [gallery, setGallery] = useState([
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      title: 'Photo de profil',
      category: 'public',
      views: 1250,
      likes: 89,
      uploadDate: '2024-01-15',
      tags: ['profil', 'portrait'],
      isPremium: false
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      title: 'Séance privée',
      category: 'private',
      views: 45,
      likes: 12,
      uploadDate: '2024-01-14',
      tags: ['privé', 'exclusif'],
      isPremium: true
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
      title: 'Contenu premium',
      category: 'premium',
      views: 234,
      likes: 67,
      uploadDate: '2024-01-13',
      tags: ['premium', 'exclusif'],
      isPremium: true
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      title: 'Galerie publique',
      category: 'public',
      views: 890,
      likes: 156,
      uploadDate: '2024-01-12',
      tags: ['public', 'gallery'],
      isPremium: false
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
      title: 'Contenu VIP',
      category: 'vip',
      views: 78,
      likes: 23,
      uploadDate: '2024-01-11',
      tags: ['vip', 'exclusif'],
      isPremium: true
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400',
      title: 'Photo lifestyle',
      category: 'public',
      views: 567,
      likes: 98,
      uploadDate: '2024-01-10',
      tags: ['lifestyle', 'public'],
      isPremium: false
    }
  ]);

  const categories = [
    { id: 'all', label: 'Toutes', count: gallery.length },
    { id: 'public', label: 'Publiques', count: gallery.filter(img => img.category === 'public').length },
    { id: 'private', label: 'Privées', count: gallery.filter(img => img.category === 'private').length },
    { id: 'premium', label: 'Premium', count: gallery.filter(img => img.category === 'premium').length },
    { id: 'vip', label: 'VIP', count: gallery.filter(img => img.category === 'vip').length }
  ];

  const filteredGallery = gallery.filter(image => {
    const matchesFilter = filter === 'all' || image.category === filter;
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const toggleImageSelection = (imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const toggleImageVisibility = (imageId) => {
    setGallery(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, category: img.category === 'public' ? 'private' : 'public' }
        : img
    ));
  };

  const togglePremiumStatus = (imageId) => {
    setGallery(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, isPremium: !img.isPremium }
        : img
    ));
  };

  const deleteImage = (imageId) => {
    setGallery(prev => prev.filter(img => img.id !== imageId));
    setSelectedImages(prev => prev.filter(id => id !== imageId));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setIsUploading(true);
    
    // Simuler l'upload
    setTimeout(() => {
      const newImages = files.map((file, index) => ({
        id: gallery.length + index + 1,
        url: URL.createObjectURL(file),
        title: file.name.split('.')[0],
        category: 'public',
        views: 0,
        likes: 0,
        uploadDate: new Date().toISOString().split('T')[0],
        tags: ['nouveau'],
        isPremium: false
      }));
      
      setGallery(prev => [...prev, ...newImages]);
      setIsUploading(false);
    }, 2000);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-yellow-100 text-yellow-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Image className="w-6 h-6 text-pink-500 mr-2" />
            Galerie Photos
          </h2>
          <p className="text-gray-600">Gérez votre collection de photos et médias</p>
        </div>
        <div className="flex space-x-2">
          <label className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{category.label}</p>
                <p className="text-2xl font-bold text-gray-800">{category.count}</p>
              </div>
              <Image className="w-8 h-8 text-pink-500" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans la galerie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center space-x-4">
            {/* Catégories */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode d'affichage */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions en lot */}
      {selectedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedImages.length} image(s) sélectionnée(s)
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
                Marquer Premium
              </button>
              <button className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm">
                Changer Catégorie
              </button>
              <button className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm">
                Supprimer
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Galerie */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGallery.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group cursor-pointer ${
                selectedImages.includes(image.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => toggleImageSelection(image.id)}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                  <div className="absolute top-2 left-2 flex space-x-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(image.category)}`}>
                      {image.category}
                    </span>
                    {image.isPremium && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Premium
                      </span>
                    )}
                  </div>
                  
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleImageVisibility(image.id);
                      }}
                      className="p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      {image.category === 'public' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePremiumStatus(image.id);
                      }}
                      className="p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      {image.isPremium ? <Star className="w-3 h-3 text-yellow-500" /> : <Star className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2 truncate">{image.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {image.views}
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      {image.likes}
                    </span>
                  </div>
                  <span>{image.uploadDate}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGallery.map((image) => (
                <tr key={image.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{image.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(image.category)}`}>
                      {image.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {image.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {image.likes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {image.uploadDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteImage(image.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Indicateur d'upload */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              <span className="text-gray-800">Upload en cours...</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GallerySection;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Globe,
  Heart,
  Sparkles,
  Star,
  Crown,
  Award,
  TrendingUp,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  Settings,
  Lock,
  Zap
} from 'lucide-react';

const ClientProfileSectionSimple = ({ currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    bio: currentUser?.bio || '',
    preferences: currentUser?.preferences || {
      notifications: true,
      emailUpdates: true,
      privacy: 'private'
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (pref, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [pref]: value
      }
    }));
  };

  const handleSave = () => {
    // Ici, vous pourriez appeler une API pour sauvegarder les données
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      displayName: currentUser?.displayName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      location: currentUser?.location || '',
      bio: currentUser?.bio || '',
      preferences: currentUser?.preferences || {
        notifications: true,
        emailUpdates: true,
        privacy: 'private'
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-pink-50 p-4 sm:p-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full max-w-full min-w-0">
        {/* Header Élégant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 w-full max-w-full overflow-hidden"
        >
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 min-w-0 w-full max-w-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-2 sm:p-3 rounded-full">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent truncate">
                    Mon Profil
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 truncate">
                    Gérez vos informations personnelles et préférences
                  </p>
                </div>
              </div>

              {/* Stats Élégantes */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6 mt-3 sm:mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Profil actif
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    Membre Premium
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    Profil vérifié
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 mt-4 md:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 font-medium shadow-lg shadow-pink-500/25 transition-all duration-300 text-sm sm:text-base"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{isEditing ? 'Annuler' : 'Modifier'}</span>
                <span className="sm:hidden">{isEditing ? '✕' : '✏️'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Profile Card Élégante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-full overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 w-full max-w-full min-w-0">
            {/* Avatar Élégant */}
            <div className="relative mx-auto sm:mx-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                {currentUser?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <AnimatePresence>
                {isEditing && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white p-2 rounded-full transition-all duration-300 shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full max-w-full min-w-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 text-pink-500" />
                    Nom d'affichage
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-pink-50 p-3 rounded-xl">
                      <p className="text-gray-800 font-medium truncate">{currentUser?.displayName || 'Non défini'}</p>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4 text-purple-500" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-3 rounded-xl">
                      <p className="text-gray-800 truncate">{currentUser?.email || 'Non défini'}</p>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone className="w-4 h-4 text-green-500" />
                    Téléphone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-green-50 p-3 rounded-xl">
                      <p className="text-gray-800 truncate">{currentUser?.phone || 'Non défini'}</p>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Localisation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-xl">
                      <p className="text-gray-800 truncate">{currentUser?.location || 'Non défini'}</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Bio Élégante */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 sm:mt-6 space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Heart className="w-4 h-4 text-pink-500" />
                  À propos de moi
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors text-sm sm:text-base"
                    placeholder="Parlez-nous de vous..."
                  />
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-pink-50 p-3 sm:p-4 rounded-xl">
                    <p className="text-gray-800 leading-relaxed">{currentUser?.bio || 'Aucune description disponible'}</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Préférences Élégantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-full overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              Préférences
            </h3>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-pink-50 rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-2 rounded-lg">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Notifications push</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Recevoir des notifications sur votre appareil</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={formData.preferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-purple-600"></div>
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-2 rounded-lg">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Mises à jour par email</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Recevoir des emails avec les actualités</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={formData.preferences.emailUpdates}
                  onChange={(e) => handlePreferenceChange('emailUpdates', e.target.checked)}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-600"></div>
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-2 rounded-lg">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Confidentialité</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Niveau de confidentialité de votre profil</p>
                </div>
              </div>
              {isEditing ? (
                <select
                  value={formData.preferences.privacy}
                  onChange={(e) => handlePreferenceChange('privacy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base flex-shrink-0"
                >
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                  <option value="friends">Amis seulement</option>
                </select>
              ) : (
                <span className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium flex-shrink-0 ${formData.preferences.privacy === 'private'
                    ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700'
                    : formData.preferences.privacy === 'public'
                      ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700'
                      : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700'
                  }`}>
                  {formData.preferences.privacy === 'public' ? 'Public' :
                    formData.preferences.privacy === 'private' ? 'Privé' : 'Amis seulement'}
                </span>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Statistiques Élégantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 text-center shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-pink-50"
          >
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-20"></div>
              <div className="relative bg-gradient-to-r from-pink-100 to-purple-100 p-3 rounded-full mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">12</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Rendez-vous</div>
            <div className="text-xs text-gray-500 mt-1">Ce mois-ci</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 text-center shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50"
          >
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full blur-lg opacity-20"></div>
              <div className="relative bg-gradient-to-r from-purple-100 to-indigo-100 p-3 rounded-full mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent mb-2">8</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Sessions live</div>
            <div className="text-xs text-gray-500 mt-1">Total</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 text-center shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 sm:col-span-2 lg:col-span-1"
          >
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-full mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">156</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Messages</div>
            <div className="text-xs text-gray-500 mt-1">Échangés</div>
          </motion.div>
        </motion.div>

        {/* Save/Cancel Buttons */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-full"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-500/25 font-medium text-sm sm:text-base"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Sauvegarder</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-gray-500/25 font-medium text-sm sm:text-base"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Annuler</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientProfileSectionSimple;

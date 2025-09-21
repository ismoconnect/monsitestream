import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const AuthModal = ({ isOpen, onClose, onSuccess, onOpenSubscription, initialMode = 'signin' }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { signIn, signUp, createAccount, authMode } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Gérer le montage du composant
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Réinitialiser le mode quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      setError('');
      setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
    }
  }, [isOpen, initialMode]);

  // Gérer la fermeture avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        let result;
        
        if (authMode === 'firestore') {
          // Inscription simple sans abonnement
          result = await createAccount({
            email: formData.email,
            password: formData.password,
            displayName: formData.displayName
          });
        } else {
          // Mode demo/firebase classique
          result = await signUp({
            email: formData.email,
            password: formData.password,
            displayName: formData.displayName,
            role: 'client'
          });
        }

        if (result.success) {
          const message = authMode === 'firestore' 
            ? 'Votre compte a été créé ! Vous pouvez maintenant accéder à votre dashboard.'
            : 'Votre compte a été créé avec succès.';
          showSuccess('Inscription réussie !', message);
          onClose();
          setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
          // Appeler la fonction de callback pour la redirection
          if (onSuccess) onSuccess();
        } else {
          setError(result.error);
          showError('Erreur d\'inscription', result.error);
        }
      } else {
        // Connexion
        console.log('🔐 Tentative de connexion en mode:', authMode);
        if (authMode === 'firestore') {
          // Mode Firestore - signIn retourne directement l'utilisateur
          const user = await signIn(formData.email, formData.password);
          console.log('✅ Utilisateur connecté:', user);
          
          if (user) {
            showSuccess('Connexion réussie !', 'Bienvenue dans votre espace personnel.');
            onClose();
            setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
            // Redirection vers le dashboard
            console.log('📍 Appel de onSuccess pour redirection...');
            if (onSuccess) onSuccess();
          }
        } else {
          // Mode demo/firebase classique
          const result = await signIn(formData.email, formData.password);
          
          if (result.success) {
            showSuccess('Connexion réussie !', 'Bienvenue dans votre espace personnel.');
            onClose();
            setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
            if (onSuccess) onSuccess();
          } else {
            setError(result.error);
            showError('Erreur de connexion', result.error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      const errorMessage = error.message || 'Une erreur inattendue est survenue. Veuillez réessayer.';
      setError(errorMessage);
      
      if (isSignUp) {
        showError('Erreur d\'inscription', errorMessage);
      } else {
        showError('Erreur de connexion', errorMessage);
      }
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
    setError('');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          zIndex: 9999
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-md relative shadow-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {isSignUp ? 'Créer un compte' : 'Se connecter'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {isSignUp 
                ? 'Rejoignez Sophie pour accéder au contenu exclusif' 
                : 'Accédez à votre espace personnel'
              }
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Votre nom complet"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Confirmez votre mot de passe"
                  />
                </div>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Chargement...' : (isSignUp ? 'Créer mon compte' : 'Se connecter')}
            </motion.button>
          </form>

          {/* Toggle mode */}
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-sm sm:text-base text-gray-600">
              {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-pink-600 hover:text-pink-700 font-semibold"
              >
                {isSignUp ? 'Se connecter' : 'S\'inscrire'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
      
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default AuthModal;

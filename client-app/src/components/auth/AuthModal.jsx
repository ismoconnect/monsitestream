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
            : (result.message || 'Votre compte a été créé avec succès.');
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
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white rounded-[2rem] p-6 sm:p-12 w-full max-w-md relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] mx-4 border border-slate-50"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-light text-slate-900 mb-2 tracking-tight">
              {isSignUp ? 'Bienvenue' : 'Bon retour'}
            </h2>
            <p className="text-sm text-slate-400 font-light tracking-wide">
              {isSignUp
                ? 'Rejoignez SiteStream pour une expérience exclusive'
                : 'Connectez-vous à votre espace privé'
              }
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-500 text-xs font-medium px-4 py-3 rounded-xl mb-8 border border-red-100 text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 px-1">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-300" strokeWidth={1.5} />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/30 text-sm outline-none transition-all placeholder:text-slate-300"
                    placeholder="Votre nom complet"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 px-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-300" strokeWidth={1.5} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/30 text-sm outline-none transition-all placeholder:text-slate-300"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 px-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-300" strokeWidth={1.5} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/30 text-sm outline-none transition-all placeholder:text-slate-300"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 px-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-300" strokeWidth={1.5} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/30 text-sm outline-none transition-all placeholder:text-slate-300"
                    placeholder="Confirmez votre mot de passe"
                  />
                </div>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: -2, backgroundColor: '#000' }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs tracking-widest shadow-xl shadow-slate-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {loading ? 'Traitement...' : (isSignUp ? 'Créer le compte' : 'Se connecter')}
            </motion.button>
          </form>

          {/* Toggle mode */}
          <div className="text-center mt-10">
            <p className="text-xs text-slate-400 font-medium">
              {isSignUp ? 'Déjà membre ?' : 'Pas encore de compte ?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-widest"
              >
                {isSignUp ? 'Connexion' : 'Inscription'}
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

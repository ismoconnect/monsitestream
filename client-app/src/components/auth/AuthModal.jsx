import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Crown, Phone, ArrowRight, ArrowLeft, Sparkles, Heart, Compass, Search, Flame, Zap, Gem, Star, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const AuthModal = ({ isOpen, onClose, onSuccess, onOpenSubscription, initialMode = 'signin' }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phone: '',
    confirmPassword: '',
    lookingFor: '',
    discoverySource: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { signIn, signInWithGoogle, signUp, currentUser, updateProfile, authMode } = useAuth();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      setStep(1);
      setError('');
      setFormData({ 
        email: '', 
        password: '', 
        displayName: '', 
        phone: '', 
        confirmPassword: '',
        lookingFor: '',
        discoverySource: ''
      });
    }
  }, [isOpen, initialMode]);

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

  const validateStep1 = () => {
    if (!formData.displayName || !formData.email || !formData.password || !formData.phone) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères');
      return false;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.lookingFor) {
          setError('Veuillez nous dire ce que vous recherchez');
          setLoading(false);
          return;
        }

        let result;
        if (currentUser) {
          result = await updateProfile({
            profile: {
              ...currentUser.profile,
              lookingFor: formData.lookingFor,
              discoverySource: formData.discoverySource
            }
          });
          if (!result || result.success !== false) result = { success: true };
        } else {
          result = await signUp({
            email: formData.email,
            password: formData.password,
            displayName: formData.displayName,
            phone: formData.phone,
            lookingFor: formData.lookingFor,
            discoverySource: formData.discoverySource,
            role: 'client'
          });
        }

        if (result.success) {
          showSuccess('Inscription réussie !', 'Bienvenue dans l\'univers SiteStream.');
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setError(result.error);
          showError('Erreur d\'inscription', result.error);
        }
      } else {
        const result = await signIn(formData.email, formData.password);
        if (result.success || (authMode === 'firestore' && result)) {
          showSuccess('Connexion réussie !', 'Ravi de vous revoir.');
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setError(result.error || 'Erreur de connexion');
          showError('Erreur de connexion', result.error || 'Erreur de connexion');
        }
      }
    } catch (error) {
      setError(error.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        if (result.isNewUser) {
          setIsSignUp(true);
          setStep(2);
        } else {
          showSuccess('Connexion réussie !', 'Ravi de vous revoir.');
          onClose();
          if (onSuccess) onSuccess();
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setStep(1);
    setError('');
  };

  if (!mounted || !isOpen) return null;

  const lookingForOptions = [
    { id: 'exclusive', label: 'Expérience Exclusive', icon: Gem, color: 'from-amber-400 to-orange-600' },
    { id: 'chat', label: 'Connexion Privée', icon: Zap, color: 'from-blue-400 to-indigo-600' },
    { id: 'appointments', label: 'Rencontre d\'Exception', icon: Flame, color: 'from-rose-400 to-red-600' },
    { id: 'support', label: 'Soutien Privilégié', icon: Star, color: 'from-purple-400 to-fuchsia-600' }
  ];

  const discoveryOptions = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'twitter', label: 'Twitter / X' },
    { id: 'friends', label: 'Recommandation' },
    { id: 'other', label: 'Autre' }
  ];

  const renderStep1 = () => (
      <div className="space-y-4">
        {/* Google Inscription */}
        <button type="button" onClick={handleGoogleSignIn} className="w-full bg-white/5 border border-white/10 py-3.5 rounded-2xl flex items-center justify-center gap-4 hover:bg-white/10 transition-all shadow-sm group">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-indigo-400">Continuer avec Google</span>
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <span className="relative flex justify-center text-[8px] uppercase tracking-widest font-black text-slate-500 bg-[#0f172a] px-4">Ou par email</span>
        </div>

        <div>
          <label className="block text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 px-1">Identité</label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-focus-within:border-indigo-500/50 transition-all">
            <User className="w-4 h-4 text-indigo-400" />
          </div>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-indigo-500/50 outline-none text-sm font-semibold text-white transition-all placeholder:text-slate-500"
            placeholder="Nom ou Pseudo"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 px-1">Téléphone</label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-focus-within:border-blue-500/50 transition-all">
            <Phone className="w-4 h-4 text-blue-400" />
          </div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-blue-500/50 outline-none text-sm font-semibold text-white transition-all placeholder:text-slate-500"
            placeholder="+33 6 00 00 00 00"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1 px-1">Email</label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-focus-within:border-purple-500/50 transition-all">
            <Mail className="w-4 h-4 text-purple-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-purple-500/50 outline-none text-sm font-semibold text-white transition-all placeholder:text-slate-500"
            placeholder="votre@email.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative group">
          <label className="block text-[9px] font-black text-pink-400 uppercase tracking-[0.2em] mb-1 px-1">Mot de passe</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-focus-within:border-pink-500/50 transition-all">
              <Lock className="w-4 h-4 text-pink-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-pink-500/50 outline-none text-sm font-semibold text-white transition-all placeholder:text-slate-500"
              placeholder="••••••"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="relative group">
          <label className="block text-[9px] font-black text-pink-400 uppercase tracking-[0.2em] mb-1 px-1">Confirmation</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-focus-within:border-pink-500/50 transition-all">
              <Lock className="w-4 h-4 text-pink-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-pink-500/50 outline-none text-sm font-semibold text-white transition-all placeholder:text-slate-500"
              placeholder="••••••"
              required
            />
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={nextStep}
        whileHover={{ scale: 1.02, backgroundColor: '#ffffff', color: '#000000' }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/20 transition-all duration-300"
      >
        Continuer <ArrowRight size={14} />
      </motion.button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-[10px] font-black bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-[0.2em] mb-4 text-center">Votre Désir Prioritaire</label>
        <div className="grid grid-cols-2 gap-3">
          {lookingForOptions.map(opt => {
            const Icon = opt.icon;
            const selected = formData.lookingFor === opt.id;
            return (
              <motion.button
                key={opt.id}
                type="button"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData(prev => ({ ...prev, lookingFor: opt.id }))}
                className={`relative p-4 rounded-[1.5rem] border-2 transition-all duration-500 flex flex-col items-center gap-3 text-center overflow-hidden ${
                  selected 
                    ? `border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105` 
                    : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                {selected && (
                  <motion.div 
                    layoutId="selected_bg"
                    className={`absolute inset-0 bg-gradient-to-br ${opt.color} opacity-10`}
                  />
                )}
                
                <div className={`p-2.5 rounded-xl transition-all duration-500 ${selected ? `bg-gradient-to-br ${opt.color} text-white shadow-lg rotate-12` : 'bg-white/5 text-slate-500'}`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                
                <span className={`text-[9px] font-black uppercase leading-tight tracking-[0.1em] transition-colors ${selected ? 'text-white' : 'text-slate-500'}`}>
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 text-center">Origine de votre visite</label>
        <div className="flex flex-wrap justify-center gap-1.5">
          {discoveryOptions.map(opt => {
            const selected = formData.discoverySource === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, discoverySource: opt.id }))}
                className={`px-4 py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${
                  selected 
                    ? 'bg-white text-[#0f172a] border-white shadow-xl shadow-white/10' 
                    : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={prevStep}
          className="p-3.5 bg-white/5 text-slate-400 border border-white/10 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={14} />
        </button>
        <motion.button
          type="submit"
          disabled={loading || !formData.lookingFor}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white py-3.5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 shadow-2xl shadow-rose-500/20 disabled:opacity-50 transition-all duration-500"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              ACTIVER MON ACCÈS
              <ArrowRight size={14} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="bg-[#0f172a] rounded-[3rem] p-6 md:p-8 w-full max-w-md relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white transition-all hover:rotate-90 z-20">
            <X size={18} />
          </button>

          {/* Luxury background glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -z-10" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] -z-10" />

          {/* Progress Indicator */}
          {isSignUp && (
            <div className="flex justify-center items-center space-x-3 mb-6">
              <div className={`h-1 rounded-full transition-all duration-700 ${step === 1 ? 'w-8 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'w-3 bg-white/5'}`} />
              <div className={`h-1 rounded-full transition-all duration-700 ${step === 2 ? 'w-8 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'w-3 bg-white/5'}`} />
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
              {isSignUp ? (step === 1 ? 'Bienvenue' : 'Vos Envies') : 'Bon retour'}
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-4 bg-white/10" />
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">
                {isSignUp ? 'Luxe & Volupté' : 'Espace Privé'}
              </p>
              <div className="h-px w-4 bg-white/10" />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ x: -10, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl mb-6 border border-rose-500/20 text-center"
            >
              {error}
            </motion.div>
          )}

          {!isSignUp ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="group relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-focus-within:border-indigo-500/50 transition-all">
                    <Mail className="absolute text-indigo-400 w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all font-semibold text-white placeholder:text-slate-600"
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="group relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-focus-within:border-indigo-500/50 transition-all">
                    <Lock className="absolute text-indigo-400 w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all font-semibold text-white placeholder:text-slate-600"
                    placeholder="Mot de passe"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, backgroundColor: '#ffffff', color: '#000000' }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] tracking-[0.4em] uppercase shadow-2xl shadow-indigo-500/20 transition-all duration-300"
              >
                {loading ? 'Authentification...' : 'CONNEXION'}
              </motion.button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <span className="relative flex justify-center text-[9px] uppercase tracking-widest font-black text-slate-500 bg-[#0f172a] px-6">Ou</span>
              </div>

              <button type="button" onClick={handleGoogleSignIn} className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-4 hover:bg-white/10 transition-all shadow-sm active:scale-95 group">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-indigo-400">Google ID</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              {step === 1 ? renderStep1() : renderStep2()}
            </form>
          )}

          <div className="text-center mt-8">
            <button onClick={toggleMode} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-400 transition-all">
              {isSignUp ? 'Déjà un accès ? Connexion' : 'Pas de compte ? Créer un accès'}
            </button>
          </div>
          
          {/* Subtle security badge */}
          <div className="mt-6 flex justify-center items-center gap-2 text-slate-600">
             <ShieldCheck size={12} />
             <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Sécurisation SSL 256-bits</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default AuthModal;

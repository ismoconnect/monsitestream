import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, User, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../auth/AuthProvider';
import { images } from '../../utils/images';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  let currentUser = null;
  let isAuthenticated = false;
  let openAuthModal = () => alert('Veuillez recharger la page');

  try {
    const auth = useAuth();
    currentUser = auth.currentUser;
    isAuthenticated = auth.isAuthenticated;
  } catch (e) { }

  try {
    const authModal = useAuthModal();
    openAuthModal = authModal.openAuthModal;
  } catch (e) { }

  const navItems = [
    { name: 'ACCUEIL', href: '#home' },
    { name: 'GALERIE', href: '#gallery' },
    { name: 'SERVICES', href: '#services' },
    { name: 'CONTACT', href: '#contact' }
  ];

  const scrollToSection = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled 
        ? 'py-3 bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl' 
        : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center w-full">

          {/* LOGO */}
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer group relative"
              onClick={() => scrollToSection('#home')}
            >
              <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img
                src={images.branding.logo}
                alt={images.branding.alt}
                className="h-10 md:h-12 w-auto object-contain relative z-10"
              />
            </motion.div>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-[11px] font-black text-white/60 hover:text-pink-400 tracking-[0.2em] transition-all duration-300 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => isAuthenticated ? navigate('/dashboard/appointments') : openAuthModal('signin')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                Réserver
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => isAuthenticated ? navigate('/dashboard') : openAuthModal('signin')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest"
              >
                {isAuthenticated ? <User className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                {isAuthenticated ? 'Mon Espace' : 'Connexion'}
              </motion.button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-10 space-y-8">
              <div className="space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left py-2 text-lg font-black text-white/80 hover:text-pink-500 tracking-tight"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              
              <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
                <button
                  onClick={() => isAuthenticated ? navigate('/dashboard/appointments') : openAuthModal('signin')}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest"
                >
                  <Calendar className="w-4 h-4 text-pink-500" />
                  Réserver un moment
                </button>
                <button
                  onClick={() => isAuthenticated ? navigate('/dashboard') : openAuthModal('signin')}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-500/20"
                >
                  <User className="w-4 h-4" />
                  {isAuthenticated ? 'Mon Espace' : 'Se Connecter'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../auth/AuthProvider';
import { images } from '../../utils/images';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    { name: 'Accueil', href: '#home' },
    { name: 'Galerie', href: '#gallery' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' }
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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 w-full">

          {/* LOGO (Grisé à gauche) */}
          <div className="flex-shrink-0 flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => scrollToSection('#home')}
            >
              <img
                src={images.branding.logo}
                alt={images.branding.alt}
                className="h-10 md:h-12 w-auto object-contain"
              />
            </motion.div>
          </div>

          {/* DESKTOP NAV (Liens au centre) */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-pink-600 font-medium transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* ACTIONS DROITE (Mobile & Desktop) */}
          <div className="flex items-center space-x-1 sm:space-x-2">

            {/* Icônes Mobile Uniquement */}
            <div className="flex md:hidden items-center space-x-1">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/dashboard/appointments');
                  } else {
                    openAuthModal('signin');
                  }
                }}
                className="p-2 text-pink-600 hover:bg-pink-50 rounded-full"
              >
                <Calendar className="w-5 h-5" />
              </button>

              {!isAuthenticated ? (
                <div className="flex items-center">
                  <button
                    onClick={() => openAuthModal('signin')}
                    className="p-2 text-pink-600"
                  >
                    <LogIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="p-2 text-purple-600"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 text-purple-600"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Bouton Menu Hamburger (Mobile) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Boutons Desktop Uniquement */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/dashboard/appointments');
                  } else {
                    openAuthModal('signin');
                  }
                }}
                className="flex items-center px-4 py-2 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Réserver
              </button>

              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg"
                >
                  <User className="w-4 h-4 mr-2" />
                  Mon Compte
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left py-2 text-gray-700 hover:text-pink-600 font-medium"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

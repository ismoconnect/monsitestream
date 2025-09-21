import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Menu, X, Calendar, User, MessageSquare, Star, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../auth/AuthProvider';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Utilisation sécurisée des hooks avec vérification
  let currentUser = null;
  let isAuthenticated = false;
  let openAuthModal = () => {
    console.log('Auth modal not available, please reload the page');
    alert('Veuillez recharger la page pour vous connecter');
  };
  
  try {
    const auth = useAuth();
    currentUser = auth.currentUser;
    isAuthenticated = auth.isAuthenticated;
  } catch (error) {
    console.warn('Auth context not available:', error.message);
  }
  
  try {
    const authModal = useAuthModal();
    openAuthModal = authModal.openAuthModal;
  } catch (error) {
    console.warn('AuthModal context not available:', error.message);
  }

  const navItems = [
    { name: 'Accueil', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Galerie', href: '#gallery' },
    { name: 'Abonnements', href: '#subscriptions' },
    { name: 'Contact', href: '#contact' }
  ];

  const scrollToSection = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
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
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center cursor-pointer"
            onClick={() => scrollToSection('#home')}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-800">Sophie</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-pink-600 font-medium transition-colors"
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/booking')}
              className="flex items-center px-4 py-2 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Réserver
            </motion.button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/messages')}
                  className="flex items-center px-4 py-2 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center px-4 py-2 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-all"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAuthModal('signup')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inscription
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-pink-600 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left py-2 text-gray-700 hover:text-pink-600 font-medium transition-colors"
                >
                  {item.name}
                </motion.button>
              ))}
              
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/booking')}
                  className="w-full flex items-center justify-center px-4 py-3 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Réserver un RDV
                </motion.button>
                
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate('/messages');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center px-4 py-3 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all"
                    >
                      <User className="w-4 h-4 mr-2 inline" />
                      Mon Dashboard
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        openAuthModal('signin');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center px-4 py-3 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-all"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Connexion
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        openAuthModal('signup');
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all"
                    >
                      <UserPlus className="w-4 h-4 mr-2 inline" />
                      S'inscrire
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
};

export default Navbar;

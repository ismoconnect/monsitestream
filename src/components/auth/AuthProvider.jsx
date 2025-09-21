import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

const AuthModalContext = createContext();

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const navigate = useNavigate();

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const handleAuthSuccess = () => {
    console.log('🚀 Redirection vers le dashboard...');
    navigate('/dashboard');
  };

  return (
    <AuthModalContext.Provider value={{ 
      openAuthModal, 
      closeAuthModal
    }}>
      {children}
      
      {/* Auth Modal Simple */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </AuthModalContext.Provider>
  );
};

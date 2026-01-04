import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';
import demoAuthService from '../services/demoAuth';
import { firestoreAuth } from '../services/firestoreAuth';
import firebaseAuthService from '../services/firebaseAuthService';

// Mode d'authentification : 'demo', 'firebase-custom', 'firestore', 'firebase-native'
const AUTH_MODE = 'firebase-native';

// Sélectionner le service d'authentification
const getAuthService = () => {
  switch (AUTH_MODE) {
    case 'firebase-native':
      return firebaseAuthService;
    case 'firestore':
      return firestoreAuth;
    case 'firebase-custom':
      return authService;
    case 'demo':
    default:
      return demoAuthService;
  }
};

const authServiceToUse = getAuthService();

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    // Le listener de firebaseAuthService s'occupe de récupérer le doc Firestore
    const unsubscribe = authServiceToUse.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await authServiceToUse.signIn(email, password);
      setLoading(false);

      if (AUTH_MODE === 'firestore') {
        // En mode Firestore, signIn retourne directement l'utilisateur
        return result; // L'utilisateur connecté
      } else {
        // En mode demo/firebase, signIn retourne un objet avec success
        return result;
      }
    } catch (error) {
      setLoading(false);
      throw error; // Laisser l'erreur remonter pour être gérée par l'AuthModal
    }
  };

  const signUp = async (userData) => {
    setLoading(true);
    let result;
    if (AUTH_MODE === 'firestore') {
      result = await authServiceToUse.createAccount(userData);
    } else {
      result = await authServiceToUse.createUser(userData);
    }
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authServiceToUse.signOut();
    setLoading(false);
    return result;
  };

  const hasActiveSubscription = () => {
    if (AUTH_MODE === 'firestore') {
      return currentUser?.subscription?.status === 'active' && currentUser?.isActive;
    }
    return authServiceToUse.hasActiveSubscription();
  };

  const updateSubscription = async (userId, subscriptionData) => {
    if (AUTH_MODE === 'firestore') {
      return await authServiceToUse.updateUserProfile(userId, { subscription: subscriptionData });
    }
    return await authServiceToUse.updateSubscription(userId, subscriptionData);
  };

  // Nouvelles méthodes pour Firestore
  const createAccount = async (userData) => {
    if (AUTH_MODE === 'firestore') {
      return await authServiceToUse.createAccount(userData);
    }
    throw new Error('createAccount only available in firestore mode');
  };

  const updateProfile = async (profileData) => {
    if (AUTH_MODE === 'firestore' && currentUser) {
      return await authServiceToUse.updateUserProfile(currentUser.id, profileData);
    }
    throw new Error('updateProfile only available in firestore mode');
  };

  const addServiceDocument = async (serviceType, data) => {
    if (AUTH_MODE === 'firestore' && currentUser) {
      return await authServiceToUse.addServiceDocument(currentUser.id, serviceType, data);
    }
    throw new Error('addServiceDocument only available in firestore mode');
  };

  const getUserServiceDocuments = async (serviceType) => {
    if (AUTH_MODE === 'firestore' && currentUser) {
      return await authServiceToUse.getUserServiceDocuments(currentUser.id, serviceType);
    }
    return [];
  };

  const incrementServiceCounter = async (serviceType) => {
    if (AUTH_MODE === 'firestore' && currentUser) {
      return await authServiceToUse.incrementServiceCounter(currentUser.id, serviceType);
    }
  };

  const purchaseSubscription = async (subscriptionData) => {
    if (AUTH_MODE === 'firestore' && currentUser) {
      return await authServiceToUse.purchaseSubscription(currentUser.id, subscriptionData);
    }
    throw new Error('purchaseSubscription only available in firestore mode');
  };

  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    signOut,
    hasActiveSubscription,
    updateSubscription,
    createAccount,
    updateProfile,
    addServiceDocument,
    getUserServiceDocuments,
    incrementServiceCounter,
    purchaseSubscription,
    isAuthenticated: !!currentUser,
    authMode: AUTH_MODE
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
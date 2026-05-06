import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export const useUserStatus = () => {
  const { currentUser, authMode } = useAuth();
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authMode !== 'firestore' || !currentUser?.id) {
      setUserStatus(currentUser);
      setLoading(false);
      return;
    }

    // Écouter les changements en temps réel du document utilisateur
    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.id),
      (doc) => {
        if (doc.exists()) {
          const updatedUser = { id: doc.id, ...doc.data() };
          setUserStatus(updatedUser);
          
          // Mettre à jour le localStorage si c'est l'utilisateur actuel
          if (currentUser?.id === updatedUser.id) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Erreur lors de l\'écoute du statut utilisateur:', error);
        setUserStatus(currentUser);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.id, authMode]);

  return { userStatus, loading };
};

import { doc, updateDoc, onSnapshot, serverTimestamp, collection, query, where, setDoc } from 'firebase/firestore';
import { db } from './firebase';

class PresenceService {
  constructor() {
    this.presenceListeners = new Map();
    this.heartbeatInterval = null;
    this.currentUserId = null;
    this.isOnline = false;
  }

  // Démarrer le suivi de présence pour un utilisateur
  async startPresence(userId, userType = 'client') {
    console.log(`🟢 Démarrage présence pour ${userType}:`, userId);
    this.currentUserId = userId;
    this.isOnline = true;

    try {
      // Mettre à jour le statut en ligne
      await this.updatePresence(userId, {
        isOnline: true,
        lastSeen: serverTimestamp(),
        userType: userType, // 'client' ou 'admin'
        displayName: userType === 'admin' ? 'Liliana' : 'Client'
      });

      // Démarrer le heartbeat (toutes les 30 secondes)
      this.startHeartbeat(userId);

      // Gérer la fermeture de la page
      this.setupPageUnloadHandler(userId);

      console.log(`✅ Présence démarrée avec succès pour ${userType}:`, userId);
    } catch (error) {
      console.error('❌ Erreur lors du démarrage de la présence:', error);
    }
  }

  // Arrêter le suivi de présence
  async stopPresence(userId) {
    this.isOnline = false;

    try {
      await this.updatePresence(userId, {
        isOnline: false,
        lastSeen: serverTimestamp()
      });

      // Arrêter le heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      console.log('Présence arrêtée pour:', userId);
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de la présence:', error);
    }
  }

  // Mettre à jour le statut de présence
  async updatePresence(userId, presenceData) {
    try {
      // Pour l'admin, on utilise toujours l'ID 'admin' fixe dans Firestore 
      // pour que les clients puissent l'écouter facilement
      const targetId = presenceData.userType === 'admin' ? 'admin' : userId;
      const presenceRef = doc(db, 'presence', targetId);

      // Toujours utiliser setDoc avec merge pour créer ou mettre à jour
      await setDoc(presenceRef, {
        userId: targetId,
        ...presenceData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log('✅ Présence Firestore mise à jour pour:', userId, presenceData);
    } catch (error) {
      console.error('❌ Erreur Firestore, utilisation localStorage:', error);

      // Fallback vers localStorage pour le développement
      const presenceData_local = {
        userId,
        ...presenceData,
        updatedAt: new Date().toISOString(),
        isOnline: presenceData.isOnline,
        lastSeen: new Date()
      };

      localStorage.setItem(`presence_${userId}`, JSON.stringify(presenceData_local));
      console.log('📦 Présence localStorage mise à jour pour:', userId);
    }
  }

  // Écouter le statut de présence d'un utilisateur
  listenToPresence(userId, callback) {
    console.log('👂 Écoute présence pour:', userId);

    try {
      const presenceRef = doc(db, 'presence', userId);

      const unsubscribe = onSnapshot(presenceRef, (doc) => {
        if (doc.exists()) {
          const presenceData = doc.data();

          // Vérifier si l'utilisateur est vraiment en ligne (dernière activité < 2 minutes)
          const now = new Date();
          const lastSeen = presenceData.lastSeen?.toDate();
          const isRecentlyActive = lastSeen && (now - lastSeen) < 2 * 60 * 1000; // 2 minutes

          const finalPresence = {
            ...presenceData,
            isOnline: presenceData.isOnline && isRecentlyActive,
            lastSeen: lastSeen
          };

          console.log('📡 Présence reçue de Firestore:', finalPresence);
          callback(finalPresence);
        } else {
          console.log('📭 Document présence n\'existe pas encore pour:', userId);
          // Utilisateur pas encore dans la base de présence
          callback({
            isOnline: false,
            lastSeen: null,
            userType: 'unknown'
          });
        }
      }, (error) => {
        console.error('❌ Erreur Firestore, fallback localStorage:', error);

        // Fallback vers localStorage
        this.listenToPresenceLocalStorage(userId, callback);
      });

      this.presenceListeners.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur lors de l\'écoute Firestore:', error);
      // Fallback vers localStorage
      return this.listenToPresenceLocalStorage(userId, callback);
    }
  }

  // Fallback localStorage pour l'écoute
  listenToPresenceLocalStorage(userId, callback) {
    console.log('📦 Utilisation localStorage pour:', userId);

    const checkPresence = () => {
      const stored = localStorage.getItem(`presence_${userId}`);
      if (stored) {
        try {
          const presenceData = JSON.parse(stored);
          const lastSeen = new Date(presenceData.lastSeen);
          const now = new Date();
          const isRecentlyActive = (now - lastSeen) < 2 * 60 * 1000; // 2 minutes

          callback({
            ...presenceData,
            isOnline: presenceData.isOnline && isRecentlyActive,
            lastSeen: lastSeen
          });
        } catch (error) {
          console.error('Erreur parsing localStorage:', error);
          callback({ isOnline: false, lastSeen: null, userType: 'unknown' });
        }
      } else {
        callback({ isOnline: false, lastSeen: null, userType: 'unknown' });
      }
    };

    // Vérifier immédiatement
    checkPresence();

    // Vérifier périodiquement
    const interval = setInterval(checkPresence, 5000); // Toutes les 5 secondes

    return () => clearInterval(interval);
  }

  // Arrêter l'écoute de présence
  stopListeningToPresence(userId) {
    const unsubscribe = this.presenceListeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.presenceListeners.delete(userId);
    }
  }

  // Démarrer le heartbeat
  startHeartbeat(userId) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      if (this.isOnline) {
        try {
          await this.updatePresence(userId, {
            isOnline: true,
            lastSeen: serverTimestamp()
          });
        } catch (error) {
          console.error('Erreur heartbeat:', error);
        }
      }
    }, 30000); // Toutes les 30 secondes
  }

  // Gérer la fermeture de la page
  setupPageUnloadHandler(userId) {
    const handleBeforeUnload = async () => {
      // Utiliser sendBeacon pour une requête rapide avant fermeture
      if (navigator.sendBeacon) {
        // Note: sendBeacon ne fonctionne qu'avec des requêtes HTTP simples
        // Pour Firestore, on utilise une approche différente
        await this.stopPresence(userId);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Page cachée - marquer comme hors ligne
        await this.updatePresence(userId, {
          isOnline: false,
          lastSeen: serverTimestamp()
        });
      } else if (this.currentUserId) {
        // Page visible - marquer comme en ligne
        await this.updatePresence(userId, {
          isOnline: true,
          lastSeen: serverTimestamp()
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Nettoyer les listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  // Obtenir le statut formaté
  getStatusText(presenceData) {
    console.log('📊 Formatage statut pour:', presenceData);

    if (!presenceData || Object.keys(presenceData).length === 0) {
      return 'Chargement...';
    }

    if (presenceData.isOnline === true) {
      return 'En ligne';
    } else if (presenceData.lastSeen) {
      const now = new Date();
      const lastSeen = presenceData.lastSeen;
      const diffInMinutes = (now - lastSeen) / (1000 * 60);

      if (diffInMinutes < 5) {
        return 'À l\'instant';
      } else if (diffInMinutes < 60) {
        return `Il y a ${Math.floor(diffInMinutes)} min`;
      } else if (diffInMinutes < 24 * 60) {
        return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
      } else {
        return lastSeen.toLocaleDateString('fr-FR');
      }
    }

    return 'Hors ligne';
  }

  // Nettoyer toutes les ressources
  cleanup() {
    // Arrêter tous les listeners
    this.presenceListeners.forEach(unsubscribe => unsubscribe());
    this.presenceListeners.clear();

    // Arrêter le heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Marquer comme hors ligne si on était en ligne
    if (this.currentUserId && this.isOnline) {
      this.stopPresence(this.currentUserId);
    }
  }
}

// Instance singleton
export const presenceService = new PresenceService();
export default presenceService;

import { doc, updateDoc, onSnapshot, serverTimestamp, collection, query, where, setDoc } from 'firebase/firestore';
import { db } from './firebase';

class PresenceService {
  constructor() {
    this.presenceListeners = new Map();
    this.heartbeatInterval = null;
    this.currentUserId = null;
    this.currentUserType = null;
    this.isOnline = false;
  }

  // Démarrer le suivi de présence pour un utilisateur
  async startPresence(userId, userType = 'client') {
    if (!userId) return;
    console.log(`🟢 Démarrage présence pour ${userType}:`, userId);
    this.currentUserId = userId;
    this.currentUserType = userType;
    this.isOnline = true;

    try {
      await this.updatePresence(userId, {
        isOnline: true,
        lastSeen: serverTimestamp(),
        userType: userType,
        displayName: userType === 'admin' ? 'Liliana' : 'Client'
      });

      this.startHeartbeat(userId);
      this.setupPageUnloadHandler(userId);
      console.log(`✅ Présence démarrée avec succès pour ${userType}:`, userId);
    } catch (error) {
      console.error('❌ Erreur lors du démarrage de la présence:', error);
    }
  }

  async stopPresence(userId) {
    const idToStop = userId || this.currentUserId;
    if (!idToStop) return;
    
    this.isOnline = false;

    try {
      await this.updatePresence(idToStop, {
        isOnline: false,
        lastSeen: serverTimestamp()
      });

      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de la présence:', error);
    }
  }

  async updatePresence(userId, presenceData) {
    const id = userId || this.currentUserId;
    const type = presenceData.userType || this.currentUserType;
    
    // Pour l'admin, on utilise toujours l'ID 'admin' fixe
    const targetId = type === 'admin' ? 'admin' : id;
    
    if (!targetId) return;

    try {
      const presenceRef = doc(db, 'presence', targetId);
      await setDoc(presenceRef, {
        userId: targetId,
        ...presenceData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log('✅ Présence Firestore mise à jour pour:', targetId);
    } catch (error) {
      console.error('❌ Erreur Firestore presence:', error);
    }
  }

  listenToPresence(userId, callback) {
    if (!userId) return;
    
    try {
      const presenceRef = doc(db, 'presence', userId);
      const unsubscribe = onSnapshot(presenceRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const now = new Date();
          const lastSeen = data.lastSeen?.toDate();
          const isRecentlyActive = lastSeen && (now - lastSeen) < 2 * 60 * 1000; 

          callback({
            ...data,
            isOnline: data.isOnline && isRecentlyActive,
            lastSeen: lastSeen
          });
        } else {
          callback({ isOnline: false, lastSeen: null, userType: 'unknown' });
        }
      });

      this.presenceListeners.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur écoute présence:', error);
    }
  }

  startHeartbeat(userId) {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(async () => {
      if (this.isOnline && this.currentUserId) {
        await this.updatePresence(this.currentUserId, {
          isOnline: true,
          lastSeen: serverTimestamp()
        });
      }
    }, 30000);
  }

  setupPageUnloadHandler(userId) {
    const handleBeforeUnload = () => {
      if (this.currentUserId) this.stopPresence(this.currentUserId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }

  getStatusText(presenceData) {
    if (!presenceData || !presenceData.lastSeen) return presenceData?.isOnline ? 'En ligne' : 'Hors ligne';
    if (presenceData.isOnline) return 'En ligne';
    
    const now = new Date();
    const lastSeen = presenceData.lastSeen;
    const diffInMinutes = (now - lastSeen) / (1000 * 60);

    if (diffInMinutes < 5) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${Math.floor(diffInMinutes)} min`;
    return lastSeen.toLocaleDateString('fr-FR');
  }

  cleanup() {
    this.presenceListeners.forEach(unsub => unsub());
    this.presenceListeners.clear();
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }
}

export const presenceService = new PresenceService();
export default presenceService;

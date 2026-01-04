import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Service d'authentification personnalisé avec Firestore
class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  // Écouter les changements d'état d'authentification
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notifier tous les listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  // Créer un nouvel utilisateur
  async createUser(userData) {
    try {
      if (!db) {
        throw new Error('Firebase non initialisé');
      }

      const userRef = doc(collection(db, 'users'));
      const user = {
        id: userRef.id,
        email: userData.email,
        password: userData.password, // En production, hasher le mot de passe
        displayName: userData.displayName,
        role: userData.role || 'client',
        subscription: {
          type: 'none',
          status: 'inactive',
          startDate: null,
          endDate: null
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, user);
      
      // Connecter l'utilisateur
      this.currentUser = user;
      this.notifyListeners();
      
      return { success: true, user };
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      
      // Gestion des erreurs spécifiques
      if (error.code === 'unavailable') {
        return { success: false, error: 'Service temporairement indisponible. Veuillez réessayer.' };
      } else if (error.code === 'permission-denied') {
        return { success: false, error: 'Erreur de permissions. Contactez le support.' };
      } else {
        return { success: false, error: 'Erreur de connexion. Vérifiez votre connexion internet.' };
      }
    }
  }

  // Connexion utilisateur
  async signIn(email, password) {
    try {
      if (!db) {
        throw new Error('Firebase non initialisé');
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.password !== password) {
        return { success: false, error: 'Mot de passe incorrect' };
      }

      // Mettre à jour la dernière connexion
      await updateDoc(doc(db, 'users', userDoc.id), {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      this.currentUser = { ...userData, id: userDoc.id };
      this.notifyListeners();

      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Erreur connexion:', error);
      
      // Gestion des erreurs spécifiques
      if (error.code === 'unavailable') {
        return { success: false, error: 'Service temporairement indisponible. Veuillez réessayer.' };
      } else if (error.code === 'permission-denied') {
        return { success: false, error: 'Erreur de permissions. Contactez le support.' };
      } else {
        return { success: false, error: 'Erreur de connexion. Vérifiez votre connexion internet.' };
      }
    }
  }

  // Déconnexion
  async signOut() {
    this.currentUser = null;
    this.notifyListeners();
    return { success: true };
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.currentUser;
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Vérifier si l'utilisateur a un abonnement actif
  hasActiveSubscription() {
    if (!this.currentUser) return false;
    
    const subscription = this.currentUser.subscription;
    if (!subscription || subscription.status !== 'active') return false;
    
    const now = new Date();
    const endDate = subscription.endDate?.toDate();
    
    return endDate && endDate > now;
  }

  // Mettre à jour l'abonnement de l'utilisateur
  async updateSubscription(userId, subscriptionData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscription: {
          ...subscriptionData,
          updatedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      // Mettre à jour l'utilisateur local
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.subscription = subscriptionData;
        this.notifyListeners();
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour abonnement:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir les détails d'un utilisateur
  async getUserById(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { success: true, user: { ...userDoc.data(), id: userDoc.id } };
      } else {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const authService = new AuthService();

export default authService;

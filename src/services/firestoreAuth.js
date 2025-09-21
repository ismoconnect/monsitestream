import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

class FirestoreAuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
  }

  // Créer un nouveau compte utilisateur (inscription simple)
  async createAccount(userData) {
    try {
      console.log('🚀 Début de création de compte:', userData);
      const { email, password, displayName } = userData;
      
      // Vérifier si l'email existe déjà
      console.log('🔍 Vérification de l\'email existant...');
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Un compte avec cet email existe déjà');
      }

      // Créer l'ID utilisateur
      const userId = this.generateUserId();
      console.log('🆔 ID utilisateur généré:', userId);
      
      // Données utilisateur de base
      const userDoc = {
        id: userId,
        email: email.toLowerCase(),
        displayName,
        password: await this.hashPassword(password), // En production, utiliser bcrypt
        subscription: {
          plan: 'free', // Plan gratuit par défaut
          status: 'pending', // En attente de validation du compte
          requestedAt: serverTimestamp(),
          validatedAt: null,
          validatedBy: null,
          expiresAt: null
        },
        profile: {
          bio: '',
          location: '',
          phone: '',
          avatar: null
        },
        preferences: {
          notifications: true,
          emailUpdates: true,
          privacy: 'private'
        },
        stats: {
          appointments: 0,
          messages: 0,
          sessions: 0,
          galleryViews: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true // Activé pour permettre l'accès au dashboard
      };

      // Créer le document utilisateur
      console.log('💾 Création du document utilisateur...');
      await setDoc(doc(db, 'users', userId), userDoc);
      console.log('✅ Document utilisateur créé avec succès');

      // Créer les sous-collections vides pour les services
      console.log('🏗️ Initialisation des services utilisateur...');
      await this.initializeUserServices(userId);
      console.log('✅ Services initialisés avec succès');

      // Connecter automatiquement l'utilisateur après création
      const newUser = await this.getUserById(userId);
      this.currentUser = newUser;
      this.notifyAuthListeners(newUser);
      
      // Sauvegarder dans localStorage pour persistance
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      return {
        success: true,
        userId,
        user: newUser,
        message: 'Compte créé avec succès. Vous pouvez maintenant accéder à votre dashboard.'
      };
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      throw new Error(error.message || 'Erreur lors de la création du compte');
    }
  }

  // Initialiser les sous-collections de services pour un utilisateur
  async initializeUserServices(userId) {
    try {
      // Créer les collections vides avec des documents d'initialisation
      const collections = [
        'appointments',
        'messages',
        'sessions',
        'gallery',
        'notifications'
      ];

      for (const collectionName of collections) {
        const initDoc = {
          _initialized: true,
          createdAt: serverTimestamp(),
          count: 0
        };
        
        await setDoc(
          doc(db, 'users', userId, collectionName, '_init'), 
          initDoc
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des services:', error);
    }
  }

  // Connexion utilisateur
  async signIn(email, password) {
    try {
      const user = await this.getUserByEmail(email.toLowerCase());
      
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier le mot de passe (en production, utiliser bcrypt.compare)
      const isValidPassword = await this.verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier si le compte est rejeté (seul cas bloquant)
      if (user.subscription.status === 'rejected') {
        throw new Error('Votre demande d\'abonnement a été refusée. Contactez le support pour plus d\'informations.');
      }
      
      // Les comptes en attente (pending) peuvent se connecter mais avec accès limité

      // Mettre à jour la dernière connexion
      await updateDoc(doc(db, 'users', user.id), {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      this.currentUser = user;
      this.notifyAuthListeners(user);
      
      // Sauvegarder dans localStorage pour persistance
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error(error.message || 'Erreur lors de la connexion');
    }
  }

  // Déconnexion
  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.notifyAuthListeners(null);
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    // Récupérer depuis localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      return this.currentUser;
    }
    
    return null;
  }

  // Obtenir un utilisateur par email
  async getUserByEmail(email) {
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return querySnapshot.docs[0].data();
    } catch (error) {
      console.error('Erreur lors de la recherche utilisateur:', error);
      return null;
    }
  }

  // Obtenir un utilisateur par ID
  async getUserById(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Erreur lors de la récupération utilisateur:', error);
      return null;
    }
  }

  // Mettre à jour le profil utilisateur
  async updateUserProfile(userId, profileData) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...profileData,
        updatedAt: serverTimestamp()
      });

      // Mettre à jour l'utilisateur actuel si c'est lui
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = { ...this.currentUser, ...profileData };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.notifyAuthListeners(this.currentUser);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  }

  // Incrémenter un compteur de service
  async incrementServiceCounter(userId, service) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        [`stats.${service}`]: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation du compteur:', error);
    }
  }

  // Acheter un abonnement (depuis le dashboard)
  async purchaseSubscription(userId, subscriptionData) {
    try {
      const { plan, paymentMethod } = subscriptionData;
      
      // Simuler le traitement du paiement
      console.log('💳 Traitement du paiement pour:', plan);
      
      // Mettre à jour l'abonnement
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30); // 30 jours
      
      await updateDoc(doc(db, 'users', userId), {
        'subscription.plan': plan,
        'subscription.status': 'active',
        'subscription.purchasedAt': serverTimestamp(),
        'subscription.expiresAt': expirationDate,
        'subscription.paymentMethod': paymentMethod || 'card',
        'updatedAt': serverTimestamp()
      });

      // Mettre à jour l'utilisateur actuel si c'est lui
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.subscription = {
          ...this.currentUser.subscription,
          plan,
          status: 'active',
          expiresAt: expirationDate
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.notifyAuthListeners(this.currentUser);
      }

      return {
        success: true,
        message: 'Abonnement activé avec succès ! Vous avez maintenant accès au contenu premium.'
      };
    } catch (error) {
      console.error('Erreur lors de l\'achat d\'abonnement:', error);
      throw new Error('Erreur lors de l\'achat de l\'abonnement');
    }
  }

  // Ajouter un document de service
  async addServiceDocument(userId, service, data) {
    try {
      const serviceRef = collection(db, 'users', userId, service);
      const docId = this.generateDocumentId();
      
      await setDoc(doc(serviceRef, docId), {
        id: docId,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Incrémenter le compteur
      await this.incrementServiceCounter(userId, service);

      return docId;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document de service:', error);
      throw new Error('Erreur lors de l\'ajout du service');
    }
  }

  // Obtenir les documents d'un service utilisateur
  async getUserServiceDocuments(userId, service) {
    try {
      const serviceRef = collection(db, 'users', userId, service);
      const querySnapshot = await getDocs(serviceRef);
      
      return querySnapshot.docs
        .map(doc => doc.data())
        .filter(doc => doc.id !== '_init') // Exclure le document d'initialisation
        .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
      return [];
    }
  }

  // Écouter les changements d'authentification
  onAuthStateChanged(callback) {
    this.authListeners.push(callback);
    
    // Appeler immédiatement avec l'état actuel
    callback(this.getCurrentUser());
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.authListeners = this.authListeners.filter(listener => listener !== callback);
    };
  }

  // Notifier tous les listeners
  notifyAuthListeners(user) {
    this.authListeners.forEach(callback => callback(user));
  }

  // Utilitaires
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateDocumentId() {
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Hash du mot de passe (simplifié - utiliser bcrypt en production)
  async hashPassword(password) {
    // En production, utiliser bcrypt ou une autre méthode sécurisée
    return btoa(password + 'salt_secret_key');
  }

  // Vérification du mot de passe
  async verifyPassword(password, hashedPassword) {
    // En production, utiliser bcrypt.compare
    return btoa(password + 'salt_secret_key') === hashedPassword;
  }
}

// Instance singleton
export const firestoreAuth = new FirestoreAuthService();
export default firestoreAuth;

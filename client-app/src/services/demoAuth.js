// Service d'authentification de démonstration (sans Firebase)
class DemoAuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.demoUsers = [
      {
        id: 'demo-user-1',
        email: 'demo@test.com',
        password: 'demo123',
        displayName: 'Utilisateur Démo',
        role: 'client',
        subscription: {
          type: 'premium',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    ];
    
    // Restaurer l'utilisateur depuis le localStorage au démarrage
    this.restoreUserFromStorage();
  }

  // Sauvegarder l'utilisateur dans le localStorage
  saveUserToStorage(user) {
    if (user) {
      localStorage.setItem('demo_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('demo_current_user');
    }
  }

  // Restaurer l'utilisateur depuis le localStorage
  restoreUserFromStorage() {
    try {
      const savedUser = localStorage.getItem('demo_current_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch (error) {
      console.warn('Erreur lors de la restauration de l\'utilisateur:', error);
      localStorage.removeItem('demo_current_user');
    }
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

  // Créer un nouvel utilisateur (simulation)
  async createUser(userData) {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier si l'email existe déjà
      const existingUser = this.demoUsers.find(user => user.email === userData.email);
      if (existingUser) {
        return { success: false, error: 'Cet email est déjà utilisé' };
      }

      const newUser = {
        id: `demo-user-${Date.now()}`,
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        role: userData.role || 'client',
        subscription: {
          type: 'none',
          status: 'inactive',
          startDate: null,
          endDate: null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.demoUsers.push(newUser);
      
      // Connecter l'utilisateur
      this.currentUser = newUser;
      this.saveUserToStorage(newUser);
      this.notifyListeners();
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      return { success: false, error: 'Erreur lors de la création du compte' };
    }
  }

  // Connexion utilisateur (simulation)
  async signIn(email, password) {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));

      const user = this.demoUsers.find(u => u.email === email);
      
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      if (user.password !== password) {
        return { success: false, error: 'Mot de passe incorrect' };
      }

      // Mettre à jour la dernière connexion
      user.lastLogin = new Date().toISOString();
      user.updatedAt = new Date().toISOString();

      this.currentUser = user;
      this.saveUserToStorage(user);
      this.notifyListeners();

      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  }

  // Déconnexion
  async signOut() {
    this.currentUser = null;
    this.saveUserToStorage(null);
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
    const endDate = new Date(subscription.endDate);
    
    return endDate > now;
  }

  // Mettre à jour l'abonnement de l'utilisateur
  async updateSubscription(userId, subscriptionData) {
    try {
      const user = this.demoUsers.find(u => u.id === userId);
      if (user) {
        user.subscription = {
          ...subscriptionData,
          updatedAt: new Date().toISOString()
        };
        user.updatedAt = new Date().toISOString();

        // Mettre à jour l'utilisateur local
        if (this.currentUser && this.currentUser.id === userId) {
          this.currentUser.subscription = subscriptionData;
          this.notifyListeners();
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour abonnement:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const demoAuthService = new DemoAuthService();

export default demoAuthService;

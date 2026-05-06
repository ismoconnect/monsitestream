import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import demoAuthService from './demoAuth';

// Service de gestion des abonnements
class SubscriptionService {
  constructor() {
    this.stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  }

  // Créer une session Stripe pour l'abonnement
  async createSubscriptionSession(userId, subscriptionType) {
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscriptionType,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/dashboard?subscription=cancelled`
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      const { sessionId } = await response.json();
      return { success: true, sessionId };
    } catch (error) {
      console.error('Erreur création session Stripe:', error);
      return { success: false, error: error.message };
    }
  }

  // Simuler un abonnement (pour le développement)
  async simulateSubscription(userId, subscriptionType) {
    try {
      const subscriptionData = {
        type: subscriptionType,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        price: subscriptionType === 'basic' ? 29 : 79,
        currency: 'EUR'
      };

      // Vérifier si on est en mode démo
      const currentUser = demoAuthService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        // Mode démo - utiliser le service d'auth démo
        const result = await demoAuthService.updateSubscription(userId, subscriptionData);
        return { success: true, subscription: subscriptionData };
      }

      // Mode Firebase - mettre à jour dans Firestore
      if (!db) {
        throw new Error('Firebase non initialisé');
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscription: subscriptionData,
        updatedAt: serverTimestamp()
      });

      return { success: true, subscription: subscriptionData };
    } catch (error) {
      console.error('Erreur simulation abonnement:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir les détails d'un abonnement
  async getSubscriptionDetails(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          success: true,
          subscription: userData.subscription || null
        };
      } else {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
    } catch (error) {
      console.error('Erreur récupération abonnement:', error);
      return { success: false, error: error.message };
    }
  }

  // Annuler un abonnement
  async cancelSubscription(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscription: {
          type: 'none',
          status: 'cancelled',
          cancelledAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur annulation abonnement:', error);
      return { success: false, error: error.message };
    }
  }

  // Vérifier si un abonnement est actif
  isSubscriptionActive(subscription) {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const now = new Date();
    const endDate = subscription.endDate?.toDate ? subscription.endDate.toDate() : new Date(subscription.endDate);

    return endDate > now;
  }

  // Obtenir les types d'abonnement disponibles
  getSubscriptionTypes() {
    return [
      {
        id: 'basic',
        name: 'Accès Basic',
        price: 0,
        period: 'Inclus',
        description: 'Offert à l\'inscription',
        features: [
          'Messages privés illimités',
          'Support client dédié',
          'Accès au profil complet'
        ]
      },
      {
        id: 'premium',
        name: 'Premium VIP',
        price: 49,
        period: 'mois',
        description: 'L\'expérience visuelle',
        features: [
          'Tout du Basic',
          'Accès complet à la Galerie',
          'Photos exclusives HD',
          'Vidéos privées (Galerie)',
          'Support prioritaire'
        ]
      },
      {
        id: 'vip',
        name: 'VIP Elite',
        price: 199,
        period: 'mois',
        description: 'L\'accès ultime sans limites',
        features: [
          'Tout du Premium',
          'Sessions Streaming Live illimitées',
          'Appels vidéo 1:1 prioritaires',
          'Contenu sur mesure',
          'Ligne directe WhatsApp',
          'Accès à TOUTES les fonctionnalités'
        ]
      }
    ];
  }
}

// Instance singleton
const subscriptionService = new SubscriptionService();

export default subscriptionService;

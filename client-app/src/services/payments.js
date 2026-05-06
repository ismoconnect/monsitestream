// Payment and Subscription Service
import { loadStripe } from '@stripe/stripe-js';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

class PaymentService {
  constructor() {
    this.stripe = null;
    this.elements = null;
    this.paymentElement = null;
    this.initializeStripe();
  }

  // Initialize Stripe
  async initializeStripe() {
    try {
      this.stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!this.stripe) {
        throw new Error('Failed to initialize Stripe');
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }

  // Subscription plans
  getSubscriptionPlans() {
    return [
      {
        id: 'free',
        name: 'Gratuit',
        price: 0,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Messages illimités',
          '1 conversation active',
          'Support par email',
          'Stockage 100MB'
        ],
        limits: {
          conversations: 1,
          storage: 100 * 1024 * 1024, // 100MB in bytes
          messages: -1 // unlimited
        }
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Messages illimités',
          'Conversations illimitées',
          'Support prioritaire',
          'Stockage 10GB',
          'Streaming HD',
          'Analytics avancées'
        ],
        limits: {
          conversations: -1, // unlimited
          storage: 10 * 1024 * 1024 * 1024, // 10GB in bytes
          messages: -1 // unlimited
        }
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 19.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Tout Premium',
          'Streaming 4K',
          'API access',
          'Stockage 100GB',
          'Support dédié',
          'White-label'
        ],
        limits: {
          conversations: -1, // unlimited
          storage: 100 * 1024 * 1024 * 1024, // 100GB in bytes
          messages: -1 // unlimited
        }
      }
    ];
  }

  // Create subscription
  async createSubscription(priceId, paymentMethodId, customerId = null) {
    try {
      const createSubscription = httpsCallable(functions, 'createSubscription');
      
      const result = await createSubscription({
        priceId,
        paymentMethodId,
        customerId
      });

      return result.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const updateSubscription = httpsCallable(functions, 'updateSubscription');
      
      const result = await updateSubscription({
        subscriptionId,
        newPriceId
      });

      return result.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, immediately = false) {
    try {
      const cancelSubscription = httpsCallable(functions, 'cancelSubscription');
      
      const result = await cancelSubscription({
        subscriptionId,
        immediately
      });

      return result.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Create payment intent for one-time payment
  async createPaymentIntent(amount, currency = 'EUR', metadata = {}) {
    try {
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
      
      const result = await createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata
      });

      return result.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId) {
    try {
      const confirmPayment = httpsCallable(functions, 'confirmPayment');
      
      const result = await confirmPayment({
        paymentIntentId
      });

      return result.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Create customer
  async createCustomer(email, name, metadata = {}) {
    try {
      const createCustomer = httpsCallable(functions, 'createCustomer');
      
      const result = await createCustomer({
        email,
        name,
        metadata
      });

      return result.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Get customer payment methods
  async getCustomerPaymentMethods(customerId) {
    try {
      const getPaymentMethods = httpsCallable(functions, 'getCustomerPaymentMethods');
      
      const result = await getPaymentMethods({
        customerId
      });

      return result.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  // Add payment method
  async addPaymentMethod(customerId, paymentMethodId) {
    try {
      const addPaymentMethod = httpsCallable(functions, 'addPaymentMethod');
      
      const result = await addPaymentMethod({
        customerId,
        paymentMethodId
      });

      return result.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Remove payment method
  async removePaymentMethod(paymentMethodId) {
    try {
      const removePaymentMethod = httpsCallable(functions, 'removePaymentMethod');
      
      const result = await removePaymentMethod({
        paymentMethodId
      });

      return result.data;
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(customerId, paymentMethodId) {
    try {
      const setDefaultPaymentMethod = httpsCallable(functions, 'setDefaultPaymentMethod');
      
      const result = await setDefaultPaymentMethod({
        customerId,
        paymentMethodId
      });

      return result.data;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  // Record payment in Firestore
  async recordPayment(paymentData) {
    try {
      const paymentRecord = {
        ...paymentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'payments'), paymentRecord);
      return docRef.id;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  // Update user subscription in Firestore
  async updateUserSubscription(userId, subscriptionData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscription: {
          ...subscriptionData,
          updatedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  }

  // Get user subscription
  async getUserSubscription(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().subscription;
      }
      return null;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  // Get payment history
  async getPaymentHistory(userId, limitCount = 50) {
    try {
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(paymentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  // Check subscription limits
  async checkSubscriptionLimits(userId, resourceType, currentUsage) {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return { allowed: false, reason: 'No subscription found' };

      const plans = this.getSubscriptionPlans();
      const plan = plans.find(p => p.id === subscription.plan);
      
      if (!plan) return { allowed: false, reason: 'Plan not found' };

      const limit = plan.limits[resourceType];
      
      if (limit === -1) return { allowed: true }; // Unlimited
      if (currentUsage >= limit) return { allowed: false, reason: 'Limit exceeded' };
      
      return { allowed: true, remaining: limit - currentUsage };
    } catch (error) {
      console.error('Error checking subscription limits:', error);
      return { allowed: false, reason: 'Error checking limits' };
    }
  }

  // Calculate usage
  async calculateUsage(userId, resourceType) {
    try {
      switch (resourceType) {
        case 'conversations':
          const conversationsQuery = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', { uid: userId })
          );
          const conversationsSnapshot = await getDocs(conversationsQuery);
          return conversationsSnapshot.size;

        case 'storage':
          // This would require a more complex calculation based on file sizes
          // For now, return 0 as a placeholder
          return 0;

        case 'messages':
          // This would require counting messages across all user conversations
          // For now, return 0 as a placeholder
          return 0;

        default:
          return 0;
      }
    } catch (error) {
      console.error('Error calculating usage:', error);
      return 0;
    }
  }

  // Get subscription status
  getSubscriptionStatus(subscription) {
    if (!subscription) return 'inactive';
    
    const now = new Date();
    const endDate = subscription.endDate?.toDate();
    
    if (subscription.status === 'active' && (!endDate || endDate > now)) {
      return 'active';
    } else if (subscription.status === 'past_due') {
      return 'past_due';
    } else if (subscription.status === 'canceled') {
      return 'canceled';
    } else {
      return 'inactive';
    }
  }

  // Format currency
  formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Format date
  formatDate(date) {
    if (!date) return '';
    
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// Create singleton instance
const paymentService = new PaymentService();
export default paymentService;

// Payment and Subscription Service - Optimized for Firebase Spark
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
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';

class PaymentService {
  constructor() {
    // Plus besoin de Stripe
    this.bankDetails = {
      bankName: "BNP Paribas",
      accountHolder: "MON SITE STREAM",
      iban: "FR76 3000 4028 1500 0101 0101 010",
      bic: "BNPAFRPPXXX"
    };
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
          storage: 100 * 1024 * 1024,
          messages: -1
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
          'Streaming HD'
        ],
        limits: {
          conversations: -1,
          storage: 10 * 1024 * 1024 * 1024,
          messages: -1
        }
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 19.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Tout Premium',
          'Streaming 4K',
          'Stockage 100GB',
          'Support dédié'
        ],
        limits: {
          conversations: -1,
          storage: 100 * 1024 * 1024 * 1024,
          messages: -1
        }
      }
    ];
  }

  // --- LOGIQUE CARTE CADEAU ---

  async validateGiftCard(code) {
    try {
      const q = query(collection(db, 'gift_cards'), where('code', '==', code.toUpperCase()), where('active', '==', true));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Code de carte cadeau invalide ou expiré.');
      }

      const cardData = snapshot.docs[0].data();
      const cardId = snapshot.docs[0].id;

      if (cardData.balance <= 0) {
        throw new Error('Cette carte cadeau n\'a plus de solde.');
      }

      return { id: cardId, ...cardData };
    } catch (error) {
      console.error('Error validating gift card:', error);
      throw error;
    }
  }

  async useGiftCard(userId, code, amountToPay) {
    try {
      return await runTransaction(db, async (transaction) => {
        const q = query(collection(db, 'gift_cards'), where('code', '==', code.toUpperCase()));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) throw new Error('Carte introuvable.');
        
        const cardRef = snapshot.docs[0].ref;
        const cardData = snapshot.docs[0].data();

        if (cardData.balance < amountToPay) {
          throw new Error('Solde insuffisant sur la carte cadeau.');
        }

        // Déduire le solde
        transaction.update(cardRef, {
          balance: cardData.balance - amountToPay,
          updatedAt: serverTimestamp()
        });

        // Enregistrer le paiement
        const paymentData = {
          userId,
          amount: amountToPay,
          method: 'gift_card',
          cardCode: code.toUpperCase(),
          status: 'completed',
          createdAt: serverTimestamp()
        };

        const paymentRef = doc(collection(db, 'payments'));
        transaction.set(paymentRef, paymentData);

        return { success: true, paymentId: paymentRef.id };
      });
    } catch (error) {
      console.error('Error using gift card:', error);
      throw error;
    }
  }

  // --- LOGIQUE VIREMENT BANCAIRE ---

  async requestBankTransfer(userId, amount, planId) {
    try {
      const paymentData = {
        userId,
        amount,
        planId,
        method: 'bank_transfer',
        status: 'pending', // En attente de validation admin
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'payments'), paymentData);
      
      return { 
        success: true, 
        paymentId: docRef.id, 
        bankDetails: this.bankDetails,
        message: "Veuillez effectuer le virement avec la référence: " + docRef.id.substring(0, 8)
      };
    } catch (error) {
      console.error('Error requesting bank transfer:', error);
      throw error;
    }
  }

  // --- GESTION SUBSCRIPTION (Manuelle) ---

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

  async getUserSubscription(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().subscription;
      }
      return { plan: 'free', status: 'active' };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return { plan: 'free', status: 'active' };
    }
  }

  async getPaymentHistory(userId, limitCount = 50) {
    try {
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(paymentsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

const paymentService = new PaymentService();
export default paymentService;

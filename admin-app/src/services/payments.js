// Payment and Subscription Service - Admin Version
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
    this.bankDetails = {
      bankName: "BNP Paribas",
      accountHolder: "MON SITE STREAM",
      iban: "FR76 3000 4028 1500 0101 0101 010",
      bic: "BNPAFRPPXXX"
    };
  }

  // --- GESTION DES VIREMENTS (ADMIN) ---

  async getAllPendingTransfers() {
    try {
      const q = query(
        collection(db, 'payments'), 
        where('method', '==', 'bank_transfer'), 
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
      throw error;
    }
  }

  async approveBankTransfer(paymentId, userId, planId) {
    try {
      await runTransaction(db, async (transaction) => {
        const paymentRef = doc(db, 'payments', paymentId);
        const userRef = doc(db, 'users', userId);

        // 1. Marquer le paiement comme complété
        transaction.update(paymentRef, {
          status: 'completed',
          updatedAt: serverTimestamp()
        });

        // 2. Mettre à jour l'abonnement de l'utilisateur
        transaction.update(userRef, {
          subscription: {
            plan: planId,
            status: 'active',
            updatedAt: serverTimestamp(),
            startDate: serverTimestamp()
          }
        });
      });
      return { success: true };
    } catch (error) {
      console.error('Error approving transfer:', error);
      throw error;
    }
  }

  // --- GESTION DES CARTES CADEAUX (ADMIN) ---

  async createGiftCard(amount, code = null) {
    try {
      const cardCode = code || Math.random().toString(36).substring(2, 10).toUpperCase();
      const cardData = {
        code: cardCode,
        initialAmount: amount,
        balance: amount,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'gift_cards'), cardData);
      return { id: docRef.id, code: cardCode };
    } catch (error) {
      console.error('Error creating gift card:', error);
      throw error;
    }
  }

  async getAllGiftCards() {
    try {
      const q = query(collection(db, 'gift_cards'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      throw error;
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

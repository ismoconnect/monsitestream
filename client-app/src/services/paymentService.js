import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Types de cartes cadeaux supportées
export const GIFT_CARD_TYPES = [
  { id: 'google-play', name: 'Google Play', icon: '🎮' },
  { id: 'neosurf', name: 'Neosurf', icon: '💳' },
  { id: 'transcash', name: 'Transcash', icon: '💰' },
  { id: 'pcs', name: 'PCS', icon: '🏦' },
  { id: 'toneofirst', name: 'Toneofirst', icon: '📱' },
  { id: 'amazon', name: 'Amazon', icon: '📦' },
  { id: 'steam', name: 'Steam', icon: '🎯' }
];

// Statuts de paiement
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  WAITING_PAYMENT: 'waiting_payment',
  VALIDATING: 'validating',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

// Types de paiement
export const PAYMENT_TYPES = {
  BANK_TRANSFER: 'bank_transfer',
  GIFT_CARD: 'gift_card',
  COUPON: 'coupon'
};

class PaymentService {
  // Générer un code de référence unique
  generateReferenceCode() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `PAY-${timestamp}-${random}`.toUpperCase();
  }

  // Créer une demande de paiement
  async createPaymentRequest(paymentData) {
    try {
      // Validation des données essentielles
      if (!paymentData.userId) {
        throw new Error('userId est requis pour créer une demande de paiement');
      }
      if (!paymentData.userEmail) {
        throw new Error('userEmail est requis pour créer une demande de paiement');
      }
      if (!paymentData.plan) {
        throw new Error('plan est requis pour créer une demande de paiement');
      }

      console.log('Création demande paiement avec données:', {
        userId: paymentData.userId,
        userEmail: paymentData.userEmail,
        plan: paymentData.plan?.name,
        type: paymentData.type
      });

      const referenceCode = this.generateReferenceCode();
      const initialStatus = paymentData.status || PAYMENT_STATUS.PENDING;

      const paymentRequest = {
        userId: paymentData.userId,
        userEmail: paymentData.userEmail,
        plan: paymentData.plan,
        type: paymentData.type,
        amount: paymentData.amount,
        currency: paymentData.currency || 'EUR',
        paymentDetails: paymentData.paymentDetails || {},
        referenceCode,
        status: initialStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        notifications: {
          emailSent: false,
          statusUpdates: initialStatus !== PAYMENT_STATUS.PENDING ? [
            {
              status: initialStatus,
              timestamp: new Date(),
              note: 'Passage automatique en validation'
            }
          ] : []
        }
      };

      console.log('Données à envoyer à Firestore:', paymentRequest);

      const docRef = await addDoc(collection(db, 'payments'), paymentRequest);

      console.log('Demande de paiement créée avec succès:', docRef.id);

      return {
        id: docRef.id,
        referenceCode,
        ...paymentRequest
      };
    } catch (error) {
      console.error('Erreur lors de la création de la demande de paiement:', error);
      throw error;
    }
  }


  // Créer une demande de virement bancaire
  async createBankTransferRequest(userId, plan, userEmail, bankDetails) {
    return this.createPaymentRequest({
      userId,
      userEmail,
      plan,
      type: PAYMENT_TYPES.BANK_TRANSFER,
      amount: plan.price,
      currency: 'EUR',
      paymentDetails: {
        method: 'Virement bancaire',
        bankDetails,
        description: `Abonnement ${plan.name}`
      }
    });
  }

  // Créer une demande de carte cadeau
  async createGiftCardRequest(userId, plan, userEmail, giftCardData) {
    const paymentRequest = await this.createPaymentRequest({
      userId,
      userEmail,
      plan,
      type: PAYMENT_TYPES.GIFT_CARD,
      status: PAYMENT_STATUS.VALIDATING, // Passer directement en validation au lieu de faire un update
      amount: plan.price,
      currency: 'EUR',
      paymentDetails: {
        method: 'Carte cadeau',
        cardType: giftCardData.type,
        cardCode: giftCardData.code,
        description: `Abonnement ${plan.name} - ${giftCardData.typeName}`
      }
    });

    return paymentRequest;
  }

  // Mettre à jour le statut d'un paiement
  async updatePaymentStatus(paymentId, newStatus, adminNote = null) {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (adminNote) {
        updateData.adminNote = adminNote;
      }

      // Ajouter une notification de changement de statut
      const payment = await this.getPaymentById(paymentId);
      if (payment) {
        updateData['notifications.statusUpdates'] = [
          ...(payment.notifications?.statusUpdates || []),
          {
            status: newStatus,
            timestamp: new Date(),
            note: adminNote
          }
        ];
      }

      await updateDoc(paymentRef, updateData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  // Récupérer un paiement par ID
  async getPaymentById(paymentId) {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const paymentSnap = await getDoc(paymentRef);

      if (paymentSnap.exists()) {
        return {
          id: paymentSnap.id,
          ...paymentSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du paiement:', error);
      throw error;
    }
  }

  // Récupérer un paiement par code de référence
  async getPaymentByReference(referenceCode) {
    try {
      const q = query(
        collection(db, 'payments'),
        where('referenceCode', '==', referenceCode)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération par référence:', error);
      throw error;
    }
  }

  // Récupérer les paiements d'un utilisateur
  async getUserPayments(userId) {
    try {
      // Requête simplifiée sans orderBy pour éviter l'erreur d'index
      const q = query(
        collection(db, 'payments'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      const payments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Tri côté client par date de création (plus récent en premier)
      return payments.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements utilisateur:', error);
      throw error;
    }
  }

  // Écouter les changements de statut d'un paiement
  listenToPaymentStatus(paymentId, callback) {
    const paymentRef = doc(db, 'payments', paymentId);

    return onSnapshot(paymentRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      }
    });
  }

  // Récupérer tous les paiements pour l'admin
  async getAllPayments() {
    try {
      // Requête simplifiée sans orderBy pour éviter l'erreur d'index
      const querySnapshot = await getDocs(collection(db, 'payments'));

      const payments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Tri côté client par date de création (plus récent en premier)
      return payments.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les paiements:', error);
      throw error;
    }
  }

  // Écouter tous les paiements pour l'admin
  listenToAllPayments(callback) {
    // Écoute simplifiée sans orderBy pour éviter l'erreur d'index
    return onSnapshot(collection(db, 'payments'), (querySnapshot) => {
      const payments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Tri côté client par date de création (plus récent en premier)
      const sortedPayments = payments.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });

      callback(sortedPayments);
    });
  }

  // Marquer un paiement comme expiré
  async expirePayment(paymentId) {
    return this.updatePaymentStatus(paymentId, PAYMENT_STATUS.EXPIRED, 'Paiement expiré');
  }

  // Approuver un paiement
  async approvePayment(paymentId, adminNote = 'Paiement approuvé') {
    return this.updatePaymentStatus(paymentId, PAYMENT_STATUS.COMPLETED, adminNote);
  }

  // Rejeter un paiement
  async rejectPayment(paymentId, adminNote = 'Paiement rejeté') {
    return this.updatePaymentStatus(paymentId, PAYMENT_STATUS.REJECTED, adminNote);
  }

  // Formater le statut pour l'affichage
  getStatusDisplay(status) {
    const statusMap = {
      [PAYMENT_STATUS.PENDING]: { text: 'En attente', color: 'yellow', icon: '⏳' },
      [PAYMENT_STATUS.WAITING_PAYMENT]: { text: 'En attente de paiement', color: 'blue', icon: '💳' },
      [PAYMENT_STATUS.VALIDATING]: { text: 'En cours de validation', color: 'orange', icon: '🔍' },
      [PAYMENT_STATUS.COMPLETED]: { text: 'Terminé', color: 'green', icon: '✅' },
      [PAYMENT_STATUS.REJECTED]: { text: 'Rejeté', color: 'red', icon: '❌' },
      [PAYMENT_STATUS.EXPIRED]: { text: 'Expiré', color: 'gray', icon: '⏰' }
    };

    return statusMap[status] || { text: 'Inconnu', color: 'gray', icon: '❓' };
  }
}

export const paymentService = new PaymentService();
export default paymentService;

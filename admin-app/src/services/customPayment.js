import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';

class CustomPaymentService {
  constructor() {
    this.paymentMethods = {
      paypal: 'PayPal',
      bank_transfer: 'Virement Bancaire',
      gift_card: 'Carte Cadeau',
      coupon: 'Coupon de Réduction'
    };
  }

  // Créer une demande de paiement
  async createPaymentRequest(userId, planData, paymentMethod, paymentDetails) {
    try {
      const paymentRequest = {
        userId,
        userEmail: paymentDetails.userEmail || '',
        userName: paymentDetails.userName || '',
        
        // Détails du plan
        planId: planData.id,
        planName: planData.name,
        planPrice: planData.price,
        planFeatures: planData.features || [],
        
        // Méthode de paiement
        paymentMethod,
        paymentMethodName: this.paymentMethods[paymentMethod],
        
        // Détails spécifiques selon la méthode
        paymentDetails: this.sanitizePaymentDetails(paymentMethod, paymentDetails),
        
        // Statut et timestamps
        status: 'pending', // pending, approved, rejected, expired
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Référence unique
        reference: this.generatePaymentReference(userId, planData.id),
        
        // Informations admin
        adminNotes: '',
        processedBy: null,
        processedAt: null
      };

      const docRef = await addDoc(collection(db, 'paymentRequests'), paymentRequest);
      
      console.log('💳 Demande de paiement créée:', docRef.id);
      return {
        success: true,
        paymentRequestId: docRef.id,
        reference: paymentRequest.reference
      };
    } catch (error) {
      console.error('Erreur lors de la création de la demande de paiement:', error);
      throw error;
    }
  }

  // Nettoyer les détails de paiement selon la méthode
  sanitizePaymentDetails(method, details) {
    switch (method) {
      case 'paypal':
        return {
          email: details.paypalEmail,
          type: 'paypal'
        };
      
      case 'bank_transfer':
        return {
          accountHolder: details.accountHolder,
          type: 'bank_transfer',
          instructions: 'Virement à effectuer sous 48h'
        };
      
      case 'gift_card':
        return {
          giftCardCode: details.giftCardCode,
          type: 'gift_card'
        };
      
      case 'coupon':
        return {
          couponCode: details.couponCode,
          type: 'coupon'
        };
      
      default:
        return details;
    }
  }

  // Générer une référence de paiement unique
  generatePaymentReference(userId, planId) {
    const timestamp = Date.now().toString(36);
    const userPart = userId.slice(-6);
    const planPart = planId.toUpperCase().slice(0, 3);
    return `${planPart}-${userPart}-${timestamp}`.toUpperCase();
  }

  // Valider un code de carte cadeau
  async validateGiftCard(giftCardCode) {
    try {
      const giftCardsQuery = query(
        collection(db, 'giftCards'),
        where('code', '==', giftCardCode),
        where('isUsed', '==', false),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(giftCardsQuery);
      
      if (snapshot.empty) {
        return {
          valid: false,
          message: 'Code de carte cadeau invalide ou déjà utilisé'
        };
      }

      const giftCard = snapshot.docs[0].data();
      
      // Vérifier la date d'expiration
      if (giftCard.expiresAt && giftCard.expiresAt.toDate() < new Date()) {
        return {
          valid: false,
          message: 'Cette carte cadeau a expiré'
        };
      }

      return {
        valid: true,
        value: giftCard.value,
        planId: giftCard.planId,
        message: 'Carte cadeau valide'
      };
    } catch (error) {
      console.error('Erreur lors de la validation de la carte cadeau:', error);
      return {
        valid: false,
        message: 'Erreur lors de la validation'
      };
    }
  }

  // Valider un coupon de réduction
  async validateCoupon(couponCode) {
    try {
      const couponsQuery = query(
        collection(db, 'coupons'),
        where('code', '==', couponCode),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(couponsQuery);
      
      if (snapshot.empty) {
        return {
          valid: false,
          message: 'Code coupon invalide'
        };
      }

      const coupon = snapshot.docs[0].data();
      
      // Vérifier la date d'expiration
      if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
        return {
          valid: false,
          message: 'Ce coupon a expiré'
        };
      }

      // Vérifier le nombre d'utilisations
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return {
          valid: false,
          message: 'Ce coupon a atteint sa limite d\'utilisation'
        };
      }

      return {
        valid: true,
        discountType: coupon.discountType, // 'percentage' ou 'fixed'
        discountValue: coupon.discountValue,
        planId: coupon.applicablePlans || null,
        message: 'Coupon valide'
      };
    } catch (error) {
      console.error('Erreur lors de la validation du coupon:', error);
      return {
        valid: false,
        message: 'Erreur lors de la validation'
      };
    }
  }

  // Traiter un paiement selon la méthode
  async processPayment(paymentRequestId, method, details) {
    try {
      switch (method) {
        case 'paypal':
          return await this.processPayPalPayment(paymentRequestId, details);
        
        case 'bank_transfer':
          return await this.processBankTransfer(paymentRequestId, details);
        
        case 'gift_card':
          return await this.processGiftCardPayment(paymentRequestId, details);
        
        case 'coupon':
          return await this.processCouponPayment(paymentRequestId, details);
        
        default:
          throw new Error('Méthode de paiement non supportée');
      }
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      throw error;
    }
  }

  // Traitement PayPal (simulation)
  async processPayPalPayment(paymentRequestId, details) {
    // Simulation d'un appel API PayPal
    return {
      success: true,
      transactionId: `PP_${Date.now()}`,
      message: 'Paiement PayPal en cours de traitement',
      nextStep: 'redirect_to_paypal'
    };
  }

  // Traitement virement bancaire
  async processBankTransfer(paymentRequestId, details) {
    // Marquer comme en attente de virement
    await updateDoc(doc(db, 'paymentRequests', paymentRequestId), {
      status: 'awaiting_transfer',
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Instructions de virement envoyées',
      nextStep: 'await_transfer'
    };
  }

  // Traitement carte cadeau
  async processGiftCardPayment(paymentRequestId, details) {
    const validation = await this.validateGiftCard(details.giftCardCode);
    
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Marquer la carte comme utilisée
    const giftCardsQuery = query(
      collection(db, 'giftCards'),
      where('code', '==', details.giftCardCode)
    );
    const snapshot = await getDocs(giftCardsQuery);
    
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, {
        isUsed: true,
        usedAt: serverTimestamp(),
        usedBy: details.userId
      });
    }

    return {
      success: true,
      message: 'Carte cadeau validée avec succès',
      nextStep: 'activate_subscription'
    };
  }

  // Traitement coupon
  async processCouponPayment(paymentRequestId, details) {
    const validation = await this.validateCoupon(details.couponCode);
    
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Incrémenter le compteur d'utilisation du coupon
    const couponsQuery = query(
      collection(db, 'coupons'),
      where('code', '==', details.couponCode)
    );
    const snapshot = await getDocs(couponsQuery);
    
    if (!snapshot.empty) {
      const couponDoc = snapshot.docs[0];
      const currentCount = couponDoc.data().usedCount || 0;
      await updateDoc(couponDoc.ref, {
        usedCount: currentCount + 1,
        lastUsedAt: serverTimestamp()
      });
    }

    return {
      success: true,
      discount: validation,
      message: 'Coupon appliqué avec succès',
      nextStep: 'activate_subscription'
    };
  }

  // Obtenir l'historique des paiements d'un utilisateur
  async getUserPaymentHistory(userId) {
    try {
      const paymentsQuery = query(
        collection(db, 'paymentRequests'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(paymentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }
}

export const customPaymentService = new CustomPaymentService();
export default customPaymentService;

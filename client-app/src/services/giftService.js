import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';

const giftService = {
  // Envoyer un code cadeau
  async sendGift(giftData) {
    try {
      const { userId, userName, voucherType, code, amount } = giftData;
      
      const newGift = {
        userId,
        userName,
        voucherType,
        code,
        amount: amount || null,
        status: 'pending', // pending, validated, rejected
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: 'gift_voucher'
      };

      const docRef = await addDoc(collection(db, 'gifts'), newGift);
      console.log('🎁 Cadeau envoyé avec succès:', docRef.id);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du cadeau:', error);
      throw error;
    }
  },

  // Écouter les cadeaux d'un utilisateur (pour historique par exemple)
  listenToUserGifts(userId, callback) {
    const q = query(
      collection(db, 'gifts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const gifts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(gifts);
    });
  }
};

export default giftService;

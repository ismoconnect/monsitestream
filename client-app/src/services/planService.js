import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

class PlanService {
  // Récupérer tous les plans une seule fois
  async getPlans() {
    try {
      const q = query(collection(db, 'plans'), orderBy('level', 'asc'));
      const querySnapshot = await getDocs(q);
      const plans = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== '_init' && doc.id !== 'init') {
          plans.push({ id: doc.id, ...doc.data() });
        }
      });
      return plans;
    } catch (error) {
      console.error('Erreur lors de la récupération des plans:', error);
      return [];
    }
  }

  // Écouter les changements des plans en temps réel
  onPlansSnapshot(callback) {
    try {
      const q = query(collection(db, 'plans'), orderBy('level', 'asc'));
      return onSnapshot(q, (querySnapshot) => {
        const plans = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== '_init' && doc.id !== 'init') {
            plans.push({ id: doc.id, ...doc.data() });
          }
        });
        callback(plans);
      }, (error) => {
        console.error('Erreur Firebase onSnapshot (plans):', error);
        callback([]);
      });
    } catch (error) {
      console.error("Erreur lors de l'écoute des plans:", error);
      callback([]);
      return () => {};
    }
  }

  // Initialiser ou mettre à jour les plans par défaut
  async seedDefaultPlans() {
    const defaultPlans = [
      {
        id: 'basic',
        name: 'Pass Standard',
        price: 0,
        level: 0,
        isActive: true,
        isPopular: false,
        features: [
          '50 CRÉDITS MESSAGES / Mois',
          'Accès Galerie Publique',
          'Profil Voyageur'
        ]
      },
      {
        id: 'premium',
        name: 'Premium Pass',
        price: 49,
        level: 1,
        isActive: true,
        isPopular: true,
        features: [
          '1000 CRÉDITS MESSAGES / Mois',
          'Galerie HD Privée',
          'Chat Prioritaire 24/7',
          'Photos exclusives'
        ]
      },
      {
        id: 'vip',
        name: 'Elite VIP',
        price: 199,
        level: 2,
        isActive: true,
        isPopular: false,
        features: [
          'MESSAGES ILLIMITÉS',
          'Appels Vidéo Privés',
          'WhatsApp Direct',
          'Contenus sur Mesure'
        ]
      }
    ];

    try {
      for (const plan of defaultPlans) {
        const planRef = doc(db, 'plans', plan.id);
        await setDoc(planRef, {
          name: plan.name,
          price: plan.price,
          level: plan.level,
          isActive: plan.isActive,
          isPopular: plan.isPopular,
          features: plan.features,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      return { success: true, message: 'Plans mis à jour' };
    } catch (error) {
      console.error('Erreur seeding plans:', error);
      throw error;
    }
  }
}

export const planService = new PlanService();

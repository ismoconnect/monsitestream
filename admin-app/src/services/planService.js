import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  orderBy, 
  onSnapshot,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

class PlanService {
  // Récupérer tous les plans
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

  // Écouter les plans en temps réel
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

  // Créer un plan
  async createPlan(planData) {
    try {
      const docRef = await addDoc(collection(db, 'plans'), {
        ...planData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erreur création plan:', error);
      throw error;
    }
  }

  // Mettre à jour un plan
  async updatePlan(planId, planData) {
    try {
      const planRef = doc(db, 'plans', planId);
      await updateDoc(planRef, {
        ...planData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour plan:', error);
      throw error;
    }
  }

  // Supprimer un plan
  async deletePlan(planId) {
    try {
      await deleteDoc(doc(db, 'plans', planId));
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression plan:', error);
      throw error;
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

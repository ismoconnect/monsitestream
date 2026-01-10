import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc,
  collectionGroup,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

class AdminService {
  // --- GESTION DES RENDEZ-VOUS (NOUVEAU) ---

  // Récupérer tous les RDV de tous les utilisateurs (Collection Group)
  async getAllAppointments(limitCount = 50) {
    try {
      const q = query(
        collectionGroup(db, 'appointments'),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const appointments = [];

      querySnapshot.forEach((doc) => {
        // Ignorer les documents d'initialisation s'il y en a
        if (doc.id !== '_init' && doc.id !== 'init') {
          appointments.push({
            id: doc.id,
            ...doc.data(),
            // L'ID du parent (userId) est utile pour les actions
            userId: doc.ref.parent.parent.id
          });
        }
      });

      return appointments;
    } catch (error) {
      console.error('Erreur lors de la récupération globale des RDV:', error);
      // Fallback si l'index n'existe pas encore ou erreur de permission
      return [];
    }
  }

  // Valider un RDV
  async confirmAppointment(userId, appointmentId) {
    try {
      const rdvRef = doc(db, 'users', userId, 'appointments', appointmentId);
      await updateDoc(rdvRef, {
        status: 'confirmed',
        confirmedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur validation RDV:', error);
      throw error;
    }
  }

  // Annuler un RDV
  async cancelAppointment(userId, appointmentId, reason = '') {
    try {
      const rdvRef = doc(db, 'users', userId, 'appointments', appointmentId);
      await updateDoc(rdvRef, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur annulation RDV:', error);
      throw error;
    }
  }

  // Terminer un RDV
  async completeAppointment(userId, appointmentId) {
    try {
      const rdvRef = doc(db, 'users', userId, 'appointments', appointmentId);
      await updateDoc(rdvRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur finalisation RDV:', error);
      throw error;
    }
  }

  // --- FIN GESTION RDV ---
  // Obtenir toutes les demandes d'abonnement en attente (requête simplifiée)
  async getPendingSubscriptions() {
    try {
      // Requête simple sans orderBy pour éviter les index composites
      const q = query(
        collection(db, 'users'),
        where('subscription.status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Trier côté client pour éviter l'index composite
      return users.sort((a, b) => {
        const aDate = a.subscription?.requestedAt?.toDate?.() || new Date(0);
        const bDate = b.subscription?.requestedAt?.toDate?.() || new Date(0);
        return bDate - aDate;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      return [];
    }
  }

  // Obtenir tous les utilisateurs avec filtres (version ultra-simplifiée)
  async getAllUsers(filters = {}) {
    try {
      // Récupérer tous les utilisateurs sans filtre Firestore
      const querySnapshot = await getDocs(collection(db, 'users'));
      let users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Appliquer les filtres côté client
      if (filters.status) {
        users = users.filter(u => u.subscription?.status === filters.status);
      }

      if (filters.plan) {
        users = users.filter(u => u.subscription?.plan === filters.plan);
      }

      // Trier côté client par date de création
      return users.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(0);
        const bDate = b.createdAt?.toDate?.() || new Date(0);
        return bDate - aDate;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }

  // Valider un compte utilisateur (sans abonnement premium)
  async validateAccount(userId, adminId) {
    try {
      const updateData = {
        'subscription.status': 'active',
        'subscription.validatedAt': serverTimestamp(),
        'subscription.validatedBy': adminId,
        'isActive': true,
        'updatedAt': serverTimestamp()
      };

      await updateDoc(doc(db, 'users', userId), updateData);

      // Enregistrer l'action dans les logs d'administration
      await this.logAdminAction(adminId, 'validate_account', {
        userId
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la validation du compte:', error);
      throw new Error('Erreur lors de la validation du compte');
    }
  }

  // Valider un abonnement (legacy - pour compatibilité)
  async validateSubscription(userId, adminId, validationData = {}) {
    try {
      const { plan, duration = 30 } = validationData; // durée en jours

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + duration);

      const updateData = {
        'subscription.status': 'active',
        'subscription.validatedAt': serverTimestamp(),
        'subscription.validatedBy': adminId,
        'subscription.expiresAt': expirationDate,
        'isActive': true,
        'updatedAt': serverTimestamp()
      };

      if (plan) {
        updateData['subscription.plan'] = plan;
      }

      await updateDoc(doc(db, 'users', userId), updateData);

      // Enregistrer l'action dans les logs d'administration
      await this.logAdminAction(adminId, 'validate_subscription', {
        userId,
        plan: plan || 'unchanged',
        duration
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la validation de l\'abonnement:', error);
      throw new Error('Erreur lors de la validation de l\'abonnement');
    }
  }

  // Rejeter un abonnement
  async rejectSubscription(userId, adminId, reason = '') {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'subscription.status': 'rejected',
        'subscription.rejectedAt': serverTimestamp(),
        'subscription.rejectedBy': adminId,
        'subscription.rejectionReason': reason,
        'isActive': false,
        'updatedAt': serverTimestamp()
      });

      // Enregistrer l'action dans les logs
      await this.logAdminAction(adminId, 'reject_subscription', {
        userId,
        reason
      });

      return true;
    } catch (error) {
      console.error('Erreur lors du rejet de l\'abonnement:', error);
      throw new Error('Erreur lors du rejet de l\'abonnement');
    }
  }

  // Suspendre un utilisateur
  async suspendUser(userId, adminId, reason = '') {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'subscription.status': 'suspended',
        'subscription.suspendedAt': serverTimestamp(),
        'subscription.suspendedBy': adminId,
        'subscription.suspensionReason': reason,
        'isActive': false,
        'updatedAt': serverTimestamp()
      });

      await this.logAdminAction(adminId, 'suspend_user', {
        userId,
        reason
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la suspension:', error);
      throw new Error('Erreur lors de la suspension de l\'utilisateur');
    }
  }

  // Réactiver un utilisateur
  async reactivateUser(userId, adminId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'subscription.status': 'active',
        'subscription.reactivatedAt': serverTimestamp(),
        'subscription.reactivatedBy': adminId,
        'isActive': true,
        'updatedAt': serverTimestamp()
      });

      await this.logAdminAction(adminId, 'reactivate_user', {
        userId
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
      throw new Error('Erreur lors de la réactivation de l\'utilisateur');
    }
  }

  // Prolonger un abonnement
  async extendSubscription(userId, adminId, additionalDays) {
    try {
      const userDoc = await doc(db, 'users', userId);
      const userData = await userDoc.get();

      if (!userData.exists()) {
        throw new Error('Utilisateur introuvable');
      }

      const currentExpiration = userData.data().subscription.expiresAt?.toDate() || new Date();
      const newExpiration = new Date(currentExpiration);
      newExpiration.setDate(newExpiration.getDate() + additionalDays);

      await updateDoc(userDoc, {
        'subscription.expiresAt': newExpiration,
        'subscription.extendedAt': serverTimestamp(),
        'subscription.extendedBy': adminId,
        'updatedAt': serverTimestamp()
      });

      await this.logAdminAction(adminId, 'extend_subscription', {
        userId,
        additionalDays,
        newExpiration: newExpiration.toISOString()
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la prolongation:', error);
      throw new Error('Erreur lors de la prolongation de l\'abonnement');
    }
  }

  // Changer le plan d'un utilisateur
  async changeUserPlan(userId, adminId, newPlan) {
    if (!userId || !newPlan) throw new Error('ID utilisateur ou plan manquant');

    try {
      const planNames = {
        'basic': 'Accès Basic',
        'premium': 'Premium VIP',
        'vip': 'VIP Elite'
      };

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const currentData = userSnap.data();
      const currentSubscription = currentData.subscription || {};

      // Mise à jour de l'objet complet pour éviter les erreurs sur champs manquants
      await updateDoc(userRef, {
        'subscription': {
          ...currentSubscription,
          plan: newPlan,
          type: newPlan,
          planName: planNames[newPlan] || newPlan,
          planChangedAt: new Date(),
          planChangedBy: adminId || 'admin',
          status: currentSubscription.status || 'active'
        },
        'role': newPlan === 'vip' ? 'vip' : 'client',
        'updatedAt': serverTimestamp()
      });

      // Log de l'action
      try {
        await this.logAdminAction(adminId || 'admin', 'change_plan', {
          userId,
          newPlan,
          targetEmail: currentData.email || userId
        });
      } catch (logError) {
        console.warn('Erreur logAdminAction:', logError);
      }

      return true;
    } catch (error) {
      console.error('Erreur changement de plan:', error);
      throw error;
    }
  }

  // Obtenir les statistiques d'administration (version simplifiée)
  async getAdminStats() {
    try {
      // Récupérer tous les utilisateurs sans filtre pour éviter les index
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = querySnapshot.docs.map(doc => doc.data());

      const stats = {
        total: users.length,
        pending: users.filter(u => u.subscription?.status === 'pending').length,
        active: users.filter(u => u.subscription?.status === 'active').length,
        suspended: users.filter(u => u.subscription?.status === 'suspended').length,
        rejected: users.filter(u => u.subscription?.status === 'rejected').length,
        byPlan: {
          free: users.filter(u => u.subscription?.plan === 'free').length,
          basic: users.filter(u => u.subscription?.plan === 'basic').length,
          premium: users.filter(u => u.subscription?.plan === 'premium').length,
          vip: users.filter(u => u.subscription?.plan === 'vip').length
        },
        recentRegistrations: users.filter(u => {
          const createdAt = u.createdAt?.toDate?.();
          if (!createdAt) return false;
          const daysDiff = (new Date() - createdAt) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        total: 0,
        pending: 0,
        active: 0,
        suspended: 0,
        rejected: 0,
        byPlan: { free: 0, basic: 0, premium: 0, vip: 0 },
        recentRegistrations: 0
      };
    }
  }

  // Enregistrer une action d'administration
  async logAdminAction(adminId, action, details = {}) {
    try {
      await addDoc(collection(db, 'admin_logs'), {
        adminId,
        action,
        details,
        timestamp: serverTimestamp(),
        ip: 'unknown', // En production, récupérer l'IP réelle
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du log:', error);
    }
  }

  // Obtenir les logs d'administration (version simplifiée)
  async getAdminLogs(limit = 100) {
    try {
      // Récupérer tous les logs sans orderBy
      const querySnapshot = await getDocs(collection(db, 'admin_logs'));
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Trier côté client et limiter
      return logs
        .sort((a, b) => {
          const aDate = a.timestamp?.toDate?.() || new Date(0);
          const bDate = b.timestamp?.toDate?.() || new Date(0);
          return bDate - aDate;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      return [];
    }
  }

  // Envoyer une notification à un utilisateur
  async sendNotificationToUser(userId, adminId, notification) {
    try {
      const notificationData = {
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        isRead: false,
        sentBy: adminId,
        sentAt: serverTimestamp()
      };

      await addDoc(
        collection(db, 'users', userId, 'notifications'),
        notificationData
      );

      await this.logAdminAction(adminId, 'send_notification', {
        userId,
        notificationType: notification.type,
        title: notification.title
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      throw new Error('Erreur lors de l\'envoi de la notification');
    }
  }
}

export const adminService = new AdminService();
export default adminService;

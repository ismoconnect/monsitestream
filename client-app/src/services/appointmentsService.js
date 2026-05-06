import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  where, 
  serverTimestamp, 
  updateDoc,
  onSnapshot,
  limit,
  increment,
  Timestamp
} from 'firebase/firestore';

class AppointmentsService {
  // Créer un nouveau rendez-vous
  async createAppointment(userId, appointmentData) {
    try {
      const appointmentDoc = {
        userId,
        clientName: appointmentData.clientName,
        clientEmail: appointmentData.clientEmail,
        clientPhone: appointmentData.clientPhone,
        service: appointmentData.service, // massage, escort, companionship, etc.
        date: appointmentData.date, // Date du RDV
        time: appointmentData.time, // Heure du RDV
        duration: appointmentData.duration || 60, // Durée en minutes
        location: appointmentData.location, // Lieu du RDV
        price: appointmentData.price, // Prix convenu
        currency: appointmentData.currency || 'EUR',
        status: 'pending', // pending, confirmed, cancelled, completed
        paymentStatus: 'pending', // pending, paid, refunded
        notes: appointmentData.notes || '',
        specialRequests: appointmentData.specialRequests || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        confirmedAt: null,
        completedAt: null
      };

      const docRef = await addDoc(collection(db, 'users', userId, 'appointments'), appointmentDoc);
      
      // Incrémenter le compteur de rendez-vous
      await this.incrementAppointmentCounter(userId);
      
      return {
        success: true,
        appointmentId: docRef.id,
        message: 'Rendez-vous créé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      throw new Error('Erreur lors de la création du rendez-vous');
    }
  }

  // Récupérer tous les rendez-vous d'un utilisateur
  async getUserAppointments(userId, filters = {}) {
    try {
      let q = collection(db, 'users', userId, 'appointments');
      
      // Appliquer les filtres
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.service) {
        q = query(q, where('service', '==', filters.service));
      }
      if (filters.paymentStatus) {
        q = query(q, where('paymentStatus', '==', filters.paymentStatus));
      }
      
      // Trier par date de rendez-vous (plus récent en premier)
      q = query(q, orderBy('date', 'desc'));
      
      // Limiter le nombre de résultats si spécifié
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const appointments = [];
      
      querySnapshot.forEach((doc) => {
        // Ignorer les documents d'initialisation
        if (doc.id !== '_init' && doc.id !== 'init') {
          appointments.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });

      return appointments;
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      throw new Error('Erreur lors de la récupération des rendez-vous');
    }
  }

  // Écouter les rendez-vous en temps réel
  onAppointmentsSnapshot(userId, callback, filters = {}) {
    try {
      let q = collection(db, 'users', userId, 'appointments');
      
      // Appliquer les filtres
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.service) {
        q = query(q, where('service', '==', filters.service));
      }
      
      // Trier par date de rendez-vous
      q = query(q, orderBy('date', 'desc'));
      
      // Limiter le nombre de résultats si spécifié
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      return onSnapshot(q, (querySnapshot) => {
        const appointments = [];
        querySnapshot.forEach((doc) => {
          // Ignorer les documents d'initialisation
          if (doc.id !== '_init' && doc.id !== 'init') {
            appointments.push({
              id: doc.id,
              ...doc.data()
            });
          }
        });
        callback(appointments);
      });
    } catch (error) {
      console.error('Erreur lors de l\'écoute des rendez-vous:', error);
      throw new Error('Erreur lors de l\'écoute des rendez-vous');
    }
  }

  // Confirmer un rendez-vous
  async confirmAppointment(userId, appointmentId) {
    try {
      const appointmentRef = doc(db, 'users', userId, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'confirmed',
        confirmedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Rendez-vous confirmé' };
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      throw new Error('Erreur lors de la confirmation');
    }
  }

  // Annuler un rendez-vous
  async cancelAppointment(userId, appointmentId, reason = '') {
    try {
      const appointmentRef = doc(db, 'users', userId, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Rendez-vous annulé' };
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      throw new Error('Erreur lors de l\'annulation');
    }
  }

  // Marquer un rendez-vous comme terminé
  async completeAppointment(userId, appointmentId, feedback = '') {
    try {
      const appointmentRef = doc(db, 'users', userId, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'completed',
        feedback,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Rendez-vous marqué comme terminé' };
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      throw new Error('Erreur lors de la finalisation');
    }
  }

  // Mettre à jour le statut de paiement
  async updatePaymentStatus(userId, appointmentId, paymentStatus, paymentDetails = {}) {
    try {
      const appointmentRef = doc(db, 'users', userId, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        paymentStatus,
        paymentDetails,
        paidAt: paymentStatus === 'paid' ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Statut de paiement mis à jour' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      throw new Error('Erreur lors de la mise à jour du paiement');
    }
  }

  // Incrémenter le compteur de rendez-vous
  async incrementAppointmentCounter(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'stats.appointments': increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation du compteur:', error);
    }
  }

  // Obtenir les statistiques des rendez-vous
  async getAppointmentStats(userId) {
    try {
      const appointments = await this.getUserAppointments(userId);
      
      const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        unpaid: appointments.filter(a => a.paymentStatus === 'pending').length
      };
      
      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des stats:', error);
      return { total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0, unpaid: 0 };
    }
  }

  // Obtenir les prochains rendez-vous
  async getUpcomingAppointments(userId, limit = 5) {
    try {
      const now = Timestamp.now();
      let q = collection(db, 'users', userId, 'appointments');
      
      q = query(
        q, 
        where('date', '>=', now),
        where('status', 'in', ['pending', 'confirmed']),
        orderBy('date', 'asc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      const appointments = [];
      
      querySnapshot.forEach((doc) => {
        // Ignorer les documents d'initialisation
        if (doc.id !== '_init' && doc.id !== 'init') {
          appointments.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });

      return appointments;
    } catch (error) {
      console.error('Erreur lors de la récupération des prochains RDV:', error);
      return [];
    }
  }
}

export const appointmentsService = new AppointmentsService();

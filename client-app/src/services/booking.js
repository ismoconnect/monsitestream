// Booking and Appointment Service
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

class BookingService {
  constructor() {
    this.timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00'
    ];
  }

  // Create appointment
  async createAppointment(appointmentData) {
    try {
      // Validate appointment data
      const validation = await this.validateAppointment(appointmentData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Check availability
      const isAvailable = await this.checkAvailability(
        appointmentData.providerId,
        appointmentData.date,
        appointmentData.timeSlot
      );

      if (!isAvailable) {
        throw new Error('Ce créneau n\'est plus disponible');
      }

      // Create appointment document
      const appointment = {
        ...appointmentData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const appointmentRef = await addDoc(collection(db, 'appointments'), appointment);

      // Send confirmation email
      await this.sendConfirmationEmail(appointmentRef.id);

      return appointmentRef.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  // Validate appointment data
  async validateAppointment(appointmentData) {
    const { providerId, clientId, date, timeSlot, duration } = appointmentData;

    // Check required fields
    if (!providerId || !clientId || !date || !timeSlot) {
      return { valid: false, error: 'Tous les champs requis doivent être remplis' };
    }

    // Check if date is in the future
    const appointmentDate = new Date(date);
    const now = new Date();
    if (appointmentDate <= now) {
      return { valid: false, error: 'La date doit être dans le futur' };
    }

    // Check if time slot is valid
    if (!this.timeSlots.includes(timeSlot)) {
      return { valid: false, error: 'Créneau horaire invalide' };
    }

    // Check if provider exists and is active
    const providerDoc = await getDoc(doc(db, 'users', providerId));
    if (!providerDoc.exists()) {
      return { valid: false, error: 'Prestataire introuvable' };
    }

    const providerData = providerDoc.data();
    if (providerData.role !== 'provider' || !providerData.isActive) {
      return { valid: false, error: 'Prestataire non disponible' };
    }

    return { valid: true };
  }

  // Check availability
  async checkAvailability(providerId, date, timeSlot) {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('providerId', '==', providerId),
        where('date', '==', date),
        where('timeSlot', '==', timeSlot),
        where('status', 'in', ['pending', 'confirmed'])
      );

      const snapshot = await getDocs(appointmentsQuery);
      return snapshot.empty;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  // Get available time slots for a provider on a specific date
  async getAvailableTimeSlots(providerId, date) {
    try {
      // Get provider's working hours
      const providerDoc = await getDoc(doc(db, 'users', providerId));
      if (!providerDoc.exists()) {
        return [];
      }

      const providerData = providerDoc.data();
      const workingHours = providerData.workingHours || {
        start: '09:00',
        end: '19:00',
        days: [1, 2, 3, 4, 5] // Monday to Friday
      };

      // Check if the date is a working day
      const appointmentDate = new Date(date);
      const dayOfWeek = appointmentDate.getDay();
      if (!workingHours.days.includes(dayOfWeek)) {
        return [];
      }

      // Get booked time slots
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('providerId', '==', providerId),
        where('date', '==', date),
        where('status', 'in', ['pending', 'confirmed'])
      );

      const snapshot = await getDocs(appointmentsQuery);
      const bookedSlots = snapshot.docs.map(doc => doc.data().timeSlot);

      // Filter available slots
      const availableSlots = this.timeSlots.filter(slot => {
        // Check if slot is within working hours
        if (slot < workingHours.start || slot >= workingHours.end) {
          return false;
        }

        // Check if slot is not booked
        return !bookedSlots.includes(slot);
      });

      return availableSlots;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      return [];
    }
  }

  // Get provider's calendar for a date range
  async getProviderCalendar(providerId, startDate, endDate) {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('providerId', '==', providerId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc'),
        orderBy('timeSlot', 'asc')
      );

      const snapshot = await getDocs(appointmentsQuery);
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Group appointments by date
      const calendar = {};
      appointments.forEach(appointment => {
        const date = appointment.date;
        if (!calendar[date]) {
          calendar[date] = [];
        }
        calendar[date].push(appointment);
      });

      return calendar;
    } catch (error) {
      console.error('Error getting provider calendar:', error);
      return {};
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status, notes = '') {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      const updateData = {
        status,
        updatedAt: serverTimestamp()
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (status === 'confirmed') {
        updateData.confirmedAt = serverTimestamp();
      } else if (status === 'completed') {
        updateData.completedAt = serverTimestamp();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = serverTimestamp();
      }

      await updateDoc(appointmentRef, updateData);

      // Send notification
      await this.sendStatusNotification(appointmentId, status);

      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId, reason = '') {
    try {
      const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
      if (!appointmentDoc.exists()) {
        throw new Error('Rendez-vous introuvable');
      }

      const appointmentData = appointmentDoc.data();
      
      // Check if appointment can be cancelled
      const appointmentDate = new Date(appointmentData.date);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);

      if (hoursUntilAppointment < 24) {
        throw new Error('Impossible d\'annuler moins de 24h avant le rendez-vous');
      }

      await this.updateAppointmentStatus(appointmentId, 'cancelled', reason);
      return true;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  // Reschedule appointment
  async rescheduleAppointment(appointmentId, newDate, newTimeSlot) {
    try {
      const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
      if (!appointmentDoc.exists()) {
        throw new Error('Rendez-vous introuvable');
      }

      const appointmentData = appointmentDoc.data();

      // Check availability for new slot
      const isAvailable = await this.checkAvailability(
        appointmentData.providerId,
        newDate,
        newTimeSlot
      );

      if (!isAvailable) {
        throw new Error('Ce créneau n\'est plus disponible');
      }

      // Update appointment
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        date: newDate,
        timeSlot: newTimeSlot,
        status: 'pending',
        rescheduledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Send reschedule notification
      await this.sendRescheduleNotification(appointmentId, newDate, newTimeSlot);

      return true;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  // Get user appointments
  async getUserAppointments(userId, userRole = 'client', status = null, limitCount = 50) {
    try {
      let appointmentsQuery;

      if (userRole === 'client') {
        appointmentsQuery = query(
          collection(db, 'appointments'),
          where('clientId', '==', userId),
          orderBy('date', 'desc'),
          orderBy('timeSlot', 'desc'),
          limit(limitCount)
        );
      } else if (userRole === 'provider') {
        appointmentsQuery = query(
          collection(db, 'appointments'),
          where('providerId', '==', userId),
          orderBy('date', 'desc'),
          orderBy('timeSlot', 'desc'),
          limit(limitCount)
        );
      } else {
        throw new Error('Rôle utilisateur invalide');
      }

      // Add status filter if provided
      if (status) {
        appointmentsQuery = query(
          appointmentsQuery,
          where('status', '==', status)
        );
      }

      const snapshot = await getDocs(appointmentsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user appointments:', error);
      return [];
    }
  }

  // Get upcoming appointments
  async getUpcomingAppointments(userId, userRole = 'client', days = 7) {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      const appointments = await this.getUserAppointments(userId, userRole);
      
      return appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= now && 
               appointmentDate <= futureDate && 
               ['pending', 'confirmed'].includes(appointment.status);
      });
    } catch (error) {
      console.error('Error getting upcoming appointments:', error);
      return [];
    }
  }

  // Send confirmation email
  async sendConfirmationEmail(appointmentId) {
    try {
      const sendEmail = httpsCallable(functions, 'sendAppointmentConfirmation');
      await sendEmail({ appointmentId });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw error as this is not critical
    }
  }

  // Send status notification
  async sendStatusNotification(appointmentId, status) {
    try {
      const sendNotification = httpsCallable(functions, 'sendAppointmentNotification');
      await sendNotification({ appointmentId, status });
    } catch (error) {
      console.error('Error sending status notification:', error);
      // Don't throw error as this is not critical
    }
  }

  // Send reschedule notification
  async sendRescheduleNotification(appointmentId, newDate, newTimeSlot) {
    try {
      const sendNotification = httpsCallable(functions, 'sendRescheduleNotification');
      await sendNotification({ appointmentId, newDate, newTimeSlot });
    } catch (error) {
      console.error('Error sending reschedule notification:', error);
      // Don't throw error as this is not critical
    }
  }

  // Get appointment statistics
  async getAppointmentStats(providerId, startDate, endDate) {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('providerId', '==', providerId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );

      const snapshot = await getDocs(appointmentsQuery);
      const appointments = snapshot.docs.map(doc => doc.data());

      const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length
      };

      return stats;
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
      };
    }
  }

  // Format date for display
  formatDate(date) {
    if (!date) return '';
    
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format time for display
  formatTime(timeSlot) {
    return timeSlot;
  }

  // Get status color
  getStatusColor(status) {
    const colors = {
      pending: 'yellow',
      confirmed: 'green',
      completed: 'blue',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  }

  // Get status text
  getStatusText(status) {
    const texts = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    return texts[status] || status;
  }
}

// Create singleton instance
const bookingService = new BookingService();
export default bookingService;

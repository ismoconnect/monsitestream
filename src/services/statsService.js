import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  increment
} from 'firebase/firestore';
import { messagesService } from './messagesService';
import { appointmentsService } from './appointmentsService';

class StatsService {
  // Récupérer les statistiques complètes d'un utilisateur
  async getUserStats(userId) {
    try {
      // Récupérer les stats de base depuis le document utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      const baseStats = userData.stats || {};
      
      // Récupérer les stats détaillées des messages et rendez-vous
      const [messageStats, appointmentStats] = await Promise.all([
        messagesService.getMessageStats(userId),
        appointmentsService.getAppointmentStats(userId)
      ]);
      
      // Calculer les stats de streaming et galerie (simulées pour l'instant)
      const streamingStats = {
        totalSessions: baseStats.liveSessions || 0,
        totalMinutes: baseStats.streamingMinutes || 0,
        averageSession: baseStats.liveSessions > 0 ? Math.round((baseStats.streamingMinutes || 0) / baseStats.liveSessions) : 0
      };
      
      const galleryStats = {
        totalViews: baseStats.galleryViews || 0,
        totalPhotos: baseStats.galleryPhotos || 0,
        totalVideos: baseStats.galleryVideos || 0
      };
      
      return {
        overview: {
          totalMessages: messageStats.total,
          totalAppointments: appointmentStats.total,
          totalSessions: streamingStats.totalSessions,
          totalGalleryViews: galleryStats.totalViews
        },
        messages: messageStats,
        appointments: appointmentStats,
        streaming: streamingStats,
        gallery: galleryStats,
        profile: {
          memberSince: userData.createdAt,
          lastLogin: userData.lastLoginAt,
          subscriptionPlan: userData.subscription?.plan || 'free',
          subscriptionStatus: userData.subscription?.status || 'inactive'
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      return this.getDefaultStats();
    }
  }
  
  // Statistiques par défaut en cas d'erreur
  getDefaultStats() {
    return {
      overview: {
        totalMessages: 0,
        totalAppointments: 0,
        totalSessions: 0,
        totalGalleryViews: 0
      },
      messages: { total: 0, unread: 0, read: 0, replied: 0, highPriority: 0 },
      appointments: { total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0, unpaid: 0 },
      streaming: { totalSessions: 0, totalMinutes: 0, averageSession: 0 },
      gallery: { totalViews: 0, totalPhotos: 0, totalVideos: 0 },
      profile: {
        memberSince: null,
        lastLogin: null,
        subscriptionPlan: 'free',
        subscriptionStatus: 'inactive'
      }
    };
  }
  
  // Incrémenter les vues de galerie
  async incrementGalleryViews(userId, viewType = 'photo') {
    try {
      const userRef = doc(db, 'users', userId);
      const updates = {
        'stats.galleryViews': increment(1),
        updatedAt: serverTimestamp()
      };
      
      if (viewType === 'photo') {
        updates['stats.galleryPhotos'] = increment(1);
      } else if (viewType === 'video') {
        updates['stats.galleryVideos'] = increment(1);
      }
      
      await updateDoc(userRef, updates);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Incrémenter les sessions de streaming
  async incrementStreamingSessions(userId, minutes = 0) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'stats.liveSessions': increment(1),
        'stats.streamingMinutes': increment(minutes),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des sessions:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Obtenir les activités récentes
  async getRecentActivity(userId, limit = 10) {
    try {
      // Récupérer les messages et rendez-vous récents
      const [recentMessages, recentAppointments] = await Promise.all([
        messagesService.getUserMessages(userId, { limit: 5 }),
        appointmentsService.getUserAppointments(userId, { limit: 5 })
      ]);
      
      // Combiner et trier par date
      const activities = [];
      
      // Ajouter les messages
      recentMessages.forEach(message => {
        activities.push({
          id: `message-${message.id}`,
          type: 'message',
          title: `Nouveau message: ${message.subject}`,
          description: `De ${message.clientName}`,
          date: message.createdAt,
          status: message.status,
          icon: 'message'
        });
      });
      
      // Ajouter les rendez-vous
      recentAppointments.forEach(appointment => {
        activities.push({
          id: `appointment-${appointment.id}`,
          type: 'appointment',
          title: `RDV ${appointment.service}`,
          description: `Avec ${appointment.clientName}`,
          date: appointment.createdAt,
          status: appointment.status,
          icon: 'calendar'
        });
      });
      
      // Trier par date (plus récent en premier) et limiter
      activities.sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date);
        const dateB = b.date?.toDate?.() || new Date(b.date);
        return dateB - dateA;
      });
      
      return activities.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      return [];
    }
  }
}

export const statsService = new StatsService();

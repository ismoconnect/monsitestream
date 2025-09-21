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
  increment
} from 'firebase/firestore';

class MessagesService {
  // Créer un nouveau message/conversation
  async createMessage(userId, messageData) {
    try {
      const messageDoc = {
        userId,
        clientName: messageData.clientName,
        clientEmail: messageData.clientEmail,
        subject: messageData.subject,
        content: messageData.content,
        status: 'unread', // unread, read, replied
        priority: messageData.priority || 'normal', // low, normal, high
        type: messageData.type || 'general', // general, booking, support
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        replies: []
      };

      const docRef = await addDoc(collection(db, 'users', userId, 'messages'), messageDoc);
      
      // Incrémenter le compteur de messages
      await this.incrementMessageCounter(userId);
      
      return {
        success: true,
        messageId: docRef.id,
        message: 'Message créé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création du message:', error);
      throw new Error('Erreur lors de la création du message');
    }
  }

  // Récupérer tous les messages d'un utilisateur
  async getUserMessages(userId, filters = {}) {
    try {
      let q = collection(db, 'users', userId, 'messages');
      
      // Appliquer les filtres
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      
      // Trier par date de création (plus récent en premier)
      q = query(q, orderBy('createdAt', 'desc'));
      
      // Limiter le nombre de résultats si spécifié
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const messages = [];
      
      querySnapshot.forEach((doc) => {
        // Ignorer les documents d'initialisation
        if (doc.id !== '_init' && doc.id !== 'init') {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });

      return messages;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw new Error('Erreur lors de la récupération des messages');
    }
  }

  // Écouter les messages en temps réel
  onMessagesSnapshot(userId, callback, filters = {}) {
    try {
      let q = collection(db, 'users', userId, 'messages');
      
      // Appliquer les filtres
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      
      // Trier par date de création (plus récent en premier)
      q = query(q, orderBy('createdAt', 'desc'));
      
      // Limiter le nombre de résultats si spécifié
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      return onSnapshot(q, (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(messages);
      });
    } catch (error) {
      console.error('Erreur lors de l\'écoute des messages:', error);
      throw new Error('Erreur lors de l\'écoute des messages');
    }
  }

  // Marquer un message comme lu
  async markAsRead(userId, messageId) {
    try {
      const messageRef = doc(db, 'users', userId, 'messages', messageId);
      await updateDoc(messageRef, {
        status: 'read',
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      throw new Error('Erreur lors du marquage comme lu');
    }
  }

  // Répondre à un message
  async replyToMessage(userId, messageId, replyContent) {
    try {
      const messageRef = doc(db, 'users', userId, 'messages', messageId);
      
      const reply = {
        content: replyContent,
        author: 'Sophie', // Nom de l'escort
        createdAt: new Date() // Utiliser Date JavaScript au lieu de serverTimestamp dans un tableau
      };
      
      // Récupérer le message actuel pour ajouter la réponse
      const messageDoc = await getDoc(messageRef);
      if (messageDoc.exists()) {
        const currentReplies = messageDoc.data().replies || [];
        currentReplies.push(reply);
        
        await updateDoc(messageRef, {
          replies: currentReplies,
          status: 'replied',
          lastReplyAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
      throw new Error('Erreur lors de la réponse');
    }
  }

  // Incrémenter le compteur de messages
  async incrementMessageCounter(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'stats.messages': increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation du compteur:', error);
    }
  }

  // Obtenir les statistiques des messages
  async getMessageStats(userId) {
    try {
      const messages = await this.getUserMessages(userId);
      
      const stats = {
        total: messages.length,
        unread: messages.filter(m => m.status === 'unread').length,
        read: messages.filter(m => m.status === 'read').length,
        replied: messages.filter(m => m.status === 'replied').length,
        highPriority: messages.filter(m => m.priority === 'high').length
      };
      
      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des stats:', error);
      return { total: 0, unread: 0, read: 0, replied: 0, highPriority: 0 };
    }
  }
}

export const messagesService = new MessagesService();

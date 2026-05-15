import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from './firebase';

class AdminChatService {
  // Trouver ou créer une conversation entre l'admin et un utilisateur
  async findOrCreateConversation(userId, userName) {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId)
      );
      
      const querySnapshot = await getDocs(q);
      let conversation = null;
      
      // Filtrer pour trouver celle avec 'admin'
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes('admin')) {
          conversation = { id: doc.id, ...data };
        }
      });
      
      if (conversation) return conversation.id;
      
      // Créer une nouvelle conversation si inexistante
      const newConv = {
        participants: [userId, 'admin'],
        participantNames: {
          [userId]: userName || 'Client',
          admin: 'Liliana'
        },
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        unreadCount: {
          [userId]: 0,
          admin: 0
        }
      };
      
      const docRef = await addDoc(collection(db, 'conversations'), newConv);
      return docRef.id;
    } catch (error) {
      console.error('Erreur findOrCreateConversation:', error);
      throw error;
    }
  }

  // Envoyer un message automatique
  async sendAutomatedMessage(userId, userName, text) {
    try {
      const conversationId = await this.findOrCreateConversation(userId, userName);
      
      const messageData = {
        conversationId,
        senderId: 'admin',
        content: text,
        timestamp: serverTimestamp(),
        type: 'text'
      };
      
      await addDoc(collection(db, 'messages'), messageData);
      
      // Mettre à jour la conversation
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${userId}`]: 1 // Optionnel : marquer comme non lu pour l'utilisateur
      });
      
      return true;
    } catch (error) {
      console.error('Erreur sendAutomatedMessage:', error);
      return false;
    }
  }
}

export const adminChatService = new AdminChatService();

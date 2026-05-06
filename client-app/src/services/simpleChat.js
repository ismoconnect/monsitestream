import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  where,
  getDocs,
  setDoc
} from 'firebase/firestore';

class SimpleChatService {
  constructor() {
    this.conversationCache = new Map(); // Cache pour éviter les créations multiples
    this.pendingCreations = new Map(); // Promesses en cours
  }

  // Créer ou récupérer LA conversation unique entre un utilisateur et l'admin
  async getOrCreateConversation(userId, userName) {
    try {
      // Vérifier que userId n'est pas undefined
      if (!userId) {
        throw new Error('userId est requis pour créer une conversation');
      }

      console.log('getOrCreateConversation appelé avec:', { userId, userName });

      // Vérifier le cache local d'abord
      if (this.conversationCache.has(userId)) {
        console.log(`📋 Conversation trouvée dans le cache pour ${userId}: ${this.conversationCache.get(userId)}`);
        return this.conversationCache.get(userId);
      }

      // Vérifier s'il y a déjà une création en cours
      if (this.pendingCreations.has(userId)) {
        console.log(`⏳ Création en cours pour ${userId}, attente...`);
        return await this.pendingCreations.get(userId);
      }

      // Créer une promesse pour éviter les créations multiples
      const creationPromise = this._createOrFindConversation(userId, userName);
      this.pendingCreations.set(userId, creationPromise);

      try {
        const conversationId = await creationPromise;
        this.conversationCache.set(userId, conversationId);
        return conversationId;
      } finally {
        this.pendingCreations.delete(userId);
      }
    } catch (error) {
      console.error('Erreur lors de la création/récupération de la conversation:', error);
      throw error;
    }
  }

  // Fonction interne pour créer ou trouver une conversation
  async _createOrFindConversation(userId, userName) {
    try {
      // Vérifier si une conversation existe déjà pour cet utilisateur
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
      );

      const querySnapshot = await getDocs(q);
      let conversationId = null;

      // Si une conversation existe déjà, utiliser la première (et unique)
      if (!querySnapshot.empty) {
        // Filtrer pour trouver une conversation avec exactement userId et admin
        const existingConversations = querySnapshot.docs.filter(doc => {
          const data = doc.data();
          const participants = data.participants || [];
          return participants.includes(userId) && participants.includes('admin') && participants.length === 2;
        });

        if (existingConversations.length > 0) {
          // Utiliser la première conversation valide
          conversationId = existingConversations[0].id;
          console.log(`Conversation existante trouvée pour l'utilisateur ${userId}: ${conversationId}`);

          // Supprimer les conversations en double s'il y en a
          if (existingConversations.length > 1) {
            console.warn(`⚠️ ${existingConversations.length} conversations trouvées pour ${userId}, nettoyage...`);
            for (let i = 1; i < existingConversations.length; i++) {
              await deleteDoc(existingConversations[i].ref);
              console.log(`🗑️ Conversation en double supprimée: ${existingConversations[i].id}`);
            }
          }
          return conversationId;
        }
      }

      // Si aucune conversation valide trouvée, créer une nouvelle
      console.log(`Création d'une nouvelle conversation pour l'utilisateur ${userId}`);

      const conversationData = {
        participants: [userId, 'admin'], // Toujours userId + admin
        participantNames: {
          [userId]: userName,
          'admin': 'Liliana'
        },
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageAt: null,
        isFirstTime: true // Marquer comme première conversation
      };

      const docRef = await addDoc(conversationsRef, conversationData);
      conversationId = docRef.id;

      // Envoyer un message de bienvenue personnalisé pour la première fois
      const welcomeMessage = `Bonjour ${userName} ! 👋\n\nJe suis Liliana, votre accompagnatrice de luxe personnelle. Je suis ravie de faire votre connaissance !\n\nCette conversation est notre espace privé où nous pouvons discuter librement de tout ce qui vous intéresse. N'hésitez pas à me parler de vos envies, vos questions, ou simplement à faire connaissance avec moi.\n\nComment puis-je vous accompagner aujourd'hui ? 😊✨`;

      await this.sendMessage(conversationId, 'admin', welcomeMessage);

      // Marquer que le message de bienvenue a été envoyé
      await updateDoc(doc(db, 'conversations', conversationId), {
        isFirstTime: false
      });

      return conversationId;
    } catch (error) {
      console.error('Erreur lors de la création/récupération de la conversation:', error);
      throw error;
    }
  }

  // Envoyer un message
  async sendMessage(conversationId, senderId, content) {
    try {
      const messagesRef = collection(db, 'messages');

      const messageData = {
        conversationId,
        senderId,
        content,
        timestamp: serverTimestamp(),
        read: false
      };

      const docRef = await addDoc(messagesRef, messageData);

      // Mettre à jour la conversation avec le dernier message
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  // Écouter les messages d'une conversation en temps réel
  listenToMessages(conversationId, callback) {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );

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
      throw error;
    }
  }

  // Marquer les messages comme lus (simplifié)
  async markMessagesAsRead(conversationId, userId) {
    try {
      // Pour l'instant, on ne fait rien pour éviter l'erreur d'index
      // Cette fonctionnalité peut être ajoutée plus tard avec l'index approprié
      console.log(`Messages marqués comme lus pour la conversation ${conversationId}`);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      // Ne pas lancer l'erreur pour ne pas bloquer l'interface
    }
  }

  // Récupérer toutes les conversations (pour l'admin)
  listenToAllConversations(callback) {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(conversationsRef, orderBy('lastMessageAt', 'desc'));

      return onSnapshot(q, (querySnapshot) => {
        const conversations = [];
        querySnapshot.forEach((doc) => {
          conversations.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(conversations);
      });
    } catch (error) {
      console.error('Erreur lors de l\'écoute des conversations:', error);
      throw error;
    }
  }

  // Fonction de nettoyage pour supprimer les conversations en double
  async cleanupDuplicateConversations() {
    try {
      console.log('🧹 Nettoyage des conversations en double...');
      const conversationsRef = collection(db, 'conversations');
      const querySnapshot = await getDocs(conversationsRef);

      const userConversations = new Map();
      const toDelete = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const participants = data.participants || [];
        const userId = participants.find(p => p !== 'admin');

        if (userId && participants.includes('admin')) {
          if (userConversations.has(userId)) {
            // Conversation en double trouvée
            toDelete.push(doc);
            console.log(`🗑️ Conversation en double trouvée pour ${userId}: ${doc.id}`);
          } else {
            userConversations.set(userId, doc);
          }
        }
      });

      // Supprimer les conversations en double
      for (const doc of toDelete) {
        await deleteDoc(doc.ref);
        console.log(`✅ Conversation supprimée: ${doc.id}`);
      }

      console.log(`🎉 Nettoyage terminé. ${toDelete.length} conversations en double supprimées.`);
      return toDelete.length;
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      throw error;
    }
  }

  // === FONCTIONNALITÉS TYPING ===

  // Indiquer qu'on est en train de taper
  async setTyping(conversationId, userId, isTyping = true) {
    try {
      const typingRef = doc(db, 'typing', `${conversationId}_${userId}`);

      if (isTyping) {
        await setDoc(typingRef, {
          conversationId,
          userId,
          isTyping: true,
          timestamp: serverTimestamp()
        });
      } else {
        await deleteDoc(typingRef);
      }

      console.log(`✍️ Typing ${isTyping ? 'started' : 'stopped'} for:`, userId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du typing:', error);
    }
  }

  // Écouter les indicateurs de frappe pour une conversation
  listenToTyping(conversationId, currentUserId, callback) {
    try {
      const typingQuery = query(
        collection(db, 'typing'),
        where('conversationId', '==', conversationId)
      );

      const unsubscribe = onSnapshot(typingQuery, (snapshot) => {
        const typingUsers = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Ne pas inclure l'utilisateur actuel
          if (data.userId !== currentUserId) {
            // Vérifier que l'indicateur n'est pas trop ancien (> 10 secondes)
            const now = new Date();
            const timestamp = data.timestamp?.toDate();
            const isRecent = timestamp && (now - timestamp) < 10000; // 10 secondes

            if (data.isTyping && isRecent) {
              typingUsers.push({
                userId: data.userId,
                timestamp: timestamp
              });
            }
          }
        });

        callback(typingUsers);
      }, (error) => {
        console.error('Erreur lors de l\'écoute des typing:', error);
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'écoute typing:', error);
      return () => { }; // Retourner une fonction vide
    }
  }

  // Nettoyer les anciens indicateurs de frappe (appelé périodiquement)
  async cleanupOldTyping() {
    try {
      const typingQuery = query(collection(db, 'typing'));
      const snapshot = await getDocs(typingQuery);

      const now = new Date();
      const toDelete = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate();

        // Supprimer si plus ancien que 30 secondes
        if (!timestamp || (now - timestamp) > 30000) {
          toDelete.push(doc);
        }
      });

      for (const doc of toDelete) {
        await deleteDoc(doc.ref);
      }

      if (toDelete.length > 0) {
        console.log(`🧹 ${toDelete.length} anciens indicateurs de frappe supprimés`);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des typing:', error);
    }
  }
}

export const simpleChatService = new SimpleChatService();

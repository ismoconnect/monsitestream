// Encrypted Messaging Service
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import encryptionService from './encryption';
import { useAuth } from '../contexts/AuthContext';

class MessagingService {
  constructor() {
    this.currentUser = null;
    this.encryptionKeys = new Map(); // Cache for public keys
    this.messageListeners = new Map(); // Active listeners
  }

  // Initialize messaging service with current user
  initialize(user) {
    this.currentUser = user;
  }

  // Create a new conversation
  async createConversation(participants, type = 'direct') {
    try {
      const conversationData = {
        type, // 'direct' or 'group'
        participants: participants.map(p => ({
          uid: p.uid,
          role: p.role || 'member',
          joinedAt: new Date()
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
        lastMessageAt: null,
        metadata: {
          encrypted: true,
          keyVersion: 1
        }
      };

      const conversationRef = await addDoc(collection(db, 'conversations'), conversationData);
      
      // Create initial system message
      await this.sendSystemMessage(conversationRef.id, 'conversation_created');
      
      return conversationRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Send an encrypted message
  async sendMessage(conversationId, content, type = 'text', metadata = {}) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      // Get conversation participants
      const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }

      const conversation = conversationDoc.data();
      const participants = conversation.participants.map(p => p.uid);

      // Encrypt message for each participant
      const encryptedContent = await this.encryptMessageForParticipants(content, participants);

      // Create message document
      const messageData = {
        conversationId,
        senderId: this.currentUser.uid,
        senderName: this.currentUser.displayName,
        type, // 'text', 'image', 'file', 'system'
        content: encryptedContent,
        metadata: {
          ...metadata,
          encrypted: true,
          timestamp: serverTimestamp()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'sent'
      };

      // Add message to conversation
      const messageRef = await addDoc(collection(db, 'messages'), messageData);

      // Update conversation last message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: {
          id: messageRef.id,
          content: type === 'text' ? content.substring(0, 100) : `[${type}]`,
          senderId: this.currentUser.uid,
          type
        },
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Encrypt message for multiple participants
  async encryptMessageForParticipants(content, participantIds) {
    const encryptedContent = {};

    for (const participantId of participantIds) {
      try {
        // Get participant's public key
        const publicKey = await this.getUserPublicKey(participantId);
        if (publicKey) {
          const encrypted = await encryptionService.encryptMessage(content, publicKey);
          encryptedContent[participantId] = encrypted;
        }
      } catch (error) {
        console.error(`Error encrypting for participant ${participantId}:`, error);
        // Continue with other participants
      }
    }

    return encryptedContent;
  }

  // Get user's public key (with caching)
  async getUserPublicKey(uid) {
    if (this.encryptionKeys.has(uid)) {
      return this.encryptionKeys.get(uid);
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.encryption?.publicKey) {
          const publicKey = await encryptionService.importPublicKey(userData.encryption.publicKey);
          this.encryptionKeys.set(uid, publicKey);
          return publicKey;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting user public key:', error);
      return null;
    }
  }

  // Decrypt received message
  async decryptMessage(encryptedContent) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      const userEncryptedContent = encryptedContent[this.currentUser.uid];
      if (!userEncryptedContent) {
        throw new Error('No encrypted content for current user');
      }

      // Use the user's private key to decrypt
      const decrypted = await encryptionService.decryptMessage(
        userEncryptedContent, 
        encryptionService.privateKey
      );

      return decrypted;
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw error;
    }
  }

  // Send system message
  async sendSystemMessage(conversationId, systemType, data = {}) {
    try {
      const systemMessages = {
        conversation_created: 'Conversation créée',
        user_joined: `${data.userName} a rejoint la conversation`,
        user_left: `${data.userName} a quitté la conversation`,
        conversation_archived: 'Conversation archivée',
        conversation_deleted: 'Conversation supprimée'
      };

      const content = systemMessages[systemType] || 'Message système';
      
      return await this.sendMessage(conversationId, content, 'system', {
        systemType,
        ...data
      });
    } catch (error) {
      console.error('Error sending system message:', error);
      throw error;
    }
  }

  // Upload and send file
  async sendFile(conversationId, file, type = 'file') {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `conversations/${conversationId}/files/${fileName}`;
      
      // Upload file to storage
      const fileRef = ref(storage, filePath);
      const uploadResult = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Encrypt file URL and metadata
      const fileMetadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: downloadURL,
        path: filePath
      };

      const encryptedMetadata = await this.encryptMessageForParticipants(
        JSON.stringify(fileMetadata),
        await this.getConversationParticipants(conversationId)
      );

      // Send message with file
      return await this.sendMessage(conversationId, encryptedMetadata, type, {
        originalName: file.name,
        size: file.size,
        mimeType: file.type
      });
    } catch (error) {
      console.error('Error sending file:', error);
      throw error;
    }
  }

  // Get conversation participants
  async getConversationParticipants(conversationId) {
    try {
      const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
      if (conversationDoc.exists()) {
        const conversation = conversationDoc.data();
        return conversation.participants.map(p => p.uid);
      }
      return [];
    } catch (error) {
      console.error('Error getting conversation participants:', error);
      return [];
    }
  }

  // Listen to messages in a conversation
  listenToMessages(conversationId, callback) {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const messages = [];
        
        for (const doc of snapshot.docs) {
          const messageData = doc.data();
          
          // Decrypt message content
          try {
            if (messageData.type !== 'system') {
              messageData.decryptedContent = await this.decryptMessage(messageData.content);
            } else {
              messageData.decryptedContent = messageData.content;
            }
          } catch (error) {
            console.error('Error decrypting message:', error);
            messageData.decryptedContent = '[Message non déchiffrable]';
          }
          
          messages.push({
            id: doc.id,
            ...messageData
          });
        }

        // Sort messages by creation time (oldest first)
        messages.sort((a, b) => a.createdAt?.toDate() - b.createdAt?.toDate());
        
        callback(messages);
      });

      // Store listener for cleanup
      this.messageListeners.set(conversationId, unsubscribe);
      
      return unsubscribe;
    } catch (error) {
      console.error('Error listening to messages:', error);
      throw error;
    }
  }

  // Listen to user conversations
  listenToConversations(callback) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', { uid: this.currentUser.uid }),
        orderBy('lastMessageAt', 'desc')
      );

      const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
        const conversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        callback(conversations);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error listening to conversations:', error);
      throw error;
    }
  }

  // Mark message as read
  async markMessageAsRead(conversationId, messageId) {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        status: 'read',
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const messageDoc = await getDoc(doc(db, 'messages', messageId));
      if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        
        // Delete associated file if exists
        if (messageData.type === 'file' || messageData.type === 'image') {
          try {
            const decryptedContent = await this.decryptMessage(messageData.content);
            const fileMetadata = JSON.parse(decryptedContent);
            if (fileMetadata.path) {
              const fileRef = ref(storage, fileMetadata.path);
              await deleteObject(fileRef);
            }
          } catch (error) {
            console.error('Error deleting associated file:', error);
          }
        }
        
        // Delete message document
        await deleteDoc(doc(db, 'messages', messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Archive conversation
  async archiveConversation(conversationId) {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        archived: true,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }

  // Delete conversation
  async deleteConversation(conversationId) {
    try {
      // Delete all messages in conversation
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const batch = writeBatch(db);
      
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete conversation
      batch.delete(doc(db, 'conversations', conversationId));
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Cleanup listeners
  cleanup() {
    this.messageListeners.forEach(unsubscribe => unsubscribe());
    this.messageListeners.clear();
    this.encryptionKeys.clear();
  }
}

// Create singleton instance
const messagingService = new MessagingService();
export default messagingService;

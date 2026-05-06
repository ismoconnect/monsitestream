import { useState, useEffect } from 'react';
import { messagesService } from '../services/messagesService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export const useMessages = (filters = {}) => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Charger les messages initiaux
  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const loadMessages = async () => {
      try {
        setLoading(true);
        const userMessages = await messagesService.getUserMessages(currentUser.id, filters);
        setMessages(userMessages);
        
        // Charger les statistiques
        const messageStats = await messagesService.getMessageStats(currentUser.id);
        setStats(messageStats);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
        showError('Erreur', 'Impossible de charger les messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [currentUser?.id, JSON.stringify(filters)]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubscribe = messagesService.onMessagesSnapshot(
      currentUser.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        // Mettre à jour les stats
        messagesService.getMessageStats(currentUser.id).then(setStats);
      },
      filters
    );

    return unsubscribe;
  }, [currentUser?.id, JSON.stringify(filters)]);

  // Créer un nouveau message
  const createMessage = async (messageData) => {
    try {
      const result = await messagesService.createMessage(currentUser.id, messageData);
      showSuccess('Message créé', 'Votre message a été envoyé avec succès');
      return result;
    } catch (error) {
      showError('Erreur', 'Impossible de créer le message');
      throw error;
    }
  };

  // Marquer comme lu
  const markAsRead = async (messageId) => {
    try {
      await messagesService.markAsRead(currentUser.id, messageId);
      return { success: true };
    } catch (error) {
      showError('Erreur', 'Impossible de marquer le message comme lu');
      throw error;
    }
  };

  // Répondre à un message
  const replyToMessage = async (messageId, replyContent) => {
    try {
      await messagesService.replyToMessage(currentUser.id, messageId, replyContent);
      showSuccess('Réponse envoyée', 'Votre réponse a été envoyée avec succès');
      return { success: true };
    } catch (error) {
      showError('Erreur', 'Impossible d\'envoyer la réponse');
      throw error;
    }
  };

  return {
    messages,
    stats,
    loading,
    createMessage,
    markAsRead,
    replyToMessage
  };
};

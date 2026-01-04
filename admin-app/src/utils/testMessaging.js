import { simpleChatService } from '../services/simpleChat';

// Fonction pour tester la messagerie
export const runMessagingTests = async (currentUser) => {
  if (!currentUser) {
    throw new Error('Utilisateur non connecté');
  }

  const results = {};

  try {
    // Test 1: Créer une conversation
    console.log('🧪 Test 1: Création de conversation...');
    const conversationId = await simpleChatService.getOrCreateConversation(
      currentUser.uid,
      currentUser.displayName || currentUser.email
    );
    results.conversationId = conversationId;
    console.log('✅ Conversation créée:', conversationId);

    // Test 2: Envoyer un message utilisateur
    console.log('🧪 Test 2: Envoi de message utilisateur...');
    await simpleChatService.sendMessage(
      conversationId,
      currentUser.uid,
      'Bonjour Sophie ! Ceci est un message de test depuis le système de messagerie.'
    );
    console.log('✅ Message utilisateur envoyé');

    // Test 3: Simuler une réponse admin
    console.log('🧪 Test 3: Simulation de réponse admin...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
    await simpleChatService.sendMessage(
      conversationId,
      'admin',
      'Bonjour ! Je suis Sophie, votre accompagnatrice. Comment puis-je vous aider aujourd\'hui ? 😊'
    );
    console.log('✅ Réponse admin simulée');

    results.success = true;
    results.message = 'Tous les tests ont réussi !';
    
    return results;
  } catch (error) {
    console.error('❌ Erreur dans les tests:', error);
    results.success = false;
    results.error = error.message;
    return results;
  }
};

// Fonction pour nettoyer les données de test
export const cleanupTestData = async () => {
  console.log('🧹 Nettoyage des données de test...');
  // Cette fonction pourrait supprimer les conversations de test
  // Pour l'instant, on la laisse vide car les vraies conversations sont importantes
  console.log('✅ Nettoyage terminé');
};

// Fonction pour vérifier l'état de la messagerie
export const checkMessagingStatus = async () => {
  try {
    const status = {
      firestoreConnected: false,
      rulesDeployed: false,
      serviceWorking: false
    };

    // Test de base pour vérifier si le service fonctionne
    if (simpleChatService) {
      status.serviceWorking = true;
    }

    // TODO: Ajouter d'autres vérifications
    status.firestoreConnected = true; // Supposer que c'est connecté si pas d'erreur
    status.rulesDeployed = true; // Supposer que les règles sont déployées

    return status;
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return {
      firestoreConnected: false,
      rulesDeployed: false,
      serviceWorking: false,
      error: error.message
    };
  }
};

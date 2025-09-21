import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Settings, Database } from 'lucide-react';
import { simpleChatService } from '../services/simpleChat';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const TestMessaging = () => {
  const { currentUser } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  // Test de création de conversation
  const testCreateConversation = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const conversationId = await simpleChatService.getOrCreateConversation(
        currentUser.uid, 
        currentUser.displayName || currentUser.email
      );
      
      setTestResults(prev => ({
        ...prev,
        createConversation: {
          success: true,
          conversationId,
          message: 'Conversation créée avec succès'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        createConversation: {
          success: false,
          error: error.message
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Test d'envoi de message
  const testSendMessage = async () => {
    if (!currentUser || !testResults.createConversation?.conversationId) return;
    
    setIsLoading(true);
    try {
      await simpleChatService.sendMessage(
        testResults.createConversation.conversationId, 
        currentUser.uid, 
        `Message de test envoyé à ${new Date().toLocaleTimeString()}`
      );
      
      setTestResults(prev => ({
        ...prev,
        sendMessage: {
          success: true,
          message: 'Message envoyé avec succès'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        sendMessage: {
          success: false,
          error: error.message
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier les collections Firestore
  const checkFirestoreCollections = async () => {
    setIsLoading(true);
    try {
      // Vérifier les conversations
      const conversationsSnapshot = await getDocs(collection(db, 'conversations'));
      const conversationsData = [];
      conversationsSnapshot.forEach((doc) => {
        conversationsData.push({ id: doc.id, ...doc.data() });
      });

      // Vérifier les messages
      const messagesSnapshot = await getDocs(collection(db, 'messages'));
      const messagesData = [];
      messagesSnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });

      setConversations(conversationsData);
      setMessages(messagesData);

      setTestResults(prev => ({
        ...prev,
        firestoreCheck: {
          success: true,
          conversationsCount: conversationsData.length,
          messagesCount: messagesData.length
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        firestoreCheck: {
          success: false,
          error: error.message
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Écouter les conversations en temps réel
  useEffect(() => {
    const unsubscribe = simpleChatService.listenToAllConversations((newConversations) => {
      setConversations(newConversations);
    });

    return unsubscribe;
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h2>
          <p className="text-gray-600">Vous devez être connecté pour tester la messagerie.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test de Messagerie</h1>
              <p className="text-gray-600">Vérification du système de messagerie Firestore</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de tests */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Tests de Fonctionnalité
            </h2>

            <div className="space-y-4">
              {/* Test 1: Vérifier Firestore */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Vérifier Collections Firestore</h3>
                  <button
                    onClick={checkFirestoreCollections}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Database className="h-4 w-4" />
                  </button>
                </div>
                {testResults.firestoreCheck && (
                  <div className={`text-sm p-2 rounded ${
                    testResults.firestoreCheck.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testResults.firestoreCheck.success ? (
                      <div>
                        ✅ Collections trouvées:
                        <br />• {testResults.firestoreCheck.conversationsCount} conversations
                        <br />• {testResults.firestoreCheck.messagesCount} messages
                      </div>
                    ) : (
                      `❌ ${testResults.firestoreCheck.error}`
                    )}
                  </div>
                )}
              </div>

              {/* Test 2: Créer conversation */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Créer Conversation</h3>
                  <button
                    onClick={testCreateConversation}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Créer
                  </button>
                </div>
                {testResults.createConversation && (
                  <div className={`text-sm p-2 rounded ${
                    testResults.createConversation.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testResults.createConversation.success ? (
                      `✅ ${testResults.createConversation.message} (ID: ${testResults.createConversation.conversationId})`
                    ) : (
                      `❌ ${testResults.createConversation.error}`
                    )}
                  </div>
                )}
              </div>

              {/* Test 3: Envoyer message */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Envoyer Message</h3>
                  <button
                    onClick={testSendMessage}
                    disabled={isLoading || !testResults.createConversation?.success}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                  >
                    Envoyer
                  </button>
                </div>
                {testResults.sendMessage && (
                  <div className={`text-sm p-2 rounded ${
                    testResults.sendMessage.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testResults.sendMessage.success ? (
                      `✅ ${testResults.sendMessage.message}`
                    ) : (
                      `❌ ${testResults.sendMessage.error}`
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Panel de données */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Données en Temps Réel</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Conversations ({conversations.length})</h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="font-medium">ID: {conv.id}</div>
                      <div>Participants: {conv.participants?.join(', ')}</div>
                      <div>Dernier message: {conv.lastMessage || 'Aucun'}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Messages ({messages.length})</h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="font-medium">De: {msg.senderId}</div>
                      <div>Contenu: {msg.content}</div>
                      <div className="text-xs text-gray-500">
                        {msg.timestamp?.toDate?.()?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TestMessaging;

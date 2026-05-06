import { firestoreAuth } from '../services/firestoreAuth';

// Fonction pour créer des données de test
export const createTestUsers = async () => {
  const testUsers = [
    {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Utilisateur Test'
    },
    {
      email: 'user1@example.com',
      password: 'password123',
      displayName: 'Julie Martin'
    },
    {
      email: 'user2@example.com',
      password: 'password123',
      displayName: 'Emma Dubois'
    },
    {
      email: 'user3@example.com',
      password: 'password123',
      displayName: 'Léa Rousseau'
    }
  ];

  console.log('Création des utilisateurs de test...');

  for (const userData of testUsers) {
    try {
      const result = await firestoreAuth.createAccount(userData);
      console.log(`✅ Utilisateur créé: ${userData.email}`, result);
    } catch (error) {
      console.log(`❌ Erreur pour ${userData.email}:`, error.message);
    }
  }

  console.log('✅ Données de test créées !');
  console.log('🔗 Accédez à l\'administration sur: /admin');
  console.log('📝 Vous pouvez maintenant valider les abonnements depuis l\'interface admin');
};

// Fonction pour nettoyer les données de test
export const clearTestData = () => {
  console.log('⚠️ Pour supprimer les données de test, utilisez la console Firebase');
  console.log('🔗 https://console.firebase.google.com/');
};

// Informations d'aide pour les développeurs
export const devHelp = () => {
  console.log(`
🚀 SYSTÈME D'AUTHENTIFICATION FIRESTORE CONFIGURÉ !

📋 Fonctionnalités disponibles :
• Inscription avec sélection d'abonnement
• Validation administrative des comptes
• Dashboard utilisateur avec compteurs de services
• Gestion des sous-collections par service

🔧 Comment tester :
1. Créer des utilisateurs de test : createTestUsers()
2. Aller sur /admin pour valider les abonnements
3. Se connecter avec les comptes validés
4. Utiliser le dashboard avec les services

👥 Comptes de test :
• test@example.com / password123 (Plan gratuit)
• user1@example.com / password123 (Plan gratuit)
• user2@example.com / password123 (Plan gratuit)
• user3@example.com / password123 (Plan gratuit)

🏗️ Structure Firestore :
users/
  ├── {userId}/
      ├── profile, stats, subscription...
      ├── appointments/ (sous-collection)
      ├── messages/ (sous-collection)
      ├── sessions/ (sous-collection)
      ├── gallery/ (sous-collection)
      └── notifications/ (sous-collection)

admin_logs/ (logs d'administration)
  `);
};

export default {
  createTestUsers,
  clearTestData,
  devHelp
};

# Configuration des Règles Firestore pour la Messagerie

## 📋 Collections Créées

### 1. Collection `conversations`
Structure d'un document de conversation :
```javascript
{
  participants: ['userId', 'admin'],
  participantNames: {
    'userId': 'Nom de l\'utilisateur',
    'admin': 'Sophie'
  },
  createdAt: serverTimestamp(),
  lastMessage: 'Dernier message...',
  lastMessageAt: serverTimestamp(),
  isFirstTime: false
}
```

### 2. Collection `messages`
Structure d'un document de message :
```javascript
{
  conversationId: 'conversation-id',
  senderId: 'userId' | 'admin',
  content: 'Contenu du message',
  timestamp: serverTimestamp(),
  read: false
}
```

## 🔒 Règles de Sécurité

### Règles de Production (`firestore.rules`)
- **Conversations** : Lecture/écriture pour les participants uniquement
- **Messages** : Lecture/écriture pour les participants de la conversation
- **Admin** : Accès complet à toutes les conversations et messages
- **Sécurité** : Vérification de l'authentification et des permissions

### Règles de Développement (`firestore-dev.rules`)
- **Permissives** : Accès complet pour faciliter le développement
- **Collections explicites** : conversations et messages clairement définies
- ⚠️ **Ne jamais utiliser en production**

## 🚀 Déploiement des Règles

### Pour le Développement
```bash
# Déployer les règles de développement
firebase deploy --only firestore:rules --project your-dev-project

# Ou utiliser le fichier de dev spécifiquement
firebase deploy --only firestore:rules --project your-dev-project
```

### Pour la Production
```bash
# Déployer les règles de production sécurisées
firebase deploy --only firestore:rules --project your-prod-project
```

## 🧪 Test des Règles

### Commandes de Test
```bash
# Tester les règles localement
firebase emulators:start --only firestore

# Tester avec des données de test
npm run test:firestore-rules
```

### Cas de Test à Vérifier
1. ✅ Un utilisateur peut créer sa propre conversation avec l'admin
2. ✅ Un utilisateur peut lire/écrire dans sa conversation
3. ❌ Un utilisateur ne peut pas accéder aux conversations d'autres utilisateurs
4. ✅ L'admin peut accéder à toutes les conversations
5. ✅ Les messages sont liés à une conversation valide
6. ❌ Utilisateurs non authentifiés ne peuvent rien faire

## 📊 Structure des Index Firestore

Ajoutez ces index dans `firestore.indexes.json` :

```json
{
  "indexes": [
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "participants",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "lastMessageAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "conversationId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## 🔧 Configuration Firebase

Assurez-vous que votre `firebase.json` inclut :

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

## 🚨 Points Importants

1. **Une conversation par utilisateur** : Les règles empêchent la création de conversations multiples
2. **Sécurité** : Seuls les participants peuvent accéder aux conversations
3. **Admin** : L'admin (Sophie) a accès à toutes les conversations
4. **Authentification** : Toutes les opérations nécessitent une authentification
5. **Temps réel** : Les règles supportent les listeners en temps réel

## 📝 Notes de Déploiement

- Testez toujours les règles en développement avant la production
- Surveillez les métriques Firestore après le déploiement
- Les règles prennent effet immédiatement après le déploiement
- Gardez une sauvegarde des anciennes règles avant mise à jour

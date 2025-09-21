# 🚀 Déploiement des règles Firestore

## 📋 Instructions pour configurer Firestore

### 1. Installer Firebase CLI (si pas déjà fait)
```bash
npm install -g firebase-tools
```

### 2. Se connecter à Firebase
```bash
firebase login
```

### 3. Initialiser le projet (si pas déjà fait)
```bash
firebase init firestore
```

### 4. Déployer les règles de développement (PERMISSIVES)
```bash
# Copier les règles de dev
cp firestore-dev.rules firestore.rules

# Déployer
firebase deploy --only firestore:rules
```

### 5. Alternative : Configurer via la Console Firebase

1. **Aller sur la Console Firebase** : https://console.firebase.google.com/
2. **Sélectionner votre projet**
3. **Aller dans Firestore Database**
4. **Onglet "Rules"**
5. **Remplacer le contenu par :**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // RÈGLES DE DÉVELOPPEMENT - PLUS PERMISSIVES
    // ⚠️ À NE PAS UTILISER EN PRODUCTION ⚠️
    
    // Permettre toutes les opérations sur les utilisateurs
    match /users/{userId} {
      allow read, write: if true;
      
      // Sous-collections
      match /{serviceCollection}/{serviceDoc} {
        allow read, write: if true;
      }
    }

    // Permettre toutes les opérations sur les logs admin
    match /admin_logs/{logId} {
      allow read, write: if true;
    }

    // Règle par défaut permissive pour le développement
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. **Cliquer sur "Publier"**

### 6. Vérifier la configuration Firebase

Assurez-vous que votre fichier `.env` contient :
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 7. Tester la création de compte

1. **Ouvrir la console du navigateur** (F12)
2. **Aller sur votre site**
3. **Cliquer sur "S'inscrire"** puis **"S'abonner maintenant"**
4. **Remplir le formulaire** et **créer le compte**
5. **Vérifier les logs** dans la console
6. **Vérifier dans Firestore** si la collection `users` est créée

### 8. Si ça ne marche toujours pas

Vérifiez dans la console Firebase :
- **Authentication** : Activé avec Email/Password
- **Firestore** : Base de données créée
- **Règles** : Bien déployées
- **Facturation** : Plan Blaze activé si nécessaire

### 9. Pour la production

Remplacez par les règles sécurisées de `firestore.rules` qui nécessitent une authentification appropriée.

## 🔧 Dépannage

### Erreur "Permission denied"
- Vérifiez que les règles sont bien déployées
- Utilisez les règles de développement temporairement

### Erreur "Project not found"
- Vérifiez le VITE_FIREBASE_PROJECT_ID dans .env
- Vérifiez que le projet existe sur Firebase

### Erreur "Network error"
- Vérifiez votre connexion internet
- Vérifiez que Firebase est bien configuré

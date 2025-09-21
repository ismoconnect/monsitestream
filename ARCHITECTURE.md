# Architecture SiteStream

## 🏗️ Vue d'ensemble

SiteStream est une plateforme de communication sécurisée construite avec une architecture moderne et scalable.

## 📊 Diagramme d'Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   React + Vite  │    │   Firebase      │    │   Services      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Auth      │ │◄──►│ │  Auth       │ │    │ │   Stripe    │ │
│ │   Context   │ │    │ │  Service    │ │◄──►│ │   Payments  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Encryption  │ │    │ │  Firestore  │ │    │ │   Socket.io │ │
│ │   Service   │ │    │ │  Database   │ │◄──►│ │   Signaling │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │                 │
│ │ Streaming   │ │    │ │  Storage    │ │    │                 │
│ │   Service   │ │    │ │  Service    │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │                 │
│ │ Messaging   │ │    │ │  Functions  │ │    │                 │
│ │   Service   │ │◄──►│ │  (Server)   │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Couches de l'Application

### 1. Couche Présentation (Frontend)

#### Technologies
- **React 18** : Framework UI avec hooks et context
- **Vite** : Build tool rapide et moderne
- **Tailwind CSS** : Framework CSS utility-first
- **Framer Motion** : Animations fluides
- **React Router** : Navigation côté client

#### Structure
```
src/
├── components/          # Composants réutilisables
│   ├── auth/           # Composants d'authentification
│   ├── messaging/      # Composants de messagerie
│   ├── streaming/      # Composants de streaming
│   ├── booking/        # Composants de réservation
│   ├── subscription/   # Composants d'abonnement
│   └── ui/             # Composants UI de base
├── contexts/           # Contextes React
├── hooks/              # Hooks personnalisés
├── pages/              # Pages de l'application
├── services/           # Services métier
└── utils/              # Utilitaires
```

### 2. Couche Logique Métier (Services)

#### Services Principaux

**AuthService** (`contexts/AuthContext.jsx`)
- Gestion de l'authentification
- Rôles utilisateur (client, provider, admin)
- Gestion des sessions
- Intégration Firebase Auth

**EncryptionService** (`services/encryption.js`)
- Génération de clés RSA-OAEP
- Chiffrement/déchiffrement des messages
- Gestion des clés publiques/privées
- Chiffrement des fichiers

**MessagingService** (`services/messaging.js`)
- Messages cryptés end-to-end
- Gestion des conversations
- Support des fichiers
- Notifications en temps réel

**StreamingService** (`services/streaming.js`)
- WebRTC pour la vidéoconférence
- Gestion des connexions P2P
- Signaling avec Socket.io
- Contrôles de stream

**PaymentService** (`services/payments.js`)
- Intégration Stripe
- Gestion des abonnements
- Facturation
- Limites par plan

**BookingService** (`services/booking.js`)
- Système de réservation
- Gestion des créneaux
- Notifications
- Calendrier

### 3. Couche Données (Backend)

#### Firebase Services

**Firestore Database**
```javascript
// Collections principales
users/              // Profils utilisateurs
conversations/      // Conversations
messages/           // Messages cryptés
appointments/       // Rendez-vous
subscriptions/      // Abonnements
payments/           // Historique paiements
streams/            // Sessions streaming
```

**Firebase Authentication**
- Email/Password
- Vérification d'email
- Gestion des sessions
- Tokens JWT

**Firebase Storage**
- Fichiers de profil
- Fichiers de conversation
- Enregistrements de stream
- Assets publics

**Firebase Functions**
- Logique métier sécurisée
- Webhooks Stripe
- Notifications email
- Validation des données

### 4. Couche Infrastructure

#### Hébergement
- **Frontend** : Firebase Hosting (CDN global)
- **Backend** : Firebase Functions (serverless)
- **Base de données** : Firestore (NoSQL)
- **Stockage** : Firebase Storage

#### Sécurité
- **Chiffrement** : Web Crypto API (RSA-OAEP)
- **Authentification** : Firebase Auth
- **Autorisation** : Firestore Security Rules
- **HTTPS** : Obligatoire partout

## 🔄 Flux de Données

### 1. Authentification
```
User → LoginForm → AuthContext → Firebase Auth → Firestore (user profile)
```

### 2. Messagerie Cryptée
```
User → MessageInput → EncryptionService → MessagingService → Firestore
     ↓
Recipient ← MessageList ← EncryptionService ← MessagingService ← Firestore
```

### 3. Streaming
```
User → StreamingService → WebRTC → Socket.io (signaling) → Remote User
```

### 4. Paiements
```
User → PaymentForm → PaymentService → Firebase Functions → Stripe API
```

## 🛡️ Sécurité

### Chiffrement End-to-End

1. **Génération des clés** : RSA-OAEP 2048 bits
2. **Stockage des clés publiques** : Firestore
3. **Chiffrement des messages** : Côté client
4. **Transmission** : Messages chiffrés uniquement
5. **Déchiffrement** : Côté client avec clé privée

### Règles de Sécurité

**Firestore Rules**
```javascript
// Utilisateurs peuvent lire/écrire leurs propres données
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Messages seulement pour les participants
match /messages/{messageId} {
  allow read, write: if request.auth.uid in resource.data.participants;
}
```

**Storage Rules**
```javascript
// Fichiers de conversation pour participants uniquement
match /conversations/{conversationId}/files/{fileName} {
  allow read, write: if request.auth.uid in 
    firestore.get(/databases/(default)/documents/conversations/$(conversationId))
    .data.participants.map(p => p.uid);
}
```

## 📈 Scalabilité

### Frontend
- **Code Splitting** : Lazy loading des routes
- **Bundle Optimization** : Vite pour un build optimisé
- **CDN** : Firebase Hosting avec cache global
- **PWA Ready** : Service workers pour l'offline

### Backend
- **Serverless** : Firebase Functions auto-scaling
- **Database** : Firestore avec sharding automatique
- **Caching** : Cache Firestore intégré
- **Load Balancing** : Automatique avec Firebase

### Données
- **Indexation** : Index composites Firestore
- **Pagination** : Limite et curseurs
- **Optimisation** : Requêtes efficaces
- **Archivage** : Stratégie de rétention

## 🔧 Monitoring

### Métriques
- **Performance** : Firebase Performance Monitoring
- **Erreurs** : Firebase Crashlytics
- **Usage** : Firebase Analytics
- **Paiements** : Stripe Dashboard

### Logs
- **Frontend** : Console logs + Sentry (optionnel)
- **Backend** : Firebase Functions logs
- **Database** : Firestore audit logs
- **Security** : Firebase Security logs

## 🚀 Déploiement

### Environnements
- **Development** : Local avec émulateurs
- **Staging** : Firebase project séparé
- **Production** : Firebase project principal

### CI/CD
```yaml
# GitHub Actions (exemple)
- Build frontend
- Run tests
- Deploy to Firebase
- Run security scans
- Notify team
```

## 🔮 Évolutions Futures

### Court terme
- [ ] Notifications push
- [ ] API publique
- [ ] Tests automatisés

### Moyen terme
- [ ] Application mobile (React Native)
- [ ] IA pour la modération
- [ ] Analytics avancées

### Long terme
- [ ] Blockchain pour l'audit
- [ ] Multi-tenant
- [ ] Microservices

## 📚 Technologies Utilisées

### Frontend
- React 18.2+
- Vite 4.0+
- Tailwind CSS 3.0+
- Framer Motion 10.0+
- React Router 6.0+

### Backend
- Firebase 9.0+
- Node.js 18+
- Stripe API
- Socket.io

### Sécurité
- Web Crypto API
- RSA-OAEP
- AES-256
- JWT

### Outils
- ESLint
- Prettier
- Firebase CLI
- Stripe CLI

---

Cette architecture garantit une application sécurisée, performante et évolutive pour répondre aux besoins de communication professionnelle.

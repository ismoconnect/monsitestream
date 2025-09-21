# 🚀 Guide d'utilisation - Système d'authentification Firestore

## 📋 Vue d'ensemble

Le système d'authentification Firestore complet a été implémenté avec :
- ✅ Inscription avec sélection d'abonnement
- ✅ Validation administrative des comptes
- ✅ Dashboard utilisateur avec compteurs de services
- ✅ Gestion des sous-collections par service
- ✅ Interface d'administration complète

## 🏗️ Architecture

### Structure Firestore
```
users/
├── {userId}/
│   ├── id: string
│   ├── email: string
│   ├── displayName: string
│   ├── password: string (hashé)
│   ├── subscription: {
│   │   ├── plan: 'basic' | 'premium' | 'vip'
│   │   ├── status: 'pending' | 'active' | 'suspended' | 'rejected'
│   │   ├── requestedAt: timestamp
│   │   ├── validatedAt: timestamp
│   │   ├── validatedBy: string
│   │   └── expiresAt: timestamp
│   │   }
│   ├── profile: { bio, location, phone, avatar }
│   ├── preferences: { notifications, emailUpdates, privacy }
│   ├── stats: { appointments, messages, sessions, galleryViews }
│   ├── isActive: boolean
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
│
├── appointments/ (sous-collection)
├── messages/ (sous-collection)
├── sessions/ (sous-collection)
├── gallery/ (sous-collection)
└── notifications/ (sous-collection)

admin_logs/
├── {logId}/
│   ├── adminId: string
│   ├── action: string
│   ├── details: object
│   ├── timestamp: timestamp
│   ├── ip: string
│   └── userAgent: string
```

## 🚀 Comment utiliser

### 1. Inscription d'un nouvel utilisateur

1. **Accéder à l'inscription** : Cliquer sur "S'inscrire" depuis la page d'accueil
2. **Mode Firestore** : Le bouton devient "S'abonner maintenant"
3. **Sélection du plan** : Choisir entre Basic (29€), Premium (59€), ou VIP (99€)
4. **Informations personnelles** : Remplir nom, email, mot de passe
5. **Validation** : Le compte est créé avec le statut "pending"

### 2. Validation administrative

1. **Accéder à l'admin** : Aller sur `/admin`
2. **Voir les demandes** : Onglet "En attente" pour voir les nouvelles inscriptions
3. **Valider/Rejeter** : Utiliser les boutons ✅ (valider) ou ❌ (rejeter)
4. **Gestion avancée** : Suspendre, réactiver, prolonger les abonnements

### 3. Connexion utilisateur

1. **Compte validé uniquement** : Seuls les comptes avec `status: 'active'` peuvent se connecter
2. **Messages d'erreur** :
   - "Demande en cours de validation" si `status: 'pending'`
   - "Demande refusée" si `status: 'rejected'`
   - "Compte suspendu" si `status: 'suspended'`

### 4. Utilisation du dashboard

1. **Accès automatique** : Redirection vers `/dashboard` après connexion
2. **Services disponibles** : Galerie, Messages, RDV, Streaming, etc.
3. **Compteurs automatiques** : Chaque utilisation incrémente les stats
4. **Sous-collections** : Données stockées dans `users/{id}/{service}/`

## 🛠️ Fonctions développeur

### Créer des données de test
```javascript
import { createTestUsers } from './src/utils/seedData';
createTestUsers(); // Crée 3 utilisateurs de test
```

### Utiliser les services
```javascript
import { useAuth } from './contexts/AuthContext';

const { 
  createAccount,           // Créer un compte
  addServiceDocument,      // Ajouter un document de service
  incrementServiceCounter, // Incrémenter un compteur
  getUserServiceDocuments  // Récupérer les documents d'un service
} = useAuth();

// Exemple : Ajouter un rendez-vous
await addServiceDocument('appointments', {
  clientName: 'John Doe',
  date: new Date(),
  service: 'Premium Session',
  status: 'confirmed'
});
```

### Services d'administration
```javascript
import { adminService } from './services/adminService';

// Valider un abonnement
await adminService.validateSubscription(userId, adminId, { duration: 30 });

// Obtenir les statistiques
const stats = await adminService.getAdminStats();

// Suspendre un utilisateur
await adminService.suspendUser(userId, adminId, 'Violation des conditions');
```

## 📊 Interface d'administration

### Fonctionnalités disponibles
- **Dashboard** : Statistiques globales (total, actifs, en attente, etc.)
- **Gestion des utilisateurs** : Filtrage par statut, recherche
- **Actions rapides** : Validation, rejet, suspension en un clic
- **Détails utilisateur** : Modal avec toutes les informations
- **Logs d'activité** : Traçabilité de toutes les actions admin

### Statuts des utilisateurs
- 🟡 **Pending** : En attente de validation
- 🟢 **Active** : Compte validé et actif
- 🔴 **Suspended** : Compte suspendu temporairement
- ⚫ **Rejected** : Demande rejetée

## 🔐 Sécurité

### Mesures implémentées
- **Hash des mots de passe** : Utilisation de btoa (à remplacer par bcrypt en production)
- **Validation côté serveur** : Vérifications avant création de compte
- **Logs d'administration** : Traçabilité de toutes les actions
- **Statuts stricts** : Seuls les comptes actifs peuvent accéder

### À améliorer en production
- Remplacer `btoa` par `bcrypt` pour le hashing
- Ajouter la récupération d'IP réelle
- Implémenter des règles de sécurité Firestore
- Ajouter l'authentification administrative
- Implémenter la vérification par email

## 🎯 Workflow complet

1. **Utilisateur s'inscrit** → Compte créé avec `status: 'pending'`
2. **Admin valide** → Statut passe à `'active'`, compte activé
3. **Utilisateur se connecte** → Accès au dashboard
4. **Utilisation des services** → Compteurs et sous-collections mis à jour
5. **Admin peut gérer** → Suspendre, prolonger, changer de plan

## 🚨 Dépannage

### Erreurs courantes
- **"Utilisateur introuvable"** : Vérifier que l'email est correct
- **"Compte non activé"** : Vérifier le statut dans l'interface admin
- **"Erreur Firestore"** : Vérifier la configuration Firebase

### Points de vérification
1. Configuration Firebase dans `.env`
2. Règles Firestore configurées
3. Mode d'authentification sur 'firestore' dans `AuthContext.jsx`
4. Collections initialisées correctement

## 🎉 Résultat

Vous avez maintenant un système d'authentification professionnel avec :
- Gestion complète des abonnements
- Interface d'administration
- Compteurs et analytics utilisateur
- Architecture scalable avec Firestore
- Workflow de validation complet

Pour tester, utilisez les comptes de test ou créez de nouveaux utilisateurs via l'interface !

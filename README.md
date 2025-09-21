# Sophie - Site Personnel d'Accompagnatrice de Luxe

Un site web professionnel et élégant pour une accompagnatrice de luxe, développé avec React 18, Vite, Tailwind CSS et Firebase.

## 🚀 Fonctionnalités

- **Page d'accueil attractive** avec design moderne et animations fluides
- **Système d'authentification personnalisé** avec Firestore (sans Firebase Auth)
- **Galerie média** avec contenu public et premium
- **Système d'abonnements** avec gestion des paiements
- **Réservation de rendez-vous** avec formulaire multi-étapes
- **Tableau de bord client** avec gestion des abonnements
- **Design responsive** et optimisé mobile
- **Animations Framer Motion** pour une expérience premium

## 🛠️ Technologies Utilisées

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Firebase Firestore
- **Authentification**: Système personnalisé avec Firestore
- **Paiements**: Stripe (intégration prête)
- **Hébergement**: Vercel/Netlify (gratuit)

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd site-stream
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
# Copier le fichier d'exemple
cp env.example .env.local

# Éditer .env.local avec vos vraies valeurs
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

## 🔧 Configuration Firebase

### 1. Créer un projet Firebase
- Aller sur [Firebase Console](https://console.firebase.google.com)
- Créer un nouveau projet
- Activer Firestore Database
- Activer Storage (optionnel)

### 2. Configurer Firestore
Créer les collections suivantes dans Firestore :

```javascript
// Collection: users
{
  id: "user_id",
  email: "user@example.com",
  password: "hashed_password", // En production, hasher les mots de passe
  displayName: "Nom Utilisateur",
  role: "client",
  subscription: {
    type: "none|basic|premium",
    status: "inactive|active|cancelled",
    startDate: timestamp,
    endDate: timestamp
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp
}
```

### 3. Variables d'environnement
Créer un fichier `.env.local` :

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id

# Stripe Configuration (optionnel)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
VITE_STRIPE_SECRET_KEY=sk_test_votre_cle_secrete

# App Configuration
VITE_APP_NAME=Sophie - Accompagnatrice de Luxe
VITE_APP_URL=http://localhost:5173
```

## 🎨 Personnalisation

### Modifier le nom et les informations
- Éditer `src/components/Hero/HeroSection.jsx` pour changer le nom
- Modifier `src/components/Contact/ContactSection.jsx` pour les coordonnées
- Adapter `src/components/Footer/Footer.jsx` pour les liens

### Changer les couleurs
- Modifier les classes Tailwind dans les composants
- Palette actuelle : Rose/Pink et Purple
- Exemple : `from-pink-500 to-purple-600`

### Ajouter du contenu
- Photos : Remplacer les placeholders dans `src/components/Gallery/MediaGallery.jsx`
- Services : Modifier `src/components/Services/ServicesSection.jsx`
- Tarifs : Ajuster dans `src/components/Subscription/SubscriptionTiers.jsx`

## 🔐 Sécurité

### En Production
1. **Hasher les mots de passe** avec bcrypt ou similaire
2. **Valider les données** côté serveur
3. **Configurer les règles Firestore** pour la sécurité
4. **Utiliser HTTPS** en production
5. **Implémenter la vérification d'email**

### Règles Firestore recommandées
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📱 Fonctionnalités Avancées

### Système d'abonnements
- Gestion des abonnements Basic (29€/mois) et Premium VIP (79€/mois)
- Vérification du statut d'abonnement
- Accès au contenu premium conditionnel

### Tableau de bord
- Aperçu des statistiques
- Gestion de l'abonnement
- Informations du profil
- Historique des rendez-vous

### Réservation
- Formulaire multi-étapes
- Sélection de service, date et horaire
- Validation des données
- Confirmation par email (à implémenter)

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Uploader le dossier dist/ sur Netlify
```

### Configuration du domaine
- Ajouter votre domaine personnalisé
- Configurer les variables d'environnement en production
- Mettre à jour `VITE_APP_URL` avec votre domaine

## 📞 Support

Pour toute question ou personnalisation :
- Vérifier la documentation des composants
- Consulter les commentaires dans le code
- Adapter selon vos besoins spécifiques

## ⚖️ Aspects Légaux

- Respecter les lois locales sur l'activité
- Implémenter la vérification d'âge
- Ajouter les mentions légales
- Configurer la politique de confidentialité
- Respecter le RGPD

## 🔄 Mises à jour Futures

- Intégration Stripe complète
- Système de messagerie cryptée
- Streaming WebRTC
- Notifications push
- Analytics et monitoring

---

**Note**: Ce projet est conçu pour un usage professionnel et respecte les standards de qualité d'un service premium. Adaptez-le selon vos besoins et la réglementation locale.
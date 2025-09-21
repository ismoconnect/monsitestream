# Guide de Déploiement - SiteStream

Ce guide vous accompagne dans le déploiement de votre plateforme SiteStream.

## 🚀 Déploiement Rapide

### 1. Configuration Initiale

```bash
# Cloner le projet
git clone <votre-repo>
cd site-stream

# Installation des dépendances
npm install

# Configuration automatique
npm run setup
```

### 2. Configuration Firebase

#### Créer un projet Firebase
1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Créer un nouveau projet
3. Activer les services suivants :
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**
   - **Functions**

#### Configuration locale
```bash
# Se connecter à Firebase
firebase login

# Initialiser le projet (si pas déjà fait)
firebase init

# Sélectionner votre projet
firebase use --add
```

### 3. Configuration Stripe

1. Créer un compte [Stripe](https://stripe.com)
2. Récupérer les clés API dans le dashboard
3. Configurer les webhooks (voir section webhooks)

### 4. Variables d'Environnement

Créer un fichier `.env` avec :

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here

# Socket.io Configuration
VITE_SOCKET_URL=http://localhost:3001

# App Configuration
VITE_APP_NAME=SiteStream
VITE_APP_URL=http://localhost:5173
```

### 5. Configuration Firebase Functions

```bash
# Aller dans le dossier functions
cd functions

# Installer les dépendances
npm install

# Configurer les variables d'environnement
firebase functions:config:set stripe.secret_key="sk_test_your_secret_key"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"

# Retourner au dossier racine
cd ..
```

## 🌐 Déploiement

### Développement Local

```bash
# Démarrer le serveur de développement
npm run dev

# Démarrer les émulateurs Firebase (dans un autre terminal)
npm run firebase:emulators
```

### Déploiement en Production

#### 1. Build de l'application
```bash
npm run build
```

#### 2. Déploiement Firebase
```bash
# Déployer tout
npm run firebase:deploy

# Ou déployer séparément
npm run firebase:deploy:functions
npm run firebase:deploy:hosting
```

#### 3. Configuration des domaines personnalisés
```bash
# Ajouter un domaine personnalisé
firebase hosting:channel:deploy production --only hosting
```

## 🔧 Configuration Avancée

### Règles de Sécurité Firestore

Les règles sont déjà configurées dans `firestore.rules`. Pour les déployer :

```bash
firebase deploy --only firestore:rules
```

### Règles de Stockage

Les règles sont dans `storage.rules`. Pour les déployer :

```bash
firebase deploy --only storage
```

### Index Firestore

Les index sont dans `firestore.indexes.json`. Pour les déployer :

```bash
firebase deploy --only firestore:indexes
```

## 🔗 Configuration des Webhooks Stripe

### 1. Créer un webhook dans Stripe Dashboard

URL du webhook : `https://your-project.cloudfunctions.net/stripeWebhook`

Événements à écouter :
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 2. Récupérer le secret du webhook

Copier le secret du webhook et l'ajouter aux variables d'environnement :

```bash
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
```

## 📊 Monitoring et Analytics

### Firebase Analytics
- Automatiquement activé
- Dashboard disponible dans Firebase Console

### Monitoring des erreurs
- Configurer Sentry (optionnel)
- Logs Firebase Functions dans la console

### Métriques de performance
- Firebase Performance Monitoring
- Google Analytics 4

## 🔒 Sécurité

### Checklist de sécurité

- [ ] Règles Firestore configurées
- [ ] Règles Storage configurées
- [ ] Variables d'environnement sécurisées
- [ ] Webhooks Stripe configurés
- [ ] HTTPS activé
- [ ] Authentification obligatoire
- [ ] Validation côté serveur

### Tests de sécurité

```bash
# Tester les règles Firestore
firebase emulators:start --only firestore

# Tester les fonctions
firebase emulators:start --only functions
```

## 🚨 Dépannage

### Erreurs courantes

#### 1. Erreur de configuration Firebase
```bash
# Vérifier la configuration
firebase projects:list
firebase use --add
```

#### 2. Erreur de build
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 3. Erreur de déploiement
```bash
# Vérifier les logs
firebase functions:log
firebase hosting:channel:list
```

### Support

- **Documentation Firebase** : https://firebase.google.com/docs
- **Documentation Stripe** : https://stripe.com/docs
- **Issues GitHub** : [Créer une issue]

## 📈 Optimisation

### Performance

1. **Images** : Utiliser WebP, lazy loading
2. **Code splitting** : Déjà configuré avec Vite
3. **CDN** : Firebase Hosting utilise un CDN global
4. **Caching** : Configurer les headers de cache

### Coûts

1. **Firebase Spark** : Gratuit jusqu'à 50k lectures/jour
2. **Stripe** : 2.9% + 0.25€ par transaction
3. **Hébergement** : Gratuit sur Firebase Hosting

### Scaling

1. **Firebase Blaze** : Passer au plan payant si nécessaire
2. **Load balancing** : Automatique avec Firebase
3. **Database sharding** : Configurer les index composites

## 🎯 Prochaines étapes

1. **Tests** : Configurer les tests automatisés
2. **CI/CD** : GitHub Actions ou GitLab CI
3. **Monitoring** : Sentry, DataDog
4. **Backup** : Stratégie de sauvegarde Firestore
5. **Multi-environnements** : Dev, Staging, Prod

---

**Bon déploiement ! 🚀**

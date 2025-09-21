#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configuration de SiteStream...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Création du fichier .env...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Fichier .env créé. Veuillez le configurer avec vos clés Firebase et Stripe.\n');
  } else {
    console.log('❌ Fichier env.example non trouvé.\n');
  }
} else {
  console.log('✅ Fichier .env existe déjà.\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installation des dépendances...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dépendances installées.\n');
  } catch (error) {
    console.log('❌ Erreur lors de l\'installation des dépendances.\n');
    process.exit(1);
  }
} else {
  console.log('✅ Dépendances déjà installées.\n');
}

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI installé.\n');
} catch (error) {
  console.log('❌ Firebase CLI non installé. Installation...');
  try {
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    console.log('✅ Firebase CLI installé.\n');
  } catch (error) {
    console.log('❌ Erreur lors de l\'installation de Firebase CLI.\n');
    process.exit(1);
  }
}

// Check if Firebase project is initialized
const firebaseJsonPath = path.join(process.cwd(), 'firebase.json');
if (!fs.existsSync(firebaseJsonPath)) {
  console.log('❌ Firebase non initialisé. Veuillez exécuter "firebase init" d\'abord.\n');
} else {
  console.log('✅ Firebase initialisé.\n');
}

console.log('🎉 Configuration terminée !\n');
console.log('📋 Prochaines étapes :');
console.log('1. Configurez votre fichier .env avec vos clés Firebase et Stripe');
console.log('2. Exécutez "firebase login" pour vous connecter à Firebase');
console.log('3. Exécutez "firebase use --add" pour sélectionner votre projet');
console.log('4. Exécutez "npm run dev" pour démarrer le serveur de développement');
console.log('5. Exécutez "firebase emulators:start" pour tester les fonctions localement\n');

console.log('📚 Documentation :');
console.log('- README.md pour la configuration complète');
console.log('- Firebase Console pour la configuration du projet');
console.log('- Stripe Dashboard pour la configuration des paiements\n');

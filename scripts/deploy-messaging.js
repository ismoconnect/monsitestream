#!/usr/bin/env node

/**
 * Script de déploiement des règles et index Firestore pour la messagerie
 * Usage: node scripts/deploy-messaging.js [dev|prod]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'dev';

console.log(`🚀 Déploiement de la messagerie en environnement: ${environment}`);

// Vérifier que les fichiers existent
const requiredFiles = [
  'firestore.rules',
  'firestore-dev.rules',
  'firestore.indexes.json',
  'firebase.json'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Fichier manquant: ${file}`);
    process.exit(1);
  }
}

try {
  console.log('📋 Vérification de la configuration Firebase...');
  
  // Vérifier la configuration Firebase
  const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
  if (!firebaseConfig.firestore) {
    console.error('❌ Configuration Firestore manquante dans firebase.json');
    process.exit(1);
  }

  console.log('✅ Configuration Firebase vérifiée');

  if (environment === 'dev') {
    console.log('🔧 Déploiement des règles de développement...');
    
    // Sauvegarder les règles actuelles
    if (fs.existsSync('firestore.rules.backup')) {
      fs.unlinkSync('firestore.rules.backup');
    }
    fs.copyFileSync('firestore.rules', 'firestore.rules.backup');
    
    // Copier les règles de dev
    fs.copyFileSync('firestore-dev.rules', 'firestore.rules');
    
    console.log('⚠️  ATTENTION: Règles de développement activées (permissives)');
    
  } else if (environment === 'prod') {
    console.log('🔒 Déploiement des règles de production...');
    
    // S'assurer qu'on utilise les règles de production
    if (fs.existsSync('firestore.rules.backup')) {
      fs.copyFileSync('firestore.rules.backup', 'firestore.rules');
    }
    
    console.log('✅ Règles de production sécurisées activées');
  }

  // Déployer les règles et index
  console.log('📤 Déploiement vers Firebase...');
  execSync('firebase deploy --only firestore:rules,firestore:indexes', { 
    stdio: 'inherit' 
  });

  console.log('✅ Déploiement terminé avec succès!');
  
  // Informations post-déploiement
  console.log('\n📊 Collections créées:');
  console.log('  - conversations (conversations utilisateur-admin)');
  console.log('  - messages (messages de chaque conversation)');
  
  console.log('\n🔍 Index créés:');
  console.log('  - conversations: participants + lastMessageAt');
  console.log('  - messages: conversationId + timestamp');
  console.log('  - messages: conversationId + senderId + read');
  
  if (environment === 'dev') {
    console.log('\n⚠️  RAPPEL: Environnement de développement');
    console.log('   - Règles permissives actives');
    console.log('   - Ne pas utiliser en production');
    console.log('   - Pour la prod: node scripts/deploy-messaging.js prod');
  } else {
    console.log('\n🔒 PRODUCTION: Règles sécurisées actives');
    console.log('   - Accès restreint aux participants');
    console.log('   - Authentification requise');
    console.log('   - Admin a accès complet');
  }

  console.log('\n🧪 Pour tester:');
  console.log('   1. Connectez-vous sur l\'application');
  console.log('   2. Allez sur /messages');
  console.log('   3. Une conversation sera créée automatiquement');
  console.log('   4. L\'admin peut répondre depuis /admin');

} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error.message);
  
  // Restaurer les règles en cas d'erreur
  if (environment === 'dev' && fs.existsSync('firestore.rules.backup')) {
    fs.copyFileSync('firestore.rules.backup', 'firestore.rules');
    console.log('🔄 Règles restaurées après erreur');
  }
  
  process.exit(1);
}

#!/usr/bin/env node

/**
 * Script de vérification des variables d'environnement
 * À exécuter avant le démarrage du serveur
 * 
 * Usage:
 *   node scripts/check-env.js
 */

require('dotenv').config();

const REQUIRED_VARS = {
  'JWT_SECRET': 'Clé secrète pour les tokens JWT',
  'STRIPE_SECRET_KEY': 'Clé secrète Stripe (sk_test_... ou sk_live_...)',
  'FRONTEND_URL': 'URL du frontend pour CORS'
};

const OPTIONAL_VARS = {
  'DATABASE_URL': 'URL de connexion PostgreSQL (production)',
  'DB_HOST': 'Hôte PostgreSQL (développement local)',
  'DB_PORT': 'Port PostgreSQL (développement local)',
  'DB_NAME': 'Nom de la base de données (développement local)',
  'DB_USER': 'Utilisateur PostgreSQL (développement local)',
  'DB_PASSWORD': 'Mot de passe PostgreSQL (développement local)',
  'STRIPE_WEBHOOK_SECRET': 'Secret du webhook Stripe (whsec_...)',
  'STRIPE_PRICE_ID_PRO_MONTHLY': 'ID du prix Stripe pour Pro mensuel',
  'STRIPE_PRICE_ID_PRO_YEARLY': 'ID du prix Stripe pour Pro annuel',
  'STRIPE_PRICE_ID_ENTERPRISE_MONTHLY': 'ID du prix Stripe pour Enterprise mensuel',
  'STRIPE_PRICE_ID_ENTERPRISE_YEARLY': 'ID du prix Stripe pour Enterprise annuel',
  'MINIMA_SEED': 'Seed Minima pour les utilisateurs',
  'NODE_ENV': 'Environnement (development/production)',
  'PORT': 'Port du serveur'
};

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║                                                                  ║');
console.log('║        🔍 VÉRIFICATION DES VARIABLES D\'ENVIRONNEMENT            ║');
console.log('║                                                                  ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

let hasErrors = false;
let hasWarnings = false;

// Fonction pour masquer les valeurs sensibles
function maskValue(key, value) {
  if (!value) return 'NON DÉFINI';
  
  const sensitiveKeys = ['SECRET', 'KEY', 'PASSWORD', 'SEED'];
  const isSensitive = sensitiveKeys.some(k => key.includes(k));
  
  if (isSensitive) {
    return '***' + value.slice(-4);
  }
  
  return value;
}

// Vérifier les variables REQUISES
console.log('📋 VARIABLES REQUISES:\n');

Object.entries(REQUIRED_VARS).forEach(([key, description]) => {
  const value = process.env[key];
  const maskedValue = maskValue(key, value);
  
  if (value) {
    console.log(`   ✅ ${key.padEnd(25)} ${maskedValue}`);
    console.log(`      ${description}\n`);
  } else {
    console.log(`   ❌ ${key.padEnd(25)} NON DÉFINI`);
    console.log(`      ${description}\n`);
    hasErrors = true;
  }
});

// Vérifier les variables OPTIONNELLES
console.log('\n📋 VARIABLES OPTIONNELLES:\n');

Object.entries(OPTIONAL_VARS).forEach(([key, description]) => {
  const value = process.env[key];
  const maskedValue = maskValue(key, value);
  
  if (value) {
    console.log(`   ✅ ${key.padEnd(25)} ${maskedValue}`);
  } else {
    console.log(`   ⚠️  ${key.padEnd(25)} non défini`);
  }
  console.log(`      ${description}\n`);
});

// Vérification spéciale : DATABASE
console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🔗 CONFIGURATION BASE DE DONNÉES:\n');

if (process.env.DATABASE_URL) {
  console.log('   ✅ DATABASE_URL configuré (mode production)');
  console.log('      Format: postgresql://user:pass@host:port/db');
  console.log(`      Valeur: ***${process.env.DATABASE_URL.slice(-20)}\n`);
} else if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER) {
  console.log('   ✅ Variables séparées configurées (mode développement)');
  console.log(`      Host: ${process.env.DB_HOST}`);
  console.log(`      Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`      Database: ${process.env.DB_NAME}`);
  console.log(`      User: ${process.env.DB_USER}\n`);
} else {
  console.log('   ❌ AUCUNE configuration de base de données trouvée!');
  console.log('      Vous devez configurer soit:');
  console.log('      - DATABASE_URL (production)');
  console.log('      - DB_HOST, DB_NAME, DB_USER, DB_PASSWORD (développement)\n');
  hasErrors = true;
}

// Vérification spéciale : CORS
console.log('═══════════════════════════════════════════════════════════════════\n');
console.log('🌐 CONFIGURATION CORS:\n');

if (process.env.FRONTEND_URL) {
  const origins = process.env.FRONTEND_URL.split(',').map(o => o.trim());
  console.log(`   ✅ ${origins.length} origine(s) autorisée(s):`);
  origins.forEach(origin => {
    console.log(`      - ${origin}`);
  });
  console.log('');
} else {
  console.log('   ⚠️  FRONTEND_URL non défini, utilisation de http://localhost:3000 par défaut\n');
  hasWarnings = true;
}

// Résumé
console.log('═══════════════════════════════════════════════════════════════════\n');

if (hasErrors) {
  console.log('❌ ERREUR: Des variables requises sont manquantes!\n');
  console.log('💡 Pour corriger:');
  console.log('   1. Dans Dokploy/Railway: Ajoutez les variables dans l\'interface');
  console.log('   2. En local: Créez un fichier .env avec les variables manquantes');
  console.log('   3. Référez-vous à backend/.env.example pour les exemples\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  ATTENTION: Certaines variables optionnelles sont manquantes\n');
  console.log('   Le serveur peut démarrer mais certaines fonctionnalités');
  console.log('   peuvent ne pas fonctionner correctement.\n');
  process.exit(0);
} else {
  console.log('✅ SUCCÈS: Toutes les variables requises sont configurées!\n');
  console.log('   Vous pouvez démarrer le serveur en toute sécurité.\n');
  process.exit(0);
}


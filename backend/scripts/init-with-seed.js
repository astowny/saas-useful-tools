#!/usr/bin/env node

/**
 * Script d'initialisation de la base de données avec seed personnalisé
 * Utilisé pour Dokploy avec MINIMA_SEED
 * 
 * Usage:
 *   node scripts/init-with-seed.js
 *   MINIMA_SEED=your_seed node scripts/init-with-seed.js
 */

require('dotenv').config();
const { Pool } = require('pg');

// Support both DATABASE_URL and individual variables
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

const pool = new Pool(poolConfig);

// Récupérer le seed depuis les variables d'environnement
const MINIMA_SEED = process.env.MINIMA_SEED || 'default_seed';

console.log('🔐 MINIMA_SEED:', MINIMA_SEED ? '***' + MINIMA_SEED.slice(-4) : 'non défini');

const schema = `
-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  minima_seed VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Table des plans d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  features JSONB,
  limits JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des abonnements utilisateurs
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  billing_cycle VARCHAR(20),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de l'usage des outils
CREATE TABLE IF NOT EXISTS usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tool_name VARCHAR(100) NOT NULL,
  tool_category VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Table de l'historique des paiements
CREATE TABLE IF NOT EXISTS payment_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Initialisation de la base de données...');
    console.log('📍 Environnement:', process.env.NODE_ENV || 'development');
    console.log('🔗 Connexion:', process.env.DATABASE_URL ? 'DATABASE_URL' : 'Variables séparées');
    
    await client.query(schema);
    console.log('✅ Schéma créé avec succès');

    // Insérer les plans par défaut
    await client.query(`
      INSERT INTO subscription_plans (name, display_name, price_monthly, price_yearly, limits, features)
      VALUES
        ('free', 'Free', 0, 0,
         '{"daily_usage": 10, "monthly_usage": 100}',
         '["Accès à tous les outils", "10 utilisations par jour", "Support communautaire"]'),
        ('pro', 'Pro', 9.99, 99.99,
         '{"daily_usage": 1000, "monthly_usage": 30000}',
         '["Accès illimité aux outils", "1000 utilisations par jour", "Support prioritaire", "Export avancé", "Pas de publicité"]'),
        ('enterprise', 'Enterprise', 49.99, 499.99,
         '{"daily_usage": -1, "monthly_usage": -1}',
         '["Tout du plan Pro", "Utilisations illimitées", "Support dédié 24/7", "API access", "White-label", "SLA garanti"]')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Plans d\'abonnement insérés');

    console.log('🎉 Base de données initialisée avec succès!');
    console.log('🔐 MINIMA_SEED configuré pour les futurs utilisateurs');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();


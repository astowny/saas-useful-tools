require('dotenv').config();
const { Pool } = require('pg');

console.log('\n🔍 DEBUG: Variables d\'environnement');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? `***${process.env.DATABASE_URL.slice(-30)}` : 'NON DÉFINI');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NON DÉFINI');
console.log('DB_HOST:', process.env.DB_HOST || 'NON DÉFINI');

// Support both DATABASE_URL and individual variables (same as database.js)
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

console.log('\n🔧 Configuration de connexion:');
if (process.env.DATABASE_URL) {
  console.log('Mode: DATABASE_URL (production)');
  console.log('SSL:', poolConfig.ssl ? 'Activé' : 'Désactivé');
} else {
  console.log('Mode: Variables séparées (local)');
  console.log('Host:', poolConfig.host);
  console.log('Port:', poolConfig.port);
  console.log('Database:', poolConfig.database);
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('❌ Erreur de pool PostgreSQL:', err);
});

const schema = `
-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
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
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due, trialing
  billing_cycle VARCHAR(20), -- monthly, yearly
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

-- Table des jobs de génération vidéo IA
CREATE TABLE IF NOT EXISTS video_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  fal_request_id VARCHAR(255),
  model VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  prompt TEXT,
  video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_video_jobs_user_id ON video_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON video_jobs(status);

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
  console.log('\n🔄 Tentative de connexion à la base de données...');

  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connexion établie avec succès!');

    console.log('\n📋 Étape 1/3: Création du schéma...');
    await client.query(schema);
    console.log('✅ Schéma créé avec succès');

    console.log('\n📋 Étape 2/3: Vérification des plans existants...');
    const existingPlans = await client.query('SELECT name FROM subscription_plans');
    console.log(`   Plans existants: ${existingPlans.rows.length > 0 ? existingPlans.rows.map(p => p.name).join(', ') : 'aucun'}`);

    console.log('\n📋 Étape 3/3: Insertion des plans par défaut...');
    const result = await client.query(`
      INSERT INTO subscription_plans (name, display_name, price_monthly, price_yearly, limits, features)
      VALUES
        ('free', 'Free', 0, 0,
         '{"daily_usage": 10, "monthly_usage": 100, "video_monthly": 0}',
         '["Accès à tous les outils", "10 utilisations par jour", "Support communautaire", "Génération vidéo IA non disponible"]'),
        ('pro', 'Pro', 9.99, 99.99,
         '{"daily_usage": 1000, "monthly_usage": 30000, "video_monthly": 5}',
         '["Accès illimité aux outils", "1000 utilisations par jour", "Support prioritaire", "Export avancé", "Pas de publicité", "5 vidéos IA / mois (768p, 6s)"]'),
        ('enterprise', 'Enterprise', 49.99, 499.99,
         '{"daily_usage": -1, "monthly_usage": -1, "video_monthly": 30}',
         '["Tout du plan Pro", "Utilisations illimitées", "Support dédié 24/7", "API access", "White-label", "SLA garanti", "30 vidéos IA / mois (1080p, 6s)"]')
      ON CONFLICT (name) DO UPDATE SET
        limits = EXCLUDED.limits,
        features = EXCLUDED.features
      RETURNING name;
    `);

    if (result.rows.length > 0) {
      console.log(`✅ ${result.rows.length} plan(s) inséré(s): ${result.rows.map(p => p.name).join(', ')}`);
    } else {
      console.log('ℹ️  Aucun nouveau plan inséré (déjà existants)');
    }

    console.log('\n🎉 Base de données initialisée avec succès!');
    console.log('✅ Toutes les tables sont prêtes\n');

  } catch (error) {
    console.error('\n❌ ERREUR lors de l\'initialisation:');
    console.error('Type:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.detail) console.error('Détail:', error.detail);
    if (error.hint) console.error('Hint:', error.hint);
    console.error('\nStack trace complet:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (client) {
      console.log('\n🔌 Fermeture de la connexion...');
      client.release();
    }
    await pool.end();
    console.log('✅ Pool fermé\n');
  }
}

initDatabase();


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// ========================================
// VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT
// ========================================
const requiredEnvVars = [
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'FRONTEND_URL'
];

const optionalEnvVars = [
  'DATABASE_URL',
  'DB_HOST',
  'STRIPE_WEBHOOK_SECRET',
  'FAL_API_KEY'
];

console.log('\n🔍 Vérification des variables d\'environnement...\n');

// Vérifier les variables requises
const missingVars = [];
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('KEY') ? '***' + (process.env[varName].slice(-4) || '') : process.env[varName]}`);
  } else {
    console.log(`❌ ${varName}: NON DÉFINI`);
    missingVars.push(varName);
  }
});

// Afficher les variables optionnelles
console.log('\n📋 Variables optionnelles:');
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('SEED') || varName.includes('URL') && varName !== 'FRONTEND_URL' ? '***' + (process.env[varName].slice(-4) || '') : process.env[varName]}`);
  } else {
    console.log(`⚠️  ${varName}: non défini`);
  }
});

// Vérifier la base de données
if (process.env.DATABASE_URL) {
  console.log('\n🔗 Connexion DB: DATABASE_URL (production)');
} else if (process.env.DB_HOST) {
  console.log('\n🔗 Connexion DB: Variables séparées (local)');
} else {
  console.log('\n❌ ERREUR: Aucune configuration de base de données trouvée!');
  missingVars.push('DATABASE_URL ou DB_HOST');
}

console.log(`\n📍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`📍 PORT: ${process.env.PORT || 3001}\n`);

// Arrêter si des variables requises manquent
if (missingVars.length > 0) {
  console.error('\n❌ ERREUR: Variables d\'environnement manquantes:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\n💡 Configurez ces variables dans Dokploy/Railway ou dans votre fichier .env\n');
  process.exit(1);
}

console.log('✅ Toutes les variables requises sont configurées!\n');

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const subscriptionRoutes = require('./routes/subscription');
const usageRoutes = require('./routes/usage');
const stripeWebhookRoutes = require('./routes/stripe-webhook');
const toolsRoutes = require('./routes/tools');
const videoRoutes = require('./routes/video');
const enterpriseApiKeysRoutes = require('./routes/enterprise-api-keys');
const enterpriseSupportRoutes = require('./routes/enterprise-support');
const enterpriseWhiteLabelRoutes = require('./routes/enterprise-white-label');
const enterpriseSlaRoutes = require('./routes/enterprise-sla');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite de 100 requêtes par IP
});
app.use('/api/', limiter);

// Stripe webhook needs raw body
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRoutes);

// CORS - Support multiple origins separated by comma
// Security: In production, FRONTEND_URL must be explicitly set
if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
  console.error('❌ SECURITY ERROR: FRONTEND_URL must be set in production!');
  process.exit(1);
}

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => {
    // In production, block localhost origins
    if (process.env.NODE_ENV === 'production' && origin.includes('localhost')) {
      console.warn(`⚠️  WARNING: Ignoring localhost origin in production: ${origin}`);
      return false;
    }
    return true;
  });

console.log('🔒 CORS Configuration:');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    console.log(`📨 CORS request from origin: ${origin}`);

    // In production, reject requests with no origin for security
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        console.log('   ❌ BLOCKED - No origin in production');
        return callback(new Error('Not allowed by CORS - No origin'));
      }
      console.log('   ✅ Allowed (no origin - development mode)');
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('   ✅ Allowed');
      callback(null, true);
    } else {
      console.log('   ❌ BLOCKED - Not in allowed origins');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/video', videoRoutes);

// Routes Enterprise
app.use('/api/enterprise/api-keys', enterpriseApiKeysRoutes);
app.use('/api/enterprise/support', enterpriseSupportRoutes);
app.use('/api/enterprise/white-label', enterpriseWhiteLabelRoutes);
app.use('/api/enterprise/sla', enterpriseSlaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

// ── Auto-migration: create enterprise tables if missing ──
const ensureEnterpriseSchema = async () => {
  try {
    // 1. Ensure the trigger function exists first
    await db.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // 2. Create enterprise tables (all idempotent)
    await db.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        key_hash VARCHAR(64) NOT NULL,
        key_prefix VARCHAR(20) NOT NULL,
        last_used_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS support_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_staff BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS white_label_config (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        app_name VARCHAR(100) DEFAULT 'Useful Tools',
        logo_url TEXT,
        primary_color VARCHAR(7) DEFAULT '#3B82F6',
        accent_color VARCHAR(7) DEFAULT '#8B5CF6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS uptime_checks (
        id SERIAL PRIMARY KEY,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) NOT NULL,
        response_time_ms INTEGER,
        endpoint VARCHAR(255),
        error_message TEXT
      );
    `);

    // 3. Fix key_prefix column if it was created with old VARCHAR(10)
    await db.query(`ALTER TABLE api_keys ALTER COLUMN key_prefix TYPE VARCHAR(20);`).catch(() => {});

    // 4. Indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
      CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_uptime_checks_checked_at ON uptime_checks(checked_at);
    `);

    // 5. Triggers (DROP IF EXISTS first to avoid duplicates)
    await db.query(`
      DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
      CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      DROP TRIGGER IF EXISTS update_white_label_config_updated_at ON white_label_config;
      CREATE TRIGGER update_white_label_config_updated_at BEFORE UPDATE ON white_label_config
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Enterprise schema ready');
  } catch (err) {
    console.error('❌ Enterprise schema migration error:', err.message);
  }
};

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);

  // Run enterprise schema migration on every startup (idempotent)
  ensureEnterpriseSchema();

  // ── SLA Health check job (every 60 seconds) ──
  const runHealthCheck = async () => {
    const start = Date.now();
    try {
      const response = await fetch(`http://localhost:${PORT}/health`);
      const elapsed = Date.now() - start;
      const status = response.ok ? 'up' : 'degraded';
      await db.query(
        `INSERT INTO uptime_checks (status, response_time_ms, endpoint) VALUES ($1, $2, $3)`,
        [status, elapsed, '/health']
      );
    } catch (err) {
      const elapsed = Date.now() - start;
      console.error('Health check failed:', err.message);
      await db.query(
        `INSERT INTO uptime_checks (status, response_time_ms, endpoint, error_message) VALUES ($1, $2, $3, $4)`,
        ['down', elapsed, '/health', err.message]
      ).catch(() => {});
    }
  };

  // Run immediately after boot, then every 60s
  setTimeout(runHealthCheck, 5000);
  setInterval(runHealthCheck, 60000);
  console.log('📊 SLA health check job started (every 60s)');
});

module.exports = app;


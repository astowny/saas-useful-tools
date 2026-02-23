const db = require('../config/database');

/**
 * Middleware: vérifie que l'utilisateur a un plan Enterprise actif.
 * Doit être utilisé APRÈS authenticateToken.
 */
const requireEnterprise = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Authentification requise', code: 'AUTH_REQUIRED' } });
    }

    const result = await db.query(
      `SELECT sp.name AS plan_name
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1 AND us.status = 'active'
       ORDER BY us.created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: { message: 'Aucun abonnement actif', code: 'NO_SUBSCRIPTION' } });
    }

    if (result.rows[0].plan_name !== 'enterprise') {
      return res.status(403).json({
        error: {
          message: 'Cette fonctionnalité est réservée au plan Enterprise',
          code: 'ENTERPRISE_REQUIRED'
        }
      });
    }

    req.planName = result.rows[0].plan_name;
    next();
  } catch (error) {
    console.error('requireEnterprise error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
};

module.exports = { requireEnterprise };


const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/user/profile
 * Récupérer le profil complet de l'utilisateur
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, email, full_name, created_at, email_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Utilisateur non trouvé' } });
    }

    const user = userResult.rows[0];

    // Récupérer l'abonnement actuel
    const subResult = await db.query(`
      SELECT 
        sp.name as plan_name, sp.display_name, sp.limits,
        us.status, us.billing_cycle, us.current_period_end
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active'
      ORDER BY us.created_at DESC
      LIMIT 1
    `, [req.user.id]);

    const subscription = subResult.rows[0] || null;

    res.json({
      user,
      subscription
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la récupération du profil' } });
  }
});

/**
 * PUT /api/user/profile
 * Mettre à jour le profil de l'utilisateur
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName } = req.body;

    const result = await db.query(
      'UPDATE users SET full_name = $1 WHERE id = $2 RETURNING id, email, full_name, created_at',
      [fullName, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la mise à jour du profil' } });
  }
});

module.exports = router;


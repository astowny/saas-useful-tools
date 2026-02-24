const express = require('express');
const bcrypt = require('bcryptjs');
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

/**
 * PUT /api/user/change-password
 * Change the authenticated user's password
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: { message: 'Mot de passe actuel et nouveau mot de passe requis' } });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' } });
    }

    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Utilisateur non trouvé' } });
    }

    const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: { message: 'Mot de passe actuel incorrect' } });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

/**
 * DELETE /api/user/account
 * Delete the authenticated user's account and all data
 */
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: { message: 'Mot de passe requis pour supprimer le compte' } });
    }

    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Utilisateur non trouvé' } });
    }

    const isValid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: { message: 'Mot de passe incorrect' } });
    }

    // CASCADE will handle subscriptions, usage, api_keys, etc.
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

module.exports = router;


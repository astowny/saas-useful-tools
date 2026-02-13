const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getUserUsageStats } = require('../middleware/quota');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/usage/stats
 * Récupérer les statistiques d'usage de l'utilisateur
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const stats = await getUserUsageStats(req.user.id, period);

    // Récupérer aussi les limites du plan
    const subscriptionResult = await db.query(`
      SELECT sp.name, sp.display_name, sp.limits
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active'
      ORDER BY us.created_at DESC
      LIMIT 1
    `, [req.user.id]);

    const subscription = subscriptionResult.rows[0] || null;

    // Calculer l'usage total
    const totalUsage = stats.reduce((sum, stat) => sum + parseInt(stat.usage_count), 0);

    res.json({
      period,
      totalUsage,
      toolsUsage: stats,
      subscription: subscription ? {
        plan: subscription.name,
        displayName: subscription.display_name,
        limits: subscription.limits
      } : null
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la récupération des statistiques' } });
  }
});

/**
 * GET /api/usage/quota
 * Récupérer les quotas actuels de l'utilisateur
 */
router.get('/quota', authenticateToken, async (req, res) => {
  try {
    // Récupérer le plan
    const subscriptionResult = await db.query(`
      SELECT sp.limits
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active'
      ORDER BY us.created_at DESC
      LIMIT 1
    `, [req.user.id]);

    if (subscriptionResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Aucun abonnement actif' } });
    }

    const limits = subscriptionResult.rows[0].limits;

    // Usage quotidien
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyUsageResult = await db.query(`
      SELECT COUNT(*) as count
      FROM usage_logs
      WHERE user_id = $1 AND timestamp >= $2
    `, [req.user.id, today]);

    const dailyUsage = parseInt(dailyUsageResult.rows[0].count);

    // Usage mensuel
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthlyUsageResult = await db.query(`
      SELECT COUNT(*) as count
      FROM usage_logs
      WHERE user_id = $1 AND timestamp >= $2
    `, [req.user.id, firstDayOfMonth]);

    const monthlyUsage = parseInt(monthlyUsageResult.rows[0].count);

    res.json({
      daily: {
        limit: limits.daily_usage,
        used: dailyUsage,
        remaining: limits.daily_usage === -1 ? -1 : Math.max(0, limits.daily_usage - dailyUsage),
        unlimited: limits.daily_usage === -1
      },
      monthly: {
        limit: limits.monthly_usage,
        used: monthlyUsage,
        remaining: limits.monthly_usage === -1 ? -1 : Math.max(0, limits.monthly_usage - monthlyUsage),
        unlimited: limits.monthly_usage === -1
      }
    });
  } catch (error) {
    console.error('Get quota error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la récupération des quotas' } });
  }
});

module.exports = router;


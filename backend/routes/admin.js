const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

const ADMIN_EMAIL = 'astowny@gmail.com';

const requireAdmin = (req, res, next) => {
  if (req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }
  next();
};

// GET /api/admin/users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.email, u.full_name, u.created_at,
        COALESCE(s.plan_name, 'free') as plan_name,
        COALESCE(
          (SELECT COUNT(*) FROM usage_logs ul
           WHERE ul.user_id = u.id AND ul.created_at >= CURRENT_DATE),
          0
        ) as usage_today
      FROM users u
      LEFT JOIN user_subscriptions s ON s.user_id = u.id AND s.status = 'active'
      ORDER BY u.created_at DESC
      LIMIT 200
    `);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: { message: 'Error fetching users' } });
  }
});

// GET /api/admin/stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM user_subscriptions
         WHERE status = 'active' AND plan_name = 'pro') as pro_users,
        (SELECT COUNT(*) FROM user_subscriptions
         WHERE status = 'active' AND plan_name = 'enterprise') as enterprise_users,
        (SELECT COUNT(*) FROM usage_logs) as total_usage
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Admin get stats error:', error);
    res.status(500).json({ error: { message: 'Error fetching stats' } });
  }
});

module.exports = router;


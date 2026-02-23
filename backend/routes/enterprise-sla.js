const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireEnterprise } = require('../middleware/enterprise');

// GET /api/enterprise/sla — stats SLA (uptime %, temps de réponse, incidents)
router.get('/', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Stats globales sur la période
    const statsResult = await db.query(
      `SELECT
         COUNT(*) AS total_checks,
         COUNT(*) FILTER (WHERE status = 'up') AS up_checks,
         COUNT(*) FILTER (WHERE status = 'down') AS down_checks,
         COUNT(*) FILTER (WHERE status = 'degraded') AS degraded_checks,
         ROUND(AVG(response_time_ms)) AS avg_response_time_ms,
         ROUND(MIN(response_time_ms)) AS min_response_time_ms,
         ROUND(MAX(response_time_ms)) AS max_response_time_ms
       FROM uptime_checks
       WHERE checked_at >= $1`,
      [since]
    );

    const stats = statsResult.rows[0];
    const total = parseInt(stats.total_checks) || 0;
    const upCount = parseInt(stats.up_checks) || 0;
    const uptimePercent = total > 0 ? ((upCount / total) * 100).toFixed(3) : '100.000';

    // Derniers 50 checks pour le graphique
    const checksResult = await db.query(
      `SELECT checked_at, status, response_time_ms, endpoint, error_message
       FROM uptime_checks
       WHERE checked_at >= $1
       ORDER BY checked_at DESC
       LIMIT 50`,
      [since]
    );

    // Incidents (status = 'down') sur la période
    const incidentsResult = await db.query(
      `SELECT checked_at, status, response_time_ms, endpoint, error_message
       FROM uptime_checks
       WHERE checked_at >= $1 AND status != 'up'
       ORDER BY checked_at DESC
       LIMIT 20`,
      [since]
    );

    // Statut actuel (dernier check)
    const latestResult = await db.query(
      `SELECT status, response_time_ms, checked_at
       FROM uptime_checks
       ORDER BY checked_at DESC
       LIMIT 1`
    );

    const currentStatus = latestResult.rows.length > 0
      ? latestResult.rows[0].status
      : 'unknown';

    res.json({
      period_days: days,
      current_status: currentStatus,
      uptime_percent: parseFloat(uptimePercent),
      sla_target: 99.9,
      sla_met: parseFloat(uptimePercent) >= 99.9,
      stats: {
        total_checks: total,
        up_checks: upCount,
        down_checks: parseInt(stats.down_checks) || 0,
        degraded_checks: parseInt(stats.degraded_checks) || 0,
        avg_response_time_ms: parseInt(stats.avg_response_time_ms) || 0,
        min_response_time_ms: parseInt(stats.min_response_time_ms) || 0,
        max_response_time_ms: parseInt(stats.max_response_time_ms) || 0
      },
      recent_checks: checksResult.rows,
      incidents: incidentsResult.rows
    });
  } catch (error) {
    console.error('GET sla error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

module.exports = router;


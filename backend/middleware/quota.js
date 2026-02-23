const db = require('../config/database');

/**
 * Middleware pour vérifier et incrémenter les quotas d'utilisation
 */
const checkQuota = (toolName, toolCategory = 'general') => {
  return async (req, res, next) => {
    try {
      // Si pas d'utilisateur connecté, on bloque (ou on peut autoriser avec limite IP)
      if (!req.user) {
        return res.status(401).json({ 
          error: { 
            message: 'Authentification requise pour utiliser cet outil',
            code: 'AUTH_REQUIRED'
          } 
        });
      }

      const userId = req.user.id;

      // Récupérer le plan de l'utilisateur
      const subscriptionResult = await db.query(`
        SELECT sp.limits, us.status
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = $1 AND us.status = 'active'
        ORDER BY us.created_at DESC
        LIMIT 1
      `, [userId]);

      if (subscriptionResult.rows.length === 0) {
        return res.status(403).json({ 
          error: { 
            message: 'Aucun abonnement actif',
            code: 'NO_ACTIVE_SUBSCRIPTION'
          } 
        });
      }

      const limits = subscriptionResult.rows[0].limits;

      // -1 signifie illimité
      if (limits.daily_usage === -1 && limits.monthly_usage === -1) {
        // Enregistrer l'usage sans vérifier les limites
        await logUsage(userId, toolName, toolCategory);
        return next();
      }

      // Vérifier l'usage quotidien
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyUsageResult = await db.query(`
        SELECT COUNT(*) as count
        FROM usage_logs
        WHERE user_id = $1 AND timestamp >= $2
      `, [userId, today]);

      const dailyUsage = parseInt(dailyUsageResult.rows[0].count);

      if (limits.daily_usage !== -1 && dailyUsage >= limits.daily_usage) {
        return res.status(429).json({ 
          error: { 
            message: `Limite quotidienne atteinte (${limits.daily_usage} utilisations/jour)`,
            code: 'DAILY_LIMIT_EXCEEDED',
            limit: limits.daily_usage,
            used: dailyUsage
          } 
        });
      }

      // Vérifier l'usage mensuel
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const monthlyUsageResult = await db.query(`
        SELECT COUNT(*) as count
        FROM usage_logs
        WHERE user_id = $1 AND timestamp >= $2
      `, [userId, firstDayOfMonth]);

      const monthlyUsage = parseInt(monthlyUsageResult.rows[0].count);

      if (limits.monthly_usage !== -1 && monthlyUsage >= limits.monthly_usage) {
        return res.status(429).json({ 
          error: { 
            message: `Limite mensuelle atteinte (${limits.monthly_usage} utilisations/mois)`,
            code: 'MONTHLY_LIMIT_EXCEEDED',
            limit: limits.monthly_usage,
            used: monthlyUsage
          } 
        });
      }

      // Enregistrer l'usage
      await logUsage(userId, toolName, toolCategory);

      // Ajouter les infos de quota à la requête
      req.quota = {
        dailyLimit: limits.daily_usage,
        dailyUsed: dailyUsage + 1,
        monthlyLimit: limits.monthly_usage,
        monthlyUsed: monthlyUsage + 1
      };

      next();
    } catch (error) {
      console.error('Quota check error:', error);
      res.status(500).json({ error: { message: 'Erreur lors de la vérification des quotas' } });
    }
  };
};

/**
 * Enregistrer l'utilisation d'un outil
 */
async function logUsage(userId, toolName, toolCategory, metadata = null) {
  await db.query(
    'INSERT INTO usage_logs (user_id, tool_name, tool_category, metadata) VALUES ($1, $2, $3, $4)',
    [userId, toolName, toolCategory, metadata ? JSON.stringify(metadata) : null]
  );
}

/**
 * Récupérer les statistiques d'usage d'un utilisateur
 */
async function getUserUsageStats(userId, period = 'month') {
  let startDate;
  const now = new Date();

  switch (period) {
    case 'day':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const result = await db.query(`
    SELECT 
      tool_name,
      tool_category,
      COUNT(*) as usage_count,
      MAX(timestamp) as last_used
    FROM usage_logs
    WHERE user_id = $1 AND timestamp >= $2
    GROUP BY tool_name, tool_category
    ORDER BY usage_count DESC
  `, [userId, startDate]);

  return result.rows;
}

/**
 * Middleware pour vérifier le quota vidéo mensuel d'un utilisateur.
 * Les utilisateurs Free (video_monthly=0) sont bloqués IMMÉDIATEMENT
 * sans jamais appeler l'API fal.ai → zéro coût pour le plan gratuit.
 */
const checkVideoQuota = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Authentification requise', code: 'AUTH_REQUIRED' }
      });
    }

    const userId = req.user.id;

    // Récupérer le plan actif de l'utilisateur
    const subResult = await db.query(`
      SELECT sp.name AS plan_name, sp.limits
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active'
      ORDER BY us.created_at DESC
      LIMIT 1
    `, [userId]);

    if (subResult.rows.length === 0) {
      return res.status(403).json({
        error: { message: 'Aucun abonnement actif', code: 'NO_ACTIVE_SUBSCRIPTION' }
      });
    }

    const { plan_name, limits } = subResult.rows[0];
    const videoLimit = limits.video_monthly !== undefined ? limits.video_monthly : 0;

    // Plan Free (ou tout plan avec video_monthly=0) → refus immédiat, 0 appel API externe
    if (videoLimit === 0) {
      return res.status(403).json({
        error: {
          message: 'La génération de vidéos IA est disponible à partir du plan Pro.',
          code: 'VIDEO_UPGRADE_REQUIRED',
          plan: plan_name
        }
      });
    }

    // Compter les vidéos générées ce mois-ci (statuts terminaux uniquement)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const usageResult = await db.query(`
      SELECT COUNT(*) AS count
      FROM video_jobs
      WHERE user_id = $1
        AND created_at >= $2
        AND status IN ('completed', 'processing', 'pending')
    `, [userId, firstDayOfMonth]);

    const videoUsed = parseInt(usageResult.rows[0].count);

    // videoLimit = -1 signifie illimité (Enterprise sans plafond vidéo futur)
    if (videoLimit !== -1 && videoUsed >= videoLimit) {
      return res.status(429).json({
        error: {
          message: `Limite mensuelle de vidéos atteinte (${videoLimit} vidéos/mois)`,
          code: 'VIDEO_MONTHLY_LIMIT_EXCEEDED',
          limit: videoLimit,
          used: videoUsed
        }
      });
    }

    // Attacher les infos pour la suite du traitement
    req.videoQuota = { limit: videoLimit, used: videoUsed };
    req.userPlan = plan_name;

    next();
  } catch (error) {
    console.error('checkVideoQuota error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la vérification du quota vidéo' } });
  }
};

module.exports = {
  checkQuota,
  checkVideoQuota,
  logUsage,
  getUserUsageStats
};


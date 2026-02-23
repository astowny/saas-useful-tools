const express = require('express');
const { fal } = require('@fal-ai/client');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { checkVideoQuota } = require('../middleware/quota');

const router = express.Router();

// Modèles vidéo par plan
const VIDEO_MODELS = {
  standard: 'fal-ai/minimax/hailuo-2.3/standard/text-to-video', // Pro  (768p, 6s)
  hd:       'fal-ai/minimax/hailuo-2.3/pro/text-to-video'       // Enterprise (1080p, 6s)
};

/**
 * GET /api/video/quota
 * Quota vidéo de l'utilisateur pour le mois en cours
 */
router.get('/quota', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subResult = await db.query(`
      SELECT sp.name AS plan_name, sp.limits
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active'
      ORDER BY us.created_at DESC LIMIT 1
    `, [userId]);

    if (subResult.rows.length === 0) {
      return res.status(403).json({ error: { message: 'Aucun abonnement actif', code: 'NO_ACTIVE_SUBSCRIPTION' } });
    }

    const { plan_name, limits } = subResult.rows[0];
    const videoLimit = limits.video_monthly !== undefined ? limits.video_monthly : 0;

    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const usageResult = await db.query(`
      SELECT COUNT(*) AS count FROM video_jobs
      WHERE user_id = $1 AND created_at >= $2
        AND status IN ('completed', 'processing', 'pending')
    `, [userId, firstDayOfMonth]);

    const videoUsed = parseInt(usageResult.rows[0].count);

    res.json({
      plan: plan_name,
      limit: videoLimit,
      used: videoUsed,
      remaining: videoLimit === -1 ? -1 : Math.max(0, videoLimit - videoUsed)
    });
  } catch (error) {
    console.error('Video quota error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la récupération du quota' } });
  }
});



/**
 * POST /api/video/generate
 * Soumet une génération vidéo via fal.ai.
 * Les utilisateurs Free sont bloqués AVANT cet appel par checkVideoQuota
 * → zéro coût API pour le plan gratuit.
 */
router.post('/generate', authenticateToken, checkVideoQuota, async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt } = req.body;
    const userPlan = req.userPlan;

    if (!prompt || prompt.trim().length < 10) {
      return res.status(400).json({ error: { message: 'Le prompt doit contenir au moins 10 caractères' } });
    }
    if (prompt.trim().length > 500) {
      return res.status(400).json({ error: { message: 'Le prompt ne peut pas dépasser 500 caractères' } });
    }

    if (!process.env.FAL_API_KEY) {
      return res.status(503).json({ error: { message: 'Service de génération vidéo non configuré (clé API manquante)' } });
    }

    // Configure le client fal.ai (idempotent)
    fal.config({ credentials: process.env.FAL_API_KEY });

    // Choix du modèle selon le plan
    const model = userPlan === 'enterprise' ? VIDEO_MODELS.hd : VIDEO_MODELS.standard;

    // Soumission à la queue asynchrone fal.ai
    const { request_id } = await fal.queue.submit(model, {
      input: { prompt: prompt.trim(), prompt_optimizer: true }
    });

    // Créer l'entrée dans video_jobs
    const jobResult = await db.query(`
      INSERT INTO video_jobs (user_id, fal_request_id, model, status, prompt)
      VALUES ($1, $2, $3, 'pending', $4) RETURNING id
    `, [userId, request_id, model, prompt.trim()]);

    res.json({ success: true, jobId: jobResult.rows[0].id });
  } catch (error) {
    console.error('Video generate error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la soumission de la génération vidéo' } });
  }
});

/**
 * GET /api/video/status/:jobId
 * Retourne le statut d'un job vidéo, en interrogeant fal.ai si nécessaire.
 */
router.get('/status/:jobId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const jobResult = await db.query(`
      SELECT id, fal_request_id, model, status, prompt, video_url, error_message
      FROM video_jobs WHERE id = $1 AND user_id = $2
    `, [jobId, userId]);

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Job introuvable' } });
    }

    const job = jobResult.rows[0];

    // Statut terminal déjà en base → renvoyer directement
    if (job.status === 'completed' || job.status === 'failed') {
      return res.json({ status: job.status, video_url: job.video_url, error_message: job.error_message, prompt: job.prompt });
    }

    // Interroger fal.ai pour les jobs en cours
    fal.config({ credentials: process.env.FAL_API_KEY });
    try {
      const statusResult = await fal.queue.status(job.model, { requestId: job.fal_request_id, logs: false });
      let newStatus = job.status;
      let videoUrl = null;
      let errorMessage = null;

      if (statusResult.status === 'COMPLETED') {
        const result = await fal.queue.result(job.model, { requestId: job.fal_request_id });
        videoUrl = result.data?.video?.url || null;
        newStatus = videoUrl ? 'completed' : 'failed';
        errorMessage = videoUrl ? null : 'Aucune URL vidéo retournée';
      } else if (statusResult.status === 'IN_PROGRESS') {
        newStatus = 'processing';
      } else {
        newStatus = 'pending';
      }

      await db.query(
        'UPDATE video_jobs SET status=$1, video_url=$2, error_message=$3, updated_at=NOW() WHERE id=$4',
        [newStatus, videoUrl, errorMessage, jobId]
      );

      res.json({ status: newStatus, video_url: videoUrl, error_message: errorMessage, prompt: job.prompt });
    } catch (falError) {
      console.error('fal.ai status error:', falError);
      await db.query(
        'UPDATE video_jobs SET status=\'failed\', error_message=$1, updated_at=NOW() WHERE id=$2',
        [falError.message || 'Erreur fal.ai', jobId]
      );
      res.json({ status: 'failed', error_message: falError.message || 'Erreur lors de la génération', prompt: job.prompt });
    }
  } catch (error) {
    console.error('Video status error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la récupération du statut' } });
  }
});

module.exports = router;

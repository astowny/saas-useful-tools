const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireEnterprise } = require('../middleware/enterprise');

// GET /api/enterprise/white-label — récupérer la config branding de l'utilisateur
router.get('/', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, app_name, logo_url, primary_color, accent_color, created_at, updated_at
       FROM white_label_config WHERE user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Retourner les valeurs par défaut si pas encore configuré
      return res.json({
        config: {
          app_name: 'Useful Tools',
          logo_url: null,
          primary_color: '#3B82F6',
          accent_color: '#8B5CF6'
        }
      });
    }

    res.json({ config: result.rows[0] });
  } catch (error) {
    console.error('GET white-label error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

// PUT /api/enterprise/white-label — mettre à jour la config branding
router.put('/', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const { app_name, logo_url, primary_color, accent_color } = req.body;

    // Validation
    if (app_name && app_name.trim().length > 100) {
      return res.status(400).json({ error: { message: 'Le nom de l\'app ne peut pas dépasser 100 caractères' } });
    }
    const hexColorRegex = /^#([0-9A-Fa-f]{6})$/;
    if (primary_color && !hexColorRegex.test(primary_color)) {
      return res.status(400).json({ error: { message: 'Couleur primaire invalide (format #RRGGBB)' } });
    }
    if (accent_color && !hexColorRegex.test(accent_color)) {
      return res.status(400).json({ error: { message: 'Couleur accent invalide (format #RRGGBB)' } });
    }
    if (logo_url && logo_url.length > 500) {
      return res.status(400).json({ error: { message: 'URL du logo trop longue (max 500 caractères)' } });
    }

    const result = await db.query(
      `INSERT INTO white_label_config (user_id, app_name, logo_url, primary_color, accent_color)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         app_name = COALESCE(EXCLUDED.app_name, white_label_config.app_name),
         logo_url = EXCLUDED.logo_url,
         primary_color = COALESCE(EXCLUDED.primary_color, white_label_config.primary_color),
         accent_color = COALESCE(EXCLUDED.accent_color, white_label_config.accent_color),
         updated_at = NOW()
       RETURNING id, app_name, logo_url, primary_color, accent_color, updated_at`,
      [
        req.user.id,
        app_name ? app_name.trim() : 'Useful Tools',
        logo_url || null,
        primary_color || '#3B82F6',
        accent_color || '#8B5CF6'
      ]
    );

    res.json({ config: result.rows[0], message: 'Configuration mise à jour avec succès' });
  } catch (error) {
    console.error('PUT white-label error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

module.exports = router;


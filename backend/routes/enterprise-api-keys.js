const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireEnterprise } = require('../middleware/enterprise');

// GET /api/enterprise/api-keys — liste les clés de l'utilisateur
router.get('/', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, key_prefix, last_used_at, is_active, created_at
       FROM api_keys
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ keys: result.rows });
  } catch (error) {
    console.error('GET api-keys error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

// POST /api/enterprise/api-keys — génère une nouvelle clé
router.post('/', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: { message: 'Le nom de la clé est requis' } });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ error: { message: 'Le nom ne peut pas dépasser 100 caractères' } });
    }

    // Vérifier limite (max 10 clés actives)
    const countResult = await db.query(
      'SELECT COUNT(*) FROM api_keys WHERE user_id = $1 AND is_active = true',
      [req.user.id]
    );
    if (parseInt(countResult.rows[0].count) >= 10) {
      return res.status(400).json({ error: { message: 'Limite de 10 clés API actives atteinte' } });
    }

    // Générer la clé: format "ut_live_<32 hex chars>"
    const rawKey = 'ut_live_' + crypto.randomBytes(24).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 15); // "ut_live_xxxxxxx"

    const result = await db.query(
      `INSERT INTO api_keys (user_id, name, key_hash, key_prefix)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, key_prefix, is_active, created_at`,
      [req.user.id, name.trim(), keyHash, keyPrefix]
    );

    // On retourne la clé complète UNE SEULE FOIS
    res.status(201).json({
      key: result.rows[0],
      full_key: rawKey,
      warning: 'Copiez cette clé maintenant, elle ne sera plus affichée.'
    });
  } catch (error) {
    console.error('POST api-keys error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

// DELETE /api/enterprise/api-keys/:id — révoque une clé
router.delete('/:id', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE api_keys SET is_active = false
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Clé introuvable' } });
    }
    res.json({ message: 'Clé révoquée avec succès' });
  } catch (error) {
    console.error('DELETE api-keys error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

module.exports = router;


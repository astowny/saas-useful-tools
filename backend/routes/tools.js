const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { checkQuota } = require('../middleware/quota');

const router = express.Router();

/**
 * POST /api/tools/:toolName/use
 * Enregistrer l'utilisation d'un outil (avec vérification de quota)
 */
router.post('/:toolName/use', authenticateToken, async (req, res) => {
  const { toolName } = req.params;
  const { category = 'general' } = req.body;

  // Créer un middleware de quota dynamique pour cet outil
  const quotaMiddleware = checkQuota(toolName, category);

  // Exécuter le middleware de quota
  quotaMiddleware(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: { message: 'Erreur lors de la vérification du quota' } });
    }

    // Si on arrive ici, le quota est OK et l'usage a été enregistré
    res.json({
      success: true,
      message: 'Utilisation enregistrée',
      quota: req.quota // Ajouté par le middleware checkQuota
    });
  });
});

module.exports = router;


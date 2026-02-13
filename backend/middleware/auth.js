const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Middleware pour vérifier le token JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: { message: 'Token manquant' } });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: { message: 'Token invalide ou expiré' } });
      }

      // Vérifier que l'utilisateur existe toujours
      const result = await db.query(
        'SELECT id, email, full_name, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Utilisateur non trouvé' } });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({ error: { message: 'Compte désactivé' } });
      }

      req.user = {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      };

      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
};

/**
 * Middleware optionnel - ajoute l'utilisateur si token présent, mais ne bloque pas
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return next();
      }

      const result = await db.query(
        'SELECT id, email, full_name FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        req.user = {
          id: user.id,
          email: user.email,
          fullName: user.full_name
        };
      }

      next();
    });
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};


const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireEnterprise } = require('../middleware/enterprise');

// GET /api/enterprise/support — liste les tickets de l'utilisateur
router.get('/', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT st.id, st.subject, st.status, st.priority, st.created_at, st.updated_at,
              COUNT(sm.id) AS message_count
       FROM support_tickets st
       LEFT JOIN support_messages sm ON sm.ticket_id = st.id
       WHERE st.user_id = $1
       GROUP BY st.id
       ORDER BY st.updated_at DESC`,
      [req.user.id]
    );
    res.json({ tickets: result.rows });
  } catch (error) {
    console.error('GET support tickets error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

// POST /api/enterprise/support — créer un ticket
router.post('/', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const { subject, message, priority = 'normal' } = req.body;
    if (!subject || subject.trim().length === 0) {
      return res.status(400).json({ error: { message: 'Le sujet est requis' } });
    }
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: { message: 'Le message est requis' } });
    }
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: { message: 'Priorité invalide' } });
    }

    const ticketResult = await db.query(
      `INSERT INTO support_tickets (user_id, subject, priority)
       VALUES ($1, $2, $3)
       RETURNING id, subject, status, priority, created_at`,
      [req.user.id, subject.trim(), priority]
    );
    const ticket = ticketResult.rows[0];

    await db.query(
      `INSERT INTO support_messages (ticket_id, user_id, message, is_staff)
       VALUES ($1, $2, $3, false)`,
      [ticket.id, req.user.id, message.trim()]
    );

    res.status(201).json({ ticket });
  } catch (error) {
    console.error('POST support ticket error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

// GET /api/enterprise/support/:id — détail d'un ticket + messages
router.get('/:id', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const { id } = req.params;
    const ticketResult = await db.query(
      `SELECT id, subject, status, priority, created_at, updated_at
       FROM support_tickets WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Ticket introuvable' } });
    }

    const messagesResult = await db.query(
      `SELECT sm.id, sm.message, sm.is_staff, sm.created_at,
              u.full_name AS author_name
       FROM support_messages sm
       LEFT JOIN users u ON u.id = sm.user_id
       WHERE sm.ticket_id = $1
       ORDER BY sm.created_at ASC`,
      [id]
    );

    res.json({ ticket: ticketResult.rows[0], messages: messagesResult.rows });
  } catch (error) {
    console.error('GET support ticket detail error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

// POST /api/enterprise/support/:id/messages — répondre à un ticket
router.post('/:id/messages', authenticateToken, requireEnterprise, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: { message: 'Le message est requis' } });
    }

    const ticketResult = await db.query(
      'SELECT id, status FROM support_tickets WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Ticket introuvable' } });
    }
    if (ticketResult.rows[0].status === 'closed') {
      return res.status(400).json({ error: { message: 'Ce ticket est fermé' } });
    }

    const result = await db.query(
      `INSERT INTO support_messages (ticket_id, user_id, message, is_staff)
       VALUES ($1, $2, $3, false)
       RETURNING id, message, is_staff, created_at`,
      [id, req.user.id, message.trim()]
    );

    await db.query('UPDATE support_tickets SET updated_at = NOW() WHERE id = $1', [id]);

    res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    console.error('POST support message error:', error);
    res.status(500).json({ error: { message: 'Erreur serveur' } });
  }
});

module.exports = router;


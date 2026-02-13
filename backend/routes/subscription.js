const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/subscription/plans
 * Récupérer tous les plans disponibles
 */
router.get('/plans', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, display_name, price_monthly, price_yearly, 
             stripe_price_id_monthly, stripe_price_id_yearly, features, limits
      FROM subscription_plans
      WHERE is_active = true
      ORDER BY price_monthly ASC NULLS FIRST
    `);

    res.json({ plans: result.rows });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la récupération des plans' } });
  }
});

/**
 * GET /api/subscription/current
 * Récupérer l'abonnement actuel de l'utilisateur
 */
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        us.id, us.status, us.billing_cycle, 
        us.current_period_start, us.current_period_end,
        us.cancel_at_period_end, us.stripe_subscription_id,
        sp.name as plan_name, sp.display_name, sp.price_monthly, 
        sp.price_yearly, sp.features, sp.limits
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = 'active'
      ORDER BY us.created_at DESC
      LIMIT 1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Aucun abonnement actif' } });
    }

    res.json({ subscription: result.rows[0] });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la récupération de l\'abonnement' } });
  }
});

/**
 * POST /api/subscription/create-checkout-session
 * Créer une session de paiement Stripe
 */
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;

    if (!planId || !billingCycle) {
      return res.status(400).json({ error: { message: 'Plan et cycle de facturation requis' } });
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ error: { message: 'Cycle de facturation invalide' } });
    }

    // Récupérer le plan
    const planResult = await db.query(
      'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
      [planId]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Plan non trouvé' } });
    }

    const plan = planResult.rows[0];
    const priceId = billingCycle === 'monthly' 
      ? plan.stripe_price_id_monthly 
      : plan.stripe_price_id_yearly;

    if (!priceId) {
      return res.status(400).json({ error: { message: 'Prix Stripe non configuré pour ce plan' } });
    }

    // Récupérer ou créer le customer Stripe
    let customerId;
    const subResult = await db.query(
      'SELECT stripe_customer_id FROM user_subscriptions WHERE user_id = $1 AND stripe_customer_id IS NOT NULL LIMIT 1',
      [req.user.id]
    );

    if (subResult.rows.length > 0 && subResult.rows[0].stripe_customer_id) {
      customerId = subResult.rows[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          userId: req.user.id.toString()
        }
      });
      customerId = customer.id;
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId: req.user.id.toString(),
        planId: planId.toString(),
        billingCycle
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de la création de la session de paiement' } });
  }
});

/**
 * POST /api/subscription/cancel
 * Annuler l'abonnement (à la fin de la période)
 */
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const subResult = await db.query(`
      SELECT id, stripe_subscription_id
      FROM user_subscriptions
      WHERE user_id = $1 AND status = 'active' AND stripe_subscription_id IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `, [req.user.id]);

    if (subResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Aucun abonnement actif trouvé' } });
    }

    const subscription = subResult.rows[0];

    // Annuler dans Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // Mettre à jour dans la DB
    await db.query(
      'UPDATE user_subscriptions SET cancel_at_period_end = true WHERE id = $1',
      [subscription.id]
    );

    res.json({ message: 'Abonnement annulé. Il restera actif jusqu\'à la fin de la période.' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: { message: 'Erreur lors de l\'annulation de l\'abonnement' } });
  }
});

module.exports = router;


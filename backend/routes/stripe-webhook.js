const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/database');

const router = express.Router();

/**
 * POST /api/webhooks/stripe
 * Webhook Stripe pour gérer les événements de paiement
 */
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Gérer la complétion d'une session de checkout
 */
async function handleCheckoutSessionCompleted(session) {
  const userId = parseInt(session.metadata.userId);
  const planId = parseInt(session.metadata.planId);
  const billingCycle = session.metadata.billingCycle;

  // Récupérer la subscription Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Désactiver les anciennes subscriptions
  await db.query(
    'UPDATE user_subscriptions SET status = $1 WHERE user_id = $2 AND status = $3',
    ['canceled', userId, 'active']
  );

  // Créer la nouvelle subscription
  await db.query(`
    INSERT INTO user_subscriptions 
    (user_id, plan_id, stripe_customer_id, stripe_subscription_id, status, billing_cycle, current_period_start, current_period_end)
    VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7), to_timestamp($8))
  `, [
    userId,
    planId,
    session.customer,
    subscription.id,
    subscription.status,
    billingCycle,
    subscription.current_period_start,
    subscription.current_period_end
  ]);

  console.log(`Subscription created for user ${userId}`);
}

/**
 * Gérer la mise à jour d'une subscription
 */
async function handleSubscriptionUpdated(subscription) {
  await db.query(`
    UPDATE user_subscriptions
    SET status = $1, current_period_start = to_timestamp($2), current_period_end = to_timestamp($3),
        cancel_at_period_end = $4
    WHERE stripe_subscription_id = $5
  `, [
    subscription.status,
    subscription.current_period_start,
    subscription.current_period_end,
    subscription.cancel_at_period_end,
    subscription.id
  ]);

  console.log(`Subscription updated: ${subscription.id}`);
}

/**
 * Gérer la suppression d'une subscription
 */
async function handleSubscriptionDeleted(subscription) {
  // Passer au plan gratuit
  const userResult = await db.query(
    'SELECT user_id FROM user_subscriptions WHERE stripe_subscription_id = $1',
    [subscription.id]
  );

  if (userResult.rows.length > 0) {
    const userId = userResult.rows[0].user_id;

    // Désactiver l'ancienne subscription
    await db.query(
      'UPDATE user_subscriptions SET status = $1 WHERE stripe_subscription_id = $2',
      ['canceled', subscription.id]
    );

    // Créer un abonnement gratuit
    const freePlan = await db.query('SELECT id FROM subscription_plans WHERE name = $1', ['free']);
    if (freePlan.rows.length > 0) {
      await db.query(
        'INSERT INTO user_subscriptions (user_id, plan_id, status) VALUES ($1, $2, $3)',
        [userId, freePlan.rows[0].id, 'active']
      );
    }

    console.log(`Subscription deleted, user ${userId} moved to free plan`);
  }
}

/**
 * Gérer le paiement réussi d'une facture
 */
async function handleInvoicePaymentSucceeded(invoice) {
  const userResult = await db.query(
    'SELECT user_id FROM user_subscriptions WHERE stripe_customer_id = $1',
    [invoice.customer]
  );

  if (userResult.rows.length > 0) {
    const userId = userResult.rows[0].user_id;

    // Enregistrer le paiement
    await db.query(`
      INSERT INTO payment_history (user_id, stripe_payment_intent_id, amount, currency, status, description)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      userId,
      invoice.payment_intent,
      invoice.amount_paid / 100, // Stripe utilise les centimes
      invoice.currency,
      'succeeded',
      `Payment for invoice ${invoice.number}`
    ]);

    console.log(`Payment recorded for user ${userId}`);
  }
}

/**
 * Gérer l'échec du paiement d'une facture
 */
async function handleInvoicePaymentFailed(invoice) {
  // Mettre à jour le statut de la subscription
  await db.query(
    'UPDATE user_subscriptions SET status = $1 WHERE stripe_customer_id = $2',
    ['past_due', invoice.customer]
  );

  console.log(`Payment failed for customer ${invoice.customer}`);
}

module.exports = router;


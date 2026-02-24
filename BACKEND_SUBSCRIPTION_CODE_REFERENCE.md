# Backend Subscription System - Code Reference

## Plan Change Flow (Checkout → Webhook)

```javascript
// 1. Frontend calls POST /api/subscription/create-checkout-session
// Request: { planId: 2, billingCycle: 'monthly' }

// 2. Backend creates Stripe checkout session
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  metadata: { userId, planId, billingCycle }
});

// 3. User completes payment in Stripe
// 4. Stripe fires webhook: checkout.session.completed

// 5. Webhook handler processes:
async function handleCheckoutSessionCompleted(session) {
  const userId = parseInt(session.metadata.userId);
  const planId = parseInt(session.metadata.planId);
  
  // Cancel old subscriptions
  await db.query(
    'UPDATE user_subscriptions SET status = $1 WHERE user_id = $2 AND status = $3',
    ['canceled', userId, 'active']
  );
  
  // Create new subscription
  await db.query(`
    INSERT INTO user_subscriptions 
    (user_id, plan_id, stripe_customer_id, stripe_subscription_id, status, billing_cycle, current_period_start, current_period_end)
    VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7), to_timestamp($8))
  `, [userId, planId, session.customer, subscription.id, subscription.status, billingCycle, ...]);
}
```

## Quota Checking Flow

```javascript
// Middleware: checkQuota('tool-name', 'category')
const subscriptionResult = await db.query(`
  SELECT sp.limits, us.status
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = $1 AND us.status = 'active'
  LIMIT 1
`, [userId]);

const limits = subscriptionResult.rows[0].limits;
// limits = { daily_usage: 10, monthly_usage: 100, video_monthly: 0 }

// Check daily usage
const dailyUsage = await db.query(`
  SELECT COUNT(*) as count FROM usage_logs
  WHERE user_id = $1 AND timestamp >= $2
`, [userId, today]);

if (limits.daily_usage !== -1 && dailyUsage >= limits.daily_usage) {
  return res.status(429).json({ 
    error: { 
      message: `Limite quotidienne atteinte (${limits.daily_usage})`,
      code: 'DAILY_LIMIT_EXCEEDED'
    } 
  });
}
```

## Video Quota (Strict Gating)

```javascript
// checkVideoQuota middleware
const videoLimit = limits.video_monthly;

// FREE PLAN: Immediate rejection, 0 API calls
if (videoLimit === 0) {
  return res.status(403).json({
    error: {
      message: 'La génération de vidéos IA est disponible à partir du plan Pro.',
      code: 'VIDEO_UPGRADE_REQUIRED'
    }
  });
}

// Count videos this month
const videoUsed = await db.query(`
  SELECT COUNT(*) AS count FROM video_jobs
  WHERE user_id = $1 AND created_at >= $2
    AND status IN ('completed', 'processing', 'pending')
`, [userId, firstDayOfMonth]);

if (videoLimit !== -1 && videoUsed >= videoLimit) {
  return res.status(429).json({
    error: {
      message: `Limite mensuelle atteinte (${videoLimit} vidéos/mois)`,
      code: 'VIDEO_MONTHLY_LIMIT_EXCEEDED'
    }
  });
}
```

## Getting User's Current Plan

```javascript
// From /api/auth/me endpoint
const planResult = await db.query(
  `SELECT sp.name AS plan_name FROM user_subscriptions us
   JOIN subscription_plans sp ON us.plan_id = sp.id
   WHERE us.user_id = $1 AND us.status = 'active'
   ORDER BY us.created_at DESC LIMIT 1`,
  [req.user.id]
);

// Returns: { plan_name: 'pro' | 'free' | 'enterprise' }
```

## Cancellation Flow

```javascript
// POST /api/subscription/cancel
const subscription = await db.query(`
  SELECT id, stripe_subscription_id FROM user_subscriptions
  WHERE user_id = $1 AND status = 'active'
  LIMIT 1
`, [req.user.id]);

// Update Stripe
await stripe.subscriptions.update(subscription.stripe_subscription_id, {
  cancel_at_period_end: true
});

// Update DB
await db.query(
  'UPDATE user_subscriptions SET cancel_at_period_end = true WHERE id = $1',
  [subscription.id]
);
// Service continues until current_period_end
```

## Plan Limits Reference

| Plan | Daily | Monthly | Video/mo | Price |
|------|-------|---------|----------|-------|
| Free | 10 | 100 | 0 | $0 |
| Pro | 1000 | 30000 | 5 | $9.99/mo |
| Enterprise | -1 (∞) | -1 (∞) | 30 | $49.99/mo |

Note: -1 = unlimited


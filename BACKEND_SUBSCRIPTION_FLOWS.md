# Backend Subscription System - Flow Diagrams

## 1. User Registration Flow

```
User Registration
    ↓
POST /api/auth/register
    ↓
Validate email & password
    ↓
Hash password with bcrypt
    ↓
Create user in DB
    ↓
Query: SELECT id FROM subscription_plans WHERE name = 'free'
    ↓
INSERT into user_subscriptions (user_id, plan_id='free', status='active')
    ↓
Generate JWT token
    ↓
Return user + token
```

## 2. Plan Change (Upgrade/Downgrade) Flow

```
User clicks "Upgrade to Pro"
    ↓
POST /api/subscription/create-checkout-session
    { planId: 2, billingCycle: 'monthly' }
    ↓
Validate planId exists & is_active
    ↓
Get stripe_price_id_monthly from plan
    ↓
Get or create Stripe customer
    ↓
stripe.checkout.sessions.create()
    ↓
Return sessionId + checkout URL
    ↓
User completes payment in Stripe
    ↓
Stripe fires webhook: checkout.session.completed
    ↓
handleCheckoutSessionCompleted()
    ├─ UPDATE user_subscriptions SET status='canceled' 
    │  WHERE user_id=$1 AND status='active'
    └─ INSERT new user_subscriptions record
       (user_id, plan_id=2, stripe_subscription_id, status='active')
    ↓
User now on Pro plan
```

## 3. Tool Usage & Quota Check Flow

```
User calls tool endpoint
    ↓
checkQuota('tool-name', 'category') middleware
    ↓
Require authentication
    ↓
Query user's active subscription + plan limits
    ↓
Check if limits.daily_usage === -1 (unlimited)?
    ├─ YES → Log usage, continue
    └─ NO → Check daily usage count
           ├─ Exceeded? → Return 429 DAILY_LIMIT_EXCEEDED
           └─ OK? → Check monthly usage
                   ├─ Exceeded? → Return 429 MONTHLY_LIMIT_EXCEEDED
                   └─ OK? → Log usage, continue
    ↓
INSERT into usage_logs (user_id, tool_name, tool_category)
    ↓
Attach req.quota with current stats
    ↓
next() → Tool executes
```

## 4. Video Generation Quota Flow

```
User requests video generation
    ↓
checkVideoQuota middleware
    ↓
Require authentication
    ↓
Query user's active plan
    ↓
Get limits.video_monthly
    ↓
Is video_monthly === 0 (Free plan)?
    ├─ YES → Return 403 VIDEO_UPGRADE_REQUIRED
    │        (NO API CALL MADE - Cost protection)
    └─ NO → Count videos in video_jobs table
            WHERE status IN ('completed', 'processing', 'pending')
            AND created_at >= first_day_of_month
            ├─ Limit exceeded? → Return 429 VIDEO_MONTHLY_LIMIT_EXCEEDED
            └─ OK? → Attach req.videoQuota, continue
    ↓
Call fal.ai API (if passed quota check)
    ↓
Create video_jobs record
    ↓
Return video URL
```

## 5. Subscription Cancellation Flow

```
User clicks "Cancel Subscription"
    ↓
POST /api/subscription/cancel
    ↓
Query active subscription with stripe_subscription_id
    ↓
stripe.subscriptions.update(stripe_subscription_id, {
  cancel_at_period_end: true
})
    ↓
UPDATE user_subscriptions SET cancel_at_period_end=true
    ↓
Return success message
    ↓
Service continues until current_period_end
    ↓
Stripe fires webhook: customer.subscription.deleted
    ↓
handleSubscriptionDeleted()
    ├─ UPDATE user_subscriptions SET status='canceled'
    └─ INSERT new free plan subscription
    ↓
User downgraded to Free plan
```

## 6. Payment Failure Recovery Flow

```
Stripe invoice payment fails
    ↓
Stripe fires webhook: invoice.payment_failed
    ↓
handleInvoicePaymentFailed()
    ↓
UPDATE user_subscriptions SET status='past_due'
    ↓
User can still access service (grace period)
    ↓
Payment retried by Stripe
    ↓
If succeeds:
    └─ Stripe fires: invoice.payment_succeeded
       └─ INSERT into payment_history
       └─ Subscription remains active
    ↓
If fails again:
    └─ Stripe fires: customer.subscription.deleted
       └─ Downgrade to free plan
```

## 7. Auth /me Endpoint (Feature Gating)

```
Frontend calls GET /api/auth/me
    ↓
Verify JWT token
    ↓
Query users table
    ↓
Query active subscription + plan name
    ↓
Return user + plan_name
    ├─ plan_name: 'free' → Hide Pro/Enterprise features
    ├─ plan_name: 'pro' → Show Pro features, hide Enterprise
    └─ plan_name: 'enterprise' → Show all features
    ↓
Frontend uses plan_name for conditional rendering
```

## 8. Database State Transitions

```
New User
    ↓
user_subscriptions: (plan_id=free, status='active')
    ↓
User upgrades to Pro
    ↓
Old: (plan_id=free, status='canceled')
New: (plan_id=pro, status='active')
    ↓
User cancels subscription
    ↓
Old: (plan_id=pro, status='canceled', cancel_at_period_end=true)
New: (plan_id=free, status='active') [created at period end]
```

## Key Decision Points

1. **Video Quota**: Free users blocked BEFORE API call (cost protection)
2. **Soft Cancellation**: Service continues until period_end
3. **Auto-Fallback**: Deleted subscriptions auto-create free plan
4. **Unlimited Plans**: -1 value means no limit check
5. **Plan Changes**: No direct update endpoint, only new checkout


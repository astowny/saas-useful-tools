# Backend Subscription Files - Full Content Reference

## File Locations

1. **backend/routes/subscription.js** - Main subscription endpoints (181 lines)
2. **backend/routes/stripe-webhook.js** - Stripe webhook handlers (193 lines)
3. **backend/middleware/quota.js** - Quota checking middleware (254 lines)
4. **backend/routes/auth.js** - Auth with plan integration (174 lines)
5. **backend/scripts/init-database.js** - Database schema (291 lines)
6. **backend/config/plans.js** - Plan definitions (167 lines)
7. **backend/config/database.js** - DB connection (35 lines)

## Key Files Summary

### subscription.js
- GET /api/subscription/plans (public)
- GET /api/subscription/current (auth required)
- POST /api/subscription/create-checkout-session (auth required)
- POST /api/subscription/cancel (auth required)

### stripe-webhook.js
- POST /api/webhooks/stripe (webhook endpoint)
- Handles: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed

### quota.js
- checkQuota(toolName, toolCategory) - General quota middleware
- checkVideoQuota - Video-specific quota middleware
- logUsage(userId, toolName, toolCategory, metadata)
- getUserUsageStats(userId, period)

### auth.js
- POST /api/auth/register (creates free plan subscription)
- POST /api/auth/login
- GET /api/auth/me (includes plan_name for feature gating)

### init-database.js
- Creates all tables: users, subscription_plans, user_subscriptions, usage_logs, video_jobs, payment_history, api_keys, support_tickets, support_messages, white_label_config, uptime_checks
- Inserts default plans: free, pro, enterprise
- Creates indexes and triggers for updated_at

### plans.js
- PLANS object with FREE, PRO, ENTERPRISE definitions
- FEATURE_COMPARISON array for pricing page
- TOOLS object listing all available tools by category

## Database Relationships

```
users (1) ──→ (many) user_subscriptions
                          ↓
                   subscription_plans

users (1) ──→ (many) usage_logs
users (1) ──→ (many) video_jobs
users (1) ──→ (many) payment_history
users (1) ──→ (many) api_keys
users (1) ──→ (many) support_tickets
users (1) ──→ (1) white_label_config
```

## Critical Validation Points

1. **Plan Selection**: Must be active (is_active = true)
2. **Billing Cycle**: Must be 'monthly' or 'yearly'
3. **Stripe Price ID**: Must exist for selected cycle
4. **Subscription Status**: Only 'active' subscriptions count
5. **Video Quota**: Free plan (video_monthly=0) blocked immediately
6. **Usage Limits**: -1 means unlimited (Enterprise only)

## Webhook Event Handling

| Event | Action |
|-------|--------|
| checkout.session.completed | Create new subscription, cancel old ones |
| customer.subscription.updated | Update status, period dates |
| customer.subscription.deleted | Mark canceled, create free plan |
| invoice.payment_succeeded | Record in payment_history |
| invoice.payment_failed | Set status to past_due |

## Environment Variables Required

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- FRONTEND_URL
- JWT_SECRET
- DATABASE_URL (or DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- NODE_ENV

## Response Status Codes

- 200: Success
- 201: Created (register)
- 400: Bad request (validation)
- 401: Unauthorized (auth required)
- 403: Forbidden (no active subscription, video upgrade required)
- 404: Not found (plan, subscription)
- 409: Conflict (email exists)
- 429: Too many requests (quota exceeded)
- 500: Server error


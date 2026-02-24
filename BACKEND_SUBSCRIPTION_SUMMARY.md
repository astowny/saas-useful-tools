# Backend Subscription System - Executive Summary

## Overview
Complete SaaS subscription system with Stripe integration, quota management, and three-tier pricing (Free/Pro/Enterprise).

## Core Components

### 1. Subscription Routes (subscription.js)
- **GET /plans** - List all active plans (public)
- **GET /current** - Get user's active subscription (auth)
- **POST /create-checkout-session** - Initiate payment (auth)
- **POST /cancel** - Cancel subscription (auth)

### 2. Plan Change Mechanism
- No direct "upgrade" endpoint
- User initiates checkout → Stripe payment → Webhook creates new subscription
- Old subscriptions automatically canceled
- Seamless transition between plans

### 3. Quota System (quota.js)
**General Quotas** (daily_usage, monthly_usage):
- Checked before tool execution
- Returns 429 if exceeded
- Logs all usage to database

**Video Quotas** (video_monthly):
- Free plan: Blocked immediately (0 API calls)
- Pro: 5 videos/month
- Enterprise: 30 videos/month
- Cost protection: Free users never reach external API

### 4. Database Schema
**subscription_plans**: id, name, display_name, price_monthly, price_yearly, stripe_price_id_*, features, limits, is_active

**user_subscriptions**: id, user_id, plan_id, stripe_customer_id, stripe_subscription_id, status, billing_cycle, current_period_start, current_period_end, cancel_at_period_end

**usage_logs**: id, user_id, tool_name, tool_category, timestamp, metadata

**video_jobs**: id, user_id, fal_request_id, model, status, prompt, video_url, error_message, created_at, updated_at

**payment_history**: id, user_id, stripe_payment_intent_id, amount, currency, status, description

### 5. Stripe Integration (stripe-webhook.js)
Handles 5 webhook events:
1. **checkout.session.completed** - Create subscription
2. **customer.subscription.updated** - Update status/dates
3. **customer.subscription.deleted** - Downgrade to free
4. **invoice.payment_succeeded** - Record payment
5. **invoice.payment_failed** - Set past_due status

### 6. Auth Integration (auth.js)
- **Register**: Auto-creates free plan subscription
- **Login**: Standard JWT auth
- **GET /me**: Returns plan_name for frontend feature gating

## Plan Limits

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Daily Usage | 10 | 1,000 | Unlimited |
| Monthly Usage | 100 | 30,000 | Unlimited |
| Video/Month | 0 | 5 | 30 |
| Price/Month | $0 | $9.99 | $49.99 |
| Price/Year | $0 | $99.99 | $499.99 |

## Key Features

✅ **Stripe Checkout** - Secure payment processing
✅ **Soft Cancellation** - Service until period end
✅ **Auto-Fallback** - Deleted subs → free plan
✅ **Cost Protection** - Free users blocked before API calls
✅ **Usage Tracking** - All tool usage logged
✅ **Feature Gating** - Plan-based UI control
✅ **Webhook Sync** - Real-time payment updates
✅ **Unlimited Plans** - Enterprise with -1 limits

## Validation Rules

1. Plan must be active (is_active=true)
2. Billing cycle must be 'monthly' or 'yearly'
3. Stripe price ID must exist for cycle
4. Only 'active' subscriptions count
5. -1 limit means unlimited
6. Video quota checked before external API

## Error Codes

- **AUTH_REQUIRED** (401) - No authentication
- **NO_ACTIVE_SUBSCRIPTION** (403) - No active plan
- **VIDEO_UPGRADE_REQUIRED** (403) - Free plan video blocked
- **DAILY_LIMIT_EXCEEDED** (429) - Daily quota hit
- **MONTHLY_LIMIT_EXCEEDED** (429) - Monthly quota hit
- **VIDEO_MONTHLY_LIMIT_EXCEEDED** (429) - Video quota hit

## Critical Paths

1. **New User** → Register → Free plan created
2. **Upgrade** → Checkout → Payment → Webhook → New subscription
3. **Tool Use** → Quota check → Log usage → Execute
4. **Video Gen** → Video quota check → API call → Log job
5. **Cancel** → Set cancel_at_period_end → Service until end
6. **Payment Fail** → Set past_due → Retry → Downgrade if fail

## Files to Modify for Changes

- **subscription.js** - Add/modify endpoints
- **quota.js** - Change quota logic
- **stripe-webhook.js** - Handle new events
- **init-database.js** - Schema changes
- **plans.js** - Plan definitions
- **auth.js** - Auth flow changes

## Testing Checklist

- [ ] Register creates free subscription
- [ ] Checkout creates Stripe session
- [ ] Webhook creates new subscription
- [ ] Old subscriptions canceled
- [ ] Quota checks work correctly
- [ ] Video quota blocks free users
- [ ] Usage logged to database
- [ ] Cancellation sets cancel_at_period_end
- [ ] Payment failure sets past_due
- [ ] /me endpoint returns plan_name


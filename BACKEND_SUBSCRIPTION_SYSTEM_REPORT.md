# Backend Subscription System - Detailed Report

## 1. SUBSCRIPTION ROUTES (`backend/routes/subscription.js`)

### Available Endpoints

#### GET `/api/subscription/plans`
- **Auth**: None required (public)
- **Returns**: All active subscription plans with full details
- **Response**: `{ plans: [...] }`
- **Fields returned**: id, name, display_name, price_monthly, price_yearly, stripe_price_id_monthly, stripe_price_id_yearly, features, limits

#### GET `/api/subscription/current`
- **Auth**: Required (JWT token)
- **Returns**: User's active subscription with plan details
- **Response**: `{ subscription: {...} }`
- **Fields**: id, status, billing_cycle, current_period_start, current_period_end, cancel_at_period_end, stripe_subscription_id, plan_name, display_name, price_monthly, price_yearly, features, limits
- **Error**: 404 if no active subscription

#### POST `/api/subscription/create-checkout-session`
- **Auth**: Required (JWT token)
- **Body**: `{ planId, billingCycle }` (billingCycle: 'monthly' or 'yearly')
- **Validation**:
  - planId and billingCycle required
  - billingCycle must be 'monthly' or 'yearly'
  - Plan must exist and be active
  - Stripe price ID must be configured for the plan
- **Process**:
  1. Retrieves plan from DB
  2. Gets or creates Stripe customer (stores stripe_customer_id)
  3. Creates Stripe checkout session with metadata (userId, planId, billingCycle)
  4. Returns sessionId and checkout URL
- **Response**: `{ sessionId, url }`

#### POST `/api/subscription/cancel`
- **Auth**: Required (JWT token)
- **Process**:
  1. Finds active subscription with stripe_subscription_id
  2. Updates Stripe subscription with `cancel_at_period_end: true`
  3. Updates DB record with `cancel_at_period_end = true`
- **Response**: Success message
- **Error**: 404 if no active subscription

---

## 2. PLAN CHANGE MECHANISM

**No direct plan change endpoint exists.** Plan changes work through:
1. User initiates checkout for new plan → creates new Stripe subscription
2. Webhook `checkout.session.completed` fires
3. Handler `handleCheckoutSessionCompleted()` in `stripe-webhook.js`:
   - Cancels all previous active subscriptions (sets status='canceled')
   - Creates new subscription record with new plan_id
   - Stores Stripe subscription ID and customer ID

**Validation during plan change**:
- Plan must be active (`is_active = true`)
- Stripe price ID must exist for selected billing cycle
- User must be authenticated

---

## 3. DATABASE SCHEMA

### `subscription_plans` Table
```sql
id SERIAL PRIMARY KEY
name VARCHAR(50) UNIQUE NOT NULL
display_name VARCHAR(100) NOT NULL
price_monthly DECIMAL(10,2)
price_yearly DECIMAL(10,2)
stripe_price_id_monthly VARCHAR(255)
stripe_price_id_yearly VARCHAR(255)
features JSONB
limits JSONB NOT NULL
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### `user_subscriptions` Table
```sql
id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
plan_id INTEGER REFERENCES subscription_plans(id)
stripe_customer_id VARCHAR(255)
stripe_subscription_id VARCHAR(255)
status VARCHAR(50) NOT NULL  -- active, canceled, past_due, trialing
billing_cycle VARCHAR(20)     -- monthly, yearly
current_period_start TIMESTAMP
current_period_end TIMESTAMP
cancel_at_period_end BOOLEAN DEFAULT FALSE
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Default Plans (from init-database.js)

**FREE**:
- price_monthly: 0, price_yearly: 0
- limits: `{"daily_usage": 10, "monthly_usage": 100, "video_monthly": 0}`

**PRO**:
- price_monthly: 9.99, price_yearly: 99.99
- limits: `{"daily_usage": 1000, "monthly_usage": 30000, "video_monthly": 5}`

**ENTERPRISE**:
- price_monthly: 49.99, price_yearly: 499.99
- limits: `{"daily_usage": -1, "monthly_usage": -1, "video_monthly": 30}`
- Note: -1 = unlimited

---

## 4. PAYMENT GATING LOGIC

### General Quota Middleware (`backend/middleware/quota.js`)

**checkQuota(toolName, toolCategory)** middleware:
1. Requires authentication
2. Fetches user's active subscription and plan limits
3. Checks daily_usage limit (if not -1)
4. Checks monthly_usage limit (if not -1)
5. Returns 429 if limits exceeded with error details
6. Logs usage to `usage_logs` table
7. Attaches `req.quota` with current usage stats

**Limits**: -1 means unlimited (Enterprise plan)

### Video Quota Middleware (`backend/middleware/quota.js`)

**checkVideoQuota** middleware:
1. Requires authentication
2. Fetches user's active plan
3. **Immediate rejection** if video_monthly = 0 (Free plan) - no API calls made
4. Counts videos in `video_jobs` table with status IN ('completed', 'processing', 'pending')
5. Returns 403 if limit exceeded
6. Attaches `req.videoQuota` and `req.userPlan`

---

## 5. STRIPE INTEGRATION

### Webhook Handlers (`backend/routes/stripe-webhook.js`)

**checkout.session.completed**:
- Cancels previous active subscriptions
- Creates new user_subscriptions record
- Stores Stripe subscription ID and customer ID

**customer.subscription.updated**:
- Updates subscription status, period dates, cancel_at_period_end

**customer.subscription.deleted**:
- Marks subscription as canceled
- Creates new free plan subscription

**invoice.payment_succeeded**:
- Records payment in `payment_history` table

**invoice.payment_failed**:
- Sets subscription status to 'past_due'

### Auth Integration (`backend/routes/auth.js`)

**GET `/api/auth/me`**:
- Returns user info + plan_name (for frontend feature gating)
- Queries active subscription to get plan name

**POST `/api/auth/register`**:
- Auto-creates free plan subscription for new users

---

## 6. KEY OBSERVATIONS

1. **No upgrade/downgrade endpoint**: Changes happen via new checkout session
2. **Soft cancellation**: `cancel_at_period_end` allows service until period end
3. **Automatic fallback**: Deleted subscriptions auto-create free plan
4. **Video quota is strict**: Free users blocked immediately (0 API calls)
5. **Usage tracking**: All tool usage logged to `usage_logs` table
6. **Plan-based gating**: All quotas stored in JSONB `limits` field


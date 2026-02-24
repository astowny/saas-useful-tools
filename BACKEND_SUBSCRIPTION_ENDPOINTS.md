# Backend Subscription Endpoints - Complete Reference

## GET /api/subscription/plans
**Public endpoint** - No authentication required

**Response (200)**:
```json
{
  "plans": [
    {
      "id": 1,
      "name": "free",
      "display_name": "Free",
      "price_monthly": "0.00",
      "price_yearly": "0.00",
      "stripe_price_id_monthly": null,
      "stripe_price_id_yearly": null,
      "features": ["Accès à tous les outils", "10 utilisations par jour", ...],
      "limits": {"daily_usage": 10, "monthly_usage": 100, "video_monthly": 0}
    },
    {
      "id": 2,
      "name": "pro",
      "display_name": "Pro",
      "price_monthly": "9.99",
      "price_yearly": "99.99",
      "stripe_price_id_monthly": "price_xxx",
      "stripe_price_id_yearly": "price_yyy",
      "features": [...],
      "limits": {"daily_usage": 1000, "monthly_usage": 30000, "video_monthly": 5}
    }
  ]
}
```

---

## GET /api/subscription/current
**Authenticated endpoint** - Requires JWT token

**Response (200)**:
```json
{
  "subscription": {
    "id": 5,
    "status": "active",
    "billing_cycle": "monthly",
    "current_period_start": "2024-01-15T10:30:00Z",
    "current_period_end": "2024-02-15T10:30:00Z",
    "cancel_at_period_end": false,
    "stripe_subscription_id": "sub_xxx",
    "plan_name": "pro",
    "display_name": "Pro",
    "price_monthly": "9.99",
    "price_yearly": "99.99",
    "features": [...],
    "limits": {"daily_usage": 1000, "monthly_usage": 30000, "video_monthly": 5}
  }
}
```

**Error (404)**: `{ "error": { "message": "Aucun abonnement actif" } }`

---

## POST /api/subscription/create-checkout-session
**Authenticated endpoint** - Requires JWT token

**Request Body**:
```json
{
  "planId": 2,
  "billingCycle": "monthly"
}
```

**Validation**:
- planId: Required, must exist and be active
- billingCycle: Required, must be 'monthly' or 'yearly'
- Stripe price ID must be configured for plan

**Response (200)**:
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxx"
}
```

**Errors**:
- 400: `{ "error": { "message": "Plan et cycle de facturation requis" } }`
- 400: `{ "error": { "message": "Cycle de facturation invalide" } }`
- 404: `{ "error": { "message": "Plan non trouvé" } }`
- 400: `{ "error": { "message": "Prix Stripe non configuré pour ce plan" } }`

---

## POST /api/subscription/cancel
**Authenticated endpoint** - Requires JWT token

**Request Body**: Empty

**Response (200)**:
```json
{
  "message": "Abonnement annulé. Il restera actif jusqu'à la fin de la période."
}
```

**Error (404)**:
```json
{
  "error": { "message": "Aucun abonnement actif trouvé" }
}
```

**Note**: Sets `cancel_at_period_end = true` in Stripe and DB. Service continues until `current_period_end`.

---

## GET /api/auth/me
**Authenticated endpoint** - Requires JWT token

**Response (200)**:
```json
{
  "user": {
    "id": 42,
    "email": "user@example.com",
    "full_name": "John Doe",
    "created_at": "2024-01-01T10:00:00Z",
    "email_verified": false,
    "plan_name": "pro"
  }
}
```

**Note**: `plan_name` is used by frontend for feature gating:
- 'free' → Hide Pro/Enterprise features
- 'pro' → Show Pro features, hide Enterprise
- 'enterprise' → Show all features

---

## POST /api/auth/register
**Public endpoint** - No authentication required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "fullName": "John Doe"
}
```

**Response (201)**:
```json
{
  "message": "Compte créé avec succès",
  "user": {
    "id": 42,
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2024-01-01T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Side Effect**: Automatically creates `user_subscriptions` record with free plan (status='active')

---

## Quota Middleware Responses

**Daily Limit Exceeded (429)**:
```json
{
  "error": {
    "message": "Limite quotidienne atteinte (10 utilisations/jour)",
    "code": "DAILY_LIMIT_EXCEEDED",
    "limit": 10,
    "used": 10
  }
}
```

**Monthly Limit Exceeded (429)**:
```json
{
  "error": {
    "message": "Limite mensuelle atteinte (100 utilisations/mois)",
    "code": "MONTHLY_LIMIT_EXCEEDED",
    "limit": 100,
    "used": 100
  }
}
```

**Video Quota Exceeded (429)**:
```json
{
  "error": {
    "message": "Limite mensuelle de vidéos atteinte (5 vidéos/mois)",
    "code": "VIDEO_MONTHLY_LIMIT_EXCEEDED",
    "limit": 5,
    "used": 5
  }
}
```

**Video Upgrade Required (403)**:
```json
{
  "error": {
    "message": "La génération de vidéos IA est disponible à partir du plan Pro.",
    "code": "VIDEO_UPGRADE_REQUIRED",
    "plan": "free"
  }
}
```

---

## Webhook Events (POST /api/webhooks/stripe)

**Signature**: Verified with `STRIPE_WEBHOOK_SECRET`

**Handled Events**:
1. `checkout.session.completed` - New subscription created
2. `customer.subscription.updated` - Status/dates updated
3. `customer.subscription.deleted` - Downgraded to free
4. `invoice.payment_succeeded` - Payment recorded
5. `invoice.payment_failed` - Status set to past_due

**Response**: `{ "received": true }` (200)


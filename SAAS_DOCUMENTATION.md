# 🚀 Documentation SaaS Useful Tools

## 📋 Vue d'ensemble

Ce système transforme les outils HTML statiques en un SaaS payant complet avec :

- ✅ **Authentification JWT** (inscription, connexion, sessions)
- ✅ **Système de quotas** (limites quotidiennes et mensuelles)
- ✅ **Intégration Stripe** (paiements et abonnements)
- ✅ **3 Plans tarifaires** (Free, Pro, Enterprise)
- ✅ **Dashboard utilisateur** (statistiques, usage, facturation)
- ✅ **API Backend** (Node.js + Express + PostgreSQL)
- ✅ **Frontend React** (composants réutilisables)

---

## 🏗️ Architecture

```
backend/
├── config/
│   ├── database.js          # Configuration PostgreSQL
│   └── plans.js             # Définition des plans
├── middleware/
│   ├── auth.js              # Authentification JWT
│   └── quota.js             # Vérification des quotas
├── routes/
│   ├── auth.js              # Inscription, connexion
│   ├── user.js              # Profil utilisateur
│   ├── subscription.js      # Gestion abonnements
│   ├── usage.js             # Statistiques d'usage
│   ├── tools.js             # Tracking usage outils
│   └── stripe-webhook.js    # Webhooks Stripe
├── scripts/
│   └── init-database.js     # Initialisation DB
├── .env.example
├── package.json
└── server.js

frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── QuotaDisplay.jsx
│   │   ├── UsageStats.jsx
│   │   ├── SubscriptionCard.jsx
│   │   └── PricingPage.jsx
│   └── contexts/
│       └── AuthContext.jsx
└── public/
    └── tools/
        └── qr-generator-protected.html  # Exemple outil protégé
```

---

## 💳 Plans tarifaires

### Free (0€)
- 10 utilisations/jour
- 100 utilisations/mois
- Tous les outils
- Support communautaire
- Publicités

### Pro (9.99€/mois ou 99.99€/an)
- 1000 utilisations/jour
- 30 000 utilisations/mois
- Export avancé
- Support prioritaire
- Pas de publicité
- Historique 1 an

### Enterprise (49.99€/mois ou 499.99€/an)
- Utilisations illimitées
- Support 24/7
- API access
- White-label
- SLA 99.9%
- Intégrations personnalisées

---

## 🔧 Installation

### 1. Backend

```bash
cd backend
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la base de données PostgreSQL
npm run init-db

# Démarrer le serveur
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install

# Configurer les variables d'environnement
echo "REACT_APP_API_URL=http://localhost:3001" > .env
echo "REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_..." >> .env

# Démarrer le dev server
npm start
```

---

## 🔐 Configuration Stripe

### 1. Créer un compte Stripe
- Aller sur https://stripe.com
- Créer un compte (mode test pour commencer)

### 2. Récupérer les clés API
- Dashboard → Developers → API keys
- Copier `Secret key` et `Publishable key`
- Les ajouter dans `.env`

### 3. Créer les produits et prix
```bash
# Dans le dashboard Stripe :
# Products → Create product

# Créer 2 produits :
# 1. "Pro Plan"
#    - Prix mensuel : 9.99€
#    - Prix annuel : 99.99€
# 2. "Enterprise Plan"
#    - Prix mensuel : 49.99€
#    - Prix annuel : 499.99€

# Copier les Price IDs (price_xxx) dans .env
```

### 4. Configurer les webhooks
```bash
# Dashboard → Developers → Webhooks → Add endpoint
# URL : https://votre-domaine.com/api/webhooks/stripe

# Événements à écouter :
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

# Copier le Webhook Secret dans .env
```

---

## 📊 Base de données

### Tables principales

**users** - Utilisateurs
- id, email, password_hash, full_name, created_at

**subscription_plans** - Plans d'abonnement
- id, name, display_name, price_monthly, price_yearly, limits, features

**user_subscriptions** - Abonnements utilisateurs
- id, user_id, plan_id, stripe_customer_id, stripe_subscription_id, status

**usage_logs** - Logs d'utilisation
- id, user_id, tool_name, tool_category, timestamp

**payment_history** - Historique paiements
- id, user_id, stripe_payment_intent_id, amount, status

---

## 🛠️ Adapter un outil HTML

Voir `frontend/public/tools/qr-generator-protected.html` pour un exemple complet.

### Étapes :

1. **Vérifier l'authentification**
```javascript
const token = localStorage.getItem('token');
if (!token) {
  // Rediriger vers login
}
```

2. **Récupérer les quotas**
```javascript
const response = await fetch(`${API_URL}/api/usage/quota`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

3. **Tracker l'usage avant d'utiliser l'outil**
```javascript
await fetch(`${API_URL}/api/tools/qr-generator/use`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ category: 'utilities' })
});
```

4. **Gérer les erreurs de quota**
```javascript
if (error.code === 'DAILY_LIMIT_EXCEEDED') {
  // Afficher message + lien vers pricing
}
```

---

## 🚀 Déploiement

### Backend (exemple avec Heroku)
```bash
# Installer Heroku CLI
heroku create useful-tools-api
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=xxx STRIPE_SECRET_KEY=xxx
git push heroku main
heroku run npm run init-db
```

### Frontend (exemple avec Vercel)
```bash
npm install -g vercel
vercel --prod
# Configurer les variables d'environnement dans le dashboard
```

---

## 📈 Prochaines étapes

1. **Ajouter l'email**
   - Vérification email (SendGrid, Mailgun)
   - Réinitialisation mot de passe
   - Notifications paiement

2. **Analytics**
   - Google Analytics
   - Mixpanel pour tracking usage
   - Dashboard admin

3. **Optimisations**
   - Cache Redis pour quotas
   - CDN pour assets
   - Rate limiting par IP

4. **Fonctionnalités**
   - API publique (pour plan Enterprise)
   - Webhooks pour intégrations
   - Export données utilisateur (RGPD)

---

## 🤝 Support

Pour toute question :
- Documentation Stripe : https://stripe.com/docs
- Documentation JWT : https://jwt.io
- PostgreSQL : https://www.postgresql.org/docs/

---

**Créé avec ❤️ pour Useful Tools SaaS**


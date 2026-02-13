# 🧰 Useful Tools - SaaS Platform

Transformez vos outils en ligne en un SaaS rentable avec authentification, quotas et paiements Stripe.

## ✨ Fonctionnalités

### 🔐 Authentification complète
- Inscription / Connexion avec JWT
- Sessions sécurisées
- Protection des routes
- Gestion de profil

### 💰 Monétisation Stripe
- 3 plans tarifaires (Free, Pro, Enterprise)
- Paiements mensuels et annuels
- Webhooks automatiques
- Gestion des abonnements
- Historique des paiements

### 📊 Système de quotas
- Limites quotidiennes et mensuelles
- Tracking en temps réel
- Alertes de limite
- Statistiques d'usage détaillées

### 🎨 Dashboard utilisateur
- Vue d'ensemble de l'usage
- Gestion de l'abonnement
- Statistiques par outil
- Upgrade facile

## 🚀 Démarrage rapide

### Prérequis
- Node.js 16+
- PostgreSQL 12+
- Compte Stripe (mode test OK)

### Installation

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd useful-tools-saas

# 2. Backend
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos valeurs
npm run init-db
npm run dev

# 3. Frontend (dans un autre terminal)
cd frontend
npm install
npm start
```

### Configuration Stripe

1. Créer un compte sur https://stripe.com
2. Récupérer les clés API (Dashboard → Developers → API keys)
3. Créer les produits et prix dans le dashboard
4. Configurer le webhook : `https://votre-domaine.com/api/webhooks/stripe`
5. Ajouter les clés dans `.env`

Voir [SAAS_DOCUMENTATION.md](./SAAS_DOCUMENTATION.md) pour les détails complets.

## 📦 Structure du projet

```
.
├── backend/              # API Node.js + Express
│   ├── config/          # Configuration DB et plans
│   ├── middleware/      # Auth et quotas
│   ├── routes/          # Endpoints API
│   └── scripts/         # Scripts d'initialisation
│
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Composants UI
│   │   └── contexts/    # Context API (Auth)
│   └── public/
│       └── tools/       # Outils HTML protégés
│
└── docs/                # Documentation
```

## 💳 Plans et tarification

| Plan | Prix/mois | Quotas | Fonctionnalités |
|------|-----------|--------|-----------------|
| **Free** | 0€ | 10/jour, 100/mois | Tous les outils, Support communautaire |
| **Pro** | 9.99€ | 1000/jour, 30k/mois | Export avancé, Support prioritaire, Sans pub |
| **Enterprise** | 49.99€ | Illimité | API, White-label, Support 24/7, SLA 99.9% |

*Réduction de 17% sur les plans annuels*

## 🔧 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur actuel

### Abonnements
- `GET /api/subscription/plans` - Liste des plans
- `GET /api/subscription/current` - Abonnement actuel
- `POST /api/subscription/create-checkout-session` - Créer session paiement
- `POST /api/subscription/cancel` - Annuler abonnement

### Usage
- `GET /api/usage/stats` - Statistiques d'usage
- `GET /api/usage/quota` - Quotas actuels
- `POST /api/tools/:toolName/use` - Enregistrer utilisation

### Webhooks
- `POST /api/webhooks/stripe` - Webhooks Stripe

## 🛠️ Technologies utilisées

### Backend
- Node.js + Express
- PostgreSQL
- JWT (jsonwebtoken)
- Stripe SDK
- bcryptjs

### Frontend
- React 18
- Tailwind CSS
- Stripe.js
- Context API

## 📈 Métriques et analytics

Le système enregistre automatiquement :
- Nombre d'utilisations par outil
- Utilisations par catégorie
- Tendances temporelles
- Taux de conversion
- Churn rate

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- Tokens JWT avec expiration
- Rate limiting sur les API
- Helmet.js pour headers sécurisés
- Validation des entrées
- Protection CSRF
- HTTPS obligatoire en production

## 🌍 Déploiement

### Backend
- Heroku, Railway, Render
- DigitalOcean, AWS, GCP

### Frontend
- Vercel, Netlify
- Cloudflare Pages

### Base de données
- Heroku Postgres
- Supabase
- AWS RDS

Voir [SAAS_DOCUMENTATION.md](./SAAS_DOCUMENTATION.md) pour les guides de déploiement.

## 📝 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou une PR.

## 📧 Support

Pour toute question : support@useful-tools.com

---

**Fait avec ❤️ pour les créateurs d'outils**


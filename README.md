# 🚀 Useful Tools SaaS

Plateforme SaaS complète pour monétiser des outils en ligne avec authentification, quotas et paiements Stripe.

## ✨ Fonctionnalités

- 🔐 **Authentification JWT** - Inscription, connexion, sessions sécurisées
- 💳 **Paiements Stripe** - 3 plans tarifaires (Free, Pro, Enterprise)
- 📊 **Système de quotas** - Limites quotidiennes et mensuelles
- 🎨 **Dashboard utilisateur** - Statistiques, usage, gestion abonnement
- 🗄️ **PostgreSQL** - Base de données robuste
- 🐳 **Docker** - Déploiement facile

## 💰 Plans tarifaires

| Plan | Prix/mois | Quotas/jour | Quotas/mois |
|------|-----------|-------------|-------------|
| **Free** | 0€ | 10 | 100 |
| **Pro** | 9.99€ | 1 000 | 30 000 |
| **Enterprise** | 49.99€ | ∞ Illimité | ∞ Illimité |

## 🚀 Installation rapide

```bash
# Installation automatique
bash setup.sh

# OU installation manuelle
cd backend && npm install
cd ../frontend && npm install

# Configurer les variables d'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos valeurs

# Initialiser la base de données
cd backend && npm run init-db

# Démarrer
cd backend && npm run dev
cd frontend && npm start
```

## 📚 Documentation

- **🚀_DEMARRAGE_RAPIDE.md** - Guide de démarrage
- **SAAS_DOCUMENTATION.md** - Documentation complète
- **TOOL_INTEGRATION_GUIDE.md** - Intégrer vos outils HTML
- **COMMANDS_AND_TROUBLESHOOTING.md** - Dépannage

## 🏗️ Architecture

```
.
├── backend/              # API Node.js + Express + PostgreSQL
│   ├── config/          # Configuration DB et plans
│   ├── middleware/      # Auth JWT et quotas
│   ├── routes/          # Endpoints API
│   └── scripts/         # Scripts d'initialisation
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Dashboard, Quotas, Stats, etc.
│   │   └── contexts/    # AuthContext
│   └── public/
└── docs/                # Documentation
```

## 🛠️ Technologies

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT (jsonwebtoken)
- Stripe SDK
- bcryptjs

**Frontend:**
- React 18
- Tailwind CSS
- Stripe.js
- Context API

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Tokens JWT avec expiration
- Rate limiting
- Helmet.js
- Validation des entrées
- HTTPS en production

## 🚢 Déploiement

### Backend
- Heroku, Railway, Render
- DigitalOcean, AWS, GCP

### Frontend
- Vercel, Netlify
- Cloudflare Pages

### Docker
```bash
docker-compose up -d
```

## 📝 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou une PR.

---

**Créé avec ❤️ pour monétiser vos outils en ligne**

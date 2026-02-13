# 🚀 Guide de déploiement automatique

## 🏆 Option 1 : Railway (RECOMMANDÉ - Le plus simple)

### Pourquoi Railway ?
- ✅ Déploiement automatique à chaque `git push`
- ✅ PostgreSQL inclus et configuré automatiquement
- ✅ Variables d'environnement via interface
- ✅ Domaine HTTPS gratuit
- ✅ Logs en temps réel
- ✅ Plan gratuit : $5/mois de crédit

### Étapes de déploiement

#### 1. Créer un compte Railway
1. Aller sur https://railway.app
2. Se connecter avec GitHub
3. Autoriser Railway à accéder à vos repos

#### 2. Créer un nouveau projet
1. Cliquer sur **"New Project"**
2. Sélectionner **"Deploy from GitHub repo"**
3. Choisir **`saas-useful-tools`**
4. Railway détecte automatiquement Node.js

#### 3. Ajouter PostgreSQL
1. Dans votre projet, cliquer sur **"+ New"**
2. Sélectionner **"Database"** → **"Add PostgreSQL"**
3. Railway crée automatiquement la base de données
4. Les variables `DATABASE_URL` sont auto-configurées

#### 4. Configurer les variables d'environnement

Cliquer sur votre service backend → **Variables** → Ajouter :

```bash
NODE_ENV=production
PORT=3001

# JWT (générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=votre_secret_jwt_ici
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_YEARLY=price_...
STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ID_ENTERPRISE_YEARLY=price_...

# Frontend URL (sera fourni par Railway après déploiement)
FRONTEND_URL=https://votre-frontend.up.railway.app
```

**Note:** Railway fournit automatiquement `DATABASE_URL` depuis PostgreSQL

#### 5. Initialiser la base de données

Une fois déployé, ouvrir le terminal Railway :
1. Cliquer sur votre service → **"..."** → **"Terminal"**
2. Exécuter :
```bash
cd backend
npm run init-db
```

#### 6. Déployer le Frontend

**Option A : Vercel (Recommandé pour React)**
1. Aller sur https://vercel.com
2. Importer le repo `saas-useful-tools`
3. **Root Directory:** `frontend`
4. **Framework Preset:** Create React App
5. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://votre-backend.up.railway.app
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
6. Déployer

**Option B : Railway (tout au même endroit)**
1. Dans le même projet Railway, cliquer **"+ New"** → **"GitHub Repo"**
2. Sélectionner le même repo
3. **Root Directory:** `frontend`
4. **Start Command:** `npm start`
5. Ajouter les variables d'environnement

#### 7. Configurer le webhook Stripe

1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer **"Add endpoint"**
3. **Endpoint URL:** `https://votre-backend.up.railway.app/api/webhooks/stripe`
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copier le **Signing secret** et l'ajouter dans Railway (`STRIPE_WEBHOOK_SECRET`)

#### 8. Mettre à jour FRONTEND_URL dans Railway

Une fois le frontend déployé, mettre à jour la variable `FRONTEND_URL` dans Railway avec l'URL Vercel.

### ✅ Déploiement automatique activé !

Maintenant, à chaque `git push` sur `main` :
- Railway redéploie automatiquement le backend
- Vercel redéploie automatiquement le frontend

---

## 🔄 Option 2 : Render (Alternative gratuite)

### Avantages
- ✅ Plan gratuit permanent
- ✅ PostgreSQL gratuit
- ✅ Déploiement auto à chaque push
- ⚠️ Plus lent que Railway (sleep après 15min d'inactivité)

### Étapes

#### 1. Créer un compte
https://render.com → Sign up with GitHub

#### 2. Créer la base de données
1. **New** → **PostgreSQL**
2. **Name:** `useful-tools-db`
3. **Plan:** Free
4. Copier l'**Internal Database URL**

#### 3. Créer le service Backend
1. **New** → **Web Service**
2. Connecter le repo `saas-useful-tools`
3. **Name:** `useful-tools-backend`
4. **Root Directory:** `backend`
5. **Build Command:** `npm install`
6. **Start Command:** `npm start`
7. **Plan:** Free

#### 4. Variables d'environnement (Render)
Ajouter dans **Environment** :
```bash
NODE_ENV=production
DATABASE_URL=<copier depuis PostgreSQL>
JWT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
FRONTEND_URL=https://votre-frontend.onrender.com
```

#### 5. Initialiser la DB
Dans **Shell** :
```bash
cd backend && npm run init-db
```

#### 6. Déployer le Frontend
1. **New** → **Static Site**
2. **Root Directory:** `frontend`
3. **Build Command:** `npm install && npm run build`
4. **Publish Directory:** `build`
5. Variables :
   ```
   REACT_APP_API_URL=https://useful-tools-backend.onrender.com
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

---

## 🐳 Option 3 : Docker + DigitalOcean App Platform

### Avantages
- ✅ Contrôle total avec Docker
- ✅ Déploiement auto
- ✅ $5/mois pour commencer

### Configuration

Créer `Dockerfile` à la racine :

```dockerfile
# Backend
FROM node:18-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Frontend
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production
FROM node:18-alpine
WORKDIR /app
COPY --from=backend /app/backend ./backend
COPY --from=frontend /app/frontend/build ./frontend/build
WORKDIR /app/backend
EXPOSE 3001
CMD ["npm", "start"]
```

Puis sur DigitalOcean :
1. **Apps** → **Create App**
2. Connecter GitHub
3. Sélectionner le repo
4. Ajouter **Managed Database** (PostgreSQL)
5. Configurer les variables d'environnement
6. Déployer

---

## 📊 Comparaison rapide

| Service | Prix | DB incluse | Auto-deploy | Vitesse | Gratuit |
|---------|------|------------|-------------|---------|---------|
| **Railway** | $5/mois crédit | ✅ PostgreSQL | ✅ | ⚡⚡⚡ | ✅ (limité) |
| **Render** | Gratuit | ✅ PostgreSQL | ✅ | ⚡ (sleep) | ✅ |
| **Vercel + Railway** | $5/mois | ✅ | ✅ | ⚡⚡⚡ | ✅ |
| **Heroku** | $7/mois | ❌ ($9 en plus) | ✅ | ⚡⚡ | ❌ |
| **DigitalOcean** | $5/mois | ❌ ($15 en plus) | ✅ | ⚡⚡⚡ | ❌ |

---

## 🎯 Ma recommandation

### Pour commencer (gratuit/pas cher) :
**Railway (Backend + DB) + Vercel (Frontend)**
- Backend + PostgreSQL sur Railway ($5/mois de crédit gratuit)
- Frontend sur Vercel (gratuit illimité)
- Total : **Gratuit** pour commencer

### Pour production (meilleur rapport qualité/prix) :
**Railway tout-en-un**
- Backend, Frontend et PostgreSQL sur Railway
- ~$10-15/mois selon l'usage
- Tout au même endroit, facile à gérer

---

## 🔧 Configuration GitHub Actions (Bonus)

Pour des tests automatiques avant déploiement :

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Test Backend
        run: |
          cd backend
          npm install
          npm test
      
      - name: Test Frontend
        run: |
          cd frontend
          npm install
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: echo "Railway auto-deploys on push"
```

---

## ✅ Checklist de déploiement

- [ ] Compte Railway/Render créé
- [ ] Repo GitHub connecté
- [ ] PostgreSQL créé
- [ ] Variables d'environnement configurées
- [ ] Base de données initialisée (`npm run init-db`)
- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] Webhook Stripe configuré
- [ ] Test complet du flow (inscription → paiement → utilisation)
- [ ] Domaine personnalisé configuré (optionnel)

---

## 🆘 Dépannage

### Backend ne démarre pas
```bash
# Vérifier les logs Railway/Render
# Vérifier que DATABASE_URL est défini
# Vérifier que npm run init-db a été exécuté
```

### Frontend ne se connecte pas au backend
```bash
# Vérifier REACT_APP_API_URL
# Vérifier CORS dans backend/server.js
# Vérifier que FRONTEND_URL est correct dans le backend
```

### Webhook Stripe ne fonctionne pas
```bash
# Vérifier l'URL du webhook dans Stripe Dashboard
# Vérifier STRIPE_WEBHOOK_SECRET
# Tester avec Stripe CLI : stripe listen --forward-to https://votre-backend/api/webhooks/stripe
```

---

**Prêt à déployer ? Commencez avec Railway + Vercel !** 🚀


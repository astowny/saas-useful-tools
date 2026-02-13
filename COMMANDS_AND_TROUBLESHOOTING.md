# 🔧 Commandes utiles et Troubleshooting

## 📦 Installation et démarrage

### Installation complète
```bash
# Installation automatique
bash setup.sh

# OU installation manuelle
cd backend && npm install
cd ../frontend && npm install
```

### Démarrage en développement
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Démarrage avec Docker
```bash
# Créer le fichier .env à la racine avec vos variables
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

---

## 🗄️ Base de données

### Initialiser la base de données
```bash
cd backend
npm run init-db
```

### Se connecter à PostgreSQL
```bash
# Local
psql -U postgres -d useful_tools_saas

# Docker
docker exec -it useful-tools-db psql -U postgres -d useful_tools_saas
```

### Requêtes utiles
```sql
-- Voir tous les utilisateurs
SELECT id, email, created_at FROM users;

-- Voir les abonnements actifs
SELECT u.email, sp.display_name, us.status, us.current_period_end
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active';

-- Voir l'usage d'un utilisateur
SELECT tool_name, COUNT(*) as count
FROM usage_logs
WHERE user_id = 1
GROUP BY tool_name
ORDER BY count DESC;

-- Réinitialiser le quota d'un utilisateur (pour tests)
DELETE FROM usage_logs WHERE user_id = 1;

-- Changer le plan d'un utilisateur
UPDATE user_subscriptions 
SET plan_id = (SELECT id FROM subscription_plans WHERE name = 'pro')
WHERE user_id = 1 AND status = 'active';
```

---

## 🔑 Génération de secrets

### JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Stripe Webhook Secret
1. Aller sur https://dashboard.stripe.com/webhooks
2. Créer un endpoint
3. Copier le "Signing secret"

---

## 🧪 Tests

### Tester l'API avec curl

**Inscription**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'
```

**Connexion**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Récupérer le profil**
```bash
TOKEN="votre_token_jwt"
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Récupérer les quotas**
```bash
curl http://localhost:3001/api/usage/quota \
  -H "Authorization: Bearer $TOKEN"
```

**Utiliser un outil**
```bash
curl -X POST http://localhost:3001/api/tools/qr-generator/use \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"utilities"}'
```

---

## 🐛 Troubleshooting

### Problème : "Cannot connect to database"

**Solution :**
```bash
# Vérifier que PostgreSQL est démarré
sudo service postgresql status

# Démarrer PostgreSQL
sudo service postgresql start

# Vérifier les credentials dans .env
cat backend/.env | grep DB_
```

### Problème : "JWT malformed" ou "Token invalide"

**Solution :**
```bash
# Vérifier que JWT_SECRET est défini
cat backend/.env | grep JWT_SECRET

# Régénérer un nouveau secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Mettre à jour .env et redémarrer le serveur
```

### Problème : "Stripe webhook signature verification failed"

**Solution :**
```bash
# Vérifier que STRIPE_WEBHOOK_SECRET est correct
cat backend/.env | grep STRIPE_WEBHOOK_SECRET

# Tester les webhooks en local avec Stripe CLI
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Copier le webhook secret affiché et le mettre dans .env
```

### Problème : "CORS error" dans le frontend

**Solution :**
```javascript
// Vérifier que FRONTEND_URL est correct dans backend/.env
FRONTEND_URL=http://localhost:3000

// Vérifier que REACT_APP_API_URL est correct dans frontend/.env
REACT_APP_API_URL=http://localhost:3001
```

### Problème : "Quota toujours à 0"

**Solution :**
```sql
-- Vérifier que l'utilisateur a un abonnement actif
SELECT * FROM user_subscriptions WHERE user_id = 1;

-- Si pas d'abonnement, en créer un
INSERT INTO user_subscriptions (user_id, plan_id, status)
VALUES (1, (SELECT id FROM subscription_plans WHERE name = 'free'), 'active');
```

### Problème : "Cannot find module"

**Solution :**
```bash
# Réinstaller les dépendances
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🔍 Logs et debugging

### Voir les logs backend
```bash
# En développement (avec nodemon)
cd backend
npm run dev

# Les logs s'affichent dans le terminal
```

### Voir les logs Stripe
```bash
# Dashboard Stripe → Developers → Logs
# Ou avec Stripe CLI
stripe logs tail
```

### Activer le mode debug
```bash
# Dans backend/.env
NODE_ENV=development
DEBUG=true

# Redémarrer le serveur
```

---

## 📊 Monitoring

### Vérifier la santé de l'API
```bash
curl http://localhost:3001/health
```

### Voir les processus
```bash
# Voir les processus Node.js
ps aux | grep node

# Tuer un processus
kill -9 <PID>
```

### Voir l'utilisation de la base de données
```sql
-- Taille de la base
SELECT pg_size_pretty(pg_database_size('useful_tools_saas'));

-- Nombre d'enregistrements par table
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

---

## 🚀 Déploiement

### Heroku (Backend)
```bash
# Créer l'app
heroku create useful-tools-api

# Ajouter PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurer les variables
heroku config:set JWT_SECRET=xxx
heroku config:set STRIPE_SECRET_KEY=xxx
heroku config:set STRIPE_WEBHOOK_SECRET=xxx
heroku config:set FRONTEND_URL=https://votre-frontend.vercel.app

# Déployer
git push heroku main

# Initialiser la DB
heroku run npm run init-db

# Voir les logs
heroku logs --tail
```

### Vercel (Frontend)
```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
cd frontend
vercel --prod

# Configurer les variables d'environnement dans le dashboard
# REACT_APP_API_URL=https://votre-backend.herokuapp.com
# REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## 🔐 Sécurité en production

### Checklist
- [ ] Changer tous les secrets (JWT, Stripe)
- [ ] Utiliser HTTPS partout
- [ ] Activer les clés Stripe en mode production
- [ ] Configurer CORS strictement
- [ ] Activer rate limiting
- [ ] Sauvegarder la base de données régulièrement
- [ ] Monitorer les logs d'erreur
- [ ] Configurer les alertes Stripe
- [ ] Tester le flow complet de paiement

---

## 📞 Support

Si vous rencontrez un problème non listé ici :

1. Vérifier les logs backend et frontend
2. Vérifier la console du navigateur (F12)
3. Vérifier les logs Stripe
4. Consulter la documentation complète dans `SAAS_DOCUMENTATION.md`
5. Vérifier les exemples dans `TOOL_INTEGRATION_GUIDE.md`

---

**Bon développement ! 🚀**


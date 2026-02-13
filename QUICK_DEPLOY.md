# ⚡ Déploiement rapide en 10 minutes

## 🎯 Setup recommandé : Railway + Vercel

**Coût :** Gratuit pour commencer (Railway donne $5/mois de crédit)

---

## 📋 Prérequis

- [ ] Compte GitHub avec le repo `saas-useful-tools` pushé
- [ ] Compte Stripe (mode test OK pour commencer)
- [ ] 10 minutes devant vous ☕

---

## 🚀 Étape 1 : Déployer le Backend (Railway) - 3 min

### 1.1 Créer le compte
1. Aller sur **https://railway.app**
2. Cliquer **"Login with GitHub"**
3. Autoriser Railway

### 1.2 Créer le projet
1. Cliquer **"New Project"**
2. Sélectionner **"Deploy from GitHub repo"**
3. Choisir **`saas-useful-tools`**
4. Railway commence le déploiement automatiquement

### 1.3 Ajouter PostgreSQL
1. Dans votre projet, cliquer **"+ New"**
2. Sélectionner **"Database"** → **"Add PostgreSQL"**
3. ✅ C'est tout ! Railway configure automatiquement `DATABASE_URL`

### 1.4 Configurer les variables d'environnement
1. Cliquer sur votre service backend
2. Onglet **"Variables"**
3. Cliquer **"+ New Variable"** et ajouter :

```bash
NODE_ENV=production
JWT_SECRET=GÉNÉRER_UN_SECRET_ICI
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_STRIPE
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_STRIPE
STRIPE_WEBHOOK_SECRET=whsec_SERA_CONFIGURE_PLUS_TARD
FRONTEND_URL=https://SERA_CONFIGURE_APRES_VERCEL
```

**💡 Générer JWT_SECRET :**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 1.5 Initialiser la base de données
1. Attendre que le déploiement soit terminé (voyant vert)
2. Cliquer sur votre service → **"..."** → **"Terminal"**
3. Exécuter :
```bash
cd backend
npm run init-db
```
4. Vous devriez voir : "✅ Database initialized successfully"

### 1.6 Noter l'URL du backend
1. Onglet **"Settings"**
2. Section **"Domains"**
3. Copier l'URL (ex: `https://saas-useful-tools-production.up.railway.app`)

---

## 🎨 Étape 2 : Déployer le Frontend (Vercel) - 3 min

### 2.1 Créer le compte
1. Aller sur **https://vercel.com**
2. Cliquer **"Sign Up"** → **"Continue with GitHub"**
3. Autoriser Vercel

### 2.2 Importer le projet
1. Cliquer **"Add New..."** → **"Project"**
2. Trouver **`saas-useful-tools`** et cliquer **"Import"**

### 2.3 Configurer le projet
1. **Framework Preset:** Create React App (détecté automatiquement)
2. **Root Directory:** Cliquer **"Edit"** → Sélectionner **`frontend`**
3. **Build Command:** `npm run build` (par défaut)
4. **Output Directory:** `build` (par défaut)

### 2.4 Ajouter les variables d'environnement
Cliquer **"Environment Variables"** et ajouter :

```bash
REACT_APP_API_URL=https://VOTRE_URL_RAILWAY_BACKEND
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_STRIPE
```

Remplacer `VOTRE_URL_RAILWAY_BACKEND` par l'URL copiée à l'étape 1.6

### 2.5 Déployer
1. Cliquer **"Deploy"**
2. Attendre 2-3 minutes
3. ✅ Frontend déployé !

### 2.6 Noter l'URL du frontend
Copier l'URL Vercel (ex: `https://saas-useful-tools.vercel.app`)

---

## 🔗 Étape 3 : Connecter Backend et Frontend - 2 min

### 3.1 Mettre à jour Railway
1. Retourner sur Railway
2. Cliquer sur votre service backend → **"Variables"**
3. Modifier **`FRONTEND_URL`** avec l'URL Vercel
4. Railway redéploie automatiquement

---

## 💳 Étape 4 : Configurer Stripe Webhook - 2 min

### 4.1 Créer le webhook
1. Aller sur **https://dashboard.stripe.com/webhooks**
2. Cliquer **"Add endpoint"**
3. **Endpoint URL:** `https://VOTRE_URL_RAILWAY/api/webhooks/stripe`
4. Cliquer **"Select events"**

### 4.2 Sélectionner les événements
Cocher :
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### 4.3 Récupérer le secret
1. Cliquer **"Add endpoint"**
2. Copier le **"Signing secret"** (commence par `whsec_`)
3. Retourner sur Railway
4. Modifier **`STRIPE_WEBHOOK_SECRET`** avec ce secret
5. Railway redéploie automatiquement

---

## ✅ Étape 5 : Tester - 2 min

### 5.1 Accéder au frontend
Ouvrir l'URL Vercel dans votre navigateur

### 5.2 Créer un compte
1. Cliquer **"Sign Up"**
2. Créer un compte test
3. Vous devriez être redirigé vers le dashboard

### 5.3 Tester un paiement (mode test)
1. Aller sur **"Pricing"**
2. Choisir le plan **"Pro"**
3. Utiliser la carte de test Stripe :
   - **Numéro:** `4242 4242 4242 4242`
   - **Date:** N'importe quelle date future
   - **CVC:** N'importe quel 3 chiffres
4. Compléter le paiement
5. Vous devriez être redirigé avec le plan Pro activé

### 5.4 Vérifier les quotas
1. Retourner au dashboard
2. Vérifier que les quotas affichent : **1000/jour**
3. ✅ Tout fonctionne !

---

## 🎉 C'est terminé !

Votre SaaS est maintenant déployé et fonctionnel !

### 📊 Ce qui est configuré

✅ Backend déployé sur Railway avec PostgreSQL  
✅ Frontend déployé sur Vercel  
✅ Base de données initialisée  
✅ Webhooks Stripe configurés  
✅ Déploiement automatique à chaque `git push`  
✅ HTTPS activé partout  
✅ Domaines fournis gratuitement  

### 🔄 Déploiement automatique activé

Maintenant, à chaque fois que vous faites :
```bash
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main
```

- Railway redéploie automatiquement le backend
- Vercel redéploie automatiquement le frontend

---

## 🌐 URLs de votre SaaS

- **Frontend:** https://saas-useful-tools.vercel.app
- **Backend:** https://saas-useful-tools-production.up.railway.app
- **Dashboard Railway:** https://railway.app/dashboard
- **Dashboard Vercel:** https://vercel.com/dashboard
- **Dashboard Stripe:** https://dashboard.stripe.com

---

## 🚀 Prochaines étapes

### Passer en production
1. Activer le mode production dans Stripe
2. Remplacer les clés test par les clés live
3. Configurer un domaine personnalisé (optionnel)
4. Tester le flow complet de paiement

### Ajouter des fonctionnalités
1. Adapter vos outils HTML (voir `TOOL_INTEGRATION_GUIDE.md`)
2. Personnaliser le design
3. Ajouter l'envoi d'emails
4. Configurer Google Analytics

---

## 🆘 Problèmes ?

### Le backend ne démarre pas
- Vérifier les logs dans Railway
- Vérifier que `npm run init-db` a été exécuté
- Vérifier que toutes les variables d'environnement sont définies

### Le frontend ne se connecte pas
- Vérifier `REACT_APP_API_URL` dans Vercel
- Vérifier `FRONTEND_URL` dans Railway
- Vérifier les logs du navigateur (F12)

### Les webhooks ne fonctionnent pas
- Vérifier l'URL du webhook dans Stripe
- Vérifier `STRIPE_WEBHOOK_SECRET` dans Railway
- Tester avec : `stripe listen --forward-to https://votre-backend/api/webhooks/stripe`

---

**Besoin d'aide ?** Consultez `DEPLOYMENT_GUIDE.md` pour plus de détails.

**Félicitations ! Votre SaaS est en ligne ! 🎉**


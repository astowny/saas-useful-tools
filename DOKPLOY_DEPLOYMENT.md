# 🚀 Déploiement sur Dokploy avec MINIMA_SEED

Ce guide explique comment déployer le SaaS Useful Tools sur **Dokploy** avec une commande d'initialisation personnalisée incluant `MINIMA_SEED`.

---

## 📋 Prérequis

- Un serveur Dokploy configuré
- Un compte GitHub avec le repository `saas-useful-tools`
- Une base de données PostgreSQL (Dokploy peut en créer une)

---

## 🔧 Configuration Dokploy

### Étape 1 : Créer un nouveau projet

1. Connectez-vous à votre instance Dokploy
2. Cliquez sur **"New Project"**
3. Nom du projet : `saas-useful-tools`

### Étape 2 : Ajouter PostgreSQL

1. Dans votre projet, cliquez sur **"Add Service"**
2. Sélectionnez **"PostgreSQL"**
3. Configuration :
   - **Name** : `postgres`
   - **Database** : `useful_tools_saas`
   - **User** : `postgres`
   - **Password** : (générez un mot de passe sécurisé)
4. Cliquez sur **"Create"**

✅ Dokploy va créer automatiquement la variable `DATABASE_URL`

### Étape 3 : Ajouter le Backend

1. Cliquez sur **"Add Service"**
2. Sélectionnez **"GitHub Repository"**
3. Configuration :
   - **Repository** : `astowny/saas-useful-tools`
   - **Branch** : `main`
   - **Build Path** : `backend`
   - **Port** : `3001`

### Étape 4 : Variables d'environnement

Dans les paramètres du service backend, ajoutez ces variables :

```env
# Automatique (fourni par PostgreSQL)
DATABASE_URL=postgresql://...

# À configurer manuellement
NODE_ENV=production
PORT=3001

# JWT Secret (générez avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=votre_secret_jwt_super_securise

# Stripe
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret

# Frontend URL (votre domaine Dokploy)
FRONTEND_URL=https://votre-domaine.com,http://localhost:3000

# ⭐ MINIMA_SEED - IMPORTANT !
MINIMA_SEED=votre_seed_minima_personnalise
```

---

## 🎯 Commande d'initialisation personnalisée

### Option 1 : Via le Shell Dokploy (Recommandé)

1. Une fois le backend déployé, allez dans **"Shell"**
2. Exécutez la commande :

```bash
npm run init-db-seed
```

Cette commande va :
- ✅ Créer toutes les tables
- ✅ Ajouter la colonne `minima_seed` dans la table `users`
- ✅ Insérer les plans d'abonnement
- ✅ Utiliser la variable `MINIMA_SEED` pour les futurs utilisateurs

### Option 2 : Commande de démarrage personnalisée

Dans Dokploy, vous pouvez configurer une commande de démarrage personnalisée :

1. Allez dans **Settings** → **Build & Deploy**
2. **Start Command** :

```bash
npm run init-db-seed && npm start
```

⚠️ **Attention** : Cette méthode exécute l'initialisation à chaque démarrage. Utilisez plutôt l'Option 1 pour une initialisation unique.

### Option 3 : Script de déploiement

Créez un script `deploy-hook.sh` dans le backend :

```bash
#!/bin/bash
echo "🔄 Running database initialization..."
npm run init-db-seed
echo "✅ Database initialized"
echo "🚀 Starting server..."
npm start
```

Puis dans Dokploy :
- **Start Command** : `bash deploy-hook.sh`

---

## 📝 Différences avec Railway

| Fonctionnalité | Railway | Dokploy |
|----------------|---------|---------|
| **DATABASE_URL** | ✅ Automatique | ✅ Automatique |
| **Init DB** | Via Railway CLI | Via Shell Dokploy |
| **Custom Commands** | `railway run` | Shell ou Start Command |
| **MINIMA_SEED** | Variable d'env | Variable d'env |

---

## 🧪 Tester l'initialisation

### 1. Vérifier les logs

Dans Dokploy → Backend → **Logs**, cherchez :

```
🔄 Initialisation de la base de données...
📍 Environnement: production
🔗 Connexion: DATABASE_URL
🔐 MINIMA_SEED: ***seed
✅ Schéma créé avec succès
✅ Plans d'abonnement insérés
🎉 Base de données initialisée avec succès!
🔐 MINIMA_SEED configuré pour les futurs utilisateurs
```

### 2. Vérifier la base de données

Dans Dokploy → PostgreSQL → **Shell** :

```sql
-- Vérifier que les tables existent
\dt

-- Vérifier que la colonne minima_seed existe
\d users

-- Vérifier les plans
SELECT name, display_name FROM subscription_plans;
```

---

## 🔐 Sécurité MINIMA_SEED

⚠️ **IMPORTANT** : Le `MINIMA_SEED` est sensible !

- ✅ Stockez-le dans les variables d'environnement Dokploy
- ✅ Ne le commitez JAMAIS dans Git
- ✅ Utilisez un seed différent pour dev/prod
- ✅ Le script affiche seulement les 4 derniers caractères dans les logs

---

## 🚀 Workflow complet

1. **Configurer PostgreSQL** dans Dokploy
2. **Ajouter le backend** depuis GitHub
3. **Configurer les variables** (surtout `MINIMA_SEED`)
4. **Déployer** (Dokploy build automatiquement)
5. **Initialiser la DB** via Shell : `npm run init-db-seed`
6. **Tester** l'API : `https://votre-backend.dokploy.app/health`

---

## 📚 Scripts disponibles

```bash
# Initialisation standard (sans minima_seed)
npm run init-db

# Initialisation avec MINIMA_SEED
npm run init-db-seed

# Démarrer le serveur
npm start

# Développement local
npm run dev
```

---

## 🆘 Dépannage

### Erreur : "MINIMA_SEED non défini"

Le script fonctionne quand même avec une valeur par défaut, mais configurez la variable :
```bash
MINIMA_SEED=votre_seed_personnalise
```

### Erreur : "Cannot connect to database"

Vérifiez que `DATABASE_URL` est bien configuré :
```bash
echo $DATABASE_URL
```

### Erreur : "Table already exists"

C'est normal ! Le script utilise `CREATE TABLE IF NOT EXISTS`, il ne recrée pas les tables existantes.

---

## 💡 Résumé

✅ **Script créé** : `backend/scripts/init-with-seed.js`  
✅ **Commande ajoutée** : `npm run init-db-seed`  
✅ **Support DATABASE_URL** : Compatible Dokploy/Railway/Render  
✅ **MINIMA_SEED** : Stocké dans la table `users`  
✅ **Sécurisé** : Seed masqué dans les logs  

**Commande à exécuter dans Dokploy Shell :**
```bash
npm run init-db-seed
```


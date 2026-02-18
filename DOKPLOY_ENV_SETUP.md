# 🔐 Configuration des Variables d'Environnement Dokploy

Ce guide vous montre **exactement** comment configurer toutes les variables d'environnement dans Dokploy pour que votre application fonctionne correctement.

---

## ⚠️ IMPORTANT : Les variables ne sont PAS automatiques !

Dokploy **NE LIT PAS** le fichier `.env.example` automatiquement. Vous devez **configurer manuellement** chaque variable dans l'interface Dokploy.

---

## 📋 Liste complète des variables à configurer

### 1. Accéder aux variables dans Dokploy

1. Connectez-vous à Dokploy
2. Ouvrez votre projet `saas-useful-tools`
3. Cliquez sur le service **Backend**
4. Allez dans l'onglet **"Environment Variables"** ou **"Variables"**

---

## ✅ Variables REQUISES (à configurer obligatoirement)

Cliquez sur **"Add Variable"** pour chaque variable ci-dessous :

### Variable 1 : NODE_ENV
```
Nom  : NODE_ENV
Valeur : production
```

### Variable 2 : PORT
```
Nom  : PORT
Valeur : 3001
```

### Variable 3 : JWT_SECRET
```
Nom  : JWT_SECRET
Valeur : [GÉNÉREZ UNE CLÉ SECRÈTE]
```

**Comment générer :**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Exemple de résultat :
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456789012345678901234567890abcdef1234567890abcdef12345678
```

### Variable 4 : STRIPE_SECRET_KEY
```
Nom  : STRIPE_SECRET_KEY
Valeur : sk_test_VOTRE_CLE_STRIPE
```

**Où trouver :**
1. https://dashboard.stripe.com
2. Developers → API keys
3. Copiez la "Secret key" (commence par `sk_test_` ou `sk_live_`)

### Variable 5 : FRONTEND_URL
```
Nom  : FRONTEND_URL
Valeur : https://votre-domaine.com,http://localhost:3000
```

**Important :**
- Remplacez `votre-domaine.com` par votre vrai domaine
- Gardez `http://localhost:3000` pour le développement local
- **PAS D'ESPACE** autour de la virgule !

---

## 🔗 Configuration Base de Données

### Option A : PostgreSQL Dokploy (RECOMMANDÉ)

Si vous avez ajouté PostgreSQL via Dokploy :

1. Dokploy crée automatiquement `DATABASE_URL`
2. **Vous n'avez RIEN à faire** pour cette variable
3. Vérifiez qu'elle existe dans la liste des variables

### Option B : Base de données externe

Si vous utilisez une base externe (Supabase, Neon, etc.) :

```
Nom  : DATABASE_URL
Valeur : postgresql://user:password@host:port/database
```

Exemple :
```
postgresql://postgres:mypassword@db.example.com:5432/useful_tools_saas
```

---

## 📦 Variables OPTIONNELLES (mais recommandées)

### Variable 6 : STRIPE_WEBHOOK_SECRET
```
Nom  : STRIPE_WEBHOOK_SECRET
Valeur : whsec_VOTRE_WEBHOOK_SECRET
```

**Comment obtenir :**
1. https://dashboard.stripe.com/webhooks
2. Add endpoint
3. URL : `https://votre-backend.dokploy.app/api/webhooks/stripe`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copiez le "Signing secret" (commence par `whsec_`)

---

## 🧪 Vérifier que les variables sont bien prises en compte

### Méthode 1 : Script de vérification

Dans Dokploy → Backend → **Shell** :

```bash
npm run check-env
```

Vous verrez un rapport complet :
```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║        🔍 VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

📋 VARIABLES REQUISES:

   ✅ JWT_SECRET                ***3456
      Clé secrète pour les tokens JWT

   ✅ STRIPE_SECRET_KEY         ***test
      Clé secrète Stripe (sk_test_... ou sk_live_...)

   ✅ FRONTEND_URL              https://votre-domaine.com,http://localhost:3000
      URL du frontend pour CORS

...

✅ SUCCÈS: Toutes les variables requises sont configurées!
```

### Méthode 2 : Vérifier les logs au démarrage

Dans Dokploy → Backend → **Logs** :

Cherchez au démarrage du serveur :
```
🔍 Vérification des variables d'environnement...

✅ JWT_SECRET: ***3456
✅ STRIPE_SECRET_KEY: ***test
✅ FRONTEND_URL: https://votre-domaine.com,http://localhost:3000

📋 Variables optionnelles:
✅ DATABASE_URL: ***5432

🔗 Connexion DB: DATABASE_URL (production)
📍 NODE_ENV: production
📍 PORT: 3001

✅ Toutes les variables requises sont configurées!
```

### Méthode 3 : Tester manuellement

Dans Dokploy → Backend → **Shell** :

```bash
# Vérifier une variable spécifique
echo $JWT_SECRET
echo $DATABASE_URL

# Vérifier toutes les variables
env | grep -E "JWT|STRIPE|DATABASE|FRONTEND"
```

---

## ❌ Que faire si des variables manquent ?

### Symptôme : Le serveur ne démarre pas

**Logs :**
```
❌ ERREUR: Variables d'environnement manquantes:
   - JWT_SECRET
   - STRIPE_SECRET_KEY
```

**Solution :**
1. Retournez dans Dokploy → Backend → Variables
2. Ajoutez les variables manquantes
3. Redémarrez le service

### Symptôme : Erreur de connexion à la base de données

**Logs :**
```
❌ ERREUR: Aucune configuration de base de données trouvée!
```

**Solution :**
1. Vérifiez que PostgreSQL est bien ajouté dans Dokploy
2. Vérifiez que `DATABASE_URL` existe dans les variables
3. Si vous utilisez une DB externe, ajoutez manuellement `DATABASE_URL`

### Symptôme : Erreur CORS

**Logs :**
```
Error: Not allowed by CORS
```

**Solution :**
1. Vérifiez que `FRONTEND_URL` contient votre domaine
2. Format : `https://votre-domaine.com,http://localhost:3000`
3. Pas d'espace autour de la virgule !

---

## 📝 Checklist finale

Avant de démarrer votre application, vérifiez :

- [ ] `NODE_ENV=production` configuré
- [ ] `PORT=3001` configuré
- [ ] `JWT_SECRET` généré et configuré
- [ ] `STRIPE_SECRET_KEY` configuré (depuis Stripe Dashboard)
- [ ] `FRONTEND_URL` configuré avec votre domaine
- [ ] `DATABASE_URL` existe (automatique si PostgreSQL Dokploy)
- [ ] `STRIPE_WEBHOOK_SECRET` configuré (optionnel au début)
- [ ] Script `npm run check-env` exécuté avec succès
- [ ] Logs de démarrage montrent toutes les variables ✅

---

## 💡 Résumé

**Les variables d'environnement ne sont PAS automatiques !**

Vous devez :
1. ✅ Configurer manuellement chaque variable dans Dokploy
2. ✅ Vérifier avec `npm run check-env`
3. ✅ Vérifier les logs au démarrage
4. ✅ Tester l'API

**Le serveur refuse de démarrer si des variables requises manquent !**


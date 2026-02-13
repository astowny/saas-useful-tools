# 🧪 Guide de Test et Configuration de Domaine

## 🎉 Félicitations ! Votre backend est déployé !

---

## 🧪 TESTER VOTRE SAAS

### 1️⃣ Tester le Backend (Railway)

#### Récupérer l'URL du backend

1. Dans Railway, aller dans votre service backend
2. Onglet **"Settings"** → Section **"Domains"**
3. Copier l'URL (ex: `https://saas-useful-tools-production.up.railway.app`)

#### Tester les endpoints

**Health check :**
```
https://votre-backend.railway.app/api/health
```
→ Devrait retourner : `{"status": "ok"}`

**Test d'authentification :**
```
https://votre-backend.railway.app/api/auth/me
```
→ Devrait retourner : `{"error": "No token provided"}`

#### ⚠️ IMPORTANT : Initialiser la base de données

Dans Railway → Votre service → **Terminal** :
```bash
cd backend && npm run init-db
```

Vous devriez voir :
```
✅ Database initialized successfully
✅ Tables created
✅ Indexes created
```

---

### 2️⃣ Déployer le Frontend (Vercel)

#### Étapes de déploiement

1. Aller sur **https://vercel.com**
2. Cliquer **"Add New..."** → **"Project"**
3. Importer **"saas-useful-tools"** depuis GitHub
4. Configuration :
   - **Root Directory :** `frontend`
   - **Framework Preset :** Create React App (détecté automatiquement)
   - **Build Command :** `npm run build`
   - **Output Directory :** `build`

5. **Variables d'environnement :**
   ```
   REACT_APP_API_URL=https://votre-backend.railway.app
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

6. Cliquer **"Deploy"**
7. Attendre 2-3 minutes
8. ✅ Frontend déployé !

---

### 3️⃣ Tester le Flow Complet

#### Test 1 : Inscription

1. Ouvrir l'URL Vercel (ex: `https://saas-useful-tools.vercel.app`)
2. Cliquer **"Sign Up"**
3. Créer un compte :
   - Email : `test@example.com`
   - Password : `Test123!`
4. ✅ Vous devriez être redirigé vers le dashboard

#### Test 2 : Vérifier le plan gratuit

- Dashboard devrait afficher : **"FREE Plan"**
- Quotas : **10/jour, 100/mois**
- Barre de progression verte

#### Test 3 : Tester un paiement (mode test Stripe)

1. Aller sur **"Pricing"**
2. Choisir **"Pro Plan"**
3. Utiliser la carte de test Stripe :
   - **Numéro :** `4242 4242 4242 4242`
   - **Date :** `12/34` (n'importe quelle date future)
   - **CVC :** `123` (n'importe quel 3 chiffres)
4. Compléter le paiement
5. ✅ Paiement devrait réussir
6. ✅ Retour au dashboard avec **"PRO Plan"**
7. ✅ Quotas : **1000/jour, 30000/mois**

#### Test 4 : Tester un outil

1. Utiliser un outil protégé
2. ✅ Devrait fonctionner
3. ✅ Compteur de quotas devrait diminuer
4. Vérifier dans **"Usage Stats"**

---

## 🌐 CONFIGURER UN NOM DE DOMAINE

### Option 1 : Domaine personnalisé sur Railway (Backend)

#### Étapes

1. Dans Railway, aller dans votre service backend
2. Onglet **"Settings"** → Section **"Domains"**
3. Cliquer **"Custom Domain"**
4. Entrer votre domaine : `api.votre-domaine.com`
5. Railway vous donne un enregistrement CNAME

#### Configuration DNS

Dans votre registrar de domaine (OVH, Namecheap, Cloudflare, etc.) :

| Type  | Name | Value                    | TTL  |
|-------|------|--------------------------|------|
| CNAME | api  | [valeur fournie Railway] | 3600 |

6. Attendre la propagation DNS (5-30 minutes)
7. ✅ Backend accessible sur `https://api.votre-domaine.com`

---

### Option 2 : Domaine personnalisé sur Vercel (Frontend)

#### Étapes

1. Dans Vercel, aller dans votre projet
2. Onglet **"Settings"** → **"Domains"**
3. Cliquer **"Add"**
4. Entrer votre domaine : `app.votre-domaine.com` (ou `www.votre-domaine.com`)
5. Vercel vous donne les enregistrements DNS

#### Configuration DNS

| Type  | Name | Value                | TTL  |
|-------|------|----------------------|------|
| CNAME | app  | cname.vercel-dns.com | 3600 |

6. Attendre la propagation DNS (5-30 minutes)
7. ✅ Frontend accessible sur `https://app.votre-domaine.com`

---

### Option 3 : Domaine racine (votre-domaine.com)

Pour utiliser le domaine racine sans sous-domaine :

#### Configuration DNS

| Type | Name | Value        | TTL  |
|------|------|--------------|------|
| A    | @    | 76.76.21.21  | 3600 |
| A    | @    | 76.76.19.19  | 3600 |

✅ Frontend accessible sur `https://votre-domaine.com`

---

## 💡 OÙ ACHETER UN NOM DE DOMAINE ?

### Registrars recommandés

| Registrar       | Prix .com/an | Avantages                          |
|-----------------|--------------|-------------------------------------|
| **Namecheap**   | ~10€         | Interface simple, bon support      |
| **OVH**         | ~8€          | Français, bon rapport qualité/prix |
| **Cloudflare**  | ~9€          | Prix coûtant, DNS rapide           |
| **Google Domains** | ~12€      | Interface Google, fiable           |
| **Gandi**       | ~15€         | Éthique, support excellent         |

### Domaines gratuits (pour tester)

- **Freenom** : .tk, .ml, .ga (gratuit mais peu professionnel)
- **Railway/Vercel** : Sous-domaines gratuits fournis automatiquement

---

## 🎯 EXEMPLE DE CONFIGURATION COMPLÈTE

### URLs finales

```
Backend  : https://api.votre-domaine.com
Frontend : https://app.votre-domaine.com
ou
Frontend : https://votre-domaine.com
```

### Configuration DNS complète

Chez votre registrar (OVH, Namecheap, etc.) :

| Type  | Name | Value                    | TTL  |
|-------|------|--------------------------|------|
| CNAME | api  | [railway-value]          | 3600 |
| CNAME | app  | cname.vercel-dns.com     | 3600 |
| A     | @    | 76.76.21.21              | 3600 |
| A     | @    | 76.76.19.19              | 3600 |

---

## 📋 CHECKLIST COMPLÈTE

### Backend (Railway)

- [ ] Service déployé avec succès
- [ ] PostgreSQL ajouté et connecté
- [ ] Variables d'environnement configurées
- [ ] Base de données initialisée (`npm run init-db`)
- [ ] Health check fonctionne (`/api/health`)
- [ ] Domaine personnalisé configuré (optionnel)

### Frontend (Vercel)

- [ ] Projet déployé avec succès
- [ ] Variables d'environnement configurées
- [ ] Application accessible
- [ ] Connexion au backend fonctionne
- [ ] Domaine personnalisé configuré (optionnel)

### Stripe

- [ ] Compte créé (mode test)
- [ ] Produits créés (Pro, Enterprise)
- [ ] Prix créés (mensuel, annuel)
- [ ] Webhook configuré
- [ ] Secret webhook copié dans Railway

### Tests

- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard s'affiche
- [ ] Plan gratuit affiché (10/jour)
- [ ] Paiement test fonctionne
- [ ] Plan Pro activé (1000/jour)
- [ ] Webhook Stripe fonctionne
- [ ] Quotas se décrementent

---

## 🔒 SSL/HTTPS

✅ **Railway et Vercel gèrent automatiquement les certificats SSL**
- Pas besoin de configuration manuelle
- HTTPS activé automatiquement
- Certificats renouvelés automatiquement
- Redirection HTTP → HTTPS automatique

---

## 🚀 PROCHAINES ÉTAPES

1. **Tester le backend** avec les endpoints
2. **Déployer le frontend** sur Vercel
3. **Tester le flow complet** (inscription → paiement)
4. **Acheter un nom de domaine** (optionnel)
5. **Configurer les domaines personnalisés**
6. **Passer en mode production Stripe**
7. **Lancer !** 🎉

---

## 💬 Besoin d'aide ?

- **Backend ne répond pas ?** → Vérifier les logs Railway
- **Frontend ne se connecte pas ?** → Vérifier `REACT_APP_API_URL`
- **Paiement ne fonctionne pas ?** → Vérifier webhook Stripe
- **Domaine ne fonctionne pas ?** → Attendre propagation DNS (30 min)

---

**Bon lancement ! 🎉**



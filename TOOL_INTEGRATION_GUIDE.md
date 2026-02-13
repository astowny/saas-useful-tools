# 🛠️ Guide d'intégration des outils

Ce guide explique comment adapter vos outils HTML existants pour les intégrer au système SaaS.

## 📋 Template de base

Voici le code à ajouter à chaque outil HTML :

### 1. HTML - Bannières et UI

```html
<!-- Bannière d'authentification -->
<div id="auth-banner" class="hidden bg-yellow-600 text-white px-4 py-3 text-center">
    <p>⚠️ Vous devez être connecté pour utiliser cet outil. 
       <a href="/login" class="underline font-semibold">Se connecter</a>
    </p>
</div>

<!-- Bannière de quota -->
<div id="quota-warning" class="hidden bg-red-600 text-white px-4 py-3 text-center">
    <p id="quota-message"></p>
</div>

<!-- Informations utilisateur -->
<div id="user-info" class="hidden mb-4 flex justify-between items-center bg-slate-800 rounded-lg p-3">
    <span id="user-email" class="text-sm text-gray-300"></span>
    <span id="quota-display" class="text-xs bg-blue-600 px-3 py-1 rounded-full"></span>
</div>

<!-- Contenu de l'outil (caché par défaut) -->
<div id="tool-content" class="hidden">
    <!-- Votre outil ici -->
</div>

<!-- Loader -->
<div id="loading" class="text-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    <p class="mt-4 text-gray-400">Vérification...</p>
</div>
```

### 2. JavaScript - Configuration

```javascript
// Configuration (à adapter pour chaque outil)
const API_URL = 'http://localhost:3001'; // URL de votre API
const TOOL_NAME = 'nom-de-votre-outil'; // Ex: 'qr-generator'
const TOOL_CATEGORY = 'categorie'; // Ex: 'utilities', 'design', 'productivity'

let token = localStorage.getItem('token');
let userQuota = null;
```

### 3. JavaScript - Vérification au chargement

```javascript
window.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        showAuthBanner();
        return;
    }

    try {
        // Vérifier le token et récupérer les quotas
        const [userRes, quotaRes] = await Promise.all([
            fetch(`${API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/api/usage/quota`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (!userRes.ok) {
            localStorage.removeItem('token');
            showAuthBanner();
            return;
        }

        const userData = await userRes.json();
        const quotaData = await quotaRes.json();
        
        userQuota = quotaData;
        showToolContent(userData.user, quotaData);
    } catch (error) {
        console.error('Auth error:', error);
        showAuthBanner();
    }
});
```

### 4. JavaScript - Fonctions d'affichage

```javascript
function showAuthBanner() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('auth-banner').classList.remove('hidden');
}

function showToolContent(user, quota) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('tool-content').classList.remove('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('user-email').textContent = user.email;
    
    const quotaText = quota.daily.unlimited 
        ? '∞ Illimité' 
        : `${quota.daily.remaining}/${quota.daily.limit} restantes aujourd'hui`;
    document.getElementById('quota-display').textContent = quotaText;

    // Vérifier si quota atteint
    if (!quota.daily.unlimited && quota.daily.remaining <= 0) {
        showQuotaWarning('Limite quotidienne atteinte. <a href="/pricing" class="underline">Passez au plan Pro</a>');
    }
}

function showQuotaWarning(message) {
    document.getElementById('quota-message').innerHTML = message;
    document.getElementById('quota-warning').classList.remove('hidden');
}
```

### 5. JavaScript - Tracking de l'usage

```javascript
// À appeler AVANT d'exécuter la fonctionnalité principale de l'outil
async function trackUsage() {
    try {
        const response = await fetch(`${API_URL}/api/tools/${TOOL_NAME}/use`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ category: TOOL_CATEGORY })
        });

        if (!response.ok) {
            const error = await response.json();
            
            // Gérer les erreurs de quota
            if (error.error.code === 'DAILY_LIMIT_EXCEEDED' || 
                error.error.code === 'MONTHLY_LIMIT_EXCEEDED') {
                showQuotaWarning(
                    error.error.message + 
                    ' <a href="/pricing" class="underline">Améliorer mon plan</a>'
                );
                return false; // Bloquer l'exécution
            }
            
            throw new Error(error.error.message);
        }

        // Mettre à jour le quota affiché
        const data = await response.json();
        if (data.quota) {
            const quotaText = data.quota.dailyLimit === -1 
                ? '∞ Illimité' 
                : `${data.quota.dailyLimit - data.quota.dailyUsed}/${data.quota.dailyLimit} restantes`;
            document.getElementById('quota-display').textContent = quotaText;
        }

        return true; // Autoriser l'exécution
    } catch (error) {
        alert('Erreur: ' + error.message);
        return false;
    }
}
```

### 6. JavaScript - Utilisation dans votre fonction principale

```javascript
// Exemple avec un générateur QR Code
async function generateQR() {
    const text = document.getElementById('input').value.trim();
    if (!text) {
        return alert('Veuillez entrer du texte');
    }

    // IMPORTANT : Tracker l'usage AVANT d'exécuter
    const canProceed = await trackUsage();
    if (!canProceed) {
        return; // Quota dépassé, on arrête
    }

    // Votre code existant ici
    // ... génération du QR code ...
}
```

---

## 🎯 Exemples par type d'outil

### Outil de conversion (JSON → CSV, etc.)

```javascript
async function convert() {
    const input = document.getElementById('input').value;
    if (!input) return alert('Veuillez entrer des données');

    // Tracker l'usage
    if (!await trackUsage()) return;

    // Votre logique de conversion
    const result = convertData(input);
    document.getElementById('output').value = result;
}
```

### Outil de génération (Palette de couleurs, etc.)

```javascript
async function generate() {
    // Tracker l'usage
    if (!await trackUsage()) return;

    // Votre logique de génération
    const colors = generatePalette();
    displayColors(colors);
}
```

### Outil avec téléchargement (Facture PDF, etc.)

```javascript
async function downloadPDF() {
    // Tracker l'usage
    if (!await trackUsage()) return;

    // Votre logique de génération PDF
    const pdf = generatePDF();
    pdf.download('facture.pdf');
}
```

---

## 🔄 Migration d'un outil existant

### Étape 1 : Sauvegarder l'original
```bash
cp tools/mon-outil.html tools/mon-outil-original.html
```

### Étape 2 : Ajouter les bannières HTML
Copier les bannières du template au début du `<body>`

### Étape 3 : Envelopper le contenu
```html
<div id="tool-content" class="hidden">
    <!-- Votre contenu existant ici -->
</div>
```

### Étape 4 : Ajouter le JavaScript d'auth
Copier le code de vérification au chargement

### Étape 5 : Modifier les fonctions principales
Ajouter `await trackUsage()` au début de chaque fonction qui utilise l'outil

### Étape 6 : Tester
1. Sans connexion → doit afficher la bannière d'auth
2. Avec connexion → doit afficher l'outil
3. Utiliser l'outil → doit décrémenter le quota
4. Atteindre la limite → doit bloquer et afficher le message

---

## 📊 Catégories d'outils

Utilisez ces catégories pour `TOOL_CATEGORY` :

- `utilities` - Utilitaires (QR code, Base64, etc.)
- `design` - Design (Palettes, Gradients, etc.)
- `productivity` - Productivité (Pomodoro, Kanban, etc.)
- `security` - Sécurité (Hash, JWT, etc.)
- `finance` - Finance (DCA, Impermanent Loss, etc.)

---

## ⚠️ Points d'attention

1. **Toujours tracker AVANT l'exécution**
   ```javascript
   // ❌ MAUVAIS
   generateQR();
   trackUsage();

   // ✅ BON
   if (await trackUsage()) {
       generateQR();
   }
   ```

2. **Gérer les erreurs de quota**
   ```javascript
   if (!await trackUsage()) {
       return; // Arrêter l'exécution
   }
   ```

3. **Mettre à jour le quota affiché**
   Le quota est automatiquement mis à jour après chaque utilisation

4. **Tester en mode déconnecté**
   Vérifier que la bannière d'auth s'affiche correctement

---

## 🚀 Checklist d'intégration

Pour chaque outil :

- [ ] Copier le template HTML (bannières)
- [ ] Ajouter la configuration JavaScript
- [ ] Implémenter la vérification au chargement
- [ ] Envelopper le contenu dans `#tool-content`
- [ ] Ajouter `trackUsage()` dans les fonctions principales
- [ ] Tester sans connexion
- [ ] Tester avec connexion
- [ ] Tester le dépassement de quota
- [ ] Vérifier l'affichage du quota
- [ ] Tester le téléchargement (si applicable)

---

**Besoin d'aide ?** Consultez l'exemple complet dans `frontend/public/tools/qr-generator-protected.html`


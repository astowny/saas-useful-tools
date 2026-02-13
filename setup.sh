#!/bin/bash

# Script d'installation automatique pour Useful Tools SaaS
# Usage: bash setup.sh

set -e

echo "🚀 Installation de Useful Tools SaaS"
echo "===================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier Node.js
echo "📦 Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Installez Node.js depuis https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version 16+ requis (version actuelle: $(node -v))${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Vérifier PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL n'est pas installé localement${NC}"
    echo "Vous pouvez utiliser un service cloud (Heroku, Supabase, etc.)"
else
    echo -e "${GREEN}✓ PostgreSQL installé${NC}"
fi

echo ""

# Installation Backend
echo "📦 Installation du backend..."
cd backend

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Fichier package.json non trouvé dans backend/${NC}"
    exit 1
fi

npm install
echo -e "${GREEN}✓ Dépendances backend installées${NC}"

# Configuration .env
if [ ! -f ".env" ]; then
    echo ""
    echo "🔧 Configuration de l'environnement backend..."
    cp .env.example .env
    
    echo -e "${YELLOW}⚠️  Veuillez éditer backend/.env avec vos valeurs :${NC}"
    echo "   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
    echo "   - JWT_SECRET (générer avec: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")"
    echo "   - STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY"
    echo "   - STRIPE_WEBHOOK_SECRET"
    echo ""
    read -p "Appuyez sur Entrée une fois la configuration terminée..."
fi

cd ..

# Installation Frontend
echo ""
echo "📦 Installation du frontend..."
cd frontend

if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  Pas de package.json dans frontend/, création d'un projet React...${NC}"
    npx create-react-app . --template minimal
fi

npm install
echo -e "${GREEN}✓ Dépendances frontend installées${NC}"

# Configuration .env frontend
if [ ! -f ".env" ]; then
    echo ""
    echo "🔧 Configuration de l'environnement frontend..."
    echo "REACT_APP_API_URL=http://localhost:3001" > .env
    echo "REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_..." >> .env
    
    echo -e "${YELLOW}⚠️  Veuillez éditer frontend/.env avec votre clé Stripe publique${NC}"
fi

cd ..

# Initialisation de la base de données
echo ""
echo "🗄️  Initialisation de la base de données..."
read -p "Voulez-vous initialiser la base de données maintenant ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    npm run init-db
    echo -e "${GREEN}✓ Base de données initialisée${NC}"
    cd ..
else
    echo -e "${YELLOW}⚠️  N'oubliez pas d'exécuter 'npm run init-db' dans backend/ plus tard${NC}"
fi

# Résumé
echo ""
echo "========================================="
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo "========================================="
echo ""
echo "📝 Prochaines étapes :"
echo ""
echo "1. Configurer Stripe :"
echo "   - Créer un compte sur https://stripe.com"
echo "   - Créer les produits et prix"
echo "   - Configurer le webhook"
echo "   - Ajouter les clés dans backend/.env"
echo ""
echo "2. Démarrer le backend :"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Démarrer le frontend (dans un autre terminal) :"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "4. Accéder à l'application :"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📚 Documentation complète : SAAS_DOCUMENTATION.md"
echo ""
echo -e "${GREEN}Bon développement ! 🚀${NC}"


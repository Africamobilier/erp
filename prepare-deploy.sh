#!/bin/bash

echo "🚀 Préparation au déploiement Vercel - Africa Mobilier ERP"
echo "================================================================"
echo ""

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé"
    echo "   Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

echo "✅ Dossier projet vérifié"
echo ""

# Vérifier Node.js
echo "📦 Vérification de Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js installé: $NODE_VERSION"
else
    echo "❌ Node.js non installé"
    echo "   Installez Node.js depuis https://nodejs.org"
    exit 1
fi

echo ""

# Vérifier npm
echo "📦 Vérification de npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm installé: $NPM_VERSION"
else
    echo "❌ npm non installé"
    exit 1
fi

echo ""

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo "✅ Dépendances installées"
else
    echo "✅ Dépendances déjà installées"
fi

echo ""

# Vérifier le fichier .env
echo "🔐 Vérification des variables d'environnement..."
if [ -f ".env" ]; then
    echo "✅ Fichier .env trouvé"
    
    # Vérifier que les variables sont configurées
    if grep -q "VITE_SUPABASE_URL=https://" .env && grep -q "VITE_SUPABASE_ANON_KEY=" .env; then
        echo "✅ Variables Supabase configurées"
    else
        echo "⚠️  Variables Supabase incomplètes dans .env"
        echo "   Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont configurées"
    fi
else
    echo "⚠️  Fichier .env non trouvé"
    echo "   Copiez .env.example vers .env et configurez vos credentials Supabase"
fi

echo ""

# Tester le build
echo "🔨 Test du build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
    echo "   Fichiers générés dans ./dist/"
else
    echo "❌ Erreur lors du build"
    echo "   Corrigez les erreurs avant de déployer"
    exit 1
fi

echo ""

# Vérifier Git
echo "📚 Vérification de Git..."
if command -v git &> /dev/null; then
    echo "✅ Git installé"
    
    if [ -d ".git" ]; then
        echo "✅ Repository Git initialisé"
        
        # Vérifier s'il y a des changements non commités
        if git diff-index --quiet HEAD --; then
            echo "✅ Aucun changement non commité"
        else
            echo "⚠️  Vous avez des changements non commités"
            echo "   Exécutez: git add . && git commit -m 'Votre message'"
        fi
        
        # Vérifier la remote
        if git remote -v | grep -q "origin"; then
            REMOTE_URL=$(git remote get-url origin)
            echo "✅ Remote configurée: $REMOTE_URL"
        else
            echo "⚠️  Aucune remote Git configurée"
            echo "   Configurez avec: git remote add origin https://github.com/VOTRE_USERNAME/africa-mobilier-erp.git"
        fi
    else
        echo "⚠️  Git non initialisé"
        echo "   Exécutez: git init"
    fi
else
    echo "❌ Git non installé"
    echo "   Installez Git depuis https://git-scm.com"
fi

echo ""
echo "================================================================"
echo "📋 Résumé"
echo "================================================================"
echo ""

# Afficher le résumé
echo "✅ Prérequis vérifiés"
echo "✅ Build fonctionnel"
echo ""
echo "🎯 Prochaines étapes:"
echo ""
echo "1. Créer un repository sur GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Lier votre projet à GitHub:"
echo "   git remote add origin https://github.com/VOTRE_USERNAME/africa-mobilier-erp.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Déployer sur Vercel:"
echo "   - Aller sur https://vercel.com"
echo "   - Sign up with GitHub"
echo "   - Import africa-mobilier-erp"
echo "   - Configurer les variables d'environnement"
echo "   - Deploy !"
echo ""
echo "📖 Guide complet: DEPLOIEMENT-VERCEL.md"
echo ""
echo "🚀 Bon déploiement !"
echo ""

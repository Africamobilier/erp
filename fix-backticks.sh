#!/bin/bash

# Script de correction rapide pour les backticks échappés
# Exécutez ce script si vous rencontrez des erreurs de type "Expecting Unicode escape sequence"

echo "🔧 Correction des backticks échappés dans Africa Mobilier ERP..."

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis la racine du projet (dossier contenant package.json)"
    exit 1
fi

# Fonction pour corriger un fichier
fix_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo "  Correction de $file..."
        # Remplacer \` par `
        sed -i.bak "s/\\\\\`/\`/g" "$file"
        # Remplacer \$ par $
        sed -i.bak 's/\\$/$/g' "$file"
        # Supprimer le fichier de backup
        rm -f "${file}.bak"
    fi
}

# Corriger tous les fichiers .tsx dans src/pages
echo "📁 Correction des fichiers dans src/pages/..."
for file in src/pages/*.tsx; do
    if [ -f "$file" ]; then
        fix_file "$file"
    fi
done

# Corriger les autres fichiers si nécessaire
echo "📁 Correction des autres fichiers..."
for file in src/components/*.tsx src/*.tsx; do
    if [ -f "$file" ]; then
        fix_file "$file"
    fi
done

echo ""
echo "✅ Correction terminée !"
echo ""
echo "🚀 Vous pouvez maintenant lancer:"
echo "   npm run dev"
echo ""

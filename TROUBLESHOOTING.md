# 🔧 Guide de Dépannage - Africa Mobilier ERP

## Erreurs Courantes et Solutions

### ❌ Erreur: "Expecting Unicode escape sequence \uXXXX"

**Symptôme:**
```
[plugin:vite:react-babel] /path/to/file.tsx: Expecting Unicode escape sequence \uXXXX
```

**Cause:** Problème d'échappement des backticks dans les template literals JSX.

**Solution Rapide:**
```bash
chmod +x fix-backticks.sh
./fix-backticks.sh
```

**Solution Manuelle:**
Si le script ne fonctionne pas, éditez manuellement le fichier mentionné dans l'erreur et remplacez:
- `\`` par `` ` `` (backtick simple)
- `\${` par `${`

---

### ❌ Erreur: "Failed to fetch" ou problème Supabase

**Symptôme:**
L'application se lance mais ne charge pas les données.

**Solutions:**

1. **Vérifier le fichier `.env`:**
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

2. **Vérifier que l'URL commence par `https://`**

3. **Désactiver RLS dans Supabase (pour tester):**
```sql
-- Dans Supabase SQL Editor
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE produits DISABLE ROW LEVEL SECURITY;
ALTER TABLE devis DISABLE ROW LEVEL SECURITY;
ALTER TABLE commandes DISABLE ROW LEVEL SECURITY;
ALTER TABLE factures DISABLE ROW LEVEL SECURITY;
ALTER TABLE bons_livraison DISABLE ROW LEVEL SECURITY;
```

4. **Vérifier que le script SQL a bien été exécuté:**
   - Ouvrir Supabase > Table Editor
   - Vérifier que les tables existent

---

### ❌ Erreur: "Cannot find module" ou dépendances manquantes

**Solution:**
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ Le logo ne s'affiche pas

**Solutions:**

1. **Vérifier que le fichier existe:**
```bash
ls -la public/africa-mobilier-logo.png
```

2. **Vider le cache du navigateur:**
- Chrome/Edge: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5` ou `Cmd + Shift + R`

3. **Redémarrer le serveur Vite:**
```bash
# Arrêter (Ctrl+C) puis relancer
npm run dev
```

---

### ❌ Synchronisation WooCommerce échoue

**Problèmes possibles:**

1. **Site non HTTPS:**
   - WooCommerce API nécessite SSL
   - Vérifier que l'URL commence par `https://`

2. **Clés API incorrectes:**
   - Recréer les clés dans WordPress
   - WooCommerce > Paramètres > Avancé > API REST
   - Permissions: **Lecture/Écriture**

3. **CORS bloqué:**
   - Si problème de CORS, ajouter dans `wp-config.php`:
   ```php
   header('Access-Control-Allow-Origin: *');
   header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
   ```

4. **Firewall:**
   - Vérifier que le firewall autorise les connexions
   - Tester l'URL dans le navigateur

---

### ❌ Les graphiques sont vides

**Cause:** Pas de données dans les factures.

**Solution:**
1. Créer un devis de test
2. Le convertir en commande
3. Créer un BL
4. Créer une facture
5. Les graphiques se rempliront automatiquement

---

### ❌ Erreur au build: "TypeScript error"

**Solution:**
```bash
# Ignorer temporairement les erreurs TypeScript
npm run build -- --mode production --skipLibCheck
```

Ou éditer `tsconfig.json`:
```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noEmit": false
  }
}
```

---

### ❌ Port 3000 déjà utilisé

**Solution:**
```bash
# Utiliser un autre port
npm run dev -- --port 3001
```

Ou modifier `vite.config.ts`:
```ts
export default defineConfig({
  server: {
    port: 3001, // Changer ici
  },
})
```

---

## 🔍 Diagnostic Général

### Étape 1: Vérifier l'environnement

```bash
# Versions Node.js et npm
node --version  # Doit être >= 18
npm --version

# Vérifier que les dépendances sont installées
ls node_modules | wc -l  # Doit afficher > 100
```

### Étape 2: Vérifier Supabase

1. Ouvrir https://supabase.com
2. Aller dans votre projet
3. Table Editor > Vérifier que les tables existent
4. Settings > API > Copier les credentials

### Étape 3: Logs détaillés

```bash
# Lancer avec logs complets
npm run dev 2>&1 | tee debug.log
```

### Étape 4: Test de connexion Supabase

Créer un fichier `test-supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'VOTRE_URL',
  'VOTRE_KEY'
);

const test = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('count');
  
  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Connexion OK:', data);
  }
};

test();
```

Exécuter:
```bash
node test-supabase.js
```

---

## 📞 Support

Si le problème persiste:

1. **Vérifier la console du navigateur** (F12)
2. **Vérifier les logs du terminal**
3. **Lire les messages d'erreur complets**

### Informations à fournir pour obtenir de l'aide:

- Version de Node.js: `node --version`
- Système d'exploitation
- Message d'erreur complet
- Fichier concerné (nom et ligne)
- Captures d'écran

---

## ✅ Checklist de Vérification

Avant de demander de l'aide, vérifiez:

- [ ] Node.js >= 18 installé
- [ ] `npm install` exécuté sans erreur
- [ ] Fichier `.env` créé et configuré
- [ ] Script SQL exécuté dans Supabase
- [ ] Tables visibles dans Supabase Table Editor
- [ ] RLS désactivé (pour tester)
- [ ] Cache navigateur vidé
- [ ] Serveur redémarré

---

## 🚀 Réinstallation Complète (Solution de Dernier Recours)

```bash
# 1. Sauvegarder votre .env
cp .env .env.backup

# 2. Nettoyer complètement
rm -rf node_modules package-lock.json dist .vite

# 3. Réinstaller
npm install

# 4. Restaurer .env
cp .env.backup .env

# 5. Exécuter le script de correction
./fix-backticks.sh

# 6. Relancer
npm run dev
```

---

*Dernière mise à jour: Janvier 2026*
*Africa Mobilier ERP v1.0.0*

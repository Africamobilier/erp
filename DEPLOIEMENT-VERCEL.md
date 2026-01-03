# 🚀 Guide de Déploiement Vercel - Africa Mobilier ERP

## 📋 Prérequis

- ✅ Compte GitHub (gratuit)
- ✅ Compte Vercel (gratuit)
- ✅ Projet Supabase configuré
- ✅ Code source de l'ERP

---

## 🎯 Étape 1 : Préparer le Projet pour Git

### 1.1 Initialiser Git (sur votre ordinateur)

```bash
cd africa-mobilier-erp

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Africa Mobilier ERP"
```

### 1.2 Créer un Repository GitHub

1. Aller sur https://github.com
2. Cliquer sur **"New repository"**
3. Nom : `africa-mobilier-erp`
4. Visibilité : **Private** (recommandé)
5. **NE PAS** initialiser avec README
6. Cliquer sur **"Create repository"**

### 1.3 Lier votre Projet à GitHub

```bash
# Remplacer VOTRE_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE_USERNAME/africa-mobilier-erp.git

# Pousser le code
git branch -M main
git push -u origin main
```

---

## 🚀 Étape 2 : Déployer sur Vercel

### 2.1 Créer un Compte Vercel

1. Aller sur https://vercel.com
2. Cliquer sur **"Sign Up"**
3. Choisir **"Continue with GitHub"**
4. Autoriser Vercel à accéder à GitHub

### 2.2 Importer le Projet

1. Sur Vercel Dashboard, cliquer sur **"Add New..."** > **"Project"**
2. Sélectionner **"Import Git Repository"**
3. Chercher `africa-mobilier-erp`
4. Cliquer sur **"Import"**

### 2.3 Configurer le Projet

**Framework Preset:** Vite  
**Root Directory:** `./`  
**Build Command:** `npm run build`  
**Output Directory:** `dist`

### 2.4 Variables d'Environnement

Cliquer sur **"Environment Variables"** et ajouter :

```
VITE_SUPABASE_URL
Valeur: https://votre-projet.supabase.co

VITE_SUPABASE_ANON_KEY
Valeur: votre_anon_key_ici
```

**⚠️ IMPORTANT:** Obtenir ces valeurs depuis :
- Supabase > Settings > API
- URL = Project URL
- anon key = anon public

### 2.5 Déployer

Cliquer sur **"Deploy"**

⏳ Attendre 2-3 minutes...

✅ **Votre ERP est en ligne !**

---

## 🌐 Accéder à votre ERP

Vercel vous donnera une URL comme :
```
https://africa-mobilier-erp.vercel.app
```

Ou vous pouvez configurer un domaine personnalisé :
```
https://erp.africamobilier.com
```

---

## 🔧 Étape 3 : Configuration Post-Déploiement

### 3.1 Tester la Connexion

1. Ouvrir votre URL Vercel
2. Vous devriez voir la page de login
3. Se connecter avec `admin@africamobilier.com`

### 3.2 Configurer le Domaine Personnalisé (Optionnel)

Dans Vercel :
1. Aller dans **Settings** > **Domains**
2. Ajouter votre domaine : `erp.africamobilier.com`
3. Suivre les instructions DNS

**Chez votre hébergeur (OVH, etc.) :**
```
Type: CNAME
Nom: erp
Valeur: cname.vercel-dns.com
```

### 3.3 Activer HTTPS

✅ Automatique avec Vercel !

---

## 🔄 Étape 4 : Mises à Jour

### Pour Déployer une Mise à Jour

```bash
# Modifier votre code
# ...

# Commit les changements
git add .
git commit -m "Description des changements"

# Pousser vers GitHub
git push

# ✅ Vercel redéploie AUTOMATIQUEMENT !
```

---

## 📊 Monitoring

### Dashboard Vercel

- Analytics : Nombre de visiteurs
- Deployments : Historique des déploiements
- Logs : Erreurs et logs en temps réel

### Performance

Vercel optimise automatiquement :
- ✅ CDN mondial (rapide partout)
- ✅ Compression Gzip/Brotli
- ✅ Cache intelligent
- ✅ SSL/HTTPS

---

## 🛡️ Sécurité

### Variables d'Environnement Sécurisées

✅ Les clés Supabase sont **cachées** dans Vercel  
✅ Jamais dans le code source  
✅ Jamais dans Git

### Protection Supabase

Vérifier dans Supabase :
1. **Authentication** > **URL Configuration**
2. Ajouter votre domaine Vercel :
   ```
   https://africa-mobilier-erp.vercel.app
   ```

### Row Level Security (RLS)

Assurez-vous que RLS est configuré sur Supabase pour protéger les données.

---

## 💰 Coûts

### Plan Gratuit Vercel

- ✅ Bande passante : 100 GB/mois
- ✅ Builds : Illimités
- ✅ Domaines : Illimités
- ✅ SSL : Gratuit
- ✅ Analytics : Basiques

**Parfait pour démarrer !**

### Si Dépassement (peu probable)

Plan Pro : $20/mois
- Bande passante : 1 TB/mois
- Analytics avancées
- Support prioritaire

---

## 🔥 Optimisations

### 1. Activer la Compression

Dans `vite.config.ts` :

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

### 2. Optimiser les Images

Placer le logo dans `/public/` :
```
/public/africa-mobilier-logo.png
```

### 3. Cache Navigateur

Vercel configure automatiquement le cache optimal.

---

## 🐛 Dépannage

### Erreur : "Build Failed"

**Vérifier :**
1. `package.json` a bien `"build": "vite build"`
2. Toutes les dépendances sont dans `package.json`
3. Pas d'erreurs TypeScript

**Solution :**
```bash
# Localement, vérifier que le build fonctionne
npm run build

# Si erreur, corriger puis recommit
git add .
git commit -m "Fix build"
git push
```

### Erreur : "Cannot connect to Supabase"

**Vérifier :**
1. Variables d'environnement dans Vercel
2. URL Supabase correcte (avec https://)
3. Anon key correcte

**Solution :**
- Vercel Dashboard > Settings > Environment Variables
- Modifier et redéployer

### Page Blanche

**Vérifier :**
1. Console navigateur (F12)
2. Logs Vercel

**Solution courante :**
```bash
# Vérifier que le build produit des fichiers
npm run build
ls dist/

# Doit contenir index.html et assets/
```

---

## 📱 Responsive & Mobile

Vercel sert automatiquement :
- ✅ Version mobile optimisée
- ✅ Progressive Web App (PWA)
- ✅ Rapide sur 3G/4G

---

## 🔗 Liens Utiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Documentation Vercel:** https://vercel.com/docs
- **Support Vercel:** https://vercel.com/support
- **Supabase Dashboard:** https://app.supabase.com

---

## ✅ Checklist de Déploiement

Avant de déployer :

- [ ] Code committé dans Git
- [ ] Repository GitHub créé
- [ ] Variables d'environnement notées
- [ ] Supabase configuré et accessible
- [ ] Script SQL exécuté
- [ ] Au moins un utilisateur admin créé

Après déploiement :

- [ ] URL Vercel fonctionne
- [ ] Login fonctionne
- [ ] Dashboard s'affiche
- [ ] Pas d'erreurs console
- [ ] Images/logo s'affichent
- [ ] Domaine personnalisé configuré (optionnel)

---

## 🎉 Félicitations !

Votre ERP Africa Mobilier est maintenant :
- ✅ En ligne 24/7
- ✅ Rapide (CDN mondial)
- ✅ Sécurisé (HTTPS)
- ✅ Évolutif (scaling auto)
- ✅ Gratuit (plan Hobby)

---

## 📞 Support

**Questions ?**
- Vercel Discord : https://vercel.com/discord
- Documentation : Ce guide

**Besoin d'aide ?**
Consultez les logs dans Vercel Dashboard > Deployments > [dernier déploiement] > Logs

---

*Guide créé pour Africa Mobilier ERP*  
*Excellence marocaine, Vision africaine* ❤️

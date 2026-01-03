# 📘 Guide d'Installation - Africa Mobilier ERP

## 🎯 Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Node.js** version 18 ou supérieure ([télécharger](https://nodejs.org/))
- **npm** ou **yarn**
- Un compte **Supabase** (gratuit sur [supabase.com](https://supabase.com))
- (Optionnel) Un site **WooCommerce** pour la synchronisation

## 📋 Étape 1 : Configuration de Supabase

### 1.1 Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte ou se connecter
3. Créer un nouveau projet :
   - Nom: `africa-mobilier-erp`
   - Région: Choisir la plus proche (Europe Central recommandé)
   - Mot de passe de base de données : **BIEN NOTER CE MOT DE PASSE**

### 1.2 Exécuter le script SQL

1. Dans le projet Supabase, aller dans **SQL Editor**
2. Cliquer sur **New Query**
3. Copier tout le contenu du fichier `supabase-setup.sql`
4. Coller dans l'éditeur
5. Cliquer sur **Run** (en bas à droite)
6. Attendre que tous les messages de succès s'affichent (✅)

### 1.3 Récupérer les credentials

1. Aller dans **Settings > API**
2. Noter les informations suivantes :
   - **Project URL** (commence par https://xxx.supabase.co)
   - **anon public** key (clé publique)

### 1.4 Configurer les politiques RLS (Row Level Security)

Pour l'instant, désactiver RLS pour tester :

```sql
-- Dans SQL Editor, exécuter :
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE produits DISABLE ROW LEVEL SECURITY;
ALTER TABLE devis DISABLE ROW LEVEL SECURITY;
ALTER TABLE commandes DISABLE ROW LEVEL SECURITY;
ALTER TABLE factures DISABLE ROW LEVEL SECURITY;
ALTER TABLE bons_livraison DISABLE ROW LEVEL SECURITY;
ALTER TABLE paiements DISABLE ROW LEVEL SECURITY;
```

⚠️ **IMPORTANT** : En production, il faut réactiver RLS et configurer les politiques appropriées !

## 📦 Étape 2 : Installation de l'Application

### 2.1 Installer les dépendances

```bash
cd africa-mobilier-erp
npm install
```

Cela devrait installer toutes les dépendances nécessaires (~2-3 minutes).

### 2.2 Configuration de l'environnement

1. Créer le fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

2. Éditer le fichier `.env` et remplacer par vos credentials Supabase :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_ici
```

### 2.3 Tester l'installation

Lancer le serveur de développement :

```bash
npm run dev
```

L'application devrait s'ouvrir sur **http://localhost:3000**

Vous devriez voir :
- Le logo Africa Mobilier
- Le tableau de bord
- Le menu de navigation à gauche

## 🛒 Étape 3 : Configuration WooCommerce (Optionnel)

Si vous avez un site WooCommerce et souhaitez synchroniser les données :

### 3.1 Prérequis WooCommerce

- WordPress avec WooCommerce installé
- Site en HTTPS (certificat SSL)
- Version WooCommerce 3.0+

### 3.2 Créer les clés API WooCommerce

1. Dans WordPress, aller dans **WooCommerce > Paramètres**
2. Onglet **Avancé** > **API REST**
3. Cliquer sur **Ajouter une clé**
4. Configuration :
   - Description: `Africa Mobilier ERP`
   - Utilisateur: Sélectionner un administrateur
   - Permissions: **Lecture/Écriture**
5. Cliquer sur **Générer la clé API**
6. **IMPORTANT** : Copier immédiatement :
   - Consumer Key (commence par `ck_`)
   - Consumer Secret (commence par `cs_`)
   ⚠️ Le secret ne sera plus visible après !

### 3.3 Configurer dans l'ERP

1. Dans l'ERP, aller dans **Paramètres > WooCommerce**
2. Entrer :
   - URL du site : `https://votre-site.com`
   - Consumer Key
   - Consumer Secret
3. Cliquer sur **Tester la connexion**
4. Si succès ✅, cliquer sur **Synchroniser**

## 🚀 Étape 4 : Premier Démarrage

### 4.1 Vérifier les données de test

Si le script SQL s'est bien exécuté, vous devriez avoir :
- 4 produits de test
- 1 client de test

### 4.2 Créer votre premier prospect

1. Aller dans **Prospects & Clients**
2. Cliquer sur **Nouveau**
3. Remplir les informations :
   - Type: Prospect
   - Raison sociale: Nom de l'entreprise
   - Contact, email, téléphone
4. Cliquer sur **Créer**

### 4.3 Créer votre premier devis

1. Aller dans **Devis**
2. Cliquer sur **Nouveau**
3. Sélectionner le client
4. Ajouter des produits
5. Générer le devis

## 🐛 Dépannage

### Erreur "Failed to fetch"

**Problème** : L'application ne peut pas se connecter à Supabase

**Solutions** :
1. Vérifier que l'URL Supabase est correcte dans `.env`
2. Vérifier que la clé ANON est correcte
3. Vérifier que RLS est désactivé (voir étape 1.4)
4. Redémarrer le serveur : `Ctrl+C` puis `npm run dev`

### Les graphiques sont vides

**Problème** : Pas de données à afficher

**Solution** : Créer quelques factures de test :
1. Créer un devis
2. Le convertir en commande
3. Créer un BL
4. Créer une facture

### Erreur "Cannot find module"

**Problème** : Dépendances manquantes

**Solution** :
```bash
rm -rf node_modules package-lock.json
npm install
```

### Le logo ne s'affiche pas

**Problème** : Logo non trouvé

**Solution** :
1. Vérifier que le fichier existe : `public/africa-mobilier-logo.png`
2. Vider le cache du navigateur (Ctrl+F5)

### Synchronisation WooCommerce échoue

**Problèmes possibles** :

1. **Site non HTTPS**
   - WooCommerce API nécessite SSL
   - Installer un certificat SSL

2. **Clés API incorrectes**
   - Recréer les clés dans WooCommerce
   - Vérifier qu'il n'y a pas d'espace avant/après

3. **Permissions insuffisantes**
   - Les clés doivent avoir "Lecture/Écriture"

4. **CORS**
   - Si problème CORS, activer dans WordPress :
   ```php
   // Dans wp-config.php
   header('Access-Control-Allow-Origin: *');
   ```

## 📊 Utilisation Quotidienne

### Workflow recommandé

**Matin** :
1. Consulter le tableau de bord
2. Vérifier les impayés
3. Relancer les prospects

**Prospection** :
1. Ajouter les nouveaux prospects
2. Créer des devis
3. Envoyer les devis

**Production** :
1. Convertir devis acceptés en commandes
2. Suivre la production
3. Préparer les livraisons

**Facturation** :
1. Créer les factures
2. Enregistrer les paiements
3. Relancer les impayés

### Raccourcis clavier

- `Ctrl + N` : Nouveau (dans chaque page)
- `Ctrl + S` : Sauvegarder
- `Échap` : Fermer les modales

## 🔧 Configuration Avancée

### Changer les couleurs de la charte graphique

Éditer `tailwind.config.js` :

```js
colors: {
  primary: {
    500: '#f97316', // Orange par défaut
    600: '#ea580c',
    700: '#c2410c',
  },
}
```

### Personnaliser la TVA

Éditer `/src/lib/supabase.ts` :

```ts
export const calculerTVA = (montantHT: number, tauxTVA: number = 20)
```

Changer `20` par votre taux de TVA.

### Ajouter des champs personnalisés

Exemple pour ajouter un champ "Secteur d'activité" aux clients :

1. Dans Supabase SQL Editor :
```sql
ALTER TABLE clients ADD COLUMN secteur_activite VARCHAR(100);
```

2. Mettre à jour les types TypeScript (`src/types/index.ts`)
3. Ajouter le champ dans le formulaire

## 🎓 Formation

### Vidéos de formation (à venir)

- Introduction à l'ERP
- Gestion des prospects
- Cycle devis → facture
- Synchronisation WooCommerce

### Support

- Email : support@africamobilier.ma
- Documentation : [docs.africamobilier.ma](https://docs.africamobilier.ma)

## ✅ Checklist de Mise en Production

Avant de déployer en production :

- [ ] Configurer RLS sur Supabase
- [ ] Activer l'authentification utilisateurs
- [ ] Configurer les sauvegardes Supabase
- [ ] Tester toutes les fonctionnalités
- [ ] Préparer la formation des utilisateurs
- [ ] Configurer un nom de domaine
- [ ] Installer un certificat SSL
- [ ] Configurer les emails de notification

## 🚀 Déploiement

### Déploiement sur Vercel (Recommandé)

1. Créer un compte sur [vercel.com](https://vercel.com)
2. Connecter votre dépôt Git
3. Configurer les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Déployer

L'application sera disponible sur `https://votre-projet.vercel.app`

### Déploiement sur Netlify

1. Créer un compte sur [netlify.com](https://netlify.com)
2. Importer le projet
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Variables d'environnement : idem Vercel

---

**Développé avec ❤️ pour Africa Mobilier**

*Excellence marocaine, Vision africaine*

Pour toute question : contact@africamobilier.ma

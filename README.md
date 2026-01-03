# Africa Mobilier ERP

## 🎯 Description

ERP complet pour Africa Mobilier permettant de gérer l'ensemble du cycle commercial, de la prospection à la facturation, avec intégration WooCommerce.

**Slogan**: Excellence marocaine, Vision africaine

## ✨ Fonctionnalités

### 📊 Tableau de bord
- CA en temps réel (aujourd'hui, mois, année)
- Suivi des impayés
- Statistiques prospects/clients
- Graphiques d'évolution du CA
- Top 10 produits vendus
- Actions rapides

### 👥 Gestion Prospects & Clients
- Création et gestion des fiches clients
- Conversion prospect → client
- Import depuis WooCommerce
- Recherche et filtres avancés
- Informations complètes (ICE, RC, Patente)

### 📦 Gestion Produits
- Catalogue produits
- Stock et alertes
- Import/Sync WooCommerce
- Catégories
- Prix HT/TTC

### 📝 Cycle Commercial Complet
1. **Devis** → Création, envoi, validation
2. **Commande** → Conversion devis, suivi production
3. **Bon de livraison** → Préparation, expédition
4. **Facture** → Émission, paiements, relances

### 📈 Analytics & Reporting
- CA hebdomadaire, mensuel, annuel
- Produits best-sellers et moins vendus
- Taux de conversion prospects
- Suivi des encaissements

### 🔄 Intégration WooCommerce
- Synchronisation automatique des clients
- Import des produits
- Récupération des commandes WooCommerce
- Création automatique de devis

## 🏗️ Architecture Technique

### Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + API REST)
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: Zustand
- **Routing**: React Router v6
- **Notifications**: React Hot Toast

### Structure de la base de données

```
clients (prospects/clients)
├── produits
├── devis
│   └── lignes_devis
├── commandes
│   └── lignes_commande
├── bons_livraison
│   └── lignes_bl
├── factures
│   └── lignes_facture
└── paiements

woocommerce_config
sync_logs
```

### Vues Analytics
- `ca_hebdomadaire`
- `ca_mensuel`
- `ca_annuel`
- `produits_top_ventes`
- `produits_faibles_ventes`

## 🚀 Installation

### 1. Cloner le projet

```bash
cd africa-mobilier-erp
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

1. Créer un projet Supabase sur https://supabase.com
2. Exécuter le script SQL fourni dans le projet pour créer les tables
3. Récupérer l'URL et l'ANON KEY du projet

### 4. Configuration de l'environnement

```bash
cp .env.example .env
```

Éditer `.env` et remplir :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

## 📋 Configuration WooCommerce

### Prérequis
- Site WordPress avec WooCommerce installé
- Certificat SSL (HTTPS)

### Configuration

1. Dans WordPress, aller à **WooCommerce > Paramètres > Avancé > API REST**
2. Créer une nouvelle clé API
3. Permissions : Lecture/Écriture
4. Copier la Consumer Key et Consumer Secret

Dans l'ERP:
1. Aller dans **Paramètres > WooCommerce**
2. Entrer l'URL du site
3. Entrer la Consumer Key
4. Entrer la Consumer Secret
5. Tester la connexion
6. Lancer la synchronisation

## 📊 Utilisation

### Workflow type

1. **Ajout d'un prospect**
   - Prospects & Clients > Nouveau
   - Ou synchronisation WooCommerce

2. **Création d'un devis**
   - Devis > Nouveau
   - Sélectionner le client
   - Ajouter les produits
   - Générer le PDF

3. **Conversion en commande**
   - Devis > Convertir en commande
   - Suivi de la production

4. **Création du BL**
   - Commandes > Créer BL
   - Enregistrer la livraison

5. **Facturation**
   - BL > Créer facture
   - Envoi au client
   - Enregistrement des paiements

### Numérotation automatique
- Devis: `DEV-YY0001`
- Commandes: `CMD-YY0001`
- BL: `BL-YY0001`
- Factures: `FACT-YY0001`
- Clients: `CL-00001`

## 🎨 Personnalisation

### Logo
Remplacer `/public/africa-mobilier-logo.png` par votre logo

### Couleurs
Éditer `tailwind.config.js` :

```js
colors: {
  primary: { ... }, // Orange par défaut
  secondary: { ... },
}
```

### TVA
Par défaut : 20%
Modifier dans `/src/lib/supabase.ts`

## 🔐 Sécurité

### Row Level Security (RLS)
Les tables Supabase ont RLS activé. Configurer les policies selon vos besoins :

```sql
-- Exemple: Accès total pour utilisateurs authentifiés
CREATE POLICY "Allow all for authenticated users" 
ON clients FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
```

## 📱 Déploiement

### Build de production

```bash
npm run build
```

Les fichiers seront dans `/dist`

### Déploiement recommandé
- **Vercel** (recommandé)
- **Netlify**
- **Railway**
- Serveur VPS avec Nginx

## 🐛 Dépannage

### Erreur de connexion Supabase
- Vérifier les variables d'environnement
- Vérifier que l'URL commence par `https://`
- Vérifier que la clé ANON est correcte

### Import WooCommerce ne fonctionne pas
- Vérifier que le site est en HTTPS
- Vérifier les credentials WooCommerce
- Vérifier que l'API REST WooCommerce est activée

### Les graphiques ne s'affichent pas
- Vérifier qu'il y a des données dans les factures
- Vérifier la console pour les erreurs

## 📝 Prochaines fonctionnalités

- [ ] Module de production (suivi atelier)
- [ ] Gestion des stocks avancée
- [ ] Application mobile (React Native)
- [ ] Multi-utilisateurs avec rôles
- [ ] Statistiques avancées
- [ ] Export Excel/PDF des rapports
- [ ] Envoi automatique des devis/factures par email
- [ ] Intégration comptable
- [ ] Module RH

## 📞 Support

Pour toute question ou assistance:
- Email: contact@africamobilier.ma
- Site: www.africamobilier.ma

## 📄 Licence

Propriété de **Africa Mobilier** - Tous droits réservés

---

**Développé avec ❤️ pour Africa Mobilier**

*Excellence marocaine, Vision africaine*

# 🚀 Démarrage Rapide - Africa Mobilier ERP

## 📦 Ce que vous avez

Vous avez maintenant un **ERP complet et professionnel** pour Africa Mobilier avec :

✅ **Tableau de bord** avec statistiques en temps réel et graphiques  
✅ **Gestion Prospects & Clients** complète et fonctionnelle  
✅ **Base de données** complète avec 13 tables et vues analytics  
✅ **Intégration WooCommerce** prête à l'emploi  
✅ **Architecture moderne** : React + TypeScript + Supabase  
✅ **Logo Africa Mobilier** intégré  

## ⚡ Installation en 3 étapes

### 1️⃣ Supabase (5 minutes)

```bash
1. Créer un compte sur supabase.com
2. Créer un nouveau projet
3. SQL Editor > Coller le contenu de supabase-setup.sql
4. Run
5. Récupérer l'URL et la clé ANON
```

### 2️⃣ Configuration (2 minutes)

```bash
1. Extraire africa-mobilier-erp.tar.gz
2. cd africa-mobilier-erp
3. npm install
4. Créer .env avec vos credentials Supabase
```

### 3️⃣ Lancement (1 minute)

```bash
npm run dev
```

🎉 **C'est tout !** L'ERP est accessible sur http://localhost:3000

## 📁 Structure du Projet

```
africa-mobilier-erp/
├── src/
│   ├── components/        # Composants réutilisables
│   │   └── Layout.tsx    # Layout principal avec navigation
│   ├── pages/            # Pages de l'application
│   │   ├── Dashboard.tsx # ✅ Complet avec graphiques
│   │   └── Prospects.tsx # ✅ Complet CRUD clients
│   ├── lib/              # Utilitaires
│   │   ├── supabase.ts   # Client Supabase
│   │   └── woocommerce.ts # Service WooCommerce
│   ├── store/            # État global (Zustand)
│   ├── types/            # Types TypeScript
│   └── App.tsx           # Point d'entrée
├── public/
│   └── africa-mobilier-logo.png # Votre logo
├── supabase-setup.sql    # Script BDD complet
├── README.md             # Documentation complète
├── INSTALLATION.md       # Guide pas-à-pas
└── FEATURES.md           # Liste des fonctionnalités

```

## 🎯 Fonctionnalités Clés

### ✅ Déjà Fonctionnel

1. **Tableau de Bord**
   - CA en temps réel (jour/mois/année)
   - Graphique évolution CA 12 mois
   - Top 10 produits vendus
   - Statistiques prospects/clients
   - Impayés et alertes

2. **Gestion Clients**
   - CRUD complet (Create, Read, Update, Delete)
   - Recherche et filtres
   - Conversion prospect → client
   - Import WooCommerce
   - Codes auto (CL-00001)

3. **Base de Données**
   - 13 tables relationnelles
   - 5 vues analytics
   - 6 triggers automatiques
   - Numérotation automatique
   - Index pour performance

### 🚧 À Développer (squelettes prêts)

- Module Produits (interface UI)
- Module Devis (création/édition)
- Module Commandes (workflow)
- Module Factures (paiements)
- Module BL (livraisons)
- Génération PDF
- Envoi emails

## 🔧 Technologies Utilisées

| Technologie | Usage | Version |
|------------|-------|---------|
| **React** | Framework UI | 18.3 |
| **TypeScript** | Typage | 5.2 |
| **Vite** | Build tool | 5.1 |
| **Tailwind CSS** | Styling | 3.4 |
| **Supabase** | Backend/BDD | Latest |
| **Recharts** | Graphiques | 2.12 |
| **Zustand** | State management | 4.5 |
| **React Router** | Navigation | 6.22 |

## 📊 Base de Données

### Tables Principales

```sql
clients           # Prospects & Clients
├── devis         # Devis avec lignes
├── commandes     # Commandes avec lignes
├── bons_livraison # BL avec lignes
├── factures      # Factures avec lignes
└── paiements     # Historique paiements

produits          # Catalogue produits
woocommerce_config # Configuration sync
sync_logs         # Logs synchronisation
```

### Vues Analytics

```sql
ca_hebdomadaire       # CA par semaine
ca_mensuel            # CA par mois + impayés
ca_annuel             # CA par année
produits_top_ventes   # Best-sellers
produits_faibles_ventes # Moins vendus
```

## 🎨 Personnalisation

### Changer les couleurs

Éditer `tailwind.config.js` :

```js
primary: {
  500: '#f97316', // Orange Africa Mobilier
  600: '#ea580c',
}
```

### Changer le logo

Remplacer `public/africa-mobilier-logo.png`

### Modifier la TVA

Dans `src/lib/supabase.ts` :
```ts
calculerTVA(montantHT, 20) // Changer 20 par votre taux
```

## 🔄 WooCommerce

### Configuration

1. WordPress > WooCommerce > API REST
2. Créer une clé API (Lecture/Écriture)
3. Dans l'ERP : Paramètres > WooCommerce
4. Entrer URL, Consumer Key, Secret
5. Tester puis Synchroniser

### Ce qui est synchronisé

✅ Clients (nom, email, adresse, téléphone)  
✅ Produits (nom, prix, stock, images)  
✅ Commandes → Devis (avec lignes et montants)  

## 📈 Utilisation

### Workflow Type

```
1. Prospect arrive
   ↓
2. Créer fiche prospect
   ↓
3. Créer devis
   ↓
4. Envoyer devis
   ↓
5. Si accepté → Convertir en commande
   ↓
6. Production
   ↓
7. Créer BL
   ↓
8. Livraison
   ↓
9. Créer facture
   ↓
10. Encaisser paiement
    ↓
11. Prospect → Client
```

## 🐛 Résolution de Problèmes

### "Failed to fetch"
→ Vérifier credentials Supabase dans `.env`

### Graphiques vides
→ Créer des factures de test

### Sync WooCommerce échoue
→ Vérifier HTTPS et clés API

### Logo ne s'affiche pas
→ Vider cache navigateur (Ctrl+F5)

## 📞 Support

**Email** : contact@africamobilier.ma  
**Docs** : Voir README.md, INSTALLATION.md, FEATURES.md  

## 🚀 Prochaines Étapes Recommandées

### Semaine 1
1. ✅ Installer et tester l'ERP
2. ✅ Créer quelques prospects de test
3. ✅ Configurer WooCommerce (si applicable)
4. ✅ Personnaliser les couleurs/logo

### Semaine 2
1. Développer le module Produits
2. Ajouter votre catalogue
3. Créer des devis

### Semaine 3
1. Implémenter génération PDF
2. Configurer emails
3. Former les utilisateurs

### Mois 1
1. Déployer en production (Vercel)
2. Configurer authentification
3. Activer sauvegardes

## 💡 Conseils

✅ **Commencer petit** : Tester avec 10-20 clients  
✅ **Sauvegarder régulièrement** : Export Supabase  
✅ **Former les équipes** : Sessions de 30min  
✅ **Itérer** : Ajouter fonctionnalités progressivement  

## 📄 Licence

**Propriété de Africa Mobilier** - Tous droits réservés

---

## ✨ Fonctionnalités Bonus Incluses

🎁 **Numérotation automatique** : DEV-260001, CMD-260001...  
🎁 **Triggers SQL** : Codes auto-générés  
🎁 **Calculs automatiques** : HT/TVA/TTC  
🎁 **Recherche temps réel** : Filtres instantanés  
🎁 **Responsive design** : Mobile-friendly  
🎁 **Notifications toast** : Feedback utilisateur  
🎁 **État global** : Performance optimale  
🎁 **Types TypeScript** : Autocomplete IDE  

---

**Développé avec ❤️ pour Africa Mobilier**

*Excellence marocaine, Vision africaine*

🚀 **Prêt à révolutionner votre gestion commerciale !**

# 🔄 Synchronisation WooCommerce - Demandes de Devis

## 📋 Vue d'Ensemble

L'ERP Africa Mobilier peut importer automatiquement vos **demandes de devis** et **commandes en attente** depuis WooCommerce pour les convertir en devis dans l'ERP.

---

## 🎯 Ce qui est Synchronisé

### 1. **Clients** 👥
- Tous les clients WooCommerce
- Informations complètes (nom, email, téléphone, adresse)
- Création automatique dans l'ERP
- Source marquée comme "woocommerce"

### 2. **Produits** 📦
- Catalogue complet
- Prix (TTC converti en HT)
- Descriptions et images
- Stock disponible
- SKU → Code produit

### 3. **Demandes de Devis** 📝
Les commandes WooCommerce avec ces statuts sont importées comme **devis** :

| Statut WooCommerce | Statut Devis ERP | Description |
|-------------------|------------------|-------------|
| `pending` | Envoyé | Commande en attente de paiement |
| `quote-requested` | Envoyé | Demande de devis explicite |
| `on-hold` | Envoyé | Commande en attente |

**Ce qui est importé pour chaque devis :**
- Client (créé automatiquement si nécessaire)
- Date de la demande
- Lignes de produits avec quantités
- Prix HT/TVA/TTC
- Notes avec référence WooCommerce
- Date de validité (date commande + 30 jours)

---

## 🚀 Comment Utiliser

### Étape 1: Configuration WooCommerce

1. Dans l'ERP, aller dans **WooCommerce** > **Configuration**
2. Entrer vos credentials :
   - URL du site : `https://votre-site.com`
   - Consumer Key : `ck_...`
   - Consumer Secret : `cs_...`
3. Cliquer sur **Tester** pour vérifier la connexion

### Étape 2: Première Synchronisation

**Option 1 - Sync Complète** (Recommandé la première fois)
```
Cliquer sur "Sync Complète"
→ Importe TOUT : clients + produits + demandes de devis
```

**Option 2 - Sync Sélective**
```
1. Cliquer sur "Sync Clients"
2. Cliquer sur "Sync Produits"  
3. Cliquer sur "Sync Demandes de Devis"
```

### Étape 3: Vérification

1. Aller dans **Devis**
2. Vous verrez vos demandes WooCommerce avec :
   - Numéro de devis automatique (DEV-260001)
   - Client importé
   - Produits avec quantités
   - Note : "Importé depuis WooCommerce - Commande #XXX"

---

## 🔧 Configuration WooCommerce (Plugin)

### Pour les Demandes de Devis

Si vous utilisez un plugin de demandes de devis WooCommerce :

**Plugins compatibles :**
- YITH WooCommerce Request a Quote
- WooCommerce Quotes and Requests
- Request a Quote for WooCommerce

**Configuration du plugin :**
1. Configurer le statut de commande comme `quote-requested` ou `pending`
2. Les demandes seront automatiquement importées dans l'ERP

### Statuts Personnalisés

Si vous avez des statuts personnalisés, vous pouvez modifier le code :

**Fichier**: `src/lib/woocommerce.ts`

```typescript
// Ligne ~140 - Ajouter vos statuts personnalisés
const statuses = [
  'pending', 
  'quote-requested', 
  'on-hold',
  'votre-statut-personnalise'  // Ajouter ici
];
```

---

## 📊 Workflow Complet

```
1. CLIENT sur WooCommerce
   ↓
   Demande un devis (panier → request quote)
   
2. WOOCOMMERCE
   ↓
   Crée une commande avec statut "quote-requested"
   
3. SYNCHRONISATION ERP
   ↓
   Import automatique dans Africa Mobilier ERP
   
4. DEVIS dans ERP
   ↓
   Apparaît dans module Devis
   Statut: "Envoyé"
   
5. TRAITEMENT
   ↓
   Vous pouvez:
   - Modifier le devis
   - Ajuster les prix
   - Ajouter des notes
   - Accepter → Créer commande
   - Refuser
```

---

## 🎯 Avantages de la Synchronisation

### ✅ Automatisation
- Pas de double saisie
- Gain de temps considérable
- Moins d'erreurs

### ✅ Traçabilité
- Lien avec commande WooCommerce (ID)
- Historique complet
- Client créé automatiquement

### ✅ Flexibilité
- Modifier le devis après import
- Ajouter des produits
- Ajuster les prix
- Personnaliser les conditions

### ✅ Workflow Unifié
- Tout gérer depuis l'ERP
- Conversion facile devis → commande → facture
- Suivi complet du cycle de vente

---

## 🔄 Synchronisation Continue

### Fréquence Recommandée

**Pour les demandes de devis :**
- **Quotidien** : 1-2 fois par jour
- **Temps réel** : Possibilité d'automatiser avec webhook (futur)

### Éviter les Doublons

L'ERP vérifie automatiquement si un devis WooCommerce a déjà été importé :
```
✅ Déjà importé → Ignoré
✅ Nouveau → Importé comme devis
```

**Identification par** : `woocommerce_quote_id` dans la table `devis`

---

## 🛠️ Cas d'Usage

### Cas 1: Client Demande un Devis sur le Site

1. Client remplit formulaire de devis sur WooCommerce
2. WooCommerce crée commande `quote-requested`
3. Vous lancez sync dans l'ERP
4. Devis apparaît automatiquement
5. Vous ajustez si nécessaire
6. Vous acceptez → Crée commande
7. Production → Livraison → Facture

### Cas 2: Commande en Attente de Validation

1. Client passe commande mais hésite sur le paiement
2. Statut WooCommerce : `pending`
3. Sync ERP importe comme devis
4. Vous contactez le client
5. Validation → Conversion en commande

### Cas 3: Client Invité (Sans Compte)

1. Demande de devis sans création de compte
2. WooCommerce crée commande invité
3. Sync ERP :
   - Crée un client temporaire
   - Import le devis
   - Note : "Client invité WooCommerce"
4. Vous avez toutes les infos pour le rappel

---

## 📝 Champs Synchronisés

### Client
```
✅ Raison sociale (ou Nom + Prénom)
✅ Nom du contact
✅ Email
✅ Téléphone
✅ Adresse complète
✅ Ville
✅ Code postal
✅ Source: woocommerce
✅ Type: prospect
```

### Devis
```
✅ Client (référence)
✅ Date de la demande
✅ Date de validité (+30 jours)
✅ Statut: envoyé
✅ Montant HT/TVA/TTC
✅ Notes avec référence WC
✅ Conditions de paiement (si renseignées)
```

### Lignes de Devis
```
✅ Produit (référence si existe)
✅ Désignation
✅ Quantité
✅ Prix unitaire HT
✅ Montant HT/TVA/TTC
```

---

## ⚙️ Configuration Avancée

### Conversion TTC → HT

Par défaut, TVA = 20%

**Modifier le taux** : `src/lib/woocommerce.ts`
```typescript
// Ligne ~160
const montantHT = parseFloat(order.total) / 1.20; // 20% TVA

// Pour 10% de TVA :
const montantHT = parseFloat(order.total) / 1.10;

// Pour 0% de TVA :
const montantHT = parseFloat(order.total);
```

### Statut du Devis

Par défaut : `envoyé`

Vous pouvez personnaliser selon le statut WC :
```typescript
let statutDevis: 'brouillon' | 'envoyé' | 'accepté' = 'envoyé';

if (status === 'quote-requested') {
  statutDevis = 'brouillon'; // À traiter
} else if (status === 'pending') {
  statutDevis = 'envoyé'; // Déjà envoyé au client
}
```

---

## 🐛 Dépannage

### Problème 1: Aucune Demande Importée

**Vérifications :**
1. Statut des commandes WooCommerce
2. Permissions API (Lecture/Écriture requise)
3. Consulter les logs de sync

**Solution :**
```
→ WooCommerce > Commandes
→ Vérifier qu'il y a des commandes en "pending" ou "quote-requested"
```

### Problème 2: Client Non Créé

**Cause :** Problème avec `customer_id`

**Solution :**
- Un client temporaire est créé automatiquement
- Vérifier dans Prospects & Clients

### Problème 3: Produits Manquants

**Cause :** Produits pas encore synchronisés

**Solution :**
1. Lancer "Sync Produits" en premier
2. Puis "Sync Demandes de Devis"

### Problème 4: Doublons

**Cause :** Sync multiple du même devis

**Protection :**
- L'ERP vérifie automatiquement `woocommerce_quote_id`
- Les doublons sont ignorés

**Vérification :**
```sql
SELECT * FROM devis WHERE woocommerce_quote_id IS NOT NULL;
```

---

## 📈 Statistiques et Suivi

### Logs de Synchronisation

Consultez l'historique dans **WooCommerce** > **Historique des synchronisations**

**Informations disponibles :**
- Date et heure
- Type (customers/products/orders)
- Nombre d'éléments synchronisés
- Statut (succès/échec)
- Messages d'erreur éventuels

### Requêtes Utiles

**Voir les devis importés de WooCommerce :**
```sql
SELECT 
  numero_devis,
  client.raison_sociale,
  montant_ttc,
  woocommerce_quote_id
FROM devis
JOIN clients ON devis.client_id = clients.id
WHERE woocommerce_quote_id IS NOT NULL
ORDER BY date_devis DESC;
```

---

## 🚀 Bonnes Pratiques

### ✅ À Faire

1. **Synchroniser régulièrement** (quotidien recommandé)
2. **Vérifier les logs** après chaque sync
3. **Synchroniser les produits en premier** lors de la première config
4. **Tester la connexion** avant de synchroniser
5. **Maintenir WooCommerce à jour**

### ❌ À Éviter

1. Ne pas synchroniser plusieurs fois la même période (doublons détectés mais logs pollués)
2. Ne pas modifier les `woocommerce_id` manuellement
3. Ne pas supprimer un devis importé sans vérifier WooCommerce

---

## 🔮 Évolutions Futures

### En Développement
- [ ] Synchronisation bidirectionnelle (ERP → WooCommerce)
- [ ] Webhook temps réel
- [ ] Mise à jour automatique des prix
- [ ] Synchronisation des stocks
- [ ] Notifications par email

### Propositions
- Synchronisation des catégories
- Import des avis clients
- Export des factures vers WooCommerce
- Intégration avec autres plateformes (Shopify, PrestaShop)

---

## 📞 Support

**Questions ?**
- Consulter TROUBLESHOOTING.md
- Vérifier les logs de synchronisation
- Tester la connexion WooCommerce

**Contact :**
- Email: contact@africamobilier.ma

---

*Dernière mise à jour: Janvier 2026*
*Africa Mobilier ERP v1.0.0*
*Excellence marocaine, Vision africaine*

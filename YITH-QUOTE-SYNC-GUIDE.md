# 🔄 Synchronisation YITH Request a Quote - Guide

## ✅ Fonctionnalités Implémentées

Votre ERP synchronise maintenant **automatiquement** :

### 1. **Demandes de Devis** (YITH)
- Statut WooCommerce : `quote-requested`
- Importé comme : **Devis** avec statut "envoyé"
- Client créé automatiquement comme **Prospect**

### 2. **Commandes en Attente**
- Statut WooCommerce : `pending`, `on-hold`
- Importé comme : **Devis** avec statut "envoyé"
- Client créé automatiquement

### 3. **Variations de Produits**
- Si le client demande un produit variable (ex: Chaise Rouge L)
- Le bon produit avec le bon prix est lié automatiquement

---

## 🎯 Workflow Complet

### Sur le Site WooCommerce

1. **Client remplit le formulaire YITH** :
   - Nom : Jean Dupont
   - Email : jean@example.com
   - Produits : Chaise Bureau (Rouge, L) × 2

2. **YITH crée une "commande"** :
   - Statut : `quote-requested`
   - ID commande : #1234

---

### Dans l'ERP Maghreb Office

1. **Clic sur "Sync Demandes"** (ou "Sync Orders")

2. **L'ERP importe automatiquement** :

**Prospect Créé** :
```
Nom : Jean Dupont
Email : jean@example.com
Type : Prospect
Source : WooCommerce
```

**Devis Créé** :
```
Client : Jean Dupont
Statut : Envoyé
Date : Aujourd'hui
Validité : +30 jours
Notes : Importé depuis WooCommerce - Demande de devis #1234
```

**Lignes du Devis** :
```
Produit : Chaise Bureau - Couleur: Rouge, Taille: L
Quantité : 2
Prix HT : 1,500 MAD
Total HT : 3,000 MAD
Total TTC : 3,600 MAD
```

---

## 🔧 Corrections Appliquées

### 1. **Erreurs 406 Corrigées**
- `.single()` → `.maybeSingle()`
- Plus d'erreur si le client/devis n'existe pas déjà

### 2. **Prix HT Corrects**
- Avant : Division par 1.20 (❌ faux)
- Après : Prix direct de WooCommerce (✅ correct)
- TVA calculée : Prix HT × 1.20

### 3. **Support Variations**
- Cherche d'abord `variation_id`
- Puis `product_id` si pas de variation
- Lie le bon produit avec le bon prix

---

## 📊 Test

### 1. Faire une Demande de Devis sur le Site

1. Aller sur votre site WooCommerce
2. Ajouter un produit au panier
3. Cliquer "Request a Quote" (YITH)
4. Remplir le formulaire
5. Soumettre

### 2. Synchroniser dans l'ERP

1. **WooCommerce** > **Sync Demandes**
2. Vérifier le message : "X demandes synchronisées"

### 3. Vérifier les Résultats

**Prospects** :
- Nouveau prospect créé ✅
- Email et téléphone corrects ✅

**Devis** :
- Nouveau devis créé ✅
- Statut "Envoyé" ✅
- Montants corrects (HT et TTC) ✅
- Lignes avec bons produits ✅

---

## 🔍 Débogage

### Si Aucun Devis N'est Importé

**1. Vérifier le statut WooCommerce** :
```
WooCommerce > Commandes
Regarder le statut de votre demande
```

Statuts supportés :
- ✅ `quote-requested` (YITH)
- ✅ `pending`
- ✅ `on-hold`

**2. Vérifier dans la console (F12)** :

Cherchez des erreurs comme :
- 404 → URL API incorrecte
- 401 → Clés API invalides
- 406 → Corrigé normalement

**3. Vérifier les logs Supabase** :

```sql
SELECT * FROM woocommerce_sync_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 💡 Cas Particuliers

### Client Invité (sans compte WooCommerce)

Si `customer_id = 0` :
- ✅ Prospect créé quand même
- ✅ Note ajoutée : "Client invité WooCommerce"
- ✅ Toutes les infos de billing utilisées

### Produit Non Trouvé

Si un produit de la demande n'existe pas dans l'ERP :
- ⚠️ Ligne créée quand même
- ⚠️ `produit_id` = NULL
- ✅ Désignation conservée
- ✅ Prix conservé

→ Synchronisez d'abord les **Produits**, puis les **Demandes**

### Doublons

Si vous synchronisez 2 fois :
- ✅ Pas de duplication
- ✅ Devis déjà importé = ignoré
- ℹ️ Message console : "Devis WC #XXX déjà importé"

---

## 📋 Ordre de Synchronisation Recommandé

1. **Sync Produits** d'abord
   - Importe tous les produits et variations
   - Nécessaire pour lier correctement les lignes

2. **Sync Demandes** ensuite
   - Importe les prospects
   - Crée les devis
   - Lie les produits déjà importés

---

## 🎯 Résultat Final

Après synchronisation, vous avez :

✅ **Prospects automatiques** depuis WooCommerce
✅ **Devis prêts** à traiter
✅ **Prix corrects** (HT et TTC)
✅ **Variations gérées** (bonne couleur, bonne taille)
✅ **Pas de duplication**
✅ **Workflow complet** : Devis → Commande → BL → Facture

**Votre workflow commercial est 100% automatisé !** 🚀

---

## 🔄 Synchronisation Automatique (Future)

Pour automatiser, vous pourrez :
- Créer un webhook YITH → API ERP
- Synchronisation temps réel
- Notification email au commercial

*Guide créé pour Maghreb Office ERP*
*Excellence maghrébine, Vision africaine* ❤️

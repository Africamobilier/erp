# 🔄 Conversions de Documents - Guide d'Intégration

## 📋 Workflow Automatique

```
┌─────────┐      ┌──────────┐      ┌────────┐      ┌─────────┐
│  Devis  │  →   │ Commande │  →   │   BL   │  →   │ Facture │
└─────────┘      └──────────┘      └────────┘      └─────────┘
   accepté         confirmée          livré           émise
```

---

## ✅ 4 Fonctions de Conversion

J'ai créé le fichier **`src/lib/conversions.ts`** avec 4 fonctions :

1. **`convertirDevisEnCommande(devisId)`**
2. **`convertirCommandeEnBL(commandeId)`**
3. **`convertirBLEnFacture(blId)`**
4. **`convertirCommandeEnFacture(commandeId)`** (direct, sans BL)

---

## 🚀 Comment Intégrer

### 1. Dans Devis.tsx - Bouton "Convertir en Commande"

```tsx
import { convertirDevisEnCommande } from '@/lib/conversions';
import { ArrowRight, CheckCircle } from 'lucide-react';

// Dans le composant
const handleConvertirEnCommande = async (devisId: string) => {
  if (!confirm('Convertir ce devis en commande ?')) return;

  setLoading(true);
  const result = await convertirDevisEnCommande(devisId);
  
  if (result.success) {
    toast.success(`Commande ${result.commande.numero_commande} créée !`);
    // Recharger la liste ou rediriger
    loadDevis();
  } else {
    toast.error(result.error);
  }
  setLoading(false);
};

// Dans le tableau - Colonne Actions
{devis.statut === 'accepté' && (
  <button
    onClick={() => handleConvertirEnCommande(devis.id)}
    className="text-green-600 hover:text-green-900"
    title="Convertir en commande"
  >
    <ArrowRight className="w-5 h-5" />
  </button>
)}
```

---

### 2. Dans Commandes.tsx - Bouton "Créer BL"

```tsx
import { convertirCommandeEnBL } from '@/lib/conversions';
import { Truck } from 'lucide-react';

const handleCreerBL = async (commandeId: string) => {
  if (!confirm('Créer un bon de livraison pour cette commande ?')) return;

  setLoading(true);
  const result = await convertirCommandeEnBL(commandeId);
  
  if (result.success) {
    toast.success(`BL ${result.bl.numero_bl} créé !`);
    loadCommandes();
  } else {
    toast.error(result.error);
  }
  setLoading(false);
};

// Dans le tableau
{(commande.statut === 'confirmée' || commande.statut === 'en_production') && (
  <button
    onClick={() => handleCreerBL(commande.id)}
    className="text-blue-600 hover:text-blue-900"
    title="Créer bon de livraison"
  >
    <Truck className="w-5 h-5" />
  </button>
)}
```

---

### 3. Dans BonsLivraison.tsx - Bouton "Créer Facture"

```tsx
import { convertirBLEnFacture } from '@/lib/conversions';
import { FileText } from 'lucide-react';

const handleCreerFacture = async (blId: string) => {
  if (!confirm('Créer une facture pour ce bon de livraison ?')) return;

  setLoading(true);
  const result = await convertirBLEnFacture(blId);
  
  if (result.success) {
    toast.success(`Facture ${result.facture.numero_facture} créée !`);
    loadBL();
  } else {
    toast.error(result.error);
  }
  setLoading(false);
};

// Dans le tableau
{bl.statut === 'livré' && (
  <button
    onClick={() => handleCreerFacture(bl.id)}
    className="text-red-600 hover:text-red-900"
    title="Créer facture"
  >
    <FileText className="w-5 h-5" />
  </button>
)}
```

---

### 4. Dans Commandes.tsx - Bouton "Facturer Directement"

```tsx
import { convertirCommandeEnFacture } from '@/lib/conversions';
import { DollarSign } from 'lucide-react';

const handleFacturerDirect = async (commandeId: string) => {
  if (!confirm('Créer directement une facture (sans BL) ?')) return;

  setLoading(true);
  const result = await convertirCommandeEnFacture(commandeId);
  
  if (result.success) {
    toast.success(`Facture ${result.facture.numero_facture} créée !`);
    loadCommandes();
  } else {
    toast.error(result.error);
  }
  setLoading(false);
};

// Option alternative dans le menu
<button
  onClick={() => handleFacturerDirect(commande.id)}
  className="text-purple-600 hover:text-purple-900"
>
  <DollarSign className="w-5 h-5" />
</button>
```

---

## 🎨 Exemple Complet - Colonne Actions dans Devis.tsx

```tsx
{/* Actions */}
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <div className="flex items-center justify-end space-x-2">
    {/* Voir */}
    <button
      onClick={() => handleView(devis)}
      className="text-gray-600 hover:text-gray-900"
      title="Voir"
    >
      <Eye className="w-5 h-5" />
    </button>

    {/* Modifier */}
    {devis.statut === 'brouillon' && (
      <button
        onClick={() => handleEdit(devis)}
        className="text-blue-600 hover:text-blue-900"
        title="Modifier"
      >
        <Edit className="w-5 h-5" />
      </button>
    )}

    {/* Imprimer */}
    <button
      onClick={() => handlePrint(devis)}
      className="text-primary-600 hover:text-primary-900"
      title="Imprimer"
    >
      <Printer className="w-5 h-5" />
    </button>

    {/* Convertir en Commande */}
    {devis.statut === 'accepté' && (
      <button
        onClick={() => handleConvertirEnCommande(devis.id)}
        className="text-green-600 hover:text-green-900"
        title="Convertir en commande"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    )}

    {/* Supprimer */}
    {devis.statut === 'brouillon' && (
      <button
        onClick={() => handleDelete(devis.id)}
        className="text-red-600 hover:text-red-900"
        title="Supprimer"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    )}
  </div>
</td>
```

---

## 📊 Gestion des Statuts

### Devis
- `brouillon` → Peut être modifié/supprimé
- `envoyé` → En attente de réponse client
- `accepté` → ✅ **Peut être converti en commande**
- `refusé` → Archivé
- `converti` → A généré une commande

### Commande
- `en_attente` → Nouvelle commande
- `confirmée` → ✅ **Peut être convertie en BL**
- `en_production` → ✅ **Peut être convertie en BL**
- `en_livraison` → BL créé
- `livrée` → BL livré et facturé
- `annulée` → Annulée

### Bon de Livraison
- `en_attente` → BL créé, pas encore livré
- `livré` → ✅ **Peut être converti en facture**
- `facturé` → Facture créée

### Facture
- `brouillon` → En cours de création
- `émise` → Envoyée au client
- `payée` → Soldée
- `en_retard` → Échéance dépassée

---

## 🔧 Personnalisation

### Modifier les Délais

Dans `conversions.ts`, ligne 49 :
```typescript
date_livraison_prevue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
// 30 jours par défaut
// Modifier "30" pour changer le délai
```

### Modifier les Préfixes

Lignes 31-33, 93-95, etc. :
```typescript
const numeroCommande = `CMD-${String(lastNumber + 1).padStart(6, '0')}`;
// Format: CMD-000001
// Modifier "CMD-" pour changer le préfixe
```

### Conditions de Conversion

Ligne 24 :
```typescript
if (devis.statut !== 'accepté') {
  // Ajouter d'autres conditions si besoin
}
```

---

## 🎯 Workflow Complet Exemple

### Scénario : Vente d'un Salon

1. **Commercial crée un devis** → `DEV-000042`
   - Statut : `brouillon` → `envoyé`

2. **Client accepte** → Commercial change statut à `accepté`
   - Bouton "Convertir" apparaît
   - Clic → Commande `CMD-000123` créée automatiquement

3. **Production confirme** → Change statut à `confirmée`
   - Bouton "Créer BL" apparaît
   - Clic → BL `BL-000089` créé

4. **Livraison effectuée** → Livreur marque `livré`
   - Bouton "Facturer" apparaît
   - Clic → Facture `FACT-000156` créée

5. **Client paie** → Comptable marque facture `payée`
   - Workflow terminé ✅

---

## 🛡️ Sécurités Implémentées

- ✅ Vérification des statuts avant conversion
- ✅ Vérification que le document existe
- ✅ Transactions atomiques (tout ou rien)
- ✅ Mise à jour automatique des statuts
- ✅ Génération automatique des numéros
- ✅ Conservation des liens entre documents
- ✅ Copie des lignes et montants

---

## 📝 Base de Données

Les conversions créent automatiquement les liens :

```sql
-- Commande pointe vers Devis
commandes.devis_id → devis.id

-- BL pointe vers Commande
bons_livraison.commande_id → commandes.id

-- Facture pointe vers Commande ET BL
factures.commande_id → commandes.id
factures.bl_id → bons_livraison.id
```

Permet de retrouver tout l'historique ! 🔍

---

## ✅ Checklist d'Intégration

Pour chaque page :

- [ ] Importer la fonction de conversion
- [ ] Créer le handler (handleConvertir...)
- [ ] Ajouter le bouton dans les actions
- [ ] Conditionner l'affichage sur le statut
- [ ] Tester la conversion
- [ ] Vérifier les statuts mis à jour
- [ ] Vérifier les numéros générés

---

## 🎉 Résultat

Vos utilisateurs pourront :
- ✅ Convertir devis → commande en 1 clic
- ✅ Créer BL depuis commande en 1 clic
- ✅ Facturer BL en 1 clic
- ✅ Ou facturer commande directement
- ✅ Tracer tout le workflow
- ✅ Garder l'historique complet

**Workflow ERP professionnel complet !** 🚀

---

*Guide créé pour Africa Mobilier ERP*
*Excellence marocaine, Vision africaine* ❤️

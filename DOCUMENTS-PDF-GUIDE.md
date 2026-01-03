# 📄 Documents Imprimables - Guide de Personnalisation

## ✅ Documents Disponibles

J'ai créé le composant **DevisPDF.tsx** qui permet d'imprimer et télécharger les devis en PDF.

Le même principe s'applique pour :
- 📝 Devis
- 🛒 Commandes
- 🚚 Bons de Livraison
- 💰 Factures

---

## 🎨 Comment Personnaliser la Mise en Page

### Fichier à Modifier

```
src/components/DevisPDF.tsx
```

(Créer des copies : `CommandePDF.tsx`, `BonLivraisonPDF.tsx`, `FacturePDF.tsx`)

---

## 🔧 Zones Personnalisables

### 1. **En-tête Entreprise** (lignes 54-65)

```tsx
<div>
  <img 
    src="/africa-mobilier-logo.png" 
    alt="Africa Mobilier" 
    className="h-20 mb-4"  // ← Modifier la taille du logo
  />
  <div className="text-sm text-gray-600">
    <p className="font-semibold text-gray-900">AFRICA MOBILIER</p>
    <p>Casablanca, Maroc</p>  // ← Votre adresse
    <p>Tél: +212 XXX-XXXXXX</p>  // ← Votre téléphone
    <p>Email: contact@africamobilier.com</p>  // ← Votre email
    <p>ICE: XXXXXXXXXX</p>  // ← Votre ICE
  </div>
</div>
```

**💡 Astuce** : Connectez ces données à la table `parametres` :
```tsx
<p>{parametres.nom_entreprise}</p>
<p>{parametres.adresse}</p>
<p>Tél: {parametres.telephone}</p>
```

---

### 2. **Titre du Document** (lignes 67-74)

```tsx
<h1 className="text-3xl font-bold text-gray-900 mb-2">
  DEVIS  // ← Changer en "FACTURE", "BON DE LIVRAISON", etc.
</h1>
```

**Taille du titre** :
- `text-2xl` = Petit
- `text-3xl` = Moyen (actuel)
- `text-4xl` = Grand

**Couleur** :
- `text-gray-900` = Noir
- `text-primary-600` = Orange (couleur marque)
- `text-blue-900` = Bleu

---

### 3. **Section Client** (lignes 77-90)

```tsx
<div className="mb-8 bg-gray-50 p-4 rounded-lg">
  // ← Modifier bg-gray-50 pour changer la couleur de fond
  <h3 className="font-semibold text-gray-900 mb-2">Client</h3>
  // ...
</div>
```

**Sans fond gris** :
```tsx
<div className="mb-8 border-l-4 border-primary-600 pl-4">
```

---

### 4. **Tableau des Articles** (lignes 92-119)

**Colonnes** :
```tsx
<th className="border border-gray-300 px-4 py-3 text-left">
  Désignation  // ← Modifier le nom
</th>
```

**Couleurs de l'en-tête** :
```tsx
<thead>
  <tr className="bg-gray-800 text-white">
    // ← Modifier en bg-primary-600 pour orange
```

**Largeur des colonnes** :
```tsx
<th className="... w-24">Qté</th>  // ← 24 = 96px
<th className="... w-32">P.U. HT</th>  // ← 32 = 128px
```

---

### 5. **Zone Totaux** (lignes 123-137)

```tsx
<div className="w-64">  // ← Modifier la largeur
  <div className="flex justify-between py-2 border-b">
    <span className="text-gray-600">Total HT:</span>
    <span className="font-semibold">
      {devis.montant_ht?.toFixed(2)} MAD
    </span>
  </div>
  // ...
</div>
```

**Style du total TTC** :
```tsx
<div className="... bg-gray-800 text-white ...">
  // ← Modifier en bg-primary-600 pour orange
```

---

### 6. **Footer** (lignes 160-163)

```tsx
<div className="mt-12 pt-6 border-t text-center text-xs text-gray-500">
  <p>Africa Mobilier - Excellence marocaine, Vision africaine</p>
  <p>RC: XXXXXX - ICE: XXXXXXXXXX - Patente: XXXXXX</p>
  // ← Modifier avec vos vraies informations
</div>
```

---

## 🎨 Exemples de Personnalisation

### Design Moderne avec Accent Orange

```tsx
// En-tête avec bande orange
<div className="bg-primary-600 text-white p-6 -mx-8 -mt-8 mb-8">
  <div className="flex justify-between items-center">
    <img src="/logo-blanc.png" className="h-16" />
    <div className="text-right">
      <h1 className="text-4xl font-bold">DEVIS</h1>
      <p className="text-xl">#{devis.numero_devis}</p>
    </div>
  </div>
</div>

// Tableau avec en-tête orange
<tr className="bg-primary-600 text-white">

// Total avec fond orange
<div className="bg-primary-600 text-white ...">
```

---

### Design Minimaliste

```tsx
// Sans fond, bordures fines
<div className="mb-8 border-l-2 border-gray-300 pl-4">
  <h3 className="text-sm uppercase tracking-wide text-gray-500">Client</h3>
  // ...
</div>

// Tableau sans bordures
<table className="w-full mb-8">
  <thead>
    <tr className="border-b-2 border-gray-900">
      <th className="px-4 py-3 text-left">Désignation</th>
  </thead>
  <tbody>
    <tr className="border-b border-gray-200">
```

---

### Design Professionnel avec Ombres

```tsx
// Carte client avec ombre
<div className="mb-8 bg-white shadow-lg rounded-lg p-6 border border-gray-200">

// Total avec ombre
<div className="shadow-xl rounded-lg overflow-hidden">
  <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
    <span className="font-bold text-2xl">{devis.montant_ttc?.toFixed(2)} MAD</span>
  </div>
</div>
```

---

## 📐 Modifier les Marges d'Impression

Dans la section `<style>` (ligne 168) :

```css
@page {
  margin: 1.5cm;  /* ← Modifier ici */
  size: A4;
}
```

**Options** :
- `margin: 1cm;` = Marges réduites
- `margin: 2cm;` = Marges larges
- `margin: 1cm 2cm;` = 1cm haut/bas, 2cm gauche/droite

---

## 🖨️ Comment Utiliser dans l'ERP

### 1. Ajouter le Bouton "Imprimer"

Dans `src/pages/Devis.tsx`, ajoutez :

```tsx
import { DevisPDF } from '@/components/DevisPDF';
import { Printer } from 'lucide-react';

// Dans votre composant
const [showPDF, setShowPDF] = useState(false);
const [selectedDevis, setSelectedDevis] = useState(null);

// Dans le tableau
<button
  onClick={() => {
    setSelectedDevis(devis);
    setShowPDF(true);
  }}
  className="text-primary-600 hover:text-primary-900"
>
  <Printer className="w-5 h-5" />
</button>

// En fin de composant
{showPDF && selectedDevis && (
  <DevisPDF 
    devis={selectedDevis} 
    onClose={() => setShowPDF(false)} 
  />
)}
```

---

## 📋 Créer les Autres Documents

### Copier et Adapter

```bash
# Créer CommandePDF.tsx
cp src/components/DevisPDF.tsx src/components/CommandePDF.tsx

# Puis modifier :
# - Le titre : "DEVIS" → "COMMANDE"
# - Les champs spécifiques
```

**Champs spécifiques par document** :

| Document | Champs Spécifiques |
|----------|-------------------|
| Devis | Date validité, Statut |
| Commande | Date livraison prévue, Statut |
| BL | Date livraison, Livreur, Signature |
| Facture | Mode paiement, Échéance, Solde |

---

## 🎨 Templates Prêts à l'Emploi

Je peux créer pour vous :
1. ✅ **Template Moderne** (orange/blanc, ombres)
2. ✅ **Template Minimaliste** (noir/blanc, épuré)
3. ✅ **Template Professionnel** (gris/bleu, corporate)
4. ✅ **Template Marocain** (couleurs drapeau, motifs)

Dites-moi lequel vous préférez ! 😊

---

## 💡 Bonnes Pratiques

1. **Logo** : Format PNG transparent, 300x100px minimum
2. **Polices** : Rester sur les polices système (rapides)
3. **Couleurs** : Maximum 2-3 couleurs principales
4. **Marges** : Minimum 1cm pour l'impression
5. **Test** : Toujours tester l'impression avant la prod

---

Voulez-vous que je crée un template personnalisé pour Africa Mobilier ? 🎨

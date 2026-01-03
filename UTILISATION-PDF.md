# 📄 Guide d'Utilisation - Documents PDF

## ✅ 4 Documents Créés

Je viens de créer les composants d'impression pour tous vos documents :

1. **DevisPDF.tsx** - Devis (fond gris, en-tête gris)
2. **CommandePDF.tsx** - Commande (fond gris, en-tête orange)
3. **BonLivraisonPDF.tsx** - BL (fond gris, en-tête bleu, signatures)
4. **FacturePDF.tsx** - Facture (fond gris, en-tête rouge, paiements)

---

## 🎨 Différences Visuelles par Document

| Document | Couleur | Spécificités |
|----------|---------|--------------|
| **Devis** | Gris | Date validité |
| **Commande** | Orange | Date livraison prévue |
| **BL** | Bleu | Qté commandée vs livrée, Signatures |
| **Facture** | Rouge | Paiements, Solde, RIB |

---

## 🚀 Comment les Utiliser

### 1. Dans Devis.tsx

```tsx
import { Printer } from 'lucide-react';
import { DevisPDF } from '@/components/DevisPDF';
import { useState } from 'react';

// En haut du composant
const [showPDF, setShowPDF] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

// Dans le tableau, colonne Actions
<button
  onClick={() => {
    setSelectedItem(devis);
    setShowPDF(true);
  }}
  className="text-primary-600 hover:text-primary-900"
  title="Imprimer"
>
  <Printer className="w-5 h-5" />
</button>

// À la fin du composant
{showPDF && selectedItem && (
  <DevisPDF 
    devis={selectedItem} 
    onClose={() => setShowPDF(false)} 
  />
)}
```

### 2. Dans Commandes.tsx

```tsx
import { CommandePDF } from '@/components/CommandePDF';

// Même principe
{showPDF && selectedItem && (
  <CommandePDF 
    commande={selectedItem} 
    onClose={() => setShowPDF(false)} 
  />
)}
```

### 3. Dans BonsLivraison.tsx

```tsx
import { BonLivraisonPDF } from '@/components/BonLivraisonPDF';

{showPDF && selectedItem && (
  <BonLivraisonPDF 
    bl={selectedItem} 
    onClose={() => setShowPDF(false)} 
  />
)}
```

### 4. Dans Factures.tsx

```tsx
import { FacturePDF } from '@/components/FacturePDF';

{showPDF && selectedItem && (
  <FacturePDF 
    facture={selectedItem} 
    onClose={() => setShowPDF(false)} 
  />
)}
```

---

## 🎨 Personnalisation

### Changer les Couleurs

**Devis** (DevisPDF.tsx ligne 95):
```tsx
className="bg-gray-800 text-white"
// → Modifier en bg-green-600 pour vert
```

**Commande** (CommandePDF.tsx ligne 95):
```tsx
className="bg-primary-600 text-white"
// Déjà en orange ✅
```

**BL** (BonLivraisonPDF.tsx ligne 95):
```tsx
className="bg-blue-600 text-white"
// Déjà en bleu ✅
```

**Facture** (FacturePDF.tsx ligne 98):
```tsx
className="bg-red-600 text-white"
// Déjà en rouge ✅
```

---

### Modifier les Informations Entreprise

Dans **chaque fichier**, lignes 58-64 :

```tsx
<p className="font-semibold text-gray-900">AFRICA MOBILIER</p>
<p>Votre adresse complète</p>
<p>Tél: Votre téléphone</p>
<p>Email: contact@africamobilier.com</p>
<p>ICE: Votre numéro ICE</p>
```

**💡 Mieux**: Connecter à la table `parametres` :

```tsx
// Charger les paramètres
const [parametres, setParametres] = useState(null);

useEffect(() => {
  const loadParametres = async () => {
    const { data } = await supabase
      .from('parametres')
      .select('*')
      .single();
    setParametres(data);
  };
  loadParametres();
}, []);

// Puis utiliser
<p>{parametres?.nom_entreprise}</p>
<p>{parametres?.adresse}</p>
```

---

## 📐 Spécificités par Document

### Bon de Livraison

**2 colonnes quantités** :
```tsx
<th>Qté Commandée</th>
<th>Qté Livrée</th>
```

**Zone signatures** (lignes 130-146) :
```tsx
<div className="grid grid-cols-2 gap-8">
  <div className="border-t-2 border-gray-300 pt-2">
    <p>Signature du livreur</p>
  </div>
  <div className="border-t-2 border-gray-300 pt-2">
    <p>Signature du client</p>
  </div>
</div>
```

---

### Facture

**Calcul du solde** (lignes 18-19) :
```tsx
const montantPaye = facture.paiements?.reduce((sum, p) => sum + p.montant, 0) || 0;
const solde = facture.montant_ttc - montantPaye;
```

**Affichage paiements** (lignes 146-159) :
```tsx
{montantPaye > 0 && (
  <>
    <div>Montant payé: {montantPaye.toFixed(2)} MAD</div>
    <div>Solde restant: {solde.toFixed(2)} MAD</div>
  </>
)}
```

**RIB** (lignes 191-198) :
```tsx
<div className="bg-gray-50 p-4 rounded-lg">
  <p>Coordonnées bancaires</p>
  <p>RIB: XXXX XXXX XXXX XXXX</p>
  <p>IBAN: MA XX XXXX XXXX XXXX</p>
</div>
```

---

## 🖨️ Fonctions d'Impression

Chaque composant a 2 boutons :

1. **Imprimer** → Ouvre la boîte de dialogue d'impression
2. **PDF** → Permet de sauvegarder en PDF

**Code** (même pour tous) :
```tsx
const handlePrint = () => {
  window.print();
};
```

Le navigateur gère automatiquement la conversion en PDF !

---

## 🎨 Templates Avancés

### Avec Dégradé

```tsx
<h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 text-transparent bg-clip-text">
  FACTURE
</h1>
```

### Avec Bordure Colorée

```tsx
<div className="border-l-8 border-primary-600 pl-4">
  <h3>Client</h3>
  ...
</div>
```

### Total avec Ombre

```tsx
<div className="shadow-2xl rounded-lg overflow-hidden">
  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
    <span className="text-3xl font-bold">{facture.montant_ttc.toFixed(2)} MAD</span>
  </div>
</div>
```

---

## ✅ Checklist d'Implémentation

Pour chaque page :

- [ ] Importer le composant PDF
- [ ] Ajouter `useState` pour `showPDF` et `selectedItem`
- [ ] Ajouter le bouton Imprimer avec icône `<Printer />`
- [ ] Ajouter le composant PDF à la fin
- [ ] Tester l'impression
- [ ] Tester le PDF
- [ ] Personnaliser les infos entreprise

---

## 📦 Fichiers Modifiés

Après intégration, vous aurez modifié :

```
src/pages/Devis.tsx
src/pages/Commandes.tsx
src/pages/BonsLivraison.tsx
src/pages/Factures.tsx
```

---

## 🎉 Résultat Final

Vos utilisateurs pourront :
- ✅ Voir un aperçu avant impression
- ✅ Imprimer directement
- ✅ Télécharger en PDF
- ✅ Avoir des documents professionnels
- ✅ Personnalisés aux couleurs Africa Mobilier

---

*Guide créé pour Africa Mobilier ERP*
*Excellence marocaine, Vision africaine* ❤️

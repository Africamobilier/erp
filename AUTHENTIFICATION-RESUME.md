# 🔐 Système d'Authentification - Africa Mobilier ERP

## ✅ Fonctionnalités Livrées

### 1. **Page de Connexion** 🎨
- Design moderne avec logo Africa Mobilier
- Formulaire avec validation
- Affichage/masquage du mot de passe
- Messages d'erreur clairs
- "Se souvenir de moi"
- Lien "Mot de passe oublié"
- Liste des comptes de test affichée

**Localisation**: `/login`

---

### 2. **4 Rôles Utilisateurs** 👥

#### 🔵 **Admin** (Administrateur)
**Accès complet à tout l'ERP**
- ✅ Tous les modules
- ✅ Gestion des utilisateurs
- ✅ Paramètres systèmes
- ✅ Peut créer/modifier/supprimer partout

#### 🔵 **Directeur Général**
**Vision globale de l'entreprise**
- ✅ Dashboard avec toutes les stats
- ✅ Gestion commerciale complète
- ✅ Gestion production et livraisons
- ✅ Vue sur les factures
- ⚠️ Paramètres en lecture seule
- ❌ Pas de gestion utilisateurs

#### 🟢 **Directeur Commercial**
**Gestion de l'équipe commerciale**
- ✅ Prospects et clients (CRUD complet)
- ✅ Devis (création, modification, suppression)
- ✅ Commandes (création, modification)
- ⚠️ Produits en lecture seule
- ⚠️ Livraisons en lecture seule
- ⚠️ Factures en lecture seule

#### 🟡 **Commercial**
**Activité commerciale terrain**
- ✅ Dashboard en lecture
- ✅ Prospects (création, modification)
- ✅ Devis (création, modification)
- ⚠️ Produits en lecture seule
- ⚠️ Commandes en lecture seule
- ❌ Pas d'accès aux livraisons ni factures

---

### 3. **Page de Gestion des Utilisateurs** 👨‍💼
**Réservée aux administrateurs**

**Fonctionnalités**:
- ✅ Liste complète des utilisateurs
- ✅ Recherche par nom, email
- ✅ Filtres par rôle
- ✅ Statistiques (total, actifs, inactifs)
- ✅ Création de nouveaux utilisateurs
- ✅ Modification des profils
- ✅ Activation/Désactivation
- ✅ Suppression (désactivation)
- ✅ Badges colorés par rôle
- ✅ Indicateur visuel du statut

**Localisation**: `/utilisateurs`

---

### 4. **Système de Permissions** 🔒

**Matrice des Permissions**:

| Module | Admin | DG | Dir. Commercial | Commercial |
|--------|-------|----|-----------------|------------|
| Dashboard | ✅ CRUD | ✅ R | ✅ R | ✅ R |
| Prospects | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRU |
| Produits | ✅ CRUD | ✅ CRUD | ✅ R | ✅ R |
| Devis | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRU |
| Commandes | ✅ CRUD | ✅ CRUD | ✅ CRU | ✅ R |
| Livraisons | ✅ CRUD | ✅ CRUD | ✅ R | ❌ |
| Factures | ✅ CRUD | ✅ CRUD | ✅ R | ❌ |
| WooCommerce | ✅ CRUD | ✅ CRUD | ✅ R | ❌ |
| Paramètres | ✅ CRUD | ✅ R | ❌ | ❌ |
| Utilisateurs | ✅ CRUD | ✅ R | ❌ | ❌ |

**Légende**: 
- ✅ CRUD = Création, Lecture, Modification, Suppression
- ✅ CRU = Création, Lecture, Modification (pas de suppression)
- ✅ R = Lecture uniquement
- ❌ = Pas d'accès

---

### 5. **Protection des Routes** 🛡️

**Composant ProtectedRoute**:
- Vérification de l'authentification
- Vérification du rôle requis
- Vérification des permissions
- Redirection vers /login si non connecté
- Messages d'erreur élégants

**3 Types de protection**:
```typescript
// 1. Authentification simple
<ProtectedRoute>
  <Page />
</ProtectedRoute>

// 2. Rôle requis
<ProtectedRoute requiredRoles={['admin']}>
  <PageAdmin />
</ProtectedRoute>

// 3. Permission spécifique
<ProtectedRoute requiredPermission={{ module: 'devis', action: 'create' }}>
  <CreerDevis />
</ProtectedRoute>
```

---

### 6. **Interface Utilisateur** 🎨

**Header avec profil**:
- Nom et prénom de l'utilisateur connecté
- Rôle affiché avec badge coloré
- Menu déroulant avec option de déconnexion

**Sidebar améliorée**:
- Menu filtré selon les permissions
- Seuls les modules accessibles sont affichés
- Profil utilisateur en bas
- Bouton de déconnexion rapide

**Indicateurs visuels**:
- 🟣 Admin = Badge violet
- 🔵 DG = Badge bleu
- 🟢 Dir. Commercial = Badge vert
- 🟡 Commercial = Badge jaune

---

### 7. **Base de Données** 💾

**4 Nouvelles Tables**:

1. **user_profiles**
   - Profils utilisateurs
   - Lien avec auth.users de Supabase
   - Nom, prénom, rôle, téléphone
   - Statut actif/inactif

2. **role_permissions**
   - Permissions par rôle et module
   - can_read, can_create, can_update, can_delete
   - Pré-remplie avec matrice complète

3. **user_sessions**
   - Historique des connexions
   - IP, User Agent
   - Date login/logout

4. **activity_logs**
   - Journal d'activité
   - Actions des utilisateurs
   - Module, entité, détails JSON

**Sécurité**:
- Row Level Security (RLS) activé
- Policies pour chaque table
- Triggers automatiques
- Fonction de création de profil auto

---

### 8. **Contexte d'Authentification** ⚙️

**AuthContext fourni**:
```typescript
const { 
  user,           // Utilisateur Supabase
  profile,        // Profil avec rôle
  session,        // Session active
  loading,        // État de chargement
  signIn,         // Fonction de connexion
  signOut,        // Fonction de déconnexion
  hasPermission,  // Vérifier une permission
  isRole          // Vérifier un rôle
} = useAuth();
```

**Utilisation dans les composants**:
```typescript
// Vérifier permission
if (hasPermission('devis', 'create')) {
  // Afficher bouton créer
}

// Vérifier rôle
if (isRole('admin', 'directeur_general')) {
  // Afficher options avancées
}

// Afficher conditionnel
{hasPermission('prospects', 'delete') && (
  <button>Supprimer</button>
)}
```

---

## 📦 Fichiers Créés

### Code Source
- ✅ `src/contexts/AuthContext.tsx` - Contexte authentification
- ✅ `src/components/ProtectedRoute.tsx` - Protection des routes
- ✅ `src/pages/Login.tsx` - Page de connexion
- ✅ `src/pages/Utilisateurs.tsx` - Gestion utilisateurs
- ✅ `src/components/Layout.tsx` - Layout mis à jour
- ✅ `src/App.tsx` - Routes mises à jour

### Base de Données
- ✅ `supabase-auth-setup.sql` - Script SQL complet

### Documentation
- ✅ `AUTH-INSTALLATION.md` - Guide d'installation
- ✅ `AUTHENTIFICATION-RESUME.md` - Ce fichier

---

## 🚀 Installation Rapide

### 1. Exécuter le Script SQL
```sql
-- Dans Supabase SQL Editor
-- Copier/coller supabase-auth-setup.sql
-- Cliquer sur "Run"
```

### 2. Créer le Premier Admin
```
Supabase > Authentication > Users > Add user

Email: admin@africamobilier.ma
Password: [votre mot de passe sécurisé]

User Metadata (JSON):
{
  "nom": "Admin",
  "prenom": "System",
  "role": "admin"
}

☑️ Auto Confirm User
```

### 3. Lancer l'Application
```bash
npm run dev
```

### 4. Se Connecter
```
URL: http://localhost:3000
→ Redirection vers /login

Email: admin@africamobilier.ma
Password: [votre mot de passe]
```

---

## 🎯 Cas d'Usage

### Scénario 1: Nouvel Commercial
```
1. Admin se connecte
2. Va dans Utilisateurs
3. Clique "Nouvel Utilisateur"
4. Remplit:
   - Prénom: Karim
   - Nom: Tazi
   - Email: karim@africamobilier.ma
   - Rôle: Commercial
   - Mot de passe: ******
5. Sauvegarde

→ Karim peut maintenant se connecter
→ Il voit uniquement: Dashboard, Prospects, Produits (lecture), Devis
```

### Scénario 2: Promotion
```
1. Admin ouvre profil de Karim
2. Change le rôle: Commercial → Directeur Commercial
3. Sauvegarde

→ Karim a maintenant accès à plus de modules
→ Peut gérer les commandes
```

### Scénario 3: Départ d'un Employé
```
1. Admin ouvre profil de l'employé
2. Clique sur l'icône "Désactiver"

→ L'employé ne peut plus se connecter
→ Ses données restent dans la base
→ Possibilité de réactiver plus tard
```

---

## 🔐 Sécurité

### Points Forts
✅ Authentification Supabase (bcrypt)
✅ Row Level Security (RLS)
✅ Tokens JWT sécurisés
✅ HTTPS obligatoire en production
✅ Sessions trackées
✅ Logs d'activité
✅ Mot de passe minimum 6 caractères

### Recommandations
- Utiliser des mots de passe forts (12+ caractères)
- Activer 2FA pour les admins (via Supabase)
- Surveiller les logs régulièrement
- Désactiver les comptes inutilisés
- Changer les mots de passe par défaut

---

## 📊 Monitoring

### Voir les Utilisateurs Connectés
```sql
SELECT 
  up.email,
  up.nom,
  up.prenom,
  us.login_at,
  us.ip_address
FROM user_profiles up
JOIN user_sessions us ON up.id = us.user_id
WHERE us.logout_at IS NULL
ORDER BY us.login_at DESC;
```

### Activité Récente
```sql
SELECT 
  up.email,
  al.action,
  al.module,
  al.created_at
FROM activity_logs al
JOIN user_profiles up ON al.user_id = up.id
ORDER BY al.created_at DESC
LIMIT 50;
```

---

## 🎉 Résumé

**Système d'authentification complet et professionnel** avec:
- ✅ 4 niveaux d'accès différenciés
- ✅ Permissions granulaires par module
- ✅ Interface de gestion complète
- ✅ Sécurité renforcée (RLS, JWT)
- ✅ Tracking des sessions et activités
- ✅ Documentation exhaustive

**L'ERP est maintenant sécurisé et multi-utilisateurs !** 🚀

---

*Africa Mobilier ERP v1.0.0 + Authentication System*
*Excellence marocaine, Vision africaine* ❤️

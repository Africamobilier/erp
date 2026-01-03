# 🔐 Guide d'Installation - Authentification Africa Mobilier ERP

## 📋 Vue d'Ensemble

L'ERP dispose maintenant d'un **système d'authentification complet** avec gestion des rôles et permissions.

### 4 Niveaux d'Accès

| Rôle | Description | Accès |
|------|-------------|-------|
| **Admin** | Administrateur système | Accès total + Gestion utilisateurs |
| **Directeur Général** | Direction | Accès complet sauf gestion utilisateurs |
| **Directeur Commercial** | Direction commerciale | Gestion commerciale complète |
| **Commercial** | Commercial terrain | Prospects, Devis (lecture limitée) |

---

## 🚀 Installation

### Étape 1: Exécuter le Script SQL d'Authentification

1. Ouvrir **Supabase** > Votre projet
2. Aller dans **SQL Editor**
3. Créer une nouvelle query
4. Copier/coller le contenu de `supabase-auth-setup.sql`
5. Cliquer sur **Run**

✅ Ce script crée :
- Tables `user_profiles`, `role_permissions`, `user_sessions`, `activity_logs`
- Permissions par rôle
- Triggers automatiques
- Row Level Security (RLS)

### Étape 2: Créer le Premier Utilisateur Admin

#### Option A: Via Supabase Dashboard (Recommandé)

1. **Supabase** > **Authentication** > **Users**
2. Cliquer sur **Add user** > **Create new user**
3. Remplir:
   ```
   Email: admin@africamobilier.ma
   Password: [Votre mot de passe sécurisé]
   ```
4. Cocher **Auto Confirm User**
5. Dans **User Metadata**, ajouter (format JSON):
   ```json
   {
     "nom": "Admin",
     "prenom": "System",
     "role": "admin"
   }
   ```
6. Cliquer sur **Create user**

#### Option B: Via SQL

```sql
-- Créer l'utilisateur dans auth.users
-- Note: Utiliser plutôt l'interface Supabase qui gère le hash du mot de passe

-- Puis créer le profil manuellement
INSERT INTO user_profiles (id, email, nom, prenom, role)
VALUES (
  '[UUID de l'utilisateur créé]',
  'admin@africamobilier.ma',
  'Admin',
  'System',
  'admin'
);
```

### Étape 3: Créer les Autres Utilisateurs

Répéter l'Étape 2 pour chaque utilisateur :

**Directeur Général:**
```json
{
  "nom": "Benali",
  "prenom": "Mohammed",
  "role": "directeur_general"
}
```

**Directeur Commercial:**
```json
{
  "nom": "Alami",
  "prenom": "Fatima",
  "role": "directeur_commercial"
}
```

**Commercial:**
```json
{
  "nom": "Tazi",
  "prenom": "Karim",
  "role": "commercial"
}
```

---

## 🔑 Connexion à l'ERP

### Première Connexion

1. Ouvrir l'ERP : `http://localhost:3000`
2. Vous serez redirigé vers `/login`
3. Entrer vos identifiants
4. Cliquer sur **Se connecter**

### Identifiants de Test

Après création des utilisateurs, vous pouvez vous connecter avec :

```
Admin:
Email: admin@africamobilier.ma
Password: [votre mot de passe]

Directeur Général:
Email: dg@africamobilier.ma  
Password: [votre mot de passe]

Directeur Commercial:
Email: dc@africamobilier.ma
Password: [votre mot de passe]

Commercial:
Email: commercial@africamobilier.ma
Password: [votre mot de passe]
```

---

## 📊 Matrice des Permissions

### Admin
```
✅ Dashboard (lecture)
✅ Prospects (création/modification/suppression)
✅ Produits (création/modification/suppression)
✅ Devis (création/modification/suppression)
✅ Commandes (création/modification/suppression)
✅ Livraisons (création/modification/suppression)
✅ Factures (création/modification/suppression)
✅ WooCommerce (synchronisation)
✅ Paramètres (modification)
✅ Utilisateurs (gestion)
```

### Directeur Général
```
✅ Dashboard (lecture)
✅ Prospects (création/modification/suppression)
✅ Produits (création/modification/suppression)
✅ Devis (création/modification/suppression)
✅ Commandes (création/modification/suppression)
✅ Livraisons (création/modification/suppression)
✅ Factures (création/modification/suppression)
✅ WooCommerce (synchronisation)
✅ Paramètres (lecture uniquement)
❌ Utilisateurs (lecture uniquement)
```

### Directeur Commercial
```
✅ Dashboard (lecture)
✅ Prospects (création/modification/suppression)
⚠️ Produits (lecture uniquement)
✅ Devis (création/modification/suppression)
✅ Commandes (création/modification, pas de suppression)
⚠️ Livraisons (lecture uniquement)
⚠️ Factures (lecture uniquement)
⚠️ WooCommerce (lecture uniquement)
❌ Paramètres (pas d'accès)
❌ Utilisateurs (pas d'accès)
```

### Commercial
```
✅ Dashboard (lecture)
✅ Prospects (création/modification, pas de suppression)
⚠️ Produits (lecture uniquement)
✅ Devis (création/modification, pas de suppression)
⚠️ Commandes (lecture uniquement)
❌ Livraisons (pas d'accès)
❌ Factures (pas d'accès)
❌ WooCommerce (pas d'accès)
❌ Paramètres (pas d'accès)
❌ Utilisateurs (pas d'accès)
```

---

## 🛡️ Sécurité

### Row Level Security (RLS)

Le script active RLS sur toutes les tables sensibles :
- `user_profiles`
- `role_permissions`
- `user_sessions`
- `activity_logs`

### Policies Créées

1. **user_profiles**:
   - Les utilisateurs voient leur propre profil
   - Les admins voient tous les profils

2. **role_permissions**:
   - Tous les utilisateurs authentifiés peuvent lire les permissions

3. **activity_logs**:
   - Les utilisateurs voient leurs propres logs
   - Admins et DG voient tous les logs

### Sessions

- Chaque connexion est enregistrée dans `user_sessions`
- IP et User Agent sont sauvegardés
- Date de connexion et déconnexion trackées

### Activity Logs

Toutes les actions importantes sont enregistrées :
- Qui a fait quoi
- Sur quel module
- Quand
- Détails de l'action

---

## 🔧 Personnalisation des Permissions

### Modifier les Permissions d'un Rôle

```sql
-- Exemple: Donner accès aux factures au directeur commercial
UPDATE role_permissions
SET can_create = true, can_update = true
WHERE role = 'directeur_commercial' 
AND module = 'factures';
```

### Ajouter un Nouveau Module

```sql
-- Ajouter les permissions pour un nouveau module
INSERT INTO role_permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES
  ('admin', 'nouveau_module', true, true, true, true),
  ('directeur_general', 'nouveau_module', true, true, true, false),
  ('directeur_commercial', 'nouveau_module', true, false, false, false),
  ('commercial', 'nouveau_module', false, false, false, false);
```

### Créer un Nouveau Rôle

```sql
-- 1. Ajouter le rôle dans la contrainte CHECK
ALTER TABLE user_profiles
DROP CONSTRAINT user_profiles_role_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_role_check
CHECK (role IN ('admin', 'directeur_general', 'directeur_commercial', 'commercial', 'nouveau_role'));

-- 2. Ajouter les permissions
INSERT INTO role_permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES
  ('nouveau_role', 'dashboard', true, false, false, false),
  ('nouveau_role', 'prospects', true, true, false, false);
  -- ... etc pour chaque module
```

---

## 📱 Utilisation dans le Code

### Vérifier les Permissions

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MonComposant() {
  const { hasPermission, isRole } = useAuth();

  // Vérifier une permission
  if (hasPermission('devis', 'create')) {
    // Afficher le bouton "Créer un devis"
  }

  // Vérifier un rôle
  if (isRole('admin', 'directeur_general')) {
    // Afficher options réservées aux admins et DG
  }
}
```

### Protéger une Route

```typescript
<Route 
  path="/module-sensible" 
  element={
    <ProtectedRoute 
      requiredRoles={['admin']}
      requiredPermission={{ module: 'module_sensible', action: 'read' }}
    >
      <ModuleSensible />
    </ProtectedRoute>
  } 
/>
```

### Afficher Conditionnellement

```typescript
{hasPermission('prospects', 'delete') && (
  <button onClick={handleDelete}>
    Supprimer
  </button>
)}
```

---

## 🐛 Dépannage

### Problème 1: "Erreur de connexion"

**Cause**: Credentials incorrects

**Solution**:
1. Vérifier l'email et le mot de passe
2. Vérifier que l'utilisateur est confirmé dans Supabase Auth
3. Vérifier que le profil existe dans `user_profiles`

```sql
-- Vérifier le profil
SELECT * FROM user_profiles WHERE email = 'votre@email.com';
```

### Problème 2: "Compte désactivé"

**Cause**: Champ `actif` = false

**Solution**:
```sql
UPDATE user_profiles
SET actif = true
WHERE email = 'votre@email.com';
```

### Problème 3: "Accès refusé"

**Cause**: Permissions insuffisantes

**Solution**:
```sql
-- Vérifier les permissions du rôle
SELECT * FROM role_permissions 
WHERE role = 'votre_role';

-- Modifier si nécessaire
UPDATE role_permissions
SET can_read = true
WHERE role = 'votre_role' AND module = 'module_name';
```

### Problème 4: Profil non créé automatiquement

**Cause**: Trigger pas activé

**Solution**:
```sql
-- Créer manuellement le profil
INSERT INTO user_profiles (id, email, nom, prenom, role)
VALUES (
  '[UUID depuis auth.users]',
  'email@domain.com',
  'Nom',
  'Prénom',
  'role'
);
```

---

## 🔄 Migration des Données Existantes

Si vous aviez déjà des données avant l'authentification :

```sql
-- Les données restent accessibles
-- Pas besoin de migration particulière

-- Optionnel: Lier les données à un utilisateur
ALTER TABLE clients ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE devis ADD COLUMN created_by_user UUID REFERENCES auth.users(id);
-- etc.
```

---

## 📊 Statistiques et Monitoring

### Voir les Utilisateurs Actifs

```sql
SELECT 
  up.email,
  up.nom,
  up.prenom,
  up.role,
  us.login_at,
  us.ip_address
FROM user_profiles up
LEFT JOIN user_sessions us ON up.id = us.user_id
WHERE us.logout_at IS NULL
ORDER BY us.login_at DESC;
```

### Voir l'Activité Récente

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

### Statistiques par Rôle

```sql
SELECT 
  role,
  COUNT(*) as nombre_utilisateurs,
  COUNT(CASE WHEN actif THEN 1 END) as actifs
FROM user_profiles
GROUP BY role;
```

---

## ✅ Checklist de Vérification

Après installation, vérifier :

- [ ] Script `supabase-auth-setup.sql` exécuté sans erreur
- [ ] Tables créées (user_profiles, role_permissions, etc.)
- [ ] Au moins un utilisateur admin créé
- [ ] Connexion fonctionne
- [ ] Profil affiché dans le sidebar
- [ ] Déconnexion fonctionne
- [ ] Les permissions filtrent correctement le menu
- [ ] Messages d'accès refusé s'affichent correctement

---

## 🚀 Prochaines Étapes

1. Créer tous vos utilisateurs
2. Tester chaque rôle
3. Ajuster les permissions si nécessaire
4. Activer les logs d'activité dans le code
5. Configurer les emails de récupération de mot de passe (Supabase Auth)

---

*Dernière mise à jour: Janvier 2026*
*Africa Mobilier ERP v1.0.0 + Auth*
*Excellence marocaine, Vision africaine*

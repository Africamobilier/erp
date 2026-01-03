# 🔧 Configuration Supabase Auth pour Créer des Utilisateurs

## ⚠️ Problème Actuel

Quand vous créez un utilisateur depuis l'ERP, il reçoit un email de confirmation et ne peut pas se connecter avant de confirmer son email.

---

## ✅ Solution : Désactiver la Confirmation Email

### Dans Supabase Dashboard :

1. **Aller sur** : https://app.supabase.com
2. **Ouvrir** votre projet
3. **Authentication** (menu gauche)
4. **Settings** (sous-menu)
5. Descendre à **Email Auth**

### Option 1 : Désactiver Complètement (Recommandé pour ERP Interne)

```
☐ Enable email confirmations
```

**Décocher** cette case.

→ Les utilisateurs peuvent se connecter immédiatement après création !

### Option 2 : Auto-Confirmer (Alternative)

Si vous voulez garder les emails mais auto-confirmer :

Dans **SQL Editor**, exécutez :

```sql
-- Créer une fonction pour auto-confirmer
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirmer l'email
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_user_created_auto_confirm
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auto_confirm_user();
```

---

## 🔄 Alternative : Créer Utilisateurs via SQL

Si vous voulez créer un utilisateur sans email de confirmation :

```sql
-- 1. Insérer dans auth.users (générer un UUID)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'y.douib@africamobilier.com',
  crypt('motdepasse123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nom":"Douib","prenom":"Youssef","role":"commercial"}',
  NOW(),
  NOW(),
  '',
  ''
);

-- 2. Le profil sera créé automatiquement par le trigger
```

Mais c'est plus complexe.

---

## 🎯 Recommandation

**Utilisez l'Option 1** : Désactiver complètement les confirmations d'email.

Pourquoi ?
- ✅ ERP interne (pas d'inscription publique)
- ✅ Admin crée les comptes
- ✅ Utilisateurs peuvent se connecter immédiatement
- ✅ Pas de gestion d'emails

---

## 📧 Configuration Email (Optionnel)

Si vous voulez quand même envoyer des emails :

1. **Supabase** > **Project Settings** > **Auth**
2. **SMTP Settings**
3. Configurer avec votre serveur email (Gmail, SendGrid, etc.)

Mais pour un ERP interne, ce n'est **pas nécessaire**.

---

## ✅ Après Configuration

1. Désactiver les confirmations email
2. Pusher le code corrigé sur GitHub
3. Vercel redéploiera automatiquement
4. Créer un utilisateur → Fonctionne immédiatement !

---

*Guide créé pour Africa Mobilier ERP*

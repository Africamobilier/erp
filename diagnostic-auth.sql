-- =============================================
-- DIAGNOSTIC AUTHENTIFICATION
-- Africa Mobilier ERP
-- =============================================

-- 1. VÉRIFIER L'UTILISATEUR DANS AUTH.USERS
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'admin@africamobilier.com';

-- 2. VÉRIFIER LE PROFIL
SELECT 
    id,
    email,
    nom,
    prenom,
    role,
    actif,
    created_at
FROM user_profiles 
WHERE email = 'admin@africamobilier.com';

-- 3. VÉRIFIER LES PERMISSIONS DU RÔLE ADMIN
SELECT 
    role,
    module,
    can_read,
    can_create,
    can_update,
    can_delete
FROM role_permissions 
WHERE role = 'admin'
ORDER BY module;

-- 4. COMPTER LES PERMISSIONS
SELECT 
    role,
    COUNT(*) as nombre_permissions
FROM role_permissions 
GROUP BY role
ORDER BY role;

-- =============================================
-- SOLUTIONS SI PROBLÈME
-- =============================================

-- SI LE PROFIL N'EXISTE PAS, LE CRÉER :
/*
INSERT INTO user_profiles (id, email, nom, prenom, role, actif)
SELECT 
    id,
    email,
    'Admin',
    'Amine',
    'admin',
    true
FROM auth.users 
WHERE email = 'admin@africamobilier.com'
ON CONFLICT (id) DO NOTHING;
*/

-- SI LE RÔLE N'EST PAS ADMIN :
/*
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'admin@africamobilier.com';
*/

-- SI LE COMPTE N'EST PAS ACTIF :
/*
UPDATE user_profiles
SET actif = true
WHERE email = 'admin@africamobilier.com';
*/

-- VÉRIFIER LES POLICIES RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- SI BESOIN, DÉSACTIVER TEMPORAIREMENT RLS POUR DEBUG :
/*
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- ATTENTION: Ne pas oublier de réactiver après !
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
*/

-- =============================================
-- RÉSULTAT ATTENDU
-- =============================================

-- auth.users : 1 ligne avec email confirmé
-- user_profiles : 1 ligne avec role='admin' et actif=true
-- role_permissions : 10 lignes pour admin (1 par module)

-- Si tout est OK, le problème vient du code front-end
-- Vérifiez la console du navigateur (F12)

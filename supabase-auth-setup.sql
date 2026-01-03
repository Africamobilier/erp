-- =============================================
-- SYSTÈME D'AUTHENTIFICATION ET RÔLES
-- Africa Mobilier ERP
-- =============================================

-- Table des profils utilisateurs (extend auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'directeur_general', 'directeur_commercial', 'commercial')),
    telephone VARCHAR(50),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des permissions par rôle
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    can_read BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insérer les permissions par défaut
INSERT INTO role_permissions (role, module, can_read, can_create, can_update, can_delete) VALUES
-- ADMIN - Accès total
('admin', 'dashboard', true, true, true, true),
('admin', 'prospects', true, true, true, true),
('admin', 'produits', true, true, true, true),
('admin', 'devis', true, true, true, true),
('admin', 'commandes', true, true, true, true),
('admin', 'livraisons', true, true, true, true),
('admin', 'factures', true, true, true, true),
('admin', 'woocommerce', true, true, true, true),
('admin', 'parametres', true, true, true, true),
('admin', 'utilisateurs', true, true, true, true),

-- DIRECTEUR GÉNÉRAL - Accès complet sauf gestion utilisateurs
('directeur_general', 'dashboard', true, true, true, true),
('directeur_general', 'prospects', true, true, true, true),
('directeur_general', 'produits', true, true, true, true),
('directeur_general', 'devis', true, true, true, true),
('directeur_general', 'commandes', true, true, true, true),
('directeur_general', 'livraisons', true, true, true, true),
('directeur_general', 'factures', true, true, true, true),
('directeur_general', 'woocommerce', true, true, true, true),
('directeur_general', 'parametres', true, false, false, false),
('directeur_general', 'utilisateurs', true, false, false, false),

-- DIRECTEUR COMMERCIAL - Accès commercial complet
('directeur_commercial', 'dashboard', true, false, false, false),
('directeur_commercial', 'prospects', true, true, true, true),
('directeur_commercial', 'produits', true, false, false, false),
('directeur_commercial', 'devis', true, true, true, true),
('directeur_commercial', 'commandes', true, true, true, false),
('directeur_commercial', 'livraisons', true, false, false, false),
('directeur_commercial', 'factures', true, false, false, false),
('directeur_commercial', 'woocommerce', true, false, false, false),
('directeur_commercial', 'parametres', false, false, false, false),
('directeur_commercial', 'utilisateurs', false, false, false, false),

-- COMMERCIAL - Accès limité
('commercial', 'dashboard', true, false, false, false),
('commercial', 'prospects', true, true, true, false),
('commercial', 'produits', true, false, false, false),
('commercial', 'devis', true, true, true, false),
('commercial', 'commandes', true, false, false, false),
('commercial', 'livraisons', false, false, false, false),
('commercial', 'factures', false, false, false, false),
('commercial', 'woocommerce', false, false, false, false),
('commercial', 'parametres', false, false, false, false),
('commercial', 'utilisateurs', false, false, false, false)
ON CONFLICT DO NOTHING;

-- Table des sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_at TIMESTAMP DEFAULT NOW(),
    logout_at TIMESTAMP
);

-- Table des logs d'activité
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_user_profile_updated_at();

-- Fonction pour créer un profil automatiquement après inscription
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, nom, prenom, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nom', 'Non renseigné'),
        COALESCE(NEW.raw_user_meta_data->>'prenom', 'Non renseigné'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'commercial')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour user_profiles
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les admins peuvent tout voir"
    ON user_profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policies pour role_permissions
CREATE POLICY "Tout le monde peut lire les permissions"
    ON role_permissions FOR SELECT
    TO authenticated
    USING (true);

-- Policies pour activity_logs
CREATE POLICY "Les utilisateurs peuvent voir leurs propres logs"
    ON activity_logs FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Les admins et DG peuvent voir tous les logs"
    ON activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() 
            AND role IN ('admin', 'directeur_general')
        )
    );

-- Créer un utilisateur admin par défaut
-- IMPORTANT: Changez le mot de passe après la première connexion !
-- Note: Cette partie sera exécutée via l'interface Supabase Auth

COMMENT ON TABLE user_profiles IS 'Profils utilisateurs avec rôles et permissions';
COMMENT ON TABLE role_permissions IS 'Permissions par rôle pour contrôle d''accès';
COMMENT ON TABLE user_sessions IS 'Historique des sessions utilisateurs';
COMMENT ON TABLE activity_logs IS 'Journal d''activité des utilisateurs';

-- Afficher un message
DO $$
BEGIN
    RAISE NOTICE '✅ Système d''authentification créé avec succès !';
    RAISE NOTICE '📋 Rôles disponibles: admin, directeur_general, directeur_commercial, commercial';
    RAISE NOTICE '🔐 Créez votre premier utilisateur via Supabase Auth Dashboard';
END $$;

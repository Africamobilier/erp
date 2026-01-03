-- =============================================
-- AFRICA MOBILIER ERP - SCRIPT SQL SUPABASE
-- =============================================
-- Ce script crée l'ensemble de la base de données
-- pour l'ERP Africa Mobilier
--
-- À exécuter dans : Supabase > SQL Editor > New Query
-- =============================================

-- NETTOYAGE (optionnel - décommenter si besoin)
-- DROP TABLE IF EXISTS paiements CASCADE;
-- DROP TABLE IF EXISTS lignes_facture CASCADE;
-- DROP TABLE IF EXISTS factures CASCADE;
-- DROP TABLE IF EXISTS lignes_bl CASCADE;
-- DROP TABLE IF EXISTS bons_livraison CASCADE;
-- DROP TABLE IF EXISTS lignes_commande CASCADE;
-- DROP TABLE IF EXISTS commandes CASCADE;
-- DROP TABLE IF EXISTS lignes_devis CASCADE;
-- DROP TABLE IF EXISTS devis CASCADE;
-- DROP TABLE IF EXISTS produits CASCADE;
-- DROP TABLE IF EXISTS clients CASCADE;
-- DROP TABLE IF EXISTS woocommerce_config CASCADE;
-- DROP TABLE IF EXISTS sync_logs CASCADE;

-- =============================================
-- TABLES PRINCIPALES
-- =============================================

-- Table Clients/Prospects
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_client VARCHAR(20) UNIQUE,
    type VARCHAR(20) CHECK (type IN ('prospect', 'client')),
    raison_sociale VARCHAR(255) NOT NULL,
    nom_contact VARCHAR(255),
    email VARCHAR(255),
    telephone VARCHAR(50),
    mobile VARCHAR(50),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    ice VARCHAR(50),
    rc VARCHAR(50),
    patente VARCHAR(50),
    source VARCHAR(50) CHECK (source IN ('woocommerce', 'manuel', 'telephone', 'visite', 'email')),
    woocommerce_id INTEGER,
    date_creation TIMESTAMP DEFAULT NOW(),
    date_derniere_commande TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'actif',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table Produits
CREATE TABLE IF NOT EXISTS produits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_produit VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(255) NOT NULL,
    description TEXT,
    categorie VARCHAR(100),
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    unite VARCHAR(20) DEFAULT 'unité',
    stock_disponible INTEGER DEFAULT 0,
    stock_alerte INTEGER DEFAULT 10,
    woocommerce_id INTEGER,
    image_url TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table Devis
CREATE TABLE IF NOT EXISTS devis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_devis VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id),
    date_devis DATE NOT NULL DEFAULT CURRENT_DATE,
    date_validite DATE,
    statut VARCHAR(20) CHECK (statut IN ('brouillon', 'envoyé', 'accepté', 'refusé', 'expiré')) DEFAULT 'brouillon',
    montant_ht DECIMAL(12,2) DEFAULT 0,
    montant_tva DECIMAL(12,2) DEFAULT 0,
    montant_ttc DECIMAL(12,2) DEFAULT 0,
    taux_remise DECIMAL(5,2) DEFAULT 0,
    remise_montant DECIMAL(12,2) DEFAULT 0,
    conditions_paiement TEXT,
    delai_livraison VARCHAR(100),
    notes TEXT,
    woocommerce_quote_id INTEGER,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table Lignes de Devis
CREATE TABLE IF NOT EXISTS lignes_devis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID REFERENCES devis(id) ON DELETE CASCADE,
    produit_id UUID REFERENCES produits(id),
    designation VARCHAR(255) NOT NULL,
    quantite DECIMAL(10,2) NOT NULL,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    remise_pourcentage DECIMAL(5,2) DEFAULT 0,
    montant_ht DECIMAL(12,2) NOT NULL,
    tva_pourcentage DECIMAL(5,2) DEFAULT 20,
    montant_tva DECIMAL(12,2) NOT NULL,
    montant_ttc DECIMAL(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table Commandes
CREATE TABLE IF NOT EXISTS commandes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    devis_id UUID REFERENCES devis(id),
    client_id UUID REFERENCES clients(id),
    date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
    date_livraison_prevue DATE,
    statut VARCHAR(30) CHECK (statut IN ('en_attente', 'confirmée', 'en_production', 'prête', 'livrée', 'annulée')) DEFAULT 'en_attente',
    montant_ht DECIMAL(12,2) DEFAULT 0,
    montant_tva DECIMAL(12,2) DEFAULT 0,
    montant_ttc DECIMAL(12,2) DEFAULT 0,
    acompte_recu DECIMAL(12,2) DEFAULT 0,
    solde_restant DECIMAL(12,2) DEFAULT 0,
    mode_paiement VARCHAR(50),
    notes TEXT,
    woocommerce_order_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table Lignes de Commande
CREATE TABLE IF NOT EXISTS lignes_commande (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
    produit_id UUID REFERENCES produits(id),
    designation VARCHAR(255) NOT NULL,
    quantite DECIMAL(10,2) NOT NULL,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    montant_ht DECIMAL(12,2) NOT NULL,
    tva_pourcentage DECIMAL(5,2) DEFAULT 20,
    montant_tva DECIMAL(12,2) NOT NULL,
    montant_ttc DECIMAL(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table Bons de Livraison
CREATE TABLE IF NOT EXISTS bons_livraison (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_bl VARCHAR(50) UNIQUE NOT NULL,
    commande_id UUID REFERENCES commandes(id),
    client_id UUID REFERENCES clients(id),
    date_livraison DATE NOT NULL DEFAULT CURRENT_DATE,
    adresse_livraison TEXT,
    statut VARCHAR(20) CHECK (statut IN ('préparé', 'expédié', 'livré', 'retourné')) DEFAULT 'préparé',
    transporteur VARCHAR(100),
    numero_tracking VARCHAR(100),
    notes TEXT,
    livreur VARCHAR(100),
    signature_client TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table Lignes BL
CREATE TABLE IF NOT EXISTS lignes_bl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bl_id UUID REFERENCES bons_livraison(id) ON DELETE CASCADE,
    produit_id UUID REFERENCES produits(id),
    designation VARCHAR(255) NOT NULL,
    quantite_commandee DECIMAL(10,2) NOT NULL,
    quantite_livree DECIMAL(10,2) NOT NULL,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table Factures
CREATE TABLE IF NOT EXISTS factures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    commande_id UUID REFERENCES commandes(id),
    bl_id UUID REFERENCES bons_livraison(id),
    client_id UUID REFERENCES clients(id),
    date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    statut VARCHAR(30) CHECK (statut IN ('brouillon', 'émise', 'payée', 'partiellement_payée', 'en_retard', 'annulée')) DEFAULT 'brouillon',
    montant_ht DECIMAL(12,2) DEFAULT 0,
    montant_tva DECIMAL(12,2) DEFAULT 0,
    montant_ttc DECIMAL(12,2) DEFAULT 0,
    montant_paye DECIMAL(12,2) DEFAULT 0,
    solde_restant DECIMAL(12,2) DEFAULT 0,
    mode_paiement VARCHAR(50),
    conditions_paiement TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table Lignes Facture
CREATE TABLE IF NOT EXISTS lignes_facture (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facture_id UUID REFERENCES factures(id) ON DELETE CASCADE,
    produit_id UUID REFERENCES produits(id),
    designation VARCHAR(255) NOT NULL,
    quantite DECIMAL(10,2) NOT NULL,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    montant_ht DECIMAL(12,2) NOT NULL,
    tva_pourcentage DECIMAL(5,2) DEFAULT 20,
    montant_tva DECIMAL(12,2) NOT NULL,
    montant_ttc DECIMAL(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table Paiements
CREATE TABLE IF NOT EXISTS paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facture_id UUID REFERENCES factures(id),
    client_id UUID REFERENCES clients(id),
    date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
    montant DECIMAL(12,2) NOT NULL,
    mode_paiement VARCHAR(50) NOT NULL,
    reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table Configuration WooCommerce
CREATE TABLE IF NOT EXISTS woocommerce_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_url VARCHAR(255) NOT NULL,
    consumer_key TEXT NOT NULL,
    consumer_secret TEXT NOT NULL,
    actif BOOLEAN DEFAULT true,
    derniere_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table Logs Synchronisation
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_sync VARCHAR(50),
    statut VARCHAR(20),
    message TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- VUES POUR ANALYTICS
-- =============================================

-- Vue CA Hebdomadaire
CREATE OR REPLACE VIEW ca_hebdomadaire AS
SELECT 
    DATE_TRUNC('week', date_facture) as semaine,
    COUNT(*) as nombre_factures,
    SUM(montant_ht) as ca_ht,
    SUM(montant_ttc) as ca_ttc,
    SUM(montant_paye) as encaissements
FROM factures
WHERE statut IN ('émise', 'payée', 'partiellement_payée')
GROUP BY DATE_TRUNC('week', date_facture)
ORDER BY semaine DESC;

-- Vue CA Mensuel
CREATE OR REPLACE VIEW ca_mensuel AS
SELECT 
    DATE_TRUNC('month', date_facture) as mois,
    COUNT(*) as nombre_factures,
    SUM(montant_ht) as ca_ht,
    SUM(montant_ttc) as ca_ttc,
    SUM(montant_paye) as encaissements,
    SUM(solde_restant) as impayes
FROM factures
WHERE statut IN ('émise', 'payée', 'partiellement_payée')
GROUP BY DATE_TRUNC('month', date_facture)
ORDER BY mois DESC;

-- Vue CA Annuel
CREATE OR REPLACE VIEW ca_annuel AS
SELECT 
    DATE_TRUNC('year', date_facture) as annee,
    COUNT(*) as nombre_factures,
    SUM(montant_ht) as ca_ht,
    SUM(montant_ttc) as ca_ttc,
    SUM(montant_paye) as encaissements,
    SUM(solde_restant) as impayes
FROM factures
WHERE statut IN ('émise', 'payée', 'partiellement_payée')
GROUP BY DATE_TRUNC('year', date_facture)
ORDER BY annee DESC;

-- Vue Produits les Plus Vendus
CREATE OR REPLACE VIEW produits_top_ventes AS
SELECT 
    p.id,
    p.code_produit,
    p.designation,
    p.categorie,
    COALESCE(SUM(lf.quantite), 0) as quantite_totale,
    COALESCE(SUM(lf.montant_ttc), 0) as ca_total,
    COUNT(DISTINCT f.id) as nombre_factures,
    CASE 
        WHEN COUNT(lf.id) > 0 THEN AVG(lf.prix_unitaire_ht)
        ELSE 0
    END as prix_moyen
FROM produits p
LEFT JOIN lignes_facture lf ON p.id = lf.produit_id
LEFT JOIN factures f ON lf.facture_id = f.id AND f.statut IN ('émise', 'payée', 'partiellement_payée')
GROUP BY p.id, p.code_produit, p.designation, p.categorie
ORDER BY quantite_totale DESC;

-- Vue Produits les Moins Vendus
CREATE OR REPLACE VIEW produits_faibles_ventes AS
SELECT 
    p.id,
    p.code_produit,
    p.designation,
    p.categorie,
    COALESCE(SUM(lf.quantite), 0) as quantite_totale,
    COALESCE(SUM(lf.montant_ttc), 0) as ca_total,
    COUNT(DISTINCT f.id) as nombre_factures
FROM produits p
LEFT JOIN lignes_facture lf ON p.id = lf.produit_id
LEFT JOIN factures f ON lf.facture_id = f.id AND f.statut IN ('émise', 'payée', 'partiellement_payée')
WHERE p.actif = true
GROUP BY p.id, p.code_produit, p.designation, p.categorie
ORDER BY quantite_totale ASC, ca_total ASC;

-- =============================================
-- FONCTIONS ET TRIGGERS
-- =============================================

-- Séquence pour les codes clients
CREATE SEQUENCE IF NOT EXISTS client_sequence START 1;

-- Fonction pour générer les numéros automatiques
CREATE OR REPLACE FUNCTION generer_numero_document(prefix VARCHAR, table_name VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    dernier_numero INTEGER;
    annee_courante VARCHAR;
    nouveau_numero VARCHAR;
BEGIN
    annee_courante := TO_CHAR(CURRENT_DATE, 'YY');
    
    EXECUTE format('SELECT COALESCE(MAX(CAST(SUBSTRING(numero_%s FROM ''[0-9]+$'') AS INTEGER)), 0) FROM %I WHERE numero_%s LIKE %L',
                   LOWER(REPLACE(prefix, '-', '_')), table_name, LOWER(REPLACE(prefix, '-', '_')), prefix || annee_courante || '%')
    INTO dernier_numero;
    
    nouveau_numero := prefix || annee_courante || LPAD((dernier_numero + 1)::TEXT, 4, '0');
    
    RETURN nouveau_numero;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour code client automatique
CREATE OR REPLACE FUNCTION before_insert_client()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code_client IS NULL OR NEW.code_client = '' THEN
        NEW.code_client := 'CL-' || LPAD(NEXTVAL('client_sequence')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_code_client ON clients;
CREATE TRIGGER trigger_code_client
BEFORE INSERT ON clients
FOR EACH ROW EXECUTE FUNCTION before_insert_client();

-- Trigger pour numéro devis automatique
CREATE OR REPLACE FUNCTION before_insert_devis()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_devis IS NULL OR NEW.numero_devis = '' THEN
        NEW.numero_devis := generer_numero_document('DEV-', 'devis');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_numero_devis ON devis;
CREATE TRIGGER trigger_numero_devis
BEFORE INSERT ON devis
FOR EACH ROW EXECUTE FUNCTION before_insert_devis();

-- Trigger pour numéro commande automatique
CREATE OR REPLACE FUNCTION before_insert_commande()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_commande IS NULL OR NEW.numero_commande = '' THEN
        NEW.numero_commande := generer_numero_document('CMD-', 'commandes');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_numero_commande ON commandes;
CREATE TRIGGER trigger_numero_commande
BEFORE INSERT ON commandes
FOR EACH ROW EXECUTE FUNCTION before_insert_commande();

-- Trigger pour numéro BL automatique
CREATE OR REPLACE FUNCTION before_insert_bl()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_bl IS NULL OR NEW.numero_bl = '' THEN
        NEW.numero_bl := generer_numero_document('BL-', 'bons_livraison');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_numero_bl ON bons_livraison;
CREATE TRIGGER trigger_numero_bl
BEFORE INSERT ON bons_livraison
FOR EACH ROW EXECUTE FUNCTION before_insert_bl();

-- Trigger pour numéro facture automatique
CREATE OR REPLACE FUNCTION before_insert_facture()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_facture IS NULL OR NEW.numero_facture = '' THEN
        NEW.numero_facture := generer_numero_document('FACT-', 'factures');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_numero_facture ON factures;
CREATE TRIGGER trigger_numero_facture
BEFORE INSERT ON factures
FOR EACH ROW EXECUTE FUNCTION before_insert_facture();

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_devis_updated_at ON devis;
CREATE TRIGGER update_devis_updated_at BEFORE UPDATE ON devis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commandes_updated_at ON commandes;
CREATE TRIGGER update_commandes_updated_at BEFORE UPDATE ON commandes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_factures_updated_at ON factures;
CREATE TRIGGER update_factures_updated_at BEFORE UPDATE ON factures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEX POUR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
CREATE INDEX IF NOT EXISTS idx_clients_woocommerce ON clients(woocommerce_id);
CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(client_id);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_date ON devis(date_devis);
CREATE INDEX IF NOT EXISTS idx_commandes_client ON commandes(client_id);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes(statut);
CREATE INDEX IF NOT EXISTS idx_factures_client ON factures(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date_facture);
CREATE INDEX IF NOT EXISTS idx_produits_code ON produits(code_produit);
CREATE INDEX IF NOT EXISTS idx_produits_woocommerce ON produits(woocommerce_id);

-- =============================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =============================================

-- Insérer quelques produits de test
INSERT INTO produits (code_produit, designation, categorie, prix_unitaire_ht, stock_disponible) VALUES
('CHAISE-001', 'Chaise de bureau ergonomique', 'Mobilier Bureau', 850.00, 25),
('BUREAU-001', 'Bureau directeur en bois', 'Mobilier Bureau', 3500.00, 10),
('ARMOIRE-001', 'Armoire métallique 2 portes', 'Rangement', 1200.00, 15),
('FAUTEUIL-001', 'Fauteuil direction cuir', 'Mobilier Bureau', 2800.00, 8)
ON CONFLICT (code_produit) DO NOTHING;

-- Insérer un client de test
INSERT INTO clients (raison_sociale, type, nom_contact, email, telephone, ville, source) VALUES
('Entreprise Test SARL', 'client', 'Mohammed Test', 'contact@test.ma', '+212 5 22 00 00 00', 'Casablanca', 'manuel')
ON CONFLICT DO NOTHING;

-- =============================================
-- FIN DU SCRIPT
-- =============================================

-- Afficher un message de succès
DO $$
BEGIN
    RAISE NOTICE '✅ Base de données Africa Mobilier ERP créée avec succès !';
    RAISE NOTICE '📊 Tables créées: 13';
    RAISE NOTICE '📈 Vues créées: 5';
    RAISE NOTICE '⚙️ Triggers créés: 6';
    RAISE NOTICE '🚀 Vous pouvez maintenant utiliser l''ERP';
END $$;

// Types pour l'ERP Maghreb Office

export type StatutProspect = 'prospect' | 'client';
export type SourceProspect = 'woocommerce' | 'manuel' | 'telephone' | 'visite' | 'email';

export interface Client {
  id: string;
  code_client: string;
  type: StatutProspect;
  raison_sociale: string;
  nom_contact?: string;
  email?: string;
  telephone?: string;
  mobile?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  ice?: string;
  rc?: string;
  patente?: string;
  source: SourceProspect;
  woocommerce_id?: number;
  date_creation: string;
  date_derniere_commande?: string;
  statut: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Produit {
  id: string;
  code_produit: string;
  designation: string;
  description?: string;
  categorie?: string;
  prix_unitaire_ht: number;
  unite: string;
  stock_disponible: number;
  stock_alerte: number;
  woocommerce_id?: number;
  image_url?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export type StatutDevis = 'brouillon' | 'envoyé' | 'accepté' | 'refusé' | 'expiré';

export interface Devis {
  id: string;
  numero_devis: string;
  client_id: string;
  client?: Client;
  date_devis: string;
  date_validite?: string;
  statut: StatutDevis;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  taux_remise: number;
  remise_montant: number;
  conditions_paiement?: string;
  delai_livraison?: string;
  notes?: string;
  woocommerce_quote_id?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  lignes?: LigneDevis[];
}

export interface LigneDevis {
  id: string;
  devis_id: string;
  produit_id?: string;
  produit?: Produit;
  designation: string;
  quantite: number;
  prix_unitaire_ht: number;
  remise_pourcentage: number;
  montant_ht: number;
  tva_pourcentage: number;
  montant_tva: number;
  montant_ttc: number;
  ordre: number;
  created_at: string;
}

export type StatutCommande = 'en_attente' | 'confirmée' | 'en_production' | 'prête' | 'livrée' | 'annulée';

export interface Commande {
  id: string;
  numero_commande: string;
  devis_id?: string;
  devis?: Devis;
  client_id: string;
  client?: Client;
  date_commande: string;
  date_livraison_prevue?: string;
  statut: StatutCommande;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  acompte_recu: number;
  solde_restant: number;
  mode_paiement?: string;
  notes?: string;
  woocommerce_order_id?: number;
  created_at: string;
  updated_at: string;
  lignes?: LigneCommande[];
}

export interface LigneCommande {
  id: string;
  commande_id: string;
  produit_id?: string;
  produit?: Produit;
  designation: string;
  quantite: number;
  prix_unitaire_ht: number;
  montant_ht: number;
  tva_pourcentage: number;
  montant_tva: number;
  montant_ttc: number;
  ordre: number;
  created_at: string;
}

export type StatutBL = 'préparé' | 'expédié' | 'livré' | 'retourné';

export interface BonLivraison {
  id: string;
  numero_bl: string;
  commande_id?: string;
  commande?: Commande;
  client_id: string;
  client?: Client;
  date_livraison: string;
  adresse_livraison?: string;
  statut: StatutBL;
  transporteur?: string;
  numero_tracking?: string;
  notes?: string;
  livreur?: string;
  signature_client?: string;
  created_at: string;
  updated_at: string;
  lignes?: LigneBL[];
}

export interface LigneBL {
  id: string;
  bl_id: string;
  produit_id?: string;
  produit?: Produit;
  designation: string;
  quantite_commandee: number;
  quantite_livree: number;
  ordre: number;
  created_at: string;
}

export type StatutFacture = 'brouillon' | 'émise' | 'payée' | 'partiellement_payée' | 'en_retard' | 'annulée';

export interface Facture {
  id: string;
  numero_facture: string;
  commande_id?: string;
  commande?: Commande;
  bl_id?: string;
  bl?: BonLivraison;
  client_id: string;
  client?: Client;
  date_facture: string;
  date_echeance?: string;
  statut: StatutFacture;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  montant_paye: number;
  solde_restant: number;
  mode_paiement?: string;
  conditions_paiement?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  lignes?: LigneFacture[];
}

export interface LigneFacture {
  id: string;
  facture_id: string;
  produit_id?: string;
  produit?: Produit;
  designation: string;
  quantite: number;
  prix_unitaire_ht: number;
  montant_ht: number;
  tva_pourcentage: number;
  montant_tva: number;
  montant_ttc: number;
  ordre: number;
  created_at: string;
}

export interface Paiement {
  id: string;
  facture_id?: string;
  facture?: Facture;
  client_id: string;
  client?: Client;
  date_paiement: string;
  montant: number;
  mode_paiement: string;
  reference?: string;
  notes?: string;
  created_at: string;
}

export interface WooCommerceConfig {
  id: string;
  site_url: string;
  consumer_key: string;
  consumer_secret: string;
  actif: boolean;
  derniere_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  type_sync?: string;
  statut?: string;
  message?: string;
  details?: any;
  created_at: string;
}

// Types pour les vues analytics
export interface CAHebdomadaire {
  semaine: string;
  nombre_factures: number;
  ca_ht: number;
  ca_ttc: number;
  encaissements: number;
}

export interface CAMensuel {
  mois: string;
  nombre_factures: number;
  ca_ht: number;
  ca_ttc: number;
  encaissements: number;
  impayes: number;
}

export interface CAAnnuel {
  annee: string;
  nombre_factures: number;
  ca_ht: number;
  ca_ttc: number;
  encaissements: number;
  impayes: number;
}

export interface ProduitVentes {
  id: string;
  code_produit: string;
  designation: string;
  categorie?: string;
  quantite_totale: number;
  ca_total: number;
  nombre_factures: number;
  prix_moyen?: number;
}

// Types pour WooCommerce
export interface WooCommerceCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    postcode: string;
    country: string;
  };
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string; // 'simple' | 'variable' | 'grouped' | 'external'
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  sku: string;
  stock_quantity: number;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    name: string;
  }>;
}

export interface WooCommerceOrder {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
  date_created: string;
  total: string;
  subtotal: string;
  total_tax: string;
  customer_id: number;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    variation_id: number; // ID de la variation si c'est un produit variable
    quantity: number;
    subtotal: string;
    total: string;
    price: number;
  }>;
  meta_data?: Array<{
    id: number;
    key: string;
    value: any;
  }>;
  payment_method?: string;
  payment_method_title?: string;
}

export interface DashboardStats {
  ca_aujourd_hui: number;
  ca_mois: number;
  ca_annee: number;
  nb_devis_en_attente: number;
  nb_commandes_en_cours: number;
  nb_factures_impayees: number;
  montant_impayes: number;
  nb_prospects: number;
  nb_clients: number;
  taux_conversion: number;
}

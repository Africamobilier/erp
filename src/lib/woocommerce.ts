import { supabase } from './supabase';
import type { 
  WooCommerceConfig, 
  WooCommerceCustomer, 
  WooCommerceProduct, 
  WooCommerceOrder,
  Client,
  Produit 
} from '@/types';

export class WooCommerceService {
  private config: WooCommerceConfig | null = null;

  async getConfig(): Promise<WooCommerceConfig | null> {
    const { data, error } = await supabase
      .from('woocommerce_config')
      .select('*')
      .eq('actif', true)
      .single();

    if (error) {
      console.error('Erreur chargement config WooCommerce:', error);
      return null;
    }

    this.config = data;
    return data;
  }

  async saveConfig(config: Omit<WooCommerceConfig, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const { error } = await supabase
      .from('woocommerce_config')
      .upsert({
        ...config,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erreur sauvegarde config WooCommerce:', error);
      return false;
    }

    return true;
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) {
      await this.getConfig();
    }

    if (!this.config) {
      return false;
    }

    try {
      const response = await this.makeRequest('/wp-json/wc/v3/system_status');
      return response.ok;
    } catch (error) {
      console.error('Erreur test connexion WooCommerce:', error);
      return false;
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.config) {
      throw new Error('Configuration WooCommerce non disponible');
    }

    const url = `${this.config.site_url}${endpoint}`;
    const auth = btoa(`${this.config.consumer_key}:${this.config.consumer_secret}`);

    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  async syncCustomers(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await this.makeRequest('/wp-json/wc/v3/customers?per_page=100');
      const customers: WooCommerceCustomer[] = await response.json();

      let synced = 0;

      for (const customer of customers) {
        const clientData: Partial<Client> = {
          raison_sociale: customer.billing.company || `${customer.first_name} ${customer.last_name}`,
          nom_contact: `${customer.first_name} ${customer.last_name}`,
          email: customer.email,
          telephone: customer.billing.phone,
          adresse: `${customer.billing.address_1} ${customer.billing.address_2}`.trim(),
          ville: customer.billing.city,
          code_postal: customer.billing.postcode,
          source: 'woocommerce',
          woocommerce_id: customer.id,
          type: 'prospect',
        };

        // Vérifier si le client existe déjà
        const { data: existing } = await supabase
          .from('clients')
          .select('id')
          .eq('woocommerce_id', customer.id)
          .single();

        if (existing) {
          // Mise à jour
          await supabase
            .from('clients')
            .update(clientData)
            .eq('id', existing.id);
        } else {
          // Création
          await supabase
            .from('clients')
            .insert(clientData);
        }

        synced++;
      }

      await this.logSync('customers', 'success', `${synced} clients synchronisés`);

      return { success: true, count: synced };
    } catch (error) {
      console.error('Erreur sync customers:', error);
      await this.logSync('customers', 'error', (error as Error).message);
      return { success: false, count: 0 };
    }
  }

  async syncProducts(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await this.makeRequest('/wp-json/wc/v3/products?per_page=100');
      const products: WooCommerceProduct[] = await response.json();

      let synced = 0;

      for (const product of products) {
        // Calculer le prix HT (WooCommerce donne le prix TTC)
        const prixTTC = parseFloat(product.price || product.regular_price || '0');
        const prixHT = prixTTC > 0 ? prixTTC / 1.20 : 0;

        const produitData: Partial<Produit> = {
          code_produit: product.sku || `WC-${product.id}`,
          designation: product.name,
          description: product.description,
          categorie: product.categories[0]?.name,
          prix_unitaire_ht: prixHT,
          stock_disponible: product.stock_quantity || 0,
          woocommerce_id: product.id,
          image_url: product.images[0]?.src,
          actif: true,
        };

        // Vérifier si le produit existe déjà
        const { data: existing, error: existingError } = await supabase
          .from('produits')
          .select('id')
          .eq('woocommerce_id', product.id)
          .maybeSingle(); // ← Utiliser maybeSingle() au lieu de single()

        if (existing) {
          // Mise à jour
          await supabase
            .from('produits')
            .update(produitData)
            .eq('id', existing.id);
        } else {
          // Création
          await supabase
            .from('produits')
            .insert(produitData);
        }

        synced++;
      }

      await this.logSync('products', 'success', `${synced} produits synchronisés`);

      return { success: true, count: synced };
    } catch (error) {
      console.error('Erreur sync products:', error);
      await this.logSync('products', 'error', (error as Error).message);
      return { success: false, count: 0 };
    }
  }

  async syncOrders(): Promise<{ success: boolean; count: number }> {
    try {
      // Synchroniser les commandes en attente ET les demandes de devis
      const statuses = ['pending', 'quote-requested', 'on-hold'];
      let synced = 0;

      for (const status of statuses) {
        try {
          const response = await this.makeRequest(`/wp-json/wc/v3/orders?per_page=100&status=${status}`);
          const orders: WooCommerceOrder[] = await response.json();

          for (const order of orders) {
            // Vérifier si ce devis n'a pas déjà été importé
            const { data: existingDevis } = await supabase
              .from('devis')
              .select('id')
              .eq('woocommerce_quote_id', order.id)
              .single();

            if (existingDevis) {
              console.log(`Devis WC #${order.id} déjà importé, ignoré`);
              continue;
            }

            // Trouver ou créer le client
            let { data: client } = await supabase
              .from('clients')
              .select('id')
              .eq('woocommerce_id', order.customer_id)
              .single();

            if (!client && order.customer_id > 0) {
              // Créer le client s'il n'existe pas
              const { data: newClient } = await supabase
                .from('clients')
                .insert({
                  raison_sociale: order.billing.company || `${order.billing.first_name} ${order.billing.last_name}`,
                  nom_contact: `${order.billing.first_name} ${order.billing.last_name}`,
                  email: order.billing.email,
                  telephone: order.billing.phone,
                  adresse: `${order.billing.address_1} ${order.billing.address_2}`.trim(),
                  ville: order.billing.city,
                  code_postal: order.billing.postcode,
                  source: 'woocommerce',
                  woocommerce_id: order.customer_id,
                  type: 'prospect',
                })
                .select()
                .single();

              client = newClient;
            }

            // Si pas de customer_id (commande invité), créer un client temporaire
            if (!client) {
              const { data: newClient } = await supabase
                .from('clients')
                .insert({
                  raison_sociale: order.billing.company || `${order.billing.first_name} ${order.billing.last_name}`,
                  nom_contact: `${order.billing.first_name} ${order.billing.last_name}`,
                  email: order.billing.email,
                  telephone: order.billing.phone,
                  adresse: `${order.billing.address_1} ${order.billing.address_2}`.trim(),
                  ville: order.billing.city,
                  code_postal: order.billing.postcode,
                  source: 'woocommerce',
                  type: 'prospect',
                  notes: `Client invité WooCommerce - Commande #${order.id}`,
                })
                .select()
                .single();

              client = newClient;
            }

            if (!client) continue;

            // Créer le devis à partir de la commande/demande WooCommerce
            const montantHT = parseFloat(order.total) / 1.20; // Convertir TTC en HT
            const montantTVA = parseFloat(order.total) - montantHT;

            // Déterminer le statut du devis selon le statut WooCommerce
            let statutDevis: 'brouillon' | 'envoyé' | 'accepté' = 'envoyé';
            if (status === 'quote-requested') {
              statutDevis = 'envoyé'; // Demande de devis = devis envoyé au client
            } else if (status === 'pending') {
              statutDevis = 'envoyé'; // En attente de paiement = devis envoyé
            }

            const { data: devis, error: devisError } = await supabase
              .from('devis')
              .insert({
                client_id: client.id,
                date_devis: order.date_created.split('T')[0],
                date_validite: new Date(new Date(order.date_created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
                statut: statutDevis,
                montant_ht: montantHT,
                montant_tva: montantTVA,
                montant_ttc: parseFloat(order.total),
                woocommerce_quote_id: order.id,
                notes: `Importé depuis WooCommerce - ${status === 'quote-requested' ? 'Demande de devis' : 'Commande'} #${order.id}\nStatut WC: ${order.status}`,
                conditions_paiement: order.payment_method_title || '',
              })
              .select()
              .single();

            if (devisError || !devis) {
              console.error('Erreur création devis:', devisError);
              continue;
            }

            // Ajouter les lignes de devis
            let ordre = 0;
            for (const item of order.line_items) {
              // Trouver le produit
              const { data: produit } = await supabase
                .from('produits')
                .select('id')
                .eq('woocommerce_id', item.product_id)
                .single();

              const prixUnitaireHT = item.price / 1.20;
              const montantHT = parseFloat(item.total) / 1.20;
              const montantTVA = parseFloat(item.total) - montantHT;

              await supabase
                .from('lignes_devis')
                .insert({
                  devis_id: devis.id,
                  produit_id: produit?.id,
                  designation: item.name,
                  quantite: item.quantity,
                  prix_unitaire_ht: prixUnitaireHT,
                  remise_pourcentage: 0,
                  montant_ht: montantHT,
                  tva_pourcentage: 20,
                  montant_tva: montantTVA,
                  montant_ttc: parseFloat(item.total),
                  ordre: ordre++,
                });
            }

            synced++;
          }
        } catch (statusError) {
          console.log(`Pas de commandes avec statut ${status}, continuer...`);
        }
      }

      await this.logSync('orders', 'success', `${synced} demandes de devis/commandes synchronisées`);

      return { success: true, count: synced };
    } catch (error) {
      console.error('Erreur sync orders:', error);
      await this.logSync('orders', 'error', (error as Error).message);
      return { success: false, count: 0 };
    }
  }

  async syncAll(): Promise<{ 
    customers: number; 
    products: number; 
    orders: number; 
  }> {
    const customers = await this.syncCustomers();
    const products = await this.syncProducts();
    const orders = await this.syncOrders();

    // Mettre à jour la date de dernière sync
    if (this.config) {
      await supabase
        .from('woocommerce_config')
        .update({ derniere_sync: new Date().toISOString() })
        .eq('id', this.config.id);
    }

    return {
      customers: customers.count,
      products: products.count,
      orders: orders.count,
    };
  }

  private async logSync(type: string, statut: string, message: string, details?: any) {
    await supabase
      .from('sync_logs')
      .insert({
        type_sync: type,
        statut,
        message,
        details,
      });
  }
}

export const wooCommerceService = new WooCommerceService();

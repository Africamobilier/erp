// ============================================
// FONCTIONS DE CONVERSION DOCUMENTS
// Africa Mobilier ERP
// ============================================

import { supabase } from './supabase';

/**
 * Convertir un Devis en Commande
 */
export async function convertirDevisEnCommande(devisId: string) {
  try {
    // 1. Récupérer le devis avec ses lignes
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select(`
        *,
        client:clients(*),
        lignes:lignes_devis(*)
      `)
      .eq('id', devisId)
      .single();

    if (devisError) throw devisError;
    if (!devis) throw new Error('Devis non trouvé');

    // 2. Vérifier que le devis est accepté
    if (devis.statut !== 'accepté') {
      throw new Error('Seuls les devis acceptés peuvent être convertis en commande');
    }

    // 3. Générer le numéro de commande
    const { data: lastCommande } = await supabase
      .from('commandes')
      .select('numero_commande')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastNumber = lastCommande?.numero_commande 
      ? parseInt(lastCommande.numero_commande.split('-')[1]) 
      : 0;
    const numeroCommande = `CMD-${String(lastNumber + 1).padStart(6, '0')}`;

    // 4. Créer la commande
    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .insert({
        numero_commande: numeroCommande,
        devis_id: devis.id,
        client_id: devis.client_id,
        date_commande: new Date().toISOString(),
        date_livraison_prevue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
        statut: 'en_attente',
        montant_ht: devis.montant_ht,
        montant_tva: devis.montant_tva,
        montant_ttc: devis.montant_ttc,
        conditions_paiement: devis.conditions_paiement,
        notes: devis.notes,
      })
      .select()
      .single();

    if (commandeError) throw commandeError;

    // 5. Créer les lignes de commande
    const lignesCommande = devis.lignes.map((ligne: any) => ({
      commande_id: commande.id,
      produit_id: ligne.produit_id,
      designation: ligne.designation,
      description: ligne.description,
      quantite: ligne.quantite,
      prix_unitaire_ht: ligne.prix_unitaire_ht,
      taux_tva: ligne.taux_tva,
      montant_ht: ligne.montant_ht,
      montant_tva: ligne.montant_tva,
      montant_ttc: ligne.montant_ttc,
      ordre: ligne.ordre,
    }));

    const { error: lignesError } = await supabase
      .from('lignes_commande')
      .insert(lignesCommande);

    if (lignesError) throw lignesError;

    // 6. Mettre à jour le statut du devis
    await supabase
      .from('devis')
      .update({ statut: 'converti' })
      .eq('id', devisId);

    return { success: true, commande };
  } catch (error: any) {
    console.error('Erreur conversion devis:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Convertir une Commande en Bon de Livraison
 */
export async function convertirCommandeEnBL(commandeId: string) {
  try {
    // 1. Récupérer la commande avec ses lignes
    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .select(`
        *,
        client:clients(*),
        lignes:lignes_commande(*)
      `)
      .eq('id', commandeId)
      .single();

    if (commandeError) throw commandeError;
    if (!commande) throw new Error('Commande non trouvée');

    // 2. Vérifier que la commande est confirmée
    if (commande.statut !== 'confirmée' && commande.statut !== 'en_production') {
      throw new Error('Seules les commandes confirmées ou en production peuvent être livrées');
    }

    // 3. Générer le numéro de BL
    const { data: lastBL } = await supabase
      .from('bons_livraison')
      .select('numero_bl')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastNumber = lastBL?.numero_bl 
      ? parseInt(lastBL.numero_bl.split('-')[1]) 
      : 0;
    const numeroBL = `BL-${String(lastNumber + 1).padStart(6, '0')}`;

    // 4. Créer le bon de livraison
    const { data: bl, error: blError } = await supabase
      .from('bons_livraison')
      .insert({
        numero_bl: numeroBL,
        commande_id: commande.id,
        client_id: commande.client_id,
        date_livraison: new Date().toISOString(),
        statut: 'en_attente',
        notes: commande.notes,
      })
      .select()
      .single();

    if (blError) throw blError;

    // 5. Créer les lignes de BL
    const lignesBL = commande.lignes.map((ligne: any) => ({
      bl_id: bl.id,
      produit_id: ligne.produit_id,
      designation: ligne.designation,
      quantite_commandee: ligne.quantite,
      quantite_livree: ligne.quantite, // Par défaut, on livre tout
      ordre: ligne.ordre,
    }));

    const { error: lignesError } = await supabase
      .from('lignes_bl')
      .insert(lignesBL);

    if (lignesError) throw lignesError;

    // 6. Mettre à jour le statut de la commande
    await supabase
      .from('commandes')
      .update({ statut: 'en_livraison' })
      .eq('id', commandeId);

    return { success: true, bl };
  } catch (error: any) {
    console.error('Erreur conversion commande:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Convertir un Bon de Livraison en Facture
 */
export async function convertirBLEnFacture(blId: string) {
  try {
    // 1. Récupérer le BL avec ses lignes et la commande
    const { data: bl, error: blError } = await supabase
      .from('bons_livraison')
      .select(`
        *,
        client:clients(*),
        commande:commandes(*),
        lignes:lignes_bl(*)
      `)
      .eq('id', blId)
      .single();

    if (blError) throw blError;
    if (!bl) throw new Error('Bon de livraison non trouvé');

    // 2. Vérifier que le BL est livré
    if (bl.statut !== 'livré') {
      throw new Error('Seuls les bons de livraison livrés peuvent être facturés');
    }

    // 3. Récupérer les lignes de commande pour les montants
    const { data: lignesCommande } = await supabase
      .from('lignes_commande')
      .select('*')
      .eq('commande_id', bl.commande_id);

    // 4. Générer le numéro de facture
    const { data: lastFacture } = await supabase
      .from('factures')
      .select('numero_facture')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastNumber = lastFacture?.numero_facture 
      ? parseInt(lastFacture.numero_facture.split('-')[1]) 
      : 0;
    const numeroFacture = `FACT-${String(lastNumber + 1).padStart(6, '0')}`;

    // 5. Calculer les montants
    const montantHT = lignesCommande?.reduce((sum, ligne) => sum + (ligne.montant_ht || 0), 0) || 0;
    const montantTVA = lignesCommande?.reduce((sum, ligne) => sum + (ligne.montant_tva || 0), 0) || 0;
    const montantTTC = montantHT + montantTVA;

    // 6. Créer la facture
    const { data: facture, error: factureError } = await supabase
      .from('factures')
      .insert({
        numero_facture: numeroFacture,
        commande_id: bl.commande_id,
        bl_id: bl.id,
        client_id: bl.client_id,
        date_facture: new Date().toISOString(),
        date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
        statut: 'émise',
        montant_ht: montantHT,
        montant_tva: montantTVA,
        montant_ttc: montantTTC,
        conditions_paiement: bl.commande?.conditions_paiement || 'Paiement à 30 jours',
        notes: bl.notes,
      })
      .select()
      .single();

    if (factureError) throw factureError;

    // 7. Créer les lignes de facture
    const lignesFacture = lignesCommande?.map((ligne: any) => ({
      facture_id: facture.id,
      produit_id: ligne.produit_id,
      designation: ligne.designation,
      description: ligne.description,
      quantite: ligne.quantite,
      prix_unitaire_ht: ligne.prix_unitaire_ht,
      taux_tva: ligne.taux_tva,
      montant_ht: ligne.montant_ht,
      montant_tva: ligne.montant_tva,
      montant_ttc: ligne.montant_ttc,
      ordre: ligne.ordre,
    }));

    const { error: lignesError } = await supabase
      .from('lignes_facture')
      .insert(lignesFacture || []);

    if (lignesError) throw lignesError;

    // 8. Mettre à jour le statut du BL
    await supabase
      .from('bons_livraison')
      .update({ statut: 'facturé' })
      .eq('id', blId);

    // 9. Mettre à jour le statut de la commande
    await supabase
      .from('commandes')
      .update({ statut: 'livrée' })
      .eq('id', bl.commande_id);

    return { success: true, facture };
  } catch (error: any) {
    console.error('Erreur conversion BL:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Convertir une Commande directement en Facture (sans BL)
 */
export async function convertirCommandeEnFacture(commandeId: string) {
  try {
    // D'abord créer le BL
    const resultBL = await convertirCommandeEnBL(commandeId);
    if (!resultBL.success) throw new Error(resultBL.error);

    // Marquer le BL comme livré automatiquement
    await supabase
      .from('bons_livraison')
      .update({ statut: 'livré' })
      .eq('id', resultBL.bl.id);

    // Puis créer la facture
    const resultFacture = await convertirBLEnFacture(resultBL.bl.id);
    if (!resultFacture.success) throw new Error(resultFacture.error);

    return { success: true, facture: resultFacture.facture };
  } catch (error: any) {
    console.error('Erreur conversion commande en facture:', error);
    return { success: false, error: error.message };
  }
}

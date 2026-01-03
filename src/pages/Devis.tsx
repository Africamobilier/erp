import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Send, Check, X, ArrowRight } from 'lucide-react';
import { supabase, formatCurrency, formatDate, calculerTVA, calculerTTC } from '@/lib/supabase';
import type { Devis, Client, Produit, LigneDevis, StatutDevis } from '@/types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function DevisPage() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [filteredDevis, setFilteredDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | StatutDevis>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDevis();
  }, []);

  useEffect(() => {
    filterDevis();
  }, [devis, searchTerm, filterStatut]);

  const loadDevis = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('devis')
      .select(`
        *,
        client:clients(*),
        lignes:lignes_devis(*, produit:produits(*))
      `)
      .order('date_devis', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des devis');
      console.error(error);
    } else {
      setDevis(data || []);
    }
    setLoading(false);
  };

  const filterDevis = () => {
    let filtered = devis;

    if (filterStatut !== 'all') {
      filtered = filtered.filter(d => d.statut === filterStatut);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.numero_devis?.toLowerCase().includes(term) ||
        d.client?.raison_sociale?.toLowerCase().includes(term)
      );
    }

    setFilteredDevis(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) return;

    const { error } = await supabase
      .from('devis')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Devis supprimé avec succès');
      loadDevis();
    }
  };

  const handleConvertToCommande = async (devisId: string) => {
    const devisToConvert = devis.find(d => d.id === devisId);
    if (!devisToConvert) return;

    if (!confirm('Convertir ce devis en commande ?')) return;

    try {
      // Créer la commande
      const { data: commande, error: cmdError } = await supabase
        .from('commandes')
        .insert({
          devis_id: devisId,
          client_id: devisToConvert.client_id,
          date_commande: new Date().toISOString().split('T')[0],
          statut: 'confirmée',
          montant_ht: devisToConvert.montant_ht,
          montant_tva: devisToConvert.montant_tva,
          montant_ttc: devisToConvert.montant_ttc,
          solde_restant: devisToConvert.montant_ttc,
        })
        .select()
        .single();

      if (cmdError) throw cmdError;

      // Copier les lignes du devis vers la commande
      if (devisToConvert.lignes) {
        const lignesCommande = devisToConvert.lignes.map(ligne => ({
          commande_id: commande.id,
          produit_id: ligne.produit_id,
          designation: ligne.designation,
          quantite: ligne.quantite,
          prix_unitaire_ht: ligne.prix_unitaire_ht,
          montant_ht: ligne.montant_ht,
          tva_pourcentage: ligne.tva_pourcentage,
          montant_tva: ligne.montant_tva,
          montant_ttc: ligne.montant_ttc,
          ordre: ligne.ordre,
        }));

        const { error: lignesError } = await supabase
          .from('lignes_commande')
          .insert(lignesCommande);

        if (lignesError) throw lignesError;
      }

      // Mettre à jour le statut du devis
      await supabase
        .from('devis')
        .update({ statut: 'accepté' })
        .eq('id', devisId);

      // Convertir le prospect en client
      await supabase
        .from('clients')
        .update({ 
          type: 'client',
          date_derniere_commande: new Date().toISOString()
        })
        .eq('id', devisToConvert.client_id);

      toast.success('Devis converti en commande avec succès');
      loadDevis();
      navigate('/commandes');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la conversion');
    }
  };

  const handleChangeStatut = async (id: string, newStatut: StatutDevis) => {
    const { error } = await supabase
      .from('devis')
      .update({ statut: newStatut })
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors du changement de statut');
    } else {
      toast.success('Statut mis à jour');
      loadDevis();
    }
  };

  const getStatutBadge = (statut: StatutDevis) => {
    const styles = {
      brouillon: 'bg-gray-100 text-gray-800',
      envoyé: 'bg-blue-100 text-blue-800',
      accepté: 'bg-green-100 text-green-800',
      refusé: 'bg-red-100 text-red-800',
      expiré: 'bg-yellow-100 text-yellow-800',
    };
    return styles[statut] || styles.brouillon;
  };

  const statsTotal = devis.length;
  const statsEnvoyes = devis.filter(d => d.statut === 'envoyé').length;
  const statsAcceptes = devis.filter(d => d.statut === 'accepté').length;
  const montantTotal = devis
    .filter(d => d.statut === 'accepté')
    .reduce((sum, d) => sum + d.montant_ttc, 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Devis</h2>
          <p className="text-gray-600 mt-1">Gestion de vos devis commerciaux</p>
        </div>
        <button
          onClick={() => {
            setEditingDevis(null);
            setShowModal(true);
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Devis</span>
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un devis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'brouillon', 'envoyé', 'accepté', 'refusé'].map((statut) => (
              <button
                key={statut}
                onClick={() => setFilterStatut(statut as any)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatut === statut
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {statut === 'all' ? 'Tous' : statut.charAt(0).toUpperCase() + statut.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Devis</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{statsTotal}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">En Attente</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{statsEnvoyes}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Acceptés</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{statsAcceptes}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">CA Accepté</div>
          <div className="text-2xl font-bold text-primary-600 mt-2">{formatCurrency(montantTotal)}</div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant TTC
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredDevis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun devis trouvé
                  </td>
                </tr>
              ) : (
                filteredDevis.map((devisItem) => (
                  <tr key={devisItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {devisItem.numero_devis}
                      </div>
                      <div className="text-xs text-gray-500">
                        {devisItem.lignes?.length || 0} ligne(s)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {devisItem.client?.raison_sociale}
                      </div>
                      <div className="text-xs text-gray-500">
                        {devisItem.client?.code_client}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(devisItem.date_devis)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(devisItem.montant_ttc)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutBadge(devisItem.statut)}`}>
                        {devisItem.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {devisItem.statut === 'envoyé' && (
                          <>
                            <button
                              onClick={() => handleChangeStatut(devisItem.id, 'accepté')}
                              className="text-green-600 hover:text-green-900"
                              title="Accepter"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleChangeStatut(devisItem.id, 'refusé')}
                              className="text-red-600 hover:text-red-900"
                              title="Refuser"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {devisItem.statut === 'accepté' && (
                          <button
                            onClick={() => handleConvertToCommande(devisItem.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Convertir en commande"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingDevis(devisItem);
                            setShowModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {devisItem.statut === 'brouillon' && (
                          <button
                            onClick={() => handleDelete(devisItem.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <DevisModal
          devis={editingDevis}
          onClose={() => {
            setShowModal(false);
            setEditingDevis(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingDevis(null);
            loadDevis();
          }}
        />
      )}
    </div>
  );
}

interface DevisModalProps {
  devis: Devis | null;
  onClose: () => void;
  onSave: () => void;
}

function DevisModal({ devis, onClose, onSave }: DevisModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [formData, setFormData] = useState({
    client_id: devis?.client_id || '',
    date_devis: devis?.date_devis || new Date().toISOString().split('T')[0],
    date_validite: devis?.date_validite || '',
    statut: devis?.statut || 'brouillon' as StatutDevis,
    taux_remise: devis?.taux_remise || 0,
    conditions_paiement: devis?.conditions_paiement || '',
    delai_livraison: devis?.delai_livraison || '',
    notes: devis?.notes || '',
  });

  const [lignes, setLignes] = useState<Array<{
    produit_id: string;
    designation: string;
    quantite: number;
    prix_unitaire_ht: number;
    remise_pourcentage: number;
    tva_pourcentage: number;
  }>>(
    devis?.lignes?.map(l => ({
      produit_id: l.produit_id || '',
      designation: l.designation,
      quantite: l.quantite,
      prix_unitaire_ht: l.prix_unitaire_ht,
      remise_pourcentage: l.remise_pourcentage,
      tva_pourcentage: l.tva_pourcentage,
    })) || []
  );

  useEffect(() => {
    loadClients();
    loadProduits();
  }, []);

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('raison_sociale');
    setClients(data || []);
  };

  const loadProduits = async () => {
    const { data } = await supabase
      .from('produits')
      .select('*')
      .eq('actif', true)
      .order('designation');
    setProduits(data || []);
  };

  const addLigne = () => {
    setLignes([...lignes, {
      produit_id: '',
      designation: '',
      quantite: 1,
      prix_unitaire_ht: 0,
      remise_pourcentage: 0,
      tva_pourcentage: 20,
    }]);
  };

  const removeLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const updateLigne = (index: number, field: string, value: any) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };

    // Si on change le produit, mettre à jour la désignation et le prix
    if (field === 'produit_id' && value) {
      const produit = produits.find(p => p.id === value);
      if (produit) {
        newLignes[index].designation = produit.designation;
        newLignes[index].prix_unitaire_ht = produit.prix_unitaire_ht;
      }
    }

    setLignes(newLignes);
  };

  const calculateTotals = () => {
    let totalHT = 0;
    let totalTVA = 0;

    lignes.forEach(ligne => {
      const montantHT = ligne.quantite * ligne.prix_unitaire_ht * (1 - ligne.remise_pourcentage / 100);
      const montantTVA = calculerTVA(montantHT, ligne.tva_pourcentage);
      
      totalHT += montantHT;
      totalTVA += montantTVA;
    });

    // Appliquer la remise globale
    const remiseGlobale = totalHT * (formData.taux_remise / 100);
    totalHT -= remiseGlobale;
    totalTVA = calculerTVA(totalHT, 20); // Recalculer la TVA après remise

    const totalTTC = totalHT + totalTVA;

    return { totalHT, totalTVA, totalTTC, remiseGlobale };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      toast.error('Veuillez sélectionner un client');
      return;
    }

    if (lignes.length === 0) {
      toast.error('Ajoutez au moins une ligne au devis');
      return;
    }

    const totals = calculateTotals();

    try {
      if (devis) {
        // Mise à jour
        const { error: devisError } = await supabase
          .from('devis')
          .update({
            ...formData,
            montant_ht: totals.totalHT,
            montant_tva: totals.totalTVA,
            montant_ttc: totals.totalTTC,
            remise_montant: totals.remiseGlobale,
          })
          .eq('id', devis.id);

        if (devisError) throw devisError;

        // Supprimer les anciennes lignes
        await supabase
          .from('lignes_devis')
          .delete()
          .eq('devis_id', devis.id);

        // Créer les nouvelles lignes
        const lignesData = lignes.map((ligne, index) => {
          const montantHT = ligne.quantite * ligne.prix_unitaire_ht * (1 - ligne.remise_pourcentage / 100);
          const montantTVA = calculerTVA(montantHT, ligne.tva_pourcentage);
          const montantTTC = montantHT + montantTVA;

          return {
            devis_id: devis.id,
            produit_id: ligne.produit_id || null,
            designation: ligne.designation,
            quantite: ligne.quantite,
            prix_unitaire_ht: ligne.prix_unitaire_ht,
            remise_pourcentage: ligne.remise_pourcentage,
            montant_ht: montantHT,
            tva_pourcentage: ligne.tva_pourcentage,
            montant_tva: montantTVA,
            montant_ttc: montantTTC,
            ordre: index,
          };
        });

        const { error: lignesError } = await supabase
          .from('lignes_devis')
          .insert(lignesData);

        if (lignesError) throw lignesError;

        toast.success('Devis mis à jour avec succès');
      } else {
        // Création
        const { data: newDevis, error: devisError } = await supabase
          .from('devis')
          .insert({
            ...formData,
            montant_ht: totals.totalHT,
            montant_tva: totals.totalTVA,
            montant_ttc: totals.totalTTC,
            remise_montant: totals.remiseGlobale,
          })
          .select()
          .single();

        if (devisError) throw devisError;

        // Créer les lignes
        const lignesData = lignes.map((ligne, index) => {
          const montantHT = ligne.quantite * ligne.prix_unitaire_ht * (1 - ligne.remise_pourcentage / 100);
          const montantTVA = calculerTVA(montantHT, ligne.tva_pourcentage);
          const montantTTC = montantHT + montantTVA;

          return {
            devis_id: newDevis.id,
            produit_id: ligne.produit_id || null,
            designation: ligne.designation,
            quantite: ligne.quantite,
            prix_unitaire_ht: ligne.prix_unitaire_ht,
            remise_pourcentage: ligne.remise_pourcentage,
            montant_ht: montantHT,
            tva_pourcentage: ligne.tva_pourcentage,
            montant_tva: montantTVA,
            montant_ttc: montantTTC,
            ordre: index,
          };
        });

        const { error: lignesError } = await supabase
          .from('lignes_devis')
          .insert(lignesData);

        if (lignesError) throw lignesError;

        toast.success('Devis créé avec succès');
      }

      onSave();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold text-gray-900">
            {devis ? `Modifier le devis ${devis.numero_devis}` : 'Nouveau devis'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.raison_sociale} ({client.code_client})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date du devis *
              </label>
              <input
                type="date"
                value={formData.date_devis}
                onChange={(e) => setFormData({ ...formData, date_devis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de validité
              </label>
              <input
                type="date"
                value={formData.date_validite}
                onChange={(e) => setFormData({ ...formData, date_validite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutDevis })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="brouillon">Brouillon</option>
                <option value="envoyé">Envoyé</option>
                <option value="accepté">Accepté</option>
                <option value="refusé">Refusé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Délai de livraison
              </label>
              <input
                type="text"
                value={formData.delai_livraison}
                onChange={(e) => setFormData({ ...formData, delai_livraison: e.target.value })}
                placeholder="Ex: 2-3 semaines"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remise globale (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.taux_remise}
                onChange={(e) => setFormData({ ...formData, taux_remise: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Lignes du devis */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Lignes du devis</h4>
              <button
                type="button"
                onClick={addLigne}
                className="bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 text-sm flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Produit</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Désignation</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Qté</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Prix HT</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Remise %</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total HT</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lignes.map((ligne, index) => {
                    const montantHT = ligne.quantite * ligne.prix_unitaire_ht * (1 - ligne.remise_pourcentage / 100);
                    return (
                      <tr key={index}>
                        <td className="px-3 py-2">
                          <select
                            value={ligne.produit_id}
                            onChange={(e) => updateLigne(index, 'produit_id', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Sélectionner</option>
                            {produits.map(p => (
                              <option key={p.id} value={p.id}>{p.designation}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={ligne.designation}
                            onChange={(e) => updateLigne(index, 'designation', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            required
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={ligne.quantite}
                            onChange={(e) => updateLigne(index, 'quantite', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            required
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={ligne.prix_unitaire_ht}
                            onChange={(e) => updateLigne(index, 'prix_unitaire_ht', parseFloat(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            required
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={ligne.remise_pourcentage}
                            onChange={(e) => updateLigne(index, 'remise_pourcentage', parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-medium">
                          {formatCurrency(montantHT)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLigne(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 max-w-md ml-auto">
              <div className="text-right text-sm font-medium text-gray-600">Total HT:</div>
              <div className="text-right text-sm font-bold">{formatCurrency(totals.totalHT)}</div>
              
              {formData.taux_remise > 0 && (
                <>
                  <div className="text-right text-sm font-medium text-gray-600">Remise ({formData.taux_remise}%):</div>
                  <div className="text-right text-sm font-bold text-red-600">-{formatCurrency(totals.remiseGlobale)}</div>
                </>
              )}
              
              <div className="text-right text-sm font-medium text-gray-600">TVA (20%):</div>
              <div className="text-right text-sm font-bold">{formatCurrency(totals.totalTVA)}</div>
              
              <div className="text-right text-lg font-medium text-gray-900 border-t pt-2">Total TTC:</div>
              <div className="text-right text-lg font-bold text-primary-600 border-t pt-2">
                {formatCurrency(totals.totalTTC)}
              </div>
            </div>
          </div>

          {/* Notes et conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conditions de paiement
              </label>
              <textarea
                value={formData.conditions_paiement}
                onChange={(e) => setFormData({ ...formData, conditions_paiement: e.target.value })}
                rows={3}
                placeholder="Ex: 30% à la commande, solde à la livraison"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {devis ? 'Mettre à jour' : 'Créer le devis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Search, Truck, FileText } from 'lucide-react';
import { supabase, formatDate } from '@/lib/supabase';
import type { BonLivraison, StatutBL } from '@/types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function BonsLivraison() {
  const [bls, setBls] = useState<BonLivraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<'all' | StatutBL>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadBls();
  }, []);

  const loadBls = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bons_livraison')
      .select(`
        *,
        client:clients(*),
        commande:commandes(*),
        lignes:lignes_bl(*, produit:produits(*))
      `)
      .order('date_livraison', { ascending: false });

    if (!error) setBls(data || []);
    setLoading(false);
  };

  const handleChangeStatut = async (id: string, newStatut: StatutBL) => {
    const { error } = await supabase
      .from('bons_livraison')
      .update({ statut: newStatut })
      .eq('id', id);

    if (!error) {
      toast.success('Statut mis à jour');
      loadBls();
    }
  };

  const handleCreateFacture = async (blId: string) => {
    const bl = bls.find(b => b.id === blId);
    if (!bl || !bl.commande) return;

    const { data: facture, error } = await supabase
      .from('factures')
      .insert({
        commande_id: bl.commande_id,
        bl_id: blId,
        client_id: bl.client_id,
        statut: 'émise',
        montant_ht: bl.commande.montant_ht,
        montant_tva: bl.commande.montant_tva,
        montant_ttc: bl.commande.montant_ttc,
        solde_restant: bl.commande.montant_ttc,
        date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      toast.error('Erreur lors de la création de la facture');
      return;
    }

    // Copier les lignes
    if (bl.lignes) {
      const lignesFacture = bl.lignes.map(ligne => ({
        facture_id: facture.id,
        produit_id: ligne.produit_id,
        designation: ligne.designation,
        quantite: ligne.quantite_livree,
        prix_unitaire_ht: bl.commande?.montant_ht ? bl.commande.montant_ht / bl.lignes!.reduce((sum, l) => sum + l.quantite_livree, 0) : 0,
        montant_ht: bl.commande?.montant_ht || 0,
        tva_pourcentage: 20,
        montant_tva: bl.commande?.montant_tva || 0,
        montant_ttc: bl.commande?.montant_ttc || 0,
      }));

      await supabase.from('lignes_facture').insert(lignesFacture);
    }

    toast.success('Facture créée avec succès');
    navigate('/factures');
  };

  const getStatutColor = (statut: StatutBL) => {
    const colors = {
      'préparé': 'bg-yellow-100 text-yellow-800',
      'expédié': 'bg-blue-100 text-blue-800',
      'livré': 'bg-green-100 text-green-800',
      'retourné': 'bg-red-100 text-red-800',
    };
    return colors[statut];
  };

  const filtered = filterStatut === 'all' ? bls : bls.filter(b => b.statut === filterStatut);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Bons de Livraison</h2>
          <p className="text-gray-600 mt-1">Gestion des expéditions et livraisons</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2">
          {['all', 'préparé', 'expédié', 'livré'].map((statut) => (
            <button
              key={statut}
              onClick={() => setFilterStatut(statut as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatut === statut
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {statut === 'all' ? 'Tous' : statut}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total BL</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{bls.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">En Préparation</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">
            {bls.filter(b => b.statut === 'préparé').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Expédiés</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {bls.filter(b => b.statut === 'expédié').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Livrés</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {bls.filter(b => b.statut === 'livré').length}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro BL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Aucun bon de livraison</td></tr>
            ) : (
              filtered.map((bl) => (
                <tr key={bl.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{bl.numero_bl}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{bl.client?.raison_sociale}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {bl.commande?.numero_commande || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(bl.date_livraison)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(bl.statut)}`}>
                      {bl.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {bl.statut === 'préparé' && (
                      <button
                        onClick={() => handleChangeStatut(bl.id, 'expédié')}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Expédier
                      </button>
                    )}
                    {bl.statut === 'expédié' && (
                      <button
                        onClick={() => handleChangeStatut(bl.id, 'livré')}
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        Livré
                      </button>
                    )}
                    {bl.statut === 'livré' && (
                      <button
                        onClick={() => handleCreateFacture(bl.id)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Créer facture"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Truck, Check, Package } from 'lucide-react';
import { supabase, formatCurrency, formatDate } from '@/lib/supabase';
import type { Commande, StatutCommande } from '@/types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function Commandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<'all' | StatutCommande>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadCommandes();
  }, []);

  const loadCommandes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('commandes')
      .select(`
        *,
        client:clients(*),
        devis:devis(*),
        lignes:lignes_commande(*, produit:produits(*))
      `)
      .order('date_commande', { ascending: false });

    if (!error) setCommandes(data || []);
    setLoading(false);
  };

  const handleChangeStatut = async (id: string, newStatut: StatutCommande) => {
    const { error } = await supabase
      .from('commandes')
      .update({ statut: newStatut })
      .eq('id', id);

    if (!error) {
      toast.success('Statut mis à jour');
      loadCommandes();
    }
  };

  const handleCreateBL = async (commandeId: string) => {
    const cmd = commandes.find(c => c.id === commandeId);
    if (!cmd) return;

    const { data: bl, error } = await supabase
      .from('bons_livraison')
      .insert({
        commande_id: commandeId,
        client_id: cmd.client_id,
        statut: 'préparé',
      })
      .select()
      .single();

    if (error) {
      toast.error('Erreur lors de la création du BL');
      return;
    }

    // Copier les lignes
    if (cmd.lignes) {
      const lignesBL = cmd.lignes.map(ligne => ({
        bl_id: bl.id,
        produit_id: ligne.produit_id,
        designation: ligne.designation,
        quantite_commandee: ligne.quantite,
        quantite_livree: ligne.quantite,
      }));

      await supabase.from('lignes_bl').insert(lignesBL);
    }

    await supabase
      .from('commandes')
      .update({ statut: 'livrée' })
      .eq('id', commandeId);

    toast.success('Bon de livraison créé');
    navigate('/livraisons');
  };

  const getStatutColor = (statut: StatutCommande) => {
    const colors = {
      en_attente: 'bg-gray-100 text-gray-800',
      confirmée: 'bg-blue-100 text-blue-800',
      en_production: 'bg-yellow-100 text-yellow-800',
      prête: 'bg-green-100 text-green-800',
      livrée: 'bg-purple-100 text-purple-800',
      annulée: 'bg-red-100 text-red-800',
    };
    return colors[statut];
  };

  const filtered = filterStatut === 'all' 
    ? commandes 
    : commandes.filter(c => c.statut === filterStatut);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Commandes</h2>
          <p className="text-gray-600 mt-1">Suivi de vos commandes en cours</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'en_attente', 'confirmée', 'en_production', 'prête', 'livrée'].map((statut) => (
            <button
              key={statut}
              onClick={() => setFilterStatut(statut as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filterStatut === statut
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {statut === 'all' ? 'Toutes' : statut.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{commandes.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">En Production</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">
            {commandes.filter(c => c.statut === 'en_production').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Prêtes</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {commandes.filter(c => c.statut === 'prête').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">CA Total</div>
          <div className="text-2xl font-bold text-primary-600 mt-2">
            {formatCurrency(commandes.reduce((sum, c) => sum + c.montant_ttc, 0))}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
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
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Aucune commande</td></tr>
            ) : (
              filtered.map((cmd) => (
                <tr key={cmd.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{cmd.numero_commande}</div>
                    {cmd.devis && <div className="text-xs text-gray-500">Devis: {cmd.devis.numero_devis}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{cmd.client?.raison_sociale}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(cmd.date_commande)}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">{formatCurrency(cmd.montant_ttc)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(cmd.statut)}`}>
                      {cmd.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {cmd.statut === 'confirmée' && (
                      <button
                        onClick={() => handleChangeStatut(cmd.id, 'en_production')}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Mettre en production"
                      >
                        <Package className="w-5 h-5" />
                      </button>
                    )}
                    {cmd.statut === 'en_production' && (
                      <button
                        onClick={() => handleChangeStatut(cmd.id, 'prête')}
                        className="text-green-600 hover:text-green-900"
                        title="Marquer comme prête"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    {cmd.statut === 'prête' && (
                      <button
                        onClick={() => handleCreateBL(cmd.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Créer BL"
                      >
                        <Truck className="w-5 h-5" />
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

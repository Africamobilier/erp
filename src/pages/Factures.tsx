import { useEffect, useState } from 'react';
import { Plus, Search, DollarSign, AlertCircle } from 'lucide-react';
import { supabase, formatCurrency, formatDate } from '@/lib/supabase';
import type { Facture, StatutFacture } from '@/types';
import toast from 'react-hot-toast';

export function Factures() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<'all' | StatutFacture>('all');
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);

  useEffect(() => {
    loadFactures();
  }, []);

  const loadFactures = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('factures')
      .select(`
        *,
        client:clients(*),
        commande:commandes(*),
        bl:bons_livraison(*),
        lignes:lignes_facture(*, produit:produits(*))
      `)
      .order('date_facture', { ascending: false });

    if (!error) setFactures(data || []);
    setLoading(false);
  };

  const handleEnregistrerPaiement = async (factureId: string, montant: number, modePaiement: string) => {
    const facture = factures.find(f => f.id === factureId);
    if (!facture) return;

    // Créer le paiement
    const { error: paiementError } = await supabase
      .from('paiements')
      .insert({
        facture_id: factureId,
        client_id: facture.client_id,
        montant,
        mode_paiement: modePaiement,
      });

    if (paiementError) {
      toast.error('Erreur lors de l\'enregistrement du paiement');
      return;
    }

    // Mettre à jour la facture
    const nouveauMontantPaye = facture.montant_paye + montant;
    const nouveauSolde = facture.montant_ttc - nouveauMontantPaye;
    const nouveauStatut = nouveauSolde <= 0 ? 'payée' : nouveauSolde < facture.montant_ttc ? 'partiellement_payée' : facture.statut;

    const { error: factureError } = await supabase
      .from('factures')
      .update({
        montant_paye: nouveauMontantPaye,
        solde_restant: nouveauSolde,
        statut: nouveauStatut,
      })
      .eq('id', factureId);

    if (!factureError) {
      toast.success('Paiement enregistré avec succès');
      loadFactures();
      setShowPaiementModal(false);
    }
  };

  const getStatutColor = (statut: StatutFacture) => {
    const colors = {
      brouillon: 'bg-gray-100 text-gray-800',
      émise: 'bg-blue-100 text-blue-800',
      payée: 'bg-green-100 text-green-800',
      partiellement_payée: 'bg-yellow-100 text-yellow-800',
      en_retard: 'bg-red-100 text-red-800',
      annulée: 'bg-gray-100 text-gray-800',
    };
    return colors[statut];
  };

  const filtered = filterStatut === 'all' ? factures : factures.filter(f => f.statut === filterStatut);

  const statsTotal = factures.length;
  const statsEmises = factures.filter(f => f.statut === 'émise').length;
  const statsPayees = factures.filter(f => f.statut === 'payée').length;
  const montantImpaye = factures
    .filter(f => ['émise', 'partiellement_payée', 'en_retard'].includes(f.statut))
    .reduce((sum, f) => sum + f.solde_restant, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Factures</h2>
          <p className="text-gray-600 mt-1">Gestion de la facturation et des encaissements</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'émise', 'partiellement_payée', 'payée', 'en_retard'].map((statut) => (
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
          <div className="text-sm font-medium text-gray-600">Total Factures</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{statsTotal}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Émises</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{statsEmises}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Payées</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{statsPayees}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Impayés</div>
          <div className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(montantImpaye)}</div>
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payé</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solde</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">Aucune facture</td></tr>
            ) : (
              filtered.map((facture) => (
                <tr key={facture.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{facture.numero_facture}</div>
                    {facture.commande && <div className="text-xs text-gray-500">CMD: {facture.commande.numero_commande}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{facture.client?.raison_sociale}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{formatDate(facture.date_facture)}</div>
                    {facture.date_echeance && (
                      <div className="text-xs text-gray-400">Échéance: {formatDate(facture.date_echeance)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">{formatCurrency(facture.montant_ttc)}</td>
                  <td className="px-6 py-4 text-right text-sm text-green-600">{formatCurrency(facture.montant_paye)}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-red-600">
                    {facture.solde_restant > 0 ? formatCurrency(facture.solde_restant) : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(facture.statut)}`}>
                      {facture.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {facture.solde_restant > 0 && (
                      <button
                        onClick={() => {
                          setSelectedFacture(facture);
                          setShowPaiementModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Enregistrer un paiement"
                      >
                        <DollarSign className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Paiement */}
      {showPaiementModal && selectedFacture && (
        <PaiementModal
          facture={selectedFacture}
          onClose={() => setShowPaiementModal(false)}
          onSave={handleEnregistrerPaiement}
        />
      )}
    </div>
  );
}

function PaiementModal({ facture, onClose, onSave }: { 
  facture: Facture; 
  onClose: () => void; 
  onSave: (id: string, montant: number, mode: string) => void; 
}) {
  const [montant, setMontant] = useState(facture.solde_restant);
  const [modePaiement, setModePaiement] = useState('virement');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (montant <= 0 || montant > facture.solde_restant) {
      toast.error('Montant invalide');
      return;
    }
    onSave(facture.id, montant, modePaiement);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Enregistrer un paiement
        </h3>
        
        <div className="mb-4">
          <div className="text-sm text-gray-600">Facture: {facture.numero_facture}</div>
          <div className="text-sm text-gray-600">Client: {facture.client?.raison_sociale}</div>
          <div className="text-lg font-bold text-gray-900 mt-2">
            Solde restant: {formatCurrency(facture.solde_restant)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant du paiement *
            </label>
            <input
              type="number"
              step="0.01"
              value={montant}
              onChange={(e) => setMontant(parseFloat(e.target.value))}
              max={facture.solde_restant}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode de paiement *
            </label>
            <select
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="virement">Virement</option>
              <option value="chèque">Chèque</option>
              <option value="espèces">Espèces</option>
              <option value="carte">Carte bancaire</option>
              <option value="traite">Traite</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

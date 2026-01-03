import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, RefreshCw, Download, Upload } from 'lucide-react';
import { supabase, formatCurrency, formatDate } from '@/lib/supabase';
import { wooCommerceService } from '@/lib/woocommerce';
import type { Produit } from '@/types';
import toast from 'react-hot-toast';

export function Produits() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filteredProduits, setFilteredProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadProduits();
  }, []);

  useEffect(() => {
    filterProduits();
  }, [produits, searchTerm, filterCategorie]);

  const loadProduits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .order('designation', { ascending: true });

    if (error) {
      toast.error('Erreur lors du chargement des produits');
      console.error(error);
    } else {
      setProduits(data || []);
      
      // Extraire les catégories uniques
      const cats = Array.from(new Set(data?.map(p => p.categorie).filter(Boolean) as string[]));
      setCategories(cats);
    }
    setLoading(false);
  };

  const filterProduits = () => {
    let filtered = produits;

    if (filterCategorie !== 'all') {
      filtered = filtered.filter(p => p.categorie === filterCategorie);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.designation?.toLowerCase().includes(term) ||
        p.code_produit?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    setFilteredProduits(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    const { error } = await supabase
      .from('produits')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Produit supprimé avec succès');
      loadProduits();
    }
  };

  const handleSyncWooCommerce = async () => {
    setSyncing(true);
    toast.loading('Synchronisation en cours...', { id: 'sync' });

    try {
      const result = await wooCommerceService.syncProducts();
      
      if (result.success) {
        toast.success(`${result.count} produits synchronisés`, { id: 'sync' });
        loadProduits();
      } else {
        toast.error('Erreur lors de la synchronisation', { id: 'sync' });
      }
    } catch (error) {
      toast.error('Erreur de connexion WooCommerce', { id: 'sync' });
    } finally {
      setSyncing(false);
    }
  };

  const statsProduitsEnStock = produits.filter(p => p.stock_disponible > 0).length;
  const statsProduitsEnRupture = produits.filter(p => p.stock_disponible === 0).length;
  const statsProduitsAlerte = produits.filter(p => p.stock_disponible > 0 && p.stock_disponible <= p.stock_alerte).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Catalogue Produits</h2>
          <p className="text-gray-600 mt-1">Gestion de votre catalogue et synchronisation WooCommerce</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSyncWooCommerce}
            disabled={syncing}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync WooCommerce</span>
          </button>
          <button
            onClick={() => {
              setEditingProduit(null);
              setShowModal(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Produit</span>
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Produits</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{produits.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">En Stock</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{statsProduitsEnStock}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Rupture</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{statsProduitsEnRupture}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Alerte Stock</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{statsProduitsAlerte}</div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix HT
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
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
              ) : filteredProduits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                filteredProduits.map((produit) => (
                  <tr key={produit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {produit.image_url ? (
                          <img 
                            src={produit.image_url} 
                            alt={produit.designation}
                            className="w-12 h-12 rounded object-cover mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center mr-3">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {produit.designation}
                          </div>
                          <div className="text-sm text-gray-500">{produit.code_produit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {produit.categorie || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(produit.prix_unitaire_ht)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-medium ${
                        produit.stock_disponible === 0 
                          ? 'text-red-600' 
                          : produit.stock_disponible <= produit.stock_alerte 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                      }`}>
                        {produit.stock_disponible}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        produit.actif
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {produit.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduit(produit);
                          setShowModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(produit.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
        <ProduitModal
          produit={editingProduit}
          onClose={() => {
            setShowModal(false);
            setEditingProduit(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingProduit(null);
            loadProduits();
          }}
        />
      )}
    </div>
  );
}

interface ProduitModalProps {
  produit: Produit | null;
  onClose: () => void;
  onSave: () => void;
}

function ProduitModal({ produit, onClose, onSave }: ProduitModalProps) {
  const [formData, setFormData] = useState({
    code_produit: produit?.code_produit || '',
    designation: produit?.designation || '',
    description: produit?.description || '',
    categorie: produit?.categorie || '',
    prix_unitaire_ht: produit?.prix_unitaire_ht || 0,
    unite: produit?.unite || 'unité',
    stock_disponible: produit?.stock_disponible || 0,
    stock_alerte: produit?.stock_alerte || 10,
    image_url: produit?.image_url || '',
    actif: produit?.actif ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (produit) {
      // Mise à jour
      const { error } = await supabase
        .from('produits')
        .update(formData)
        .eq('id', produit.id);

      if (error) {
        toast.error('Erreur lors de la mise à jour');
      } else {
        toast.success('Produit mis à jour avec succès');
        onSave();
      }
    } else {
      // Création
      const { error } = await supabase
        .from('produits')
        .insert(formData);

      if (error) {
        toast.error('Erreur lors de la création');
      } else {
        toast.success('Produit créé avec succès');
        onSave();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {produit ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code produit *
              </label>
              <input
                type="text"
                value={formData.code_produit}
                onChange={(e) => setFormData({ ...formData, code_produit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Désignation *
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <input
                type="text"
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité
              </label>
              <select
                value={formData.unite}
                onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="unité">Unité</option>
                <option value="mètre">Mètre</option>
                <option value="m²">M²</option>
                <option value="kg">Kg</option>
                <option value="lot">Lot</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix unitaire HT *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.prix_unitaire_ht}
                onChange={(e) => setFormData({ ...formData, prix_unitaire_ht: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock disponible
              </label>
              <input
                type="number"
                value={formData.stock_disponible}
                onChange={(e) => setFormData({ ...formData, stock_disponible: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seuil d'alerte
              </label>
              <input
                type="number"
                value={formData.stock_alerte}
                onChange={(e) => setFormData({ ...formData, stock_alerte: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de l'image
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.actif}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Produit actif</span>
              </label>
            </div>
          </div>

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
              {produit ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

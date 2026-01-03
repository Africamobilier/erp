import { useEffect, useState } from 'react';
import { RefreshCw, Check, X, AlertCircle, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { wooCommerceService } from '@/lib/woocommerce';
import type { WooCommerceConfig, SyncLog } from '@/types';
import toast from 'react-hot-toast';

export function WooCommerce() {
  const [config, setConfig] = useState<WooCommerceConfig | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [formData, setFormData] = useState({
    site_url: '',
    consumer_key: '',
    consumer_secret: '',
  });

  useEffect(() => {
    loadConfig();
    loadLogs();
  }, []);

  const loadConfig = async () => {
    const cfg = await wooCommerceService.getConfig();
    if (cfg) {
      setConfig(cfg);
      setFormData({
        site_url: cfg.site_url,
        consumer_key: cfg.consumer_key,
        consumer_secret: cfg.consumer_secret,
      });
    } else {
      setShowConfig(true);
    }
  };

  const loadLogs = async () => {
    const { data } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setLogs(data);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await wooCommerceService.saveConfig({
      ...formData,
      actif: true,
    });

    if (success) {
      toast.success('Configuration sauvegardée');
      loadConfig();
      setShowConfig(false);
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    toast.loading('Test de connexion...', { id: 'test' });

    const success = await wooCommerceService.testConnection();

    if (success) {
      toast.success('Connexion réussie !', { id: 'test' });
    } else {
      toast.error('Échec de la connexion', { id: 'test' });
    }

    setTesting(false);
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    toast.loading('Synchronisation en cours...', { id: 'sync' });

    const result = await wooCommerceService.syncAll();

    toast.success(
      `Synchronisation terminée: ${result.customers} clients, ${result.products} produits, ${result.orders} commandes`,
      { id: 'sync', duration: 5000 }
    );

    setSyncing(false);
    loadLogs();
  };

  const handleSyncCustomers = async () => {
    setSyncing(true);
    toast.loading('Sync clients...', { id: 'sync' });
    const result = await wooCommerceService.syncCustomers();
    toast.success(`${result.count} clients synchronisés`, { id: 'sync' });
    setSyncing(false);
    loadLogs();
  };

  const handleSyncProducts = async () => {
    setSyncing(true);
    toast.loading('Sync produits...', { id: 'sync' });
    const result = await wooCommerceService.syncProducts();
    toast.success(`${result.count} produits synchronisés`, { id: 'sync' });
    setSyncing(false);
    loadLogs();
  };

  const handleSyncOrders = async () => {
    setSyncing(true);
    toast.loading('Sync demandes de devis...', { id: 'sync' });
    const result = await wooCommerceService.syncOrders();
    toast.success(`${result.count} demande(s) de devis synchronisée(s)`, { id: 'sync' });
    setSyncing(false);
    loadLogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Synchronisation WooCommerce</h2>
          <p className="text-gray-600 mt-1">Importez vos données depuis votre boutique en ligne</p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
        >
          <Settings className="w-5 h-5" />
          <span>Configuration</span>
        </button>
      </div>

      {/* Configuration */}
      {showConfig && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration WooCommerce</h3>
          
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du site WooCommerce *
              </label>
              <input
                type="url"
                value={formData.site_url}
                onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                placeholder="https://votre-site.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                L'URL complète de votre site WordPress (doit commencer par https://)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consumer Key *
              </label>
              <input
                type="text"
                value={formData.consumer_key}
                onChange={(e) => setFormData({ ...formData, consumer_key: e.target.value })}
                placeholder="ck_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consumer Secret *
              </label>
              <input
                type="password"
                value={formData.consumer_secret}
                onChange={(e) => setFormData({ ...formData, consumer_secret: e.target.value })}
                placeholder="cs_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Comment obtenir vos clés API ?</h4>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Dans WordPress, allez dans WooCommerce → Paramètres</li>
                <li>Onglet "Avancé" → "API REST"</li>
                <li>Cliquez sur "Ajouter une clé"</li>
                <li>Sélectionnez "Lecture/Écriture" pour les permissions</li>
                <li>Générez et copiez les clés ici</li>
              </ol>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statut de connexion */}
      {config && !showConfig && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Statut de la connexion</h3>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              <span>Tester</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Site configuré</div>
                <div className="text-xs text-gray-500">{config.site_url}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Clés API configurées</div>
                <div className="text-xs text-gray-500">Consumer Key & Secret</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Dernière sync</div>
                <div className="text-xs text-gray-500">
                  {config.derniere_sync 
                    ? new Date(config.derniere_sync).toLocaleString('fr-FR')
                    : 'Jamais'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions de synchronisation */}
      {config && !showConfig && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions de synchronisation</h3>

          {/* Info sur la synchronisation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 Ce qui est synchronisé :</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <strong>Clients</strong> : Tous vos clients WooCommerce avec leurs coordonnées complètes</li>
              <li>• <strong>Produits</strong> : Catalogue complet avec prix, descriptions, images et stock</li>
              <li>• <strong>Demandes de devis</strong> : Commandes en statut "pending", "quote-requested" et "on-hold" convertis en devis dans l'ERP</li>
              <li>• <strong>Les devis créés incluent</strong> : Client, produits, quantités, prix et notes</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="p-4 border-2 border-primary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center mb-2">
                <RefreshCw className={`w-8 h-8 text-primary-600 ${syncing ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-sm font-semibold text-gray-900">Sync Complète</div>
              <div className="text-xs text-gray-500 mt-1">Clients + Produits + Commandes</div>
            </button>

            <button
              onClick={handleSyncCustomers}
              disabled={syncing}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50"
            >
              <div className="text-sm font-semibold text-gray-900">Sync Clients</div>
              <div className="text-xs text-gray-500 mt-1">Importer les clients WooCommerce</div>
            </button>

            <button
              onClick={handleSyncProducts}
              disabled={syncing}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50"
            >
              <div className="text-sm font-semibold text-gray-900">Sync Produits</div>
              <div className="text-xs text-gray-500 mt-1">Importer le catalogue</div>
            </button>

            <button
              onClick={handleSyncOrders}
              disabled={syncing}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50"
            >
              <div className="text-sm font-semibold text-gray-900">Sync Demandes de Devis</div>
              <div className="text-xs text-gray-500 mt-1">Commandes + Demandes de devis</div>
            </button>
          </div>
        </div>
      )}

      {/* Logs de synchronisation */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historique des synchronisations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Aucun historique de synchronisation
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.type_sync}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {log.statut === 'success' ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

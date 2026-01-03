import { useState, useEffect } from 'react';
import { Save, Building, Hash, Receipt } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const PARAMETRES_ID = 'e290b3fc-30dc-4526-8168-4340b0dcb3e9';

export function Parametres() {
  const [activeTab, setActiveTab] = useState('entreprise');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Entreprise
    nom_entreprise: 'Africa Mobilier',
    adresse: '',
    ville: 'Casablanca',
    code_postal: '',
    pays: 'Maroc',
    telephone: '',
    email: 'contact@africamobilier.ma',
    site_web: 'www.africamobilier.ma',
    ice_numero: '',
    rc_numero: '',
    tva_numero: '',
    
    // TVA
    taux_tva_defaut: 20,
    devise: 'MAD',
    
    // Conditions
    conditions_paiement: 'Paiement à 30 jours',
    conditions_vente: '',
    mention_legale: '',
  });

  useEffect(() => {
    loadParametres();
  }, []);

  const loadParametres = async () => {
    try {
      const { data, error } = await supabase
        .from('parametres')
        .select('*')
        .eq('id', PARAMETRES_ID)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          nom_entreprise: data.nom_entreprise || 'Africa Mobilier',
          adresse: data.adresse || '',
          ville: data.ville || 'Casablanca',
          code_postal: data.code_postal || '',
          pays: data.pays || 'Maroc',
          telephone: data.telephone || '',
          email: data.email || 'contact@africamobilier.ma',
          site_web: data.site_web || 'www.africamobilier.ma',
          ice_numero: data.ice_numero || '',
          rc_numero: data.rc_numero || '',
          tva_numero: data.tva_numero || '',
          taux_tva_defaut: data.taux_tva_defaut || 20,
          devise: data.devise || 'MAD',
          conditions_paiement: data.conditions_paiement || 'Paiement à 30 jours',
          conditions_vente: data.conditions_vente || '',
          mention_legale: data.mention_legale || '',
        });
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('parametres')
        .update({
          nom_entreprise: formData.nom_entreprise,
          adresse: formData.adresse,
          ville: formData.ville,
          code_postal: formData.code_postal,
          pays: formData.pays,
          telephone: formData.telephone,
          email: formData.email,
          site_web: formData.site_web,
          ice_numero: formData.ice_numero,
          rc_numero: formData.rc_numero,
          tva_numero: formData.tva_numero,
          taux_tva_defaut: formData.taux_tva_defaut,
          devise: formData.devise,
          conditions_paiement: formData.conditions_paiement,
          conditions_vente: formData.conditions_vente,
          mention_legale: formData.mention_legale,
        })
        .eq('id', PARAMETRES_ID);

      if (error) throw error;

      toast.success('Paramètres sauvegardés avec succès');
    } catch (error: any) {
      console.error('Erreur sauvegarde paramètres:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Paramètres</h2>
        <p className="text-gray-600 mt-1">Configuration de votre ERP</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'entreprise', name: 'Entreprise', icon: Building },
              { id: 'numerotation', name: 'Numérotation', icon: Hash },
              { id: 'facturation', name: 'Facturation', icon: Receipt },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'entreprise' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de l'entreprise</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.nom_entreprise}
                      onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.code_postal}
                      onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ICE
                    </label>
                    <input
                      type="text"
                      value={formData.ice_numero}
                      onChange={(e) => setFormData({ ...formData, ice_numero: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RC
                    </label>
                    <input
                      type="text"
                      value={formData.rc_numero}
                      onChange={(e) => setFormData({ ...formData, rc_numero: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      N° TVA
                    </label>
                    <input
                      type="text"
                      value={formData.tva_numero}
                      onChange={(e) => setFormData({ ...formData, tva_numero: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'numerotation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Préfixes de numérotation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Préfixe Devis
                    </label>
                    <input
                      type="text"
                      value={formData.prefixe_devis}
                      onChange={(e) => setFormData({ ...formData, prefixe_devis: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ex: DEV-260001</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Préfixe Commande
                    </label>
                    <input
                      type="text"
                      value={formData.prefixe_commande}
                      onChange={(e) => setFormData({ ...formData, prefixe_commande: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ex: CMD-260001</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Préfixe Bon de Livraison
                    </label>
                    <input
                      type="text"
                      value={formData.prefixe_bl}
                      onChange={(e) => setFormData({ ...formData, prefixe_bl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ex: BL-260001</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Préfixe Facture
                    </label>
                    <input
                      type="text"
                      value={formData.prefixe_facture}
                      onChange={(e) => setFormData({ ...formData, prefixe_facture: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ex: FACT-260001</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'facturation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de facturation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux de TVA par défaut (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.taux_tva_defaut}
                      onChange={(e) => setFormData({ ...formData, taux_tva_defaut: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Délai de paiement par défaut (jours)
                    </label>
                    <input
                      type="number"
                      value={formData.delai_paiement_defaut}
                      onChange={(e) => setFormData({ ...formData, delai_paiement_defaut: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conditions de paiement par défaut
                    </label>
                    <textarea
                      value={formData.conditions_paiement}
                      onChange={(e) => setFormData({ ...formData, conditions_paiement: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Sauvegarder</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">À propos de cette version</h3>
            <div className="mt-2 text-sm text-blue-800">
              <p>Africa Mobilier ERP v1.0.0</p>
              <p className="mt-1 italic">Excellence marocaine, Vision africaine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hash({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  );
}

function Receipt({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    </svg>
  );
}

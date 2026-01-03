import { useState, useEffect } from 'react';
import { Save, Building } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const PARAMETRES_ID = 'e290b3fc-30dc-4526-8168-4340b0dcb3e9';

export function Parametres() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
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
    taux_tva_defaut: 20,
    devise: 'MAD',
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
        <p className="text-gray-600 mt-1">Configuration de votre entreprise</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-6">
            {/* Informations Entreprise */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary-600" />
                Informations de l'entreprise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.nom_entreprise}
                    onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={formData.pays}
                    onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <input
                    type="text"
                    value={formData.site_web}
                    onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N° ICE
                  </label>
                  <input
                    type="text"
                    value={formData.ice_numero}
                    onChange={(e) => setFormData({ ...formData, ice_numero: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N° RC
                  </label>
                  <input
                    type="text"
                    value={formData.rc_numero}
                    onChange={(e) => setFormData({ ...formData, rc_numero: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Paramètres Financiers */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Paramètres financiers
              </h3>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Devise
                  </label>
                  <input
                    type="text"
                    value={formData.devise}
                    onChange={(e) => setFormData({ ...formData, devise: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conditions de paiement par défaut
                  </label>
                  <input
                    type="text"
                    value={formData.conditions_paiement}
                    onChange={(e) => setFormData({ ...formData, conditions_paiement: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conditions de vente
                  </label>
                  <textarea
                    value={formData.conditions_vente}
                    onChange={(e) => setFormData({ ...formData, conditions_vente: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mention légale
                  </label>
                  <textarea
                    value={formData.mention_legale}
                    onChange={(e) => setFormData({ ...formData, mention_legale: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
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
        <p className="text-sm text-blue-800">
          💡 <strong>Conseil :</strong> Ces paramètres seront utilisés automatiquement dans vos devis, commandes et factures.
        </p>
      </div>
    </div>
  );
}

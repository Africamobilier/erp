import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  ShoppingCart, 
  Receipt,
  AlertCircle,
  DollarSign,
  Package
} from 'lucide-react';
import { supabase, formatCurrency } from '@/lib/supabase';
import type { DashboardStats, CAMensuel, ProduitVentes } from '@/types';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [caMensuel, setCAMensuel] = useState<CAMensuel[]>([]);
  const [topProduits, setTopProduits] = useState<ProduitVentes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      // Charger les statistiques principales
      await loadStats();
      
      // Charger le CA mensuel
      await loadCAMensuel();
      
      // Charger les produits top ventes
      await loadTopProduits();
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // CA aujourd'hui
    const aujourdhui = new Date().toISOString().split('T')[0];
    const { data: caAujourdhui } = await supabase
      .from('factures')
      .select('montant_ttc')
      .eq('date_facture', aujourdhui)
      .in('statut', ['émise', 'payée', 'partiellement_payée']);

    // CA du mois
    const debutMois = new Date();
    debutMois.setDate(1);
    const { data: caMois } = await supabase
      .from('factures')
      .select('montant_ttc')
      .gte('date_facture', debutMois.toISOString().split('T')[0])
      .in('statut', ['émise', 'payée', 'partiellement_payée']);

    // CA de l'année
    const debutAnnee = new Date(new Date().getFullYear(), 0, 1);
    const { data: caAnnee } = await supabase
      .from('factures')
      .select('montant_ttc')
      .gte('date_facture', debutAnnee.toISOString().split('T')[0])
      .in('statut', ['émise', 'payée', 'partiellement_payée']);

    // Devis en attente
    const { count: nbDevis } = await supabase
      .from('devis')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'envoyé');

    // Commandes en cours
    const { count: nbCommandes } = await supabase
      .from('commandes')
      .select('*', { count: 'exact', head: true })
      .in('statut', ['confirmée', 'en_production', 'prête']);

    // Factures impayées
    const { data: facturesImpayees } = await supabase
      .from('factures')
      .select('montant_ttc, solde_restant')
      .in('statut', ['émise', 'partiellement_payée']);

    // Prospects et clients
    const { count: nbProspects } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'prospect');

    const { count: nbClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'client');

    const montantImpayes = facturesImpayees?.reduce((sum, f) => sum + f.solde_restant, 0) || 0;
    const nbFacturesImpayees = facturesImpayees?.length || 0;

    setStats({
      ca_aujourd_hui: caAujourdhui?.reduce((sum, f) => sum + f.montant_ttc, 0) || 0,
      ca_mois: caMois?.reduce((sum, f) => sum + f.montant_ttc, 0) || 0,
      ca_annee: caAnnee?.reduce((sum, f) => sum + f.montant_ttc, 0) || 0,
      nb_devis_en_attente: nbDevis || 0,
      nb_commandes_en_cours: nbCommandes || 0,
      nb_factures_impayees: nbFacturesImpayees,
      montant_impayes: montantImpayes,
      nb_prospects: nbProspects || 0,
      nb_clients: nbClients || 0,
      taux_conversion: nbProspects ? ((nbClients / (nbProspects + nbClients)) * 100) : 0,
    });
  };

  const loadCAMensuel = async () => {
    const { data, error } = await supabase
      .from('ca_mensuel')
      .select('*')
      .order('mois', { ascending: false })
      .limit(12);

    if (!error && data) {
      setCAMensuel(data.reverse());
    }
  };

  const loadTopProduits = async () => {
    const { data, error } = await supabase
      .from('produits_top_ventes')
      .select('*')
      .limit(10);

    if (!error && data) {
      setTopProduits(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Tableau de bord</h2>
        <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="CA Aujourd'hui"
          value={formatCurrency(stats?.ca_aujourd_hui || 0)}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="CA du Mois"
          value={formatCurrency(stats?.ca_mois || 0)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="CA de l'Année"
          value={formatCurrency(stats?.ca_annee || 0)}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Impayés"
          value={formatCurrency(stats?.montant_impayes || 0)}
          subtitle={`${stats?.nb_factures_impayees} facture(s)`}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Deuxième ligne de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Prospects"
          value={stats?.nb_prospects.toString() || '0'}
          icon={Users}
          color="orange"
        />
        <StatCard
          title="Clients"
          value={stats?.nb_clients.toString() || '0'}
          subtitle={`${stats?.taux_conversion.toFixed(1)}% conversion`}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Devis en attente"
          value={stats?.nb_devis_en_attente.toString() || '0'}
          icon={FileText}
          color="yellow"
        />
        <StatCard
          title="Commandes en cours"
          value={stats?.nb_commandes_en_cours.toString() || '0'}
          icon={ShoppingCart}
          color="blue"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution du CA */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Évolution du CA (12 derniers mois)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={caMensuel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mois" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
                }}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ca_ttc" 
                stroke="#f97316" 
                strokeWidth={2}
                name="CA TTC"
              />
              <Line 
                type="monotone" 
                dataKey="encaissements" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Encaissements"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top produits */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top 10 Produits Vendus
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProduits.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="designation" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toFixed(0)} />
              <Bar dataKey="quantite_totale" fill="#f97316" name="Quantité vendue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau produits top/flop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top produits détaillé */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Produits les Plus Vendus
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Qté
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    CA
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProduits.slice(0, 5).map((produit, index) => (
                  <tr key={produit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {produit.designation}
                          </div>
                          <div className="text-xs text-gray-500">
                            {produit.code_produit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {produit.quantite_totale}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(produit.ca_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertes et actions rapides */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Actions Rapides
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <QuickAction
              icon={FileText}
              title="Créer un devis"
              description="Nouveau devis pour un client"
              href="/devis/nouveau"
            />
            <QuickAction
              icon={Users}
              title="Ajouter un prospect"
              description="Enregistrer un nouveau prospect"
              href="/prospects/nouveau"
            />
            <QuickAction
              icon={Package}
              title="Ajouter un produit"
              description="Créer une fiche produit"
              href="/produits/nouveau"
            />
            <QuickAction
              icon={Receipt}
              title="Saisir un paiement"
              description="Enregistrer un encaissement"
              href="/factures"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'yellow';
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    orange: 'bg-primary-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

function QuickAction({ icon: Icon, title, description, href }: QuickActionProps) {
  return (
    <a
      href={href}
      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
    >
      <div className="flex-shrink-0">
        <Icon className="w-8 h-8 text-gray-400 group-hover:text-primary-600" />
      </div>
      <div className="ml-4">
        <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
          {title}
        </h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </a>
  );
}

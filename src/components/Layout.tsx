import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  Settings,
  Menu,
  X,
  RefreshCw,
  LogOut,
  User,
  UserCog
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Tableau de bord', module: 'dashboard' },
  { path: '/prospects', icon: Users, label: 'Prospects & Clients', module: 'prospects' },
  { path: '/produits', icon: Package, label: 'Produits', module: 'produits' },
  { path: '/devis', icon: FileText, label: 'Devis', module: 'devis' },
  { path: '/commandes', icon: ShoppingCart, label: 'Commandes', module: 'commandes' },
  { path: '/livraisons', icon: Truck, label: 'Bons de Livraison', module: 'livraisons' },
  { path: '/factures', icon: Receipt, label: 'Factures', module: 'factures' },
  { path: '/woocommerce', icon: RefreshCw, label: 'WooCommerce', module: 'woocommerce' },
  { path: '/parametres', icon: Settings, label: 'Paramètres', module: 'parametres' },
  { path: '/utilisateurs', icon: UserCog, label: 'Utilisateurs', module: 'utilisateurs' },
];

const roleLabels = {
  admin: 'Administrateur',
  directeur_general: 'Directeur Général',
  directeur_commercial: 'Directeur Commercial',
  commercial: 'Commercial',
};

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut, hasPermission } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/login');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Filtrer les items du menu selon les permissions
  const visibleMenuItems = menuItems.filter(item => {
    // WooCommerce : seulement admin et DG
    if (item.module === 'woocommerce') {
      return profile?.role === 'admin' || profile?.role === 'directeur_general';
    }
    // Autres items : vérifier les permissions normalement
    return hasPermission(item.module, 'read');
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-dark-800 to-dark-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-dark-700">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                <img 
                  src="/africa-mobilier-logo.png" 
                  alt="Africa Mobilier" 
                  className="h-16 w-auto"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <Package className="w-8 h-8 text-primary-500" />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 mx-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {profile && (
          <div className="border-t border-dark-700">
            <div className="p-4">
              {sidebarOpen ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-full flex items-center space-x-3 hover:bg-dark-700 p-2 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">
                        {profile.prenom} {profile.nom}
                      </div>
                      <div className="text-xs text-gray-400">
                        {roleLabels[profile.role]}
                      </div>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Se déconnecter</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center p-2 hover:bg-dark-700 rounded-lg transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-dark-700 hover:bg-dark-700 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6 mx-auto" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Africa Mobilier ERP
            </h1>
            <div className="flex items-center space-x-4">
              {profile && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{profile.prenom} {profile.nom}</span>
                  <span className="mx-2">•</span>
                  <span className="text-primary-600">{roleLabels[profile.role]}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Prospects } from './pages/Prospects';
import { Produits } from './pages/Produits';
import { DevisPage } from './pages/Devis';
import { Commandes } from './pages/Commandes';
import { BonsLivraison } from './pages/BonsLivraison';
import { Factures } from './pages/Factures';
import { WooCommerce } from './pages/WooCommerce';
import { Parametres } from './pages/Parametres';
import { Utilisateurs } from './pages/Utilisateurs';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Route publique de connexion */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    
                    <Route 
                      path="/prospects" 
                      element={
                        <ProtectedRoute requiredPermission={{ module: 'prospects', action: 'read' }}>
                          <Prospects />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/produits" 
                      element={
                        <ProtectedRoute requiredPermission={{ module: 'produits', action: 'read' }}>
                          <Produits />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/devis" 
                      element={
                        <ProtectedRoute requiredPermission={{ module: 'devis', action: 'read' }}>
                          <DevisPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/commandes" 
                      element={
                        <ProtectedRoute requiredPermission={{ module: 'commandes', action: 'read' }}>
                          <Commandes />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/livraisons" 
                      element={
                        <ProtectedRoute requiredPermission={{ module: 'livraisons', action: 'read' }}>
                          <BonsLivraison />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/factures" 
                      element={
                        <ProtectedRoute requiredPermission={{ module: 'factures', action: 'read' }}>
                          <Factures />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/woocommerce" 
                      element={
                        <ProtectedRoute requiredPermission={{ module: 'woocommerce', action: 'read' }}>
                          <WooCommerce />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/parametres" 
                      element={
                        <ProtectedRoute requiredRoles={['admin', 'directeur_general']}>
                          <Parametres />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/utilisateurs" 
                      element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <Utilisateurs />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Redirection par défaut */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

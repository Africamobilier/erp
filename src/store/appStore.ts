import { create } from 'zustand';
import type { Client, Produit, Devis, Commande, Facture, DashboardStats } from '@/types';

interface AppState {
  // Données
  clients: Client[];
  produits: Produit[];
  devis: Devis[];
  commandes: Commande[];
  factures: Facture[];
  dashboardStats: DashboardStats | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  setClients: (clients: Client[]) => void;
  setProduits: (produits: Produit[]) => void;
  setDevis: (devis: Devis[]) => void;
  setCommandes: (commandes: Commande[]) => void;
  setFactures: (factures: Facture[]) => void;
  setDashboardStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Helpers
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addProduit: (produit: Produit) => void;
  updateProduit: (id: string, produit: Partial<Produit>) => void;
  deleteProduit: (id: string) => void;

  addDevis: (devis: Devis) => void;
  updateDevis: (id: string, devis: Partial<Devis>) => void;
  deleteDevis: (id: string) => void;

  addCommande: (commande: Commande) => void;
  updateCommande: (id: string, commande: Partial<Commande>) => void;
  deleteCommande: (id: string) => void;

  addFacture: (facture: Facture) => void;
  updateFacture: (id: string, facture: Partial<Facture>) => void;
  deleteFacture: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // État initial
  clients: [],
  produits: [],
  devis: [],
  commandes: [],
  factures: [],
  dashboardStats: null,
  loading: false,
  error: null,

  // Setters
  setClients: (clients) => set({ clients }),
  setProduits: (produits) => set({ produits }),
  setDevis: (devis) => set({ devis }),
  setCommandes: (commandes) => set({ commandes }),
  setFactures: (factures) => set({ factures }),
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Clients
  addClient: (client) => set((state) => ({ 
    clients: [...state.clients, client] 
  })),
  updateClient: (id, updatedClient) => set((state) => ({
    clients: state.clients.map((c) => 
      c.id === id ? { ...c, ...updatedClient } : c
    ),
  })),
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter((c) => c.id !== id),
  })),

  // Produits
  addProduit: (produit) => set((state) => ({ 
    produits: [...state.produits, produit] 
  })),
  updateProduit: (id, updatedProduit) => set((state) => ({
    produits: state.produits.map((p) => 
      p.id === id ? { ...p, ...updatedProduit } : p
    ),
  })),
  deleteProduit: (id) => set((state) => ({
    produits: state.produits.filter((p) => p.id !== id),
  })),

  // Devis
  addDevis: (devis) => set((state) => ({ 
    devis: [...state.devis, devis] 
  })),
  updateDevis: (id, updatedDevis) => set((state) => ({
    devis: state.devis.map((d) => 
      d.id === id ? { ...d, ...updatedDevis } : d
    ),
  })),
  deleteDevis: (id) => set((state) => ({
    devis: state.devis.filter((d) => d.id !== id),
  })),

  // Commandes
  addCommande: (commande) => set((state) => ({ 
    commandes: [...state.commandes, commande] 
  })),
  updateCommande: (id, updatedCommande) => set((state) => ({
    commandes: state.commandes.map((c) => 
      c.id === id ? { ...c, ...updatedCommande } : c
    ),
  })),
  deleteCommande: (id) => set((state) => ({
    commandes: state.commandes.filter((c) => c.id !== id),
  })),

  // Factures
  addFacture: (facture) => set((state) => ({ 
    factures: [...state.factures, facture] 
  })),
  updateFacture: (id, updatedFacture) => set((state) => ({
    factures: state.factures.map((f) => 
      f.id === id ? { ...f, ...updatedFacture } : f
    ),
  })),
  deleteFacture: (id) => set((state) => ({
    factures: state.factures.filter((f) => f.id !== id),
  })),
}));

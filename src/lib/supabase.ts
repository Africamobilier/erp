import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Remplacez ces valeurs par vos propres credentials Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper pour gérer les erreurs Supabase
export const handleSupabaseError = (error: any) => {
  console.error('Erreur Supabase:', error);
  return {
    success: false,
    error: error.message || 'Une erreur est survenue',
  };
};

// Helper pour formater les dates
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper pour formater les montants
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper pour calculer la TVA
export const calculerTVA = (montantHT: number, tauxTVA: number = 20): number => {
  return (montantHT * tauxTVA) / 100;
};

// Helper pour calculer le TTC
export const calculerTTC = (montantHT: number, tauxTVA: number = 20): number => {
  return montantHT + calculerTVA(montantHT, tauxTVA);
};

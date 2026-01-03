import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'directeur_general' | 'directeur_commercial' | 'commercial';

export interface UserProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  telephone?: string;
  actif: boolean;
}

export interface Permission {
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (module: string, action: 'read' | 'create' | 'update' | 'delete') => boolean;
  isRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, Permission>>({});

  useEffect(() => {
    // Vérifier la session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setPermissions({});
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Charger le profil avec retry
      let retries = 3;
      let profileData = null;
      let profileError = null;

      while (retries > 0 && !profileData) {
        const result = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        profileData = result.data;
        profileError = result.error;

        if (profileError && retries > 1) {
          console.log(`Retry loading profile... (${retries - 1} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 500));
          retries--;
        } else {
          break;
        }
      }

      if (profileError) {
        console.error('Erreur profil:', profileError);
        // Si le profil n'existe pas, essayer de le créer
        if (profileError.code === 'PGRST116') {
          console.log('Profil introuvable, création...');
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              email: user?.email || '',
              nom: 'Admin',
              prenom: 'System',
              role: 'admin',
              actif: true,
            })
            .select()
            .single();

          if (createError) {
            console.error('Erreur création profil:', createError);
            throw createError;
          }
          profileData = newProfile;
        } else {
          throw profileError;
        }
      }

      if (!profileData) {
        throw new Error('Profil introuvable');
      }

      setProfile(profileData);

      // Charger les permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', profileData.role);

      if (permissionsError) {
        console.error('Erreur permissions:', permissionsError);
      } else {
        const permsMap: Record<string, Permission> = {};
        permissionsData?.forEach((perm) => {
          permsMap[perm.module] = {
            can_read: perm.can_read,
            can_create: perm.can_create,
            can_update: perm.can_update,
            can_delete: perm.can_delete,
          };
        });

        setPermissions(permsMap);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      // Log de connexion
      await supabase.from('user_sessions').insert({
        user_id: user?.id,
        ip_address: 'N/A', // À améliorer avec une API pour obtenir l'IP réelle
        user_agent: navigator.userAgent,
      });
    }

    return { error };
  };

  const signOut = async () => {
    // Log de déconnexion
    if (user) {
      await supabase
        .from('user_sessions')
        .update({ logout_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('logout_at', null);
    }

    await supabase.auth.signOut();
  };

  const hasPermission = (module: string, action: 'read' | 'create' | 'update' | 'delete'): boolean => {
    if (!profile) return false;
    
    const perm = permissions[module];
    if (!perm) return false;

    switch (action) {
      case 'read':
        return perm.can_read;
      case 'create':
        return perm.can_create;
      case 'update':
        return perm.can_update;
      case 'delete':
        return perm.can_delete;
      default:
        return false;
    }
  };

  const isRole = (...roles: UserRole[]): boolean => {
    if (!profile) return false;
    return roles.includes(profile.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signOut,
        hasPermission,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

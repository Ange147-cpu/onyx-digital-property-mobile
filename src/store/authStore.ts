import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { AppRole } from '@/types/database';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  activeRole: AppRole | null;
  allowedRoles: AppRole[];
  organizationId: string | null;
  packTier: 'essentiel' | 'performance' | 'premium' | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setActiveRole: (role: AppRole) => void;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeRole: null,
  allowedRoles: [],
  organizationId: null,
  packTier: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await get().refreshSession();
      } else {
        set({ user: null, activeRole: null, allowedRoles: [] });
      }
    } catch (e) {
      console.log('Init error:', e);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await get().refreshSession();
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, activeRole: null, allowedRoles: [], organizationId: null, packTier: null });
      }
    });
  },

  refreshSession: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberData } = await supabase
        .from('organization_members' as any)
        .select('role, organization_id, organizations(pack)')
        .eq('user_id', user.id)
        .limit(10);

      const roles: AppRole[] = ((memberData ?? []) as any[]).map((m: any) => m.role as AppRole);
      const firstMember = ((memberData ?? []) as any[])[0];
      const orgId = firstMember?.organization_id ?? null;
      const pack = firstMember?.organizations?.pack ?? null;

      set({
        user: { id: user.id, email: user.email ?? '' },
        allowedRoles: roles.length > 0 ? roles : [],
        activeRole: roles[0] ?? null,
        organizationId: orgId,
        packTier: pack,
      });
    } catch (e) {
      console.log('Refresh error:', e);
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { error: 'Email ou mot de passe incorrect.' };
      await get().refreshSession();
      return { error: null };
    } catch {
      return { error: 'Une erreur est survenue.' };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, activeRole: null, allowedRoles: [], organizationId: null, packTier: null });
  },

  setActiveRole: (role: AppRole) => set({ activeRole: role }),
}));

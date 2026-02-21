import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LEGAL } from '../constants/config';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  hasAcceptedTerms: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  checkTermsAcceptance: () => Promise<boolean>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  hasAcceptedTerms: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, isLoading: false });

      if (session?.user) {
        await get().checkTermsAcceptance();
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });
    } catch {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  signIn: async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ session: data.session, user: data.user });
    await get().checkTermsAcceptance();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, hasAcceptedTerms: false });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  changePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  checkTermsAcceptance: async () => {
    const user = get().user;
    if (!user) return false;

    const { data } = await supabase
      .from('user_acknowledgments')
      .select('terms_version')
      .eq('user_id', user.id)
      .eq('terms_version', LEGAL.TERMS_VERSION)
      .maybeSingle();

    const accepted = !!data;
    set({ hasAcceptedTerms: accepted });
    return accepted;
  },

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },
}));

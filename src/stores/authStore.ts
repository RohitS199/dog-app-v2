import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
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
  updateAvatar: (uri: string) => Promise<void>;
  updateProfile: (fields: { first_name?: string; last_name?: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
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

  updateAvatar: async (uri) => {
    const user = get().user;
    if (!user) throw new Error('Not authenticated');

    const filePath = `${user.id}/avatar.jpg`;

    // Upload using FormData (React Native compatible)
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    } as any);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, formData, {
        upsert: true,
        contentType: 'multipart/form-data',
      });
    if (uploadError) throw uploadError;

    // Get public URL with cache buster
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Save to user metadata
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    });
    if (updateError) throw updateError;

    set({ user: data.user });
  },

  updateProfile: async (fields) => {
    const { data, error } = await supabase.auth.updateUser({ data: fields });
    if (error) throw error;
    set({ user: data.user });
  },

  signInWithGoogle: async () => {
    const redirectTo = makeRedirectUri({ scheme: 'puplog', path: 'auth/callback' });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success' && result.url) {
        // Extract tokens from the callback URL fragment
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          const { data: { session } } = await supabase.auth.getSession();
          set({ session, user: session?.user ?? null });
          if (session?.user) await get().checkTermsAcceptance();
        }
      }
    }
  },

  signInWithApple: async () => {
    if (Platform.OS === 'ios') {
      // Native Apple Sign In on iOS (shows system dialog with Face ID/Touch ID)
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple.');
      }

      const { error, data } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error) throw error;
      set({ session: data.session, user: data.user });
      if (data.session?.user) await get().checkTermsAcceptance();
    } else {
      // Web browser OAuth fallback for Android
      const redirectTo = makeRedirectUri({ scheme: 'puplog', path: 'auth/callback' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === 'success' && result.url) {
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
            const { data: { session } } = await supabase.auth.getSession();
            set({ session, user: session?.user ?? null });
            if (session?.user) await get().checkTermsAcceptance();
          }
        }
      }
    }
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

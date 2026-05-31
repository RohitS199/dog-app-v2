import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { useUserAchievementsStore, FeaturedSlots } from './userAchievementsStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoadedProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  birthday: string | null;   // ISO date string "1992-05-14" or null
  location: string | null;
  avatar_url: string | null;
}

interface DraftProfile {
  first_name: string;
  last_name: string;
  email: string;             // read-only display only
  phone: string;
  birthday: string;          // ISO date or empty string
  location: string;
}

type DraftKey = keyof DraftProfile;

interface ProfileState {
  loaded: LoadedProfile | null;
  draft: DraftProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadFromAuthAndProfile: () => Promise<void>;
  setDraftField: (key: DraftKey, value: string) => void;
  save: () => Promise<{ success: boolean; error?: string }>;
  discardDraft: () => void;
  clearProfile: () => void;
  updateAvatar: (uri: string | null) => Promise<{ success: boolean; error?: string }>;
}

// ─── Helper: splitName ────────────────────────────────────────────────────────
// Split a combined name string on the first whitespace character.
// "Mary Anne Smith" -> { first: "Mary", last: "Anne Smith" }
// "Madonna"        -> { first: "Madonna", last: "" }
// ""               -> { first: "", last: "" }

export function splitName(combined: string): { first: string; last: string } {
  const trimmed = combined.trim();
  if (!trimmed) {
    return { first: '', last: '' };
  }
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    return { first: trimmed, last: '' };
  }
  return {
    first: trimmed.slice(0, spaceIndex).trim(),
    last: trimmed.slice(spaceIndex + 1).trim(),
  };
}

// ─── Helper: build DraftProfile from LoadedProfile ───────────────────────────

function draftFromLoaded(loaded: LoadedProfile): DraftProfile {
  return {
    first_name: loaded.first_name ?? '',
    last_name: loaded.last_name ?? '',
    email: loaded.email ?? '',
    phone: loaded.phone ?? '',
    birthday: loaded.birthday ?? '',
    location: loaded.location ?? '',
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProfileStore = create<ProfileState>((set, get) => ({
  loaded: null,
  draft: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadFromAuthAndProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      // 1. Get current user from auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        set({
          isLoading: false,
          error: authError?.message ?? 'Not authenticated',
        });
        return;
      }

      const userId = user.id;
      const email = user.email ?? null;
      const meta = user.user_metadata ?? {};
      const first_name: string | null = meta.first_name ?? null;
      const last_name: string | null = meta.last_name ?? null;

      // 2. Fetch user_profiles row
      let profileRow = await fetchProfileRow(userId);

      // 3. Defensive: if row is missing, create it and re-fetch
      if (profileRow === null) {
        await supabase
          .from('user_profiles')
          .upsert({ user_id: userId }, { onConflict: 'user_id' });

        profileRow = await fetchProfileRow(userId);
      }

      const loaded: LoadedProfile = {
        first_name,
        last_name,
        email,
        phone: profileRow?.phone ?? null,
        birthday: profileRow?.birthday ?? null,
        location: profileRow?.location ?? null,
        avatar_url: profileRow?.avatar_url ?? null,
      };

      set({
        loaded,
        draft: draftFromLoaded(loaded),
        isLoading: false,
        error: null,
      });

      // Pattern E PR 1: hydrate featured slots into achievements store
      useUserAchievementsStore.getState().hydrateFeatured(
        (profileRow?.featured_stickers as FeaturedSlots | null) ?? null,
      );
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load profile',
      });
    }
  },

  setDraftField: (key, value) => {
    const { draft } = get();
    if (!draft) return;
    set({ draft: { ...draft, [key]: value } });
  },

  save: async () => {
    const { draft, loaded } = get();

    if (!draft) {
      return { success: false, error: 'No draft to save' };
    }

    set({ isSaving: true });

    try {
      // Resolve user id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isSaving: false });
        return { success: false, error: 'Not authenticated' };
      }

      // Run both writes in parallel
      const [authResult, profileResult] = await Promise.all([
        supabase.auth.updateUser({
          data: {
            first_name: draft.first_name,
            last_name: draft.last_name,
          },
        }),
        supabase.from('user_profiles').upsert({
          user_id: user.id,
          phone: draft.phone || null,
          birthday: draft.birthday || null,
          location: draft.location || null,
        }),
      ]);

      if (authResult.error) {
        set({ isSaving: false });
        return { success: false, error: authResult.error.message };
      }

      if (profileResult.error) {
        set({ isSaving: false });
        return { success: false, error: profileResult.error.message };
      }

      // Refresh loaded from draft values
      const updatedLoaded: LoadedProfile = {
        ...(loaded ?? {
          first_name: null,
          last_name: null,
          email: null,
          phone: null,
          birthday: null,
          location: null,
          avatar_url: null,
        }),
        first_name: draft.first_name || null,
        last_name: draft.last_name || null,
        phone: draft.phone || null,
        birthday: draft.birthday || null,
        location: draft.location || null,
      };

      set({
        loaded: updatedLoaded,
        isSaving: false,
      });

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      set({ isSaving: false });
      return { success: false, error: message };
    }
  },

  discardDraft: () => {
    const { loaded } = get();
    if (!loaded) return;
    set({ draft: draftFromLoaded(loaded) });
  },

  clearProfile: () => {
    set({
      loaded: null,
      draft: null,
      isLoading: false,
      isSaving: false,
      error: null,
    });
  },

  updateAvatar: async (uri) => {
    const { loaded } = get();
    const previousAvatarUrl = loaded?.avatar_url ?? null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      if (uri !== null) {
        // Optimistic UI — show the local URI immediately
        if (loaded) {
          set({ loaded: { ...loaded, avatar_url: uri } });
        }

        const filePath = `${user.id}/avatar.jpg`;
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

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert({ user_id: user.id, avatar_url: avatarUrl }, { onConflict: 'user_id' });
        if (upsertError) throw upsertError;

        const { data: authData, error: authError } = await supabase.auth.updateUser({
          data: { avatar_url: avatarUrl },
        });
        if (authError) throw authError;

        if (loaded) {
          set({ loaded: { ...loaded, avatar_url: avatarUrl } });
        }
        useAuthStore.getState().setUser(authData.user);

        return { success: true };
      }

      // Remove path
      if (loaded) {
        set({ loaded: { ...loaded, avatar_url: null } });
      }

      const filePath = `${user.id}/avatar.jpg`;
      try {
        await supabase.storage.from('avatars').remove([filePath]);
      } catch {
        // Storage delete failure is non-blocking — DB writes are the source of truth
      }

      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, avatar_url: null }, { onConflict: 'user_id' });
      if (upsertError) throw upsertError;

      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
      if (authError) throw authError;

      useAuthStore.getState().setUser(authData.user);

      return { success: true };
    } catch (err) {
      // Revert optimistic UI to the previous avatar URL
      const currentLoaded = get().loaded;
      if (currentLoaded) {
        set({ loaded: { ...currentLoaded, avatar_url: previousAvatarUrl } });
      }
      const message = err instanceof Error ? err.message : 'Avatar update failed';
      return { success: false, error: message };
    }
  },
}));

// ─── Private helpers ──────────────────────────────────────────────────────────

interface UserProfileRow {
  user_id: string;
  phone: string | null;
  birthday: string | null;
  location: string | null;
  avatar_url: string | null;
  featured_stickers: FeaturedSlots | null;
  created_at?: string;
  updated_at?: string;
}

async function fetchProfileRow(userId: string): Promise<UserProfileRow | null> {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as UserProfileRow | null) ?? null;
}

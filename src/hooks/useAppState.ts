import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

export function useAppState() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        // App came to foreground — validate session
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            useAuthStore.getState().setSession(null);
          }
        }

        // App going to background — tell Supabase to stop auto-refresh
        if (nextAppState === 'active') {
          supabase.auth.startAutoRefresh();
        } else {
          supabase.auth.stopAutoRefresh();
        }

        appState.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, []);
}

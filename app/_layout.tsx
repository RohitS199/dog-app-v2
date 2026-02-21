import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';
import { useAppState } from '../src/hooks/useAppState';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  const { session, isLoading, hasAcceptedTerms, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useAppState();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTermsScreen = segments[0] === 'terms';

    if (!session) {
      // Not signed in — go to auth
      if (!inAuthGroup) {
        router.replace('/(auth)/sign-in');
      }
    } else if (!hasAcceptedTerms) {
      // Signed in but hasn't accepted terms
      if (!inTermsScreen) {
        router.replace('/terms');
      }
    } else {
      // Signed in and accepted terms — go to main app
      if (inAuthGroup || inTermsScreen) {
        router.replace('/(tabs)');
      }
    }
  }, [session, isLoading, hasAcceptedTerms, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      <Slot />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

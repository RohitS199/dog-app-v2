import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../src/stores/authStore';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { useAppState } from '../src/hooks/useAppState';
import { SuperwallProviderWrapper } from '../src/providers/SuperwallProvider';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../src/constants/theme';

SplashScreen.preventAutoHideAsync();

function BrandedSplash() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const spinnerOpacity = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Name slide up + tagline + spinner in parallel
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(spinnerOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // Continuous spin
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={splashStyles.container}>
      <Animated.View style={[splashStyles.logoContainer, { opacity: fadeAnim }]}>
        <Image
          source={require('../assets/logo-transparent.png')}
          style={splashStyles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        style={[
          splashStyles.appName,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        PupLog
      </Animated.Text>

      <Animated.Text style={[splashStyles.tagline, { opacity: taglineOpacity }]}>
        KNOW BEFORE THE VET
      </Animated.Text>

      <Animated.View
        style={[
          splashStyles.spinnerContainer,
          { opacity: spinnerOpacity, transform: [{ rotate: spin }] },
        ]}
      >
        <View style={splashStyles.spinner} />
      </Animated.View>

      <StatusBar style="dark" />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EFDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
  },
  appName: {
    fontFamily: FONTS.heading,
    fontSize: 34,
    color: COLORS.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(62, 39, 35, 0.6)',
    letterSpacing: 3,
    fontWeight: '500',
    marginBottom: 48,
  },
  spinnerContainer: {
    width: 32,
    height: 32,
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary,
  },
});

export default function RootLayout() {
  const { session, isLoading, hasAcceptedTerms, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
  });

  useAppState();

  useEffect(() => {
    // Check onboarding completion flag and initialize auth in parallel
    AsyncStorage.getItem('puplog-onboarding-complete').then((val) => {
      setHasSeenOnboarding(val === 'true');
    });
    initialize();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isLoading && hasSeenOnboarding !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading, hasSeenOnboarding]);

  // Sync onboarding data after authentication + terms acceptance
  useEffect(() => {
    if (!session || !hasAcceptedTerms) return;

    const store = useOnboardingStore.getState();
    // Check if there's pending onboarding data to sync (dogProfile has a name)
    if (store.dogProfile.name.trim()) {
      store.syncOnboardingData();
    }
  }, [session, hasAcceptedTerms]);

  useEffect(() => {
    if (isLoading || !fontsLoaded || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTermsScreen = segments[0] === 'terms';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !hasSeenOnboarding && !inOnboarding) {
      // New user: show onboarding first
      router.replace('/onboarding');
    } else if (!session && hasSeenOnboarding && !inAuthGroup && !inOnboarding) {
      // Returning user without session: sign in
      router.replace('/(auth)/sign-in');
    } else if (session && !hasAcceptedTerms && !inTermsScreen) {
      // Authenticated but hasn't accepted terms
      router.replace('/terms');
    } else if (session && hasAcceptedTerms && (inAuthGroup || inTermsScreen || inOnboarding)) {
      // Fully authenticated: go to main app
      router.replace('/(tabs)');
    }
  }, [session, isLoading, hasAcceptedTerms, hasSeenOnboarding, segments, fontsLoaded]);

  if (isLoading || !fontsLoaded || hasSeenOnboarding === null) {
    return <BrandedSplash />;
  }

  return (
    <SuperwallProviderWrapper>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }} />
      <StatusBar style="auto" />
    </SuperwallProviderWrapper>
  );
}

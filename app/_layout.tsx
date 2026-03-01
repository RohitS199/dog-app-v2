import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { useAuthStore } from '../src/stores/authStore';
import { useAppState } from '../src/hooks/useAppState';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
        <View style={splashStyles.logoBox}>
          <MaterialCommunityIcons name="paw" size={60} color="#FFFFFF" />
        </View>
      </Animated.View>

      <Animated.Text
        style={[
          splashStyles.appName,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        PawCheck
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

      <StatusBar style="light" />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  appName: {
    fontFamily: FONTS.heading,
    fontSize: 34,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
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
    borderTopColor: COLORS.accent,
    borderRightColor: COLORS.accent,
  },
});

export default function RootLayout() {
  const { session, isLoading, hasAcceptedTerms, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
  });

  useAppState();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTermsScreen = segments[0] === 'terms';

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/sign-in');
      }
    } else if (!hasAcceptedTerms) {
      if (!inTermsScreen) {
        router.replace('/terms');
      }
    } else {
      if (inAuthGroup || inTermsScreen) {
        router.replace('/(tabs)');
      }
    }
  }, [session, isLoading, hasAcceptedTerms, segments, fontsLoaded]);

  if (isLoading || !fontsLoaded) {
    return <BrandedSplash />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  );
}

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { InputField } from '../../src/components/ui/InputField';
import { Button } from '../../src/components/ui/Button';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Sign in failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoBox, SHADOWS.elevated]}>
              <MaterialCommunityIcons name="paw" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>PawCheck</Text>
            <Text style={styles.tagline}>KNOW BEFORE THE VET</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              icon="email-outline"
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="Email address"
            />

            <InputField
              icon="lock-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              eyeToggle
              autoComplete="password"
              textContentType="password"
              accessibilityLabel="Password"
            />

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable
                style={styles.forgotLink}
                accessibilityRole="link"
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </Link>

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={isSubmitting}
              disabled={isSubmitting}
              icon="arrow-right"
            />

            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable accessibilityRole="link">
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    paddingTop: 80,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.textDisabled,
    letterSpacing: 2.5,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.md,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  forgotText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
  },
  signUpText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  signUpLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: '700',
  },
});

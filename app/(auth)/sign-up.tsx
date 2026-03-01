import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { InputField } from '../../src/components/ui/InputField';
import { Button } from '../../src/components/ui/Button';
import { StepperDots } from '../../src/components/ui/StepperDots';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../../src/constants/theme';
import { LIMITS } from '../../src/constants/config';
import { SafeAreaView } from 'react-native-safe-area-context';

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

const STATS = [
  { value: '2 min', label: 'Daily Check-In', icon: 'clock-outline' as const },
  { value: '5 days', label: 'See Trends', icon: 'chart-line' as const },
  { value: '30 sec', label: 'Symptom Check', icon: 'stethoscope' as const },
];

export default function SignUp() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signUp = useAuthStore((s) => s.signUp);
  const router = useRouter();

  const validateDob = (): boolean => {
    const month = parseInt(dobMonth, 10);
    const day = parseInt(dobDay, 10);
    const year = parseInt(dobYear, 10);

    if (!month || !day || !year || month < 1 || month > 12 || day < 1 || day > 31) {
      setError('Please enter a valid date of birth.');
      return false;
    }

    const dob = new Date(year, month - 1, day);
    if (isNaN(dob.getTime())) {
      setError('Please enter a valid date of birth.');
      return false;
    }

    const age = calculateAge(dob);
    if (age < LIMITS.COPPA_MIN_AGE) {
      setError(`You must be at least ${LIMITS.COPPA_MIN_AGE} years old to use this app.`);
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!validateDob()) return;

    setIsSubmitting(true);
    try {
      await signUp(email.trim().toLowerCase(), password);
      Alert.alert(
        'Check Your Email',
        'We sent you a confirmation link. Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Sign up failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Welcome state
  if (showWelcome) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.welcomeScroll}>
          {/* Hero section */}
          <View style={styles.hero}>
            <View style={styles.heroDecorLeft} />
            <View style={styles.heroDecorRight} />
            <View style={[styles.heroLogo, SHADOWS.elevated]}>
              <MaterialCommunityIcons name="paw" size={48} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              Your Dog's Daily Health Companion
            </Text>

            {/* Stat cards */}
            <View style={styles.statsRow}>
              {STATS.map((stat) => (
                <View key={stat.label} style={[styles.statCard, SHADOWS.card]}>
                  <View style={styles.statIconContainer}>
                    <MaterialCommunityIcons
                      name={stat.icon}
                      size={18}
                      color={COLORS.accent}
                    />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <Button
              title="Get Started"
              onPress={() => setShowWelcome(false)}
              icon="arrow-right"
            />

            <View style={styles.signInRow}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <Pressable onPress={() => router.back()} accessibilityRole="link">
                <Text style={styles.signInLink}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Sign-up form
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
          {/* Header with back button and stepper */}
          <View style={styles.headerRow}>
            <Pressable
              style={[styles.backCircle, SHADOWS.subtle]}
              onPress={() => setShowWelcome(true)}
              accessibilityRole="button"
              accessibilityLabel="Go back to welcome"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          <StepperDots totalSteps={2} currentStep={0} label="Step 1 of 2" />

          <Text style={styles.subtitle}>Create Account</Text>
          <Text style={styles.heading}>Join the Pack!</Text>

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
              placeholder="Password (8+ characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              eyeToggle
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel="Password"
            />

            <InputField
              icon="lock-outline"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              eyeToggle
              textContentType="newPassword"
              accessibilityLabel="Confirm password"
            />

            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <Text style={styles.hint}>
              You must be at least {LIMITS.COPPA_MIN_AGE} years old
            </Text>
            <View style={styles.dobRow}>
              <View style={styles.dobField}>
                <TextInput
                  style={styles.dobInput}
                  value={dobMonth}
                  onChangeText={(t) => setDobMonth(t.replace(/\D/g, '').slice(0, 2))}
                  placeholder="MM"
                  placeholderTextColor={COLORS.textDisabled}
                  keyboardType="number-pad"
                  maxLength={2}
                  accessibilityLabel="Birth month"
                />
              </View>
              <Text style={styles.dobSeparator}>/</Text>
              <View style={styles.dobField}>
                <TextInput
                  style={styles.dobInput}
                  value={dobDay}
                  onChangeText={(t) => setDobDay(t.replace(/\D/g, '').slice(0, 2))}
                  placeholder="DD"
                  placeholderTextColor={COLORS.textDisabled}
                  keyboardType="number-pad"
                  maxLength={2}
                  accessibilityLabel="Birth day"
                />
              </View>
              <Text style={styles.dobSeparator}>/</Text>
              <View style={[styles.dobField, styles.dobYearField]}>
                <TextInput
                  style={styles.dobInput}
                  value={dobYear}
                  onChangeText={(t) => setDobYear(t.replace(/\D/g, '').slice(0, 4))}
                  placeholder="YYYY"
                  placeholderTextColor={COLORS.textDisabled}
                  keyboardType="number-pad"
                  maxLength={4}
                  accessibilityLabel="Birth year"
                />
              </View>
            </View>

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <View style={styles.buttonContainer}>
              <Button
                title="Continue"
                onPress={handleSignUp}
                loading={isSubmitting}
                disabled={isSubmitting}
                icon="arrow-right"
              />
            </View>

            <View style={styles.signInRow}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <Pressable onPress={() => router.back()} accessibilityRole="link">
                <Text style={styles.signInLink}>Sign In</Text>
              </Pressable>
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
  // Welcome styles
  welcomeScroll: {
    flexGrow: 1,
  },
  hero: {
    height: 260,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroDecorLeft: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroDecorRight: {
    position: 'absolute',
    bottom: -20,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroLogo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  welcomeTitle: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
  },
  signInText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  signInLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: '700',
  },
  // Form styles
  scroll: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  headerRow: {
    marginBottom: SPACING.md,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  heading: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  form: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dobField: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: MIN_TOUCH_TARGET,
  },
  dobYearField: {
    flex: 1.5,
  },
  dobInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
  },
  dobSeparator: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.sm,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
    marginLeft: SPACING.md,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
  },
});

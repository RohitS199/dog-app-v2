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
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../src/constants/theme';
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

export default function SignUp() {
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join PawCheck to get educational health guidance for your dog
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textDisabled}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="Email address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={COLORS.textDisabled}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel="Password"
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor={COLORS.textDisabled}
              secureTextEntry
              textContentType="newPassword"
              accessibilityLabel="Confirm password"
            />

            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.hint}>
              You must be at least {LIMITS.COPPA_MIN_AGE} years old to use this
              app
            </Text>
            <View style={styles.dobRow}>
              <TextInput
                style={[styles.input, styles.dobInput]}
                value={dobMonth}
                onChangeText={(t) => setDobMonth(t.replace(/\D/g, '').slice(0, 2))}
                placeholder="MM"
                placeholderTextColor={COLORS.textDisabled}
                keyboardType="number-pad"
                maxLength={2}
                accessibilityLabel="Birth month"
              />
              <Text style={styles.dobSeparator}>/</Text>
              <TextInput
                style={[styles.input, styles.dobInput]}
                value={dobDay}
                onChangeText={(t) => setDobDay(t.replace(/\D/g, '').slice(0, 2))}
                placeholder="DD"
                placeholderTextColor={COLORS.textDisabled}
                keyboardType="number-pad"
                maxLength={2}
                accessibilityLabel="Birth day"
              />
              <Text style={styles.dobSeparator}>/</Text>
              <TextInput
                style={[styles.input, styles.dobYearInput]}
                value={dobYear}
                onChangeText={(t) => setDobYear(t.replace(/\D/g, '').slice(0, 4))}
                placeholder="YYYY"
                placeholderTextColor={COLORS.textDisabled}
                keyboardType="number-pad"
                maxLength={4}
                accessibilityLabel="Birth year"
              />
            </View>

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={isSubmitting}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
            >
              <Text style={styles.backText}>
                Already have an account? Sign In
              </Text>
            </Pressable>
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
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    minHeight: MIN_TOUCH_TARGET,
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dobInput: {
    flex: 1,
    textAlign: 'center',
  },
  dobYearInput: {
    flex: 1.5,
    textAlign: 'center',
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
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
  },
});

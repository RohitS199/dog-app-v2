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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/authStore';
import { useDogStore } from '../src/stores/dogStore';
import { useTriageStore } from '../src/stores/triageStore';
import { useCheckInStore } from '../src/stores/checkInStore';
import { useHealthStore } from '../src/stores/healthStore';
import { useLearnStore } from '../src/stores/learnStore';
import { supabase } from '../src/lib/supabase';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../src/constants/theme';

export default function DeleteAccount() {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const clearDogs = useDogStore((s) => s.clearDogs);
  const clearAll = useTriageStore((s) => s.clearAll);
  const clearCheckIn = useCheckInStore((s) => s.clearAll);
  const clearHealth = useHealthStore((s) => s.clearHealth);
  const clearLearn = useLearnStore((s) => s.clearLearn);
  const router = useRouter();

  const canDelete = password.length > 0 && confirmText === 'DELETE';

  const handleDelete = async () => {
    if (!canDelete || !user) return;

    setError('');
    setIsSubmitting(true);

    try {
      // Verify password by re-authenticating
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email ?? '',
        password,
      });

      if (authError) {
        setError('Incorrect password. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Call delete-account Edge Function
      const { error: deleteError } = await supabase.functions.invoke(
        'delete-account',
        { body: {} }
      );

      if (deleteError) throw deleteError;

      // Clear all local state
      clearDogs();
      clearAll();
      clearCheckIn();
      clearHealth();
      clearLearn();
      await signOut();

      // The auth state change will redirect to sign-in
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete account. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    Alert.alert(
      'Final Confirmation',
      'This will permanently delete your account, all dog profiles, and all triage history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: handleDelete,
        },
      ]
    );
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
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <Text style={styles.title}>Delete Account</Text>

          <View style={styles.warningCard} accessibilityRole="alert">
            <Text style={styles.warningTitle}>This action is permanent</Text>
            <Text style={styles.warningText}>
              Deleting your account will permanently remove:{'\n\n'}
              • Your account and login credentials{'\n'}
              • All dog profiles{'\n'}
              • All triage history{'\n'}
              • Your terms acceptance record{'\n\n'}
              This cannot be undone.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Enter your password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Your current password"
              placeholderTextColor={COLORS.textDisabled}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              accessibilityLabel="Current password to confirm deletion"
            />

            <Text style={styles.label}>
              Type DELETE to confirm
            </Text>
            <TextInput
              style={styles.input}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="DELETE"
              placeholderTextColor={COLORS.textDisabled}
              autoCapitalize="characters"
              accessibilityLabel="Type DELETE to confirm account deletion"
            />

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && canDelete && styles.buttonPressed,
                !canDelete && styles.buttonDisabled,
              ]}
              onPress={handleConfirmDelete}
              disabled={!canDelete || isSubmitting}
              accessibilityRole="button"
            >
              <Text style={styles.deleteButtonText}>
                {isSubmitting
                  ? 'Deleting Account...'
                  : 'Permanently Delete Account'}
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
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: SPACING.lg,
  },
  warningCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginBottom: SPACING.lg,
  },
  warningTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 22,
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
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});

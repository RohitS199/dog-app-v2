import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/authStore';
import { useDogStore } from '../src/stores/dogStore';
import { useTriageStore } from '../src/stores/triageStore';
import { useCheckInStore } from '../src/stores/checkInStore';
import { useHealthStore } from '../src/stores/healthStore';
import { useLearnStore } from '../src/stores/learnStore';
import { supabase } from '../src/lib/supabase';
import { InputField } from '../src/components/ui/InputField';
import { Button } from '../src/components/ui/Button';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../src/constants/theme';

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
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email ?? '',
        password,
      });

      if (authError) {
        setError('Incorrect password. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const { error: deleteError } = await supabase.functions.invoke(
        'delete-account',
        { body: {} }
      );

      if (deleteError) throw deleteError;

      clearDogs();
      clearAll();
      clearCheckIn();
      clearHealth();
      clearLearn();
      await signOut();
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
            style={[styles.backCircle, SHADOWS.subtle]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
          </Pressable>

          <Text style={styles.title}>Delete Account</Text>

          <View style={styles.warningCard} accessibilityRole="alert">
            <MaterialCommunityIcons name="alert-circle" size={24} color={COLORS.error} />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>This action is permanent</Text>
              <Text style={styles.warningText}>
                Deleting your account will permanently remove:
              </Text>
              {[
                'Your account and login credentials',
                'All dog profiles',
                'All triage history',
                'All check-in history',
                'Your terms acceptance record',
              ].map((item, i) => (
                <View key={i} style={styles.warningItem}>
                  <Text style={styles.warningBullet}>{'\u2022'}</Text>
                  <Text style={styles.warningItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.form}>
            <InputField
              icon="lock-outline"
              placeholder="Your current password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              eyeToggle
              autoComplete="password"
              textContentType="password"
              accessibilityLabel="Current password to confirm deletion"
            />

            <InputField
              icon="keyboard-outline"
              placeholder='Type "DELETE" to confirm'
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
              accessibilityLabel="Type DELETE to confirm account deletion"
            />

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <View style={styles.buttonContainer}>
              <Button
                title={isSubmitting ? 'Deleting Account...' : 'Permanently Delete Account'}
                onPress={handleConfirmDelete}
                variant="danger-outline"
                disabled={!canDelete || isSubmitting}
                loading={isSubmitting}
              />
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
    padding: SPACING.lg,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.error,
    marginBottom: SPACING.lg,
  },
  warningCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  warningContent: {
    flex: 1,
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
    marginBottom: SPACING.sm,
  },
  warningItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  warningBullet: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  warningItemText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  form: {
    width: '100%',
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

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
import { InputField } from '../src/components/ui/InputField';
import { Button } from '../src/components/ui/Button';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, FONTS } from '../src/constants/theme';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const changePassword = useAuthStore((s) => s.changePassword);
  const router = useRouter();

  const handleChange = async () => {
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(newPassword);
      Alert.alert('Password Changed', 'Your password has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to change password.'
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
          <Pressable
            style={[styles.backCircle, SHADOWS.subtle]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
          </Pressable>

          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Enter a new password for your account.
          </Text>

          <View style={styles.form}>
            <InputField
              icon="lock-outline"
              placeholder="New password (8+ characters)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              eyeToggle
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel="New password"
            />

            <InputField
              icon="lock-outline"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              eyeToggle
              textContentType="newPassword"
              accessibilityLabel="Confirm new password"
            />

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <View style={styles.buttonContainer}>
              <Button
                title="Update Password"
                onPress={handleChange}
                loading={isSubmitting}
                disabled={isSubmitting}
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
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
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

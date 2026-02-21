import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';
import { EMERGENCY } from '../../constants/config';

interface EmergencyAlertProps {
  matchedPatterns: string[];
  onDismiss: () => void;
}

export function EmergencyAlert({ matchedPatterns, onDismiss }: EmergencyAlertProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>Possible Emergency Detected</Text>
      <Text style={styles.message}>
        Based on what you've described, your dog may need immediate veterinary
        attention. Please don't wait for app results.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
        onPress={() => Linking.openURL(EMERGENCY.SEARCH_EMERGENCY_VET_URL)}
        accessibilityRole="button"
        accessibilityLabel="Find emergency vet near you"
      >
        <Text style={styles.callButtonText}>Find Emergency Vet Now</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
        onPress={onDismiss}
        accessibilityRole="button"
      >
        <Text style={styles.continueText}>
          Continue with symptom check anyway
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFEBEE',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.emergency,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.emergency,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  callButton: {
    backgroundColor: COLORS.emergency,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  continueButton: {
    padding: SPACING.sm,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  continueText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    textDecorationLine: 'underline',
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';

interface TriageNudgeProps {
  triageCount: number;
  onDismiss: () => void;
}

export function TriageNudge({ triageCount, onDismiss }: TriageNudgeProps) {
  if (triageCount < 3) return null;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>
        You've checked symptoms {triageCount} times in the past week. If you're
        worried about your dog, seeing a vet is always the best option.
      </Text>
      <Pressable
        style={styles.dismissButton}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss suggestion"
      >
        <Text style={styles.dismissText}>Got it</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E3F2FD',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  dismissButton: {
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
    padding: SPACING.xs,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  dismissText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});

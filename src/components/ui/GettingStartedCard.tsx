import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';

interface GettingStartedCardProps {
  streak: number;
  onCheckIn: () => void;
}

export function GettingStartedCard({ streak, onCheckIn }: GettingStartedCardProps) {
  // Auto-dismiss after 5+ days of check-ins
  if (streak >= 5) return null;

  let title: string;
  let message: string;

  if (streak === 0) {
    title = 'Start Your First Check-In';
    message = 'Log daily health observations to track your dog\'s well-being over time.';
  } else {
    const remaining = 5 - streak;
    title = `${remaining} more day${remaining === 1 ? '' : 's'} until insights`;
    message = `Keep logging daily check-ins to unlock health trend analysis and pattern alerts.`;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onCheckIn}
        accessibilityRole="button"
        accessibilityLabel="Start daily check-in"
      >
        <Text style={styles.buttonText}>Check In Now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.md,
    marginBottom: 0,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  if (streak <= 0) return null;

  return (
    <View
      style={styles.container}
      accessibilityLabel={`${streak}-day check-in streak`}
    >
      <Text style={styles.number}>{streak}</Text>
      <Text style={styles.label}>day streak!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
    gap: SPACING.xs,
  },
  number: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.accent,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.accent,
  },
});

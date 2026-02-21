import { StyleSheet, Text, View } from 'react-native';
import { URGENCY_CONFIG, type UrgencyLevel, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface UrgencyBadgeProps {
  level: UrgencyLevel;
  size?: 'small' | 'large';
}

export function UrgencyBadge({ level, size = 'small' }: UrgencyBadgeProps) {
  const config = URGENCY_CONFIG[level];
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.color,
          paddingHorizontal: isLarge ? SPACING.lg : SPACING.md,
          paddingVertical: isLarge ? SPACING.sm : SPACING.xs,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Urgency level: ${config.label}. ${config.description}`}
    >
      <View
        style={[styles.dot, { backgroundColor: config.color }]}
        accessibilityElementsHidden
      />
      <Text
        style={[
          styles.label,
          {
            color: config.color,
            fontSize: isLarge ? FONT_SIZES.lg : FONT_SIZES.sm,
            fontWeight: isLarge ? '700' : '600',
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  label: {
    letterSpacing: 0.3,
  },
});

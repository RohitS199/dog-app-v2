import { StyleSheet, Text, View } from 'react-native';
import { ALERT_LEVEL_CONFIG } from '../../constants/theme';
import type { AlertLevel } from '../../types/health';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface AlertLevelBadgeProps {
  level: AlertLevel;
}

export function AlertLevelBadge({ level }: AlertLevelBadgeProps) {
  const config = ALERT_LEVEL_CONFIG[level];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.backgroundColor, borderColor: config.color },
      ]}
      accessibilityLabel={`Alert level: ${config.label}`}
    >
      <Text style={[styles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET, ALERT_LEVEL_CONFIG } from '../../constants/theme';
import type { PatternAlert } from '../../types/health';
import { AlertLevelBadge } from './AlertLevelBadge';

interface PatternAlertCardProps {
  alert: PatternAlert;
  onDismiss: (alertId: string) => void;
}

export function PatternAlertCard({ alert, onDismiss }: PatternAlertCardProps) {
  const config = ALERT_LEVEL_CONFIG[alert.alert_level];
  const isVetRecommended = alert.alert_level === 'vet_recommended';

  return (
    <View
      style={[styles.card, { borderLeftColor: config.color }]}
      accessibilityRole="alert"
    >
      <View style={styles.header}>
        <AlertLevelBadge level={alert.alert_level} />
        <Pressable
          style={styles.dismissButton}
          onPress={() => onDismiss(alert.id)}
          accessibilityRole="button"
          accessibilityLabel={`Dismiss alert: ${alert.title}`}
        >
          <Text style={styles.dismissText}>Dismiss</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.message}>{alert.message}</Text>

      {alert.ai_insight && (
        <View style={styles.aiInsightSection}>
          <Text style={styles.aiInsightLabel}>AI Analysis</Text>
          <Text style={styles.aiInsightText}>{alert.ai_insight}</Text>
        </View>
      )}

      {isVetRecommended && (
        <View style={styles.vetBanner}>
          <Text style={styles.vetText}>Contact Your Vet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dismissButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  dismissText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  aiInsightSection: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  aiInsightLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  aiInsightText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  vetBanner: {
    marginTop: SPACING.sm,
    backgroundColor: '#FFEBEE',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  vetText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.emergency,
  },
});

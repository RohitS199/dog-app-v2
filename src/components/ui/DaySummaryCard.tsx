import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';
import type { DaySummary } from '../../types/health';
import type { AnalyzePatternsResponse } from '../../types/health';

interface DaySummaryCardProps {
  summary: DaySummary;
  streak: number;
  alertsResult?: AnalyzePatternsResponse | null;
  onDone: () => void;
}

const SUMMARY_STYLES = {
  all_normal: {
    borderColor: '#388E3C',
    backgroundColor: '#E8F5E9',
    icon: 'Great job!',
  },
  minor_notes: {
    borderColor: '#F57C00',
    backgroundColor: '#FFF8E1',
    icon: 'A few notes',
  },
  attention_needed: {
    borderColor: '#E65100',
    backgroundColor: '#FBE9E7',
    icon: 'Heads up',
  },
  vet_recommended: {
    borderColor: '#C62828',
    backgroundColor: '#FFEBEE',
    icon: 'Important',
  },
} as const;

export function DaySummaryCard({
  summary,
  streak,
  alertsResult,
  onDone,
}: DaySummaryCardProps) {
  const style = SUMMARY_STYLES[summary.type];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check-In Saved</Text>

      {streak > 0 && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>
            {streak}-day streak!
          </Text>
        </View>
      )}

      <View
        style={[
          styles.summaryCard,
          { borderLeftColor: style.borderColor, backgroundColor: style.backgroundColor },
        ]}
      >
        <Text style={styles.summaryIcon}>{style.icon}</Text>
        <Text style={styles.summaryMessage}>{summary.message}</Text>

        {summary.abnormalities.length > 0 && (
          <View style={styles.abnormalities}>
            {summary.abnormalities.map((a, i) => (
              <Text key={i} style={styles.abnormalityItem}>
                {'\u2022'} {a}
              </Text>
            ))}
          </View>
        )}
      </View>

      {alertsResult && alertsResult.patterns.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.alertsTitle}>
            Pattern Alerts ({alertsResult.patterns.length})
          </Text>
          {alertsResult.patterns.map((alert) => (
            <View key={alert.id} style={styles.alertRow}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.doneButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onDone}
        accessibilityRole="button"
        accessibilityLabel="Done"
      >
        <Text style={styles.doneText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  streakBadge: {
    backgroundColor: '#E8F0E1',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.lg,
  },
  streakText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  summaryCard: {
    width: '100%',
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  summaryIcon: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  summaryMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  abnormalities: {
    marginTop: SPACING.sm,
  },
  abnormalityItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  alertsSection: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  alertsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  alertRow: {
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  alertTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  alertMessage: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

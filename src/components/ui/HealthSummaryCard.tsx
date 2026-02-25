import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';
import type { HealthSummary } from '../../types/api';

interface HealthSummaryCardProps {
  summary: HealthSummary;
  dogName: string;
}

const BASELINE_LABELS: Record<string, Record<string, string>> = {
  typical_appetite: { normal: 'Normal', below_normal: 'Below Normal', above_normal: 'Above Normal' },
  typical_water_intake: { normal: 'Normal', below_normal: 'Below Normal', above_normal: 'Above Normal' },
  typical_energy: { normal: 'Normal', below_normal: 'Below Normal', above_normal: 'Above Normal' },
  typical_stool: { normal: 'Normal', irregular: 'Irregular' },
  typical_mobility: { normal: 'Normal', limited: 'Limited' },
  typical_mood: { normal: 'Normal', anxious: 'Anxious', quiet: 'Quiet' },
};

const BASELINE_DISPLAY_NAMES: Record<string, string> = {
  typical_appetite: 'Appetite',
  typical_water_intake: 'Water Intake',
  typical_energy: 'Energy',
  typical_stool: 'Stool',
  typical_mobility: 'Mobility',
  typical_mood: 'Mood',
};

function getRelativeTime(dateString: string): string {
  const updated = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - updated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays <= 7) return `Updated ${diffDays} days ago`;
  return `Updated on ${updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export function HealthSummaryCard({ summary, dogName }: HealthSummaryCardProps) {
  const [showBaseline, setShowBaseline] = useState(false);
  const latestAnnotation = summary.annotations.length > 0
    ? summary.annotations[summary.annotations.length - 1]
    : null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{dogName}'s Health Profile</Text>
      <Text style={styles.summaryText}>{summary.summary_text}</Text>

      {latestAnnotation && (
        <View style={styles.annotationSection}>
          <Text style={styles.annotationLabel}>Latest Note</Text>
          <Text style={styles.annotationText}>{latestAnnotation}</Text>
        </View>
      )}

      <Pressable
        style={styles.baselineToggle}
        onPress={() => setShowBaseline(!showBaseline)}
        accessibilityRole="button"
        accessibilityLabel={showBaseline ? 'Hide baseline profile' : 'Show baseline profile'}
      >
        <Text style={styles.baselineToggleText}>
          {showBaseline ? 'Hide Baseline' : 'View Baseline'}
        </Text>
        <Text style={styles.toggleArrow} accessibilityElementsHidden>
          {showBaseline ? '\u25B2' : '\u25BC'}
        </Text>
      </Pressable>

      {showBaseline && (
        <View style={styles.baselineGrid}>
          {Object.entries(BASELINE_DISPLAY_NAMES).map(([key, displayName]) => {
            const value = summary.baseline_profile[key as keyof typeof summary.baseline_profile];
            if (value === null || Array.isArray(value)) return null;
            const label = BASELINE_LABELS[key]?.[value] ?? value;
            return (
              <View key={key} style={styles.baselineRow}>
                <Text style={styles.baselineKey}>{displayName}</Text>
                <Text style={styles.baselineValue}>{label}</Text>
              </View>
            );
          })}
          {summary.baseline_profile.vomiting_history_note && (
            <View style={styles.baselineRow}>
              <Text style={styles.baselineKey}>Vomiting Note</Text>
              <Text style={styles.baselineValue}>{summary.baseline_profile.vomiting_history_note}</Text>
            </View>
          )}
          {summary.baseline_profile.known_sensitivities.length > 0 && (
            <View style={styles.baselineRow}>
              <Text style={styles.baselineKey}>Sensitivities</Text>
              <Text style={styles.baselineValue}>
                {summary.baseline_profile.known_sensitivities.join(', ')}
              </Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.lastUpdated}>{getRelativeTime(summary.last_updated)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  summaryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  annotationSection: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  annotationLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  annotationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  baselineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
    marginTop: SPACING.sm,
  },
  baselineToggleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  toggleArrow: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  baselineGrid: {
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  baselineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  baselineKey: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  baselineValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  lastUpdated: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    marginTop: SPACING.sm,
    textAlign: 'right',
  },
});

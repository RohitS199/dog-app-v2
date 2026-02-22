import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import type { ConsistencyScore } from '../../types/health';

interface ConsistencyCardProps {
  score: ConsistencyScore;
}

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Very Inconsistent', color: '#C62828' },
  2: { label: 'Somewhat Inconsistent', color: '#E65100' },
  3: { label: 'Moderate', color: '#F57C00' },
  4: { label: 'Fairly Consistent', color: '#388E3C' },
  5: { label: 'Very Consistent', color: '#2E7D32' },
};

export function ConsistencyCard({ score }: ConsistencyCardProps) {
  const config = SCORE_LABELS[score.score] ?? SCORE_LABELS[3];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>7-Day Consistency</Text>
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreNumber, { color: config.color }]}>
          {score.score}/5
        </Text>
        <Text style={[styles.scoreLabel, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
      <View style={styles.dotsRow}>
        {Array.from({ length: 5 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < score.score
                ? { backgroundColor: config.color }
                : { backgroundColor: COLORS.border },
            ]}
          />
        ))}
      </View>
      <Text style={styles.detail}>
        {score.matchCount} of {score.totalFields} metrics match your baseline today
      </Text>
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
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  scoreNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  dot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  detail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});

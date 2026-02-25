import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET, ALERT_LEVEL_CONFIG } from '../../constants/theme';
import type { AIHealthInsight } from '../../types/health';
import { AlertLevelBadge } from './AlertLevelBadge';

interface AIInsightCardProps {
  insight: AIHealthInsight;
  onArticlePress: (slug: string) => void;
}

export function AIInsightCard({ insight, onArticlePress }: AIInsightCardProps) {
  const leftColor = insight.is_positive
    ? COLORS.success
    : ALERT_LEVEL_CONFIG[insight.severity].color;

  return (
    <View style={[styles.card, { borderLeftColor: leftColor }]}>
      <View style={styles.header}>
        <AlertLevelBadge level={insight.severity} />
        {insight.is_positive && (
          <View style={styles.positiveBadge}>
            <Text style={styles.positiveText}>Good sign</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{insight.title}</Text>
      <Text style={styles.message}>{insight.message}</Text>

      {insight.recommended_articles.length > 0 && (
        <View style={styles.articlesSection}>
          <Text style={styles.articlesLabel}>Recommended Reading</Text>
          {insight.recommended_articles.map((article) => (
            <Pressable
              key={article.slug}
              style={styles.articleRow}
              onPress={() => onArticlePress(article.slug)}
              accessibilityRole="link"
              accessibilityLabel={`Read article: ${article.reason}`}
            >
              <Text style={styles.articleReason} numberOfLines={2}>
                {article.reason}
              </Text>
              <Text style={styles.articleArrow} accessibilityElementsHidden>
                {'>'}
              </Text>
            </Pressable>
          ))}
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
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  positiveBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  positiveText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
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
  articlesSection: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  articlesLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH_TARGET,
    paddingVertical: SPACING.xs,
  },
  articleReason: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  articleArrow: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});

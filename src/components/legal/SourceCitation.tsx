import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { TriageSource } from '../../types/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';

interface SourceCitationProps {
  sources: TriageSource[];
}

const TIER_LABELS: Record<number, string> = {
  1: 'Veterinary Reference',
  1.5: 'Professional Reference',
  2: 'Veterinary Institution',
  3: 'Veterinary Practice',
};

export function SourceCitation({ sources }: SourceCitationProps) {
  if (sources.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sources</Text>
      {sources.map((source, index) => (
        <Pressable
          key={index}
          style={({ pressed }) => [
            styles.sourceRow,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            if (source.url) {
              Linking.openURL(source.url);
            }
          }}
          accessibilityRole="link"
          accessibilityLabel={`Source: ${source.name}, ${TIER_LABELS[source.tier] ?? 'Reference'}`}
          accessibilityHint={source.url ? 'Opens in browser' : undefined}
          disabled={!source.url}
        >
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>
              {TIER_LABELS[source.tier] ?? `Tier ${source.tier}`}
            </Text>
          </View>
          <Text
            style={[styles.sourceName, source.url && styles.sourceLink]}
            numberOfLines={2}
          >
            {source.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  header: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    minHeight: MIN_TOUCH_TARGET,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  pressed: {
    opacity: 0.7,
  },
  tierBadge: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  tierText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  sourceName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  sourceLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

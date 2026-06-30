import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OB_COLORS, OB_FONTS, OB_SHADOWS } from '../../constants/onboardingTheme';
import type { WeekSummary, WeekTone } from '../../lib/weekGrouping';

export const WEEK_TONE_COLORS: Record<WeekTone, { fill: string; wash: string }> = {
  thriving: { fill: OB_COLORS.toneThriving, wash: OB_COLORS.toneThrivingWash },
  okay: { fill: OB_COLORS.toneOkay, wash: OB_COLORS.toneOkayWash },
  attention: { fill: OB_COLORS.toneAttention, wash: OB_COLORS.toneAttentionWash },
  concern: { fill: OB_COLORS.toneConcern, wash: OB_COLORS.toneConcernWash },
  empty: { fill: OB_COLORS.washNeutral, wash: OB_COLORS.washNeutral },
};

const TOTAL_DAYS = 7;
const DOT_SIZE = 8;
const DOT_GAP = 4;

// Caring-neutral text markers for weeks containing attention/vet-tier days.
// The tone wash alone is color-only encoding — these keep the health signal
// readable (WCAG 1.4.1) and honest (Golden Rule: never soften a tough week
// into a pretty card with no words).
const TONE_NOTE: Partial<Record<WeekTone, string>> = {
  attention: 'A bumpy week',
  concern: 'A tough week',
};

export interface WeekSceneCardProps {
  summary: WeekSummary;
  onPress?: () => void;
  rotation?: number;
}

export function WeekSceneCard({ summary, onPress, rotation = -2 }: WeekSceneCardProps) {
  const toneColors = WEEK_TONE_COLORS[summary.tone];
  const toneNote = TONE_NOTE[summary.tone];
  const accessibilityLabel =
    'Week of ' + summary.label + ', ' + summary.loggedCount + ' of 7 days logged' +
    (toneNote ? '. ' + toneNote : '');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={accessibilityLabel}
      style={[styles.card, { transform: [{ rotate: rotation + 'deg' }] }]}
    >
      {/* Scene area */}
      <View style={[styles.scene, { backgroundColor: toneColors.wash }]}>
        {/* Decorative home icon */}
        <MaterialCommunityIcons
          name="home-variant-outline"
          size={28}
          color={OB_COLORS.ink2}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        {/* Day-dot row */}
        <View style={styles.dotRow}>
          {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
            const isLogged = i < summary.loggedCount;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isLogged
                    ? { backgroundColor: toneColors.fill }
                    : {
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        borderWidth: 1,
                        borderColor: OB_COLORS.muted,
                      },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Caption */}
      <Text style={styles.dateLabel} numberOfLines={1}>
        {summary.label}
      </Text>
      <Text style={styles.countLabel}>{summary.loggedCount}/7 days</Text>
      {toneNote ? <Text style={styles.toneNote}>{toneNote}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 132,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: OB_COLORS.sketch,
    borderRadius: 8,
    padding: 8,
    ...OB_SHADOWS.card,
  },
  scene: {
    height: 84,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRow: {
    position: 'absolute',
    bottom: 6,
    flexDirection: 'row',
    gap: DOT_GAP,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dateLabel: {
    fontFamily: OB_FONTS.handwritten,
    fontSize: 16,
    color: OB_COLORS.ink,
    marginTop: 6,
  },
  countLabel: {
    fontFamily: OB_FONTS.dataLabel,
    fontSize: 11,
    color: OB_COLORS.ink2,
    marginTop: 2,
  },
  toneNote: {
    fontFamily: OB_FONTS.btnLabel,
    fontSize: 11,
    color: OB_COLORS.ink,
    marginTop: 2,
  },
});

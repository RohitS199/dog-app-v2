import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — @expo/vector-icons type resolution is broken repo-wide (24 pre-existing tsc errors); suppressed so new files stay out of the error baseline
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

export interface WeekSceneCardProps {
  summary: WeekSummary;
  onPress?: () => void;
  rotation?: number;
}

export function WeekSceneCard({ summary, onPress, rotation = -2 }: WeekSceneCardProps) {
  const toneColors = WEEK_TONE_COLORS[summary.tone];
  const accessibilityLabel =
    'Week of ' + summary.label + ', ' + summary.loggedCount + ' of 7 days logged';

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
});

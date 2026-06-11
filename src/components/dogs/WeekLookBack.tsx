import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OB_COLORS, OB_FONTS } from '../../constants/onboardingTheme';
import { MIN_TOUCH_TARGET } from '../../constants/theme';
import { WeekSceneCard } from './WeekSceneCard';
import type { WeekSummary } from '../../lib/weekGrouping';

const PREVIEW_COUNT = 3;
const POLAROID_ROTATIONS: number[] = [-2, 1.5, -1];

export interface WeekLookBackProps {
  weeks: WeekSummary[];
  dogName: string;
  onSeeMore: () => void;
}

export function WeekLookBack({ weeks, dogName, onSeeMore }: WeekLookBackProps) {
  const previewWeeks = weeks.slice(0, PREVIEW_COUNT);
  const showSeeMore = weeks.length > PREVIEW_COUNT;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>{dogName + "'s house & garden"}</Text>

      {/* Body */}
      {weeks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {'No weeks logged yet — check in to grow ' + dogName + "'s garden."}
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {previewWeeks.map((week, index) => (
            <WeekSceneCard
              key={week.weekStartDate}
              summary={week}
              rotation={POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length]}
            />
          ))}
        </ScrollView>
      )}

      {/* See more */}
      {showSeeMore && (
        <Pressable
          onPress={onSeeMore}
          accessibilityRole="button"
          accessibilityLabel={'See all weeks for ' + dogName}
          style={styles.seeMoreBtn}
        >
          <Text style={styles.seeMoreText}>{'See more ›'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    fontFamily: OB_FONTS.h2,
    fontSize: 19,
    color: OB_COLORS.ink,
    marginBottom: 8,
  },
  scrollContent: {
    gap: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  emptyState: {
    backgroundColor: OB_COLORS.washNeutral,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: OB_COLORS.sketch,
    borderRadius: 8,
    padding: 16,
    transform: [{ rotate: '-1.5deg' }],
  },
  emptyText: {
    fontFamily: OB_FONTS.dataValue,
    fontSize: 14,
    color: OB_COLORS.ink2,
    textAlign: 'center',
  },
  seeMoreBtn: {
    minHeight: MIN_TOUCH_TARGET,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  seeMoreText: {
    fontFamily: OB_FONTS.btnLabel,
    fontSize: 15,
    color: OB_COLORS.wood,
  },
});

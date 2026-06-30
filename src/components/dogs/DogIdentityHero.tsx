import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  OB_BORDERS,
  OB_BUTTON_PRESS_TRANSLATE,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
} from '../../constants/onboardingTheme';
import { MIN_TOUCH_TARGET } from '../../constants/theme';
import { describeDog } from '../../lib/dogPersonality';
import { generateDaySummary } from '../../lib/daySummary';
import type { Dog } from '../../types/api';
import type { DailyCheckIn, Mood } from '../../types/checkIn';

const MOOD_LABEL: Record<Mood, string> = {
  normal: 'feeling good',
  quiet: 'quiet',
  anxious: 'anxious',
  clingy: 'clingy',
  hiding: 'hiding',
  aggressive: 'on edge',
};

const PORTRAIT_SIZE = 104;
const PORTRAIT_BORDER = OB_BORDERS.standard; // 2
const PORTRAIT_INNER_PAD = 4;

export interface DogIdentityHeroProps {
  dog: Dog;
  todayCheckIn: DailyCheckIn | null;
  onStartCheckIn: () => void;
}

function tenureLabel(createdAt: string): string {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const diffMs = now - created;
  const years = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
  if (years < 1) return 'with you <1 yr';
  if (years === 1) return 'with you 1 yr';
  return `with you ${years} yrs`;
}

export function DogIdentityHero({ dog, todayCheckIn, onStartCheckIn }: DogIdentityHeroProps) {
  const initial = dog.name.charAt(0).toUpperCase();
  const personality = describeDog(dog);

  const breedChip = dog.breed;
  const ageChip =
    dog.age_years < 1 ? '<1 yr' : dog.age_years === 1 ? '1 yr' : `${dog.age_years} yrs`;
  const tenureChip = tenureLabel(dog.created_at);

  // Mood-only copy like "feeling good" must never contradict a day whose
  // overall summary tier needs attention — keep the chip neutral then.
  const todayTier = todayCheckIn ? generateDaySummary(todayCheckIn).type : null;
  const isConcerningDay =
    todayTier === 'attention_needed' || todayTier === 'vet_recommended';
  const loggedLabel = todayCheckIn
    ? isConcerningDay
      ? 'Logged today'
      : `Logged · ${MOOD_LABEL[todayCheckIn.mood]} today`
    : null;

  return (
    <View style={styles.container}>
      {/* Portrait */}
      <View style={styles.portraitRing}>
        <View style={styles.portraitInner}>
          {dog.photo_url ? (
            <Image
              source={{ uri: dog.photo_url }}
              style={styles.portraitImage}
              resizeMode="cover"
              accessibilityLabel={`${dog.name} photo`}
            />
          ) : (
            <View style={styles.portraitFallback}>
              <Text style={styles.portraitInitial} accessibilityLabel={dog.name}>
                {initial}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Name */}
      <Text style={styles.name}>{dog.name}</Text>

      {/* Identity chips */}
      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{breedChip}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{ageChip}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{tenureChip}</Text>
        </View>
      </View>

      {/* Personality line */}
      <Text style={styles.personality}>{personality}</Text>

      {/* Today state */}
      {loggedLabel ? (
        <View style={[styles.loggedChip, isConcerningDay && styles.loggedChipNeutral]}>
          <Text style={[styles.loggedText, isConcerningDay && styles.loggedTextNeutral]}>
            {loggedLabel}
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={onStartCheckIn}
          accessibilityRole="button"
          accessibilityLabel={"Start today's check-in for " + dog.name}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed
              ? { ...OB_SHADOWS.buttonPressed, transform: [{ translateY: OB_BUTTON_PRESS_TRANSLATE }] }
              : OB_SHADOWS.button,
          ]}
        >
          <Text style={styles.ctaText}>{"How's " + dog.name + ' today?'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const outerPortraitSize = PORTRAIT_SIZE + PORTRAIT_BORDER * 2 + PORTRAIT_INNER_PAD * 2;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  portraitRing: {
    width: outerPortraitSize,
    height: outerPortraitSize,
    borderRadius: outerPortraitSize / 2,
    borderWidth: PORTRAIT_BORDER,
    borderColor: OB_COLORS.sketch,
    padding: PORTRAIT_INNER_PAD,
    backgroundColor: OB_COLORS.cardWhite,
    // No overflow:'hidden' here — it would clip the iOS shadow; portraitInner
    // does the circular clipping.
    ...OB_SHADOWS.card,
  },
  portraitInner: {
    flex: 1,
    borderRadius: (outerPortraitSize - PORTRAIT_BORDER * 2 - PORTRAIT_INNER_PAD * 2) / 2,
    overflow: 'hidden',
  },
  portraitImage: {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
  },
  portraitFallback: {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
    backgroundColor: OB_COLORS.cream2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitInitial: {
    fontFamily: OB_FONTS.h1,
    fontSize: 44,
    color: OB_COLORS.woodDk,
    lineHeight: 52,
  },
  name: {
    fontFamily: OB_FONTS.h1,
    fontSize: 34,
    color: OB_COLORS.ink,
    marginTop: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: OB_COLORS.peachSoft,
    borderRadius: OB_RADII.chip,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: OB_FONTS.dataLabel,
    fontSize: 12,
    color: OB_COLORS.ink2,
  },
  personality: {
    fontFamily: OB_FONTS.handwritten,
    fontSize: 20,
    color: OB_COLORS.ink,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 10,
  },
  loggedChip: {
    backgroundColor: OB_COLORS.selectedBg,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 14,
  },
  loggedText: {
    fontFamily: OB_FONTS.btnLabel,
    fontSize: 13,
    color: OB_COLORS.accent,
  },
  // Neutral (non-celebratory) variant for attention/vet-tier days — the sage
  // "all good" look must not appear on a day that needs watching.
  loggedChipNeutral: {
    backgroundColor: OB_COLORS.washNeutral,
  },
  loggedTextNeutral: {
    color: OB_COLORS.ink2,
  },
  ctaButton: {
    backgroundColor: OB_COLORS.cta,
    borderRadius: OB_RADII.pillBtn,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: 24,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  ctaText: {
    fontFamily: OB_FONTS.btnLabel,
    fontSize: 15,
    color: OB_COLORS.ink,
  },
});

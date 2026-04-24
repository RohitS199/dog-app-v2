import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScreenTransition } from './ScreenTransition';
import { BiscuitMascot } from './BiscuitMascot';
import { useOnboardingStore } from '../../stores/onboardingStore';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_SPACING,
  OB_RADII,
  OB_BORDERS,
} from '../../constants/onboardingTheme';

interface BuildingPlanScreenProps {
  onNext: () => void;
}

const CHECKLIST_ITEMS = [
  'Analyzing breed risks',
  'Tuning check-in questions',
] as const;

function getThirdItem(lifeStage: string | null): string {
  return `Calibrating AI for ${lifeStage || 'your pup'}`;
}

const FOURTH_ITEM = 'Preparing your garden';

export function BuildingPlanScreen({ onNext }: BuildingPlanScreenProps) {
  const { dogProfile, buildingStep, setBuildingStep } = useOnboardingStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAdvancedRef = useRef(false);

  const name = dogProfile.name || 'your pup';
  const allItems = [
    CHECKLIST_ITEMS[0],
    CHECKLIST_ITEMS[1],
    getThirdItem(dogProfile.lifeStage),
    FOURTH_ITEM,
  ];

  useEffect(() => {
    // Reset building step on mount
    setBuildingStep(0);
    hasAdvancedRef.current = false;

    let step = 0;
    intervalRef.current = setInterval(() => {
      step += 1;
      if (step <= 3) {
        setBuildingStep(step);
      }
      if (step >= 3) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Wait 800ms then advance
        timeoutRef.current = setTimeout(() => {
          if (!hasAdvancedRef.current) {
            hasAdvancedRef.current = true;
            onNext();
          }
        }, 800);
      }
    }, 600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const progressPercent = Math.min(100, ((buildingStep + 1) / 4) * 100);

  return (
    <OnboardingShell step={12} showSkip={false} scrollable={false}>
      <ScreenTransition step={12}>
        <View style={styles.content}>
          <View style={styles.mascotWrapper}>
            <BiscuitMascot size="lg" />
          </View>

          <Text style={styles.heading}>
            Building {name}{'\''}s plan...
          </Text>

          <View style={styles.checklist}>
            {allItems.map((item, index) => {
              const isDone = index <= buildingStep;
              return (
                <View key={index} style={styles.checklistRow}>
                  <Text
                    style={[
                      styles.checkmark,
                      isDone ? styles.checkmarkDone : styles.checkmarkPending,
                    ]}
                  >
                    {isDone ? '\u2713' : '...'}
                  </Text>
                  <Text style={styles.checklistText}>{item}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.progressWrapper}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.percentLabel}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
        </View>
      </ScreenTransition>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotWrapper: {
    marginBottom: OB_SPACING.mascotPadding,
  },
  heading: {
    fontFamily: OB_FONTS.h2,
    fontSize: OB_FONT_SIZES.h2,
    color: OB_COLORS.ink,
    textAlign: 'center',
    marginBottom: OB_SPACING.sectionGap,
    lineHeight: OB_FONT_SIZES.h2 * 1.25,
  },
  checklist: {
    gap: OB_SPACING.gap2,
    marginBottom: OB_SPACING.gap4,
    alignSelf: 'center',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: OB_SPACING.mt2,
  },
  checkmark: {
    fontFamily: OB_FONTS.h1,
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  checkmarkDone: {
    color: OB_COLORS.greenDk,
  },
  checkmarkPending: {
    color: OB_COLORS.muted,
  },
  checklistText: {
    fontFamily: OB_FONTS.h3,
    fontSize: 13,
    color: OB_COLORS.ink,
  },
  progressWrapper: {
    alignItems: 'center',
    gap: OB_SPACING.mt1,
  },
  // Ceremony progress bar (distinct from the thin top-bar progress in OnboardingProgressBar).
  // Intentionally chunkier with a hand-drawn sketch border to match the "building your plan" moment.
  progressTrack: {
    width: 200,
    height: 6,
    backgroundColor: OB_COLORS.cream,
    borderWidth: 1.5,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.progress,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: OB_COLORS.peach2,
    borderRadius: OB_RADII.progress,
  },
  percentLabel: {
    fontFamily: OB_FONTS.label,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.muted,
  },
});

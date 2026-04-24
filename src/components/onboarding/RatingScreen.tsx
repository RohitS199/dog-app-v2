import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  useReducedMotion,
} from 'react-native-reanimated';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { BiscuitMascot } from './BiscuitMascot';
import { ScreenTransition } from './ScreenTransition';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_SPACING,
} from '../../constants/onboardingTheme';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { haptic } from '../../lib/haptics';

interface RatingScreenProps {
  onNext: () => void;
}

const STAR_COUNT = 5;
const STAR_STAGGER_MS = 60;

function AnimatedStar({
  index,
  filled,
  onPress,
}: {
  index: number;
  filled: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(filled ? 1 : 0);
  const reducedMotion = useReducedMotion();

  // Animate when filled changes to true
  React.useEffect(() => {
    if (filled) {
      if (reducedMotion) {
        scale.value = 1;
      } else {
        scale.value = withDelay(
          index * STAR_STAGGER_MS,
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(1.2, { duration: 120 }),
            withTiming(1, { duration: 100 }),
          ),
        );
      }
    } else {
      scale.value = withTiming(0, { duration: 80 });
    }
  }, [filled, reducedMotion, index]);

  const filledStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.starButton}
      accessibilityRole="radio"
      accessibilityState={{ selected: filled }}
      accessibilityLabel={`${index + 1} star${index === 0 ? '' : 's'}`}
      hitSlop={4}
    >
      {/* Empty star (always visible) */}
      <Text style={styles.starEmpty}>{'\u2605'}</Text>
      {/* Filled star (animated on top) */}
      <Animated.View style={[styles.starFilledWrapper, filledStyle]}>
        <Text style={styles.starFilled}>{'\u2605'}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function RatingScreen({ onNext }: RatingScreenProps) {
  const starRating = useOnboardingStore((s) => s.starRating);
  const setStarRating = useOnboardingStore((s) => s.setStarRating);

  const handleStarPress = useCallback(
    (rating: number) => {
      haptic('light');
      setStarRating(rating);
    },
    [setStarRating],
  );

  return (
    <OnboardingShell step={17} showSkip={false}>
      <ScreenTransition step={17}>
        <View style={styles.content}>
          <View style={styles.centered}>
            <View style={styles.mascotWrapper}>
              <BiscuitMascot size="md" />
            </View>

            <Text style={styles.h2}>Enjoying PupLog so far?</Text>
            <Text style={styles.body}>
              Ratings help other dog parents find us.
            </Text>

            <View
              style={styles.starRow}
              accessibilityRole="radiogroup"
              accessibilityLabel="Star rating"
            >
              {Array.from({ length: STAR_COUNT }, (_, i) => (
                <AnimatedStar
                  key={i}
                  index={i}
                  filled={starRating !== null && i < starRating}
                  onPress={() => handleStarPress(i + 1)}
                />
              ))}
            </View>
          </View>

          <View style={styles.buttonWrapper}>
            <ScrapbookButton
              label="Submit rating"
              onPress={onNext}
              disabled={starRating === null}
              testID="rating-next-button"
            />
          </View>
        </View>
      </ScreenTransition>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotWrapper: {
    marginBottom: OB_SPACING.mascotPadding,
  },
  h2: {
    fontFamily: OB_FONTS.h2,
    fontSize: OB_FONT_SIZES.h2,
    color: OB_COLORS.ink,
    textAlign: 'center',
    marginBottom: OB_SPACING.paragraphGap,
    lineHeight: OB_FONT_SIZES.h2 * 1.25,
  },
  body: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    textAlign: 'center',
    marginBottom: OB_SPACING.gap4,
    lineHeight: OB_FONT_SIZES.body * 1.55,
  },
  starRow: {
    flexDirection: 'row',
    gap: OB_SPACING.mt2,
  },
  starButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starEmpty: {
    fontSize: 30,
    color: OB_COLORS.muted,
  },
  starFilledWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starFilled: {
    fontSize: 30,
    color: OB_COLORS.cta,
  },
  buttonWrapper: {
    marginTop: 'auto' as any,
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
});

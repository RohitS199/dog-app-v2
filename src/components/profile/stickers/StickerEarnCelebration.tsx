import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { STICKERS } from '../../../constants/achievements';
import {
  OB_COLORS,
  OB_FONTS,
} from '../../../constants/onboardingTheme';
import { COPY } from '../../../constants/profileCopy';
import { useUserAchievementsStore } from '../../../stores/userAchievementsStore';
import { PillButton } from '../PillButton';
import { StickerCard } from './StickerCard';

export function StickerEarnCelebration() {
  const lastEarned = useUserAchievementsStore((s) => s.lastEarned);
  const clearLastEarned = useUserAchievementsStore((s) => s.clearLastEarned);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (lastEarned) {
      // Entrance animation: fade in + scale with 1.02x back-out overshoot
      // 1000ms total: 400ms cubic-back overshoot, then 600ms cubic-out settle to 1.0
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
      scale.value = withSequence(
        withTiming(1.02, {
          duration: 400,
          easing: Easing.out(Easing.back()),
        }),
        withTiming(1, {
          duration: 600,
          easing: Easing.out(Easing.cubic),
        }),
      );
    }
  }, [lastEarned]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  function dismiss() {
    // Animate out (scale to 0, fade out over 250ms), then clear
    scale.value = withTiming(0, { duration: 250, easing: Easing.in(Easing.cubic) });
    opacity.value = withTiming(0, { duration: 250, easing: Easing.in(Easing.cubic) });
    // Use a small setTimeout to let animation finish before clearing
    setTimeout(() => {
      clearLastEarned();
    }, 260);
  }

  if (!lastEarned) return null;

  const sticker = STICKERS[lastEarned];
  if (!sticker) return null;

  return (
    <Animated.View style={[styles.container, overlayStyle]}>
      {/* Dim backdrop — tap to dismiss */}
      <Pressable
        style={styles.backdrop}
        onPress={dismiss}
        accessibilityLabel="Dismiss celebration"
        accessibilityRole="button"
      />

      {/* Center content */}
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View style={[styles.cardWrap, animatedStyle]}>
          <StickerCard sticker={sticker} earned size={200} />
          <Text style={styles.title}>{sticker.title}</Text>
          <Text style={styles.description}>{sticker.description}</Text>
          <View style={styles.buttonWrap}>
            <PillButton
              label={COPY.STICKER_CELEBRATION_AWESOME}
              variant="primary"
              onPress={dismiss}
            />
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 20, 15, 0.55)',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: OB_FONTS.h1,
    fontSize: 26,
    color: OB_COLORS.cream,
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.cream2,
    marginTop: 6,
    textAlign: 'center',
  },
  buttonWrap: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
});

import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StickerDef } from '../../../constants/achievements';
import { OB_COLORS, OB_FONTS } from '../../../constants/onboardingTheme';
import { COPY } from '../../../constants/profileCopy';
import { STICKER_ASSETS } from './assets';
import { LightWashOverlay } from './LightWashOverlay';
import { RibbonStamp } from './RibbonStamp';

export type TrophyDetailViewProps = {
  sticker: StickerDef;
  earned: boolean;
  featured: boolean;
  earnedAt: string | null;
  onDismiss: () => void;
  onRibbonPress?: () => void;
};

function formatBloomedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Pattern E PR 1 - Trophy detail view (Pressed Flower Specimen).
 * Full-screen overlay rendered INSIDE the existing single Modal in
 * app/(tabs)/profile/index.tsx. Never nested in its own Modal
 * (iOS one-Modal limit, Hazard 8.3).
 *
 * Animations: entrance fade 480ms, sticker idle breath 3s, light-wash sweep
 * (own component). All respect useReducedMotion. Haptics light impact on
 * entrance landing (once per open).
 *
 * Design ref: HANDOFF.md section 4.4.
 */
export function TrophyDetailView({
  sticker,
  earned,
  featured,
  earnedAt,
  onDismiss,
  onRibbonPress,
}: TrophyDetailViewProps) {
  const reducedMotion = useReducedMotion();
  const fade = useSharedValue(0);
  const idle = useSharedValue(0);

  useEffect(() => {
    fade.value = withTiming(1, {
      duration: reducedMotion ? 0 : 480,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

    if (!reducedMotion) {
      const t = setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 480);
      idle.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
      return () => clearTimeout(t);
    }
  }, [reducedMotion, fade, idle]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const stickerStyle = useAnimatedStyle(() => {
    const ty = -2 + idle.value * 4;
    const scale = 0.99 + idle.value * 0.03;
    return {
      transform: [
        { translateY: ty },
        { scale },
        { rotate: `${sticker.rotation}deg` },
      ],
    };
  });

  const asset = STICKER_ASSETS[sticker.id];
  const ribbonState: 'featured' | 'unfeatured' | 'locked' = !earned
    ? 'locked'
    : featured ? 'featured' : 'unfeatured';

  const stampText = earned && earnedAt
    ? COPY.STICKER_EARNED_BLOOM_PREFIX + formatBloomedDate(earnedAt)
    : asset === null
      ? COPY.STICKER_COMING_SOON
      : COPY.STICKER_NOT_YET_BLOOMED;

  return (
    <Animated.View style={[styles.root, backdropStyle]}>
      <Pressable
        testID="trophy-backdrop"
        accessibilityRole="button"
        accessibilityLabel="Close trophy detail"
        onPress={onDismiss}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.stickerWrap} pointerEvents="box-none">
        <View style={styles.washi} />

        <Animated.View style={[styles.stickerInner, stickerStyle]} pointerEvents="box-none">
          {asset !== null ? (
            <View>
              <Image source={asset} style={styles.stickerImg} resizeMode="contain" />
              <LightWashOverlay />
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderChar}>{sticker.title.charAt(0)}</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.ribbonAnchor} pointerEvents="box-none">
          <RibbonStamp
            state={ribbonState}
            tilt={sticker.ribbonTilt}
            size="large"
            onPress={onRibbonPress}
          />
        </View>
      </View>

      <Text style={styles.title}>{sticker.title}</Text>

      <View style={styles.underline} />

      <Text style={styles.description}>{sticker.unlockCriteria}</Text>

      <Text style={styles.flavor}>{'“' + sticker.description + '”'}</Text>

      <View style={styles.stamp}>
        <Text style={styles.stampText}>{stampText}</Text>
      </View>

      <Text style={styles.dismissHint}>{COPY.STICKER_DETAIL_DISMISS_HINT}</Text>
    </Animated.View>
  );
}

const STICKER_DIM = 215;
const PLACEHOLDER_RADIUS = 32;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 246, 238, 0.97)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stickerWrap: {
    width: STICKER_DIM,
    height: STICKER_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stickerInner: {
    width: STICKER_DIM,
    height: STICKER_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerImg: {
    width: STICKER_DIM,
    height: STICKER_DIM,
  },
  placeholder: {
    width: STICKER_DIM,
    height: STICKER_DIM,
    borderRadius: PLACEHOLDER_RADIUS,
    backgroundColor: OB_COLORS.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderChar: {
    fontFamily: OB_FONTS.h1,
    fontSize: 80,
    color: OB_COLORS.woodDk,
  },
  washi: {
    position: 'absolute',
    top: -2,
    left: -8,
    width: 50,
    height: 14,
    backgroundColor: 'rgba(255, 230, 170, 0.78)',
    transform: [{ rotate: '-22deg' }],
    zIndex: 1,
  },
  ribbonAnchor: {
    position: 'absolute',
    top: 4,
    right: -10,
    zIndex: 2,
  },
  title: {
    fontFamily: OB_FONTS.h1,
    fontSize: 40,
    color: OB_COLORS.woodDk,
    transform: [{ rotate: '-1deg' }],
    textAlign: 'center',
  },
  underline: {
    width: 86,
    height: 5,
    borderRadius: 3,
    backgroundColor: OB_COLORS.peach,
    opacity: 0.8,
    marginTop: 8,
    marginBottom: 16,
  },
  description: {
    fontFamily: OB_FONTS.body,
    fontSize: 15,
    fontWeight: '500',
    color: OB_COLORS.woodDk,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 21,
  },
  flavor: {
    fontFamily: OB_FONTS.h1,
    fontStyle: 'italic',
    fontSize: 18,
    color: OB_COLORS.sketch,
    opacity: 0.85,
    transform: [{ rotate: '-0.8deg' }],
    marginTop: 16,
    textAlign: 'center',
  },
  stamp: {
    position: 'absolute',
    bottom: 88,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    transform: [{ rotate: '2deg' }],
  },
  stampText: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.sketch,
  },
  dismissHint: {
    position: 'absolute',
    bottom: 36,
    fontFamily: OB_FONTS.body,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: OB_COLORS.sketch,
    opacity: 0.5,
  },
});

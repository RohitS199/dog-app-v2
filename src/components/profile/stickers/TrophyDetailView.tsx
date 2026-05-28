import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
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

/** Window-space rect of the sticker that opened the trophy view. Captured
 * via measureInWindow at tap time so the trophy entrance can interpolate
 * from the source position into the centered target ("matched-position"
 * entrance). When undefined (e.g. trophy opened from a non-tap code path
 * or in tests where measureInWindow isn't available), the trophy falls
 * back to the plain backdrop-fade entrance. */
export type OriginRect = { x: number; y: number; w: number; h: number };

export type TrophyDetailViewProps = {
  sticker: StickerDef;
  earned: boolean;
  featured: boolean;
  earnedAt: string | null;
  onDismiss: () => void;
  onRibbonPress?: () => void;
  originRect?: OriginRect;
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
  originRect,
}: TrophyDetailViewProps) {
  const reducedMotion = useReducedMotion();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const fade = useSharedValue(0);
  const idle = useSharedValue(0);
  // underlineDraw: 0 → 1 = watercolor underline scaleX draw. Delayed ~300ms
  // so it lands after the backdrop has settled — feels like "trophy appears,
  // then a brush confirms the title."
  const underlineDraw = useSharedValue(0);
  // entrance: 0 → 1 = sticker flies from originRect (source) into the
  // centered target. When originRect is undefined we initialize to 1 so the
  // sticker renders at its natural transform with no flight. (Hazard 8.3
  // means the Modal already fades behind us; the matched-position entrance
  // is a sticker-only motion that composes ON TOP of that fade.)
  const entrance = useSharedValue(originRect && !reducedMotion ? 0 : 1);

  // Approximation: the sticker visually sits a touch above true screen center
  // because there's title + underline + description + flavor + stamp below it.
  // ~60px above the dead vertical center is the empirical sweet spot — enough
  // to make the motion FEEL like it lands where the sticker actually is.
  const targetCx = screenW / 2;
  const targetCy = screenH / 2 - 60;
  const initialDx = originRect ? originRect.x + originRect.w / 2 - targetCx : 0;
  const initialDy = originRect ? originRect.y + originRect.h / 2 - targetCy : 0;
  const initialScale = originRect ? originRect.w / STICKER_DIM : 1;

  useEffect(() => {
    fade.value = withTiming(1, {
      duration: reducedMotion ? 0 : 480,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

    if (reducedMotion) {
      underlineDraw.value = 1;
      entrance.value = 1;
    } else {
      underlineDraw.value = withDelay(
        300,
        withTiming(1, { duration: 600, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
      );
      if (originRect) {
        // Slightly faster than the backdrop fade so the sticker "lands" before
        // the room finishes lighting up — feels punchier.
        entrance.value = withTiming(1, {
          duration: 380,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
      }
    }

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
  }, [reducedMotion, fade, idle, underlineDraw, entrance, originRect]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const stickerStyle = useAnimatedStyle(() => {
    // Idle motion (existing): subtle y-bob + scale breathe.
    const idleTy = -2 + idle.value * 4;
    const idleScale = 0.99 + idle.value * 0.03;

    // Matched-position entrance (new): linearly interpolate from source rect
    // to centered identity as `entrance` goes 0 → 1. When originRect is
    // absent, initialDx/Dy/Scale resolve to 0/0/1 so this is a no-op (idle +
    // rotation only).
    const p = entrance.value;
    const inv = 1 - p;
    const entranceDx = initialDx * inv;
    const entranceDy = initialDy * inv;
    const entranceScale = initialScale + (1 - initialScale) * p;

    return {
      transform: [
        { translateX: entranceDx },
        { translateY: entranceDy + idleTy },
        { scale: entranceScale * idleScale },
        { rotate: `${sticker.rotation}deg` },
      ],
    };
  });

  const underlineStyle = useAnimatedStyle(() => ({
    // Center-out watercolor bloom from the title midpoint outward.
    transform: [{ scaleX: underlineDraw.value }],
  }));

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

      <Animated.View style={[styles.underline, underlineStyle]} />

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

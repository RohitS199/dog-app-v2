import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { STICKERS, StickerId } from '../../../constants/achievements';
import { OB_BORDERS, OB_COLORS, OB_FONTS, OB_RADII, OB_SHADOWS } from '../../../constants/onboardingTheme';
import { COPY } from '../../../constants/profileCopy';
import type { FeaturedSlots } from '../../../stores/userAchievementsStore';
import { StickerCard } from './StickerCard';

export type SwapPanelProps = {
  newStickerId: StickerId;
  featuredIds: FeaturedSlots;
  earnedIds: Set<StickerId>;
  onPick: (oldStickerId: StickerId) => void;
  onCancel: () => void;
};

/**
 * Swap panel (Pattern E PR 2). Slides up over the trophy view when the
 * user taps an unfeatured ribbon while all 3 featured slots are full.
 * The user picks WHICH currently-featured sticker to replace - no
 * auto-replacement.
 *
 * Renders the 3 featured stickers as tiles. Tap one to swap. Scrim or
 * "Cancel" tap returns to the underlying trophy view.
 *
 * Design ref: HANDOFF section 4.6.
 */
export function SwapPanel({
  newStickerId,
  featuredIds,
  earnedIds,
  onPick,
  onCancel,
}: SwapPanelProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: reducedMotion ? 0 : 320,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  }, [reducedMotion, progress]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.45,
  }));

  const panelStyle = useAnimatedStyle(() => {
    const translate = (1 - progress.value) * 400;
    return {
      transform: [{ translateY: translate }],
    };
  });

  const newSticker = STICKERS[newStickerId];
  const featuredStickers = featuredIds.filter((x): x is StickerId => x !== null);

  return (
    <View style={StyleSheet.absoluteFill} testID="swap-panel-root" pointerEvents="box-none">
      {/* Scrim — tap to cancel */}
      <Animated.View style={[styles.scrim, scrimStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel swap"
          testID="swap-panel-scrim"
        />
      </Animated.View>

      {/* Slide-up panel */}
      <Animated.View style={[styles.panel, panelStyle]} pointerEvents="box-none">
        <View style={styles.handle} />

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{COPY.STICKER_SWAP_TITLE}</Text>
            <Text style={styles.subtitle}>
              {COPY.STICKER_SWAP_SUBTITLE_PREFIX}
              <Text style={styles.subtitleEmph}>{newSticker.title}</Text>
            </Text>
          </View>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel swap"
            hitSlop={12}
            testID="swap-panel-cancel"
          >
            <Text style={styles.cancel}>{'×'}</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>{COPY.STICKER_SWAP_HINT}</Text>

        <View style={styles.tilesRow}>
          {featuredStickers.map((id) => {
            const sticker = STICKERS[id];
            return (
              <Pressable
                key={id}
                testID={`swap-tile-${id}`}
                onPress={() => onPick(id)}
                accessibilityRole="button"
                accessibilityLabel={`Swap out ${sticker.title}, feature ${newSticker.title} instead`}
                hitSlop={4}
                style={styles.tile}
              >
                <StickerCard sticker={sticker} earned={earnedIds.has(id)} size={72} />
                <Text style={styles.tileLabel}>{sticker.title}</Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 20, 15, 1)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: OB_COLORS.cream,
    borderTopLeftRadius: OB_RADII.modal,
    borderTopRightRadius: OB_RADII.modal,
    borderTopWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    ...OB_SHADOWS.card,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: OB_COLORS.sketch,
    opacity: 0.25,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontFamily: OB_FONTS.h1,
    fontSize: 26,
    color: OB_COLORS.ink,
  },
  subtitle: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.muted,
    marginTop: 2,
  },
  subtitleEmph: {
    color: OB_COLORS.ink,
    fontWeight: '600',
  },
  cancel: {
    fontFamily: OB_FONTS.body,
    fontSize: 26,
    color: OB_COLORS.muted,
    paddingHorizontal: 6,
  },
  hint: {
    fontFamily: OB_FONTS.body,
    fontSize: 12,
    color: OB_COLORS.muted,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 18,
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 111, 0, 0.08)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 111, 0, 0.40)',
  },
  tileLabel: {
    fontFamily: OB_FONTS.body,
    fontSize: 11,
    color: OB_COLORS.ink,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 2,
  },
});

import React, { forwardRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { StickerDef, StickerCategory } from '../../../constants/achievements';
import { OB_BORDERS, OB_COLORS, OB_FONTS } from '../../../constants/onboardingTheme';
import { STICKER_ASSETS } from './assets';

// Watercolor sticker artwork has a die-cut silhouette inside a square PNG
// frame, so the visible shape is ~75% of the bounding box width. Scaling up
// makes the visible silhouette match the placeholder-square footprint and
// also makes the per-sticker rotation read clearly.
const STICKER_VISUAL_SCALE = 1.3;

export type StickerCardProps = {
  sticker: StickerDef;
  earned: boolean;
  onPress?: () => void;
  size?: number;
};

function categoryColor(category: StickerCategory): string {
  switch (category) {
    case 'milestone':
      return OB_COLORS.peach;
    case 'mastery':
      return OB_COLORS.petalA;
    case 'engagement':
      return OB_COLORS.blush;
    case 'seasonal':
      return OB_COLORS.petalB;
  }
}

export type StickerCardRef = View;

export const StickerCard = forwardRef<StickerCardRef, StickerCardProps>(function StickerCard(
  { sticker, earned, onPress, size = 56 },
  ref,
) {
  const asset = STICKER_ASSETS[sticker.id];
  const radius = Math.round(size * 0.2);

  // When used standalone (onPress provided), render as a Pressable so it's
  // tappable. When used inside another tappable wrapper (no onPress) - e.g.
  // grid tiles in StickerCollection, swap panel tiles - render as a plain
  // View so the wrapper's Pressable can capture the tap. Nested Pressables
  // would let the inner one swallow taps that the outer needed.
  const isInteractive = onPress !== undefined;
  const Container = isInteractive ? Pressable : View;
  const a11yLabel = `${sticker.title} sticker, ${earned ? 'earned' : 'locked'}`;
  // Keep the a11y label in both modes so screen readers always describe the
  // sticker. The button role is reserved for the interactive (Pressable)
  // variant so non-interactive renders don't promise something they can't
  // deliver. The grid tile wrapper appends ", featured on your profile" via
  // its own accessibilityLabel - duplication is acceptable since RN's screen
  // reader uses the closest accessible ancestor by default.
  const containerProps = isInteractive
    ? {
        onPress,
        accessibilityRole: 'button' as const,
        accessibilityLabel: a11yLabel,
      }
    : {
        accessibilityLabel: a11yLabel,
      };

  return (
    <Container
      ref={ref as React.Ref<View>}
      {...containerProps}
      style={[
        styles.outer,
        { width: size, height: size, transform: [{ rotate: `${sticker.rotation}deg` }] },
      ]}
    >
      {asset !== null ? (
        <View style={{ width: size, height: size }}>
          <Image
            source={asset}
            style={{
              width: size,
              height: size,
              opacity: earned ? 1 : 0.5,
              transform: [{ scale: STICKER_VISUAL_SCALE }],
            }}
            resizeMode="contain"
          />
          {!earned && (
            <View
              testID="locked-overlay"
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(246, 240, 230, 0.35)' },
              ]}
            />
          )}
        </View>
      ) : earned ? (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: categoryColor(sticker.category),
            },
          ]}
        >
          <Text style={[styles.placeholderChar, { fontSize: Math.round(size * 0.39) }]}>
            {sticker.title.charAt(0)}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.placeholder,
            styles.ghost,
            {
              width: size,
              height: size,
              borderRadius: radius,
            },
          ]}
        >
          <Text
            style={[
              styles.placeholderChar,
              styles.ghostChar,
              { fontSize: Math.round(size * 0.39) },
            ]}
          >
            {sticker.title.charAt(0)}
          </Text>
        </View>
      )}
    </Container>
  );
});

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
  },
  ghost: {
    backgroundColor: OB_COLORS.cream,
    borderStyle: 'dashed',
    borderColor: OB_COLORS.sketch,
  },
  placeholderChar: {
    fontFamily: OB_FONTS.h1,
    color: OB_COLORS.woodDk,
  },
  ghostChar: {
    opacity: 0.3,
  },
});

import React from 'react';
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

export function StickerCard({ sticker, earned, onPress, size = 56 }: StickerCardProps) {
  const asset = STICKER_ASSETS[sticker.id];
  const radius = Math.round(size * 0.2);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sticker.title} sticker, ${earned ? 'earned' : 'locked'}`}
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
    </Pressable>
  );
}

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

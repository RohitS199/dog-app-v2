import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { StickerDef, StickerCategory } from '../../../constants/achievements';
import { OB_BORDERS, OB_COLORS, OB_FONTS } from '../../../constants/onboardingTheme';
import { STICKER_ASSETS } from './assets';

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
        <Image
          source={asset}
          style={{ width: size, height: size, opacity: earned ? 1 : 0.4 }}
          resizeMode="contain"
        />
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

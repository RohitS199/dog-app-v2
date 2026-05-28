import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OB_COLORS, OB_FONTS } from '../../../constants/onboardingTheme';
import { COPY } from '../../../constants/profileCopy';
import { Star } from './Star';

export type RibbonState = 'featured' | 'unfeatured' | 'locked';
export type RibbonSize = 'large' | 'small';

export type RibbonStampProps = {
  state: RibbonState;
  tilt: number;
  size?: RibbonSize;
  onPress?: () => void;
};

const SIZES: Record<RibbonSize, number> = { large: 58, small: 24 };
const STAR_SIZES: Record<RibbonSize, number> = { large: 22, small: 11 };
const LABEL_SIZES: Record<RibbonSize, number> = { large: 9, small: 0 };

export function RibbonStamp({ state, tilt, size = 'large', onPress }: RibbonStampProps) {
  if (state === 'locked') return null;

  const dim = SIZES[size];
  const isFeatured = state === 'featured';
  const label = isFeatured
    ? COPY.STICKER_RIBBON_FEATURED
    : COPY.STICKER_RIBBON_TAP_TO_FEATURE;
  const a11y = isFeatured
    ? 'Featured. Tap to unpin.'
    : 'Tap to feature this sticker.';

  return (
    <Pressable
      testID="ribbon-stamp"
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      hitSlop={6}
      style={[
        styles.outer,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: isFeatured ? OB_COLORS.featuredBlue : OB_COLORS.featuredBlueWash,
          borderWidth: isFeatured ? 0 : 2,
          borderStyle: isFeatured ? 'solid' : 'dashed',
          borderColor: OB_COLORS.sketch,
          transform: [{ rotate: `${tilt}deg` }],
        },
      ]}
    >
      <View style={styles.inner}>
        <View style={{ opacity: isFeatured ? 1 : 0.6 }}>
          <Star
            size={STAR_SIZES[size]}
            color={isFeatured ? OB_COLORS.cream : OB_COLORS.sketch}
          />
        </View>
        {LABEL_SIZES[size] > 0 ? (
          <Text
            style={[
              styles.label,
              {
                fontSize: LABEL_SIZES[size],
                color: isFeatured ? OB_COLORS.cream : OB_COLORS.sketch,
                opacity: isFeatured ? 1 : 0.7,
              },
            ]}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: OB_FONTS.body,
    marginTop: -2,
  },
});

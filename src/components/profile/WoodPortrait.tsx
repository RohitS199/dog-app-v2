import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { OB_COLORS } from '../../constants/onboardingTheme';

interface WoodPortraitProps {
  size: 68 | 76 | 96 | 130;
  avatar?: string | null;
  testID?: string;
  style?: ViewStyle;
}

export function WoodPortrait({ size, avatar, testID, style }: WoodPortraitProps) {
  const outerRing = Math.max(3, Math.round(size * 0.06));
  const middleRing = Math.max(2, Math.round(size * 0.04));
  const photoSize = size - 2 * (outerRing + middleRing);

  return (
    <View
      testID={testID}
      style={[
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          padding: outerRing,
          backgroundColor: OB_COLORS.woodDk,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.middle,
          {
            borderRadius: (size - 2 * outerRing) / 2,
            padding: middleRing,
            backgroundColor: OB_COLORS.wood,
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: photoSize,
              height: photoSize,
              borderRadius: photoSize / 2,
              backgroundColor: OB_COLORS.cream,
            },
          ]}
        >
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={[styles.photo, { width: photoSize, height: photoSize, borderRadius: photoSize / 2 }]}
              accessibilityLabel="Profile photo"
            />
          ) : (
            <View
              style={[
                styles.placeholder,
                {
                  width: photoSize,
                  height: photoSize,
                  borderRadius: photoSize / 2,
                  backgroundColor: OB_COLORS.cream2,
                },
              ]}
              accessibilityLabel="Profile photo placeholder"
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { alignItems: 'center', justifyContent: 'center' },
  middle: { alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' },
  inner: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: {},
  placeholder: {},
});

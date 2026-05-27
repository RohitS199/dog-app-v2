import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { OB_COLORS } from '../../constants/onboardingTheme';
import {
  WOOD_FRAME_SVG,
  AVATAR_DIAMETER_RATIO,
  AVATAR_TOP_RATIO,
  AVATAR_LEFT_RATIO,
} from './WoodFrameSvg';

interface WoodPortraitProps {
  size: number;
  avatar?: string | null;
  testID?: string;
  style?: ViewStyle;
}

export function WoodPortrait({ size, avatar, testID, style }: WoodPortraitProps) {
  const photoDiameter = Math.round(size * AVATAR_DIAMETER_RATIO);
  const photoTop = Math.round(size * AVATAR_TOP_RATIO);
  const photoLeft = Math.round(size * AVATAR_LEFT_RATIO);

  return (
    <View testID={testID} style={[{ width: size, height: size }, style]}>
      <SvgXml xml={WOOD_FRAME_SVG} width={size} height={size} />
      <View
        style={[
          styles.photoContainer,
          {
            width: photoDiameter,
            height: photoDiameter,
            borderRadius: photoDiameter / 2,
            top: photoTop,
            left: photoLeft,
            backgroundColor: OB_COLORS.cream,
          },
        ]}
      >
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={{
              width: photoDiameter,
              height: photoDiameter,
              borderRadius: photoDiameter / 2,
            }}
            accessibilityLabel="Profile photo"
          />
        ) : (
          <View
            style={{
              width: photoDiameter,
              height: photoDiameter,
              borderRadius: photoDiameter / 2,
              backgroundColor: OB_COLORS.cream2,
            }}
            accessibilityLabel="Profile photo placeholder"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

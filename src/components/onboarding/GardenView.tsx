import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  OB_COLORS,
  OB_BORDERS,
} from '../../constants/onboardingTheme';

interface GardenViewProps {
  stage?: 'empty' | 'sprout' | 'bloom' | 'full';
}

const FLOWER_POSITIONS = [
  { left: 20, bottom: 16 },
  { left: 55, bottom: 20 },
  { left: 90, bottom: 14 },
  { left: 130, bottom: 22 },
  { left: 160, bottom: 18 },
  { left: 195, bottom: 24 },
  { left: 230, bottom: 15 },
  { left: 260, bottom: 20 },
];

const FLOWER_COLORS = [
  OB_COLORS.accent,
  OB_COLORS.blush,
  OB_COLORS.peach,
  OB_COLORS.accent,
  OB_COLORS.blush,
  OB_COLORS.peach2,
  OB_COLORS.accent,
  OB_COLORS.blush,
];

const STAGE_FLOWER_COUNT: Record<string, number> = {
  empty: 0,
  sprout: 2,
  bloom: 4,
  full: 8,
};

export function GardenView({ stage = 'full' }: GardenViewProps) {
  const flowerCount = STAGE_FLOWER_COUNT[stage] ?? 8;

  return (
    <View style={styles.container} accessibilityLabel="Garden illustration">
      {/* Doghouse */}
      <View style={styles.doghouse}>
        <View style={styles.doghouseRoof} />
        <View style={styles.doghouseBody}>
          <View style={styles.doghouseDoor} />
        </View>
      </View>

      {/* Flowers */}
      {FLOWER_POSITIONS.slice(0, flowerCount).map((pos, index) => (
        <View
          key={index}
          style={[
            styles.flower,
            {
              left: pos.left,
              bottom: pos.bottom,
              backgroundColor: FLOWER_COLORS[index],
            },
          ]}
        />
      ))}

      {/* Ground */}
      <View style={styles.ground} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: OB_COLORS.greenDk,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  doghouse: {
    position: 'absolute',
    bottom: 12,
    left: 6,
    alignItems: 'center',
  },
  doghouseRoof: {
    width: 36,
    height: 10,
    backgroundColor: OB_COLORS.wood,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: -1,
  },
  doghouseBody: {
    width: 30,
    height: 22,
    backgroundColor: OB_COLORS.peach,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  doghouseDoor: {
    width: 12,
    height: 14,
    backgroundColor: OB_COLORS.woodDk,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: OB_COLORS.sketch,
    marginBottom: -1,
  },
  flower: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

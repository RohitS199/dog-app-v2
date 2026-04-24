import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from 'react-native';
import {
  OB_COLORS,
  OB_FONTS,
} from '../../constants/onboardingTheme';

interface RiskSignalCircleProps {
  percentage?: number;
}

const SIZE = 50;
const STROKE_WIDTH = 5;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RiskSignalCircle({ percentage = 72 }: RiskSignalCircleProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const filledLength = (clamped / 100) * CIRCUMFERENCE;
  const emptyLength = CIRCUMFERENCE - filledLength;

  return (
    <View style={styles.container} accessibilityLabel={`${clamped} percent`}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={OB_COLORS.cream}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Filled arc */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={OB_COLORS.accent}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${filledLength} ${emptyLength}`}
          strokeDashoffset={CIRCUMFERENCE * 0.25}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <Text style={styles.label}>{clamped}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    fontFamily: OB_FONTS.wheelValue,
    fontSize: 12,
    color: OB_COLORS.ink,
  },
});

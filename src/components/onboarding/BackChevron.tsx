import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { OB_COLORS } from '../../constants/onboardingTheme';

interface BackChevronProps {
  width?: number;
  height?: number;
  color?: string;
}

export function BackChevron({
  width = 14,
  height = 24,
  color = OB_COLORS.cta,
}: BackChevronProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 10 17" fill="none">
      <Path
        d="M8.21596 1.5L1.5 8.21596M1.50002 8.2522L8.21597 14.9682"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

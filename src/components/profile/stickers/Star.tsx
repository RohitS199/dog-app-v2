import React from 'react';
import Svg, { Path } from 'react-native-svg';

export type StarProps = {
  size: number;
  color: string;
};

export function Star({ size, color }: StarProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z"
        fill={color}
      />
    </Svg>
  );
}

import Svg, { Circle, Path, G } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

interface CaughtUpDogSvgProps {
  size?: number;
}

export function CaughtUpDogSvg({ size = 120 }: CaughtUpDogSvgProps) {
  const s = size / 120; // scale factor
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessibilityElementsHidden
    >
      {/* Decorative circle frame */}
      <Circle
        cx="60"
        cy="60"
        r="54"
        stroke={COLORS.success}
        strokeWidth="1.5"
        fill="none"
        opacity={0.4}
      />

      {/* Left laurel branch */}
      <G>
        <Path
          d="M28 75 C24 65, 22 55, 26 45"
          stroke={COLORS.success}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M26 70 C20 68, 18 64, 22 60"
          stroke={COLORS.success}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M26 62 C20 60, 19 56, 24 52"
          stroke={COLORS.success}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M26 54 C22 52, 21 48, 25 46"
          stroke={COLORS.success}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </G>

      {/* Right laurel branch (mirrored) */}
      <G>
        <Path
          d="M92 75 C96 65, 98 55, 94 45"
          stroke={COLORS.success}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M94 70 C100 68, 102 64, 98 60"
          stroke={COLORS.success}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M94 62 C100 60, 101 56, 96 52"
          stroke={COLORS.success}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M94 54 C98 52, 99 48, 95 46"
          stroke={COLORS.success}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </G>

      {/* Dog face — head outline with floppy ears */}
      <G>
        {/* Head */}
        <Path
          d="M44 58 C44 44, 52 36, 60 36 C68 36, 76 44, 76 58 C76 70, 70 78, 60 78 C50 78, 44 70, 44 58"
          stroke={COLORS.textPrimary}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left floppy ear */}
        <Path
          d="M46 52 C42 44, 36 42, 34 48 C32 54, 36 58, 44 56"
          stroke={COLORS.textPrimary}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right floppy ear */}
        <Path
          d="M74 52 C78 44, 84 42, 86 48 C88 54, 84 58, 76 56"
          stroke={COLORS.textPrimary}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left eye */}
        <Circle cx="53" cy="54" r="2.5" fill={COLORS.textPrimary} />
        {/* Right eye */}
        <Circle cx="67" cy="54" r="2.5" fill={COLORS.textPrimary} />
        {/* Nose */}
        <Circle cx="60" cy="63" r="3" fill={COLORS.textPrimary} />
        {/* Smile */}
        <Path
          d="M55 67 C57 70, 63 70, 65 67"
          stroke={COLORS.textPrimary}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Small tongue */}
        <Path
          d="M58 69 C58 72, 62 72, 62 69"
          stroke="#E57373"
          strokeWidth="1.2"
          fill="#EF9A9A"
          strokeLinecap="round"
        />
      </G>

      {/* Sparkle accents */}
      <G>
        {/* Top-right sparkle */}
        <Path
          d="M82 30 L84 26 L86 30 L84 34 Z"
          fill={COLORS.accent}
          opacity={0.8}
        />
        <Path
          d="M82 30 L80 30 M86 30 L88 30"
          stroke={COLORS.accent}
          strokeWidth="1"
          opacity={0.6}
        />
        {/* Top-left sparkle (smaller) */}
        <Path
          d="M36 32 L37 29 L38 32 L37 35 Z"
          fill={COLORS.accent}
          opacity={0.6}
        />
        {/* Bottom sparkle */}
        <Path
          d="M78 82 L79.5 79 L81 82 L79.5 85 Z"
          fill={COLORS.accent}
          opacity={0.7}
        />
      </G>
    </Svg>
  );
}

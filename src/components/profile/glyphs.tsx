import React from 'react';
import { Image } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { OB_COLORS } from '../../constants/onboardingTheme';

type GlyphProps = {
  size?: number;
  color?: string;
};

const STROKE = 1.5;

// Watercolor envelope illustration (Figma drop-in). PNG densities at @1x/@2x/@3x.
// `color` prop is accepted for API compatibility with the SVG glyphs but ignored —
// the artwork has its own colors baked in.
const ENVELOPE_SRC = require('../../../assets/icons/envelope.png');

export function HeartGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"
        fill={OB_COLORS.blush}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LockGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="11" width="14" height="9" rx="2" fill={OB_COLORS.blush} stroke={color} strokeWidth={STROKE} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function CardGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="6" width="18" height="13" rx="2" fill={OB_COLORS.peach} stroke={color} strokeWidth={STROKE} />
      <Path d="M3 11h18" stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function BellGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 17h12l-1.5-2V11a4.5 4.5 0 0 0-9 0v4z"
        fill={OB_COLORS.peach}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function GearGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="3.5" fill={OB_COLORS.peach} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ExitDoorGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4" y="3" width="11" height="18" rx="1" fill={OB_COLORS.peach} stroke={color} strokeWidth={STROKE} />
      <Circle cx="12" cy="12" r="0.8" fill={color} />
      <Path d="M15 12h6M18 9l3 3-3 3" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function PersonIcon({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="9" r="3.5" fill={OB_COLORS.petalA} stroke={color} strokeWidth={STROKE} />
      <Path d="M5 20c0-4 3.5-6 7-6s7 2 7 6" fill={OB_COLORS.petalA} stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function EnvelopeIcon({ size = 22 }: GlyphProps) {
  return (
    <Image
      source={ENVELOPE_SRC}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

export function PhoneIcon({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="7" y="3" width="10" height="18" rx="2" fill={OB_COLORS.blush} stroke={color} strokeWidth={STROKE} />
      <Circle cx="12" cy="18" r="0.7" fill={color} />
    </Svg>
  );
}

export function CupcakeIcon({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 13l1 8h12l1-8z" fill={OB_COLORS.peach} stroke={color} strokeWidth={STROKE} strokeLinejoin="round" />
      <Path d="M7 13c0-2.5 2.5-4 5-4s5 1.5 5 4" fill={OB_COLORS.petalA} stroke={color} strokeWidth={STROKE} />
      <Circle cx="12" cy="6" r="1" fill={color} />
    </Svg>
  );
}

export function PinIcon({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21s-6-7-6-12a6 6 0 1 1 12 0c0 5-6 12-6 12z"
        fill={OB_COLORS.petalB}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="9" r="2" fill={OB_COLORS.cream} stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

// Profile tab fallback glyph (used by FloatingTabBar until Figma asset arrives)
// Active: peach fill + wood stroke. Inactive: muted fill + ink2 stroke.
export function ProfileTabGlyph({
  size = 28,
  active,
}: {
  size?: number;
  active: boolean;
}) {
  const fillColor = active ? '#f9d6b2' : OB_COLORS.muted;
  const strokeColor = active ? OB_COLORS.wood : OB_COLORS.ink2;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="9" r="4" fill={fillColor} stroke={strokeColor} strokeWidth={1.4} />
      <Path
        d="M4 21 C 5 16 8 14 12 14 C 16 14 19 16 20 21 Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.4}
      />
    </Svg>
  );
}

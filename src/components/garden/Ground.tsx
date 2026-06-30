import { memo } from 'react';
import Svg, { Ellipse, G } from 'react-native-svg';

// Meadow DEPTH only — the soil bed itself is now a painted image (SCENE_ASSETS.gardenBed) drawn
// over this in GardenScene. This adds subtle layering to the grass so the meadow isn't a flat
// wash: a far hill at the horizon, a warm sunlight pool, cool dips (mottles) and warm rises
// (highlights). Turbulence-free (spec §5) and decorative. Colors are lifted from the mockup.
//
// Memoized on { width, height } so it does NOT re-render when GardenScene toggles isFocused.
export const Ground = memo(function Ground({ width, height }: { width: number; height: number }) {
  const W = width;
  const H = height;
  return (
    <Svg
      width={W}
      height={H}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', left: 0, top: 0 }}
    >
      {/* Far hill — horizon depth just under the sky→meadow seam (~0.42). */}
      <Ellipse cx={0.3 * W} cy={0.44 * H} rx={0.58 * W} ry={0.07 * H} fill="#c2d9a3" opacity={0.7} />
      <Ellipse cx={0.8 * W} cy={0.46 * H} rx={0.46 * W} ry={0.06 * H} fill="#c2d9a3" opacity={0.6} />

      {/* Warm sunlight pool (the sun sits top-right in the mockup). */}
      <Ellipse cx={0.78 * W} cy={0.52 * H} rx={0.3 * W} ry={0.06 * H} fill="#e9dfa9" opacity={0.2} />

      {/* Cool meadow mottles — shallow dips so the plain isn't flat. */}
      <G opacity={0.14}>
        <Ellipse cx={0.18 * W} cy={0.84 * H} rx={0.22 * W} ry={0.05 * H} fill="#7e9a6b" />
        <Ellipse cx={0.82 * W} cy={0.9 * H} rx={0.2 * W} ry={0.05 * H} fill="#7e9a6b" />
        <Ellipse cx={0.5 * W} cy={0.97 * H} rx={0.3 * W} ry={0.06 * H} fill="#7e9a6b" />
      </G>
      {/* Warm rises catching the light. */}
      <G opacity={0.22}>
        <Ellipse cx={0.38 * W} cy={0.76 * H} rx={0.2 * W} ry={0.045 * H} fill="#dcebca" />
        <Ellipse cx={0.76 * W} cy={0.86 * H} rx={0.18 * W} ry={0.04 * H} fill="#dcebca" />
      </G>
    </Svg>
  );
});

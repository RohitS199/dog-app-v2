import { memo } from 'react';
import Svg, { Defs, RadialGradient, Stop, Ellipse, Circle, G, Path } from 'react-native-svg';
import type { BedRect } from '../../lib/gardenPlacement';
import { organicBlobPath } from '../../lib/organicBlob';

// Turbulence-free port of the mockup's painted ground (preview-journey-hero-final-week.html
// .scene-svg). The mockup builds its ground from feTurbulence "wobble" washes, which are too
// expensive to run live in RN (spec §5) — the hand-painted edges arrive with the baked ground
// PNG in Phase 2. Until then this gives the meadow real depth with layered gradients + soft
// ellipses: a far hill at the horizon, cool meadow mottles + warm highlights, a sunlight pool,
// and a radial-gradient garden bed with scattered dirt speckles. Colors are lifted verbatim
// from the mockup (meadowGrad / bedGrad / mottle + speckle fills). Drop-in: replaced wholesale
// by a single <Image> when the baked watercolor ground lands.
//
// Memoized on { width, height, bed } so it does NOT re-render when GardenScene toggles isFocused.

// The garden bed mirrors GardenScene's BED rect so the radial soil sits exactly under the blooms.
const DEFAULT_BED: BedRect = { x: 0.08, y: 0.55, width: 0.84, height: 0.3 };

// Deterministic dirt speckles as [x, y] fractions WITHIN the bed rect — fixed forever, never
// reshuffles. Kept off the rim so they read as soil, not grass.
const SPECKLES: ReadonlyArray<readonly [number, number]> = [
  [0.22, 0.4], [0.36, 0.68], [0.6, 0.52], [0.76, 0.36], [0.5, 0.28],
  [0.68, 0.78], [0.28, 0.82], [0.6, 0.88], [0.44, 0.74], [0.54, 0.58],
];

export const Ground = memo(function Ground({
  width,
  height,
  bed = DEFAULT_BED,
}: {
  width: number;
  height: number;
  bed?: BedRect;
}) {
  const W = width;
  const H = height;
  // Bed ellipse from the BED rect: center + radii.
  const bedCx = (bed.x + bed.width / 2) * W;
  const bedCy = (bed.y + bed.height / 2) * H;
  const bedRx = (bed.width / 2) * W;
  const bedRy = (bed.height / 2) * H;

  return (
    <Svg
      width={W}
      height={H}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', left: 0, top: 0 }}
    >
      <Defs>
        <RadialGradient id="bedGrad" cx="50%" cy="42%" r="75%">
          <Stop offset="0" stopColor="#b89164" />
          <Stop offset="0.7" stopColor="#9d7b54" />
          <Stop offset="1" stopColor="#876844" />
        </RadialGradient>
      </Defs>

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

      {/* Garden bed — an organic, imperfect blob (NOT a clean ellipse) so the soil edge looks
          hand-painted like the mockup. Radial soil fill + a darker inner pool with a different
          wobble phase so the two edges don't trace the same line. */}
      <Path d={organicBlobPath(bedCx, bedCy, bedRx, bedRy, 0)} fill="url(#bedGrad)" opacity={0.95} />
      <Path
        d={organicBlobPath(bedCx, bedCy + bedRy * 0.12, bedRx * 0.8, bedRy * 0.72, 1.7)}
        fill="#856641"
        opacity={0.4}
      />

      {/* Dirt speckles scattered across the bed. */}
      <G fill="#5f4628" opacity={0.5}>
        {SPECKLES.map(([sx, sy], i) => (
          <Circle
            key={i}
            cx={(bed.x + sx * bed.width) * W}
            cy={(bed.y + sy * bed.height) * H}
            r={i % 3 === 0 ? 2.2 : 1.8}
          />
        ))}
      </G>
    </Svg>
  );
});

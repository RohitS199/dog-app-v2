import { memo } from 'react';
import Svg, { Defs, RadialGradient, Stop, Ellipse, Circle, G } from 'react-native-svg';

// Turbulence-free port of the mockup's painted ground (preview-journey-hero-final-week.html
// .scene-svg). The mockup builds its ground from feTurbulence "wobble" washes, which are too
// expensive to run live in RN (spec §5) — the hand-painted edges arrive with the baked ground
// PNG in Phase 2. Until then this gives the meadow real depth with layered gradients + soft
// ellipses: a far hill at the horizon, cool meadow mottles + warm highlights, a sunlight pool,
// and a radial-gradient garden bed with scattered dirt speckles. Colors are lifted verbatim
// from the mockup (meadowGrad / bedGrad / mottle + speckle fills). Drop-in: replaced wholesale
// by a single <Image> when the baked watercolor ground lands.
//
// Memoized on { width, height } so it does NOT re-render when GardenScene toggles isFocused.

// Deterministic dirt speckles as [x, y] fractions of the scene box — fixed forever, never
// reshuffles. Kept inside the bed bounds (x 0.1–0.9, y 0.55–0.86).
const SPECKLES: ReadonlyArray<readonly [number, number]> = [
  [0.2, 0.6], [0.34, 0.74], [0.62, 0.7], [0.74, 0.6], [0.5, 0.55],
  [0.68, 0.8], [0.28, 0.84], [0.66, 0.86], [0.44, 0.82], [0.55, 0.78],
];

export const Ground = memo(function Ground({ width, height }: { width: number; height: number }) {
  const W = width;
  const H = height;
  // Garden bed mirrors GardenScene's BED rect (x0.1 y0.46 w0.8 h0.42) so blooms sit on the
  // soil: center (0.5, 0.67), radii (0.40W, 0.21H).
  const bedCx = 0.5 * W;
  const bedCy = 0.67 * H;
  const bedRx = 0.4 * W;
  const bedRy = 0.21 * H;

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
        <Ellipse cx={0.18 * W} cy={0.8 * H} rx={0.22 * W} ry={0.05 * H} fill="#7e9a6b" />
        <Ellipse cx={0.82 * W} cy={0.88 * H} rx={0.2 * W} ry={0.05 * H} fill="#7e9a6b" />
        <Ellipse cx={0.5 * W} cy={0.96 * H} rx={0.3 * W} ry={0.06 * H} fill="#7e9a6b" />
      </G>
      {/* Warm rises catching the light. */}
      <G opacity={0.22}>
        <Ellipse cx={0.38 * W} cy={0.73 * H} rx={0.2 * W} ry={0.045 * H} fill="#dcebca" />
        <Ellipse cx={0.76 * W} cy={0.82 * H} rx={0.18 * W} ry={0.04 * H} fill="#dcebca" />
      </G>

      {/* Garden bed — radial soil with a darker inner pool (mockup bedGrad + #856641). */}
      <Ellipse cx={bedCx} cy={bedCy} rx={bedRx} ry={bedRy} fill="url(#bedGrad)" opacity={0.95} />
      <Ellipse cx={0.48 * W} cy={0.69 * H} rx={0.32 * W} ry={0.16 * H} fill="#856641" opacity={0.4} />

      {/* Dirt speckles scattered across the bed. */}
      <G fill="#5f4628" opacity={0.5}>
        {SPECKLES.map(([fx, fy], i) => (
          <Circle key={i} cx={fx * W} cy={fy * H} r={i % 3 === 0 ? 2.2 : 1.8} />
        ))}
      </G>
    </Svg>
  );
});

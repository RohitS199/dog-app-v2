import { memo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SCENE_ASSETS } from '../../constants/flowerAssets';

// Decorative painted mushrooms scattered on the grass AROUND the garden bed (never on the soil).
// Mirrors Clouds.tsx: a deterministic placement array + an a11y-hidden wrapper. Placement is by the
// mushroom's BASE point (bottom-center, where it meets the grass). STATIC for v1 (mushrooms are
// rigid; the flowers already carry the wind motion — spec §5). Tune the fractions on device.
const ASPECTS = [0.905, 0.924, 0.591]; // index -> w/h, matches SCENE_ASSETS.mushrooms order

// baseX/baseY are fractions of the scene box; w is a fraction of WIDTH. `mirror` flips horizontally
// for variety. Hand-placed to ring the meadow AROUND the bed; sorted back->front so nearer
// (lower) mushrooms paint over farther ones. STARTING VALUES — tune on device (spec §4.2).
const MUSHROOMS = [
  { i: 0, baseX: 0.13, baseY: 0.7, w: 0.1, mirror: false }, // left of bed, mid
  { i: 2, baseX: 0.2, baseY: 0.62, w: 0.06, mirror: false }, // upper-left, small (far)
  { i: 1, baseX: 0.88, baseY: 0.72, w: 0.095, mirror: true }, // right of bed
  { i: 0, baseX: 0.83, baseY: 0.63, w: 0.055, mirror: true }, // upper-right, small (far)
  { i: 2, baseX: 0.34, baseY: 0.88, w: 0.07, mirror: false }, // front meadow, left
  { i: 1, baseX: 0.66, baseY: 0.89, w: 0.075, mirror: true }, // front meadow, right
].sort((a, b) => a.baseY - b.baseY); // back -> front paint order

function MushroomSprite({
  cfg,
  width,
  height,
}: {
  cfg: (typeof MUSHROOMS)[number];
  width: number;
  height: number;
}) {
  const w = cfg.w * width;
  const h = w / ASPECTS[cfg.i];
  return (
    <Image
      source={SCENE_ASSETS.mushrooms[cfg.i]}
      resizeMode="contain"
      style={{
        position: 'absolute',
        left: cfg.baseX * width - w / 2,
        top: cfg.baseY * height - h, // base sits on the grass
        width: w,
        height: h,
        transform: cfg.mirror ? [{ scaleX: -1 }] : undefined,
      }}
    />
  );
}

// Memoized on { width, height } so the scene's isFocused toggles don't re-render it (cf. Ground).
export const Mushrooms = memo(function Mushrooms({ width, height }: { width: number; height: number }) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {MUSHROOMS.map((cfg, idx) => (
        <MushroomSprite key={idx} cfg={cfg} width={width} height={height} />
      ))}
    </View>
  );
});

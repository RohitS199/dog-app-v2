import { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  useReducedMotion,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { SCENE_ASSETS } from '../../constants/flowerAssets';

// Per-cloud config (2026-06-23 §9.4): top/width as fractions of the scene box; secs = drift period;
// phase staggers the three so they don't move in lockstep. Sources come from the static asset map
// (SCENE_ASSETS.clouds) — Metro can't resolve dynamic requires (memory: rn-metro-static-require).
const CLOUDS = [
  { src: SCENE_ASSETS.clouds[0], top: 0.08, w: 0.31, opacity: 1.0, secs: 75, phase: 0.0 },
  { src: SCENE_ASSETS.clouds[1], top: 0.18, w: 0.39, opacity: 0.6, secs: 120, phase: 0.5 },
  { src: SCENE_ASSETS.clouds[2], top: 0.13, w: 0.19, opacity: 0.72, secs: 96, phase: 0.25 },
];

function Cloud({
  cfg,
  width,
  height,
  paused,
}: {
  cfg: (typeof CLOUDS)[number];
  width: number;
  height: number;
  paused: boolean;
}) {
  const reduced = useReducedMotion();
  const active = !paused && !reduced;
  const cloudW = cfg.w * width;
  const travel = width + cloudW; // off-left to off-right
  const x = useSharedValue(-cloudW + cfg.phase * travel);

  useEffect(() => {
    if (!active) return;
    x.value = -cloudW + cfg.phase * travel;
    x.value = withRepeat(withTiming(width, { duration: cfg.secs * 1000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(x);
  }, [active, width]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: cfg.top * height, opacity: cfg.opacity }, style]}
    >
      <Image source={cfg.src} resizeMode="contain" style={{ width: cloudW, height: cloudW * 0.5 }} />
    </Animated.View>
  );
}

export function Clouds({ width, height, paused }: { width: number; height: number; paused: boolean }) {
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      {CLOUDS.map((cfg, i) => (
        <Cloud key={i} cfg={cfg} width={width} height={height} paused={paused} />
      ))}
    </Animated.View>
  );
}

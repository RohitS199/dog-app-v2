import { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Flower } from './Flower';
import { SCENE_ASSETS } from '../../constants/flowerAssets';
import { placeFlowers, hashSeed, type BedRect } from '../../lib/gardenPlacement';
import type { GardenWeek } from '../../lib/gardenWeek';
import type { GardenMood } from '../../constants/gardenMoods';

// One log -> a CLUSTER of blooms (spec §3.4/§7, LOCKED). Cluster size scales with
// tier ("rewarded for specifics"); the expansion is render-time only (one DB row/day).
const BLOOMS_BY_TIER: Record<1 | 2 | 3, number> = { 1: 5, 2: 7, 3: 10 }; // spec §7.1
const BLOOM_BASE: Record<1 | 2 | 3, number> = { 1: 0.092, 2: 0.108, 3: 0.123 }; // frac of width, spec §7.2
const TIER_HEIGHT_SCALE: Record<1 | 2 | 3, number> = { 1: 1.0, 2: 1.25, 3: 1.55 }; // matches Flower
const MIN_SPACING = 0.045; // frac of width; tight so blooms overlap into a lush bed (spec §7.2)

// --- Tunable scene geometry (fractions of the scene box; tune on device). ---
const BED: BedRect = { x: 0.1, y: 0.46, width: 0.8, height: 0.42 }; // the soil where blooms scatter
const DOGHOUSE_W = 0.4;
// Physical-scene watercolor placeholders (NOT theme tokens). Replace the whole ground
// with the single baked watercolor PNG when generated (spec §5 — no live feTurbulence in RN).
const LAWN = '#bcd2a3';
const SOIL = '#9d7b54';

interface Props {
  week: GardenWeek;
  width: number;
  height: number;
}

interface Bloom {
  seed: string;
  mood: GardenMood;
  tier: 1 | 2 | 3;
  size: number;
  x: number;
  y: number;
}

function toPx(bed: BedRect, w: number, h: number): BedRect {
  return { x: bed.x * w, y: bed.y * h, width: bed.width * w, height: bed.height * h };
}

export function GardenScene({ week, width, height }: Props) {
  const blooms = useMemo<Bloom[]>(() => {
    const items: { seed: string; mood: GardenMood; tier: 1 | 2 | 3 }[] = [];
    for (const day of week.days) {
      if (day.state !== 'planted' || !day.moodKey || day.tier === 0) continue;
      const tier = day.tier as 1 | 2 | 3;
      for (let k = 0; k < BLOOMS_BY_TIER[tier]; k++) {
        items.push({ seed: `${day.seed}-b${k}`, mood: day.moodKey, tier });
      }
    }
    const bedPx = toPx(BED, width, height);
    const pts = placeFlowers(items.map((b) => b.seed), bedPx, MIN_SPACING * width);
    return items
      .map((b, i) => {
        const jitter = 0.9 + (hashSeed(b.seed) % 200) / 1000; // 0.9..1.1, deterministic
        return { ...b, size: BLOOM_BASE[b.tier] * width * jitter, x: pts[i].x, y: pts[i].y };
      })
      .sort((a, b) => a.y - b.y); // paint back-to-front so near blooms overlap far ones
  }, [week, width, height]);

  return (
    <View style={[styles.scene, { width, height, backgroundColor: LAWN }]}>
      {/* Soil bed (placeholder; folds into the baked ground PNG later). */}
      <View
        style={{
          position: 'absolute',
          left: BED.x * width,
          top: BED.y * height,
          width: BED.width * width,
          height: BED.height * height,
          backgroundColor: SOIL,
          borderRadius: (BED.height * height) / 2,
        }}
      />
      {/* Doghouse at the head of the scene (transparent scene PNG). */}
      <Image
        source={SCENE_ASSETS.doghouse}
        resizeMode="contain"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: 'absolute',
          top: height * 0.06,
          left: (0.5 - DOGHOUSE_W / 2) * width,
          width: DOGHOUSE_W * width,
          height: height * 0.3,
        }}
      />
      {/* Flower clusters, bottom-anchored at their soil point. */}
      {blooms.map((b) => {
        const h = b.size * TIER_HEIGHT_SCALE[b.tier];
        return (
          <View key={b.seed} style={{ position: 'absolute', left: b.x - b.size / 2, top: b.y - h }}>
            <Flower mood={b.mood} tier={b.tier} baseSize={b.size} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({ scene: { overflow: 'hidden' } });

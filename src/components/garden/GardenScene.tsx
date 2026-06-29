import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useSharedValue, withRepeat, withTiming, useReducedMotion, cancelAnimation, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { Flower } from './Flower';
import { Clouds } from './Clouds';
import { Ground } from './Ground';
import { BiscuitBob } from './BiscuitBob';
import { Butterfly } from './Butterfly';
import { SwayingFlower } from './SwayingFlower';
import { SCENE_ASSETS } from '../../constants/flowerAssets';
import { placeFlowers, hashSeed, type BedRect } from '../../lib/gardenPlacement';
import type { GardenWeek } from '../../lib/gardenWeek';
import { GARDEN_MOOD_LABELS, type GardenMood } from '../../constants/gardenMoods';

// One log -> a CLUSTER of blooms (spec §3.4/§7, LOCKED). Cluster size scales with
// tier ("rewarded for specifics"); the expansion is render-time only (one DB row/day).
const BLOOMS_BY_TIER: Record<1 | 2 | 3, number> = { 1: 5, 2: 7, 3: 10 }; // spec §7.1
const BLOOM_BASE: Record<1 | 2 | 3, number> = { 1: 0.092, 2: 0.108, 3: 0.123 }; // frac of width, spec §7.2
const TIER_HEIGHT_SCALE: Record<1 | 2 | 3, number> = { 1: 1.0, 2: 1.25, 3: 1.55 }; // matches Flower
const TIER_BLOOM_WORD: Record<1 | 2 | 3, string> = { 1: 'simple bloom', 2: 'fuller bloom', 3: 'full bloom' };
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MIN_SPACING = 0.045; // frac of width; tight so blooms overlap into a lush bed (spec §7.2)

// Wind sway: all blooms share ONE long linear "clock" (in radians) — cheap — while each bloom
// reads it with its own phase + frequency, so the bed sways ASYNCHRONOUSLY (not in unison). The
// pivot is the stem base (SwayingFlower's transformOrigin). ~3.5s base period; the 1-hour ramp
// means the sin seam at the clock reset is hit ~once/hour — imperceptible.
const SWAY_PERIOD_MS = 3500;
const SWAY_RAMP_MS = 3_600_000;
const SWAY_RAMP_RAD = (2 * Math.PI * SWAY_RAMP_MS) / SWAY_PERIOD_MS;

// --- Scene geometry as fractions of the FULL-SCREEN box, lifted verbatim from the mockup
// (preview-journey-hero-final-week.html, authored at 390×844) so the proportions match 1:1. ---
// Bed = the soil ellipse `cx192 cy610 rx172 ry98` → wide + shallow + low (NOT a tall round patch).
const BED: BedRect = { x: 0.051, y: 0.607, width: 0.882, height: 0.232 }; // (192±172)/390, (610±98)/844
const DOGHOUSE_W = 0.482; // .doghouse-slot width 188/390 (square PNG → no distortion)
const DOGHOUSE_TOP = 0.235; // .doghouse-slot top 198/844 — sits on the hill, straddling the sky/meadow seam
// Doghouse art geometry, measured from puplog-doghouse.png alpha bbox (1024² canvas, PIL):
// content occupies y[0.074..0.914], symmetric in x. Used to place the contact shadow relative
// to the actual (contain-letterboxed) art, not the wider layout box.
const DH_CONTENT_TOP = 0.074;
const DH_CONTENT_H = 0.84;

interface Props {
  week: GardenWeek;
  width: number;
  height: number;
}

interface Bloom {
  seed: string;
  mood: GardenMood;
  tier: 1 | 2 | 3;
  dayDate: string;
  size: number;
  x: number;
  y: number;
  swayPhase: number; // radians — per-bloom stagger
  swayFreq: number; // angular multiplier — per-bloom speed
  swayAmp: number; // degrees of rock
}

interface DayMarker {
  date: string;
  weekday: number;
  mood: GardenMood;
  tier: 1 | 2 | 3;
  cx: number;
  cy: number;
}

function toPx(bed: BedRect, w: number, h: number): BedRect {
  return { x: bed.x * w, y: bed.y * h, width: bed.width * w, height: bed.height * h };
}

export function GardenScene({ week, width, height }: Props) {
  const { blooms, dayMarkers } = useMemo(() => {
    const plantedDays = week.days.filter((d) => d.state === 'planted' && d.moodKey && d.tier > 0);

    const items: Omit<Bloom, 'size' | 'x' | 'y' | 'swayPhase' | 'swayFreq' | 'swayAmp'>[] = [];
    for (const day of plantedDays) {
      const tier = day.tier as 1 | 2 | 3;
      for (let k = 0; k < BLOOMS_BY_TIER[tier]; k++) {
        items.push({ seed: `${day.seed}-b${k}`, mood: day.moodKey as GardenMood, tier, dayDate: day.date });
      }
    }

    const bedPx = toPx(BED, width, height);
    const pts = placeFlowers(items.map((b) => b.seed), bedPx, MIN_SPACING * width);
    const placed: Bloom[] = items.map((b, i) => {
      const jitter = 0.9 + (hashSeed(b.seed) % 200) / 1000; // 0.9..1.1, deterministic
      return {
        ...b,
        size: BLOOM_BASE[b.tier] * width * jitter,
        x: pts[i].x,
        y: pts[i].y,
        // Deterministic per-bloom sway params (seeded) so the field moves out of sync.
        swayPhase: (hashSeed(b.seed) % 628) / 100, // 0..6.28 rad
        swayFreq: 0.8 + (hashSeed(b.seed + 'f') % 41) / 100, // 0.80..1.20
        swayAmp: 2.5 + (hashSeed(b.seed + 'a') % 25) / 10, // 2.5..4.9 deg
      };
    });

    // One accessibility marker per planted day at its cluster's centroid — so VoiceOver
    // announces "Monday: playful, fuller bloom" ONCE, not once per bloom. Decoupled from
    // the visual scatter (blooms still spread across the whole bed, no day-clumps).
    const dayMarkers: DayMarker[] = plantedDays.map((day) => {
      const own = placed.filter((b) => b.dayDate === day.date);
      const cx = own.reduce((s, b) => s + b.x, 0) / own.length;
      const cy = own.reduce((s, b) => s + b.y, 0) / own.length;
      return { date: day.date, weekday: day.weekday, mood: day.moodKey as GardenMood, tier: day.tier as 1 | 2 | 3, cx, cy };
    });

    return { blooms: placed.sort((a, b) => a.y - b.y), dayMarkers };
  }, [week, width, height]);

  const todayDay = week.days.find((d) => d.state === 'today');
  // Pause idle ambient loops when the Journey tab isn't focused (battery / jank guard).
  // Uses expo-router's useFocusEffect (the codebase convention — see useTabFocusAnimation)
  // rather than @react-navigation/native, which is only a transitive dependency.
  const [isFocused, setIsFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  // Wind-sway driver: a single ramping clock + an `active` multiplier shared by every bloom
  // (each SwayingFlower reads them with its own phase/freq). Paused off-focus and under Reduce
  // Motion, where `active` eases to 0 so flowers settle upright.
  const reduced = useReducedMotion();
  const swayClock = useSharedValue(0);
  const swayActive = useSharedValue(0);
  useEffect(() => {
    const on = isFocused && !reduced;
    swayActive.value = withTiming(on ? 1 : 0, { duration: 500 });
    if (on) {
      swayClock.value = 0;
      swayClock.value = withRepeat(
        withTiming(SWAY_RAMP_RAD, { duration: SWAY_RAMP_MS, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      cancelAnimation(swayClock);
    }
    return () => cancelAnimation(swayClock);
  }, [isFocused, reduced]);

  // Doghouse: a square art box (the PNG is square) anchored low on the meadow via DOGHOUSE_TOP,
  // so the full-bleed scene reads as a scene (not a house boxed near the top). dhArt* values
  // drive the contact shadow + name pill, computed from the doghouse's content bbox.
  const dhArtSize = DOGHOUSE_W * width;
  const dhArtLeft = 0.5 * width - dhArtSize / 2;
  const dhArtTop = DOGHOUSE_TOP * height;
  const dhContentBottom = dhArtTop + (DH_CONTENT_TOP + DH_CONTENT_H) * dhArtSize;

  return (
    <View style={[styles.scene, { width, height }]}>
      {/* Interim sky→meadow gradient (mockup line 62) — replaced by the baked ground PNG in Phase 2. */}
      <LinearGradient
        colors={['#b3d9ed', '#bcdfef', '#b7d49d', '#aec59a']}
        locations={[0, 0.33, 0.42, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Drifting clouds — ambient, behind the diegetic scene; paused off-focus. */}
      <Clouds width={width} height={height} paused={!isFocused} />
      {/* Painted ground — layered meadow + radial-gradient soil bed (turbulence-free port of the
          mockup's .scene-svg; folds into the baked ground PNG in Phase 2). The bed mirrors BED. */}
      <Ground width={width} height={height} bed={BED} />
      {/* Tight contact shadow tucked under the doghouse base (NOT a big soft far oval). */}
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: 'absolute',
          top: dhContentBottom - dhArtSize * 0.03, // tucked just under the base
          left: dhArtLeft + dhArtSize * 0.1,
          width: dhArtSize * 0.8,
          height: dhArtSize * 0.06,
          backgroundColor: 'rgba(46,32,18,0.32)', // 2026-06-23 §9.1 / mockup line 883
          borderRadius: dhArtSize * 0.03,
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
          top: dhArtTop,
          left: dhArtLeft,
          width: dhArtSize,
          height: dhArtSize,
        }}
      />
      {/* Biscuit sits on the meadow beside the doghouse with a gentle bob (paused off-focus). */}
      <BiscuitBob width={width} height={height} paused={!isFocused} topFrac={0.5} leftFrac={0.58} />
      {/* Visual blooms — bottom-anchored, hidden from VoiceOver (the day markers speak for them). */}
      {blooms.map((b) => {
        const h = b.size * TIER_HEIGHT_SCALE[b.tier];
        return (
          <SwayingFlower
            key={b.seed}
            testID={`bloom-${b.mood}`}
            clock={swayClock}
            active={swayActive}
            phase={b.swayPhase}
            freq={b.swayFreq}
            amp={b.swayAmp}
            left={b.x - b.size / 2}
            top={b.y - h}
          >
            <Flower mood={b.mood} tier={b.tier} baseSize={b.size} />
          </SwayingFlower>
        );
      })}
      {/* One accessible label per planted day (never "missed" for empty days — bare soil is neutral). */}
      {dayMarkers.map((m) => (
        <View
          key={`a11y-${m.date}`}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`${WEEKDAY_NAMES[m.weekday]}: ${GARDEN_MOOD_LABELS[m.mood]}, ${TIER_BLOOM_WORD[m.tier]}`}
          pointerEvents="none"
          style={{ position: 'absolute', left: m.cx - 22, top: m.cy - 22, width: 44, height: 44 }}
        />
      ))}
      {/* Today, if not yet logged — prompts to plant (the CTA below does the planting). */}
      {todayDay && (
        <View
          accessible
          accessibilityRole="text"
          accessibilityLabel="Today, not yet logged — plant today's flower with the button below"
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: (BED.x + BED.width / 2) * width - 22,
            top: (BED.y + BED.height / 2) * height - 22,
            width: 44,
            height: 44,
          }}
        />
      )}
      {/* Front-most ambient: a fluttering butterfly (paused off-focus). */}
      <Butterfly width={width} height={height} paused={!isFocused} />
    </View>
  );
}

const styles = StyleSheet.create({ scene: { overflow: 'hidden' } });

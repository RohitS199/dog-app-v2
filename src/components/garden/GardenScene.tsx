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
import { Mushrooms } from './Mushrooms';
import { ContactShadow } from './ContactShadow';
import { SCENE_ASSETS } from '../../constants/flowerAssets';
import { placeFlowers, hashSeed } from '../../lib/gardenPlacement';
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

// --- Scene geometry as fractions of the FULL-SCREEN box. Bed center/width follow the mockup
// (soil ellipse cx192/cy610, width 344/390 @390×844); the bed HEIGHT follows the garden-base
// image's own aspect so the painted oval is never squished. ---
const BED_ASPECT = 1400 / 871; // puplog-garden-bed.png (downscaled) w/h ≈ 1.607
const BED_CX = 0.5; // mockup cx ~0.492 → centered
const BED_CY = 0.723; // mockup cy 610/844
const BED_W = 0.94; // slightly larger than the mockup's 0.882 (user: "slightly bigger"); grows from the fixed center
// Flowers scatter on the INNER soil only — inset from the painted rock ring so blooms don't sit
// on the stones. (Y inset is larger: the front/back of the oval ring reads thicker in perspective.)
const SOIL_INSET_X = 0.16;
const SOIL_INSET_Y = 0.24;
const DOGHOUSE_W = 0.42; // smaller than the bed, tucked to the right (was 0.482); square PNG → no distortion
const DOGHOUSE_CX = 0.7; // center x — right of screen-center, per mockup .doghouse-slot (left 178 + 94 on 390 ≈ 0.70)
const DOGHOUSE_TOP = 0.26; // base stays grounded on the hill after the shrink (was 0.235 @ W 0.482)
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

// The garden-base image's on-screen rect (px): centered at (BED_CX, BED_CY), BED_W wide, with
// height from the image aspect so it never squishes.
function bedFootprint(width: number, height: number) {
  const w = BED_W * width;
  const h = w / BED_ASPECT;
  return { left: BED_CX * width - w / 2, top: BED_CY * height - h / 2, w, h };
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

    const bf = bedFootprint(width, height);
    const scatterPx = {
      x: bf.left + bf.w * SOIL_INSET_X,
      y: bf.top + bf.h * SOIL_INSET_Y,
      width: bf.w * (1 - 2 * SOIL_INSET_X),
      height: bf.h * (1 - 2 * SOIL_INSET_Y),
    };
    const pts = placeFlowers(items.map((b) => b.seed), scatterPx, MIN_SPACING * width);
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
  const dhArtLeft = DOGHOUSE_CX * width - dhArtSize / 2;
  const dhArtTop = DOGHOUSE_TOP * height;
  const dhContentBottom = dhArtTop + (DH_CONTENT_TOP + DH_CONTENT_H) * dhArtSize;

  const bed = bedFootprint(width, height);

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
      {/* Meadow depth (far hill, mottles, sunlight) behind the bed. */}
      <Ground width={width} height={height} />
      {/* Garden base — painted soil + rock ring (Gemini art); sized to the image's own aspect so
          it isn't squished. Flowers scatter on the inner soil (SOIL_INSET) above this. */}
      <Image
        source={SCENE_ASSETS.gardenBed}
        resizeMode="contain"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', left: bed.left, top: bed.top, width: bed.w, height: bed.h }}
      />
      {/* Decorative mushrooms scattered on the meadow around the bed (static; a11y-hidden). */}
      <Mushrooms width={width} height={height} />
      {/* Soft contact shadow grounding the doghouse — a radial-gradient ellipse (dark center
          fading to transparent at the rim), NOT a flat solid bar. Centered on the doghouse art,
          sitting at its base. */}
      <ContactShadow
        cx={dhArtLeft + dhArtSize * 0.5}
        cy={dhContentBottom}
        rx={dhArtSize * 0.45}
        ry={dhArtSize * 0.06}
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
      <BiscuitBob width={width} height={height} paused={!isFocused} topFrac={0.5} leftFrac={0.08} />
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
            left: BED_CX * width - 22,
            top: BED_CY * height - 22,
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

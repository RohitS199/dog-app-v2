import { useMemo } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { Flower } from './Flower';
import { Clouds } from './Clouds';
import { BiscuitBob } from './BiscuitBob';
import { SCENE_ASSETS } from '../../constants/flowerAssets';
import { placeFlowers, hashSeed, type BedRect } from '../../lib/gardenPlacement';
import type { GardenWeek } from '../../lib/gardenWeek';
import { GARDEN_MOOD_LABELS, type GardenMood } from '../../constants/gardenMoods';
import { OB_FONTS } from '../../constants/onboardingTheme';

// One log -> a CLUSTER of blooms (spec §3.4/§7, LOCKED). Cluster size scales with
// tier ("rewarded for specifics"); the expansion is render-time only (one DB row/day).
const BLOOMS_BY_TIER: Record<1 | 2 | 3, number> = { 1: 5, 2: 7, 3: 10 }; // spec §7.1
const BLOOM_BASE: Record<1 | 2 | 3, number> = { 1: 0.092, 2: 0.108, 3: 0.123 }; // frac of width, spec §7.2
const TIER_HEIGHT_SCALE: Record<1 | 2 | 3, number> = { 1: 1.0, 2: 1.25, 3: 1.55 }; // matches Flower
const TIER_BLOOM_WORD: Record<1 | 2 | 3, string> = { 1: 'simple bloom', 2: 'fuller bloom', 3: 'full bloom' };
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MIN_SPACING = 0.045; // frac of width; tight so blooms overlap into a lush bed (spec §7.2)

// --- Tunable scene geometry (fractions of the scene box; tune on device). ---
const BED: BedRect = { x: 0.1, y: 0.46, width: 0.8, height: 0.42 }; // the soil where blooms scatter
const DOGHOUSE_W = 0.4;
// Physical-scene watercolor placeholder (NOT a theme token). The sky→meadow gradient owns the
// background now; SOIL still tints the bed ellipse. Both fold into the baked ground PNG in Phase 2
// (spec §5 — no live feTurbulence in RN).
const SOIL = '#9d7b54';
// Doghouse art geometry, measured from puplog-doghouse.png alpha bbox (1024² canvas, PIL):
// content occupies y[0.074..0.914], symmetric in x. Used to place the name pill + contact shadow
// relative to the actual (contain-letterboxed) art, not the wider layout box.
const DH_CONTENT_TOP = 0.074;
const DH_CONTENT_H = 0.84;
const NAME_WALL_FRAC = 0.4; // pill center on the front wall above the door (wall measured 0.30–0.48, door starts ~0.50)
// Name pill colors from the mockup (preview-journey-hero-final-week.html .house-name):
const PILL_BG = '#fbe6cc'; // --peach-soft
const PILL_BORDER = '#1a140f'; // --sketch
const PILL_TEXT = '#5a3a22'; // --wood-dk

interface Props {
  week: GardenWeek;
  width: number;
  height: number;
  dogName?: string;
}

interface Bloom {
  seed: string;
  mood: GardenMood;
  tier: 1 | 2 | 3;
  dayDate: string;
  size: number;
  x: number;
  y: number;
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

export function GardenScene({ week, width, height, dogName }: Props) {
  const { blooms, dayMarkers } = useMemo(() => {
    const plantedDays = week.days.filter((d) => d.state === 'planted' && d.moodKey && d.tier > 0);

    const items: Omit<Bloom, 'size' | 'x' | 'y'>[] = [];
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
      return { ...b, size: BLOOM_BASE[b.tier] * width * jitter, x: pts[i].x, y: pts[i].y };
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
  const isFocused = useIsFocused();

  // Doghouse PNG is square + resizeMode="contain", so it letterboxes inside the layout box.
  // Compute the actual rendered art rect to anchor the contact shadow and name pill precisely.
  const dhBoxLeft = (0.5 - DOGHOUSE_W / 2) * width;
  const dhBoxTop = height * 0.06;
  const dhArtSize = Math.min(DOGHOUSE_W * width, height * 0.3);
  const dhArtLeft = dhBoxLeft + (DOGHOUSE_W * width - dhArtSize) / 2;
  const dhArtTop = dhBoxTop + (height * 0.3 - dhArtSize) / 2;
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
          top: height * 0.06,
          left: (0.5 - DOGHOUSE_W / 2) * width,
          width: DOGHOUSE_W * width,
          height: height * 0.3,
        }}
      />
      {/* Dog-name pill on the doghouse front wall (mockup .house-name). The watercolor art has a
          decorative bone, not a writable band, so the name is a drop-on badge overlaid on the wall. */}
      {dogName ? (
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            position: 'absolute',
            top: dhArtTop + (DH_CONTENT_TOP + NAME_WALL_FRAC * DH_CONTENT_H) * dhArtSize,
            left: dhArtLeft,
            width: dhArtSize,
            alignItems: 'center',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              transform: [{ rotate: '-1deg' }],
              backgroundColor: PILL_BG,
              borderWidth: 2,
              borderColor: PILL_BORDER,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 2,
              overflow: 'hidden',
              fontFamily: OB_FONTS.handwritten,
              fontWeight: '700',
              fontSize: Math.max(11, dhArtSize * 0.11),
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: PILL_TEXT,
            }}
          >
            {dogName}
          </Text>
        </View>
      ) : null}
      {/* Biscuit sits in front of the doghouse with a gentle bob (paused off-focus). */}
      <BiscuitBob width={width} height={height} paused={!isFocused} />
      {/* Visual blooms — bottom-anchored, hidden from VoiceOver (the day markers speak for them). */}
      {blooms.map((b) => {
        const h = b.size * TIER_HEIGHT_SCALE[b.tier];
        return (
          <View
            key={b.seed}
            testID={`bloom-${b.mood}`}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{ position: 'absolute', left: b.x - b.size / 2, top: b.y - h }}
          >
            <Flower mood={b.mood} tier={b.tier} baseSize={b.size} />
          </View>
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
    </View>
  );
}

const styles = StyleSheet.create({ scene: { overflow: 'hidden' } });

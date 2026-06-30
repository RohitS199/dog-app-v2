// Static require() map — Metro cannot resolve template-literal requires.
import type { ImageSourcePropType } from 'react-native';
import type { GardenMood } from './gardenMoods';

export const FLOWER_ASSETS: Record<GardenMood, Record<1 | 2 | 3, ImageSourcePropType>> = {
  joyful: {
    1: require('../../assets/garden/flowers/puplog-flower-joyful-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-joyful-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-joyful-tier3.png'),
  },
  playful: {
    1: require('../../assets/garden/flowers/puplog-flower-playful-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-playful-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-playful-tier3.png'),
  },
  affectionate: {
    1: require('../../assets/garden/flowers/puplog-flower-affectionate-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-affectionate-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-affectionate-tier3.png'),
  },
  calm: {
    1: require('../../assets/garden/flowers/puplog-flower-calm-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-calm-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-calm-tier3.png'),
  },
  curious: {
    1: require('../../assets/garden/flowers/puplog-flower-curious-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-curious-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-curious-tier3.png'),
  },
  tired: {
    1: require('../../assets/garden/flowers/puplog-flower-tired-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-tired-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-tired-tier3.png'),
  },
  anxious: {
    1: require('../../assets/garden/flowers/puplog-flower-anxious-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-anxious-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-anxious-tier3.png'),
  },
  unwell: {
    1: require('../../assets/garden/flowers/puplog-flower-unwell-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-unwell-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-unwell-tier3.png'),
  },
};

// Scene kit. Only the doghouse (calibrator) PNG exists today; sprout + mound are
// owner-pending art (spec §6.6). Re-enable them — and the test assertions — when
// assets/garden/puplog-sprout.png / puplog-mound.png land.
export const SCENE_ASSETS = {
  doghouse: require('../../assets/garden/puplog-doghouse.png'),
  // Painted soil + rock-ring garden base (Gemini drop-in, downscaled to 1400px; aspect ~1.608).
  // Replaces the code-drawn blob bed; flowers scatter on the inner soil over the top.
  gardenBed: require('../../assets/garden/puplog-garden-bed.png'),
  clouds: [
    require('../../assets/garden/puplog-cloud-1.png'),
    require('../../assets/garden/puplog-cloud-2.png'),
    require('../../assets/garden/puplog-cloud-3.png'),
  ],
  // Painted meadow mushrooms (Gemini drop-ins, downscaled). Static requires only — Metro can't
  // resolve dynamic paths (memory: rn-metro-static-require). Aspects: 0.905 / 0.924 / 0.591.
  mushrooms: [
    require('../../assets/garden/puplog-mushroom-1.png'), // aspect 0.905 (red)
    require('../../assets/garden/puplog-mushroom-2.png'), // aspect 0.924 (amber)
    require('../../assets/garden/puplog-mushroom-3.png'), // aspect 0.591 (tall pink)
  ],
  // TODO(scene-kit): wire when generated
  // sprout: require('../../assets/garden/puplog-sprout.png'),
  // mound: require('../../assets/garden/puplog-mound.png'),
} as const;

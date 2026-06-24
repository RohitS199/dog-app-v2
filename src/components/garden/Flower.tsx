import { Image } from 'react-native';
import { FLOWER_ASSETS } from '../../constants/flowerAssets';
import { GARDEN_MOOD_LABELS, GardenMood } from '../../constants/gardenMoods';
import type { FlowerTier } from '../../lib/flowerTier';

// Tier scales visible height (ornateness), not width (spec §5.4).
const TIER_HEIGHT_SCALE: Record<1 | 2 | 3, number> = { 1: 1.0, 2: 1.25, 3: 1.55 };
const TIER_BLOOM_WORD: Record<1 | 2 | 3, string> = { 1: 'simple bloom', 2: 'fuller bloom', 3: 'full bloom' };

interface FlowerProps {
  mood: GardenMood;
  tier: Exclude<FlowerTier, 0>; // a rendered flower always has a mood
  baseSize: number;             // width in px; height derived from tier
}

export function Flower({ mood, tier, baseSize }: FlowerProps) {
  const height = baseSize * TIER_HEIGHT_SCALE[tier];
  return (
    <Image
      source={FLOWER_ASSETS[mood][tier]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel={`${GARDEN_MOOD_LABELS[mood]} ${TIER_BLOOM_WORD[tier]}`}
      // Flat style object (not an array) so width/height are directly inspectable.
      style={{ width: baseSize, height }}
    />
  );
}

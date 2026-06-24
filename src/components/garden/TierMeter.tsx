import { View, Text, StyleSheet } from 'react-native';
import { Flower } from './Flower';
import { GardenMood } from '../../constants/gardenMoods';
import type { FlowerTier } from '../../lib/flowerTier';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES } from '../../constants/onboardingTheme';

// Copy verbatim from puplog_flower_tier_logic.md §5 ("rewarded for specifics").
const TIER_COPY: Record<FlowerTier, [string, string]> = {
  0: ['Waiting to sprout', 'Pick their mood and a flower takes root.'],
  1: ['A simple bloom', 'Sweet! Add a health note and it grows fuller.'],
  2: ['A fuller bloom', 'Lovely. A photo or note makes it bloom completely — real detail for the record.'],
  3: ['Full bloom!', 'Beautiful — the detailed kind of entry that reads patterns best.'],
};

export function TierMeter({ tier, mood }: { tier: FlowerTier; mood: GardenMood | null }) {
  const [label, hint] = TIER_COPY[tier];
  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <View style={styles.pot}>
        {tier >= 1 && mood ? <Flower mood={mood} tier={tier as 1 | 2 | 3} baseSize={40} /> : <Text>🌱</Text>}
      </View>
      <View style={styles.dots}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={[styles.dot, tier >= n && styles.dotOn]} />
        ))}
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  pot: { width: 44, height: 56, alignItems: 'center', justifyContent: 'flex-end' },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: OB_COLORS.muted },
  dotOn: { backgroundColor: OB_COLORS.cta },
  copy: { flex: 1 },
  label: { fontFamily: OB_FONTS.h3, fontSize: OB_FONT_SIZES.h3, color: OB_COLORS.ink },
  hint: { fontFamily: OB_FONTS.body, fontSize: OB_FONT_SIZES.body, color: OB_COLORS.ink2 },
});

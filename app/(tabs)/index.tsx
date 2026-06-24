// Journey hero — the app's home tab. A per-dog, full-bleed garden that fills as the
// week's logs plant flowers. Read-only in Milestone 1 (the LogSheet write path is M2).
import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogStore } from '../../src/stores/dogStore';
import { useGardenStore } from '../../src/stores/gardenStore';
import { GardenScene } from '../../src/components/garden/GardenScene';
import { GardenGreeting } from '../../src/components/garden/GardenGreeting';
import { EmergencyChip } from '../../src/components/garden/EmergencyChip';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES, OB_RADII } from '../../src/constants/onboardingTheme';

export default function JourneyScreen() {
  const { width } = useWindowDimensions();
  const dogs = useDogStore((s) => s.dogs);
  const selectedDogId = useDogStore((s) => s.selectedDogId);
  const fetchDogs = useDogStore((s) => s.fetchDogs);
  const week = useGardenStore((s) => s.week);
  const isLoading = useGardenStore((s) => s.isLoading);
  const fetchWeek = useGardenStore((s) => s.fetchWeek);

  const dog = dogs.find((d) => d.id === selectedDogId) ?? dogs[0];

  useEffect(() => {
    if (dogs.length === 0) fetchDogs();
  }, [dogs.length, fetchDogs]);

  // Re-fetch (and clear stale data) on dog switch.
  useEffect(() => {
    if (dog) fetchWeek(dog.id);
  }, [dog?.id, fetchWeek]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.dogChip} accessibilityRole="header">
          {dog ? dog.name : 'PupLog'}
        </Text>
        <EmergencyChip />
      </View>

      <GardenGreeting dogName={dog?.name ?? 'Your pup'} plantedCount={week?.plantedCount ?? 0} />

      <View style={styles.sceneWrap}>
        {isLoading || !week ? (
          <ActivityIndicator color={OB_COLORS.accent} style={{ marginTop: 80 }} />
        ) : (
          <GardenScene week={week} width={width} height={width * 0.92} />
        )}
      </View>

      <Pressable
        style={styles.cta}
        accessibilityRole="button"
        accessibilityLabel={`Plant ${dog?.name ?? 'your pup'}'s flower for today`}
        onPress={() => Alert.alert('Coming soon', 'Planting today’s flower arrives with the log sheet (Milestone 2).')}
      >
        <Text style={styles.ctaLabel}>Plant {dog?.name ?? 'your pup'}&apos;s flower for today</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB_COLORS.cream },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dogChip: { fontFamily: OB_FONTS.h2, fontSize: OB_FONT_SIZES.h2, color: OB_COLORS.ink },
  sceneWrap: { flex: 1, justifyContent: 'center' },
  cta: {
    backgroundColor: OB_COLORS.cta,
    borderRadius: OB_RADII.button,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 90,
    alignItems: 'center',
  },
  // Ink-on-coral, never white (spec §3.7 / WCAG).
  ctaLabel: { color: OB_COLORS.ink, fontFamily: OB_FONTS.cta, fontSize: OB_FONT_SIZES.h3 },
});

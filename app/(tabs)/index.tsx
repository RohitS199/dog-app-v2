// Journey hero — the app's home tab. A per-dog, full-bleed garden that fills as the
// week's logs plant flowers. CTA opens the LogSheet; a successful plant pops a celebration.
import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useDogStore } from '../../src/stores/dogStore';
import { useGardenStore } from '../../src/stores/gardenStore';
import { GardenScene } from '../../src/components/garden/GardenScene';
import { GardenGreeting } from '../../src/components/garden/GardenGreeting';
import { EmergencyChip } from '../../src/components/garden/EmergencyChip';
import { LogSheet } from '../../src/components/garden/LogSheet';
import { PlantCelebration } from '../../src/components/garden/PlantCelebration';
import { DogSelector } from '../../src/components/ui/DogSelector';
import type { GardenMood } from '../../src/constants/gardenMoods';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES, OB_RADII } from '../../src/constants/onboardingTheme';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function JourneyScreen() {
  const { width } = useWindowDimensions();
  const dogs = useDogStore((s) => s.dogs);
  const selectedDogId = useDogStore((s) => s.selectedDogId);
  const fetchDogs = useDogStore((s) => s.fetchDogs);
  const week = useGardenStore((s) => s.week);
  const isLoading = useGardenStore((s) => s.isLoading);
  const fetchWeek = useGardenStore((s) => s.fetchWeek);

  const dog = dogs.find((d) => d.id === selectedDogId) ?? dogs[0];
  const [today, setToday] = useState(todayStr);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showDogSelector, setShowDogSelector] = useState(false);
  const [celebration, setCelebration] = useState<{ mood: GardenMood; tier: 1 | 2 | 3 } | null>(null);

  useEffect(() => {
    if (dogs.length === 0) fetchDogs();
  }, [dogs.length, fetchDogs]);

  // Re-fetch (and clear stale data) when the selected dog changes mid-screen —
  // gardenStore.fetchWeek nulls the prior dog's week first, so no stale flowers flash.
  useEffect(() => {
    if (dog) fetchWeek(dog.id);
  }, [dog?.id, fetchWeek]);

  // On tab focus: recompute "today" (so the week window + plant date don't rot past
  // midnight) and refetch (covers a log written elsewhere). This is also the hook where
  // future scene-idle animations should pause when unfocused (spec §10).
  useFocusEffect(
    useCallback(() => {
      setToday(todayStr());
      if (dog) fetchWeek(dog.id);
    }, [dog?.id, fetchWeek]),
  );

  const multiDog = dogs.length > 1;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => multiDog && setShowDogSelector(true)}
          disabled={!multiDog}
          hitSlop={8}
          accessibilityRole={multiDog ? 'button' : 'text'}
          accessibilityLabel={multiDog ? `Switch dog, currently ${dog?.name}` : dog?.name}
        >
          <Text style={styles.dogChip}>
            {dog ? dog.name : 'PupLog'}
            {multiDog ? ' ▾' : ''}
          </Text>
        </Pressable>
        <EmergencyChip />
      </View>

      {/* Gate on `week` so the greeting doesn't flash "ready to grow" before data loads. */}
      {week && <GardenGreeting dogName={dog?.name ?? 'Your pup'} plantedCount={week.plantedCount} />}

      <View style={styles.sceneWrap}>
        {isLoading || !week ? (
          <ActivityIndicator color={OB_COLORS.accent} style={{ marginTop: 80 }} />
        ) : (
          <GardenScene week={week} width={width} height={width * 0.92} dogName={dog?.name ?? ''} />
        )}
        {celebration && (
          <PlantCelebration mood={celebration.mood} tier={celebration.tier} onDone={() => setCelebration(null)} />
        )}
      </View>

      <Pressable
        style={[styles.cta, !dog && styles.ctaOff]}
        disabled={!dog}
        accessibilityRole="button"
        accessibilityLabel={`Plant ${dog?.name ?? 'your pup'}'s flower for today`}
        onPress={() => setSheetOpen(true)}
      >
        <Text style={styles.ctaLabel}>Plant {dog?.name ?? 'your pup'}&apos;s flower for today</Text>
      </Pressable>

      <DogSelector visible={showDogSelector} onClose={() => setShowDogSelector(false)} />

      <Modal
        visible={sheetOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSheetOpen(false)}
      >
        <SafeAreaView style={styles.sheetRoot} edges={['top']}>
          <View style={styles.sheetHeader}>
            <Pressable onPress={() => setSheetOpen(false)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={styles.sheetClose}>Close</Text>
            </Pressable>
          </View>
          {dog && (
            <LogSheet
              dogId={dog.id}
              dogName={dog.name}
              date={today}
              onPlanted={(mood, tier) => {
                setSheetOpen(false);
                setCelebration({ mood, tier });
              }}
              onClose={() => setSheetOpen(false)}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  ctaOff: { opacity: 0.5 },
  // Ink-on-coral, never white (spec §3.7 / WCAG).
  ctaLabel: { color: OB_COLORS.ink, fontFamily: OB_FONTS.cta, fontSize: OB_FONT_SIZES.h3 },
  sheetRoot: { flex: 1, backgroundColor: OB_COLORS.cream },
  sheetHeader: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 8 },
  sheetClose: { fontFamily: OB_FONTS.cta, fontSize: OB_FONT_SIZES.body, color: OB_COLORS.ink2 },
});

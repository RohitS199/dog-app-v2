import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useDogStore } from '../../src/stores/dogStore';
import { useCheckInStore } from '../../src/stores/checkInStore';
import { useHealthStore } from '../../src/stores/healthStore';
import { useLearnStore } from '../../src/stores/learnStore';
import { useAuthStore } from '../../src/stores/authStore';
import { DisclaimerFooter } from '../../src/components/legal';
import { GettingStartedCard } from '../../src/components/ui/GettingStartedCard';
import { DogSelector } from '../../src/components/ui/DogSelector';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../../src/constants/theme';
import type { Dog } from '../../src/types/api';
import type { Article } from '../../src/types/learn';

const TAB_BAR_HEIGHT = 100; // padding for floating tab bar

// Mood mapping from check-in mood values
const MOOD_LABELS: Record<string, string> = {
  normal: 'Tail Waggin\'',
  quiet: 'Quiet Day',
  anxious: 'On Edge',
  clingy: 'Extra Cuddly',
  hiding: 'Hiding Out',
  aggressive: 'Grumpy Pup',
};

// Energy mapping from check-in energy values
const ENERGY_MAP: Record<string, number> = {
  normal: 75,
  low: 50,
  lethargic: 25,
  barely_moving: 10,
  hyperactive: 95,
};

// Daily Digs card configs
const DAILY_DIGS = [
  { key: 'chow', label: 'Chow', icon: 'silverware-fork-knife' as const, step: 0 },
  { key: 'slurp', label: 'Slurp', icon: 'water' as const, step: 1 },
  { key: 'vibe', label: 'Vibe', icon: 'emoticon-happy-outline' as const, step: 6 },
  { key: 'extras', label: 'Extras', icon: 'bandage' as const, step: 7 },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getWeekDays(): { label: string; date: string; dayNum: number; isToday: boolean }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days = [];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({
      label: dayLabels[i],
      date: dateStr,
      dayNum: d.getDate(),
      isToday: dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    });
  }
  return days;
}

// Mood Ring component using SVG
function MoodRing({ streak, mood, hasCheckIn }: { streak: number; mood: string | null; hasCheckIn: boolean }) {
  const size = 190;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (!hasCheckIn) {
    // Zero state
    return (
      <View style={moodStyles.container}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.border}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference * 0.05} ${circumference * 0.02}`}
          />
        </Svg>
        <View style={moodStyles.inner}>
          <MaterialCommunityIcons name="paw" size={32} color={COLORS.textDisabled} />
          <Text style={moodStyles.dayLabel}>Day 0</Text>
          <Text style={moodStyles.moodText}>Tap + to start</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={moodStyles.container}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.accentLight}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.accent}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={moodStyles.inner}>
        <MaterialCommunityIcons name="paw" size={32} color={COLORS.accent} />
        <Text style={moodStyles.dayLabel}>Day {streak}</Text>
        <Text style={moodStyles.moodTextActive}>{MOOD_LABELS[mood ?? 'normal'] ?? 'Tail Waggin\''}</Text>
      </View>
    </View>
  );
}

const moodStyles = StyleSheet.create({
  container: {
    width: 190,
    height: 190,
    alignSelf: 'center',
    marginVertical: SPACING.lg,
  },
  inner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  moodText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDisabled,
    marginTop: 2,
  },
  moodTextActive: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
});

// Energy Card
function EnergyCard({ energyLevel, hasCheckIn }: { energyLevel: string | null; hasCheckIn: boolean }) {
  const pct = hasCheckIn ? (ENERGY_MAP[energyLevel ?? 'normal'] ?? 75) : 0;

  return (
    <View style={[energyStyles.card, SHADOWS.card]}>
      <View style={energyStyles.header}>
        <View style={energyStyles.iconContainer}>
          <MaterialCommunityIcons name="lightning-bolt" size={18} color={COLORS.accent} />
        </View>
        <Text style={energyStyles.title}>Energy Level</Text>
      </View>
      <View style={energyStyles.barBg}>
        <View style={[energyStyles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={energyStyles.pctText}>
        {hasCheckIn ? `${pct}%` : '\u2014'}
      </Text>
      {!hasCheckIn && (
        <Text style={energyStyles.hintText}>First check-in unlocks this</Text>
      )}
    </View>
  );
}

const energyStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  pctText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  hintText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    marginTop: 2,
  },
});

// Article card for Sniff Around
function SniffArticleCard({ article, sectionMeta, onPress }: {
  article: Article;
  sectionMeta?: { title: string; accentColor: string };
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [sniffStyles.card, SHADOWS.card, pressed && sniffStyles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}. ${article.readTimeMinutes} minute read`}
    >
      <View style={sniffStyles.imagePlaceholder}>
        <MaterialCommunityIcons name="book-open-variant" size={24} color={COLORS.textDisabled} />
      </View>
      {sectionMeta && (
        <View style={[sniffStyles.badge, { backgroundColor: sectionMeta.accentColor + '1A' }]}>
          <Text style={[sniffStyles.badgeText, { color: sectionMeta.accentColor }]}>
            {sectionMeta.title}
          </Text>
        </View>
      )}
      <Text style={sniffStyles.title} numberOfLines={2}>{article.title}</Text>
      <Text style={sniffStyles.meta}>{article.readTimeMinutes} min read</Text>
    </Pressable>
  );
}

const sniffStyles = StyleSheet.create({
  card: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85 },
  imagePlaceholder: {
    height: 80,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.xs,
  },
  meta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
});

export default function HomeScreen() {
  const { dogs, isLoading, selectedDogId, fetchDogs, fetchLastTriageDates, selectDog } = useDogStore();
  const { calendarData, fetchMonthData } = useHealthStore();
  const { sections, fetchArticles, getSectionMeta } = useLearnStore();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [showDogSelector, setShowDogSelector] = useState(false);

  const selectedDog = dogs.find((d) => d.id === selectedDogId);

  // Fetch data on mount
  useEffect(() => {
    fetchDogs().then(() => fetchLastTriageDates());
    fetchArticles();
  }, []);

  // Fetch current month check-ins for week strip
  useEffect(() => {
    if (selectedDogId) {
      const now = new Date();
      fetchMonthData(selectedDogId, now.getFullYear(), now.getMonth() + 1);
    }
  }, [selectedDogId]);

  const onRefresh = useCallback(() => {
    fetchDogs().then(() => fetchLastTriageDates());
    fetchArticles(true);
    if (selectedDogId) {
      const now = new Date();
      fetchMonthData(selectedDogId, now.getFullYear(), now.getMonth() + 1);
    }
  }, [selectedDogId]);

  // Week strip data
  const weekDays = useMemo(() => getWeekDays(), []);

  // Get today's check-in for mood ring + energy
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const todayCheckIn = calendarData[todayStr] ?? null;
  const hasCheckInToday = todayCheckIn !== null;
  const streak = selectedDog?.checkin_streak ?? 0;

  // Articles for Sniff Around
  const sniffArticles = useMemo(() => {
    const allArticles = sections.flatMap((s) => s.articles);
    return allArticles.slice(0, 5);
  }, [sections]);

  const handleCheckIn = (dog?: Dog) => {
    const d = dog ?? selectedDog;
    if (d) {
      selectDog(d.id);
      router.push('/check-in');
    }
  };

  const handleDigPress = (step: number) => {
    if (selectedDog) {
      selectDog(selectedDog.id);
      router.push('/check-in');
    }
  };

  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  // Empty state
  if (dogs.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.emptyState}>
          <View style={[styles.emptyLogo, SHADOWS.elevated]}>
            <MaterialCommunityIcons name="paw" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.emptyTitle}>Welcome to PawCheck!</Text>
          <Text style={styles.emptyText}>
            Add your first dog to get started with daily health tracking.
          </Text>
          <View style={styles.emptyButton}>
            <Pressable
              style={({ pressed }) => [styles.addDogBtn, pressed && { opacity: 0.85 }]}
              onPress={() => router.push('/add-dog')}
              accessibilityRole="button"
              accessibilityLabel="Add your first dog"
            >
              <Text style={styles.addDogBtnText}>Add Your Dog</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_BAR_HEIGHT }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>Home Base</Text>
          </View>
          <Pressable
            style={styles.calendarBtn}
            onPress={() => router.push('/(tabs)/health')}
            accessibilityRole="button"
            accessibilityLabel="View health calendar"
          >
            <MaterialCommunityIcons name="calendar-heart" size={24} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        {/* Dog Selector */}
        {dogs.length > 1 && selectedDog && (
          <Pressable
            style={styles.dogSelectorRow}
            onPress={() => setShowDogSelector(true)}
            accessibilityRole="button"
            accessibilityLabel={`Viewing ${selectedDog.name}. Tap to switch dogs.`}
          >
            <Text style={styles.selectedDogName}>{selectedDog.name}</Text>
            <Text style={styles.switchText}>Switch</Text>
          </Pressable>
        )}

        {/* Week Strip */}
        <View style={styles.weekStrip}>
          {weekDays.map((day) => {
            const hasLog = !!calendarData[day.date];
            return (
              <View key={day.date} style={styles.weekDay}>
                <Text style={styles.weekDayLabel}>{day.label}</Text>
                <View style={[
                  styles.weekDayCircle,
                  day.isToday && styles.weekDayToday,
                ]}>
                  <Text style={[
                    styles.weekDayNum,
                    day.isToday && styles.weekDayNumToday,
                  ]}>
                    {day.dayNum}
                  </Text>
                </View>
                {hasLog && <View style={styles.weekDot} />}
              </View>
            );
          })}
        </View>

        {/* Mood Ring */}
        <MoodRing
          streak={streak}
          mood={todayCheckIn?.mood ?? null}
          hasCheckIn={hasCheckInToday}
        />

        {/* Energy Card */}
        <EnergyCard
          energyLevel={todayCheckIn?.energy_level ?? null}
          hasCheckIn={hasCheckInToday}
        />

        {/* Daily Digs */}
        <View style={styles.digsSection}>
          <Text style={styles.sectionTitle}>Daily Digs</Text>
          <View style={styles.digsGrid}>
            {DAILY_DIGS.map((dig, i) => (
              <Pressable
                key={dig.key}
                style={({ pressed }) => [
                  styles.digCard,
                  SHADOWS.card,
                  i === 0 && styles.digCardHighlight,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => handleDigPress(dig.step)}
                accessibilityRole="button"
                accessibilityLabel={`Log ${dig.label}`}
              >
                <MaterialCommunityIcons
                  name={dig.icon}
                  size={24}
                  color={i === 0 ? '#FFFFFF' : COLORS.textPrimary}
                />
                <Text style={[
                  styles.digLabel,
                  i === 0 && styles.digLabelHighlight,
                ]}>
                  {dig.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sniff Around — Article carousel */}
        {sniffArticles.length > 0 && (
          <View style={styles.sniffSection}>
            <Text style={styles.sectionTitle}>Sniff Around</Text>
            <FlatList
              horizontal
              data={sniffArticles}
              keyExtractor={(item) => item.slug}
              renderItem={({ item }) => (
                <SniffArticleCard
                  article={item}
                  sectionMeta={getSectionMeta(item.section)}
                  onPress={() => router.push(`/article/${item.slug}`)}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sniffList}
            />
          </View>
        )}

        {/* Getting Started (when streak < 5) */}
        {streak < 5 && (
          <View style={styles.gettingStarted}>
            <GettingStartedCard
              streak={streak}
              onCheckIn={() => handleCheckIn()}
            />
          </View>
        )}

        <View style={styles.disclaimerContainer}>
          <DisclaimerFooter />
        </View>
      </ScrollView>

      <DogSelector
        visible={showDogSelector}
        onClose={() => setShowDogSelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingBottom: TAB_BAR_HEIGHT,
  },
  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  calendarBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Dog Selector
  dogSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: MIN_TOUCH_TARGET,
  },
  selectedDogName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  switchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: '600',
  },
  // Week Strip
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  weekDay: {
    alignItems: 'center',
    flex: 1,
  },
  weekDayLabel: {
    fontSize: 10,
    color: COLORS.textDisabled,
    fontWeight: '500',
    marginBottom: 4,
  },
  weekDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayToday: {
    backgroundColor: COLORS.primary,
  },
  weekDayNum: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  weekDayNumToday: {
    color: '#FFFFFF',
  },
  weekDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.accent,
    marginTop: 3,
  },
  // Daily Digs
  digsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  digsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  digCard: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  digCardHighlight: {
    backgroundColor: COLORS.accent,
  },
  digLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  digLabelHighlight: {
    color: '#FFFFFF',
  },
  // Sniff Around
  sniffSection: {
    marginBottom: SPACING.lg,
    paddingLeft: SPACING.md,
  },
  sniffList: {
    gap: SPACING.sm,
    paddingRight: SPACING.md,
  },
  // Getting Started
  gettingStarted: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  // Disclaimer
  disclaimerContainer: {
    paddingHorizontal: SPACING.md,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyLogo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  emptyButton: {
    width: '100%',
  },
  addDogBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.xxl,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.subtle,
  },
  addDogBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

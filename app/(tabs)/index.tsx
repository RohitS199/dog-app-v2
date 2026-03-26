import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  InteractionManager,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useTabFocusAnimation } from '../../src/hooks/useTabFocusAnimation';
import { StreakCounter } from '../../src/components/ui/StreakCounter';
import { FlippableDogCard } from '../../src/components/ui/FlippableDogCard';
import { useDogStore } from '../../src/stores/dogStore';
import { useCheckInStore } from '../../src/stores/checkInStore';
import { useHealthStore } from '../../src/stores/healthStore';
import { useLearnStore } from '../../src/stores/learnStore';
import { useArticleTransitionStore } from '../../src/stores/articleTransitionStore';
import { useAuthStore } from '../../src/stores/authStore';
import { DisclaimerFooter } from '../../src/components/legal';
import { GettingStartedCard } from '../../src/components/ui/GettingStartedCard';
import { DogSelector } from '../../src/components/ui/DogSelector';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../../src/constants/theme';
import type { Dog } from '../../src/types/api';
import type { Article } from '../../src/types/learn';

const TAB_BAR_HEIGHT = 100; // padding for floating tab bar
const HEADER_CONTENT_HEIGHT = 64; // 8px pad + 48px button + 8px pad

// Energy mapping from check-in energy values
const ENERGY_MAP: Record<string, number> = {
  normal: 75,
  low: 50,
  lethargic: 25,
  barely_moving: 10,
  hyperactive: 95,
};


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


// Energy Card
function EnergyCard({ energyLevel, hasCheckIn }: { energyLevel: string | null; hasCheckIn: boolean }) {
  const pct = hasCheckIn ? (ENERGY_MAP[energyLevel ?? 'normal'] ?? 75) : 0;

  return (
    <View style={[energyStyles.card, SHADOWS.card]}>
      <View style={energyStyles.header}>
        <View style={energyStyles.iconContainer}>
          <MaterialCommunityIcons name="lightning-bolt" size={22} color={COLORS.accent} />
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
    backgroundColor: COLORS.card,
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
    width: 42,
    height: 42,
    borderRadius: 12,
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

// Article slug → icon mapping for themed card headers
const ARTICLE_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  'normal-poop': 'clipboard-check-outline',
  'skin-turgor-test': 'hand-heart-outline',
  'monthly-health-check': 'stethoscope',
  'what-vet-wishes': 'notebook-outline',
  'one-bad-day': 'calendar-check',
  'bloat-gdv': 'alert-octagon-outline',
  'urgent-vs-routine': 'hospital-box-outline',
  'cushings-disease': 'water-alert-outline',
  'prepare-for-vet': 'clipboard-list-outline',
  'dog-throwing-up': 'stomach',
  'toxic-foods': 'skull-crossbones-outline',
  'before-the-er': 'ambulance',
  'household-hazards': 'home-alert-outline',
  'reading-food-labels': 'tag-text-outline',
  'age-appropriate-feeding': 'food-drumstick-outline',
  'digestion-foods': 'food-apple-outline',
  'separation-anxiety': 'heart-broken-outline',
  'stress-signals': 'emoticon-sad-outline',
  'exercise-enrichment': 'run',
  'building-baseline': 'chart-line',
  'new-dog-wont-eat': 'food-off-outline',
  'first-year-milestones': 'trophy-outline',
};

// Article card for Sniff Around — matches Learn tab ArticleCard style
const SNIFF_CARD_WIDTH = 200;
const SNIFF_IMAGE_HEIGHT = 160;

function SniffArticleCard({ article, sectionMeta, onPress }: {
  article: Article;
  sectionMeta?: { title: string; accentColor: string };
  onPress: (rect: { x: number; y: number; width: number; height: number }, iconName: string, bgColor: string) => void;
}) {
  const iconName = ARTICLE_ICONS[article.slug] ?? 'book-open-variant';
  const accentColor = sectionMeta?.accentColor ?? COLORS.textDisabled;
  const imageRef = useRef<View>(null);

  const handlePress = useCallback(() => {
    imageRef.current?.measureInWindow((x, y, width, height) => {
      onPress({ x, y, width, height }, iconName, accentColor + '1A');
    });
  }, [onPress, iconName, accentColor]);

  return (
    <Pressable
      style={({ pressed }) => [sniffStyles.card, pressed && sniffStyles.pressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}. ${article.readTimeMinutes} minute read`}
    >
      <View ref={imageRef} style={sniffStyles.imageContainer}>
        {article.imageUrl ? (
          <Image source={{ uri: article.imageUrl }} style={sniffStyles.articleImage} resizeMode="cover" />
        ) : (
          <View style={[sniffStyles.imagePlaceholder, { backgroundColor: accentColor + '1A' }]}>
            <MaterialCommunityIcons name={iconName} size={36} color={accentColor} />
          </View>
        )}
      </View>
      <View style={sniffStyles.cardBody}>
        <Text style={sniffStyles.title} numberOfLines={2}>{article.title}</Text>
        <Text style={sniffStyles.meta}>{article.readTimeMinutes} min read</Text>
      </View>
    </Pressable>
  );
}

const sniffStyles = StyleSheet.create({
  card: {
    width: SNIFF_CARD_WIDTH,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    width: SNIFF_CARD_WIDTH,
    height: SNIFF_IMAGE_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  meta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
  },
});

export default function HomeScreen() {
  const focusStyle = useTabFocusAnimation();
  const insets = useSafeAreaInsets();
  const { dogs, isLoading, selectedDogId, fetchDogs, fetchLastTriageDates, selectDog } = useDogStore();
  const { calendarData, fetchMonthData } = useHealthStore();
  const { sections, fetchArticles, getSectionMeta } = useLearnStore();
  const startTransition = useArticleTransitionStore((s) => s.startTransition);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [showDogSelector, setShowDogSelector] = useState(false);

  const selectedDog = dogs.find((d) => d.id === selectedDogId);

  // Animated header — hide on scroll down, show on scroll up
  const prevScrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);

  const SNAP_CONFIG = { duration: 300, easing: Easing.out(Easing.cubic) };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      const diff = y - prevScrollY.value;
      prevScrollY.value = y;

      // Always show header at top of page
      if (y <= 0) {
        headerTranslateY.value = withTiming(0, SNAP_CONFIG);
        return;
      }

      // Smooth 1:1 tracking, clamped
      const next = headerTranslateY.value - diff;
      headerTranslateY.value = Math.min(0, Math.max(-HEADER_CONTENT_HEIGHT, next));
    },
    onEndDrag: () => {
      // Snap to fully visible or fully hidden
      const target = headerTranslateY.value < -HEADER_CONTENT_HEIGHT / 2
        ? -HEADER_CONTENT_HEIGHT
        : 0;
      headerTranslateY.value = withTiming(target, SNAP_CONFIG);
    },
    onMomentumEnd: () => {
      const target = headerTranslateY.value < -HEADER_CONTENT_HEIGHT / 2
        ? -HEADER_CONTENT_HEIGHT
        : 0;
      headerTranslateY.value = withTiming(target, SNAP_CONFIG);
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerTranslateY.value }],
      opacity: interpolate(
        headerTranslateY.value,
        [-HEADER_CONTENT_HEIGHT, 0],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  // Fetch data on mount — deferred until after mount + animation settle
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      fetchDogs().then(() => fetchLastTriageDates());
      fetchArticles();
    });
    return () => handle.cancel();
  }, []);

  // Fetch current month check-ins for week strip
  useEffect(() => {
    if (selectedDogId) {
      const handle = InteractionManager.runAfterInteractions(() => {
        const now = new Date();
        fetchMonthData(selectedDogId, now.getFullYear(), now.getMonth() + 1);
      });
      return () => handle.cancel();
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
  const streak = selectedDog?.checkin_streak ?? 0;

  // Fall back to most recent check-in for mood ring + energy when no today check-in
  const latestCheckIn = useMemo(() => {
    if (todayCheckIn) return todayCheckIn;
    // Find the most recent check-in from calendarData
    const dates = Object.keys(calendarData).sort().reverse();
    return dates.length > 0 ? calendarData[dates[0]] : null;
  }, [todayCheckIn, calendarData]);
  const hasAnyCheckIn = latestCheckIn !== null;

  // Articles for Sniff Around — personalized based on recent check-in data
  const sniffArticles = useMemo(() => {
    const allArticles = sections.flatMap((s) => s.articles);
    if (allArticles.length === 0) return [];

    // Map abnormal check-in values to relevant article slugs
    const RELEVANCE_MAP: Record<string, string[]> = {
      // Appetite issues
      'appetite:less': ['reading-food-labels', 'new-dog-wont-eat', 'age-appropriate-feeding'],
      'appetite:barely': ['new-dog-wont-eat', 'one-bad-day', 'prepare-for-vet'],
      'appetite:refusing': ['new-dog-wont-eat', 'urgent-vs-routine', 'prepare-for-vet'],
      'appetite:more': ['cushings-disease', 'age-appropriate-feeding', 'reading-food-labels'],
      // Water intake
      'water_intake:less': ['skin-turgor-test', 'one-bad-day'],
      'water_intake:much_less': ['skin-turgor-test', 'urgent-vs-routine', 'prepare-for-vet'],
      'water_intake:more': ['cushings-disease', 'skin-turgor-test'],
      'water_intake:excessive': ['cushings-disease', 'urgent-vs-routine'],
      // Energy
      'energy_level:low': ['one-bad-day', 'exercise-enrichment'],
      'energy_level:lethargic': ['urgent-vs-routine', 'one-bad-day', 'prepare-for-vet'],
      'energy_level:barely_moving': ['urgent-vs-routine', 'before-the-er', 'prepare-for-vet'],
      // Stool
      'stool_quality:soft': ['normal-poop', 'digestion-foods'],
      'stool_quality:diarrhea': ['normal-poop', 'digestion-foods', 'one-bad-day'],
      'stool_quality:constipated': ['normal-poop', 'digestion-foods'],
      'stool_quality:blood': ['urgent-vs-routine', 'before-the-er', 'prepare-for-vet'],
      // Vomiting
      'vomiting:once': ['dog-throwing-up', 'one-bad-day'],
      'vomiting:multiple': ['dog-throwing-up', 'urgent-vs-routine', 'toxic-foods'],
      'vomiting:dry_heaving': ['bloat-gdv', 'before-the-er', 'urgent-vs-routine'],
      // Mobility
      'mobility:stiff': ['exercise-enrichment', 'monthly-health-check'],
      'mobility:limping': ['urgent-vs-routine', 'prepare-for-vet'],
      'mobility:reluctant': ['exercise-enrichment', 'stress-signals'],
      'mobility:difficulty_rising': ['urgent-vs-routine', 'prepare-for-vet'],
      // Mood
      'mood:anxious': ['separation-anxiety', 'stress-signals'],
      'mood:clingy': ['stress-signals', 'separation-anxiety'],
      'mood:hiding': ['stress-signals', 'one-bad-day'],
      'mood:aggressive': ['stress-signals', 'urgent-vs-routine'],
      'mood:quiet': ['one-bad-day', 'stress-signals'],
    };

    // Score articles based on recent check-ins (last 7 days)
    const recentCheckIns = Object.values(calendarData)
      .sort((a, b) => b.check_in_date.localeCompare(a.check_in_date))
      .slice(0, 7);

    const slugScores: Record<string, number> = {};

    for (const checkIn of recentCheckIns) {
      const fields: [string, string | null][] = [
        ['appetite', checkIn.appetite],
        ['water_intake', checkIn.water_intake],
        ['energy_level', checkIn.energy_level],
        ['stool_quality', checkIn.stool_quality],
        ['vomiting', checkIn.vomiting],
        ['mobility', checkIn.mobility],
        ['mood', checkIn.mood],
      ];

      for (const [field, value] of fields) {
        if (!value) continue;
        const key = `${field}:${value}`;
        const relevantSlugs = RELEVANCE_MAP[key];
        if (relevantSlugs) {
          for (const slug of relevantSlugs) {
            slugScores[slug] = (slugScores[slug] ?? 0) + 1;
          }
        }
      }
    }

    // Sort articles by relevance score, then fill remaining with general picks
    const scoredSlugs = Object.entries(slugScores)
      .sort((a, b) => b[1] - a[1])
      .map(([slug]) => slug);

    const GENERAL_SLUGS = [
      'monthly-health-check', 'what-vet-wishes', 'building-baseline',
      'prepare-for-vet', 'normal-poop',
    ];

    // New users with no check-ins get starter articles
    const NO_CHECKIN_SLUGS = [
      'building-baseline', 'monthly-health-check', 'normal-poop',
      'what-vet-wishes', 'first-year-milestones',
    ];

    const orderedSlugs = recentCheckIns.length === 0
      ? NO_CHECKIN_SLUGS
      : [...scoredSlugs, ...GENERAL_SLUGS];

    // Deduplicate and pick top 5 that exist in articles
    const articleMap = new Map(allArticles.map((a) => [a.slug, a]));
    const picked: Article[] = [];
    const seen = new Set<string>();

    for (const slug of orderedSlugs) {
      if (seen.has(slug)) continue;
      const article = articleMap.get(slug);
      if (article) {
        picked.push(article);
        seen.add(slug);
      }
      if (picked.length >= 5) break;
    }

    // If we still have fewer than 5, fill with remaining articles
    if (picked.length < 5) {
      for (const article of allArticles) {
        if (seen.has(article.slug)) continue;
        picked.push(article);
        seen.add(article.slug);
        if (picked.length >= 5) break;
      }
    }

    return picked;
  }, [sections, calendarData]);

  const handleCheckIn = (dog?: Dog) => {
    const d = dog ?? selectedDog;
    if (d) {
      selectDog(d.id);
      router.push('/check-in');
    }
  };


  // Empty state
  if (dogs.length === 0 && !isLoading) {
    return (
      <Animated.View style={[{ flex: 1 }, focusStyle]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.emptyState}>
          <View style={[styles.emptyLogo, SHADOWS.elevated]}>
            <MaterialCommunityIcons name="paw" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.emptyTitle}>Welcome to PupLog!</Text>
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
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }, focusStyle]}>
    <View style={styles.safe}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + HEADER_CONTENT_HEIGHT, paddingBottom: TAB_BAR_HEIGHT }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={COLORS.textPrimary} />
        }
      >
        {/* Greeting — scrolls with content */}
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>{getGreeting()}, {(user?.user_metadata?.first_name as string) || 'friend'}</Text>
        </View>

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

        {/* Dog Selector */}
        {dogs.length > 1 && selectedDog && (
          <Pressable
            style={styles.dogSelectorRow}
            onPress={() => setShowDogSelector(true)}
            accessibilityRole="button"
            accessibilityLabel={`Viewing ${selectedDog.name}. Tap to switch dogs.`}
          >
            <View style={{ flex: 1 }} />
            <Text style={styles.switchText}>Switch</Text>
          </Pressable>
        )}

        {/* Dog Profile Card */}
        {selectedDog && (
          <FlippableDogCard
            dog={selectedDog}
            onEditPress={() => router.push({ pathname: '/edit-dog', params: { id: selectedDog.id } })}
          />
        )}

        {/* Streak Counter */}
        <View style={styles.streakContainer}>
          <StreakCounter streak={streak} />
        </View>

        {/* Energy Card */}
        <EnergyCard
          energyLevel={latestCheckIn?.energy_level ?? null}
          hasCheckIn={hasAnyCheckIn}
        />


        {/* Sniff Around — Article carousel */}
        {sniffArticles.length > 0 && (
          <View style={styles.sniffSection}>
            <Text style={[styles.sectionTitle, { paddingLeft: SPACING.md }]}>Sniff Around</Text>
            <FlatList
              horizontal
              data={sniffArticles}
              keyExtractor={(item) => item.slug}
              renderItem={({ item }) => {
                const meta = getSectionMeta(item.section);
                return (
                  <SniffArticleCard
                    article={item}
                    sectionMeta={meta}
                    onPress={(rect, iconName, bgColor) => {
                      startTransition(item.slug, rect, meta?.accentColor ?? null, iconName, bgColor);
                    }}
                  />
                );
              }}
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
      </Animated.ScrollView>

      {/* Status bar background — fixed, never moves */}
      <View style={[styles.headerStatusBar, { height: insets.top }]} />

      {/* Floating header content — slides up/down with scroll */}
      <Animated.View style={[styles.headerContent, { top: insets.top }, headerAnimatedStyle]}>
        <View style={styles.avatarCircle}>
          <Image source={require('../../assets/logo-transparent.png')} style={styles.avatarImage} />
        </View>
        <View style={{ flex: 1 }} />
        <Pressable
          style={styles.calendarBtn}
          onPress={() => router.push('/(tabs)/health')}
          accessibilityRole="button"
          accessibilityLabel="View health calendar"
        >
          <MaterialCommunityIcons name="calendar-heart" size={24} color={COLORS.textPrimary} />
        </Pressable>
      </Animated.View>

      <DogSelector
        visible={showDogSelector}
        onClose={() => setShowDogSelector(false)}
      />
    </View>
    </Animated.View>
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
  // Floating Header — two layers
  headerStatusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    zIndex: 11,
  },
  headerContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  greetingRow: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  greeting: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.textPrimary,
    textAlign: 'center',
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
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '700',
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
  streakContainer: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  // Sniff Around
  sniffSection: {
    marginBottom: SPACING.lg,
  },
  sniffList: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
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

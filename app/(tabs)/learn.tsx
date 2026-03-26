import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  InteractionManager,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useTabFocusAnimation } from '../../src/hooks/useTabFocusAnimation';
import { useLearnStore } from '../../src/stores/learnStore';
import { useArticleTransitionStore } from '../../src/stores/articleTransitionStore';
import { FavoriteToast } from '../../src/components/ui/FavoriteToast';
import type { Article, Section } from '../../src/types/learn';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../../src/constants/theme';

const TAB_BAR_HEIGHT = 100;
const CARD_WIDTH = 200;
const IMAGE_HEIGHT = 160;
const HEART_COLOR = '#FF385C';

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

function ArticleCard({
  article,
  accentColor,
  onPress,
  isFavorite,
  onToggleFavorite,
}: {
  article: Article;
  accentColor: string;
  onPress: (rect: { x: number; y: number; width: number; height: number }, iconName: string, bgColor: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const iconName = ARTICLE_ICONS[article.slug] ?? 'book-open-variant';
  const imageRef = useRef<View>(null);

  const handlePress = useCallback(() => {
    if (imageRef.current) {
      imageRef.current.measureInWindow((x, y, width, height) => {
        onPress({ x, y, width, height }, iconName, accentColor + '1A');
      });
    } else {
      onPress({ x: 0, y: 0, width: CARD_WIDTH, height: IMAGE_HEIGHT }, iconName, accentColor + '1A');
    }
  }, [onPress, iconName, accentColor]);

  return (
    <Pressable
      style={({ pressed }) => [styles.articleCard, pressed && styles.articleCardPressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}. ${article.readTimeMinutes} minute read`}
    >
      <View ref={imageRef} style={styles.imageContainer}>
        {article.imageUrl ? (
          <Image source={{ uri: article.imageUrl }} style={styles.articleImage} resizeMode="cover" />
        ) : (
          <View style={[styles.articleImagePlaceholder, { backgroundColor: accentColor + '1A' }]}>
            <MaterialCommunityIcons name={iconName} size={36} color={accentColor} />
          </View>
        )}
        <Pressable
          style={styles.heartOverlay}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          hitSlop={8}
        >
          <View style={styles.heartCircle}>
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? HEART_COLOR : '#FFFFFF'}
            />
          </View>
        </Pressable>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.articleMeta}>{article.readTimeMinutes} min read</Text>
      </View>
    </Pressable>
  );
}

function FavoriteArticleCard({
  article,
  onPress,
  onToggleFavorite,
}: {
  article: Article;
  onPress: (rect: { x: number; y: number; width: number; height: number }, iconName: string, bgColor: string) => void;
  onToggleFavorite: () => void;
}) {
  const iconName = ARTICLE_ICONS[article.slug] ?? 'book-open-variant';
  const sectionMeta = useLearnStore.getState().getSectionMeta(article.section);
  const accentColor = sectionMeta?.accentColor ?? COLORS.accent;
  const imageRef = useRef<View>(null);

  const handlePress = useCallback(() => {
    if (imageRef.current) {
      imageRef.current.measureInWindow((x, y, width, height) => {
        onPress({ x, y, width, height }, iconName, accentColor + '1A');
      });
    } else {
      onPress({ x: 0, y: 0, width: 200, height: 120 }, iconName, accentColor + '1A');
    }
  }, [onPress, iconName, accentColor]);

  return (
    <Pressable
      style={({ pressed }) => [styles.favoriteCard, pressed && styles.articleCardPressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}. ${article.readTimeMinutes} minute read`}
    >
      <View ref={imageRef} style={styles.favoriteImageContainer}>
        {article.imageUrl ? (
          <Image source={{ uri: article.imageUrl }} style={styles.favoriteImage} resizeMode="cover" />
        ) : (
          <View style={[styles.favoriteImagePlaceholder, { backgroundColor: accentColor + '1A' }]}>
            <MaterialCommunityIcons name={iconName} size={32} color={accentColor} />
          </View>
        )}
        <Pressable
          style={styles.heartOverlay}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          accessibilityRole="button"
          accessibilityLabel="Remove from favorites"
          hitSlop={8}
        >
          <View style={styles.heartCircle}>
            <MaterialCommunityIcons name="heart" size={18} color={HEART_COLOR} />
          </View>
        </Pressable>
      </View>
      <View style={styles.favoriteCardBody}>
        <Text style={styles.favoriteTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.favoriteSummary} numberOfLines={2}>
          {article.summary}
        </Text>
        <Text style={styles.articleMeta}>{article.readTimeMinutes} min read</Text>
      </View>
    </Pressable>
  );
}

function SectionHeader({ section }: { section: Section }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconContainer, { backgroundColor: section.accentColor + '1A' }]}>
        <MaterialCommunityIcons
          name={section.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={20}
          color={section.accentColor}
        />
      </View>
      <View style={styles.sectionTextContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    </View>
  );
}

function SectionRow({
  section,
  onArticlePress,
  favoriteSlugs,
  onToggleFavorite,
}: {
  section: Section;
  onArticlePress: (slug: string, rect: { x: number; y: number; width: number; height: number }, accentColor: string, iconName: string, imageBg: string) => void;
  favoriteSlugs: string[];
  onToggleFavorite: (slug: string) => void;
}) {
  return (
    <View style={styles.sectionContainer}>
      <SectionHeader section={section} />
      <FlatList
        horizontal
        data={section.articles}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            accentColor={section.accentColor}
            onPress={(rect, iconName, bgColor) => onArticlePress(item.slug, rect, section.accentColor, iconName, bgColor)}
            isFavorite={favoriteSlugs.includes(item.slug)}
            onToggleFavorite={() => onToggleFavorite(item.slug)}
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.articleList}
      />
    </View>
  );
}

export default function LearnScreen() {
  const focusStyle = useTabFocusAnimation();
  const router = useRouter();
  const {
    sections,
    isLoading,
    error,
    fetchArticles,
    loadFavorites,
    favoriteSlugs,
    toggleFavorite,
    getFavoriteArticles,
  } = useLearnStore();
  const [showFavorites, setShowFavorites] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<'Added' | 'Removed'>('Added');

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      fetchArticles();
      loadFavorites();
    });
    return () => handle.cancel();
  }, [fetchArticles, loadFavorites]);

  const startTransition = useArticleTransitionStore((s) => s.startTransition);

  const handleArticlePress = useCallback(
    (slug: string, rect: { x: number; y: number; width: number; height: number }, accentColor: string, iconName: string, imageBg: string) => {
      startTransition(slug, rect, accentColor, iconName, imageBg);
    },
    [startTransition],
  );

  const handleRefresh = useCallback(() => {
    fetchArticles(true);
  }, [fetchArticles]);

  const handleToggleFavorite = useCallback(
    (slug: string) => {
      const wasAlreadyFavorite = favoriteSlugs.includes(slug);
      toggleFavorite(slug);
      setToastMessage(wasAlreadyFavorite ? 'Removed' : 'Added');
      setToastVisible(true);
    },
    [toggleFavorite, favoriteSlugs],
  );

  const favoriteArticles = getFavoriteArticles();

  // First load — no cached data
  if (isLoading && sections.length === 0) {
    return (
      <Animated.View style={[{ flex: 1 }, focusStyle]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
      </Animated.View>
    );
  }

  // Error state
  if (error && sections.length === 0) {
    return (
      <Animated.View style={[{ flex: 1 }, focusStyle]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
            onPress={() => fetchArticles(true)}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
      </Animated.View>
    );
  }

  // Empty state — no articles published
  if (!isLoading && sections.length === 0 && !error) {
    return (
      <Animated.View style={[{ flex: 1 }, focusStyle]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <MaterialCommunityIcons
            name="book-open-variant"
            size={48}
            color={COLORS.textDisabled}
          />
          <Text style={styles.emptyTitle}>Articles are on the way!</Text>
          <Text style={styles.emptySubtitle}>Check back soon.</Text>
        </View>
      </SafeAreaView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }, focusStyle]}>
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>{showFavorites ? 'Favorites' : 'Learn'}</Text>
          </View>
          <Pressable
            onPress={() => setShowFavorites(!showFavorites)}
            style={styles.favoritesHeaderButton}
            accessibilityRole="button"
            accessibilityLabel={showFavorites ? 'Show all articles' : 'Show favorites'}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={showFavorites ? 'heart' : 'heart-outline'}
              size={26}
              color={showFavorites ? HEART_COLOR : COLORS.textSecondary}
            />
          </Pressable>
        </View>

        {showFavorites ? (
          favoriteArticles.length > 0 ? (
            <View style={styles.favoritesGrid}>
              {favoriteArticles.map((article) => (
                <FavoriteArticleCard
                  key={article.slug}
                  article={article}
                  onPress={(rect, iconName, bgColor) => {
                    const meta = useLearnStore.getState().getSectionMeta(article.section);
                    handleArticlePress(article.slug, rect, meta?.accentColor ?? COLORS.accent, iconName, bgColor);
                  }}
                  onToggleFavorite={() => handleToggleFavorite(article.slug)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyFavorites}>
              <MaterialCommunityIcons name="heart-outline" size={48} color={COLORS.textDisabled} />
              <Text style={styles.emptyFavoritesTitle}>No favorites yet</Text>
              <Text style={styles.emptyFavoritesSubtitle}>
                Tap the heart on any article to save it here
              </Text>
            </View>
          )
        ) : (
          sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              onArticlePress={handleArticlePress}
              favoriteSlugs={favoriteSlugs}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        )}

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            Articles are for educational purposes only and are not a substitute for professional veterinary advice.
          </Text>
        </View>
      </ScrollView>
      <FavoriteToast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingVertical: SPACING.md,
    paddingBottom: TAB_BAR_HEIGHT,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  headerText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  pageTitle: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  favoritesHeaderButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  articleList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },

  // Horizontal article card (Airbnb-style)
  articleCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  articleCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  articleImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 1,
  },
  heartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  articleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  articleMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
  },

  // Favorites grid (2-column)
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  favoriteCard: {
    width: '48.5%',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
    ...SHADOWS.card,
  },
  favoriteImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
  },
  favoriteImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteCardBody: {
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  favoriteTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  favoriteSummary: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 17,
  },

  // Empty favorites state
  emptyFavorites: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyFavoritesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyFavoritesSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Error/empty states
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  disclaimerContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  disclaimerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
  },
});

import { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  Easing,
  useReducedMotion,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useArticleTransitionStore } from '../../stores/articleTransitionStore';
import { useLearnStore } from '../../stores/learnStore';
import { DisclaimerFooter } from '../legal';
import { FavoriteToast } from './FavoriteToast';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  FONTS,
  SHADOWS,
  MIN_TOUCH_TARGET,
} from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 220;
const HEART_COLOR = '#FF385C';

// Matching the article detail screen's markdown styles
const markdownStyles = StyleSheet.create({
  heading1: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  heading2: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  heading3: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  paragraph: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  bullet_list_icon: {
    color: COLORS.textPrimary,
  },
  ordered_list_icon: {
    color: COLORS.textPrimary,
  },
  list_item: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
});

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Natural pace — not too fast, not sluggish
// withTiming for predictable duration, ease-out curve for deceleration
const EXPAND_MS = 300;
const COLLAPSE_MS = 250;

export function ArticleExpandOverlay() {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const {
    isExpanded,
    isClosing,
    selectedSlug,
    originRect,
    accentColor,
    iconName,
    imageBg,
    closeTransition,
    reset,
  } = useArticleTransitionStore();

  const { getArticleBySlug, getSectionMeta, isFavorite, toggleFavorite } = useLearnStore();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<'Added' | 'Removed'>('Added');
  const [showBody, setShowBody] = useState(false);

  // Animation progress: 0 = card position, 1 = full hero
  const progress = useSharedValue(0);
  // Content elements opacity (staggered)
  const contentOpacity = useSharedValue(0);
  // Background opacity
  const bgOpacity = useSharedValue(0);
  // Header buttons
  const headerOpacity = useSharedValue(0);

  const article = selectedSlug ? getArticleBySlug(selectedSlug) : null;
  const sectionMeta = article ? getSectionMeta(article.section) : undefined;
  const favorited = article ? isFavorite(article.slug) : false;

  const heroTop = insets.top + 12;

  // ── Expand animation ──
  useEffect(() => {
    if (isExpanded && !isClosing && originRect) {
      if (reducedMotion) {
        progress.value = 1;
        bgOpacity.value = 1;
        headerOpacity.value = 1;
        contentOpacity.value = 1;
        setShowBody(true);
        return;
      }

      const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
      progress.value = withTiming(1, { duration: EXPAND_MS, easing: ease });
      bgOpacity.value = withTiming(1, { duration: EXPAND_MS, easing: ease });
      contentOpacity.value = withDelay(150, withTiming(1, { duration: 200 }));
      headerOpacity.value = withDelay(200, withTiming(1, { duration: 180 }));

      const timer = setTimeout(() => setShowBody(true), EXPAND_MS + 50);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, isClosing, originRect, reducedMotion]);

  // ── Collapse animation ──
  useEffect(() => {
    if (isClosing && originRect) {
      if (reducedMotion) {
        handleAnimationComplete();
        return;
      }

      // Everything collapses together — no delays
      const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
      contentOpacity.value = withTiming(0, { duration: 100 });
      headerOpacity.value = withTiming(0, { duration: 80 });
      bgOpacity.value = withTiming(0, { duration: COLLAPSE_MS, easing: ease });
      progress.value = withTiming(0, { duration: COLLAPSE_MS, easing: ease }, (finished) => {
        if (finished) {
          runOnJS(handleAnimationComplete)();
        }
      });
    }
  }, [isClosing, originRect, reducedMotion]);

  const handleAnimationComplete = useCallback(() => {
    setShowBody(false);
    reset();
  }, [reset]);

  // ── Android back button ──
  useEffect(() => {
    if (!isExpanded) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      closeTransition();
      return true;
    });
    return () => handler.remove();
  }, [isExpanded, closeTransition]);

  const handleToggleFavorite = useCallback(() => {
    if (!article) return;
    setToastMessage(favorited ? 'Removed' : 'Added');
    toggleFavorite(article.slug);
    setToastVisible(true);
  }, [article, favorited, toggleFavorite]);

  // ── Animated styles ──

  // The shared element (image) — grows from card size to hero size
  // KEEPS its rounded shape throughout (borderRadius stays constant)
  const sharedImageStyle = useAnimatedStyle(() => {
    if (!originRect) return {};
    return {
      position: 'absolute',
      left: interpolate(progress.value, [0, 1], [originRect.x, SPACING.md]),
      top: interpolate(progress.value, [0, 1], [originRect.y, heroTop]),
      width: interpolate(progress.value, [0, 1], [originRect.width, SCREEN_WIDTH - SPACING.md * 2]),
      height: interpolate(progress.value, [0, 1], [originRect.height, HERO_HEIGHT]),
      borderRadius: BORDER_RADIUS.xl, // stays rounded — shape doesn't change
      zIndex: 10,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    opacity: bgOpacity.value,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      { scale: interpolate(headerOpacity.value, [0, 1], [0.85, 1]) },
    ],
  }));

  // Content area slides down from behind the image as it expands
  // The top position is driven by the image's bottom edge (progress-based)
  const contentStyle = useAnimatedStyle(() => {
    if (!originRect) return {};
    // Content top = image bottom + gap
    const imageBottom = interpolate(
      progress.value,
      [0, 1],
      [originRect.y + originRect.height, heroTop + HERO_HEIGHT],
    );
    return {
      opacity: contentOpacity.value,
      transform: [
        { translateY: imageBottom - (heroTop + HERO_HEIGHT) },
      ],
    };
  });

  // Don't render anything when not active
  if (!isExpanded || !originRect) return null;

  const displayColor = accentColor || sectionMeta?.accentColor || COLORS.accent;
  const displayIcon = (iconName || ARTICLE_ICONS[selectedSlug ?? ''] || 'book-open-variant') as keyof typeof MaterialCommunityIcons.glyphMap;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isExpanded ? 'auto' : 'none'}>
      {/* Background — the "detail screen" surface */}
      <Animated.View style={backdropStyle} />

      {/* Header buttons — float on top */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 8 }, headerStyle]}>
        <Pressable
          style={[styles.headerBtn, SHADOWS.subtle]}
          onPress={closeTransition}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
        </Pressable>
        <Pressable
          style={[styles.headerBtn, SHADOWS.subtle]}
          onPress={handleToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <MaterialCommunityIcons
            name={favorited ? 'heart' : 'heart-outline'}
            size={20}
            color={favorited ? HEART_COLOR : COLORS.textSecondary}
          />
        </Pressable>
      </Animated.View>

      {/* THE SHARED ELEMENT — image that transitions from card to hero */}
      <Animated.View style={sharedImageStyle}>
        {article?.imageUrl ? (
          <Image
            source={{ uri: article.imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: (imageBg || displayColor + '1A'), alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <MaterialCommunityIcons name={displayIcon} size={48} color={displayColor} />
          </View>
        )}
      </Animated.View>

      {/* Detail content — positioned below the hero's final position */}
      <Animated.View
        style={[
          styles.contentContainer,
          { top: heroTop + HERO_HEIGHT },
          contentStyle,
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.contentPadding}
          showsVerticalScrollIndicator={false}
        >
          {sectionMeta && (
            <View style={[styles.sectionBadge, { backgroundColor: sectionMeta.accentColor }]}>
              <Text style={styles.sectionBadgeText}>{sectionMeta.title}</Text>
            </View>
          )}

          <Text style={styles.title}>{article?.title}</Text>
          <Text style={styles.summary}>{article?.summary}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{article?.readTimeMinutes} min read</Text>
            {article?.publishedAt && (
              <>
                <Text style={styles.metaDot}>{'\u00B7'}</Text>
                <Text style={styles.metaText}>{formatDate(article.publishedAt)}</Text>
              </>
            )}
          </View>

          <View
            style={[
              styles.accentDivider,
              { backgroundColor: sectionMeta?.accentColor ?? COLORS.primary },
            ]}
          />

          {showBody && article?.body ? (
            <Markdown
              style={markdownStyles}
              onLinkPress={(url: string) => {
                Linking.openURL(url);
                return false;
              }}
            >
              {article.body}
            </Markdown>
          ) : null}

          <View style={styles.footerSpacing} />
          <DisclaimerFooter />
          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </Animated.View>

      <FavoriteToast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  contentPadding: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionBadge: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginBottom: SPACING.sm,
  },
  sectionBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  summary: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDisabled,
  },
  metaDot: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDisabled,
    marginHorizontal: SPACING.xs,
  },
  accentDivider: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    marginBottom: SPACING.lg,
  },
  footerSpacing: {
    height: SPACING.lg,
  },
});

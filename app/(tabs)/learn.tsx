import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { useLearnStore } from '../../src/stores/learnStore';
import type { Article, Section } from '../../src/types/learn';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../../src/constants/theme';

const TAB_BAR_HEIGHT = 100;

function ArticleCard({ article, onPress }: { article: Article; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.articleCard, pressed && styles.articleCardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}. ${article.readTimeMinutes} minute read`}
    >
      <Text style={styles.articleTitle} numberOfLines={2}>
        {article.title}
      </Text>
      <Text style={styles.articleSummary} numberOfLines={2}>
        {article.summary}
      </Text>
      <Text style={styles.articleMeta}>{article.readTimeMinutes} min read</Text>
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
        <Text style={styles.sectionDescription} numberOfLines={1}>
          {section.description}
        </Text>
      </View>
    </View>
  );
}

function SectionRow({ section, onArticlePress }: { section: Section; onArticlePress: (slug: string) => void }) {
  return (
    <View style={styles.sectionContainer}>
      <SectionHeader section={section} />
      <FlatList
        horizontal
        data={section.articles}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => onArticlePress(item.slug)} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.articleList}
      />
    </View>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const { sections, isLoading, error, fetchArticles } = useLearnStore();

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleArticlePress = (slug: string) => {
    router.push(`/article/${slug}`);
  };

  const handleRefresh = () => {
    fetchArticles(true);
  };

  // First load — no cached data
  if (isLoading && sections.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && sections.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
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
    );
  }

  // Empty state — no articles published
  if (!isLoading && sections.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
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
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        <Text style={styles.pageTitle}>Learn</Text>
        <Text style={styles.pageSubtitle}>
          Educational articles to help you understand your dog's health
        </Text>

        {sections.map((section) => (
          <SectionRow
            key={section.id}
            section={section}
            onArticlePress={handleArticlePress}
          />
        ))}

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            Articles are for educational purposes only and are not a substitute for professional veterinary advice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  pageTitle: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
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
  articleCard: {
    width: 170,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  articleCardPressed: {
    opacity: 0.8,
  },
  articleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  articleSummary: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  articleMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
  },
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

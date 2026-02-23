import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useLearnStore } from '../../src/stores/learnStore';
import { DisclaimerFooter } from '../../src/components/legal';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../src/constants/theme';

const markdownStyles = StyleSheet.create({
  heading2: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  heading3: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ArticleDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { isLoading, getArticleBySlug, getSectionMeta } = useLearnStore();

  const article = getArticleBySlug(slug ?? '');
  const sectionMeta = article ? getSectionMeta(article.section) : undefined;

  // Loading state
  if (isLoading && !article) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Not found
  if (!article) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Article not found</Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>{'\u2190'} Back</Text>
        </Pressable>

        {sectionMeta && (
          <Text style={[styles.sectionLabel, { color: sectionMeta.accentColor }]}>
            {sectionMeta.title}
          </Text>
        )}

        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.summary}>{article.summary}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{article.readTimeMinutes} min read</Text>
          {article.publishedAt && (
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

        <Markdown
          style={markdownStyles}
          onLinkPress={(url: string) => {
            Linking.openURL(url);
            return false;
          }}
        >
          {article.body}
        </Markdown>

        <View style={styles.footerSpacing} />
        <DisclaimerFooter />
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
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  notFoundText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
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
    height: 2,
    borderRadius: 1,
    marginBottom: SPACING.lg,
  },
  footerSpacing: {
    height: SPACING.lg,
  },
});

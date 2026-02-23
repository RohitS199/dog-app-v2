import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Article, Section } from '../types/learn';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const SECTION_META: Omit<Section, 'articles'>[] = [
  {
    id: 'know-your-dog',
    title: 'Know Your Dog',
    description: 'Learn what\'s normal so you can spot what isn\'t',
    icon: 'dog',
    accentColor: '#7A8E6C',
  },
  {
    id: 'when-to-worry',
    title: 'When to Worry',
    description: 'Understand what symptoms mean and when to act',
    icon: 'alert-circle-outline',
    accentColor: '#E65100',
  },
  {
    id: 'safety-first-aid',
    title: 'Safety & First Aid',
    description: 'Be prepared before an emergency happens',
    icon: 'shield-plus-outline',
    accentColor: '#C62828',
  },
  {
    id: 'nutrition-diet',
    title: 'Nutrition & Diet',
    description: 'What your dog eats matters more than you think',
    icon: 'food-apple-outline',
    accentColor: '#FF8F00',
  },
  {
    id: 'behavior-wellness',
    title: 'Behavior & Wellness',
    description: 'Your dog\'s mental health matters too',
    icon: 'heart-pulse',
    accentColor: '#6A5ACD',
  },
  {
    id: 'puppy-new-dog',
    title: 'Puppy & New Dog',
    description: 'Starting out right with your new companion',
    icon: 'paw',
    accentColor: '#94A684',
  },
];

interface LearnState {
  articles: Article[];
  sections: Section[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  fetchArticles: (force?: boolean) => Promise<void>;
  getArticleBySlug: (slug: string) => Article | undefined;
  getSectionMeta: (sectionSlug: string) => Omit<Section, 'articles'> | undefined;
  clearLearn: () => void;
}

export const useLearnStore = create<LearnState>((set, get) => ({
  articles: [],
  sections: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchArticles: async (force = false) => {
    const { lastFetched, isLoading } = get();

    if (isLoading) return;

    if (!force && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('slug, title, summary, body, section, read_time_minutes, image_url, sort_order, published_at')
        .eq('published', true)
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const articles: Article[] = (data ?? []).map((row: Record<string, unknown>) => ({
        slug: row.slug as string,
        title: row.title as string,
        summary: row.summary as string,
        body: row.body as string,
        section: row.section as string,
        readTimeMinutes: row.read_time_minutes as number,
        imageUrl: (row.image_url as string) ?? null,
        sortOrder: row.sort_order as number,
        publishedAt: (row.published_at as string) ?? null,
      }));

      // Group by section, keeping only sections that have articles
      const articlesBySection = new Map<string, Article[]>();
      for (const article of articles) {
        const existing = articlesBySection.get(article.section) ?? [];
        existing.push(article);
        articlesBySection.set(article.section, existing);
      }

      const sections: Section[] = SECTION_META
        .filter((meta) => articlesBySection.has(meta.id))
        .map((meta) => ({
          ...meta,
          articles: articlesBySection.get(meta.id)!,
        }));

      set({ articles, sections, isLoading: false, lastFetched: Date.now() });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load articles',
        isLoading: false,
      });
    }
  },

  getArticleBySlug: (slug) => {
    return get().articles.find((a) => a.slug === slug);
  },

  getSectionMeta: (sectionSlug) => {
    return SECTION_META.find((s) => s.id === sectionSlug);
  },

  clearLearn: () =>
    set({
      articles: [],
      sections: [],
      isLoading: false,
      error: null,
      lastFetched: null,
    }),
}));

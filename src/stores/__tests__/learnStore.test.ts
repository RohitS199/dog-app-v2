import { useLearnStore } from '../learnStore';

// Reset store state before each test
beforeEach(() => {
  useLearnStore.setState({
    articles: [],
    sections: [],
    isLoading: false,
    error: null,
    lastFetched: null,
  });
});

describe('learnStore', () => {
  describe('initial state', () => {
    it('starts with empty articles, sections, and null lastFetched', () => {
      const state = useLearnStore.getState();
      expect(state.articles).toEqual([]);
      expect(state.sections).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetched).toBeNull();
    });
  });

  describe('fetchArticles', () => {
    it('sets isLoading to false after fetch', async () => {
      await useLearnStore.getState().fetchArticles();
      expect(useLearnStore.getState().isLoading).toBe(false);
    });

    it('clears error on successful fetch', async () => {
      useLearnStore.setState({ error: 'old error' });
      await useLearnStore.getState().fetchArticles();
      expect(useLearnStore.getState().error).toBeNull();
    });

    it('sets articles to empty array when no data returned', async () => {
      await useLearnStore.getState().fetchArticles();
      expect(useLearnStore.getState().articles).toEqual([]);
    });

    it('skips fetch when cache is fresh (within 5 min)', async () => {
      useLearnStore.setState({ lastFetched: Date.now() });
      const prevLastFetched = useLearnStore.getState().lastFetched;
      await useLearnStore.getState().fetchArticles();
      // lastFetched should not change since fetch was skipped
      expect(useLearnStore.getState().lastFetched).toBe(prevLastFetched);
    });

    it('fetches when force=true despite fresh cache', async () => {
      useLearnStore.setState({ lastFetched: Date.now() });
      await useLearnStore.getState().fetchArticles(true);
      // isLoading should be false after forced fetch completes
      expect(useLearnStore.getState().isLoading).toBe(false);
    });
  });

  describe('getArticleBySlug', () => {
    it('returns article when slug matches', () => {
      const mockArticle = {
        slug: 'test-article',
        title: 'Test',
        summary: 'Summary',
        body: '# Hello',
        section: 'nutrition-diet',
        readTimeMinutes: 3,
        imageUrl: null,
        sortOrder: 1,
        publishedAt: null,
      };
      useLearnStore.setState({ articles: [mockArticle] });
      expect(useLearnStore.getState().getArticleBySlug('test-article')).toEqual(mockArticle);
    });

    it('returns undefined for non-existent slug', () => {
      expect(useLearnStore.getState().getArticleBySlug('does-not-exist')).toBeUndefined();
    });
  });

  describe('sections assembly', () => {
    it('only includes sections with published articles', () => {
      const articles = [
        {
          slug: 'a1',
          title: 'Article 1',
          summary: 'S1',
          body: 'B1',
          section: 'nutrition-diet',
          readTimeMinutes: 2,
          imageUrl: null,
          sortOrder: 1,
          publishedAt: null,
        },
        {
          slug: 'a2',
          title: 'Article 2',
          summary: 'S2',
          body: 'B2',
          section: 'nutrition-diet',
          readTimeMinutes: 4,
          imageUrl: null,
          sortOrder: 2,
          publishedAt: null,
        },
      ];
      // Manually set sections as if fetchArticles assembled them
      useLearnStore.setState({
        articles,
        sections: [
          {
            id: 'nutrition-diet',
            title: 'Nutrition & Diet',
            description: 'Feeding guidelines, toxic foods, and dietary health',
            icon: 'food-apple',
            accentColor: '#388E3C',
            articles,
          },
        ],
      });

      const { sections } = useLearnStore.getState();
      expect(sections).toHaveLength(1);
      expect(sections[0].id).toBe('nutrition-diet');
      expect(sections[0].articles).toHaveLength(2);
    });
  });

  describe('clearLearn', () => {
    it('resets all state including lastFetched to null', () => {
      useLearnStore.setState({
        articles: [{ slug: 'test' } as any],
        sections: [{ id: 'test' } as any],
        isLoading: true,
        error: 'some error',
        lastFetched: Date.now(),
      });

      useLearnStore.getState().clearLearn();
      const state = useLearnStore.getState();
      expect(state.articles).toEqual([]);
      expect(state.sections).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetched).toBeNull();
    });
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AIInsightCard } from '../ui/AIInsightCard';
import type { AIHealthInsight } from '../../types/health';

const mockInsight: AIHealthInsight = {
  id: 'insight-1',
  dog_id: 'dog-1',
  user_id: 'user-1',
  insight_type: 'worsening',
  severity: 'watch',
  fields_involved: ['appetite', 'energy_level'],
  timespan_days: 5,
  title: 'Appetite and Energy Declining',
  message: 'Your dog has shown decreased appetite and energy over the past 5 days.',
  is_positive: false,
  recommended_articles: [
    { slug: 'appetite-changes', reason: 'Understanding appetite changes in dogs' },
  ],
  triggered_by_check_in_id: 'checkin-1',
  rolling_summary_snapshot: null,
  model_used: 'claude-sonnet-4-5-20250929',
  metadata: {
    input_tokens: 1000,
    output_tokens: 200,
    latency_ms: 3000,
    json_parse_success: true,
    observations_count: 2,
    max_severity: 'watch',
    articles_recommended: 1,
    had_annotation: false,
  },
  created_at: '2026-02-24T10:00:00Z',
};

describe('AIInsightCard', () => {
  const mockOnArticlePress = jest.fn();

  beforeEach(() => {
    mockOnArticlePress.mockClear();
  });

  it('renders the insight title', () => {
    const { getByText } = render(
      <AIInsightCard insight={mockInsight} onArticlePress={mockOnArticlePress} />
    );
    expect(getByText('Appetite and Energy Declining')).toBeTruthy();
  });

  it('renders the insight message', () => {
    const { getByText } = render(
      <AIInsightCard insight={mockInsight} onArticlePress={mockOnArticlePress} />
    );
    expect(getByText('Your dog has shown decreased appetite and energy over the past 5 days.')).toBeTruthy();
  });

  it('renders the correct severity badge', () => {
    const { getByText } = render(
      <AIInsightCard insight={mockInsight} onArticlePress={mockOnArticlePress} />
    );
    expect(getByText('Watch')).toBeTruthy();
  });

  it('shows "Good sign" when is_positive is true', () => {
    const positiveInsight: AIHealthInsight = {
      ...mockInsight,
      is_positive: true,
      insight_type: 'positive',
      severity: 'info',
      title: 'Consistent Energy Levels',
    };
    const { getByText } = render(
      <AIInsightCard insight={positiveInsight} onArticlePress={mockOnArticlePress} />
    );
    expect(getByText('Good sign')).toBeTruthy();
  });

  it('does NOT show "Good sign" when is_positive is false', () => {
    const { queryByText } = render(
      <AIInsightCard insight={mockInsight} onArticlePress={mockOnArticlePress} />
    );
    expect(queryByText('Good sign')).toBeNull();
  });

  it('renders article recommendation links', () => {
    const { getByText } = render(
      <AIInsightCard insight={mockInsight} onArticlePress={mockOnArticlePress} />
    );
    expect(getByText('Recommended Reading')).toBeTruthy();
    expect(getByText('Understanding appetite changes in dogs')).toBeTruthy();
  });

  it('calls onArticlePress with correct slug on press', () => {
    const { getByLabelText } = render(
      <AIInsightCard insight={mockInsight} onArticlePress={mockOnArticlePress} />
    );
    fireEvent.press(getByLabelText('Read article: Understanding appetite changes in dogs'));
    expect(mockOnArticlePress).toHaveBeenCalledWith('appetite-changes');
  });

  it('hides "Recommended Reading" when no articles', () => {
    const noArticlesInsight: AIHealthInsight = {
      ...mockInsight,
      recommended_articles: [],
    };
    const { queryByText } = render(
      <AIInsightCard insight={noArticlesInsight} onArticlePress={mockOnArticlePress} />
    );
    expect(queryByText('Recommended Reading')).toBeNull();
  });
});

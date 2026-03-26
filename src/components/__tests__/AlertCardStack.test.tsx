import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AlertCardStack } from '../ui/AlertCardStack';
import type { PatternAlert } from '../../types/health';

const makeAlert = (overrides: Partial<PatternAlert> = {}): PatternAlert => ({
  id: 'alert-1',
  user_id: 'user-1',
  dog_id: 'dog-1',
  pattern_type: 'appetite_decline',
  alert_level: 'watch',
  title: 'Appetite Decline',
  message: 'Your dog has been eating less for 3+ days.',
  ai_insight: null,
  data_window: {},
  is_active: true,
  dismissed_by_user: false,
  triggered_triage: false,
  first_detected: '2026-02-19',
  last_confirmed: '2026-02-21',
  resolved_at: null,
  created_at: '2026-02-19T10:00:00Z',
  ...overrides,
});

const threeAlerts: PatternAlert[] = [
  makeAlert({ id: 'alert-1', title: 'Appetite Decline', alert_level: 'watch' }),
  makeAlert({ id: 'alert-2', title: 'Energy Drop', alert_level: 'concern' }),
  makeAlert({ id: 'alert-3', title: 'Mobility Issues', alert_level: 'vet_recommended' }),
];

describe('AlertCardStack', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  it('renders top card title', () => {
    const { getByText } = render(
      <AlertCardStack alerts={threeAlerts} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Appetite Decline')).toBeTruthy();
  });

  it('shows card counter "1 of 3"', () => {
    const { getByText } = render(
      <AlertCardStack alerts={threeAlerts} onDismiss={mockOnDismiss} />
    );
    expect(getByText('1 of 3')).toBeTruthy();
  });

  it('shows "You\'re all caught up!" when alerts is empty', () => {
    const { getByText } = render(
      <AlertCardStack alerts={[]} onDismiss={mockOnDismiss} />
    );
    expect(getByText("You're all caught up!")).toBeTruthy();
  });

  it('shows "No active pattern alerts" subtitle when empty', () => {
    const { getByText } = render(
      <AlertCardStack alerts={[]} onDismiss={mockOnDismiss} />
    );
    expect(getByText('No active pattern alerts')).toBeTruthy();
  });

  it('does NOT show celebration when alerts exist', () => {
    const { queryByText } = render(
      <AlertCardStack alerts={threeAlerts} onDismiss={mockOnDismiss} />
    );
    expect(queryByText("You're all caught up!")).toBeNull();
  });

  it('calls onDismiss when dismiss button pressed (tap fallback)', () => {
    const { getByLabelText } = render(
      <AlertCardStack alerts={threeAlerts} onDismiss={mockOnDismiss} />
    );
    fireEvent.press(getByLabelText('Dismiss alert: Appetite Decline'));
    expect(mockOnDismiss).toHaveBeenCalledWith('alert-1');
  });

  it('renders severity badge on top card', () => {
    const { getByText } = render(
      <AlertCardStack alerts={threeAlerts} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Watch')).toBeTruthy();
  });

  it('shows correct counter for single alert "1 of 1"', () => {
    const single = [makeAlert({ id: 'solo', title: 'Solo Alert' })];
    const { getByText } = render(
      <AlertCardStack alerts={single} onDismiss={mockOnDismiss} />
    );
    expect(getByText('1 of 1')).toBeTruthy();
  });

  it('does NOT show "Review again" when no alerts were swiped', () => {
    const { queryByText } = render(
      <AlertCardStack alerts={[]} onDismiss={mockOnDismiss} />
    );
    // No swiped alerts, so no review button
    expect(queryByText('Review again')).toBeNull();
  });
});

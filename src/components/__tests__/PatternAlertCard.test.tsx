import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PatternAlertCard } from '../ui/PatternAlertCard';
import type { PatternAlert } from '../../types/health';

const mockAlert: PatternAlert = {
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
};

describe('PatternAlertCard', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  it('renders the alert title', () => {
    const { getByText } = render(
      <PatternAlertCard alert={mockAlert} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Appetite Decline')).toBeTruthy();
  });

  it('renders the alert message', () => {
    const { getByText } = render(
      <PatternAlertCard alert={mockAlert} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Your dog has been eating less for 3+ days.')).toBeTruthy();
  });

  it('renders the correct badge level', () => {
    const { getByText } = render(
      <PatternAlertCard alert={mockAlert} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Watch')).toBeTruthy();
  });

  it('calls onDismiss with alert ID when dismiss is pressed', () => {
    const { getByLabelText } = render(
      <PatternAlertCard alert={mockAlert} onDismiss={mockOnDismiss} />
    );
    fireEvent.press(getByLabelText('Dismiss alert: Appetite Decline'));
    expect(mockOnDismiss).toHaveBeenCalledWith('alert-1');
  });

  it('shows "Contact Your Vet" for vet_recommended alerts', () => {
    const vetAlert: PatternAlert = {
      ...mockAlert,
      alert_level: 'vet_recommended',
      title: 'Blood in Stool',
    };
    const { getByText } = render(
      <PatternAlertCard alert={vetAlert} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Contact Your Vet')).toBeTruthy();
  });

  it('does NOT show "Contact Your Vet" for non-vet alerts', () => {
    const { queryByText } = render(
      <PatternAlertCard alert={mockAlert} onDismiss={mockOnDismiss} />
    );
    expect(queryByText('Contact Your Vet')).toBeNull();
  });
});

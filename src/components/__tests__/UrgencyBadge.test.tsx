import React from 'react';
import { render } from '@testing-library/react-native';
import { UrgencyBadge } from '../legal/UrgencyBadge';
import { URGENCY_CONFIG } from '../../constants/theme';

describe('UrgencyBadge', () => {
  it('renders emergency level correctly', () => {
    const { getByText } = render(<UrgencyBadge level="emergency" />);
    expect(getByText('Emergency')).toBeTruthy();
  });

  it('renders urgent level correctly', () => {
    const { getByText } = render(<UrgencyBadge level="urgent" />);
    expect(getByText('Urgent')).toBeTruthy();
  });

  it('renders soon level correctly', () => {
    const { getByText } = render(<UrgencyBadge level="soon" />);
    expect(getByText('Soon')).toBeTruthy();
  });

  it('renders monitor as "Low Urgency"', () => {
    const { getByText } = render(<UrgencyBadge level="monitor" />);
    expect(getByText('Low Urgency')).toBeTruthy();
  });

  it('has correct accessibility label for emergency', () => {
    const { getByLabelText } = render(<UrgencyBadge level="emergency" />);
    expect(
      getByLabelText(
        `Urgency level: Emergency. ${URGENCY_CONFIG.emergency.description}`
      )
    ).toBeTruthy();
  });

  it('renders large size variant', () => {
    const { getByText } = render(<UrgencyBadge level="urgent" size="large" />);
    expect(getByText('Urgent')).toBeTruthy();
  });

  it('renders all four urgency levels without crashing', () => {
    const levels = ['emergency', 'urgent', 'soon', 'monitor'] as const;
    for (const level of levels) {
      const { unmount } = render(<UrgencyBadge level={level} />);
      unmount();
    }
  });
});

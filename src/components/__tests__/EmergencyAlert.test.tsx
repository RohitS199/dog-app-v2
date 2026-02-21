import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmergencyAlert } from '../ui/EmergencyAlert';

describe('EmergencyAlert', () => {
  it('renders emergency warning message', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <EmergencyAlert matchedPatterns={['seizure']} onDismiss={onDismiss} />
    );
    expect(getByText('Possible Emergency Detected')).toBeTruthy();
    expect(getByText(/may need immediate veterinary attention/)).toBeTruthy();
  });

  it('renders Find Emergency Vet button', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <EmergencyAlert matchedPatterns={['seizure']} onDismiss={onDismiss} />
    );
    expect(getByText('Find Emergency Vet Now')).toBeTruthy();
  });

  it('renders continue button and calls onDismiss', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <EmergencyAlert matchedPatterns={['seizure']} onDismiss={onDismiss} />
    );

    const continueButton = getByText('Continue with symptom check anyway');
    fireEvent.press(continueButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

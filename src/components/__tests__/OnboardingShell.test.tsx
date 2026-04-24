jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: { children: React.ReactNode }) =>
      React.createElement(View, props, children),
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingShell } from '../onboarding/OnboardingShell';
import { useOnboardingStore } from '../../stores/onboardingStore';

beforeEach(() => {
  useOnboardingStore.getState().clearOnboarding();
});

describe('OnboardingShell', () => {
  it('renders children', () => {
    const { getByText } = render(
      <OnboardingShell step={0}>
        <Text>Hello child</Text>
      </OnboardingShell>,
    );
    expect(getByText('Hello child')).toBeTruthy();
  });

  it('hides the back button on step 0', () => {
    useOnboardingStore.getState().goToStep(0);
    const { queryByLabelText } = render(
      <OnboardingShell step={0}>
        <Text>content</Text>
      </OnboardingShell>,
    );
    expect(queryByLabelText('Go back')).toBeNull();
  });

  it('shows the back button when currentStep > 0', () => {
    useOnboardingStore.getState().goToStep(3);
    const { getByLabelText } = render(
      <OnboardingShell step={3}>
        <Text>content</Text>
      </OnboardingShell>,
    );
    expect(getByLabelText('Go back')).toBeTruthy();
  });

  it('calls prevStep when back button is pressed', () => {
    useOnboardingStore.getState().goToStep(5);
    const { getByLabelText } = render(
      <OnboardingShell step={5}>
        <Text>content</Text>
      </OnboardingShell>,
    );
    fireEvent.press(getByLabelText('Go back'));
    expect(useOnboardingStore.getState().currentStep).toBe(4);
  });

  it('hides the header when showProgress={false}', () => {
    useOnboardingStore.getState().goToStep(3);
    const { queryByLabelText } = render(
      <OnboardingShell step={3} showProgress={false}>
        <Text>content</Text>
      </OnboardingShell>,
    );
    expect(queryByLabelText('Go back')).toBeNull();
    expect(queryByLabelText(/Onboarding progress/)).toBeNull();
  });

  it('renders the skip button when showSkip=true and onSkip provided', () => {
    useOnboardingStore.getState().goToStep(2);
    const onSkip = jest.fn();
    const { getByText } = render(
      <OnboardingShell step={2} showSkip onSkip={onSkip}>
        <Text>content</Text>
      </OnboardingShell>,
    );
    fireEvent.press(getByText('skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});

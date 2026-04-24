import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingProgressBar } from '../onboarding/OnboardingProgressBar';
import { OB_TOTAL_STEPS } from '../../constants/onboardingTheme';

function getTrack(label: RegExp, queryFn: (matcher: RegExp) => unknown) {
  return queryFn(label) as {
    props: {
      accessibilityRole: string;
      accessibilityValue: { now: number; min: number; max: number };
      children: { props: { style: ReadonlyArray<{ width?: string }> } };
    };
  };
}

describe('OnboardingProgressBar', () => {
  it('exposes progressbar role, label, and value to screen readers', () => {
    const { getByLabelText } = render(<OnboardingProgressBar step={0} />);
    const bar = getTrack(/Onboarding progress, step 1 of 19/, getByLabelText);
    expect(bar.props.accessibilityRole).toBe('progressbar');
    expect(bar.props.accessibilityValue).toEqual({
      now: 1,
      min: 1,
      max: OB_TOTAL_STEPS,
    });
  });

  it('fills to the expected width for a mid-flow step', () => {
    const step = 8;
    const { getByLabelText } = render(<OnboardingProgressBar step={step} />);
    const bar = getTrack(/Onboarding progress/, getByLabelText);
    const widthPercent = Number(
      String(bar.props.children.props.style[1].width).replace('%', ''),
    );
    const expected = ((step + 1) / OB_TOTAL_STEPS) * 100;
    expect(widthPercent).toBeCloseTo(expected, 2);
  });

  it('clamps the fill width to 100% when step exceeds the total', () => {
    const { getByLabelText } = render(
      <OnboardingProgressBar step={OB_TOTAL_STEPS + 5} />,
    );
    const bar = getTrack(/Onboarding progress/, getByLabelText);
    expect(bar.props.children.props.style[1].width).toBe('100%');
  });

  it('clamps the fill width to 0% when step is negative', () => {
    const { getByLabelText } = render(<OnboardingProgressBar step={-10} />);
    const bar = getTrack(/Onboarding progress/, getByLabelText);
    expect(bar.props.children.props.style[1].width).toBe('0%');
  });

  it('does not render the skip button by default', () => {
    const { queryByText } = render(<OnboardingProgressBar step={1} />);
    expect(queryByText('skip')).toBeNull();
  });

  it('does not render the skip button when showSkip=true but onSkip is missing', () => {
    const { queryByText } = render(
      <OnboardingProgressBar step={1} showSkip />,
    );
    expect(queryByText('skip')).toBeNull();
  });

  it('renders and fires the skip button when provided', () => {
    const onSkip = jest.fn();
    const { getByText } = render(
      <OnboardingProgressBar step={1} showSkip onSkip={onSkip} />,
    );
    fireEvent.press(getByText('skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});

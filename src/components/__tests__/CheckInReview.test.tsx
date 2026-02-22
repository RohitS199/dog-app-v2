import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CheckInReview } from '../ui/CheckInReview';
import type { CheckInDraft } from '../../types/checkIn';

const completeDraft: CheckInDraft = {
  dog_id: 'dog-1',
  check_in_date: '2026-02-21',
  appetite: 'normal',
  water_intake: 'normal',
  energy_level: 'normal',
  stool_quality: 'normal',
  vomiting: 'none',
  mobility: 'normal',
  mood: 'normal',
  additional_symptoms: ['coughing'],
  free_text: 'Some notes here',
};

describe('CheckInReview', () => {
  const mockOnEditStep = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnEditStep.mockClear();
    mockOnSubmit.mockClear();
  });

  it('renders the review title', () => {
    const { getByText } = render(
      <CheckInReview
        draft={completeDraft}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );
    expect(getByText('Review Your Check-In')).toBeTruthy();
  });

  it('renders all answered values', () => {
    const { getAllByText, getByText } = render(
      <CheckInReview
        draft={completeDraft}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );
    // Multiple fields have 'Normal' value
    expect(getAllByText('Normal').length).toBeGreaterThanOrEqual(1);
    expect(getByText('No vomiting')).toBeTruthy();
    expect(getByText('Coughing')).toBeTruthy();
    expect(getByText('Some notes here')).toBeTruthy();
  });

  it('calls onEditStep when tapping an answer row', () => {
    const { getByLabelText } = render(
      <CheckInReview
        draft={completeDraft}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );
    // Tap the appetite row (step 0)
    const appetiteRow = getByLabelText(/Edit How is your dog's appetite/);
    fireEvent.press(appetiteRow);
    expect(mockOnEditStep).toHaveBeenCalledWith(0);
  });

  it('calls onSubmit when save button is pressed', () => {
    const { getByLabelText } = render(
      <CheckInReview
        draft={completeDraft}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );
    fireEvent.press(getByLabelText('Save check-in'));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows saving state when isSubmitting is true', () => {
    const { getByText } = render(
      <CheckInReview
        draft={completeDraft}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );
    expect(getByText('Saving...')).toBeTruthy();
  });
});

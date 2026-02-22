import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CheckInCard } from '../ui/CheckInCard';
import { CHECK_IN_QUESTIONS } from '../../constants/checkInQuestions';

const appetiteQuestion = CHECK_IN_QUESTIONS[0]; // appetite

describe('CheckInCard', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders the question text', () => {
    const { getByText } = render(
      <CheckInCard
        question={appetiteQuestion}
        selectedValue={null}
        onSelect={mockOnSelect}
      />
    );
    expect(getByText(appetiteQuestion.question)).toBeTruthy();
  });

  it('renders all options', () => {
    const { getByText } = render(
      <CheckInCard
        question={appetiteQuestion}
        selectedValue={null}
        onSelect={mockOnSelect}
      />
    );
    for (const option of appetiteQuestion.options) {
      expect(getByText(option.label)).toBeTruthy();
    }
  });

  it('calls onSelect when an option is pressed', () => {
    const { getByText } = render(
      <CheckInCard
        question={appetiteQuestion}
        selectedValue={null}
        onSelect={mockOnSelect}
      />
    );
    fireEvent.press(getByText('Normal'));
    expect(mockOnSelect).toHaveBeenCalledWith('normal');
  });

  it('highlights the selected option', () => {
    const { getByLabelText } = render(
      <CheckInCard
        question={appetiteQuestion}
        selectedValue="normal"
        onSelect={mockOnSelect}
      />
    );
    const selected = getByLabelText('Normal');
    expect(selected.props.accessibilityState.selected).toBe(true);
  });

  it('shows yesterday hint when provided', () => {
    const { getByText } = render(
      <CheckInCard
        question={appetiteQuestion}
        selectedValue={null}
        yesterdayValue="less"
        onSelect={mockOnSelect}
      />
    );
    expect(getByText(/Yesterday: Eating less than usual/)).toBeTruthy();
  });

  it('does not show yesterday hint when not provided', () => {
    const { queryByText } = render(
      <CheckInCard
        question={appetiteQuestion}
        selectedValue={null}
        onSelect={mockOnSelect}
      />
    );
    expect(queryByText(/Yesterday:/)).toBeNull();
  });

  it('shows inline alert when provided', () => {
    const { getByText } = render(
      <CheckInCard
        question={appetiteQuestion}
        selectedValue="normal"
        onSelect={mockOnSelect}
        showAlert={{ message: 'This is a test alert' }}
      />
    );
    expect(getByText('This is a test alert')).toBeTruthy();
  });

  it('does not show alert when not provided', () => {
    const { queryByText } = render(
      <CheckInCard
        question={appetiteQuestion}
        selectedValue="normal"
        onSelect={mockOnSelect}
      />
    );
    expect(queryByText('This is a test alert')).toBeNull();
  });
});

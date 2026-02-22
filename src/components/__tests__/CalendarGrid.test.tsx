import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CalendarGrid } from '../ui/CalendarGrid';
import type { CalendarDayStatus } from '../../types/health';

describe('CalendarGrid', () => {
  const mockOnDayPress = jest.fn();

  beforeEach(() => {
    mockOnDayPress.mockClear();
  });

  it('renders day headers', () => {
    const { getByText } = render(
      <CalendarGrid
        year={2026}
        month={2}
        dayStatuses={{}}
        onDayPress={mockOnDayPress}
        todayString="2026-02-21"
      />
    );
    expect(getByText('Sun')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Sat')).toBeTruthy();
  });

  it('renders correct number of day cells', () => {
    const { getAllByLabelText } = render(
      <CalendarGrid
        year={2026}
        month={2}
        dayStatuses={{}}
        onDayPress={mockOnDayPress}
        todayString="2026-02-21"
      />
    );
    // February 2026 has 28 days
    const dayCells = getAllByLabelText(/2026-02-/);
    expect(dayCells.length).toBe(28);
  });

  it('calls onDayPress with correct date string', () => {
    const { getByLabelText } = render(
      <CalendarGrid
        year={2026}
        month={2}
        dayStatuses={{}}
        onDayPress={mockOnDayPress}
        todayString="2026-02-21"
      />
    );
    fireEvent.press(getByLabelText(/2026-02-15/));
    expect(mockOnDayPress).toHaveBeenCalledWith('2026-02-15');
  });

  it('highlights today', () => {
    const { getByLabelText } = render(
      <CalendarGrid
        year={2026}
        month={2}
        dayStatuses={{}}
        onDayPress={mockOnDayPress}
        todayString="2026-02-21"
      />
    );
    const todayCell = getByLabelText(/2026-02-21/);
    expect(todayCell).toBeTruthy();
  });

  it('renders with status indicators', () => {
    const dayStatuses: Record<string, CalendarDayStatus> = {
      '2026-02-19': 'good',
      '2026-02-20': 'fair',
      '2026-02-21': 'poor',
    };

    const { getByLabelText } = render(
      <CalendarGrid
        year={2026}
        month={2}
        dayStatuses={dayStatuses}
        onDayPress={mockOnDayPress}
        todayString="2026-02-21"
      />
    );
    expect(getByLabelText('2026-02-19, status: good')).toBeTruthy();
    expect(getByLabelText('2026-02-20, status: fair')).toBeTruthy();
    expect(getByLabelText('2026-02-21, status: poor')).toBeTruthy();
  });

  it('renders missed days correctly', () => {
    const dayStatuses: Record<string, CalendarDayStatus> = {
      '2026-02-15': 'missed',
    };

    const { getByLabelText } = render(
      <CalendarGrid
        year={2026}
        month={2}
        dayStatuses={dayStatuses}
        onDayPress={mockOnDayPress}
        todayString="2026-02-21"
      />
    );
    expect(getByLabelText('2026-02-15, status: missed')).toBeTruthy();
  });

  it('renders day numbers', () => {
    const { getByText } = render(
      <CalendarGrid
        year={2026}
        month={2}
        dayStatuses={{}}
        onDayPress={mockOnDayPress}
        todayString="2026-02-21"
      />
    );
    expect(getByText('1')).toBeTruthy();
    expect(getByText('28')).toBeTruthy();
  });

  it('handles months with different day counts', () => {
    const { getAllByLabelText } = render(
      <CalendarGrid
        year={2026}
        month={1}
        dayStatuses={{}}
        onDayPress={mockOnDayPress}
        todayString="2026-02-21"
      />
    );
    // January has 31 days
    const dayCells = getAllByLabelText(/2026-01-/);
    expect(dayCells.length).toBe(31);
  });
});

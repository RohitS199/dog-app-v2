import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WeekLookBack } from '../dogs/WeekLookBack';
import type { WeekSummary } from '../../lib/weekGrouping';

function makeWeek(start: string, label: string): WeekSummary {
  return { weekStartDate: start, weekEndDate: start, label, loggedCount: 5, tone: 'thriving' };
}

describe('WeekLookBack', () => {
  it('renders the dog-scoped header', () => {
    const { getByText } = render(
      <WeekLookBack weeks={[makeWeek('2026-06-07', 'Jun 7 – Jun 13')]} dogName="Luna" onSeeMore={jest.fn()} />
    );
    expect(getByText("Luna's house & garden")).toBeTruthy();
  });

  it('shows an empty state when there are no weeks', () => {
    const { getByText } = render(
      <WeekLookBack weeks={[]} dogName="Luna" onSeeMore={jest.fn()} />
    );
    expect(getByText(/no weeks logged yet/i)).toBeTruthy();
  });

  it('shows See more and fires the callback when more than 3 weeks exist', () => {
    const onSeeMore = jest.fn();
    const weeks = [
      makeWeek('2026-06-07', 'w1'), makeWeek('2026-05-31', 'w2'),
      makeWeek('2026-05-24', 'w3'), makeWeek('2026-05-17', 'w4'),
    ];
    const { getByText } = render(
      <WeekLookBack weeks={weeks} dogName="Luna" onSeeMore={onSeeMore} />
    );
    fireEvent.press(getByText('See more ›'));
    expect(onSeeMore).toHaveBeenCalled();
  });

  it('hides See more when 3 or fewer weeks exist', () => {
    const weeks = [makeWeek('2026-06-07', 'w1'), makeWeek('2026-05-31', 'w2')];
    const { queryByText } = render(
      <WeekLookBack weeks={weeks} dogName="Luna" onSeeMore={jest.fn()} />
    );
    expect(queryByText('See more ›')).toBeNull();
  });
});

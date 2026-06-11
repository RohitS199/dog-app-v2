import React from 'react';
import { render } from '@testing-library/react-native';
import MyDogsScreen from '../../../app/(tabs)/dogs';
import { useDogStore } from '../../stores/dogStore';
import { useHealthStore } from '../../stores/healthStore';
import type { Dog } from '../../types/api';

function makeDog(): Dog {
  return {
    id: 'd1',
    user_id: 'u1',
    name: 'Luna',
    breed: 'Golden Retriever',
    age_years: 4,
    weight_lbs: 60,
    photo_url: null,
    vet_phone: null,
    spayed_neutered: true,
    known_conditions: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_checkin_date: null,
    checkin_streak: 0,
    health_summary: null,
  };
}

describe('MyDogsScreen', () => {
  beforeEach(() => {
    useDogStore.setState({ dogs: [makeDog()], selectedDogId: 'd1' });
    // Replace the real fetch (which would hit the mocked supabase client)
    // with a no-op spy — same setState pattern as healthStore.test.ts resets.
    useHealthStore.setState({
      calendarData: {},
      isLoading: false,
      fetchMonthData: jest.fn(),
    } as any);
  });

  it('renders the selected dog name and personality fallback', () => {
    const { getAllByText, getByText } = render(<MyDogsScreen />);
    // 'Luna' appears in both the DogSwitcher pill and the identity hero.
    expect(getAllByText('Luna').length).toBeGreaterThan(0);
    expect(getByText('Tell us about Luna as you log.')).toBeTruthy();
  });

  it('shows the check-in CTA when today is not logged', () => {
    const { getByText } = render(<MyDogsScreen />);
    expect(getByText("How's Luna today?")).toBeTruthy();
  });

  it('shows the care section and Ask Biscuit bridge', () => {
    const { getByText } = render(<MyDogsScreen />);
    expect(getByText('Care')).toBeTruthy();
    expect(getByText('Ask Biscuit about Luna')).toBeTruthy();
  });

  it('shows an empty state when no dog is selected', () => {
    useDogStore.setState({ dogs: [], selectedDogId: null });
    const { getByText } = render(<MyDogsScreen />);
    // Exact strings: a /add a dog/i regex would match both the message and
    // the CTA label, which makes getByText throw on multiple matches.
    expect(getByText('Add a dog to start their scrapbook.')).toBeTruthy();
    expect(getByText('Add a dog')).toBeTruthy();
  });
});

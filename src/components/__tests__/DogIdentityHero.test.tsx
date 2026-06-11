import { render, fireEvent } from '@testing-library/react-native';
import { DogIdentityHero } from '../dogs/DogIdentityHero';
import type { Dog } from '../../types/api';
import type { DailyCheckIn } from '../../types/checkIn';

function makeDog(overrides: Partial<Dog> = {}): Dog {
  return {
    id: 'd1', user_id: 'u1', name: 'Luna', breed: 'Golden Retriever', age_years: 4,
    weight_lbs: 60, photo_url: null, vet_phone: null, spayed_neutered: true,
    known_conditions: [], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    last_checkin_date: null, checkin_streak: 0, health_summary: null, ...overrides,
  };
}

function makeCheckIn(): DailyCheckIn {
  return {
    id: 'c1', user_id: 'u1', dog_id: 'd1', check_in_date: '2026-06-15',
    appetite: 'normal', water_intake: 'normal', energy_level: 'normal', stool_quality: 'normal',
    vomiting: 'none', mobility: 'normal', mood: 'normal', additional_symptoms: [],
    free_text: null, emergency_flagged: false, revision_history: [],
    created_at: '2026-06-15T00:00:00Z', updated_at: '2026-06-15T00:00:00Z',
  };
}

describe('DogIdentityHero', () => {
  it('renders name, breed and the fallback personality line', () => {
    const { getByText } = render(
      <DogIdentityHero dog={makeDog()} todayCheckIn={null} onStartCheckIn={jest.fn()} />
    );
    expect(getByText('Luna')).toBeTruthy();
    expect(getByText(/Golden Retriever/)).toBeTruthy();
    expect(getByText('Tell us about Luna as you log.')).toBeTruthy();
  });

  it('shows the check-in CTA when there is no check-in today', () => {
    const onStartCheckIn = jest.fn();
    const { getByText } = render(
      <DogIdentityHero dog={makeDog()} todayCheckIn={null} onStartCheckIn={onStartCheckIn} />
    );
    fireEvent.press(getByText("How's Luna today?"));
    expect(onStartCheckIn).toHaveBeenCalled();
  });

  it('shows a logged chip when today is already logged', () => {
    const { getByText, queryByText } = render(
      <DogIdentityHero dog={makeDog()} todayCheckIn={makeCheckIn()} onStartCheckIn={jest.fn()} />
    );
    expect(getByText(/Logged/)).toBeTruthy();
    expect(queryByText("How's Luna today?")).toBeNull();
  });
});

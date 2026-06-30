import { render, fireEvent } from '@testing-library/react-native';
import { DogCareDetails } from '../dogs/DogCareDetails';
import type { Dog } from '../../types/api';

function makeDog(overrides: Partial<Dog> = {}): Dog {
  return {
    id: 'd1', user_id: 'u1', name: 'Luna', breed: 'Golden Retriever', age_years: 4,
    weight_lbs: 60, photo_url: null, vet_phone: '555-1234', spayed_neutered: true,
    known_conditions: ['Hip dysplasia'], created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z', last_checkin_date: null, checkin_streak: 0,
    health_summary: null, ...overrides,
  };
}

describe('DogCareDetails', () => {
  it('renders weight, conditions and vet phone', () => {
    const { getByText } = render(<DogCareDetails dog={makeDog()} onEdit={jest.fn()} />);
    expect(getByText('60 lbs')).toBeTruthy();
    expect(getByText('Hip dysplasia')).toBeTruthy();
    expect(getByText('555-1234')).toBeTruthy();
  });

  it('shows graceful fallbacks when fields are empty', () => {
    const { getByText } = render(
      <DogCareDetails dog={makeDog({ vet_phone: null, known_conditions: [] })} onEdit={jest.fn()} />
    );
    expect(getByText('None on file')).toBeTruthy();
    expect(getByText('Not added')).toBeTruthy();
  });

  it('fires onEdit when Edit is tapped', () => {
    const onEdit = jest.fn();
    const { getByText } = render(<DogCareDetails dog={makeDog()} onEdit={onEdit} />);
    fireEvent.press(getByText('Edit ›'));
    expect(onEdit).toHaveBeenCalled();
  });

  it('guards a zero/falsy weight instead of rendering "0 lbs"', () => {
    const { getByText, queryByText } = render(
      <DogCareDetails dog={makeDog({ weight_lbs: 0 })} onEdit={jest.fn()} />
    );
    expect(queryByText('0 lbs')).toBeNull();
    expect(getByText('Not added')).toBeTruthy();
  });
});

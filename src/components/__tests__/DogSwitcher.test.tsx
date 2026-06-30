import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DogSwitcher } from '../dogs/DogSwitcher';
import type { Dog } from '../../types/api';

function makeDog(id: string, name: string): Dog {
  return {
    id, user_id: 'u1', name, breed: 'Mixed', age_years: 3, weight_lbs: 40,
    photo_url: null, vet_phone: null, spayed_neutered: null, known_conditions: [],
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    last_checkin_date: null, checkin_streak: 0, health_summary: null,
  };
}

describe('DogSwitcher', () => {
  const dogs = [makeDog('d1', 'Luna'), makeDog('d2', 'Bear')];

  it('renders a pill per dog plus an Add control', () => {
    const { getByText, getByLabelText } = render(
      <DogSwitcher dogs={dogs} selectedDogId="d1" onSelectDog={jest.fn()} onAddDog={jest.fn()} />
    );
    expect(getByText('Luna')).toBeTruthy();
    expect(getByText('Bear')).toBeTruthy();
    expect(getByLabelText('Add a dog')).toBeTruthy();
  });

  it('fires onSelectDog when a non-selected pill is tapped', () => {
    const onSelectDog = jest.fn();
    const { getByText } = render(
      <DogSwitcher dogs={dogs} selectedDogId="d1" onSelectDog={onSelectDog} onAddDog={jest.fn()} />
    );
    fireEvent.press(getByText('Bear'));
    expect(onSelectDog).toHaveBeenCalledWith('d2');
  });

  it('fires onAddDog when the Add pill is tapped', () => {
    const onAddDog = jest.fn();
    const { getByLabelText } = render(
      <DogSwitcher dogs={dogs} selectedDogId="d1" onSelectDog={jest.fn()} onAddDog={onAddDog} />
    );
    fireEvent.press(getByLabelText('Add a dog'));
    expect(onAddDog).toHaveBeenCalled();
  });
});

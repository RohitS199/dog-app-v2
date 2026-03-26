import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FlippableDogCard } from '../ui/FlippableDogCard';
import type { Dog } from '../../types/api';

const mockDog: Dog = {
  id: 'dog-1',
  user_id: 'user-1',
  name: 'Luna',
  breed: 'Golden Retriever',
  age_years: 4,
  weight_lbs: 65,
  photo_url: 'https://example.com/luna.jpg',
  vet_phone: '555-123-4567',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  last_checkin_date: '2026-03-23',
  checkin_streak: 7,
  health_summary: null,
};

describe('FlippableDogCard', () => {
  const mockOnEditPress = jest.fn();

  beforeEach(() => {
    mockOnEditPress.mockClear();
  });

  it('renders dog name on front and back face', () => {
    const { getAllByText } = render(
      <FlippableDogCard dog={mockDog} onEditPress={mockOnEditPress} />
    );
    // Name appears on front (overlay) and back (header)
    expect(getAllByText('Luna').length).toBeGreaterThanOrEqual(2);
  });

  it('renders photo when photo_url is present', () => {
    const { UNSAFE_getByType } = render(
      <FlippableDogCard dog={mockDog} onEditPress={mockOnEditPress} />
    );
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Image } = require('react-native');
    const images = UNSAFE_getByType(Image);
    expect(images.props.source).toEqual({ uri: 'https://example.com/luna.jpg' });
  });

  it('renders paw fallback when no photo_url', () => {
    const noPhotoDog: Dog = { ...mockDog, photo_url: null };
    const { getAllByText, getByText } = render(
      <FlippableDogCard dog={noPhotoDog} onEditPress={mockOnEditPress} />
    );
    // Name still renders on both faces
    expect(getAllByText('Luna').length).toBeGreaterThanOrEqual(2);
    // The mock icon renders "paw" as text
    expect(getByText('paw')).toBeTruthy();
  });

  it('shows breed on back face', () => {
    const { getByText } = render(
      <FlippableDogCard dog={mockDog} onEditPress={mockOnEditPress} />
    );
    expect(getByText('Golden Retriever')).toBeTruthy();
  });

  it('shows age formatted correctly', () => {
    const { getByText } = render(
      <FlippableDogCard dog={mockDog} onEditPress={mockOnEditPress} />
    );
    expect(getByText('4 years')).toBeTruthy();
  });

  it('shows singular "year" for age 1', () => {
    const youngDog: Dog = { ...mockDog, age_years: 1 };
    const { getByText } = render(
      <FlippableDogCard dog={youngDog} onEditPress={mockOnEditPress} />
    );
    expect(getByText('1 year')).toBeTruthy();
  });

  it('shows weight formatted correctly', () => {
    const { getByText } = render(
      <FlippableDogCard dog={mockDog} onEditPress={mockOnEditPress} />
    );
    expect(getByText('65 lbs')).toBeTruthy();
  });

  it('shows streak count', () => {
    const { getByText } = render(
      <FlippableDogCard dog={mockDog} onEditPress={mockOnEditPress} />
    );
    expect(getByText('7')).toBeTruthy();
  });

  it('shows vet phone when present', () => {
    const { getByText } = render(
      <FlippableDogCard dog={mockDog} onEditPress={mockOnEditPress} />
    );
    expect(getByText('555-123-4567')).toBeTruthy();
  });

  it('shows "No vet on file" when vet_phone is null', () => {
    const noVetDog: Dog = { ...mockDog, vet_phone: null };
    const { getByText } = render(
      <FlippableDogCard dog={noVetDog} onEditPress={mockOnEditPress} />
    );
    expect(getByText('No vet on file')).toBeTruthy();
  });

  it('calls onEditPress when edit link is tapped', () => {
    const { getByLabelText } = render(
      <FlippableDogCard dog={mockDog} onEditPress={mockOnEditPress} />
    );
    fireEvent.press(getByLabelText("Edit Luna's profile"));
    expect(mockOnEditPress).toHaveBeenCalledTimes(1);
  });
});

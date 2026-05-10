import React from 'react';
import { render } from '@testing-library/react-native';
import { PerkRow } from '../PerkRow';

describe('PerkRow', () => {
  it('renders the perk text', () => {
    const { getByText } = render(<PerkRow text="Unlimited daily logs" />);
    expect(getByText('Unlimited daily logs')).toBeTruthy();
  });

  it('renders the green check circle', () => {
    const { getByLabelText } = render(<PerkRow text="AI weekly insights" />);
    expect(getByLabelText('Included perk')).toBeTruthy();
  });
});

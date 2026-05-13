import React from 'react';
import { render } from '@testing-library/react-native';
import { WoodPortrait } from '../WoodPortrait';

describe('WoodPortrait', () => {
  it('renders without an avatar (stripe placeholder)', () => {
    const { getByLabelText } = render(<WoodPortrait size={68} />);
    expect(getByLabelText('Profile photo placeholder')).toBeTruthy();
  });

  it('renders the user photo when avatar URI is provided', () => {
    const { getByLabelText } = render(<WoodPortrait size={76} avatar="https://example.com/avatar.jpg" />);
    expect(getByLabelText('Profile photo')).toBeTruthy();
  });

  it('accepts size 68', () => {
    const { getByTestId } = render(<WoodPortrait size={68} testID="wp" />);
    expect(getByTestId('wp')).toBeTruthy();
  });

  it('accepts size 76', () => {
    const { getByTestId } = render(<WoodPortrait size={76} testID="wp" />);
    expect(getByTestId('wp')).toBeTruthy();
  });

  it('accepts size 130', () => {
    const { getByTestId } = render(<WoodPortrait size={130} testID="wp" />);
    expect(getByTestId('wp')).toBeTruthy();
  });
});

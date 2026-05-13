import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavBar } from '../NavBar';

describe('NavBar', () => {
  const onBack = jest.fn();

  beforeEach(() => onBack.mockClear());

  it('renders the title', () => {
    const { getByText } = render(<NavBar title="My Information" onBackPress={onBack} />);
    expect(getByText('My Information')).toBeTruthy();
  });

  it('renders the back chevron when back is undefined (default true)', () => {
    const { getByLabelText } = render(<NavBar title="Settings" onBackPress={onBack} />);
    expect(getByLabelText('Go back')).toBeTruthy();
  });

  it('hides the back chevron when back is false', () => {
    const { queryByLabelText } = render(<NavBar title="Profile" back={false} onBackPress={onBack} />);
    expect(queryByLabelText('Go back')).toBeNull();
  });

  it('calls onBackPress when back chevron is pressed', () => {
    const { getByLabelText } = render(<NavBar title="About" onBackPress={onBack} />);
    fireEvent.press(getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

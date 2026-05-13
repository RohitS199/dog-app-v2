import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { NavButton } from '../NavButton';

describe('NavButton', () => {
  const onPress = jest.fn();

  beforeEach(() => onPress.mockClear());

  it('renders the label', () => {
    const { getByText } = render(<NavButton label="My Information" onPress={onPress} />);
    expect(getByText('My Information')).toBeTruthy();
  });

  it('renders the leading icon', () => {
    const { getByText } = render(
      <NavButton label="My Subscription" icon={<Text>ICN</Text>} onPress={onPress} />
    );
    expect(getByText('ICN')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(<NavButton label="Settings" onPress={onPress} />);
    fireEvent.press(getByLabelText('Settings'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

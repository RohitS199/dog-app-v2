import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PillButton } from '../PillButton';

describe('PillButton', () => {
  const onPress = jest.fn();

  beforeEach(() => onPress.mockClear());

  it('renders the label', () => {
    const { getByText } = render(<PillButton label="Log Out" onPress={onPress} />);
    expect(getByText('Log Out')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(<PillButton label="Yes, log me out" onPress={onPress} />);
    fireEvent.press(getByLabelText('Yes, log me out'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onPress when disabled', () => {
    const { getByLabelText } = render(
      <PillButton label="Stay" onPress={onPress} disabled />
    );
    fireEvent.press(getByLabelText('Stay'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('supports the primary variant (solid orange)', () => {
    const { getByText } = render(
      <PillButton label="Yes, log me out" variant="primary" onPress={onPress} />
    );
    expect(getByText('Yes, log me out')).toBeTruthy();
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SaveButton } from '../SaveButton';

describe('SaveButton', () => {
  const onPress = jest.fn();

  beforeEach(() => onPress.mockClear());

  it('renders the label', () => {
    const { getByText } = render(<SaveButton label="Save Changes" onPress={onPress} />);
    expect(getByText('Save Changes')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(<SaveButton label="Save Changes" onPress={onPress} />);
    fireEvent.press(getByLabelText('Save Changes'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onPress when disabled', () => {
    const { getByLabelText } = render(
      <SaveButton label="Save Changes" onPress={onPress} disabled />
    );
    fireEvent.press(getByLabelText('Save Changes'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes accessibilityState.disabled when disabled', () => {
    const { getByLabelText } = render(
      <SaveButton label="Save Changes" onPress={onPress} disabled />
    );
    expect(getByLabelText('Save Changes').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true })
    );
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
  const onValueChange = jest.fn();

  beforeEach(() => onValueChange.mockClear());

  it('renders in the OFF state', () => {
    const { getByRole } = render(<Toggle value={false} onValueChange={onValueChange} />);
    const sw = getByRole('switch');
    expect(sw.props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));
  });

  it('renders in the ON state', () => {
    const { getByRole } = render(<Toggle value={true} onValueChange={onValueChange} />);
    const sw = getByRole('switch');
    expect(sw.props.accessibilityState).toEqual(expect.objectContaining({ checked: true }));
  });

  it('calls onValueChange(true) when pressed from OFF', () => {
    const { getByRole } = render(<Toggle value={false} onValueChange={onValueChange} />);
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('calls onValueChange(false) when pressed from ON', () => {
    const { getByRole } = render(<Toggle value={true} onValueChange={onValueChange} />);
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('does not fire onValueChange when disabled', () => {
    const { getByRole } = render(<Toggle value={false} onValueChange={onValueChange} disabled />);
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('exposes accessibilityRole=switch', () => {
    const { getByRole } = render(<Toggle value={false} onValueChange={onValueChange} />);
    expect(getByRole('switch')).toBeTruthy();
  });
});

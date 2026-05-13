import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { RowItem } from '../RowItem';

describe('RowItem', () => {
  const onPress = jest.fn();

  beforeEach(() => onPress.mockClear());

  it('renders the label', () => {
    const { getByText } = render(<RowItem label="Notifications" onPress={onPress} />);
    expect(getByText('Notifications')).toBeTruthy();
  });

  it('renders the leading icon', () => {
    const { getByText } = render(
      <RowItem
        label="Security"
        icon={<Text>ICON</Text>}
        onPress={onPress}
      />
    );
    expect(getByText('ICON')).toBeTruthy();
  });

  it('renders the chevron by default', () => {
    const { getByText } = render(<RowItem label="Help Center" onPress={onPress} />);
    expect(getByText('›')).toBeTruthy();
  });

  it('hides the chevron when chevron={false}', () => {
    const { queryByText } = render(<RowItem label="About" chevron={false} onPress={onPress} />);
    expect(queryByText('›')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(<RowItem label="Privacy" onPress={onPress} />);
    fireEvent.press(getByLabelText('Privacy'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes accessibilityRole=button when onPress is set', () => {
    const { getByRole } = render(<RowItem label="About" onPress={onPress} />);
    expect(getByRole('button')).toBeTruthy();
  });
});

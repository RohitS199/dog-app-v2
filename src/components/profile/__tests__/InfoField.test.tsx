import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { InfoField } from '../InfoField';

describe('InfoField', () => {
  const onChangeText = jest.fn();
  const onPress = jest.fn();

  beforeEach(() => {
    onChangeText.mockClear();
    onPress.mockClear();
  });

  it('renders the label and value in idle (read-only) mode', () => {
    const { getByText } = render(
      <InfoField label="EMAIL" value="aman@puplog.app" />
    );
    expect(getByText('EMAIL')).toBeTruthy();
    expect(getByText('aman@puplog.app')).toBeTruthy();
  });

  it('renders a TextInput when editable=true', () => {
    const { getByDisplayValue } = render(
      <InfoField label="NAME" value="Aman Reddy" editable onChangeText={onChangeText} />
    );
    expect(getByDisplayValue('Aman Reddy')).toBeTruthy();
  });

  it('calls onChangeText when input changes', () => {
    const { getByDisplayValue } = render(
      <InfoField label="PHONE" value="123" editable onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByDisplayValue('123'), '456');
    expect(onChangeText).toHaveBeenCalledWith('456');
  });

  it('renders the leading icon when provided', () => {
    const { getByText } = render(
      <InfoField label="LOCATION" value="SF" icon={<Text>PIN</Text>} />
    );
    expect(getByText('PIN')).toBeTruthy();
  });

  it('renders as a Pressable when onPress is set and editable=false', () => {
    const { getByLabelText } = render(
      <InfoField label="BIRTHDAY" value="May 14, 1992" onPress={onPress} />
    );
    fireEvent.press(getByLabelText('BIRTHDAY'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows placeholder when value is empty in editable mode', () => {
    const { getByPlaceholderText } = render(
      <InfoField label="PHONE" value="" editable placeholder="+1 555..." onChangeText={onChangeText} />
    );
    expect(getByPlaceholderText('+1 555...')).toBeTruthy();
  });

  it('shows readonly empty value as em dash', () => {
    const { getByText } = render(<InfoField label="LOCATION" value="" />);
    expect(getByText('—')).toBeTruthy();
  });

  it('disables the TextInput when keyboardType is provided but disabled=true', () => {
    const { getByDisplayValue } = render(
      <InfoField label="EMAIL" value="x@y.com" editable disabled onChangeText={onChangeText} />
    );
    expect(getByDisplayValue('x@y.com').props.editable).toBe(false);
  });
});

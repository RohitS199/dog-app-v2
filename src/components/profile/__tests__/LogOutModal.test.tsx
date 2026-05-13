import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LogOutModal } from '../LogOutModal';

describe('LogOutModal', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    onConfirm.mockClear();
    onCancel.mockClear();
  });

  it('renders the heading', () => {
    const { getByText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(getByText('Heading out?')).toBeTruthy();
  });

  it('renders the fallback body when no dog name is provided', () => {
    const { getByText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(getByText("We'll keep your dog's logs safe. You can come back any time.")).toBeTruthy();
  });

  it('renders the dog-specific body when a name is provided', () => {
    const { getByText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} dogName="Biscuit" />
    );
    expect(getByText("We'll keep Biscuit's logs safe. You can come back any time.")).toBeTruthy();
  });

  it('renders both action buttons', () => {
    const { getByText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(getByText('Yes, log me out')).toBeTruthy();
    expect(getByText('Stay')).toBeTruthy();
  });

  it('calls onConfirm when "Yes, log me out" is pressed', () => {
    const { getByLabelText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    fireEvent.press(getByLabelText('Yes, log me out'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when "Stay" is pressed', () => {
    const { getByLabelText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    fireEvent.press(getByLabelText('Stay'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the backdrop is pressed', () => {
    const { getByLabelText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    fireEvent.press(getByLabelText('Close log out modal'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when visible is false', () => {
    const { queryByText } = render(
      <LogOutModal visible={false} onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(queryByText('Heading out?')).toBeNull();
  });
});

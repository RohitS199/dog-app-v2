import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ToggleRow } from '../ToggleRow';

describe('ToggleRow', () => {
  const onValueChange = jest.fn();

  beforeEach(() => onValueChange.mockClear());

  it('renders the label', () => {
    const { getByText } = render(
      <ToggleRow label="Daily log reminder" value={false} onValueChange={onValueChange} />
    );
    expect(getByText('Daily log reminder')).toBeTruthy();
  });

  it('renders the sub text when provided', () => {
    const { getByText } = render(
      <ToggleRow
        label="Weekly insight ready"
        sub="Sundays · AI summary"
        value={true}
        onValueChange={onValueChange}
      />
    );
    expect(getByText('Sundays · AI summary')).toBeTruthy();
  });

  it('does NOT render sub text when omitted', () => {
    const { queryByText } = render(
      <ToggleRow label="Marketing emails" value={false} onValueChange={onValueChange} />
    );
    expect(queryByText('Sundays')).toBeNull();
  });

  it('toggling the switch fires onValueChange with the new value', () => {
    const { getByRole } = render(
      <ToggleRow label="Vet appointments" value={false} onValueChange={onValueChange} />
    );
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('reflects parent-controlled value (rerender from false to true)', () => {
    const { getByRole, rerender } = render(
      <ToggleRow label="Garden milestones" value={false} onValueChange={onValueChange} />
    );
    rerender(<ToggleRow label="Garden milestones" value={true} onValueChange={onValueChange} />);
    expect(getByRole('switch').props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true })
    );
  });
});

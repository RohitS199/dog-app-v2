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

  it('fires onValueChange when the row label (not the switch thumb) is pressed', () => {
    const { getByLabelText } = render(
      <ToggleRow label="Daily reminder" value={false} onValueChange={onValueChange} />
    );
    // getByLabelText finds the outer Pressable by its accessibilityLabel.
    // Pre-fix, ToggleRow has no Pressable/accessibilityLabel — this throws.
    // Post-fix, the outer row IS the switch with accessibilityLabel={label}.
    fireEvent.press(getByLabelText('Daily reminder'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('fires onValueChange exactly once when the row container is pressed (no containment double-fire)', () => {
    const { getByRole } = render(
      <ToggleRow label="Daily reminder" value={false} onValueChange={onValueChange} />
    );
    // After fix, getByRole('switch') resolves to the outer row Pressable (the inner
    // Toggle is hidden from the accessibility tree). Pressing it must fire
    // onValueChange exactly once — if both outer and inner Pressables fire,
    // the count would be 2 and the value flips twice (net no-op).
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});

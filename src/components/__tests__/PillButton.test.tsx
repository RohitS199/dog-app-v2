import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { PillButton } from '../profile/PillButton';
import { OB_COLORS } from '../../constants/onboardingTheme';

function labelColor(node: { props: { style: unknown } }): string | undefined {
  return (StyleSheet.flatten(node.props.style) as { color?: string }).color;
}

describe('PillButton', () => {
  it('renders the label and fires onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PillButton label="Save" onPress={onPress} variant="primary" />
    );
    fireEvent.press(getByText('Save'));
    expect(onPress).toHaveBeenCalled();
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PillButton label="Save" onPress={onPress} variant="primary" disabled />
    );
    fireEvent.press(getByText('Save'));
    expect(onPress).not.toHaveBeenCalled();
  });

  // WCAG AA (1.4.3): the 17px regular label is "normal text" and needs 4.5:1.
  // White on coral #F4845F is 2.53:1 (fails); ink #2a221c on coral is 6.2:1.
  it('primary label is ink on the coral fill (AA 6.2:1, never white at 2.5:1)', () => {
    const { getByText } = render(
      <PillButton label="Save" onPress={jest.fn()} variant="primary" />
    );
    expect(labelColor(getByText('Save'))).toBe(OB_COLORS.ink);
  });

  // Coral as TEXT on cream is the same violation mirrored (~2.5:1).
  // Ghost keeps its coral border identity; the label carries ink (13.9:1),
  // matching ScrapbookButton's ghost variant.
  it('ghost and logout labels are ink, not coral-on-cream', () => {
    const ghost = render(
      <PillButton label="Cancel" onPress={jest.fn()} variant="ghost" />
    );
    expect(labelColor(ghost.getByText('Cancel'))).toBe(OB_COLORS.ink);

    const logout = render(
      <PillButton label="Log out" onPress={jest.fn()} variant="logout" />
    );
    expect(labelColor(logout.getByText('Log out'))).toBe(OB_COLORS.ink);
  });

  // The shared token is the root fix: every coral-fill CTA in the app reads it.
  it('OB_COLORS.ctaText is the AA ink recipe, not white', () => {
    expect(OB_COLORS.ctaText).toBe(OB_COLORS.ink);
  });
});

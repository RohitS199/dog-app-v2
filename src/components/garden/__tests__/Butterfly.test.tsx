import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Butterfly } from '../Butterfly';

describe('Butterfly', () => {
  it('renders without crashing (decorative)', () => {
    expect(() => render(<Butterfly width={390} height={359} paused={false} />)).not.toThrow();
  });

  it('does not crash when paused / reduced motion', () => {
    expect(() => render(<Butterfly width={390} height={359} paused />)).not.toThrow();
  });

  // Each wing flaps via scaleX. The pivot must sit at the wing's INNER edge (the body centerline,
  // where the two wings meet), not the wing's own center — otherwise the inner tips retreat as the
  // wings scale down and the middle disconnects. Anchor: left wing 90% / right wing 10% (x), 50% (y).
  it('pivots each wing at its inner (body) edge so the middle stays connected while flapping', () => {
    const { getByTestId } = render(<Butterfly width={390} height={359} paused={false} />);
    // The wings live under an accessibilityElementsHidden container, so RNTL hides them by default.
    const opts = { includeHiddenElements: true } as const;
    const left = StyleSheet.flatten(getByTestId('butterfly-wing-left', opts).props.style);
    const right = StyleSheet.flatten(getByTestId('butterfly-wing-right', opts).props.style);
    expect(left.transformOrigin).toBe('90% 50%');
    expect(right.transformOrigin).toBe('10% 50%');
  });
});

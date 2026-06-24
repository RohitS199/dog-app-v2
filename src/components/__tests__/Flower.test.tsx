import { render } from '@testing-library/react-native';
import { Flower } from '../garden/Flower';

describe('Flower', () => {
  it('renders an accessible flower with mood + tier in its label', () => {
    const { getByLabelText } = render(<Flower mood="joyful" tier={3} baseSize={48} />);
    expect(getByLabelText(/joyful/i)).toBeTruthy();
    expect(getByLabelText(/full bloom/i)).toBeTruthy();
  });

  it('scales height by tier (tier 3 taller than tier 1)', () => {
    const t1 = render(<Flower mood="calm" tier={1} baseSize={48} />).getByLabelText(/calm/i);
    const t3 = render(<Flower mood="calm" tier={3} baseSize={48} />).getByLabelText(/calm/i);
    const h1 = t1.props.style.height ?? t1.props.style[0]?.height;
    const h3 = t3.props.style.height ?? t3.props.style[0]?.height;
    expect(h3).toBeGreaterThan(h1);
  });
});

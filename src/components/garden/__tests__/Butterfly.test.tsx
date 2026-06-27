import { render } from '@testing-library/react-native';
import { Butterfly } from '../Butterfly';

describe('Butterfly', () => {
  it('renders without crashing (decorative)', () => {
    expect(() => render(<Butterfly width={390} height={359} paused={false} />)).not.toThrow();
  });

  it('does not crash when paused / reduced motion', () => {
    expect(() => render(<Butterfly width={390} height={359} paused />)).not.toThrow();
  });
});

import { render } from '@testing-library/react-native';
import { BiscuitBob } from '../BiscuitBob';

describe('BiscuitBob', () => {
  it('renders the mascot without crashing', () => {
    expect(() => render(<BiscuitBob width={390} height={359} paused={false} />)).not.toThrow();
  });

  it('does not crash when paused / reduced motion', () => {
    expect(() => render(<BiscuitBob width={390} height={359} paused />)).not.toThrow();
  });
});

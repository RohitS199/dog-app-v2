import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SwayingFlower } from '../SwayingFlower';

const clock = { value: 1 } as any;
const active = { value: 1 } as any;

describe('SwayingFlower', () => {
  it('renders its bloom child without crashing', () => {
    const { getByText } = render(
      <SwayingFlower clock={clock} active={active} phase={0.5} freq={1} amp={3} left={10} top={20}>
        <Text>bloom</Text>
      </SwayingFlower>,
    );
    expect(getByText('bloom', { includeHiddenElements: true })).toBeTruthy();
  });

  it('exposes its testID for scene assertions', () => {
    const { getByTestId } = render(
      <SwayingFlower clock={clock} active={active} phase={0} freq={1} amp={3} left={0} top={0} testID="bloom-calm">
        <Text>x</Text>
      </SwayingFlower>,
    );
    expect(getByTestId('bloom-calm', { includeHiddenElements: true })).toBeTruthy();
  });

  it('does not crash when paused (active = 0 → upright)', () => {
    expect(() =>
      render(
        <SwayingFlower clock={clock} active={{ value: 0 } as any} phase={1} freq={1.2} amp={4} left={5} top={5}>
          <Text>y</Text>
        </SwayingFlower>,
      ),
    ).not.toThrow();
  });
});

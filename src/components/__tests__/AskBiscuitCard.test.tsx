import { render, fireEvent } from '@testing-library/react-native';
import { AskBiscuitCard } from '../dogs/AskBiscuitCard';

describe('AskBiscuitCard', () => {
  it('renders the dog-scoped prompt', () => {
    const { getByText } = render(<AskBiscuitCard dogName="Luna" onPress={jest.fn()} />);
    expect(getByText('Ask Biscuit about Luna')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<AskBiscuitCard dogName="Luna" onPress={onPress} />);
    fireEvent.press(getByText('Ask Biscuit about Luna'));
    expect(onPress).toHaveBeenCalled();
  });
});

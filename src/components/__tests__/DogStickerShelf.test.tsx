import { render } from '@testing-library/react-native';
import { DogStickerShelf } from '../dogs/DogStickerShelf';

describe('DogStickerShelf', () => {
  it('renders the dog-scoped title', () => {
    const { getByText } = render(<DogStickerShelf dogName="Luna" />);
    expect(getByText("Luna's stickers")).toBeTruthy();
  });

  it('shows the coming-soon empty state when no stickers are earned', () => {
    const { getByText } = render(<DogStickerShelf dogName="Luna" />);
    expect(getByText(/coming soon/i)).toBeTruthy();
  });
});

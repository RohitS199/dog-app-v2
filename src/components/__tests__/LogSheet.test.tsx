import { render, fireEvent } from '@testing-library/react-native';
import { LogSheet } from '../garden/LogSheet';
import { useGardenStore } from '../../stores/gardenStore';

const props = { dogId: 'd1', dogName: 'Luna', date: '2026-06-20', onPlanted: () => {}, onClose: () => {} };

describe('LogSheet', () => {
  it('locks Specifics until a mood is chosen, then unlocks it (not gated on a symptom chip)', () => {
    const { getByLabelText, queryByLabelText } = render(<LogSheet {...props} />);
    expect(queryByLabelText(/add a note/i)).toBeNull(); // Specifics locked pre-mood
    fireEvent.press(getByLabelText(/mood Joyful/i)); // pick mood ONLY
    expect(getByLabelText(/add a note/i)).toBeTruthy(); // unlocked WITHOUT a symptom chip
  });

  it('shows an always-reachable Emergency help link', () => {
    const { getByLabelText } = render(<LogSheet {...props} />);
    expect(getByLabelText(/emergency help/i)).toBeTruthy();
  });

  it('surfaces an error instead of stranding the user when planting fails', async () => {
    useGardenStore.setState({
      plantFlower: async () => {
        useGardenStore.setState({ error: 'Network down' });
        return false;
      },
    });
    const { getByLabelText, findByRole } = render(<LogSheet {...props} />);
    fireEvent.press(getByLabelText(/mood Joyful/i));
    fireEvent.press(getByLabelText(/Plant Luna's flower/i));
    const alert = await findByRole('alert');
    expect(alert).toBeTruthy();
  });
});

import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { LogSheet } from '../LogSheet';
import { useGardenStore } from '../../../stores/gardenStore';
import { GARDEN_MOODS, GARDEN_MOOD_LABELS } from '../../../constants/gardenMoods';

const FIRST_MOOD = `mood ${GARDEN_MOOD_LABELS[GARDEN_MOODS[0]]}`; // "mood Joyful"
const noop = () => {};

function renderSheet() {
  return render(<LogSheet dogId="d1" dogName="Buddy" date="2026-06-28" onPlanted={noop} onClose={noop} />);
}

describe('LogSheet photo/video picker', () => {
  beforeEach(() => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockReset();
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
      status: 'granted',
    });
  });

  it('reveals the add-media control only after a mood is chosen', () => {
    const { getByLabelText, queryByLabelText } = renderSheet();
    expect(queryByLabelText('Add a photo or video')).toBeNull();
    fireEvent.press(getByLabelText(FIRST_MOOD));
    expect(getByLabelText('Add a photo or video')).toBeTruthy();
  });

  it('attaching a photo shows a preview + remove and turns the bloom full', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///pic.jpg', type: 'image' }],
    });
    const { getByLabelText, getByText } = renderSheet();
    fireEvent.press(getByLabelText(FIRST_MOOD));
    expect(getByText("Plant Buddy's flower")).toBeTruthy(); // mood only

    await act(async () => {
      fireEvent.press(getByLabelText('Add a photo or video'));
    });

    await waitFor(() => expect(getByText('Photo added')).toBeTruthy());
    expect(getByLabelText('Remove media')).toBeTruthy();
    expect(getByText("Plant Buddy's full bloom")).toBeTruthy(); // photo => tier 3
  });

  it('labels a chosen video as a video', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///clip.mov', type: 'video' }],
    });
    const { getByLabelText, getByText } = renderSheet();
    fireEvent.press(getByLabelText(FIRST_MOOD));
    await act(async () => {
      fireEvent.press(getByLabelText('Add a photo or video'));
    });
    await waitFor(() => expect(getByText('Video added')).toBeTruthy());
  });

  it('forwards the picked media to plantFlower on plant', async () => {
    const plantSpy = jest.fn().mockResolvedValue(true);
    useGardenStore.setState({ plantFlower: plantSpy });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///pic.jpg', type: 'image' }],
    });
    const { getByLabelText } = renderSheet();
    fireEvent.press(getByLabelText(FIRST_MOOD));
    await act(async () => {
      fireEvent.press(getByLabelText('Add a photo or video'));
    });
    await act(async () => {
      fireEvent.press(getByLabelText("Plant Buddy's flower"));
    });
    expect(plantSpy).toHaveBeenCalledWith(
      'd1',
      expect.objectContaining({ media: { uri: 'file:///pic.jpg', kind: 'photo' } }),
    );
  });

  it('Remove clears the selected media', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///pic.jpg', type: 'image' }],
    });
    const { getByLabelText, getByText, queryByText } = renderSheet();
    fireEvent.press(getByLabelText(FIRST_MOOD));
    await act(async () => {
      fireEvent.press(getByLabelText('Add a photo or video'));
    });
    await waitFor(() => expect(getByText('Photo added')).toBeTruthy());
    fireEvent.press(getByLabelText('Remove media'));
    expect(queryByText('Photo added')).toBeNull();
  });
});

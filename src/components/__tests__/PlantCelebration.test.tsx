import { render } from '@testing-library/react-native';
import { PlantCelebration } from '../garden/PlantCelebration';

// reanimated + worklets are mocked globally in jest.setup.js; withTiming there fires
// its completion callback synchronously, so the settle -> onDone path runs.

describe('PlantCelebration', () => {
  it('renders the planted flower as decorative (no competing VoiceOver label)', () => {
    const { getByTestId, queryByLabelText } = render(<PlantCelebration mood="joyful" tier={2} onDone={() => {}} />);
    expect(getByTestId('plant-celebration')).toBeTruthy();
    expect(queryByLabelText(/joyful/i)).toBeNull();
  });

  it('calls onDone after the pop settles', () => {
    const onDone = jest.fn();
    render(<PlantCelebration mood="calm" tier={1} onDone={onDone} />);
    expect(onDone).toHaveBeenCalled();
  });
});

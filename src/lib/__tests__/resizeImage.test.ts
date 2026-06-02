import * as ImageManipulator from 'expo-image-manipulator';
import { resizeForAvatar } from '../resizeImage';

describe('resizeForAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resizes via expo-image-manipulator and returns the manipulated uri', async () => {
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValueOnce({
      uri: 'file:///resized-avatar.jpg',
      width: 800,
      height: 800,
    });

    const result = await resizeForAvatar('file:///original.jpg');

    expect(result).toBe('file:///resized-avatar.jpg');
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'file:///original.jpg',
      [{ resize: { width: 800 } }],
      expect.objectContaining({ compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }),
    );
  });

  it('falls back to the original uri if manipulation fails', async () => {
    (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValueOnce(
      new Error('manipulation failed'),
    );

    const result = await resizeForAvatar('file:///original.jpg');

    expect(result).toBe('file:///original.jpg');
  });
});

import * as ImageManipulator from 'expo-image-manipulator';

// Avatars are cropped 1:1 by the picker; cap the edge so uploads stay small
// (multi-MB camera captures compress to ~50-150KB).
export const AVATAR_MAX_DIMENSION = 800;

export async function resizeForAvatar(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: AVATAR_MAX_DIMENSION } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );
    return result.uri;
  } catch {
    // Resize is an optimization, not a hard requirement — fall back to the original.
    return uri;
  }
}

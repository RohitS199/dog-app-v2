import { supabase } from '../supabase';
import * as ImageManipulator from 'expo-image-manipulator';
import { uploadGardenMedia } from '../uploadGardenMedia';

function mockStorage(uploadResult: { data: unknown; error: unknown } = { data: { path: 'x' }, error: null }) {
  const upload = jest.fn().mockResolvedValue(uploadResult);
  const getPublicUrl = jest.fn((p: string) => ({ data: { publicUrl: `https://cdn.test/${p}` } }));
  (supabase.storage as unknown as { from: jest.Mock }).from = jest.fn(() => ({ upload, getPublicUrl }));
  return { upload, getPublicUrl };
}

const CTX = { userId: 'u1', dogId: 'd1', logDate: '2026-06-28' };

beforeEach(() => {
  (global as unknown as { fetch: jest.Mock }).fetch = jest
    .fn()
    .mockResolvedValue({ arrayBuffer: async () => new ArrayBuffer(8) });
  (ImageManipulator.manipulateAsync as jest.Mock).mockClear();
  (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({ uri: 'file:///edited.jpg' });
});

describe('uploadGardenMedia', () => {
  it('resizes a photo and uploads it to the {user}/{dog}/{date} path', async () => {
    const { upload } = mockStorage();
    const res = await uploadGardenMedia({ uri: 'file:///orig.heic', kind: 'photo' }, CTX);

    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(1);
    const [path, , opts] = upload.mock.calls[0];
    expect(path).toBe('u1/d1/2026-06-28-photo.jpg');
    expect(opts).toMatchObject({ contentType: 'image/jpeg', upsert: true });
    expect(res).toEqual({
      kind: 'photo',
      path: 'u1/d1/2026-06-28-photo.jpg',
      url: 'https://cdn.test/u1/d1/2026-06-28-photo.jpg',
    });
  });

  it('uploads a video as-is (no resize) using its extension + mime', async () => {
    const { upload } = mockStorage();
    const res = await uploadGardenMedia({ uri: 'file:///clip.mov', kind: 'video' }, CTX);

    expect(ImageManipulator.manipulateAsync).not.toHaveBeenCalled();
    const [path, , opts] = upload.mock.calls[0];
    expect(path).toBe('u1/d1/2026-06-28-video.mov');
    expect(opts.contentType).toBe('video/quicktime');
    expect(res.kind).toBe('video');
  });

  it('throws when the storage upload errors', async () => {
    mockStorage({ data: null, error: new Error('storage boom') });
    await expect(
      uploadGardenMedia({ uri: 'file:///p.jpg', kind: 'photo' }, CTX),
    ).rejects.toThrow('storage boom');
  });
});

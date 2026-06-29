import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

// Uploads a Journey-garden photo/video to the public `garden-media` bucket and
// returns its public URL + storage path. Path layout (RLS-significant — the first
// folder is the user id): {userId}/{dogId}/{logDate}-{photo|video}.{ext}, so a
// re-plant of the same day overwrites (upsert) rather than piling up files.
//
// Bytes are read with fetch().arrayBuffer() on the local file:// URI — this avoids
// pulling in expo-file-system / base64 helpers just for the upload, and works for
// both images and videos. Photos are resized/compressed first (cap ~1280px, JPEG
// q0.7) like resizeForAvatar; videos upload as-is (no RN-side transcode available).

const BUCKET = 'garden-media';
const PHOTO_MAX_DIMENSION = 1280;

export type GardenMediaInput = { uri: string; kind: 'photo' | 'video' };
export type GardenMediaResult = { kind: 'photo' | 'video'; url: string; path: string };

function extFromUri(uri: string, fallback: string): string {
  const m = /\.([a-zA-Z0-9]+)(?:[?#]|$)/.exec(uri);
  return (m?.[1] ?? fallback).toLowerCase();
}

function videoMime(ext: string): string {
  // .mov is QuickTime; everything else maps cleanly to video/<ext>.
  return ext === 'mov' ? 'video/quicktime' : `video/${ext}`;
}

export async function uploadGardenMedia(
  media: GardenMediaInput,
  ctx: { userId: string; dogId: string; logDate: string },
): Promise<GardenMediaResult> {
  let uploadUri = media.uri;
  let contentType: string;
  let ext: string;

  if (media.kind === 'photo') {
    const edited = await ImageManipulator.manipulateAsync(
      media.uri,
      [{ resize: { width: PHOTO_MAX_DIMENSION } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );
    uploadUri = edited.uri;
    contentType = 'image/jpeg';
    ext = 'jpg';
  } else {
    ext = extFromUri(media.uri, 'mp4');
    contentType = videoMime(ext);
  }

  const path = `${ctx.userId}/${ctx.dogId}/${ctx.logDate}-${media.kind}.${ext}`;
  const bytes = await (await fetch(uploadUri)).arrayBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { kind: media.kind, url: data.publicUrl, path };
}

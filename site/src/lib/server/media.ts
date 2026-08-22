import { env } from './env';

/**
 * Photo bytes for listed pieces, in the MEDIA KV namespace.
 *
 * R2 would be the natural home but it is not enabled on this account (a
 * dashboard step plus a card on file), and KV needs neither. A photo here is
 * a few hundred KB, resized in the browser before upload, and KV serves
 * values up to 25 MB from the edge cache. To move to R2 later, swap the four
 * functions below for bucket.put/get/delete and keep the keys.
 */

export type PhotoSize = 'full' | 'thumb';

const key = (id: number, size: PhotoSize) => `photo:${id}:${size}`;

export async function putPhoto(id: number, size: PhotoSize, bytes: ArrayBuffer, contentType: string) {
  await env().MEDIA.put(key(id, size), bytes, { metadata: { contentType } });
}

export async function getPhoto(id: number, size: PhotoSize) {
  const { value, metadata } = await env().MEDIA.getWithMetadata<{ contentType?: string }>(
    key(id, size),
    'arrayBuffer',
  );
  if (!value) return null;
  return { bytes: value, contentType: metadata?.contentType || 'image/jpeg' };
}

export async function deletePhotoBytes(id: number) {
  await Promise.all([env().MEDIA.delete(key(id, 'full')), env().MEDIA.delete(key(id, 'thumb'))]);
}

import { getPhoto } from '@/lib/server/media';

export const dynamic = 'force-dynamic';

/**
 * Serves a listed piece's photo from KV: /media/<id>-full.jpg or
 * /media/<id>-thumb.jpg. A photo id is never reused (delete + re-upload
 * mints a new one), so the bytes behind a URL never change and can be
 * cached for good.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const m = /^(\d+)-(full|thumb)\.jpg$/.exec((await params).file);
  if (!m) return new Response('Not found', { status: 404 });
  const photo = await getPhoto(Number(m[1]), m[2] as 'full' | 'thumb');
  if (!photo) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  return new Response(photo.bytes, {
    headers: {
      'content-type': photo.contentType,
      'content-length': String(photo.bytes.byteLength),
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}

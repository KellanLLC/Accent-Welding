import { guarded } from '@/lib/server/auth';
import { json } from '@/lib/server/http';
import { addPhoto, deletePhoto, getItem, touchItem } from '@/lib/server/items';
import { putPhoto } from '@/lib/server/media';

export const dynamic = 'force-dynamic';

const MAX_FULL = 3 * 1024 * 1024; // the browser resizes to ~1600px before upload
const MAX_THUMB = 600 * 1024;

/**
 * One photo, already resized in the browser to a full size and a thumbnail.
 * multipart/form-data: full (file), thumb (file), width, height.
 */
export const POST = guarded(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const itemId = Number((await params).id);
  if (!(await getItem(itemId))) return json({ error: 'No such piece.' }, 404);

  const form = await req.formData().catch(() => null);
  if (!form) return json({ error: 'Expected a photo upload.' }, 400);
  const full = form.get('full');
  const thumb = form.get('thumb');
  const width = Number(form.get('width'));
  const height = Number(form.get('height'));
  if (!(full instanceof File) || !(thumb instanceof File)) return json({ error: 'No photo attached.' }, 400);
  if (!full.type.startsWith('image/') || !thumb.type.startsWith('image/')) {
    return json({ error: 'That is not an image.' }, 400);
  }
  if (full.size > MAX_FULL || thumb.size > MAX_THUMB) return json({ error: 'That photo is too large.' }, 413);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    return json({ error: 'Photo size is missing.' }, 400);
  }

  const photo = await addPhoto(itemId, width, height);
  if (!photo) return json({ error: 'Could not save.' }, 500);
  try {
    await Promise.all([
      putPhoto(photo.id, 'full', await full.arrayBuffer(), full.type),
      putPhoto(photo.id, 'thumb', await thumb.arrayBuffer(), thumb.type),
    ]);
  } catch (err) {
    await deletePhoto(photo.id);
    throw err;
  }
  await touchItem(itemId);
  return json({ ok: true, photo });
});

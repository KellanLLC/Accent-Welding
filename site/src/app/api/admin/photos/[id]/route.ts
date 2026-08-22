import { guarded } from '@/lib/server/auth';
import { json, readJson } from '@/lib/server/http';
import { deletePhoto, getPhoto, makeCover, touchItem } from '@/lib/server/items';
import { deletePhotoBytes } from '@/lib/server/media';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** { cover: true } moves this photo to the front of its piece. */
export const PATCH = guarded(async (req: Request, { params }: Ctx) => {
  const id = Number((await params).id);
  const photo = await getPhoto(id);
  if (!photo) return json({ error: 'No such photo.' }, 404);
  const body = await readJson<{ cover?: boolean }>(req);
  if (body?.cover) {
    await makeCover(photo);
    await touchItem(photo.item_id);
  }
  return json({ ok: true });
});

export const DELETE = guarded(async (_req: Request, { params }: Ctx) => {
  const id = Number((await params).id);
  const photo = await getPhoto(id);
  if (!photo) return json({ error: 'No such photo.' }, 404);
  await deletePhoto(id);
  await deletePhotoBytes(id);
  await touchItem(photo.item_id);
  return json({ ok: true });
});

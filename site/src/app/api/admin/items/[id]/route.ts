import type { ItemStatus } from '@/lib/panel-types';
import { guarded } from '@/lib/server/auth';
import { json, readJson, str } from '@/lib/server/http';
import { ITEM_STATUSES, deleteItem, getItem, updateItem } from '@/lib/server/items';
import { deletePhotoBytes } from '@/lib/server/media';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = guarded(async (req: Request, { params }: Ctx) => {
  const id = Number((await params).id);
  if (!(await getItem(id))) return json({ error: 'No such piece.' }, 404);
  const body = await readJson<{ title?: string; price?: string; description?: string; status?: string }>(req);
  if (!body) return json({ error: 'Expected JSON.' }, 400);

  const fields: Parameters<typeof updateItem>[1] = {};
  if (typeof body.title === 'string') {
    const title = str(body.title, 120);
    if (!title) return json({ error: 'Give the piece a name.' }, 400);
    fields.title = title;
  }
  if (typeof body.price === 'string') fields.price = str(body.price, 40);
  if (typeof body.description === 'string') fields.description = str(body.description, 2000);
  if (typeof body.status === 'string') {
    if (!ITEM_STATUSES.includes(body.status as ItemStatus)) return json({ error: 'Unknown status.' }, 400);
    fields.status = body.status as ItemStatus;
  }
  const item = await updateItem(id, fields);
  return json({ ok: true, item });
});

export const DELETE = guarded(async (_req: Request, { params }: Ctx) => {
  const id = Number((await params).id);
  if (!(await getItem(id))) return json({ error: 'No such piece.' }, 404);
  const photoIds = await deleteItem(id);
  await Promise.all(photoIds.map((pid) => deletePhotoBytes(pid)));
  return json({ ok: true });
});

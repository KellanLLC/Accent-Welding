import type { ItemStatus } from '@/lib/panel-types';
import { guarded } from '@/lib/server/auth';
import { json, readJson, str } from '@/lib/server/http';
import { ITEM_STATUSES, createItem } from '@/lib/server/items';

export const dynamic = 'force-dynamic';

/** List a new piece. Photos are added afterwards against its id. */
export const POST = guarded(async (req: Request) => {
  const body = await readJson<{ title?: string; price?: string; description?: string; status?: string }>(req);
  if (!body) return json({ error: 'Expected JSON.' }, 400);
  const title = str(body.title, 120);
  if (!title) return json({ error: 'Give the piece a name.' }, 400);
  const status = ITEM_STATUSES.includes(body.status as ItemStatus) ? (body.status as ItemStatus) : 'draft';
  const item = await createItem({
    title,
    price: str(body.price, 40),
    description: str(body.description, 2000),
    status,
  });
  return item ? json({ ok: true, item }) : json({ error: 'Could not save.' }, 500);
});

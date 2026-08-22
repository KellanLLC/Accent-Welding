import { guarded } from '@/lib/server/auth';
import { db } from '@/lib/server/env';
import { json, readJson } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/** Status and the private note. */
export const PATCH = guarded(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const id = Number((await params).id);
  const body = await readJson<{ status?: string; note?: string }>(req);
  if (!body) return json({ error: 'Expected JSON.' }, 400);

  const sets: string[] = [];
  const binds: unknown[] = [];
  if (typeof body.status === 'string') {
    if (!['new', 'contacted', 'scheduled', 'done'].includes(body.status)) {
      return json({ error: 'Unknown status.' }, 400);
    }
    binds.push(body.status);
    sets.push(`status = ?${binds.length}`);
  }
  if (typeof body.note === 'string') {
    binds.push(body.note.slice(0, 2000));
    sets.push(`note = ?${binds.length}`);
  }
  if (!sets.length) return json({ error: 'Nothing to update.' }, 400);

  binds.push(id);
  const row = await db()
    .prepare(`UPDATE quotes SET ${sets.join(', ')} WHERE id = ?${binds.length} RETURNING id, status, note`)
    .bind(...binds)
    .first();
  if (!row) return json({ error: 'No such request.' }, 404);
  return json({ ok: true, quote: row });
});

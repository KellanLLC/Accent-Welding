import { guarded } from '@/lib/server/auth';
import { db } from '@/lib/server/env';
import { json, readJson } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/** Status, the private note, and clearing a wrong spam call. */
export const PATCH = guarded(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const id = Number((await params).id);
  const body = await readJson<{ status?: string; note?: string; spam?: boolean }>(req);
  if (!body) return json({ error: 'Expected JSON.' }, 400);

  const sets: string[] = [];
  const binds: unknown[] = [];
  // "Not spam": the trap was wrong, put it back on the board.
  if (body.spam === false) sets.push('spam_via = NULL', 'spam_reason = NULL');
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
    .prepare(
      `UPDATE quotes SET ${sets.join(', ')} WHERE id = ?${binds.length} RETURNING id, status, note, spam_via, spam_reason`,
    )
    .bind(...binds)
    .first();
  if (!row) return json({ error: 'No such request.' }, 404);
  return json({ ok: true, quote: row });
});

/** Gone for good. The panel offers this on spam; the row and its private note go with it. */
export const DELETE = guarded(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const id = Number((await params).id);
  const row = await db().prepare('DELETE FROM quotes WHERE id = ?1 RETURNING id').bind(id).first();
  if (!row) return json({ error: 'No such request.' }, 404);
  return json({ ok: true });
});

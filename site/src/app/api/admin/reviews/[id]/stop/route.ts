import { guarded } from '@/lib/server/auth';
import { db } from '@/lib/server/env';
import { json } from '@/lib/server/http';
import { nowIso } from '@/lib/server/templates';

export const dynamic = 'force-dynamic';

/** Manually call off the remaining follow-ups for one customer. */
export const POST = guarded(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const id = Number((await params).id);
  const row = await db()
    .prepare(
      `UPDATE review_requests
          SET next_due_at = NULL, stopped_at = COALESCE(stopped_at, ?2),
              stop_reason = COALESCE(stop_reason, 'manual')
        WHERE id = ?1
        RETURNING id, stopped_at, stop_reason, next_due_at`,
    )
    .bind(id, nowIso())
    .first();
  return row ? json({ ok: true, review: row }) : json({ error: 'No such request.' }, 404);
});

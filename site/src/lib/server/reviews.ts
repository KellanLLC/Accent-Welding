import type { ReviewRequest } from '@/lib/panel-types';
import { db } from './env';
import { firstName, prettyPhone } from './phone';
import { followupHours, readSettings } from './settings';
import { sendSms } from './sms';
import { fill, isoInHours, makeToken, nowIso, reviewLink } from './templates';

export const REVIEW_COLUMNS =
  'id, quote_id, name, phone, message, status, error, token, clicked_at, rating, feedback, step, next_due_at, stopped_at, stop_reason, created_at';

/**
 * Sends the first review text and records the attempt either way. The ladder
 * only starts if the message actually left: a failed send is something to
 * look at, not something to automatically chase three times.
 */
export async function createReviewRequest(opts: {
  phone: string;
  message: string;
  name?: string | null;
  quoteId?: number | null;
}): Promise<{ ok: boolean; review: ReviewRequest | null; error: string | null }> {
  const settings = await readSettings();
  const token = makeToken();
  const link = reviewLink(token);

  // {{link}} always resolves to our own short link, never straight to Google.
  // That is what makes the tap measurable and lets the follow-ups stop on
  // their own. Whether that page screens or just forwards is a setting.
  let text = fill(opts.message, { name: firstName(opts.name), phone: prettyPhone(opts.phone), link });
  if (!text.includes(link)) text = `${text} ${link}`.trim();

  let status: 'sent' | 'failed' = 'sent';
  let error: string | null = null;
  try {
    await sendSms(opts.phone, text);
  } catch (err) {
    status = 'failed';
    error = String(err instanceof Error ? err.message : err).slice(0, 500);
  }

  const hours = followupHours(settings, 1);
  const nextDue = status === 'sent' && hours ? isoInHours(hours) : null;
  const stoppedAt = status === 'sent' ? null : nowIso();
  const stopReason = status === 'sent' ? null : 'send_failed';

  const row = await db()
    .prepare(
      `INSERT INTO review_requests
         (quote_id, name, phone, message, status, error, token, step, next_due_at, stopped_at, stop_reason)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, ?8, ?9, ?10)
       RETURNING ${REVIEW_COLUMNS}`,
    )
    .bind(opts.quoteId ?? null, opts.name ?? null, opts.phone, text, status, error, token, nextDue, stoppedAt, stopReason)
    .first<ReviewRequest>();

  return { ok: status === 'sent', review: row ?? null, error };
}

export async function findByToken(token: string) {
  return db().prepare(`SELECT ${REVIEW_COLUMNS} FROM review_requests WHERE token = ?1`).bind(token).first<ReviewRequest>();
}

/** Tapping the link is the strongest signal we get: stop chasing them. */
export async function markClicked(row: ReviewRequest) {
  if (row.clicked_at) return;
  await db()
    .prepare(
      `UPDATE review_requests
          SET clicked_at = ?2, stopped_at = COALESCE(stopped_at, ?2),
              stop_reason = COALESCE(stop_reason, 'clicked'), next_due_at = NULL
        WHERE id = ?1`,
    )
    .bind(row.id, nowIso())
    .run();
}

import { db } from './env';
import { firstName, prettyPhone } from './phone';
import { readSettings, followupHours } from './settings';
import { sendSms } from './sms';
import { fill, isoInHours, nowIso, reviewLink } from './templates';

/**
 * Sends whatever follow-ups have come due. At most one message per row per
 * pass, and only to rows that are still running.
 */
export async function runFollowups() {
  const settings = await readSettings();
  const { results } = await db()
    .prepare(
      `SELECT id, name, phone, token, step
         FROM review_requests
        WHERE stopped_at IS NULL
          AND next_due_at IS NOT NULL
          AND next_due_at <= ?1
          AND status = 'sent'
        ORDER BY next_due_at
        LIMIT 50`,
    )
    .bind(nowIso())
    .all<{ id: number; name: string | null; phone: string; token: string; step: number }>();

  let sent = 0;
  for (const row of results || []) {
    const step = Number(row.step) + 1;
    const template = settings[`followup_${step}_template`];

    if (step > 3 || !template) {
      await db()
        .prepare(
          `UPDATE review_requests
              SET next_due_at = NULL, stopped_at = ?2, stop_reason = 'exhausted'
            WHERE id = ?1`,
        )
        .bind(row.id, nowIso())
        .run();
      continue;
    }

    const link = reviewLink(row.token);
    let text = fill(template, { name: firstName(row.name), phone: prettyPhone(row.phone), link });
    if (!text.includes(link)) text = `${text} ${link}`.trim();

    try {
      await sendSms(row.phone, text);
      sent++;
      const nextHours = followupHours(settings, step + 1);
      await db()
        .prepare(
          `UPDATE review_requests
              SET step = ?2, next_due_at = ?3, stopped_at = ?4, stop_reason = ?5
            WHERE id = ?1`,
        )
        .bind(
          row.id,
          step,
          nextHours ? isoInHours(nextHours) : null,
          nextHours ? null : nowIso(),
          nextHours ? null : 'exhausted',
        )
        .run();
    } catch (err) {
      // Leave next_due_at alone so the next pass retries rather than dropping it.
      console.error(`follow-up ${step} failed for row ${row.id}:`, err instanceof Error ? err.message : err);
    }
  }
  return { due: (results || []).length, sent };
}

const SWEEP_EVERY_MS = 10 * 60 * 1000;

/**
 * Runs the sweep off the back of ordinary traffic, because this account is at
 * its five cron-trigger limit and a sixth cannot be registered.
 *
 * The claim is a compare-and-set on one settings row: whoever moves
 * last_sweep_at forward wins, everyone else returns immediately. Two requests
 * landing together therefore cannot both sweep and double-send.
 */
export async function maybeSweep() {
  const cutoff = new Date(Date.now() - SWEEP_EVERY_MS).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const claim = await db()
    .prepare(`UPDATE settings SET value = ?1 WHERE key = 'last_sweep_at' AND (value = '' OR value < ?2)`)
    .bind(nowIso(), cutoff)
    .run();
  if (!claim.meta || !claim.meta.changes) return;
  await runFollowups();
}

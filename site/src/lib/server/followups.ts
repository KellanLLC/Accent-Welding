import type { Sweeper } from '@/worker/sweeper';
import { db, env } from './env';
import { firstName, prettyPhone } from './phone';
import { readSettings, followupHours, writeSetting } from './settings';
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
  await writeSetting('last_sweep_at', nowIso());
  return { due: (results || []).length, sent };
}

const ENSURE_EVERY_MS = 10 * 60 * 1000;
let lastEnsureAt = 0;

/**
 * Keeps the follow-up clock running. The clock is a Durable Object alarm
 * (site/src/worker/sweeper.ts) that rings every ten minutes on its own; this
 * is only the safety net that starts it after a fresh deploy, or restarts it
 * if it were ever lost. Called off ordinary traffic, throttled per isolate so
 * it costs one cheap call every ten minutes at most.
 */
export async function keepClockRunning() {
  // `next dev` has the binding but no Durable Object behind it (wrangler says
  // so at startup); the clock is a deployed-Worker thing, so skip it there.
  if (process.env.NODE_ENV !== 'production') return;
  const now = Date.now();
  if (now - lastEnsureAt < ENSURE_EVERY_MS) return;
  lastEnsureAt = now;
  // `wrangler types` cannot see the class from the config alone, so the
  // namespace is typed here.
  const clock = env().SWEEPER as unknown as DurableObjectNamespace<Sweeper> | undefined;
  if (!clock) return;
  const r = await clock.getByName('clock').ensure();
  if (r.started) console.log('[clock] started; first tick at', new Date(r.nextAt).toISOString());
}

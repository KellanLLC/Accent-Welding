import { DurableObject } from 'cloudflare:workers';
import { SITE_URL } from '../config/site';
import { signSession } from '../lib/server/session-token';

/**
 * The follow-up clock.
 *
 * Review follow-ups need something to fire every ten minutes whether or not
 * anyone is on the site. The natural tool is a cron trigger, but this account
 * is at Cloudflare's five-trigger limit, so the clock is a Durable Object
 * alarm instead: one object, one alarm, and every time it rings it sets the
 * next one and runs the sweep. Alarms are durable: they survive deploys,
 * evictions and restarts, so once started the clock runs on its own.
 *
 * The sweep itself lives in the Next.js app (it needs D1, the settings bag and
 * the GoHighLevel sender), so the clock does not reimplement it: it signs a
 * one-minute panel session with SESSION_SECRET and POSTs to the same
 * /api/admin/run-followups route the panel's "Run now" button calls, over the
 * Worker's service binding to itself. One code path for sending, however it
 * is triggered.
 *
 * `ensure()` is idempotent and cheap, and is called off ordinary traffic as a
 * safety net: if the alarm is already set it does nothing.
 */

const EVERY_MS = 10 * 60 * 1000;
const FIRST_TICK_MS = 5 * 1000;
const TOKEN_TTL_S = 60;

export class Sweeper extends DurableObject<CloudflareEnv> {
  /** Starts the clock if it is not already running. Returns the next tick. */
  async ensure(): Promise<{ nextAt: number; started: boolean }> {
    const existing = await this.ctx.storage.getAlarm();
    if (existing !== null) return { nextAt: existing, started: false };
    const nextAt = Date.now() + FIRST_TICK_MS;
    await this.ctx.storage.setAlarm(nextAt);
    return { nextAt, started: true };
  }

  /** When the clock last rang, what happened, and when it rings next. */
  async status(): Promise<{ lastAt: string | null; nextAt: number | null; lastResult: string | null }> {
    const [lastAt, lastResult, nextAt] = await Promise.all([
      this.ctx.storage.get<string>('lastAt'),
      this.ctx.storage.get<string>('lastResult'),
      this.ctx.storage.getAlarm(),
    ]);
    return { lastAt: lastAt ?? null, nextAt, lastResult: lastResult ?? null };
  }

  async alarm(): Promise<void> {
    // The next tick is set before anything else, so a failure below can never
    // stop the clock. Nothing in here may throw: a thrown alarm is retried by
    // the runtime and would double-ring.
    await this.ctx.storage.setAlarm(Date.now() + EVERY_MS);
    const startedAt = new Date().toISOString();
    let result: string;
    try {
      const secret = this.env.SESSION_SECRET;
      if (!secret) throw new Error('SESSION_SECRET is not set');
      const token = await signSession(secret, Math.floor(Date.now() / 1000) + TOKEN_TTL_S);
      const self = this.env.WORKER_SELF_REFERENCE;
      if (!self) throw new Error('WORKER_SELF_REFERENCE binding is missing');
      const res = await self.fetch(`${SITE_URL}/api/admin/run-followups`, {
        method: 'POST',
        headers: { cookie: `aw_session=${token}`, 'user-agent': 'accent-welding-clock' },
      });
      const body = await res.text().catch(() => '');
      result = res.ok ? body.slice(0, 200) : `HTTP ${res.status} ${body.slice(0, 200)}`;
      if (!res.ok) console.error('[clock] sweep failed:', result);
    } catch (err) {
      result = `error: ${err instanceof Error ? err.message : String(err)}`;
      console.error('[clock]', result);
    }
    await this.ctx.storage.put({ lastAt: startedAt, lastResult: result });
  }
}

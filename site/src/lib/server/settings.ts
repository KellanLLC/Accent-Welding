import { db } from './env';

export type Settings = Record<string, string>;

export async function readSettings(): Promise<Settings> {
  const { results } = await db().prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>();
  const out: Settings = {};
  for (const row of results || []) out[row.key] = row.value;
  return out;
}

export async function writeSetting(key: string, value: string) {
  await db()
    .prepare(
      `INSERT INTO settings (key, value, updated_at)
       VALUES (?1, ?2, strftime('%Y-%m-%dT%H:%M:%SZ','now'))
       ON CONFLICT(key) DO UPDATE SET value = ?2,
         updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')`,
    )
    .bind(key, value)
    .run();
}

/**
 * Everything the panel is allowed to edit, and nothing else. An unknown key in
 * a save request is ignored rather than written, so the settings bag cannot be
 * used as arbitrary storage.
 */
export const TEXT_KEYS = [
  'review_template',
  'owner_alert_template',
  'followup_1_template',
  'followup_2_template',
  'followup_3_template',
  'google_review_url',
  'screening_headline',
  'screening_sub',
  'screening_high_head',
  'screening_high_sub',
  'screening_low_head',
  'screening_low_sub',
  'screening_done_head',
  'screening_done_sub',
] as const;

export const FLAG_KEYS = ['notify_owner', 'screening_enabled'] as const;

/** Hours until follow-up N (1-3), or null once that rung is switched off. */
export function followupHours(settings: Settings, step: number): number | null {
  const n = Number(settings[`followup_${step}_hours`]);
  return step >= 1 && step <= 3 && Number.isFinite(n) && n > 0 ? n : null;
}

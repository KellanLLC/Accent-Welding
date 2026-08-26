import type { Quote, SpecRow } from '@/lib/panel-types';
import { db } from './env';
import { normalisePhone } from './phone';
import { readSettings } from './settings';
import { sendSms } from './sms';
import { fill, panelLink } from './templates';

export const QUOTE_COLUMNS =
  'id, product, spec, price, name, phone, phone_raw, email, town, notes, source, status, note, spam_via, spam_reason, created_at';

type Row = Omit<Quote, 'spec'> & { spec: string };

export function parseQuote(row: Row): Quote {
  let spec: SpecRow[] = [];
  try {
    const parsed = JSON.parse(row.spec || '[]');
    if (Array.isArray(parsed)) spec = parsed;
  } catch {
    /* a bad spec never hides the request */
  }
  return { ...row, spec };
}

export async function listQuotes(): Promise<Quote[]> {
  const { results } = await db()
    .prepare(`SELECT ${QUOTE_COLUMNS} FROM quotes ORDER BY id DESC LIMIT 500`)
    .all<Row>();
  return (results || []).map(parseQuote);
}

export async function insertQuote(q: {
  product: string;
  spec: SpecRow[];
  price: string;
  name: string;
  phone: string;
  phoneRaw: string;
  email: string;
  town: string;
  notes: string;
  source: Quote['source'];
  ip: string;
  userAgent: string;
  /** Set when the trap already knows this is spam: stored flagged, kept out of Requests. */
  spam?: { via: string; reason: string };
}): Promise<{ id: number; created_at: string } | null> {
  return db()
    .prepare(
      `INSERT INTO quotes (product, spec, price, name, phone, phone_raw, email, town, notes, source, ip, user_agent, spam_via, spam_reason)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
       RETURNING id, created_at`,
    )
    .bind(
      q.product,
      JSON.stringify(q.spec),
      q.price || null,
      q.name,
      q.phone,
      q.phoneRaw,
      q.email || null,
      q.town || null,
      q.notes || null,
      q.source,
      q.ip,
      q.userAgent,
      q.spam?.via ?? null,
      q.spam?.reason || null,
    )
    .first<{ id: number; created_at: string }>();
}

/** Five submissions per IP per ten minutes. Cheap, and enough. */
export async function floodGuardTripped(ip: string) {
  if (!ip) return false;
  const recent = await db()
    .prepare(
      `SELECT COUNT(*) AS n FROM quotes
        WHERE ip = ?1 AND created_at > strftime('%Y-%m-%dT%H:%M:%SZ','now','-10 minutes')`,
    )
    .bind(ip)
    .first<{ n: number }>();
  return !!recent && recent.n >= 5;
}

/**
 * Texts the owner about a new request. Called after the response has gone out
 * (and after the spam scan has cleared the submission), so GoHighLevel being
 * down can never fail a customer's submission — it is already saved.
 */
export async function sendOwnerAlert(id: number, name: string, phoneRaw: string, product: string) {
  const settings = await readSettings();
  if (settings.notify_owner !== '1') return;
  const owner = normalisePhone(settings.owner_phone);
  if (!owner) return;
  await sendSms(
    owner,
    fill(
      settings.owner_alert_template ||
        'New request from {{name}} ({{phone}}): {{product}}. See it here: {{link}}',
      { name, phone: phoneRaw, product, link: panelLink(id) },
    ),
  );
}

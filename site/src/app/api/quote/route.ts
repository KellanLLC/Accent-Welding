import { NextResponse } from 'next/server';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Quote intake.
 *
 * Right now every submission is validated and appended to `.data/quotes.jsonl`
 * so nothing is ever lost, and the payload is logged. That means the flow is
 * genuinely functional today with no third-party account.
 *
 * TODO(launch): add an email provider so Kelly is notified without checking a
 * file. Drop the key in `.env.local` and un-comment the block below — the rest
 * of the route needs no changes.
 *
 *   RESEND_API_KEY=…
 *   QUOTE_TO=accentwelding25@gmail.com
 */

type Payload = {
  product?: string;
  spec?: { key: string; value: string }[];
  price?: string;
  name?: string;
  phone?: string;
  email?: string;
  where?: string;
  notes?: string;
};

const str = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad JSON' }, { status: 400 });
  }

  const name = str(body.name, 120);
  const phone = str(body.phone, 40);
  const where = str(body.where, 120);

  if (!name || !phone || !where) {
    return NextResponse.json(
      { ok: false, error: 'Name, phone and town are required.' },
      { status: 422 },
    );
  }

  const record = {
    at: new Date().toISOString(),
    product: str(body.product, 120),
    price: str(body.price, 200),
    spec: Array.isArray(body.spec)
      ? body.spec.slice(0, 40).map((r) => ({
          key: str(r?.key, 80),
          value: str(r?.value, 200),
        }))
      : [],
    name,
    phone,
    email: str(body.email, 160),
    where,
    notes: str(body.notes, 2000),
  };

  try {
    const dir = path.join(process.cwd(), '.data');
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, 'quotes.jsonl'), JSON.stringify(record) + '\n', 'utf8');
  } catch (err) {
    // Never lose the lead to a disk problem — it is still in the server log.
    console.error('[quote] could not persist to disk', err);
  }

  console.log('[quote]', JSON.stringify(record));

  // if (process.env.RESEND_API_KEY) {
  //   await fetch('https://api.resend.com/emails', {
  //     method: 'POST',
  //     headers: {
  //       authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //       'content-type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       from: 'Accent Welding site <quotes@accentwelding.com>',
  //       to: process.env.QUOTE_TO,
  //       reply_to: record.email || undefined,
  //       subject: `${record.product} — ${record.name}, ${record.where}`,
  //       text: [
  //         `${record.product}`,
  //         record.price,
  //         '',
  //         ...record.spec.map((r) => `${r.key}: ${r.value}`),
  //         '',
  //         `Name:  ${record.name}`,
  //         `Phone: ${record.phone}`,
  //         `Email: ${record.email || '—'}`,
  //         `Where: ${record.where}`,
  //         `Notes: ${record.notes || '—'}`,
  //       ].join('\n'),
  //     }),
  //   });
  // }

  return NextResponse.json({ ok: true });
}

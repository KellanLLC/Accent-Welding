'use client';

import { useState } from 'react';
import { business } from '@/config/business';
import { Arrow } from './Arrow';
import s from './builder/QuoteDialog.module.css';

/**
 * The plain enquiry form: on the contact page inline, and in a dialog on a
 * listed piece. Posts to the same /api/quote the builders use, so everything
 * lands in one place in the panel and the owner gets the same text.
 */
export function EnquiryForm({
  product,
  products,
  price,
  source,
  onDone,
  idPrefix = 'e',
}: {
  /** Fixed product (a listed piece), or… */
  product?: string;
  /** …a list to choose from (the contact page). */
  products?: string[];
  price?: string;
  source: 'contact' | 'piece';
  onDone?: () => void;
  idPrefix?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const payload = {
      product: product ?? String(form.get('product') ?? ''),
      price: price ?? '',
      spec: [],
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      where: String(form.get('where') ?? ''),
      notes: String(form.get('notes') ?? ''),
      source,
      website: String(form.get('website') ?? ''),
    };
    setBusy(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || `Server said ${res.status}`);
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error && !/Server said/.test(err.message) ? err.message : '';
      setError(
        msg || `Something went wrong sending that. Call or text ${business.phone} and we will pick it up from there.`,
      );
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className={s.done}>
        <div className={s.doneMark}>
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
            <path d="M6 24.5 L18 36 L40 10" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className={s.title}>Got it. That is with the shop.</h2>
        <p className={s.sub}>You get a call or a text back to talk it through. Free, no obligation.</p>
        <div className={s.doneActions}>
          <a href={business.phoneHref} className="btn">
            Call {business.phone}
          </a>
          {onDone ? (
            <button type="button" className="btn btnDark" onClick={onDone}>
              Close
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className={s.fields}>
        <div>
          <label className={s.label} htmlFor={`${idPrefix}-name`}>
            Name <span className={s.req}>*</span>
          </label>
          <input id={`${idPrefix}-name`} name="name" className={s.input} required autoComplete="name" />
        </div>
        <div>
          <label className={s.label} htmlFor={`${idPrefix}-phone`}>
            Phone <span className={s.req}>*</span>
          </label>
          <input id={`${idPrefix}-phone`} name="phone" type="tel" className={s.input} required autoComplete="tel" placeholder="801-555-0100" />
        </div>
        <div>
          <label className={s.label} htmlFor={`${idPrefix}-email`}>
            Email
          </label>
          <input id={`${idPrefix}-email`} name="email" type="email" className={s.input} autoComplete="email" />
        </div>
        <div>
          <label className={s.label} htmlFor={`${idPrefix}-where`}>
            Town or ZIP <span className={s.req}>*</span>
          </label>
          <input id={`${idPrefix}-where`} name="where" className={s.input} required placeholder="Santaquin" autoComplete="postal-code" />
        </div>
        {products ? (
          <div className={s.wide}>
            <label className={s.label} htmlFor={`${idPrefix}-product`}>
              What is it for
            </label>
            <select id={`${idPrefix}-product`} name="product" className={s.input} defaultValue={products[0]}>
              {products.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className={s.wide}>
          <label className={s.label} htmlFor={`${idPrefix}-notes`}>
            {product ? 'Anything you want to ask' : 'Tell us about the job'} {product ? null : <span className={s.req}>*</span>}
          </label>
          <textarea
            id={`${idPrefix}-notes`}
            name="notes"
            className={s.textarea}
            required={!product}
            placeholder={
              product
                ? 'Delivery, a different size, a different finish, when you could pick it up…'
                : 'What it is, roughly how big, where it is going, and when you would like it done.'
            }
          />
        </div>
        {/* Honeypot: a person never sees this, a bot fills everything. */}
        <div className="sr" aria-hidden="true">
          <label htmlFor={`${idPrefix}-website`}>Website</label>
          <input id={`${idPrefix}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      {error ? <p className={s.err}>{error}</p> : null}

      <div className={s.submitRow}>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Sending…' : 'Send it'}
          {!busy && <Arrow />}
        </button>
        <span className={s.sub}>Or text the shop on {business.phoneAlt}</span>
      </div>
    </form>
  );
}

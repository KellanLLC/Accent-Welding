'use client';

import { useEffect, useRef, useState } from 'react';
import { business } from '@/config/business';
import { Arrow } from '../Arrow';
import s from './QuoteDialog.module.css';

export type SpecRow = { key: string; value: string };

export function QuoteDialog({
  open,
  onClose,
  product,
  spec,
  priceLabel,
  priceValue,
}: {
  open: boolean;
  onClose: () => void;
  product: string;
  spec: SpecRow[];
  priceLabel: string;
  priceValue: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Reset only after the dialog has actually closed.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setDone(false);
        setAck(false);
        setError('');
      }, 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const payload = {
      product,
      spec,
      price: `${priceLabel}: ${priceValue}`,
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      where: String(form.get('where') ?? ''),
      notes: String(form.get('notes') ?? ''),
    };
    setBusy(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server said ${res.status}`);
      setDone(true);
    } catch {
      setError(
        `Something went wrong sending that. Call or text ${business.phone} and we will pick it up from there.`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      className={s.dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="quote-title"
    >
      <div className={`plate ${s.shell}`}>
        <div className={`plateInner ${s.inner}`}>
          {done ? (
            <div className={s.done}>
              <div className={s.doneMark}>
                <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
                  <path
                    d="M6 24.5 L18 36 L40 10"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 id="quote-title" className={s.title}>
                Got it. That spec is with the shop.
              </h2>
              <p className={s.sub}>
                Kelly reads these himself. Here is what happens next.
              </p>
              <ol className={s.doneList}>
                <li className={s.doneItem}>
                  <span className={s.doneNo}>01</span>
                  <span>
                    You get a call or a text back to confirm the details and talk through
                    anything the drawing could not settle.
                  </span>
                </li>
                <li className={s.doneItem}>
                  <span className={s.doneNo}>02</span>
                  <span>
                    A site visit if the job needs one, to measure, check the grade and set
                    the post line. Free, no obligation.
                  </span>
                </li>
                <li className={s.doneItem}>
                  <span className={s.doneNo}>03</span>
                  <span>A firm written price, then a build date.</span>
                </li>
              </ol>
              <div className={s.doneActions}>
                <a href={business.phoneHref} className="btn">
                  Call {business.phone}
                </a>
                <button type="button" className="btn btnDark" onClick={onClose}>
                  Keep configuring
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={s.head}>
                <div>
                  <h2 id="quote-title" className={s.title}>
                    Send this build to the shop
                  </h2>
                  <p className={s.sub}>
                    Your drawing and spec go with it. Free estimate, no obligation.
                  </p>
                </div>
                <button type="button" className={s.close} onClick={onClose} aria-label="Close">
                  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                    <path d="M3 3 L16 16 M16 3 L3 16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className={s.spec}>
                <p className={s.specHead}>{product}</p>
                <dl className={s.specRows}>
                  {spec.map((r) => (
                    <div key={r.key} className={s.specRow}>
                      <dt>{r.key}</dt>
                      <dd>{r.value}</dd>
                    </div>
                  ))}
                  <div className={`${s.specRow} ${s.specTotal}`}>
                    <dt>{priceLabel}</dt>
                    <dd>{priceValue}</dd>
                  </div>
                </dl>
              </div>

              <form onSubmit={submit} noValidate={false}>
                <div className={s.fields}>
                  <div>
                    <label className={s.label} htmlFor="q-name">
                      Name <span className={s.req}>*</span>
                    </label>
                    <input id="q-name" name="name" className={s.input} required autoComplete="name" />
                  </div>
                  <div>
                    <label className={s.label} htmlFor="q-phone">
                      Phone <span className={s.req}>*</span>
                    </label>
                    <input
                      id="q-phone"
                      name="phone"
                      type="tel"
                      className={s.input}
                      required
                      autoComplete="tel"
                      placeholder="801-555-0100"
                    />
                  </div>
                  <div>
                    <label className={s.label} htmlFor="q-email">
                      Email
                    </label>
                    <input id="q-email" name="email" type="email" className={s.input} autoComplete="email" />
                  </div>
                  <div>
                    <label className={s.label} htmlFor="q-where">
                      Town or ZIP <span className={s.req}>*</span>
                    </label>
                    <input id="q-where" name="where" className={s.input} required placeholder="Santaquin" />
                  </div>
                  <div className={s.wide}>
                    <label className={s.label} htmlFor="q-notes">
                      Anything the drawing does not cover
                    </label>
                    <textarea
                      id="q-notes"
                      name="notes"
                      className={s.textarea}
                      placeholder="Slope, existing footings, a gate in the run, a date you need it by…"
                    />
                  </div>
                </div>

                <label className={`${s.ack} ${ack ? s.ackOn : ''}`}>
                  <input
                    type="checkbox"
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                    required
                  />
                  <span className={s.ackBox} aria-hidden="true">
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4.5 L4 7.5 L10 1.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    I understand this is built to order at these dimensions, and that the
                    final price is confirmed before any steel is cut.
                  </span>
                </label>

                {error ? <p className={s.err}>{error}</p> : null}

                <div className={s.submitRow}>
                  <button type="submit" className="btn" disabled={!ack || busy}>
                    {busy ? 'Sending…' : 'Send it'}
                    {!busy && <Arrow />}
                  </button>
                  <span className={s.sub}>Or text the shop on {business.phoneAlt}</span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}

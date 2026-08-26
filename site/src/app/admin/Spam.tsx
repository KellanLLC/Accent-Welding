'use client';

import { useState } from 'react';
import type { PanelData, Quote } from '@/lib/panel-types';
import { Empty, api, pad3, prettyPhone, shortDate } from './ui';
import s from './admin.module.css';

type SetData = React.Dispatch<React.SetStateAction<PanelData>>;

/**
 * Everything the spam trap has caught, behind the quiet "Check spam likely"
 * link in the footer. Each row says what caught it and why, so a wrong call
 * is obvious: "Not spam" puts it back on the board, "Delete" is for the rest.
 */
export function SpamView({ spam, setData }: { spam: Quote[]; setData: SetData }) {
  return (
    <section className={s.spamWrap} aria-label="Spam likely">
      <h2 className={s.spamTitle}>Spam likely</h2>
      <p className={s.viewCopy}>
        Caught before it reached the board or texted anyone. If the trap got one wrong,
        &ldquo;Not spam&rdquo; puts it back under Requests.
      </p>
      {spam.length === 0 ? (
        <Empty title="Nothing caught">
          Anything the trap blocks shows up here without texting anyone.
        </Empty>
      ) : (
        <ul className={s.list}>
          {spam.map((q) => (
            <SpamRow key={q.id} q={q} setData={setData} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SpamRow({ q, setData }: { q: Quote; setData: SetData }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);

  const restore = async () => {
    setBusy(true);
    const r = await api(`/api/admin/quotes/${q.id}`, { method: 'PATCH', body: { spam: false } });
    setBusy(false);
    if (r.ok) {
      setData((d) => ({
        ...d,
        quotes: d.quotes.map((x) => (x.id === q.id ? { ...x, spam_via: null, spam_reason: null } : x)),
      }));
    }
  };

  const remove = async () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    setBusy(true);
    const r = await api(`/api/admin/quotes/${q.id}`, { method: 'DELETE' });
    setBusy(false);
    if (r.ok) setData((d) => ({ ...d, quotes: d.quotes.filter((x) => x.id !== q.id) }));
  };

  return (
    <li className={s.spamRow}>
      <div className={s.spamHead}>
        <span className={s.rowNo}>{pad3(q.id)}</span>
        <span className={s.spamName}>{q.name || 'No name'}</span>
        <span className={s.spamDate}>{shortDate(q.created_at)}</span>
      </div>
      <p className={s.spamWhy}>
        {q.product} · {q.spam_via}
        {q.spam_reason ? ` — ${q.spam_reason}` : ''}
      </p>
      {q.notes ? <p className={s.spamText}>{q.notes}</p> : null}
      <div className={s.spamMeta}>
        {q.phone ? <span>{prettyPhone(q.phone)}</span> : null}
        {q.email ? <span>{q.email}</span> : null}
        {q.town ? <span>{q.town}</span> : null}
      </div>
      <div className={s.spamActs} onMouseLeave={() => setArmed(false)}>
        <button type="button" className={s.spamAct} onClick={restore} disabled={busy}>
          Not spam
        </button>
        <button
          type="button"
          className={`${s.spamAct} ${armed ? s.spamActArmed : ''}`}
          onClick={remove}
          onBlur={() => setArmed(false)}
          disabled={busy}
        >
          {armed ? 'Tap again to delete' : 'Delete'}
        </button>
      </div>
    </li>
  );
}

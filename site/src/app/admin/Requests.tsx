'use client';

import { useState } from 'react';
import { QUOTE_STATUSES, type PanelData, type Quote, type QuoteStatus, type ReviewRequest } from '@/lib/panel-types';
import { ActionButton, Chev, Empty, Msg, Tag, api, firstName, fullDate, pad3, prettyPhone, shortDate, useAction } from './ui';
import s from './admin.module.css';

type Props = {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  openId: number | null;
  onOpenChange: (id: number | null) => void;
};

export function Requests({ data, setData, openId, onOpenChange }: Props) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const isOpen = (id: number) => !!open[id] || openId === id;
  const toggle = (id: number) => {
    if (openId === id) onOpenChange(null);
    setOpen((o) => ({ ...o, [id]: !isOpen(id) }));
  };

  // Spam-flagged rows stay out of the board; they live behind "Check spam
  // likely" in the footer.
  const quotes = data.quotes.filter((q) => !q.spam_via);

  if (!quotes.length) {
    return (
      <>
        <Head title="Requests" copy="Everything sent through the site: the four builders, the contact form, and questions about a listed piece." />
        <Empty title="Nothing yet">Requests from the website land here the moment they are sent, and you get a text.</Empty>
      </>
    );
  }

  return (
    <>
      <Head title="Requests" copy="Everything sent through the site. Open one to read it, mark where it stands, or text the customer for a review." />
      <ul className={s.list}>
        {quotes.map((q) => (
          <RequestRow
            key={q.id}
            q={q}
            open={isOpen(q.id)}
            onToggle={() => toggle(q.id)}
            reviews={data.reviews.filter((r) => r.quote_id === q.id)}
            template={data.settings.review_template || ''}
            setData={setData}
          />
        ))}
      </ul>
    </>
  );
}

export function Head({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) {
  return (
    <div className={s.viewHead}>
      <div>
        <h1 className={s.h1}>{title}</h1>
        <p className={s.viewCopy}>{copy}</p>
      </div>
      {action}
    </div>
  );
}

/** One line under the name: what, roughly how big, what it came to. */
function summary(q: Quote) {
  const bits: string[] = [q.product];
  // The builders already fold the size into the product name; only add a
  // dimension the name does not carry.
  const dims = q.spec
    .filter((r) => /size|length|width|height|run|footprint|depth/i.test(r.key) && !q.product.includes(r.value))
    .slice(0, 1);
  for (const d of dims) bits.push(d.value);
  if (q.price) bits.push(q.price.replace(/^[^:]*:\s*/, ''));
  return bits.join(' · ');
}

function RequestRow({
  q,
  open,
  onToggle,
  reviews,
  template,
  setData,
}: {
  q: Quote;
  open: boolean;
  onToggle: () => void;
  reviews: ReviewRequest[];
  template: string;
  setData: Props['setData'];
}) {
  const [note, setNote] = useState(q.note || '');
  const [msg, setMsg] = useState(() => template.replace(/\{\{\s*name\s*\}\}/gi, firstName(q.name)));
  const [out, setOut] = useState<{ text: string; kind?: 'ok' | 'err' }>({ text: '' });
  const send = useAction();
  const last = reviews[0];

  const setStatus = async (status: QuoteStatus) => {
    if (status === q.status) return;
    const before = q.status;
    const apply = (st: QuoteStatus) =>
      setData((d) => ({ ...d, quotes: d.quotes.map((x) => (x.id === q.id ? { ...x, status: st } : x)) }));
    apply(status); // move the tag now, confirm after; put it back if the save fails
    const r = await api(`/api/admin/quotes/${q.id}`, { method: 'PATCH', body: { status } });
    if (!r.ok) apply(before);
  };

  const saveNote = async () => {
    if ((q.note || '') === note) return;
    setData((d) => ({ ...d, quotes: d.quotes.map((x) => (x.id === q.id ? { ...x, note } : x)) }));
    await api(`/api/admin/quotes/${q.id}`, { method: 'PATCH', body: { note } });
  };

  const sendReview = () => {
    const text = msg.trim();
    if (!text) {
      setOut({ text: 'Write something first.', kind: 'err' });
      return;
    }
    setOut({ text: '' });
    send.run(async () => {
      const r = await api<{ review?: ReviewRequest }>('/api/admin/reviews', {
        method: 'POST',
        body: { phone: q.phone, message: text, name: q.name, quote_id: q.id },
      });
      if (r.data.review) {
        const review = r.data.review;
        setData((d) => ({ ...d, reviews: [review, ...d.reviews] }));
      }
      if (r.ok) {
        setOut({ text: 'Sent.', kind: 'ok' });
        return true;
      }
      setOut({ text: r.data.error || 'The message did not go through.', kind: 'err' });
      return false;
    });
  };

  return (
    <li id={`quote-${q.id}`} className={`${s.row} ${open ? s.rowOpen : ''}`}>
      <button type="button" className={s.rowHead} onClick={onToggle} aria-expanded={open}>
        <span className={s.rowLead}>
          <Tag status={q.status} />
          <span className={s.rowNo}>{pad3(q.id)}</span>
        </span>
        <span className={s.rowMain}>
          <span className={s.rowName}>{q.name}</span>
          <span className={s.rowSub}>{summary(q)}</span>
        </span>
        <span className={s.rowMeta}>{shortDate(q.created_at)}</span>
        <Chev open={open} />
      </button>

      <div className={s.rowBody}>
        <div className={s.rowBodyInner}>
          <div className={s.cols}>
            <div className={s.col}>
              <span className={s.label}>What they asked for</span>
              <dl className={s.block}>
                <div className={s.blockCell}>
                  <dt>Product</dt>
                  <dd>{q.product}</dd>
                </div>
                {q.spec.map((r) => (
                  <div key={r.key} className={s.blockCell}>
                    <dt>{r.key}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
                {q.price ? (
                  <div className={`${s.blockCell} ${s.blockPrice}`}>
                    <dt>{q.price.includes(':') ? q.price.split(':')[0] : 'Price'}</dt>
                    <dd>{q.price.includes(':') ? q.price.split(':').slice(1).join(':').trim() : q.price}</dd>
                  </div>
                ) : null}
              </dl>
              {q.notes ? <p className={s.quoteText}>{q.notes}</p> : null}

              <div className={s.metaLines}>
                <a href={`tel:${q.phone}`}>{prettyPhone(q.phone)}</a>
                {q.email ? <a href={`mailto:${q.email}`}>{q.email}</a> : null}
                {q.town ? <span>{q.town}</span> : null}
                <span>Sent {fullDate(q.created_at)}</span>
              </div>

              <span className={`${s.label} ${s.labelGap}`}>Where it stands</span>
              <div className={s.statuses} role="group" aria-label="Status">
                {QUOTE_STATUSES.map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    className={`${s.statusOpt} ${q.status === st.key ? s.statusOn : ''}`}
                    aria-pressed={q.status === st.key}
                    onClick={() => setStatus(st.key)}
                  >
                    <Tag status={st.key} size={12} />
                    {st.label}
                  </button>
                ))}
              </div>

              <textarea
                className={`${s.textarea} ${s.noteBox}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={saveNote}
                placeholder="Private note. Saves when you tap away."
                aria-label="Private note"
              />
            </div>

            <div className={s.col}>
              <span className={s.label}>Ask for a review</span>
              <textarea
                className={s.textarea}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                aria-label="Review request message"
                rows={5}
              />
              {last ? (
                <p className={s.metaLine}>
                  Review request{' '}
                  {last.status === 'sent' ? (
                    <>sent {fullDate(last.created_at)}</>
                  ) : (
                    <span className={s.fail}>failed {fullDate(last.created_at)}</span>
                  )}
                  {reviews.length > 1 ? ` (${reviews.length} total)` : ''}
                </p>
              ) : null}
              <div className={s.grow} />
              <ActionButton
                phase={send.phase}
                labels={{ idle: `Text ${prettyPhone(q.phone)}`, busy: 'Sending…', done: 'Sent', failed: 'Did not send' }}
                onClick={sendReview}
              />
              <Msg text={out.text} kind={out.kind} />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

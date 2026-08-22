'use client';

import { useState } from 'react';
import { Star } from '@/components/Star';
import type { PanelData, QuoteStatus, ReviewRequest } from '@/lib/panel-types';
import { Head } from './Requests';
import { ActionButton, Chev, Empty, Msg, Tag, api, firstName, fullDate, pad3, prettyPhone, shortDate, useAction } from './ui';
import s from './admin.module.css';

type Props = { data: PanelData; setData: React.Dispatch<React.SetStateAction<PanelData>> };

export function Reviews({ data, setData }: Props) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const threshold = Number(data.settings.screening_threshold || 4);

  return (
    <>
      <AdHoc template={data.settings.review_template || ''} setData={setData} />

      <Head title="Sent" copy="Every review request handed to GoHighLevel, newest first, with what came back." />
      {!data.reviews.length ? (
        <Empty title="None sent yet">Send one from a request, or from the box above.</Empty>
      ) : (
        <ul className={s.list}>
          {data.reviews.map((r) => (
            <ReviewRow
              key={r.id}
              r={r}
              threshold={threshold}
              open={!!open[r.id]}
              onToggle={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
              setData={setData}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function AdHoc({ template, setData }: { template: string; setData: Props['setData'] }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState(template);
  const [out, setOut] = useState<{ text: string; kind?: 'ok' | 'err' }>({ text: '' });
  const send = useAction();

  const go = () => {
    if (!phone.trim()) return setOut({ text: 'Enter a phone number.', kind: 'err' });
    if (!msg.trim()) return setOut({ text: 'Write a message.', kind: 'err' });
    setOut({ text: '' });
    send.run(async () => {
      const r = await api<{ review?: ReviewRequest }>('/api/admin/reviews', {
        method: 'POST',
        body: { phone: phone.trim(), message: msg.trim(), name: name.trim() || null },
      });
      if (r.data.review) {
        const review = r.data.review;
        setData((d) => ({ ...d, reviews: [review, ...d.reviews] }));
      }
      if (r.ok) {
        setOut({ text: 'Sent.', kind: 'ok' });
        setPhone('');
        setName('');
        return true;
      }
      setOut({ text: r.data.error || 'The message did not go through.', kind: 'err' });
      return false;
    });
  };

  return (
    <div className={`plate ${s.panel}`}>
      <div className={`plateInner ${s.panelInner}`}>
        <h2 className={s.h2}>Text anyone</h2>
        <p className={s.hint}>
          For a customer who never went through the site. <code>{'{{name}}'}</code> becomes their first name; the
          tracked link is added to the end if you leave it out.
        </p>
        <div className={s.twoUp}>
          <div>
            <label className={s.label} htmlFor="adhocPhone">Phone</label>
            <input id="adhocPhone" type="tel" className={s.input} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="off" inputMode="tel" />
          </div>
          <div>
            <label className={s.label} htmlFor="adhocName">Name</label>
            <input id="adhocName" className={s.input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" placeholder="Optional" />
          </div>
        </div>
        <label className={`${s.label} ${s.labelGap}`} htmlFor="adhocMsg">Message</label>
        <textarea id="adhocMsg" className={s.textarea} value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} />
        {name.trim() ? <p className={s.preview}>Sends as: {msg.replace(/\{\{\s*name\s*\}\}/gi, firstName(name))}</p> : null}
        <div className={s.actionRow}>
          <ActionButton phase={send.phase} labels={{ idle: 'Send review request', busy: 'Sending…', done: 'Sent', failed: 'Did not send' }} onClick={go} />
          <Msg text={out.text} kind={out.kind} />
        </div>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={s.starsRead} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= rating ? s.starOn : s.starOff} />
      ))}
    </span>
  );
}

const WHY: Record<string, string> = {
  clicked: 'they opened it',
  rated: 'they rated you',
  manual: 'you stopped them',
  exhausted: 'all three were sent',
  send_failed: 'the first message failed',
};

function ReviewRow({
  r,
  threshold,
  open,
  onToggle,
  setData,
}: {
  r: ReviewRequest;
  threshold: number;
  open: boolean;
  onToggle: () => void;
  setData: Props['setData'];
}) {
  const stop = useAction();
  const rated = r.rating != null;
  const low = rated && (r.rating as number) < threshold;

  // The tag reads "does this need me?": a failed send and an unhappy customer
  // sit solid tan; everything settled drains to dim.
  const tone: QuoteStatus =
    r.status !== 'sent' ? 'new' : low ? 'new' : rated ? 'done' : r.clicked_at ? 'contacted' : r.stopped_at ? 'done' : 'scheduled';

  const headline =
    r.status !== 'sent' ? <span className={s.fail}>Failed</span>
    : rated ? <Stars rating={r.rating as number} />
    : r.clicked_at ? <span>Opened</span>
    : <span>Sent</span>;

  let ladder = '';
  if (r.status === 'sent') {
    if (r.stopped_at) ladder = `Follow-ups stopped: ${WHY[r.stop_reason || ''] || r.stop_reason}.`;
    else if (r.next_due_at) ladder = `Follow-up ${Number(r.step) + 1} of 3 goes out ${fullDate(r.next_due_at)}.`;
  }

  const stopNow = () =>
    stop.run(async () => {
      const res = await api<{ review?: Partial<ReviewRequest> }>(`/api/admin/reviews/${r.id}/stop`, { method: 'POST' });
      if (!res.ok) return false;
      const patch = res.data.review || {};
      setData((d) => ({
        ...d,
        reviews: d.reviews.map((x) => (x.id === r.id ? { ...x, stopped_at: patch.stopped_at ?? x.stopped_at, stop_reason: patch.stop_reason ?? x.stop_reason, next_due_at: null } : x)),
      }));
      return true;
    });

  return (
    <li className={`${s.row} ${open ? s.rowOpen : ''}`}>
      <button type="button" className={s.rowHead} onClick={onToggle} aria-expanded={open}>
        <span className={s.rowLead}>
          <Tag status={tone} />
          <span className={s.rowNo}>{pad3(r.id)}</span>
        </span>
        <span className={s.rowMain}>
          <span className={s.rowName}>{r.name || prettyPhone(r.phone)}</span>
          <span className={s.rowSub}>{prettyPhone(r.phone)}</span>
        </span>
        <span className={s.rowMeta}>
          {headline}
          <span className={s.rowDate}>{shortDate(r.created_at)}</span>
        </span>
        <Chev open={open} />
      </button>
      <div className={s.rowBody}>
        <div className={s.rowBodyInner}>
          <div className={s.cols}>
            <div className={s.col}>
              <span className={s.label}>What was sent</span>
              <p className={s.quoteText}>{r.message}</p>
              {r.feedback ? (
                <>
                  <span className={`${s.label} ${s.labelGap}`}>What they told you</span>
                  <p className={`${s.quoteText} ${s.fail}`}>{r.feedback}</p>
                </>
              ) : null}
            </div>
            <div className={s.col}>
              <span className={s.label}>Detail</span>
              <div className={s.metaLines}>
                <span>Sent {fullDate(r.created_at)}</span>
                <a href={`tel:${r.phone}`}>{prettyPhone(r.phone)}</a>
                {r.clicked_at ? <span>Opened {fullDate(r.clicked_at)}</span> : null}
                {rated ? (
                  <span>
                    Rated {r.rating} of 5{low ? ', so they were not shown the Google link.' : ', and offered the Google link.'}
                  </span>
                ) : null}
                {ladder ? <span>{ladder}</span> : null}
                {r.error ? <span className={s.fail}>{r.error}</span> : null}
              </div>
              <div className={s.grow} />
              {!r.stopped_at && r.next_due_at ? (
                <ActionButton kind="dark" phase={stop.phase} labels={{ idle: 'Stop follow-ups', busy: 'Stopping…', done: 'Stopped', failed: 'Could not stop' }} onClick={stopNow} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { EnquiryForm } from '@/components/EnquiryForm';
import { Arrow } from '@/components/Arrow';
import s from '@/components/builder/QuoteDialog.module.css';

/** "Ask about this piece": the enquiry form in the same dialog the builders use. */
export function PieceEnquiry({ title, price, sold }: { title: string; price: string; sold: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)}>
        {sold ? 'Ask for one like it' : 'Ask about this piece'}
        <Arrow />
      </button>
      <dialog
        ref={ref}
        className={s.dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
        aria-labelledby="piece-title"
      >
        <div className={`plate ${s.shell}`}>
          <div className={`plateInner ${s.inner}`}>
            <div className={s.head}>
              <div>
                <h2 id="piece-title" className={s.title}>
                  {sold ? 'Ask for one like it' : 'Ask about this piece'}
                </h2>
                <p className={s.sub}>
                  {title} · {price}. The shop texts or calls you back.
                </p>
              </div>
              <button type="button" className={s.close} onClick={() => setOpen(false)} aria-label="Close">
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                  <path d="M3 3 L16 16 M16 3 L3 16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {open ? (
              <EnquiryForm product={title} price={price} source="piece" idPrefix="pc" onDone={() => setOpen(false)} />
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}

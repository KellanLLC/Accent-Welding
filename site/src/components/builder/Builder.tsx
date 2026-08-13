'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Arrow } from '../Arrow';
import { business } from '@/config/business';
import { money } from '@/config/pricing';
import s from './Builder.module.css';

export function BuilderHead({
  title,
  blurb,
  backHref = '/build',
  backLabel = 'All builders',
}: {
  title: string;
  blurb: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className={`wrap ${s.head}`}>
      <Link href={backHref} className={s.crumb}>
        <span aria-hidden="true">←</span> {backLabel}
      </Link>
      <h1 className={`d2 ${s.title}`}>{title}</h1>
      <p className={`lede ${s.blurb}`}>{blurb}</p>
    </div>
  );
}

export function BuilderLayout({ rail, children }: { rail: ReactNode; children: ReactNode }) {
  return (
    <div className={`wrap ${s.layout}`}>
      <div className={s.controls}>{children}</div>
      <div className={s.rail}>{rail}</div>
    </div>
  );
}

export function Sheet({
  title,
  scale = 'Not to scale on screen',
  block,
  children,
}: {
  title: string;
  scale?: string;
  block: { key: string; val: string }[];
  children: ReactNode;
}) {
  return (
    <div className={`plate ${s.drawing} ${s.price}`}>
      <div className={`plateInner ${s.drawingInner}`}>
        <div className={s.sheetHead}>
          <h2 className={s.sheetTitle}>{title}</h2>
          <span className={s.sheetScale}>{scale}</span>
        </div>
        {children}
        <dl className={s.block}>
          {block.map((b) => (
            <div key={b.key} className={s.blockCell}>
              <dt className={s.blockKey}>{b.key}</dt>
              <dd className={s.blockVal} style={{ margin: 0 }}>
                {b.val}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export type LineItem = {
  label: string;
  sub?: string;
  value: string;
  muted?: boolean;
};

export function PriceCard({
  items,
  totalLabel,
  totalSub,
  total,
  range,
  leadWeeks,
  disclaimer,
  onQuote,
  quoteLabel = 'Send this to the shop',
}: {
  items: LineItem[];
  totalLabel: string;
  totalSub?: string;
  total?: number;
  range?: [number, number];
  leadWeeks: readonly [number, number] | [number, number];
  disclaimer: ReactNode;
  onQuote: () => void;
  quoteLabel?: string;
}) {
  return (
    <div className={`plate ${s.price}`}>
      <div className={`plateInner ${s.priceInner}`}>
        <div className={s.rows}>
          {items.map((it, i) => (
            <div key={i} className={`${s.row} ${it.muted ? s.rowMuted : ''}`}>
              <span className={s.rowLabel}>
                {it.label}
                {it.sub ? <span className={s.rowSub}>{it.sub}</span> : null}
              </span>
              <span className={s.rowVal}>{it.value}</span>
            </div>
          ))}
        </div>

        <div className={s.total}>
          <span className={s.totalKey}>
            {totalLabel}
            {totalSub ? <span className={s.totalKeySub}>{totalSub}</span> : null}
          </span>
          <span className={`${s.totalVal} ${range ? s.totalRange : ''}`}>
            {range ? `${money(range[0])} – ${money(range[1])}` : money(total ?? 0)}
          </span>
        </div>

        <div className={s.lead}>
          <span>Typical lead time</span>
          <span className={s.leadVal}>
            {leadWeeks[0]}–{leadWeeks[1]} weeks
          </span>
        </div>

        <p className={s.disclaimer}>{disclaimer}</p>

        <div className={s.actions}>
          <button type="button" className="btn" onClick={onQuote}>
            {quoteLabel}
            <Arrow />
          </button>
          <p className={s.callRow}>
            or call <a href={business.phoneHref}>{business.phone}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Group({
  n,
  title,
  children,
  note,
}: {
  n: number;
  title: string;
  children: ReactNode;
  note?: ReactNode;
}) {
  return (
    <section className={`plate ${s.group}`}>
      <div className={`plateInner ${s.groupInner}`}>
        <div className={s.groupHead}>
          <span className={s.groupNo}>{String(n).padStart(2, '0')}</span>
          <h2 className={s.groupTitle}>{title}</h2>
        </div>
        {children}
        {note ? <p className={s.note}>{note}</p> : null}
      </div>
    </section>
  );
}

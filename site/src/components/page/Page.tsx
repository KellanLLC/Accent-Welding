import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { business } from '@/config/business';
import s from './Page.module.css';

export function Opener({
  title,
  lede,
  photo,
  alt,
  position = '50% 45%',
  action,
}: {
  title: ReactNode;
  lede: string;
  photo: string;
  alt: string;
  position?: string;
  action?: ReactNode;
}) {
  return (
    <section className={s.opener}>
      <div className={s.openerPhoto}>
        <Image src={photo} alt={alt} fill priority sizes="100vw" quality={78} style={{ objectPosition: position }} />
      </div>
      <div className={s.openerScrim} />
      <div className={`wrap ${s.openerGrid}`}>
        <div>
          <h1 className={`d1 ${s.openerTitle}`}>{title}</h1>
          <p className={s.openerLede}>{lede}</p>
        </div>
        {action ? <div className={s.openerAction}>{action}</div> : null}
      </div>
    </section>
  );
}

export function Lead({ title, copy }: { title: ReactNode; copy: string }) {
  return (
    <div className={s.lead}>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

export function StyleCard({
  name,
  spec,
  copy,
  drawing,
}: {
  name: string;
  spec: string;
  copy: string;
  drawing: ReactNode;
}) {
  return (
    <div className={`plate ${s.style}`}>
      <div className={`plateInner ${s.styleInner}`}>
        <div className={s.styleDraw}>{drawing}</div>
        <h3 className={s.styleName}>{name}</h3>
        <p className={s.styleSpec}>{spec}</p>
        <p className={s.styleCopy}>{copy}</p>
      </div>
    </div>
  );
}

export function Specs({ items }: { items: { key: string; val: string; note?: string }[] }) {
  return (
    <dl className={s.specs}>
      {items.map((i) => (
        <div key={i.key} className={s.spec}>
          <dt className={s.specKey}>{i.key}</dt>
          <dd style={{ margin: 0 }}>
            <p className={s.specVal}>{i.val}</p>
            {i.note ? <span className={s.specNote}>{i.note}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Gallery({
  items,
}: {
  items: { src: string; alt: string; cap: string; wide?: boolean }[];
}) {
  return (
    <div className={s.gallery}>
      {items.map((i) => (
        <figure key={i.src} style={{ margin: 0 }}>
          <div className={`${s.frame} ${i.wide ? s.frameWide : ''}`}>
            <Image src={i.src} alt={i.alt} fill sizes="(max-width: 700px) 100vw, 420px" quality={76} />
          </div>
          <figcaption className={s.cap}>{i.cap}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function CTA({
  title,
  copy,
  href,
  label,
}: {
  title: ReactNode;
  copy: string;
  href: string;
  label: string;
}) {
  return (
    <div className="wrap">
      <div className={`plate ${s.cta}`}>
        <div className={`plateInner ${s.ctaInner}`}>
          <div>
            <h2 className={s.ctaTitle}>{title}</h2>
            <p className={s.ctaCopy}>{copy}</p>
          </div>
          <div className={s.ctaActions}>
            <Link href={href} className="btn">
              {label}
            </Link>
            <a href={business.phoneHref} className={s.ctaCall}>
              or call {business.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const page = s;

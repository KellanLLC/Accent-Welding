import type { Metadata } from 'next';
import Link from 'next/link';
import { business } from '@/config/business';
import { Arrow } from '@/components/Arrow';
import { Mark } from '@/components/Mark';
import c from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Call or text Accent Welding for a free estimate on custom metal railing, fencing, gates and garden boxes across Utah County.',
};

export default function Contact() {
  return (
    <>
      <section className={c.head}>
        <div className="wrap">
          <div className={c.headGrid}>
            <div>
              <h1 className="d1">
                Call or text. <em className={c.em}>Kelly picks up.</em>
              </h1>
              <p className={c.lede}>
                Free estimates, quality work, fair pricing. If you already know roughly what
                you want, the builder will give you a number before you even call.
              </p>
            </div>
            <Mark size={132} className={c.mark} />
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className={c.grid}>
          <a href={business.phoneHref} className={`plate ${c.card}`}>
            <span className={`plateInner ${c.cardInner}`}>
              <span className={c.cardKey}>Call or text</span>
              <span className={c.cardVal}>{business.phone}</span>
              <span className={c.cardNote}>
                The number on the card and the price list. Best for anything urgent.
              </span>
            </span>
          </a>

          <a href={business.phoneAltHref} className={`plate ${c.card}`}>
            <span className={`plateInner ${c.cardInner}`}>
              <span className={c.cardKey}>Second line</span>
              <span className={c.cardVal}>{business.phoneAlt}</span>
              <span className={c.cardNote}>
                The number on both service flyers. Text a photo of the job here.
              </span>
            </span>
          </a>

          <a href={business.emailHref} className={`plate ${c.card}`}>
            <span className={`plateInner ${c.cardInner}`}>
              <span className={c.cardKey}>Email</span>
              <span className={`${c.cardVal} ${c.cardValSm}`}>{business.email}</span>
              <span className={c.cardNote}>
                Best for drawings, site photos and anything with measurements in it.
              </span>
            </span>
          </a>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={c.two}>
            <div className={`plate ${c.panel}`}>
              <div className={`plateInner ${c.panelInner}`}>
                <h2 className={c.panelTitle}>Send a spec instead</h2>
                <p className={c.panelCopy}>
                  Configure the job first and the shop gets your dimensions, your finish and a
                  scale drawing along with your details. It is the fastest way to a firm
                  price, and it saves a conversation working out what you meant.
                </p>
                <div className={c.panelActions}>
                  <Link href="/build" className="btn">
                    Build &amp; price your job
                  </Link>
                  <Link href="/build/garden-box" className="linkAction">
                    Or just price a garden box
                    <Arrow />
                  </Link>
                </div>
              </div>
            </div>

            <dl className={c.facts}>
              <div className={c.fact}>
                <dt className={c.factKey}>Where we work</dt>
                <dd className={c.factVal}>
                  {business.serviceArea}.
                  <span className={c.factNote}>
                    If you are on the edge of that, ask anyway.
                  </span>
                </dd>
              </div>
              <div className={c.fact}>
                <dt className={c.factKey}>What it costs to ask</dt>
                <dd className={c.factVal}>
                  Nothing.
                  <span className={c.factNote}>
                    Estimates are free, including a site visit where the job needs one.
                  </span>
                </dd>
              </div>
              <div className={c.fact}>
                <dt className={c.factKey}>Find the shop</dt>
                <dd className={c.factVal}>
                  <a href={business.social.facebook} target="_blank" rel="noopener noreferrer" className={c.factLink}>
                    Facebook
                  </a>
                  {' · '}
                  <a href={business.social.instagram} target="_blank" rel="noopener noreferrer" className={c.factLink}>
                    Instagram
                  </a>
                  <span className={c.factNote}>
                    Every job the shop has done is posted on both.
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}

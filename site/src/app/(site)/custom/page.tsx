import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/Arrow';
import { business } from '@/config/business';
import { displayPrice, photoUrl } from '@/lib/panel-types';
import { afterResponse } from '@/lib/server/env';
import { keepClockRunning } from '@/lib/server/followups';
import { listPublicItems } from '@/lib/server/items';
import c from './custom.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/custom' },
  title: 'Custom & other pieces for sale',
  description:
    'One-off steel pieces fabricated by Accent Welding and for sale now: fire pits, brackets, stands, signs and whatever else came off the bench. Utah County pickup.',
};

export default async function CustomPage() {
  const items = await listPublicItems();
  afterResponse(keepClockRunning(), 'clock');

  return (
    <>
      <section className={c.head}>
        <div className="wrap">
          <div className={c.headGrid}>
            <h1 className="d1">
              Built in the shop. <em className={c.em}>Ready to go.</em>
            </h1>
            <p className={c.lede}>
              One-off pieces fabricated here and for sale now. Each one is the only one; when it is
              gone, it is gone. Want something like it made for you? That is what the shop does.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap">
        {items.length ? (
          <ul className={c.grid}>
            {items.map((it) => {
              const cover = it.photos[0];
              const sold = it.status === 'sold';
              return (
                <li key={it.id}>
                  <Link href={`/custom/${it.id}-${it.slug}`} className={`plate ${c.card} ${sold ? c.cardSold : ''}`}>
                    <span className={`plateInner ${c.cardInner}`}>
                      <span className={c.shot}>
                        {cover ? (
                          // Served from our own KV at a fixed size; next/image's
                          // optimizer would only re-fetch and re-encode it.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photoUrl(cover.id, 'thumb')}
                            srcSet={`${photoUrl(cover.id, 'thumb')} 640w, ${photoUrl(cover.id, 'full')} 1600w`}
                            sizes="(max-width: 700px) 100vw, 420px"
                            alt={it.title}
                            width={cover.width}
                            height={cover.height}
                            loading="lazy"
                          />
                        ) : (
                          <span className={c.noPhoto}>No photo yet</span>
                        )}
                        {sold ? <span className={c.soldMark}>Sold</span> : null}
                      </span>
                      <span className={c.cardBody}>
                        <span className={c.cardName}>{it.title}</span>
                        <span className={c.cardPrice}>{sold ? 'Sold' : displayPrice(it.price)}</span>
                        {it.description ? <span className={c.cardCopy}>{it.description}</span> : null}
                        <span className={c.cardLink}>
                          {sold ? 'See it' : 'See it and ask'} <Arrow />
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={`plate ${c.emptyPlate}`}>
            <div className={`plateInner ${c.emptyInner}`}>
              <h2 className={c.emptyTitle}>Nothing listed right now.</h2>
              <p className={c.emptyCopy}>
                Pieces go up here as they come off the table, and come down as they sell. The shop
                posts most of them on Instagram first.
              </p>
              <div className={c.emptyActions}>
                <Link href="/fabrication" className="btn">
                  Have something made instead
                </Link>
                <a href={business.social.instagram} target="_blank" rel="noopener noreferrer" className="linkAction">
                  Follow the shop
                  <Arrow />
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="section">
        <div className="wrap">
          <div className={`plate ${c.cta}`}>
            <div className={`plateInner ${c.ctaInner}`}>
              <div>
                <h2 className={c.ctaTitle}>
                  Not here? <em className={c.em}>Describe it.</em>
                </h2>
                <p className={c.ctaCopy}>
                  Brackets, stands, a fire pit, a sign, a repair. If it is steel and you can sketch it
                  or photograph it, the shop can usually make it. Free estimates.
                </p>
              </div>
              <div className={c.ctaActions}>
                <Link href="/contact" className="btn">
                  Send it over
                </Link>
                <a href={business.phoneHref} className={c.ctaCall}>
                  or call {business.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

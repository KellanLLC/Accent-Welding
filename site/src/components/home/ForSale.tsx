import Link from 'next/link';
import { Arrow } from '@/components/Arrow';
import { displayPrice, photoUrl } from '@/lib/panel-types';
import { listPublicItems } from '@/lib/server/items';
import c from '@/app/(site)/custom/custom.module.css';
import s from './ForSale.module.css';

/**
 * Up to four pieces that are built and for sale right now, on the home page.
 * Renders nothing at all when nothing is listed, and nothing if the database
 * cannot be reached, so the home page never fails on account of this strip.
 */
export async function ForSale() {
  let items;
  try {
    items = (await listPublicItems()).filter((i) => i.status === 'live').slice(0, 4);
  } catch (err) {
    console.error('[for-sale strip]', err instanceof Error ? err.message : err);
    return null;
  }
  if (!items.length) return null;

  return (
    <section className="section">
      <div className="wrap">
        <div className={s.head}>
          <h2 className="d2">
            Built, and <em className={s.em}>for sale now</em>.
          </h2>
          <Link href="/custom" className="linkAction">
            All pieces
            <Arrow />
          </Link>
        </div>
        <ul className={`${c.grid} ${s.grid}`}>
          {items.map((it) => {
            const cover = it.photos[0];
            return (
              <li key={it.id}>
                <Link href={`/custom/${it.id}-${it.slug}`} className={`plate ${c.card}`}>
                  <span className={`plateInner ${c.cardInner}`}>
                    <span className={c.shot}>
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoUrl(cover.id, 'thumb')}
                          srcSet={`${photoUrl(cover.id, 'thumb')} 640w, ${photoUrl(cover.id, 'full')} 1600w`}
                          sizes="(max-width: 700px) 100vw, 320px"
                          alt={it.title}
                          width={cover.width}
                          height={cover.height}
                          loading="lazy"
                        />
                      ) : (
                        <span className={c.noPhoto}>No photo yet</span>
                      )}
                    </span>
                    <span className={c.cardBody}>
                      <span className={c.cardName}>{it.title}</span>
                      <span className={c.cardPrice}>{displayPrice(it.price)}</span>
                      {it.description ? <span className={c.cardCopy}>{it.description}</span> : null}
                      <span className={c.cardLink}>
                        See it and ask <Arrow />
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { business } from '@/config/business';
import { SITE_URL } from '@/config/site';
import { displayPrice, photoUrl } from '@/lib/panel-types';
import { getPublicItemByPath } from '@/lib/server/items';
import { PieceEnquiry } from './PieceEnquiry';
import c from '../custom.module.css';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getPublicItemByPath((await params).slug);
  if (!item) return { title: 'Not found' };
  const cover = item.photos[0];
  return {
    title: item.title,
    description: item.description
      ? item.description.slice(0, 155)
      : `${item.title}, fabricated by Accent Welding and for sale now.`,
    openGraph: cover
      ? { images: [{ url: `${SITE_URL}${photoUrl(cover.id, 'full')}`, width: cover.width, height: cover.height }] }
      : undefined,
  };
}

export default async function PiecePage({ params }: Props) {
  const item = await getPublicItemByPath((await params).slug);
  if (!item) notFound();
  const sold = item.status === 'sold';
  const cover = item.photos[0];
  const smsBody = encodeURIComponent(`Hi, I'm asking about the ${item.title} on your site.`);

  return (
    <div className={`wrap ${c.detail}`}>
      <div>
        <Link href="/custom" className={c.crumb}>
          <span aria-hidden="true">←</span> All pieces
        </Link>
        <div className={c.gallery}>
          <div className={c.mainShot}>
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl(cover.id, 'full')}
                alt={item.title}
                width={cover.width}
                height={cover.height}
                fetchPriority="high"
              />
            ) : (
              <span className={c.noPhoto}>No photo yet</span>
            )}
          </div>
          {item.photos.length > 1 ? (
            <div className={c.thumbs}>
              {item.photos.map((p) => (
                <a key={p.id} href={photoUrl(p.id, 'full')} target="_blank" rel="noopener">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl(p.id, 'thumb')} alt="" width={p.width} height={p.height} loading="lazy" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <h1 className={c.title}>{item.title}</h1>
        <p className={`${c.price} ${sold ? c.priceSold : ''}`}>{sold ? 'Sold' : displayPrice(item.price)}</p>
        {item.description ? <p className={c.desc}>{item.description}</p> : null}

        <dl className={c.facts}>
          <div className={c.fact}>
            <dt>Built by</dt>
            <dd>Accent Welding</dd>
          </div>
          <div className={c.fact}>
            <dt>Pick up</dt>
            <dd>{business.serviceAreaShort}, Utah</dd>
          </div>
          <div className={c.fact}>
            <dt>How many</dt>
            <dd>One. It is a one-off.</dd>
          </div>
        </dl>

        {sold ? (
          <p className={c.soldNote}>
            This one has gone. If you want something like it, the shop can build another to your
            size and finish. Ask below.
          </p>
        ) : null}

        <div className={c.actions}>
          <PieceEnquiry title={item.title} price={sold ? 'Sold' : displayPrice(item.price)} sold={sold} />
          <a href={`${business.smsAltHref}?&body=${smsBody}`} className="linkAction">
            Or text the shop on {business.phoneAlt}
          </a>
        </div>
      </div>
    </div>
  );
}

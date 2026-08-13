import Link from 'next/link';
import { Mark } from '@/components/Mark';
import { business } from '@/config/business';

export default function NotFound() {
  return (
    <section className="wrap" style={{ paddingBlock: 'clamp(70px, 12vw, 160px)' }}>
      <Mark size={110} />
      <h1 className="d2" style={{ margin: '30px 0 16px', maxWidth: '18ch' }}>
        That page is not in the shop.
      </h1>
      <p className="lede" style={{ marginBottom: 30 }}>
        The link may be old, or the page may never have existed. Everything Accent Welding
        builds is one click away below.
      </p>
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link href="/" className="btn">
          Back to the front
        </Link>
        <Link href="/build" className="linkAction">
          Build &amp; price a job
        </Link>
        <a href={business.phoneHref} className="linkAction">
          Call {business.phone}
        </a>
      </div>
    </section>
  );
}

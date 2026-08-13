'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Mark } from './Mark';
import { useScrolled } from '@/lib/useScrolled';
import { business, nav, products } from '@/config/business';
import s from './Nav.module.css';

export function Nav() {
  const stuck = useScrolled(24);
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(false);
  const orderRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();

  // Close the panel on navigation. Adjusted during render rather than in an
  // effect, so the panel is already closed on the first paint of the new page
  // instead of flashing open for a frame.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setOrder(false);
  }

  // Dismiss the order menu the two ways a menu has to be dismissable: Escape,
  // and a click anywhere outside it. Focus returns to the trigger on Escape so
  // the keyboard is never left stranded.
  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOrder(false);
      orderRef.current?.querySelector('button')?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!orderRef.current?.contains(e.target as Node)) setOrder(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [order]);

  const onProduct = products.some((p) => pathname.startsWith(p.href));

  // Lock the page behind the open panel.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`${s.root} ${stuck || open ? s.stuck : ''}`}>
      <div className="wrap">
        <div className={s.bar}>
          <Link href="/" className={s.brand} aria-label="Accent Welding, home">
            <Mark size={44} className={s.brandMark} />
            <span>
              <span className={s.word}>ACCENT WELDING</span>
              <span className={s.est}>EST. 2025</span>
            </span>
          </Link>

          <nav aria-label="Main">
            <ul className={s.links}>
              <li className={s.orderWrap} ref={orderRef}>
                <button
                  type="button"
                  className={`${s.link} ${s.orderBtn} ${onProduct || order ? s.active : ''}`}
                  aria-expanded={order}
                  aria-haspopup="true"
                  aria-controls="order-menu"
                  onClick={() => setOrder((v) => !v)}
                >
                  Order
                  <Chevron open={order} />
                </button>
                <ul id="order-menu" className={`${s.orderMenu} ${order ? s.orderOpen : ''}`}>
                  {products.map((p) => (
                    <li key={p.href}>
                      <Link
                        href={p.href}
                        className={`${s.orderItem} ${pathname.startsWith(p.href) ? s.orderItemOn : ''}`}
                        aria-current={pathname.startsWith(p.href) ? 'page' : undefined}
                        tabIndex={order ? undefined : -1}
                      >
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${s.link} ${pathname.startsWith(item.href) ? s.active : ''}`}
                    aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={s.callWrap}>
            <a href={business.phoneHref} className={s.phone}>
              {business.phone}
            </a>
            <Link href="/build" className={`btn ${s.cta}`}>
              Build &amp; price
            </Link>
            <button
              type="button"
              className={s.burger}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="nav-panel"
            >
              {open ? 'Close' : 'Menu'}
              <MenuGlyph open={open} />
            </button>
          </div>
        </div>
      </div>

      <div id="nav-panel" className={`${s.panel} ${open ? s.panelOpen : ''}`}>
        <div className="wrap">
          <ul className={s.panelList}>
            {products.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={s.panelLink}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/fabrication" className={s.panelLink}>
                Custom Fabrication
              </Link>
            </li>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={s.panelLink}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className={s.panelLink}>
                Contact
              </Link>
            </li>
          </ul>
          <div className={s.panelActions}>
            <Link href="/build" className="btn">
              Build &amp; price a job
            </Link>
            <a href={business.phoneHref} className="btn btnDark">
              Call {business.phone}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * The order marker: a short bar that pivots into a shallow V when the menu is
 * open. Same stroke and rounded cap as the menu glyph beside it, so the two
 * controls read as one set rather than two borrowed icons.
 */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="8"
      viewBox="0 0 11 8"
      aria-hidden="true"
      focusable="false"
      style={{
        transformOrigin: 'center',
        transform: open ? 'rotate(180deg)' : 'none',
        transition: 'transform 240ms var(--ease-out)',
      }}
    >
      <path
        d="M1.4 2.4 L5.5 6 L9.6 2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Two bars that cross into an X. Drawn for this site, not an icon-pack glyph. */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg width="15" height="12" viewBox="0 0 15 12" aria-hidden="true" focusable="false">
      <line
        x1="0.5"
        y1={open ? 6 : 2}
        x2="14.5"
        y2={open ? 6 : 2}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{
          transformOrigin: 'center',
          transform: open ? 'rotate(45deg)' : 'none',
          transition: 'transform 280ms var(--ease-out), y 280ms var(--ease-out)',
        }}
      />
      <line
        x1="0.5"
        y1={open ? 6 : 10}
        x2="14.5"
        y2={open ? 6 : 10}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{
          transformOrigin: 'center',
          transform: open ? 'rotate(-45deg)' : 'none',
          transition: 'transform 280ms var(--ease-out), y 280ms var(--ease-out)',
        }}
      />
    </svg>
  );
}

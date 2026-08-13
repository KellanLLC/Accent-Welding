import Link from 'next/link';
import { business } from '@/config/business';
import s from './Footer.module.css';

export function Footer() {
  const year = 2026;
  return (
    <footer className={s.root}>
      <div className="wrap">
        <dl className={s.stamp}>
          <div className={s.cell}>
            <dt className={s.cellKey}>Call or text</dt>
            <dd style={{ margin: 0 }}>
              <a href={business.phoneHref} className={s.cellVal}>
                {business.phone}
              </a>
              <span className={s.cellNote}>Also on {business.phoneAlt}</span>
            </dd>
          </div>
          <div className={s.cell}>
            <dt className={s.cellKey}>Email</dt>
            <dd style={{ margin: 0 }}>
              <a href={business.emailHref} className={s.cellVal}>
                {business.email}
              </a>
            </dd>
          </div>
          <div className={s.cell}>
            <dt className={s.cellKey}>Serving</dt>
            <dd style={{ margin: 0 }}>
              <span className={s.cellVal}>{business.serviceAreaShort}</span>
              <span className={s.cellNote}>and surrounding areas</span>
            </dd>
          </div>
          <div className={s.cell}>
            <dt className={s.cellKey}>Estimates</dt>
            <dd style={{ margin: 0 }}>
              <span className={s.cellVal}>Free</span>
              <span className={s.cellNote}>Quality work, fair pricing</span>
            </dd>
          </div>
        </dl>

        <div className={s.mid}>
          <div className={s.cols}>
            <div className={s.col}>
              <h2 className={s.colHead}>What we build</h2>
              <Link href="/railings">Railings</Link>
              <Link href="/fencing">Fencing</Link>
              <Link href="/gates">Gates</Link>
              <Link href="/garden-boxes">Garden boxes</Link>
              <Link href="/fabrication">Custom fabrication</Link>
            </div>
            <div className={s.col}>
              <h2 className={s.colHead}>Price it yourself</h2>
              <Link href="/build/railing">Railing</Link>
              <Link href="/build/fence">Fence</Link>
              <Link href="/build/gate">Gate</Link>
              <Link href="/build/garden-box">Garden box</Link>
            </div>
            <div className={s.col}>
              <h2 className={s.colHead}>The shop</h2>
              <Link href="/work">Work</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div className={s.social}>
            <a href={business.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Accent Welding on Facebook">
              <FacebookMark />
            </a>
            <a href={business.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Accent Welding on Instagram">
              <InstagramMark />
            </a>
          </div>
        </div>

        <hr className="hr" />

        <div className={s.colophon}>
          <span>
            © {year} Accent Welding. {business.owner}, {business.ownerTitle}.
          </span>
          <span>
            {business.licensed && business.licenceNumber
              ? `Licensed & insured · ${business.licenceNumber}`
              : `Fabricated in ${business.serviceAreaShort}, Utah`}
          </span>
          <a
            className={s.madeBy}
            href="https://getkellan.com"
            target="_blank"
            rel="noopener"
          >
            Made by Kellan
          </a>
        </div>
      </div>

      {/*
        The signature. textLength pins the word to an exact width inside the
        viewBox, so it is mathematically centred and can never be clipped at
        the sides whatever the viewport. The baseline sits two units below the
        box so the glyph feet bleed off the bottom edge by a hair — deliberate,
        with generous headroom above the caps so nothing up there is ever cut.
      */}
      <svg
        className={s.signature}
        viewBox="0 0 1000 132"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden="true"
        focusable="false"
      >
        <text
          x="500"
          y="134"
          textLength="948"
          lengthAdjust="spacing"
          textAnchor="middle"
          fontFamily="var(--font-display), Georgia, serif"
          fontWeight="700"
          fontSize="112"
          fill="currentColor"
        >
          ACCENT WELDING
        </text>
      </svg>
    </footer>
  );
}

/* Real brand marks, drawn bare. No container behind either one. */

function FacebookMark() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.96h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91a5.9 5.9 0 0 0 1.38 2.13 5.9 5.9 0 0 0 2.13 1.38c.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
    </svg>
  );
}

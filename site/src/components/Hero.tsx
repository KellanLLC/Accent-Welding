'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Arrow } from './Arrow';
import s from './Hero.module.css';

export function Hero() {
  const photo = useRef<HTMLImageElement>(null);

  /** Quiet parallax on an element that is already fully on screen. */
  useEffect(() => {
    const el = photo.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        el.style.transform = `translate3d(0, ${y * 0.14}px, 0) scale(1.06)`;
      });
    };
    el.style.transform = 'scale(1.06)';
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className={s.root}>
      <div className={s.photoWrap}>
        <Image
          ref={photo}
          src="/img/ornamental-foothills.jpg"
          alt="Bronze ornamental iron fence with spear finials set between cut stone columns, running toward the Utah foothills"
          fill
          priority
          sizes="100vw"
          className={s.photo}
          quality={82}
        />
      </div>
      <div className={s.scrimTop} />
      <div className={s.scrim} />
      <div className={s.vignette} />
      <div className={s.grain} />

      <div className={`wrap ${s.inner}`}>
        <div className={s.grid}>
          <div className={s.copy}>
            <h1 className={`d1 ${s.h1}`}>
              Strength in <em>steel</em>.
            </h1>
            <p className={s.sub}>
              Custom railing, fencing and gates, built to fit your property and priced
              before anyone comes out.
            </p>
            <div className={s.actions}>
              <Link href="/build" className="btn">
                Build yours &amp; see the price
              </Link>
              <Link href="/work" className="linkAction">
                See finished work
                <Arrow />
              </Link>
            </div>
          </div>

          <div className={`plate ${s.stamp}`}>
            <div className={`plateInner ${s.stampInner}`}>
              <h2 className={s.stampHead}>Shown above</h2>
              <dl className={s.stampRows}>
                <div className={s.stampRow}>
                  <dt>Job</dt>
                  <dd>Ornamental iron on a stone knee wall</dd>
                </div>
                <div className={s.stampRow}>
                  <dt>Picket</dt>
                  <dd>Spear finial, 5/8″ square bar</dd>
                </div>
                <div className={s.stampRow}>
                  <dt>Finish</dt>
                  <dd>Bronze powder coat</dd>
                </div>
                <div className={s.stampRow}>
                  <dt>Where</dt>
                  <dd>Utah County foothills</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

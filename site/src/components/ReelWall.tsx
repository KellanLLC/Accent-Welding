'use client';

import { useEffect, useRef } from 'react';
import { reels } from '@/config/products';
import s from './ReelWall.module.css';

/**
 * Their own reels, playing. Muted, looping, and only while on screen so we are
 * not decoding eight videos at once. The poster frame is always painted, so if
 * video never plays there is still a real photograph in every tile.
 */
export function ReelWall({ limit }: { limit?: number }) {
  const list = limit ? reels.slice(0, limit) : reels;
  const wrap = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = wrap.current;
    if (!root) return;
    const vids = Array.from(root.querySelectorAll('video'));
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            v.play().catch(() => {
              /* autoplay refused — the poster stays, nothing is lost */
            });
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.4 },
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <ul className={s.wall} ref={wrap}>
      {list.map((r) => (
        <li key={r.file} className={s.tile}>
          <div className={s.frame}>
          <video
            className={s.video}
            src={`/video/${r.file}.mp4`}
            poster={`/img/poster-${r.file}.jpg`}
            muted
            loop
            playsInline
            preload="none"
            aria-label={r.caption}
          />
          </div>
          <div className={s.meta}>
            <p className={s.caption}>{r.caption}</p>
            <span className={s.views}>
              {r.views.toLocaleString('en-US')} views · 0:{String(r.seconds).padStart(2, '0')}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

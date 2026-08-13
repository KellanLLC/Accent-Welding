'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

/** Live, and reacts if the user changes the setting mid-session. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(REDUCED).matches ?? false,
    () => false,
  );
}

/**
 * Critically-damped spring on a single number.
 *
 * Used so a drawing physically grows to its new size when you change a
 * dimension, instead of cutting or cross-fading. The value returned on the
 * very first render is the target itself, so the drawing is correct on the
 * first paint and is never blank or waiting on an animation.
 *
 * When the user prefers reduced motion the target passes straight through and
 * the animation loop never starts.
 */
export function useSpringNumber(target: number, stiffness = 170, damping = 24): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(target);
  const state = useRef({ v: target, vel: 0, raf: 0, last: 0 });

  useEffect(() => {
    if (reduced) return;

    const s = state.current;
    s.last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - s.last) / 1000, 1 / 30);
      s.last = now;
      const a = stiffness * (target - s.v) - damping * s.vel;
      s.vel += a * dt;
      s.v += s.vel * dt;

      if (Math.abs(target - s.v) < 0.02 && Math.abs(s.vel) < 0.02) {
        s.v = target;
        s.vel = 0;
        setValue(target);
        return;
      }
      setValue(s.v);
      s.raf = requestAnimationFrame(tick);
    };

    s.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(s.raf);
  }, [target, stiffness, damping, reduced]);

  // Reduced motion resolves to the target directly rather than through state,
  // so there is no setState inside the effect and no cascading render.
  return reduced ? target : value;
}

/** Shade a hex colour by a signed amount, −1 → black, +1 → white. */
export function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  );
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

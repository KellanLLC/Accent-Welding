'use client';

import { useSyncExternalStore } from 'react';

function subscribe(cb: () => void) {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
}

/** Latched state, so the two thresholds below can do their job. */
let past = false;

/**
 * True once the page is scrolled past `threshold`, and false again only once it
 * is back above `release`.
 *
 * Two thresholds rather than one: a single one flips on and off while you nudge
 * the wheel around it, which reads on screen as the bar snapping between its
 * two states instead of settling into one.
 *
 * useSyncExternalStore rather than an effect, so the very first render already
 * knows the real scroll position. That matters on a refresh part-way down the
 * page: the nav is opaque immediately instead of flashing transparent.
 */
export function useScrolled(threshold = 24, release = threshold * 0.4): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      past = window.scrollY > (past ? release : threshold);
      return past;
    },
    () => false,
  );
}

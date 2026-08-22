/**
 * The brand star: the same five-point star that sits on the STRENGTH IN STEEL
 * arc of the lockup (inner radius 0.42), drawn on its own so the rating page
 * and the panel use the lockup's star and not an icon pack's.
 * Coordinates are rounded before they reach the DOM — see the
 * svg-drawing-float-hydration note — so server and client agree.
 */
export function starPoints(cx = 12, cy = 12, r = 11) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

export const STAR_POINTS = starPoints();

export function Star({ size = 24, className }: { size?: number | string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <polygon points={STAR_POINTS} fill="currentColor" />
    </svg>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Spear } from '@/drawings/pickets';
import { DRAW } from '@/drawings/primitives';

/**
 * The drawing band at the fold: a scale elevation of the very fence in the
 * photograph above it — ornamental iron with spear finials, set between cut
 * stone columns on a knee wall (content/facebook/photos/fb-08-mar02.jpg).
 *
 * The photo shows the finished job; the drawing shows how it was set out. That
 * pairing is the idea of the whole site, so it sits at the fold.
 *
 * The lines are fully drawn at rest. The stroke-in only ever runs as an
 * enhancement — if it never fires, nothing is missing.
 */
export function HeroBand() {
  const ref = useRef<SVGSVGElement>(null);
  const [ink, setInk] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInk(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const W = 1600;
  const H = 210;
  const base = 176; // top of knee wall
  const ground = 196;
  const colW = 46;
  const colTop = 58;
  const cols = [40, 400, 760, 1120, 1480];

  const picketTop = 76;
  const railTop = 96;
  const railBot = 168;

  const pieces = [];
  for (let c = 0; c < cols.length - 1; c++) {
    const a = cols[c] + colW / 2;
    const b = cols[c + 1] - colW / 2;
    // top and bottom rails
    pieces.push(
      <rect key={`rt${c}`} x={a} y={railTop} width={b - a} height={7} fill={DRAW.line} opacity={0.9} />,
      <rect key={`rb${c}`} x={a} y={railBot - 7} width={b - a} height={7} fill={DRAW.line} opacity={0.9} />,
    );
    const pitch = 22;
    const n = Math.floor((b - a - 12) / pitch);
    const gap = (b - a) / (n + 1);
    for (let i = 1; i <= n; i++) {
      const x = a + gap * i;
      pieces.push(
        <rect key={`p${c}-${i}`} x={x - 2.4} y={picketTop + 6} width={4.8} height={railBot - picketTop - 6} fill={DRAW.line} opacity={0.86} />,
        <Spear key={`s${c}-${i}`} x={x} y={picketTop + 7} w={4.8} fill={DRAW.line} edge={DRAW.line} />,
      );
    }
  }

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax meet"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-hidden="true"
      focusable="false"
    >
      {/* knee wall, coursed stone — cut-stone columns on a low wall */}
      <g opacity={0.5}>
        <rect x={0} y={base} width={W} height={ground - base} fill="none" stroke={DRAW.line} strokeWidth={1.4} />
        {Array.from({ length: 40 }, (_, i) => (
          <line key={i} x1={i * 41 + 20} y1={base} x2={i * 41 + 20} y2={ground} stroke={DRAW.line} strokeWidth={0.9} opacity={0.55} />
        ))}
      </g>

      {/* ironwork */}
      <g className={ink ? 'inkIn' : undefined} style={{ ['--len' as string]: '2400' }}>
        {pieces}
      </g>

      {/* cut stone columns with a capped top */}
      {cols.map((cx, i) => (
        <g key={i} opacity={0.92}>
          <rect x={cx - colW / 2 - 5} y={colTop} width={colW + 10} height={11} fill="none" stroke={DRAW.line} strokeWidth={1.6} />
          <rect x={cx - colW / 2} y={colTop + 11} width={colW} height={ground - colTop - 11} fill="none" stroke={DRAW.line} strokeWidth={1.6} />
          {[0, 1, 2, 3, 4].map((r) => (
            <line
              key={r}
              x1={cx - colW / 2}
              y1={colTop + 32 + r * 24}
              x2={cx + colW / 2}
              y2={colTop + 32 + r * 24}
              stroke={DRAW.line}
              strokeWidth={0.9}
              opacity={0.6}
            />
          ))}
        </g>
      ))}

      {/* grade */}
      <line x1={0} y1={ground} x2={W} y2={ground} stroke={DRAW.line} strokeWidth={1.6} opacity={0.85} />
      {Array.from({ length: 90 }, (_, i) => (
        <line key={i} x1={i * 18} y1={ground} x2={i * 18 - 9} y2={ground + 9} stroke={DRAW.line} strokeWidth={1} opacity={0.32} />
      ))}
    </svg>
  );
}

import { MARK_OUTLINE, MARK_DETAILS } from './markPaths';

/**
 * The full brand lockup, rebuilt as vector: skull + 20·25 flanked by tapered
 * rules, ACCENT WELDING beneath, and STRENGTH IN STEEL on a downward arc with
 * three stars. Drawn as one SVG so it scales cleanly and can bleed off an edge
 * without the pieces drifting apart.
 */
export function Lockup({
  width = 460,
  tan = '#D5BA8C',
  ink = '#FFFFFF',
  className,
}: {
  width?: number;
  tan?: string;
  ink?: string;
  className?: string;
}) {
  /*
   * The frame, measured off the artwork rather than assumed. The wordmark set
   * at 63 runs 565 units wide and the rocker is a true semicircle bottoming at
   * y = 314, so the lockup occupies x −52.5 → 512.5 and y 0 → 320. This box is
   * that content plus an even 24-unit margin, centred on x = 230 like every
   * other element. Anything tighter shaves the A and the G off the wordmark and
   * cuts the arc through the middle of STRENGTH IN STEEL.
   */
  const VB = { x: -77, y: -24, w: 614, h: 368 };
  return (
    <svg
      className={className}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      width={width}
      height={(width * VB.h) / VB.w}
      role="img"
      aria-label="Accent Welding, Strength in Steel, established 2025"
      focusable="false"
    >
      <defs>
        <path id="aw-arc" d="M92 176 A 138 138 0 0 0 368 176" fill="none" />
      </defs>

      {/* Skull, 20 · 25, tapered rules */}
      <g transform="translate(178 0) scale(1.04)">
        <path d={MARK_OUTLINE} fill={tan} fillRule="evenodd" />
        <g stroke="#000" strokeOpacity={0.32} strokeWidth={0.42} fill="none" strokeLinecap="round">
          {MARK_DETAILS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </g>
      <text
        x="150"
        y="52"
        fill={ink}
        fontFamily="var(--font-display), Georgia, serif"
        fontWeight={700}
        fontSize="34"
        textAnchor="middle"
        dominantBaseline="middle"
        letterSpacing="1"
      >
        20
      </text>
      <text
        x="310"
        y="52"
        fill={ink}
        fontFamily="var(--font-display), Georgia, serif"
        fontWeight={700}
        fontSize="34"
        textAnchor="middle"
        dominantBaseline="middle"
        letterSpacing="1"
      >
        25
      </text>
      <path d="M28 47 L118 51.5 L28 54 Z" fill={tan} />
      <path d="M432 47 L342 51.5 L432 54 Z" fill={tan} />

      {/* Wordmark */}
      <text
        x="230"
        y="126"
        fill={ink}
        fontFamily="var(--font-display), Georgia, serif"
        fontWeight={700}
        fontSize="63"
        textAnchor="middle"
        dominantBaseline="middle"
        letterSpacing="0.5"
      >
        ACCENT WELDING
      </text>

      {/* Arc + stars */}
      <path
        d="M92 176 A 138 138 0 0 0 368 176"
        fill="none"
        stroke={tan}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <text
        fill={ink}
        fontFamily="var(--font-body), system-ui, sans-serif"
        fontWeight={600}
        fontSize="21"
        letterSpacing="5.4"
      >
        <textPath href="#aw-arc" startOffset="50%" textAnchor="middle">
          STRENGTH IN STEEL
        </textPath>
      </text>
      <Star cx={95} cy={196} r={8.4} fill={tan} />
      <Star cx={230} cy={168} r={8.4} fill={tan} />
      <Star cx={365} cy={196} r={8.4} fill={tan} />
    </svg>
  );
}

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return <polygon points={pts.join(' ')} fill={fill} />;
}

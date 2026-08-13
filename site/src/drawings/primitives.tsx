import type { ReactNode } from 'react';

/**
 * Shop-drawing primitives — dimension lines, leaders, hatch, arrowheads.
 *
 * These exist ONLY inside drawing panels, where a technical line is literally
 * true. There is no page-wide grid, no graph paper, and no blueprint texture
 * behind any content on this site.
 */

export const DRAW = {
  line: '#D5BA8C',
  dim: '#9D8964',
  faint: 'rgba(213,186,140,0.20)',
  steel: '#6E6A66',
  steelEdge: '#494643',
  ink: '#1C1A19',
  /** The panel these drawings are read on. Every finish is checked against it. */
  panel: '#211F1E',
  /**
   * The edge of a piece of steel, drawn in the drawing's own light rather than
   * in a darker shade of the finish. A dark outline on a dark panel loses the
   * silhouette exactly where the eye needs it; a lit lip is also what a real
   * edge does, so the geometry reads before the fill does.
   */
  lip: 'rgba(232,213,180,0.42)',
  lipSoft: 'rgba(232,213,180,0.24)',
} as const;

/* ── Finish colours, made readable on a dark panel ───────────────────────── */

function toRgb(hex: string): [number, number, number] {
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
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
}

/**
 * Luminance on a squared gamma rather than the sRGB 2.4 curve.
 *
 * Not an approximation for its own sake: multiplication is exact in IEEE 754
 * and Math.pow is not promised to give the same last bit on every engine, so a
 * fill computed on the server could come back one value different in the
 * browser and React would report a hydration mismatch on a colour nobody can
 * see has changed. The ordering this produces is what the lift below needs.
 */
function lum(hex: string): number {
  const [r, g, b] = toRgb(hex);
  const f = (c: number) => (c / 255) * (c / 255);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: string, b: string): number {
  const x = lum(a);
  const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function toHsl(hex: string): [number, number, number] {
  const [r0, g0, b0] = toRgb(hex);
  const r = r0 / 255;
  const g = g0 / 255;
  const b = b0 / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h /= 6;
  return [h, s, l];
}

function fromHsl(h: number, s: number, l: number): string {
  if (s === 0) return toHex(l * 255, l * 255, l * 255);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    let v = t;
    if (v < 0) v += 1;
    if (v > 1) v -= 1;
    if (v < 1 / 6) return p + (q - p) * 6 * v;
    if (v < 1 / 2) return q;
    if (v < 2 / 3) return p + (q - p) * (2 / 3 - v) * 6;
    return p;
  };
  return toHex(f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255);
}

/** Every drawn finish must clear the panel by at least this much. */
const MIN_CONTRAST = 3;

/**
 * A finish colour is a paint chip; a drawing is a thing you have to be able to
 * read. Black powder coat at its literal #2A2827 is all but invisible on this
 * panel, and a ¾″ picket drawn in it disappears completely — which defeats the
 * entire point of a page that asks you to compare seven picket patterns.
 *
 * So the hue and the saturation of the real finish are kept and only the
 * lightness is raised, and only as far as it takes to clear the panel. Colours
 * that already read — white, bare steel, the wood grains — come back untouched,
 * so nothing is prettified that did not need it, and the finishes stay in their
 * true order: black still sits darker than bare steel, bronze still reads warm.
 */
export function liftForPanel(hex: string, panel: string = DRAW.panel): string {
  if (contrast(hex, panel) >= MIN_CONTRAST) return hex;
  const [h, s, l] = toHsl(hex);
  let lo = l;
  let hi = 1;
  let out = hex;
  // Bisect rather than solve: 20 halvings land inside a byte, and every step
  // is +, −, × and ÷ only, so the server and the client agree exactly.
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const c = fromHsl(h, s, mid);
    if (contrast(c, panel) >= MIN_CONTRAST) {
      hi = mid;
      out = c;
    } else {
      lo = mid;
    }
  }
  return out;
}

export type Steel = {
  /** The body of the section. */
  face: string;
  /** The lit lip along a top or leading edge. */
  lit: string;
  /** The shaded return along a bottom or trailing edge. */
  low: string;
};

/** One finish, resolved into the three tones a drawn section is built from. */
export function steelTones(hex: string): Steel {
  const face = liftForPanel(hex);
  const [h, s, l] = toHsl(face);
  return {
    face,
    lit: fromHsl(h, s, Math.min(1, l + (1 - l) * 0.42)),
    low: fromHsl(h, s, l * 0.62),
  };
}

/** 96 → 8'-0". The way a fabricator actually writes it. */
export function ftIn(inches: number): string {
  const neg = inches < 0;
  const v = Math.abs(Math.round(inches * 16) / 16);
  const ft = Math.floor(v / 12);
  const rem = v - ft * 12;
  const whole = Math.floor(rem);
  const frac = rem - whole;
  const sixteenths = Math.round(frac * 16);
  let fracStr = '';
  if (sixteenths > 0) {
    let n = sixteenths;
    let d = 16;
    while (n % 2 === 0) {
      n /= 2;
      d /= 2;
    }
    fracStr = ` ${n}/${d}`;
  }
  const inPart = `${whole}${fracStr}″`;
  return `${neg ? '−' : ''}${ft}′-${inPart}`;
}

export function Arrow({
  x,
  y,
  dir,
  size = 5,
  color = DRAW.dim,
}: {
  x: number;
  y: number;
  dir: 'l' | 'r' | 'u' | 'd';
  size?: number;
  color?: string;
}) {
  const s = size;
  const w = s * 0.42;
  const pts =
    dir === 'r'
      ? `${x},${y} ${x - s},${y - w} ${x - s},${y + w}`
      : dir === 'l'
        ? `${x},${y} ${x + s},${y - w} ${x + s},${y + w}`
        : dir === 'd'
          ? `${x},${y} ${x - w},${y - s} ${x + w},${y - s}`
          : `${x},${y} ${x - w},${y + s} ${x + w},${y + s}`;
  return <polygon points={pts} fill={color} />;
}

/**
 * Horizontal dimension. The label sits centred on the line with a knockout
 * behind it so the rule never runs through the type — measured from the text
 * length, not guessed.
 */
export function DimH({
  x1,
  x2,
  y,
  label,
  tickTo,
  color = DRAW.dim,
  fontSize = 11,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  /** y of the geometry the extension lines reach back to */
  tickTo?: number;
  color?: string;
  fontSize?: number;
}) {
  const mid = (x1 + x2) / 2;
  const halfW = (label.length * fontSize * 0.5) / 2 + 5;
  const short = Math.abs(x2 - x1) < halfW * 2 + 14;
  return (
    <g>
      {tickTo !== undefined && (
        <>
          <line x1={x1} y1={tickTo} x2={x1} y2={y + (tickTo > y ? 6 : -6)} stroke={color} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.7} />
          <line x1={x2} y1={tickTo} x2={x2} y2={y + (tickTo > y ? 6 : -6)} stroke={color} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.7} />
        </>
      )}
      {short ? (
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={0.9} />
      ) : (
        <>
          <line x1={x1} y1={y} x2={mid - halfW} y2={y} stroke={color} strokeWidth={0.9} />
          <line x1={mid + halfW} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={0.9} />
        </>
      )}
      <Arrow x={x1} y={y} dir="l" color={color} />
      <Arrow x={x2} y={y} dir="r" color={color} />
      <text
        x={mid}
        y={short ? y - fontSize * 0.95 : y}
        textAnchor="middle"
        dominantBaseline="central"
        className="dimText"
        fill={color}
        fontSize={fontSize}
      >
        {label}
      </text>
    </g>
  );
}

/** Vertical dimension. Label is rotated and centred on the line. */
export function DimV({
  y1,
  y2,
  x,
  label,
  tickTo,
  color = DRAW.dim,
  fontSize = 11,
}: {
  y1: number;
  y2: number;
  x: number;
  label: string;
  tickTo?: number;
  color?: string;
  fontSize?: number;
}) {
  const mid = (y1 + y2) / 2;
  const halfH = (label.length * fontSize * 0.5) / 2 + 5;
  const short = Math.abs(y2 - y1) < halfH * 2 + 14;
  return (
    <g>
      {tickTo !== undefined && (
        <>
          <line x1={tickTo} y1={y1} x2={x + (tickTo > x ? 6 : -6)} y2={y1} stroke={color} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.7} />
          <line x1={tickTo} y1={y2} x2={x + (tickTo > x ? 6 : -6)} y2={y2} stroke={color} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.7} />
        </>
      )}
      {short ? (
        <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={0.9} />
      ) : (
        <>
          <line x1={x} y1={y1} x2={x} y2={mid - halfH} stroke={color} strokeWidth={0.9} />
          <line x1={x} y1={mid + halfH} x2={x} y2={y2} stroke={color} strokeWidth={0.9} />
        </>
      )}
      <Arrow x={x} y={y1} dir="u" color={color} />
      <Arrow x={x} y={y2} dir="d" color={color} />
      <text
        x={short ? x - fontSize * 0.95 : x}
        y={mid}
        textAnchor="middle"
        dominantBaseline="central"
        className="dimText"
        fill={color}
        fontSize={fontSize}
        transform={`rotate(-90 ${short ? x - fontSize * 0.95 : x} ${mid})`}
      >
        {label}
      </text>
    </g>
  );
}

/** A callout: a dot on the part, a kinked leader, a label on a shelf. */
export function Leader({
  x,
  y,
  tx,
  ty,
  label,
  anchor = 'start',
  color = DRAW.dim,
  /** The visible [minX, maxX] of the viewBox. Given it, the shelf is clamped so
      the label can never be sliced by the frame — a callout that runs off the
      edge reads as broken, and auto-framed drawings do not start at x = 0. */
  frame,
  fontSize = 11,
}: {
  x: number;
  y: number;
  tx: number;
  ty: number;
  label: string;
  anchor?: 'start' | 'end';
  color?: string;
  frame?: [number, number];
  fontSize?: number;
}) {
  const shelf = anchor === 'start' ? 13 : -13;
  const textW = label.length * fontSize * 0.52;
  let ax = tx;
  if (frame) {
    const [lo, hi] = frame;
    const pad = 5;
    if (anchor === 'start') {
      ax = Math.min(tx, hi - pad - shelf - 5 - textW);
      ax = Math.max(ax, lo + pad);
    } else {
      ax = Math.max(tx, lo + pad - shelf + 5 + textW);
      ax = Math.min(ax, hi - pad);
    }
  }
  return (
    <g>
      <circle cx={x} cy={y} r={2.1} fill={color} />
      <path
        d={`M${x} ${y} L${ax} ${ty} L${ax + shelf} ${ty}`}
        fill="none"
        stroke={color}
        strokeWidth={0.9}
      />
      <text
        x={ax + shelf + (anchor === 'start' ? 5 : -5)}
        y={ty}
        textAnchor={anchor}
        dominantBaseline="central"
        className="dimText"
        fill={color}
        fontSize={fontSize}
      >
        {label}
      </text>
    </g>
  );
}

/**
 * Fixed precision on every coordinate that reaches the DOM.
 *
 * Not cosmetic: Math.cos and Math.sin are allowed to disagree in the last bit
 * between V8 builds, so a raw float written on the server can come back a
 * fraction different on the client and React reports a hydration mismatch on a
 * line nobody can see has moved. Two decimals is far finer than a pixel and
 * identical on both sides.
 */
export const px = (v: number) => v.toFixed(2);
const n2 = px;

/** An arrowhead pointing along (dx, dy), tip at (x, y). */
function Head({
  x,
  y,
  dx,
  dy,
  color = DRAW.dim,
  size = 5.4,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color?: string;
  size?: number;
}) {
  const w = size * 0.4;
  const bx = x - dx * size;
  const by = y - dy * size;
  const px = -dy * w;
  const py = dx * w;
  return (
    <polygon
      points={`${n2(x)},${n2(y)} ${n2(bx + px)},${n2(by + py)} ${n2(bx - px)},${n2(by - py)}`}
      fill={color}
    />
  );
}

/**
 * A dimension that lies in one of a drawing's own axonometric planes.
 *
 * Both the dimension line and its witness lines run PARALLEL to the edge being
 * measured, and the whole assembly is pushed clear of the solid along `off`.
 * That is the difference between an axonometric that reads as drafted and one
 * that reads as broken: a dimension must never cross the object it measures,
 * and a horizontal rule under a receding edge measures the projection rather
 * than the steel.
 *
 * Font size is set inline because `.dimText` carries one in CSS, and a
 * presentation attribute would lose to it.
 */
export function AxoDim({
  ax,
  ay,
  bx,
  by,
  offX,
  offY,
  label,
  color = DRAW.dim,
  fontSize = 11,
  gap = 7,
  over = 7,
}: {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  /** Screen-space vector from the measured edge out to the dimension line. */
  offX: number;
  offY: number;
  label: string;
  color?: string;
  fontSize?: number;
  /** Clear space left between the object and the start of the witness line. */
  gap?: number;
  /** How far the witness line runs past the dimension line. */
  over?: number;
}) {
  const oLen = Math.hypot(offX, offY) || 1;
  const ux = offX / oLen;
  const uy = offY / oLen;

  const a2x = ax + offX;
  const a2y = ay + offY;
  const b2x = bx + offX;
  const b2y = by + offY;

  const len = Math.hypot(b2x - a2x, b2y - a2y) || 1;
  const dx = (b2x - a2x) / len;
  const dy = (b2y - a2y) / len;

  // Keep the label the right way up whichever way the edge runs.
  let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (deg > 90) deg -= 180;
  if (deg < -90) deg += 180;

  const halfW = (label.length * fontSize * 0.52) / 2 + 5;
  const short = len < halfW * 2 + 16;
  const mx = (a2x + b2x) / 2;
  const my = (a2y + b2y) / 2;
  // Too short to break the line for the label, so the label steps outward.
  const tx = short ? mx + ux * fontSize * 0.95 : mx;
  const ty = short ? my + uy * fontSize * 0.95 : my;

  const rule = (x1: number, y1: number, x2: number, y2: number) => (
    <line x1={n2(x1)} y1={n2(y1)} x2={n2(x2)} y2={n2(y2)} stroke={color} strokeWidth={0.9} />
  );
  const witness = (x: number, y: number) => (
    <line
      x1={n2(x + ux * gap)}
      y1={n2(y + uy * gap)}
      x2={n2(x + ux * (oLen + over))}
      y2={n2(y + uy * (oLen + over))}
      stroke={color}
      strokeWidth={0.8}
      strokeDasharray="3 3"
      opacity={0.6}
    />
  );

  return (
    <g>
      {witness(ax, ay)}
      {witness(bx, by)}
      {short ? (
        rule(a2x, a2y, b2x, b2y)
      ) : (
        <>
          {rule(a2x, a2y, mx - dx * halfW, my - dy * halfW)}
          {rule(mx + dx * halfW, my + dy * halfW, b2x, b2y)}
        </>
      )}
      <Head x={a2x} y={a2y} dx={-dx} dy={-dy} color={color} />
      <Head x={b2x} y={b2y} dx={dx} dy={dy} color={color} />
      <text
        x={n2(tx)}
        y={n2(ty)}
        textAnchor="middle"
        dominantBaseline="central"
        className="dimText"
        fill={color}
        style={{ fontSize }}
        transform={`rotate(${n2(deg)} ${n2(tx)} ${n2(ty)})`}
      >
        {label}
      </text>
    </g>
  );
}

/** Ground line with hatching below — the drawing convention for grade. */
export function Grade({
  x1,
  x2,
  y,
  color = DRAW.faint,
}: {
  x1: number;
  x2: number;
  y: number;
  color?: string;
}) {
  const ticks: ReactNode[] = [];
  for (let x = x1; x < x2; x += 9) {
    ticks.push(<line key={x} x1={x} y1={y} x2={x - 6} y2={y + 6} stroke={color} strokeWidth={0.9} />);
  }
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={DRAW.dim} strokeWidth={1.2} opacity={0.75} />
      {ticks}
    </g>
  );
}

/**
 * A flight of concrete steps drawn in section: the stepped walking surface as a
 * solid line, and under it the real mass of the stair — a slab at each landing
 * and a waist raking under the flight itself.
 *
 * Drawing the steps as mass, rather than leaving a raked rail hanging over a
 * flat ground line, is the whole difference between a stair and a fence that
 * has fallen over. Both polylines are read left to right and both should run
 * past the frame, so the section is cut by the sheet rather than stopping in
 * mid-air.
 */
export function StairSection({
  pts,
  soffit,
  id,
  color = DRAW.dim,
}: {
  /** The walking surface: nosing, tread, nosing, tread. */
  pts: [number, number][];
  /** The underside, same direction. */
  soffit: [number, number][];
  /** The DrawingDefs id this drawing was rendered with, for the hatch. */
  id: string;
  color?: string;
}) {
  const poly = (ps: [number, number][]) => ps.map((p) => `L${n2(p[0])} ${n2(p[1])}`).join(' ');
  const surface = `M${n2(pts[0][0])} ${n2(pts[0][1])} ${poly(pts.slice(1))}`;
  const body = `${surface} ${poly([...soffit].reverse())} Z`;
  return (
    <g>
      <path d={body} fill="rgba(0,0,0,0.4)" />
      <path d={body} fill={`url(#${id}-hatch)`} />
      <path d={body} fill="none" stroke={color} strokeWidth={0.9} strokeLinejoin="round" opacity={0.45} />
      <path d={surface} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" opacity={0.85} />
    </g>
  );
}

/**
 * The drafting mark for "and it carries on past here". Drawn as a vertical
 * zig, sized to the run it cuts, so it never has to be hand-tuned per drawing.
 */
export function BreakLine({
  x,
  y1,
  y2,
  color = DRAW.dim,
}: {
  x: number;
  y1: number;
  y2: number;
  color?: string;
}) {
  const mid = (y1 + y2) / 2;
  const k = Math.min(9, Math.abs(y2 - y1) / 7);
  const d = `M${n2(x)} ${n2(y1)} L${n2(x)} ${n2(mid - k * 1.5)} L${n2(x - k)} ${n2(mid - k * 0.6)} L${n2(x + k)} ${n2(mid + k * 0.6)} L${n2(x - k)} ${n2(mid + k * 1.5)} L${n2(x)} ${n2(mid + k * 2.2)} L${n2(x)} ${n2(y2)}`;
  return (
    <g>
      {/* the cut itself, so the mark reads through steel rather than over it */}
      <path d={d} fill="none" stroke={DRAW.ink} strokeWidth={3.6} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={1} strokeLinejoin="round" opacity={0.85} />
    </g>
  );
}

/** Reusable defs: hatch fills and the steel gradient. */
export function DrawingDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke={DRAW.faint} strokeWidth="1.1" />
      </pattern>
      <linearGradient id={`${id}-round`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
        <stop offset="38%" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
      </linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
        <stop offset="45%" stopColor="#ffffff" stopOpacity="0.02" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
      </linearGradient>
    </defs>
  );
}

/**
 * Fit a viewBox to the geometry that is actually drawn.
 *
 * Elevations change shape a lot: a 34″ rail over two bays is long and low, a
 * 6 ft privacy panel is nearly square. A fixed viewBox leaves one of them
 * stranded in a sea of empty panel. This crops to the real extents, then pads
 * the short axis so the drawing sits centred at a consistent proportion.
 */
export function fitBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  aspect = 1.85,
): [number, number, number, number] {
  let w = Math.max(1, x1 - x0);
  let h = Math.max(1, y1 - y0);
  const cx = x0 + w / 2;
  const cy = y0 + h / 2;
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;
  return [cx - w / 2, cy - h / 2, w, h];
}

/**
 * The same box as a viewBox string. Anything that has to reach the very edge of
 * the frame — a ground line, a section running off the sheet — should take the
 * numbers from `fitBox` instead, because the padding this adds is exactly the
 * gap such a line would otherwise stop short of.
 */
export function fitViewBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  aspect = 1.85,
): string {
  const [x, y, w, h] = fitBox(x0, y0, x1, y1, aspect);
  return `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
}

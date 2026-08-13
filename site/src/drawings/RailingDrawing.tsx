'use client';

import { useId, type ReactNode } from 'react';
import {
  BreakLine,
  DimH,
  DimV,
  DrawingDefs,
  Grade,
  Leader,
  StairSection,
  DRAW,
  ftIn,
  fitBox,
  px,
  steelTones,
  type Steel,
} from './primitives';
import { picketRenderers, picketWidths } from './pickets';
import type { PicketId, RailingStyleId, RailingMountId } from '@/config/products';
import { useSpringNumber } from '@/lib/useSpringNumber';

/**
 * Railing — elevation, drawn to scale.
 *
 * Everything below is set out in INCHES and multiplied by `S` at the last
 * moment, so the code reads the way a fabricator would say it and the drawing
 * is dimensionally true rather than eyeballed.
 *
 * A level run and a stair run are the same drawing with a different slope on
 * two guide lines, which is why one set of code draws both: pickets stay plumb,
 * rails stay parallel to the line they follow, and the guard on a stair is set
 * out from the nosing line, which is where its height is actually measured.
 */

const S = 5; // px per inch
const BAY = 72; // 6'-0" post spacing
const POST = 2; // 2" square post
const RAIL = 1.5; // 1 × 1½" rectangular tube
const PICK = 0.75; // ¾" picket
const HBAR = RAIL; // horizontal picket: 1½" square tube, the same section as the frame
const CLEAR = 4; // maximum clear opening between pickets
const DECO_CLEAR = 2.4; // clear space left between one ornament and the next
const PAIR = 1.6; // clear gap between a doubled pair of rails
const BAND = 6; // welded wire: the short-picket band held between the paired top rails
const BAND_PICK = 1; // and the bar those short pickets are made from
const BAND_OC = 6.5; // set out wide — the mesh below is what does the guarding
const TOE = 3; // gap under the bottom rail on a level run
const NOSE_TOE = 4; // and above the nosing line on a stair, where the code is tighter
const RISE = 7; // stair riser
const TREAD = 11; // stair tread
const RISERS = 7;

/** An affine guide line: y = y0 + (x − x0)·m. */
type Guide = { x0: number; y0: number; m: number };
const at = (g: Guide, x: number) => g.y0 + (x - g.x0) * g.m;
const below = (g: Guide, inches: number): Guide => ({ ...g, y0: g.y0 + inches * S });

const mountNames: Record<RailingMountId, string> = {
  coreDrill: 'core-drilled',
  basePlate: 'base plate',
  fascia: 'fascia fixed',
};

/* ── Pieces of steel ─────────────────────────────────────────────────────── */

/**
 * A rail following a guide line.
 *
 * Thickness is taken square to the rail, so a raked rail is drawn slightly
 * deeper in elevation exactly as its real cut section would be. Math.sqrt is
 * correctly rounded under IEEE 754, so this stays identical between the server
 * and the browser where a trig call would not.
 */
function railRun(g: Guide, xA: number, xB: number, tone: Steel, k: string, thick = RAIL) {
  const t = thick * S * Math.sqrt(1 + g.m * g.m);
  const yA = at(g, xA);
  const yB = at(g, xB);
  return (
    <g key={k}>
      <path
        d={`M${px(xA)} ${px(yA)} L${px(xB)} ${px(yB)} L${px(xB)} ${px(yB + t)} L${px(xA)} ${px(yA + t)} Z`}
        fill={tone.face}
        stroke={DRAW.lip}
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
      <path
        d={`M${px(xA)} ${px(yA)} L${px(xB)} ${px(yB)} L${px(xB)} ${px(yB + t * 0.3)} L${px(xA)} ${px(yA + t * 0.3)} Z`}
        fill={tone.lit}
        opacity={0.55}
      />
    </g>
  );
}

/** A plumb post, from its cap down to whatever it stands on. */
function postRun(x: number, yTop: number, yBase: number, tone: Steel, k: string) {
  const w = POST * S;
  const h = yBase - yTop;
  return (
    <g key={k}>
      <rect x={px(x - w / 2)} y={px(yTop)} width={px(w)} height={px(h)} fill={tone.face} stroke={DRAW.lip} strokeWidth={0.6} />
      <rect x={px(x - w / 2)} y={px(yTop)} width={px(w * 0.3)} height={px(h)} fill={tone.lit} opacity={0.5} />
      <rect x={px(x + w * 0.26)} y={px(yTop)} width={px(w * 0.24)} height={px(h)} fill={tone.low} opacity={0.55} />
    </g>
  );
}

/**
 * How a post is held down. Work below the finished surface is drawn as a hidden
 * line, which is both the drafting convention for it and the honest answer to
 * "why is that post going through the floor" in the drawing this replaces.
 */
function mountDetail(x: number, base: number, mount: RailingMountId, tone: Steel, k: string) {
  const w = POST * S;
  const hidden = { fill: 'none', stroke: DRAW.lipSoft, strokeWidth: 0.9, strokeDasharray: '4 3' } as const;

  if (mount === 'basePlate') {
    return (
      <g key={k}>
        <rect
          x={px(x - w * 1.5)}
          y={px(base - 0.3 * S)}
          width={px(w * 3)}
          height={px(0.3 * S)}
          fill={tone.face}
          stroke={DRAW.lip}
          strokeWidth={0.5}
        />
        {[-1, 1].map((d) => (
          <line
            key={d}
            x1={px(x + d * w * 1.05)}
            y1={px(base)}
            x2={px(x + d * w * 1.05)}
            y2={px(base + 3.5 * S)}
            stroke={DRAW.lipSoft}
            strokeWidth={1}
            strokeDasharray="3 2.5"
          />
        ))}
      </g>
    );
  }

  if (mount === 'fascia') {
    return (
      <g key={k}>
        <rect x={px(x - w / 2)} y={px(base)} width={px(w)} height={px(7 * S)} {...hidden} />
        {[2.2, 5].map((d) => (
          <circle key={d} cx={px(x)} cy={px(base + d * S)} r={px(0.45 * S)} fill="none" stroke={DRAW.lipSoft} strokeWidth={0.9} />
        ))}
      </g>
    );
  }

  return (
    <g key={k}>
      <rect x={px(x - w * 0.85)} y={px(base)} width={px(w * 1.7)} height={px(1.2 * S)} {...hidden} />
      <rect x={px(x - w / 2)} y={px(base)} width={px(w)} height={px(5 * S)} {...hidden} />
    </g>
  );
}

/* ── Infill ──────────────────────────────────────────────────────────────── */

/** Picket centres at a constant spacing, so the clear opening comes out legal. */
function picketsAcross(x1: number, x2: number, oc: number): number[] {
  const span = x2 - x1;
  const n = Math.max(0, Math.ceil(span / (oc * S)) - 1);
  const gap = span / (n + 1);
  const out: number[] = [];
  for (let i = 1; i <= n; i++) out.push(x1 + gap * i);
  return out;
}

/**
 * One bay of infill, hung between the underside of the top rail and the top of
 * the bottom rail. Both arrive as guide lines, so this is the same code on the
 * flat and on the rake.
 */
function infill({
  style,
  picket,
  x1,
  x2,
  top,
  bot,
  band,
  tone,
  k,
}: {
  style: RailingStyleId;
  picket: PicketId;
  x1: number;
  x2: number;
  top: Guide;
  bot: Guide;
  /** The clear space held between a doubled top rail, where it carries infill
      of its own rather than being a plain 1½″ gap. */
  band?: { top: Guide; bot: Guide };
  tone: Steel;
  k: string;
}): ReactNode[] {
  if (x2 - x1 < 6) return [];
  const out: ReactNode[] = [];
  const depth = (at(bot, x1) - at(top, x1)) / S; // inches; the guides are parallel

  if (style === 'horizontal') {
    /*
     * Bars laid flat, set out the way the run in the shop's own photograph is:
     * every clear opening the same, the two against the rails included. Spacing
     * them across the frame's own faces — rather than from the first bar's top
     * to the last bar's bottom, which pushed one hard against each rail and
     * welded it into the frame as a single 3″ mass — is what leaves that gap.
     *
     * The bar count follows the depth, so the opening lands as close under 4″ as
     * a whole number of bars allows, at 34″ and at 42″ alike. Because a bar is
     * the same section as the rail, both are drawn the same amount deeper on a
     * rake, and every gap comes out equal there too rather than only on the flat.
     */
    const n = Math.max(1, Math.ceil((depth - CLEAR) / (HBAR + CLEAR)));
    const gap = (depth - n * HBAR) / (n + 1);
    if (gap <= 0) return out;
    for (let i = 0; i < n; i++) {
      out.push(railRun(below(top, gap + i * (HBAR + gap)), x1, x2, tone, `${k}h${i}`, HBAR));
    }
    return out;
  }

  if (style === 'weldedWire') {
    /*
     * Built the way the shop's own flyer photograph shows it: a top rail, then
     * a shallow band of short pickets, then the second rail of the pair, and
     * welded mesh filling the whole panel below. The short pickets are the
     * decorative band between the doubled top rail — not a fringe standing on
     * the bottom rail, and not pickets laid over the mesh.
     */
    if (band) {
      for (const x of picketsAcross(x1, x2, BAND_OC)) {
        out.push(
          <rect
            key={`${k}wp${Math.round(x)}`}
            x={px(x - (BAND_PICK * S) / 2)}
            y={px(at(band.top, x))}
            width={px(BAND_PICK * S)}
            height={px(at(band.bot, x) - at(band.top, x))}
            fill={tone.face}
            stroke={DRAW.lip}
            strokeWidth={0.5}
          />,
        );
      }
    }

    const wire = 2; // 2 × 2" welded mesh
    const meshTop = below(top, 0.4);
    // Horizontals first, then the verticals over them: on the real mesh the
    // vertical wires are welded on the face, which is why they catch the light.
    for (let d = wire; d < depth - 0.4; d += wire) {
      const g = below(meshTop, d);
      out.push(
        <line key={`${k}wh${d}`} x1={px(x1)} y1={px(at(g, x1))} x2={px(x2)} y2={px(at(g, x2))} stroke={tone.low} strokeWidth={1} />,
      );
    }
    for (let x = x1 + wire * S * 0.5; x < x2 - 1; x += wire * S) {
      out.push(
        <line
          key={`${k}wv${Math.round(x)}`}
          x1={px(x)}
          y1={px(at(meshTop, x))}
          x2={px(x)}
          y2={px(at(bot, x))}
          stroke={tone.face}
          strokeWidth={1}
        />,
      );
    }
    return out;
  }

  const deco = style === 'customPicket';
  const draw = picketRenderers[deco ? picket : 'plainSquare'];
  // Set out from the ornament's own width, so whichever picket is chosen its
  // ornaments come out with real space between them rather than touching.
  const oc = deco ? Math.max(CLEAR + PICK, picketWidths[picket] + DECO_CLEAR) : CLEAR + PICK;
  for (const x of picketsAcross(x1, x2, oc)) {
    out.push(
      <g key={`${k}p${Math.round(x)}`}>
        {draw({ x, yTop: at(top, x), yBot: at(bot, x), w: PICK * S, fill: tone.face, edge: DRAW.lip })}
      </g>,
    );
  }
  return out;
}

/* ── The drawing ─────────────────────────────────────────────────────────── */

export function RailingDrawing({
  style,
  picket,
  heightIn,
  color,
  mount,
  raked,
  aspect = 1.62,
}: {
  style: RailingStyleId;
  picket: PicketId;
  heightIn: number;
  color: string;
  mount: RailingMountId;
  raked: boolean;
  /** Proportion of the panel this drawing is read in. Cards that sit in one row
      are given the same value, so their drawing panels come out the same
      height and the row cannot go ragged. */
  aspect?: number;
}) {
  const H = useSpringNumber(heightIn);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const tone = steelTones(color);
  const double = style === 'doubleRail';
  const twinTop = double || style === 'weldedWire';

  /**
   * The rails of one run, plus the two guide lines its infill hangs between.
   * `sole` is the drop in inches from the top of the top rail to the underside
   * of the lowest rail, which is the one number that changes between a level
   * run, a raked run and the level return onto a landing.
   */
  const frame = (top: Guide, xA: number, xB: number, sole: number, k: string) => {
    const rails: ReactNode[] = [railRun(top, xA, xB, tone, `${k}t`)];
    let tOff = RAIL;
    let band: { top: Guide; bot: Guide } | undefined;
    if (twinTop) {
      // Welded wire holds a short-picket band between its paired top rails; a
      // double-rail run just leaves a plain gap.
      const gap = style === 'weldedWire' ? BAND : PAIR;
      rails.push(railRun(below(top, RAIL + gap), xA, xB, tone, `${k}t2`));
      band = { top: below(top, RAIL), bot: below(top, RAIL + gap) };
      tOff = 2 * RAIL + gap;
    }
    rails.push(railRun(below(top, sole - RAIL), xA, xB, tone, `${k}b`));
    let bOff = sole - RAIL;
    if (double) {
      rails.push(railRun(below(top, sole - 2 * RAIL - PAIR), xA, xB, tone, `${k}b2`));
      bOff = sole - 2 * RAIL - PAIR;
    }
    return { rails, band, infillTop: below(top, tOff), infillBot: below(top, bOff) };
  };

  let body: ReactNode;
  let notes: ReactNode;
  let vb: string;

  if (!raked) {
    /* ── Level run: one full bay, then the run carries on past the last post ── */
    const grade = 320;
    const xL = 80;
    const xR = xL + BAY * S;
    const xEnd = xR + 22 * S;
    const top: Guide = { x0: xL, y0: grade - H * S, m: 0 };
    const railA = xL - (POST * S) / 2;

    const { rails, band, infillTop, infillBot } = frame(top, railA, xEnd, H - TOE, 'r');

    const posts: ReactNode[] = [];
    [xL, xR].forEach((x, i) => {
      posts.push(postRun(x, at(top, x) - 0.5 * S, grade, tone, `po${i}`));
      posts.push(mountDetail(x, grade, mount, tone, `mo${i}`));
    });

    const bays = [
      [xL + (POST * S) / 2, xR - (POST * S) / 2],
      [xR + (POST * S) / 2, xEnd],
    ];

    body = (
      <>
        {posts}
        {bays.map(([a, b], i) => infill({ style, picket, x1: a, x2: b, top: infillTop, bot: infillBot, band, tone, k: `b${i}` }))}
        {rails}
      </>
    );

    const dimX = xL - 7 * S;
    const [vx, vy, vw, vh] = fitBox(dimX - 4.5 * S, at(top, xL) - 9 * S, xEnd + 4 * S, grade + 15.5 * S, aspect);
    vb = `${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`;
    const lo = vx + 3 * S;
    const hi = vx + vw - 3 * S;

    notes = (
      <>
        <Grade x1={vx} y={grade} x2={vx + vw} />
        <BreakLine x={xEnd} y1={at(top, xEnd) - 2 * S} y2={grade + 1.4 * S} />
        <DimV y1={at(top, xL)} y2={grade} x={dimX} label={`${Math.round(H)}″`} tickTo={railA} />
        <DimH x1={xL} x2={xR} y={grade + 7 * S} label={`${ftIn(BAY)} O.C.`} tickTo={grade} />
        <Leader
          x={xR}
          y={at(top, xR) + 1.4 * S}
          tx={xR + 5 * S}
          ty={at(top, xR) - 6 * S}
          label={`${POST}″ post`}
          anchor="start"
          frame={[lo, hi]}
        />
        <Leader
          x={xL}
          y={grade + 1.4 * S}
          tx={xL - 4 * S}
          ty={grade + 11.5 * S}
          label={mountNames[mount]}
          anchor="end"
          frame={[lo, hi]}
        />
      </>
    );
  } else {
    /* ── Stair run: a real flight in section, posts plumb on the treads, and a
          guard raking parallel to the nosing line it is measured from ── */
    const floor = 500;
    const xF = 190; // face of the first riser
    const X = (inches: number) => xF + inches * S;
    const Y = (inches: number) => floor - inches * S;
    const HEAD = RISERS * TREAD; // where the flight meets the upper landing

    /** Through every nosing — the line a stair guard's height is measured from. */
    const nosing: Guide = { x0: X(0), y0: Y(RISE), m: -RISE / TREAD };
    const top = below(nosing, -H);

    const pFoot = X(-4);
    const pMid = X(Math.round(RISERS / 2) * TREAD - TREAD / 2);
    const pHead = X((RISERS - 1) * TREAD + 4);
    /** The tread a plumb post at this x lands on. */
    const baseOf = (x: number) => {
      if (x < X(0)) return Y(0);
      return Y(Math.min(RISERS, Math.floor((x - X(0)) / (TREAD * S)) + 1) * RISE);
    };

    const railA = pFoot - (POST * S) / 2;
    const { rails, band, infillTop, infillBot } = frame(top, railA, pHead, H - NOSE_TOE, 'r');

    // At the head newel the guard turns level and carries on along the landing,
    // springing from the newel top rather than kinking part way along.
    const flat: Guide = { x0: pHead, y0: at(top, pHead), m: 0 };
    const xEnd = pHead + 21 * S;
    const landingH = (Y(RISERS * RISE) - at(flat, pHead)) / S;
    const landing = frame(flat, pHead, xEnd, landingH - TOE, 'l');

    const posts: ReactNode[] = [];
    [pFoot, pMid, pHead].forEach((x, i) => {
      posts.push(postRun(x, at(top, x) - 0.5 * S, baseOf(x), tone, `sp${i}`));
      posts.push(mountDetail(x, baseOf(x), mount, tone, `sm${i}`));
    });

    type Bay = [number, number, Guide, Guide, { top: Guide; bot: Guide } | undefined];
    const bays: Bay[] = [
      [pFoot + (POST * S) / 2, pMid - (POST * S) / 2, infillTop, infillBot, band],
      [pMid + (POST * S) / 2, pHead - (POST * S) / 2, infillTop, infillBot, band],
      [pHead + (POST * S) / 2, xEnd, landing.infillTop, landing.infillBot, landing.band],
    ];

    const dimX = pFoot - 5 * S;
    const cx0 = X(-11); // where the nosing line, run back, meets the lower floor
    const [vx, vy, vw, vh] = fitBox(dimX - 4 * S, at(top, xEnd) - 8 * S, xEnd + 4 * S, floor + 16 * S, aspect);
    vb = `${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`;
    const lo = vx + 3 * S;
    const hi = vx + vw - 3 * S;

    // The walking surface, and the mass under it: a slab at each landing and a
    // waist raking under the flight. Both run past the frame so the section is
    // cut by the sheet rather than stopping in mid-air.
    const SLAB = 9;
    const WAIST = 12;
    const surface: [number, number][] = [[vx, Y(0)]];
    for (let k = 1; k <= RISERS; k++) {
      surface.push([X((k - 1) * TREAD), Y((k - 1) * RISE)]);
      surface.push([X((k - 1) * TREAD), Y(k * RISE)]);
      surface.push([X(k * TREAD), Y(k * RISE)]);
    }
    surface.push([vx + vw, Y(RISERS * RISE)]);
    const soffit: [number, number][] = [
      [vx, Y(-SLAB)],
      [X(0), Y(-SLAB)],
      [X(0), at(nosing, X(0)) + WAIST * S],
      [X(HEAD - TREAD), at(nosing, X(HEAD - TREAD)) + WAIST * S],
      [X(HEAD), Y(RISERS * RISE - SLAB)],
      [vx + vw, Y(RISERS * RISE - SLAB)],
    ];

    body = (
      <>
        <StairSection pts={surface} soffit={soffit} id={uid} />
        {posts}
        {bays.map(([a, b, t, bt, bd], i) => infill({ style, picket, x1: a, x2: b, top: t, bot: bt, band: bd, tone, k: `s${i}` }))}
        {rails}
        {landing.rails}
      </>
    );

    notes = (
      <>
        {/* the nosing line and the top of rail, drawn as the construction lines
            the 36″ dimension is actually taken between */}
        <line
          x1={px(cx0)}
          y1={px(at(nosing, cx0))}
          x2={px(X((RISERS - 1) * TREAD))}
          y2={px(Y(RISERS * RISE))}
          stroke={DRAW.dim}
          strokeWidth={0.9}
          strokeDasharray="12 4 2 4"
          opacity={0.62}
        />
        <line
          x1={px(cx0)}
          y1={px(at(top, cx0))}
          x2={px(railA)}
          y2={px(at(top, railA))}
          stroke={DRAW.dim}
          strokeWidth={0.9}
          strokeDasharray="12 4 2 4"
          opacity={0.62}
        />
        <BreakLine x={xEnd} y1={at(flat, xEnd) - 2 * S} y2={Y(RISERS * RISE) - 1.5 * S} />
        <DimV y1={at(top, dimX)} y2={at(nosing, dimX)} x={dimX} label={`${Math.round(H)}″`} />
        <Leader
          x={pHead}
          y={at(top, pHead) + 1.4 * S}
          tx={pHead + 5 * S}
          ty={at(top, pHead) - 6 * S}
          label={`${POST}″ post`}
          anchor="start"
          frame={[lo, hi]}
        />
        <Leader
          x={pFoot}
          y={Y(0) + 1.4 * S}
          tx={pFoot - 3 * S}
          ty={floor + 11.5 * S}
          label={mountNames[mount]}
          anchor="end"
          frame={[lo, hi]}
        />
        <Leader
          x={X(0)}
          y={Y(RISE / 2)}
          tx={X(5)}
          ty={floor + 11.5 * S}
          label={`${RISE}″ rise · ${TREAD}″ run`}
          anchor="start"
          frame={[lo, hi]}
        />
      </>
    );
  }

  return (
    <svg
      viewBox={vb}
      className="drawSurface"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label={
        raked
          ? `Scale elevation of a stair railing, ${Math.round(heightIn)} inches above the nosing line`
          : `Scale elevation of a ${Math.round(heightIn)} inch ${style} railing`
      }
    >
      <DrawingDefs id={uid} />
      {body}
      {notes}
    </svg>
  );
}

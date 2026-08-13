'use client';

import { useId, type ReactNode } from 'react';
import { DimH, DimV, DrawingDefs, Grade, Leader, DRAW, ftIn, fitViewBox, liftForPanel } from './primitives';
import { Spear } from './pickets';
import type { FenceTypeId, GateUseId, GateHardwareId } from '@/config/products';
import { woodGrains, type WoodGrainId } from '@/config/products';
import { shade, useSpringNumber } from '@/lib/useSpringNumber';

/**
 * Gate — elevation to scale. Leaf count, infill style, hinges, latch and drop
 * rod all follow the configuration, so what is drawn is what gets welded.
 */
export function GateDrawing({
  use,
  widthFt,
  heightFt,
  style,
  color,
  woodGrain,
  hardware,
}: {
  use: GateUseId;
  widthFt: number;
  heightFt: number;
  style: FenceTypeId;
  color: string;
  woodGrain?: WoodGrainId;
  hardware: GateHardwareId[];
}) {
  const Wft = useSpringNumber(widthFt);
  const Hft = useSpringNumber(heightFt);
  /* Several of these are rendered on one page, so the defs this drawing
     references have to be its own rather than a literal every copy shares. */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const VW = 640;
  const grade = 322;

  // Scale to fit the widest configuration in frame with a dimension gutter.
  const s = Math.min(2.55, 420 / (Wft * 12));
  const gw = Wft * 12 * s;
  const gh = Hft * 12 * s;
  const cx = VW / 2 + 12;
  const x1 = cx - gw / 2;
  const x2 = cx + gw / 2;
  const yTop = grade - gh;

  const postW = 3.5 * s;
  const frameT = 2 * s;
  const leaves = use === 'double' ? 2 : 1;

  const grain = woodGrain ? woodGrains.find((g) => g.id === woodGrain) : undefined;
  // Steel is lifted clear of the drawing panel before it is drawn; a wood grain
  // already reads and comes back untouched. The welded frame, the posts and the
  // hardware are steel whatever the infill is, so they take their colour from
  // the finish rather than from the planks they happen to be holding.
  const steel = liftForPanel(color);
  const fill = grain ? grain.hex : steel;
  const gEdge = grain ? grain.grain : DRAW.lip;
  const light = shade(fill, 0.16);
  const frameFill = shade(steel, 0.12);
  const dark = shade(steel, -0.26);

  const parts: ReactNode[] = [];

  for (let l = 0; l < leaves; l++) {
    const lw = gw / leaves;
    const lx1 = x1 + l * lw + (leaves > 1 && l === 1 ? 2 : 0);
    const lx2 = lx1 + lw - (leaves > 1 ? 2 : 0);
    const ix1 = lx1 + frameT;
    const ix2 = lx2 - frameT;
    const iy1 = yTop + frameT;
    const iy2 = grade - frameT - 4;
    /** A single leaf hangs on the left; a pair hangs off its own outer post. */
    const hingeLeft = leaves === 1 || l === 0;

    // infill
    if (style === 'privacy') {
      const planks = Math.max(5, Math.round(gh / 16));
      const ph = (iy2 - iy1) / planks;
      for (let i = 0; i < planks; i++) {
        parts.push(
          <g key={`gp${l}-${i}`}>
            <rect x={ix1} y={iy1 + i * ph} width={ix2 - ix1} height={ph - 1} fill={i % 2 ? fill : light} stroke={gEdge} strokeWidth={0.4} />
            <path
              d={`M${ix1 + 4} ${iy1 + i * ph + ph * 0.4} Q${(ix1 + ix2) / 2} ${iy1 + i * ph + ph * (0.22 + (i % 3) * 0.1)} ${ix2 - 4} ${iy1 + i * ph + ph * 0.44}`}
              fill="none"
              stroke={gEdge}
              strokeWidth={0.65}
              opacity={0.5}
            />
          </g>,
        );
      }
    } else if (style === 'slat') {
      const n = Math.max(6, Math.round(gh / 18));
      const pitch = (iy2 - iy1) / n;
      for (let i = 0; i < n; i++) {
        parts.push(<rect key={`gs${l}-${i}`} x={ix1} y={iy1 + i * pitch} width={ix2 - ix1} height={pitch * 0.7} fill={i % 2 ? fill : light} stroke={gEdge} strokeWidth={0.4} />);
      }
    } else if (style === 'pasture' || style === 'pipe') {
      const n = style === 'pipe' ? 5 : 4;
      for (let i = 0; i < n; i++) {
        const py = iy1 + (i / (n - 1)) * (iy2 - iy1 - 8);
        parts.push(
          <g key={`gr${l}-${i}`}>
            <rect x={ix1} y={py} width={ix2 - ix1} height={style === 'pipe' ? 5 : 7} fill={fill} stroke={gEdge} strokeWidth={0.45} rx={style === 'pipe' ? 2.5 : 0} />
            <rect x={ix1} y={py} width={ix2 - ix1} height={style === 'pipe' ? 5 : 7} fill={`url(#${uid}-round)`} rx={style === 'pipe' ? 2.5 : 0} />
          </g>,
        );
      }
      /*
       * Diagonal brace. It is a compression strut, so it runs from the bottom
       * of the HINGE stile up to the top of the latch stile — which means the
       * two leaves of a double gate mirror each other. Both leaves braced the
       * same way, as this drew before, is a gate that would sag.
       */
      parts.push(
        <line
          key={`gb${l}`}
          x1={hingeLeft ? ix1 + 3 : ix2 - 3}
          y1={iy2 - 4}
          x2={hingeLeft ? ix2 - 3 : ix1 + 3}
          y2={iy1 + 4}
          stroke={fill}
          strokeWidth={4}
          opacity={0.9}
        />,
      );
    } else {
      /*
       * Ornamental iron, built the way the shop's own photographs show it and
       * the way the fence drawing already does: the pickets are continuous,
       * they pass THROUGH a top and a bottom rail, and the spear finials
       * project above the top rail. Pickets that stop short of the frame, with
       * a top member floating above them touching nothing, is not a gate —
       * there would be nothing holding the pickets in line.
       */
      const railT = 1.6 * s;
      const yRailTop = yTop + gh * 0.16;
      const yRailBot = grade - 4 - frameT - railT;
      const yPickTop = yTop + gh * 0.055;
      const pw = 0.75 * s * 1.15;
      const spacing = 4.5 * s;
      const n = Math.max(3, Math.floor((ix2 - ix1) / spacing));
      const gap = (ix2 - ix1) / (n + 1);
      for (let i = 1; i <= n; i++) {
        const px = ix1 + gap * i;
        parts.push(
          <rect
            key={`go${l}-${i}`}
            x={px - pw / 2}
            y={yPickTop}
            width={pw}
            height={yRailBot + railT - yPickTop}
            fill={fill}
            stroke={gEdge}
            strokeWidth={0.45}
          />,
        );
        parts.push(<Spear key={`gf${l}-${i}`} x={px} y={yTop + gh * 0.06} w={pw} fill={fill} edge={gEdge} />);
      }
      // Rails over the pickets, then the stiles over both: a welded frame.
      for (const [k, ry] of [['t', yRailTop], ['b', yRailBot]] as const) {
        parts.push(
          <rect key={`gr${k}${l}`} x={lx1} y={ry} width={lx2 - lx1} height={railT} fill={frameFill} stroke={DRAW.lip} strokeWidth={0.5} />,
        );
      }
      for (const [k, sx] of [['l', lx1], ['r', lx2 - frameT]] as const) {
        parts.push(
          <rect key={`gs${k}${l}`} x={sx} y={yTop} width={frameT} height={grade - 4 - yTop} fill={frameFill} stroke={DRAW.lip} strokeWidth={0.5} />,
        );
      }
    }

    // Perimeter frame over the infill. Ornamental draws its own stiles and
    // rails above, so it is not framed a second time.
    if (style !== 'ornamental') {
      parts.push(
        <rect
          key={`gf-o${l}`}
          x={lx1}
          y={yTop}
          width={lx2 - lx1}
          height={grade - 4 - yTop}
          fill="none"
          stroke={frameFill}
          strokeWidth={frameT}
        />,
      );
    }
  }

  /*
   * A double gate is two leaves that each swing off their OWN outer post, and
   * they latch to each other in the middle. Hanging both leaves on the left
   * post and latching to the right one, as this drew before, describes a gate
   * that cannot open.
   */
  const hinges: { x: number; dir: 1 | -1 }[] =
    leaves === 2
      ? [
          { x: x1, dir: 1 },
          { x: x2, dir: -1 },
        ]
      : [{ x: x1, dir: 1 }];
  const latchX = leaves === 2 ? cx : x2;

  const dimVx = Math.max(34, x1 - postW - 30);
  const vbX0 = dimVx - 26;
  const vbX1 = Math.max(VW - 20, x2 + postW + 48);
  const vb = fitViewBox(vbX0, yTop - 52, vbX1, grade + 96);

  return (
    <svg
      viewBox={vb}
      className="drawSurface"
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label={`Scale elevation of a ${widthFt} foot by ${heightFt} foot ${use} gate`}
    >
      <DrawingDefs id={uid} />

      {/* gate posts, set in concrete */}
      {[x1 - postW / 2 - 2, x2 + postW / 2 + 2].map((px, i) => (
        <g key={i}>
          <rect x={px - postW / 2} y={yTop - 10} width={postW} height={grade - yTop + 10} fill={shade(steel, -0.12)} stroke={DRAW.lip} strokeWidth={0.6} />
          <rect x={px - postW / 2} y={yTop - 10} width={postW * 0.3} height={grade - yTop + 10} fill="#fff" opacity={0.13} />
          <path
            d={`M${px - postW * 1.5} ${grade} L${px + postW * 1.5} ${grade} L${px + postW * 1.1} ${grade + 34} L${px - postW * 1.1} ${grade + 34} Z`}
            fill={`url(#${uid}-hatch)`}
            stroke={DRAW.faint}
            strokeWidth={0.8}
          />
        </g>
      ))}

      {parts}

      {/* hinges — a strap onto the leaf, a pin on the post side */}
      {hinges.map((h) =>
        [yTop + gh * 0.14, grade - gh * 0.14].map((hy, i) => (
          <g key={`${h.x}-${i}`}>
            <rect
              x={h.dir === 1 ? h.x - postW * 0.7 : h.x - postW * 0.6}
              y={hy - 4}
              width={postW * 1.3}
              height={8}
              fill={dark}
              stroke={DRAW.lip}
              strokeWidth={0.5}
            />
            <circle cx={h.x - h.dir * postW * 0.15} cy={hy} r={3.2} fill={shade(steel, 0.3)} stroke={DRAW.lip} strokeWidth={0.5} />
          </g>
        )),
      )}

      {/* drop rod / cane bolt on the passive leaf */}
      {(hardware.includes('dropRod') || hardware.includes('caneBolt')) && leaves === 2 && (
        <g>
          <rect x={cx - 2.2} y={grade - gh * 0.62} width={4.4} height={gh * 0.62 + 16} fill={shade(steel, 0.24)} stroke={DRAW.lip} strokeWidth={0.5} />
          <circle cx={cx} cy={grade + 16} r={3} fill={DRAW.dim} opacity={0.6} />
        </g>
      )}

      {/* latch — at the meeting stiles on a pair, at the latch post on a single */}
      {hardware.includes('latchLockable') && (
        <rect
          x={latchX - (leaves === 2 ? postW * 0.6 : 6)}
          y={grade - gh * 0.55}
          width={postW * 1.2}
          height={11}
          fill={dark}
          stroke={DRAW.lip}
          strokeWidth={0.5}
        />
      )}

      <Grade x1={vbX0 + 6} y={grade} x2={vbX1 - 6} />

      <DimH x1={x1} x2={x2} y={grade + 62} label={`${ftIn(Wft * 12)} clear`} tickTo={grade} />
      <DimV y1={yTop} y2={grade} x={dimVx} label={ftIn(Hft * 12)} tickTo={x1 - postW} />
      {leaves === 2 && (
        <Leader x={cx} y={yTop + gh * 0.42} tx={cx + 74} ty={yTop - 22} label="drop rod at centre" anchor="start" frame={[vbX0, vbX1]} />
      )}
      <Leader
        x={hinges[0].x - postW * 0.15}
        y={yTop + gh * 0.14}
        tx={x1 - 62}
        ty={yTop - 22}
        label={leaves === 2 ? 'hinges, each leaf' : 'hinges'}
        anchor="end"
        frame={[vbX0, vbX1]}
      />
    </svg>
  );
}

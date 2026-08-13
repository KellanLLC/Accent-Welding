'use client';

import { useId, type ReactNode } from 'react';
import { DimH, DimV, DrawingDefs, Grade, Leader, DRAW, ftIn, fitViewBox, liftForPanel } from './primitives';
import { Spear } from './pickets';
import type { FenceTypeId, TerrainId } from '@/config/products';
import { woodGrains, type WoodGrainId } from '@/config/products';
import { shade, useSpringNumber } from '@/lib/useSpringNumber';

/**
 * Fence — elevation to scale, for all five types Accent Welding builds.
 * Wood-grain finishes are drawn with their actual plank colour and grain, so
 * choosing "Burnt Wood Charcoal" changes the drawing, not just a swatch.
 */
export function FenceDrawing({
  type,
  heightFt,
  color,
  edge,
  woodGrain,
  terrain,
}: {
  type: FenceTypeId;
  heightFt: number;
  color: string;
  edge: string;
  woodGrain?: WoodGrainId;
  terrain: TerrainId;
}) {
  const H = useSpringNumber(heightFt * 12);
  /* Several of these are rendered on one page, so the defs this drawing
     references have to be its own rather than a literal every copy shares. */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const s = 2.35;
  const grade = 312;
  const bay = 72;
  const x0 = 66;
  const postW = 2.5 * s;
  const posts = [x0, x0 + bay * s, x0 + bay * 2 * s];
  const rightEnd = x0 + bay * 2 * s + 46;

  const drop = terrain === 'flat' ? 0 : 26;
  /** Ground falls away to the right on sloped runs. */
  const gAt = (x: number) => grade + ((x - x0) / (bay * 2 * s)) * drop;
  /** Panels step down on 'stepped', follow the grade on 'racked'. */
  const stepFor = (b: number) => (terrain === 'stepped' ? (drop / 2) * b : 0);

  const grain = woodGrain ? woodGrains.find((g) => g.id === woodGrain) : undefined;
  // Steel is lifted clear of the drawing panel before it is drawn: black powder
  // coat at its literal value is invisible on this ground. Wood grains already
  // read, so the lift returns them untouched.
  const steel = liftForPanel(color);
  const panelFill = grain ? grain.hex : steel;
  const panelEdge = grain ? grain.grain : DRAW.lip;
  const metalEdge = grain ? edge : DRAW.lip;
  const light = shade(panelFill, 0.16);

  const parts: ReactNode[] = [];

  for (let b = 0; b < 2; b++) {
    const bx1 = posts[b] + postW / 2;
    const bx2 = posts[b + 1] - postW / 2;
    const step = stepFor(b);
    const yTopFlat = grade - H * s + step;

    if (type === 'privacy') {
      const planks = Math.max(6, Math.round((H * s) / 15));
      const ph = (grade - (grade - H * s)) / planks;
      for (let i = 0; i < planks; i++) {
        const py = yTopFlat + i * ph;
        parts.push(
          <g key={`pv${b}-${i}`}>
            <rect x={bx1} y={py} width={bx2 - bx1} height={ph - 1.1} fill={i % 2 ? panelFill : light} stroke={panelEdge} strokeWidth={0.4} />
            {/* grain */}
            <path
              d={`M${bx1 + 4} ${py + ph * 0.34} Q${(bx1 + bx2) / 2} ${py + ph * (0.2 + (i % 3) * 0.1)} ${bx2 - 4} ${py + ph * 0.4}`}
              fill="none"
              stroke={panelEdge}
              strokeWidth={0.7}
              opacity={0.55}
            />
            <path
              d={`M${bx1 + 14} ${py + ph * 0.68} Q${(bx1 + bx2) / 2 + 18} ${py + ph * 0.56} ${bx2 - 10} ${py + ph * 0.72}`}
              fill="none"
              stroke={panelEdge}
              strokeWidth={0.55}
              opacity={0.4}
            />
          </g>,
        );
      }
    } else if (type === 'slat') {
      const slats = Math.max(7, Math.round((H * s) / 17));
      const pitch = (H * s) / slats;
      for (let i = 0; i < slats; i++) {
        const py = yTopFlat + i * pitch;
        parts.push(
          <rect key={`sl${b}-${i}`} x={bx1} y={py} width={bx2 - bx1} height={pitch * 0.72} fill={i % 2 ? panelFill : light} stroke={metalEdge} strokeWidth={0.4} />,
        );
      }
    } else if (type === 'pasture' || type === 'pipe') {
      const n = type === 'pipe' ? 5 : Math.max(3, Math.round(heightFt));
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const py = yTopFlat + t * (H * s * 0.86);
        const th = type === 'pipe' ? 5.2 : 7.2;
        parts.push(
          <g key={`pr${b}-${i}`}>
            <rect x={bx1 - postW / 2} y={py} width={bx2 - bx1 + postW} height={th} fill={panelFill} stroke={metalEdge} strokeWidth={0.45} rx={type === 'pipe' ? th / 2 : 0} />
            <rect x={bx1 - postW / 2} y={py} width={bx2 - bx1 + postW} height={th} fill={`url(#${uid}-round)`} rx={type === 'pipe' ? th / 2 : 0} />
          </g>,
        );
      }
    } else if (type === 'ornamental') {
      const railT = 1.5 * s;
      const yT = yTopFlat + H * s * 0.16;
      const yB = grade - 6 + step;
      parts.push(<rect key={`ot${b}`} x={bx1 - postW / 2} y={yT} width={bx2 - bx1 + postW} height={railT} fill={light} stroke={metalEdge} strokeWidth={0.5} />);
      parts.push(<rect key={`ob${b}`} x={bx1 - postW / 2} y={yB - railT} width={bx2 - bx1 + postW} height={railT} fill={light} stroke={metalEdge} strokeWidth={0.5} />);
      const pw = 0.75 * s;
      const spacing = 4.5 * s;
      const n = Math.max(3, Math.floor((bx2 - bx1) / spacing));
      const gap = (bx2 - bx1) / (n + 1);
      for (let i = 1; i <= n; i++) {
        const px = bx1 + gap * i;
        parts.push(<rect key={`op${b}-${i}`} x={px - pw / 2} y={yTopFlat + H * s * 0.055} width={pw} height={yB - yTopFlat - H * s * 0.055} fill={panelFill} stroke={metalEdge} strokeWidth={0.45} />);
        parts.push(<Spear key={`os${b}-${i}`} x={px} y={yTopFlat + H * s * 0.06} w={pw} fill={panelFill} edge={metalEdge} />);
      }
    }
  }

  const topOfPost = (i: number) =>
    grade - H * s + stepFor(Math.min(i, 1)) - (type === 'ornamental' ? 6 : 4);

  const dimVx = 40;
  const vbX0 = dimVx - 24;
  const vbX1 = rightEnd + 80;
  const vb = fitViewBox(vbX0, grade - H * s - 46, vbX1, grade + drop + 96);

  return (
    <svg
      viewBox={vb}
      className="drawSurface"
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label={`Scale elevation of ${heightFt} foot ${type} fence`}
    >
      <DrawingDefs id={uid} />

      {parts}

      {/* posts drawn over the panels, plus their concrete footings */}
      {posts.map((px, i) => (
        <g key={i}>
          <rect x={px - postW / 2} y={topOfPost(i)} width={postW} height={gAt(px) - topOfPost(i) + 26} fill={shade(steel, -0.1)} stroke={DRAW.lip} strokeWidth={0.6} />
          <rect x={px - postW / 2} y={topOfPost(i)} width={postW * 0.32} height={gAt(px) - topOfPost(i)} fill="#fff" opacity={0.13} />
          <path
            d={`M${px - postW * 1.5} ${gAt(px)} L${px + postW * 1.5} ${gAt(px)} L${px + postW * 1.1} ${gAt(px) + 30} L${px - postW * 1.1} ${gAt(px) + 30} Z`}
            fill={`url(#${uid}-hatch)`}
            stroke={DRAW.faint}
            strokeWidth={0.8}
          />
        </g>
      ))}

      <path
        d={`M${rightEnd} ${grade - H * s} l0 12 l-7 6 l14 8 l-14 8 l7 6 l0 ${H * s - 40 + drop}`}
        fill="none"
        stroke={DRAW.dim}
        strokeWidth={1}
        opacity={0.85}
      />

      <Grade x1={vbX0 + 6} y={grade} x2={vbX1 - 6} />
      {drop > 0 && (
        <line x1={x0} y1={grade} x2={rightEnd + 12} y2={grade + drop} stroke={DRAW.dim} strokeWidth={1.2} opacity={0.75} />
      )}

      <DimV y1={grade - H * s} y2={grade} x={dimVx} label={ftIn(H)} tickTo={x0 - postW} />
      <DimH x1={posts[0]} x2={posts[1]} y={grade + 56 + drop * 0.3} label={`${ftIn(bay)} O.C.`} tickTo={grade + drop * 0.25} />
      <Leader x={posts[1]} y={gAt(posts[1]) + 18} tx={posts[1] + 52} ty={gAt(posts[1]) + 50} label="set in concrete" anchor="start" frame={[vbX0, vbX1]} />
      {grain && (
        <Leader
          x={posts[0] + 40}
          y={grade - H * s + 24}
          tx={posts[0] + 96}
          ty={grade - H * s - 18}
          label={grain.name}
          anchor="start"
          frame={[vbX0, vbX1]}
        />
      )}
    </svg>
  );
}

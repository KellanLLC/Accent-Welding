'use client';

import { useId } from 'react';
import { AxoDim, DrawingDefs, ftIn, fitViewBox } from './primitives';
import { shade, useSpringNumber } from '@/lib/useSpringNumber';

/**
 * Garden box — axonometric shop drawing, built from the chosen dimensions.
 *
 * Axonometric is a real drawing projection, not a fake render: every edge is at
 * true length along its own axis, so the box you see is genuinely 8 ft × 4 ft
 * if that is what you picked. The dimensions are drawn IN those same planes —
 * each one runs parallel to the edge it measures and is pushed clear of the
 * steel, so no dimension ever crosses the solid.
 *
 * Construction is taken off the shop's own photographs of these boxes:
 *   · a folded top rim that stands proud of the sheet and throws a shadow line
 *     down the face below it
 *   · a vertical angle at every corner, sitting on the outside of the sheet
 *   · a base skid frame, wider than the box, that carries it clear of the soil
 *   · no floor — these are open-bottomed, so roots go straight into the ground
 */

const AZ = (26 * Math.PI) / 180;
const CX = Math.cos(AZ);
const SY = Math.sin(AZ);

/* Construction, in real inches. */
const RIM_OUT = 0.9; // folded top rim: the leg standing proud of the sheet
const RIM_IN = 1.15; // and the return that folds back inside
const SKID_H = 1.7; // base rail height
const SKID_OUT = 1.3; // it runs proud of the sheet the whole way round
const ANG_LEG = 2.3; // corner angle, leg length on each face
const ANG_T = 0.45; // and how far it stands off the sheet
const OVERHANG = 1.25; // depth of the shadow the rim throws down the face

const VW = 480;
const VH = 340;
/* Gutters reserved for the dimensions, so the steel never has to share space
   with them and every size lands centred in what is left. */
const GUT = { l: 68, r: 44, t: 40, b: 40 };
const AVAIL_W = VW - GUT.l - GUT.r;
const AVAIL_H = VH - GUT.t - GUT.b;

type Pt = [number, number];

/** Projected bounding box of the whole object, at unit scale. */
function extents(L: number, W: number, H: number) {
  const ro = RIM_OUT;
  const so = SKID_OUT;
  const corners: [number, number, number][] = [
    [-ro, -ro, H],
    [L + ro, -ro, H],
    [L + ro, W + ro, H],
    [-ro, W + ro, H],
    [-so, -so, 0],
    [L + so, -so, 0],
    [L + so, W + so, 0],
    [-so, W + so, 0],
  ];
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const [x, y, z] of corners) {
    const px = (x - y) * CX;
    const py = -(x + y) * SY - z;
    if (px < x0) x0 = px;
    if (px > x1) x1 = px;
    if (py < y0) y0 = py;
    if (py > y1) y1 = py;
  }
  return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 };
}

/** The scale at which the largest box in the range fills the frame. */
const FIT_MAX = (() => {
  const b = extents(96, 48, 24);
  return Math.min(AVAIL_W / b.w, AVAIL_H / b.h);
})();

/** Relative luminance, 0–1. Decides how much tonal room a colour has. */
function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
}

export function GardenBoxDrawing({
  lengthFt,
  widthFt,
  heightIn,
  color,
  edge,
  label,
  showDims = true,
}: {
  lengthFt: number;
  widthFt: number;
  heightIn: number;
  color: string;
  edge: string;
  label: string;
  showDims?: boolean;
}) {
  const L = useSpringNumber(lengthFt * 12);
  const W = useSpringNumber(widthFt * 12);
  const H = useSpringNumber(heightIn);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  /*
   * Scale. A single fixed scale strands a 2 ft box in a mostly empty frame; a
   * pure fit-to-frame scale draws every box the same size and makes the size
   * picker meaningless. This is the geometric blend of the two: bigger boxes
   * still draw visibly bigger, small ones still fill their sheet. Each drawing
   * is true to itself — every edge on it is at one scale, and all three
   * dimensions are called out — so nothing is being claimed that is not so.
   */
  const b = extents(L, W, H);
  const fit = Math.min(AVAIL_W / b.w, AVAIL_H / b.h);
  const s = Math.min(fit, FIT_MAX * Math.pow(fit / FIT_MAX, 0.55));

  const ox = GUT.l + AVAIL_W / 2 - ((b.x0 + b.x1) / 2) * s;
  const oy = GUT.t + AVAIL_H / 2 - ((b.y0 + b.y1) / 2) * s;

  const P = (x: number, y: number, z: number): Pt => [
    ox + (x - y) * CX * s,
    oy + (-(x + y) * SY - z) * s,
  ];
  const poly = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  /*
   * Tone. Powder coat black is nearly the value of the drawing sheet itself, so
   * a very dark colour is lifted before it is shaded and its shadows are
   * compressed — otherwise a black box is an invisible box. One light source,
   * high and to the right: the long face is the lit one, the end face falls
   * away, the rim top catches the most.
   */
  const lum = luminance(color);
  const base = shade(color, Math.max(0, 0.26 - lum) * 0.85);
  const squeeze = 0.45 + Math.min(lum, 0.6);
  const T = (k: number) => shade(base, k >= 0 ? k : k * squeeze);
  const line = lum > 0.55 ? shade(base, -0.36) : T(0.44);

  const rimTop = T(0.24);
  const faceR = T(-0.05);
  const faceL = T(-0.34);
  const rimShadeR = T(-0.26);
  const rimShadeL = T(-0.5);
  const skidR = T(-0.2);
  const skidL = T(-0.44);
  const skidTop = T(0.12);
  const angR = T(0.16);
  const angL = T(-0.18);
  /* Inside the box is the finish's own shadow colour, not a guess at one. Each
     inner wall takes the light of the outer face that shares its normal: the
     far-right wall faces the way the shaded end does, the far-left wall the way
     the lit long side does. */
  const wallY = shade(edge, -0.08);
  const wallX = shade(edge, -0.32);
  const cavity = shade(edge, -0.55);
  /* The floor of the interior takes the finish too. It used to be a fixed
     soil brown (the ground showing through the open bottom), but that brown
     was within a hair of the bronze finish, so every other colour looked like
     it had been left with a bronze floor. It is the lightest surface in there,
     because a floor faces up into the light while the walls do not; the hatch
     over it is a step off the same tone, never a colour of its own. */
  const floor = shade(edge, 0.06);
  const floorLine = lum > 0.55 ? shade(edge, -0.16) : shade(edge, 0.18);

  const ro = RIM_OUT;
  const ri = Math.min(RIM_IN, Math.min(L, W) / 6);
  const so = SKID_OUT;
  const sh = Math.min(SKID_H, H / 6);
  const al = Math.min(ANG_LEG, Math.min(L, W) / 5);
  const at = ANG_T;
  const ov = Math.min(OVERHANG, (H - sh) / 4);

  /* Ground contact: the skid footprint thrown a short way off by the same light
     and softened, so the box beds down on the sheet. Tight, low and directional
     — most of it stays under the steel, and only a fringe shows on the shaded
     side. */
  const shadow: Pt[] = [
    P(-so, -so, 0),
    P(L + so, -so, 0),
    P(L + so, W + so, 0),
    P(-so, W + so, 0),
  ];

  const A0 = P(0, 0, 0);
  const B0 = P(L, 0, 0);
  const D0 = P(0, W, 0);
  const DTop = P(0, W, H);

  /* Interior: two far walls and the ground showing through an open bottom. */
  const o0 = P(ri, ri, H);
  const o1 = P(L - ri, ri, H);
  const o2 = P(L - ri, W - ri, H);
  const o3 = P(ri, W - ri, H);
  const g0 = P(ri, ri, 0);
  const g1 = P(L - ri, ri, 0);
  const g2 = P(L - ri, W - ri, 0);
  const g3 = P(ri, W - ri, 0);

  const rimOuter: Pt[] = [P(-ro, -ro, H), P(L + ro, -ro, H), P(L + ro, W + ro, H), P(-ro, W + ro, H)];

  const pad = 26;
  const vb = showDims
    ? `0 0 ${VW} ${VH}`
    : fitViewBox(
        b.x0 * s + ox - pad,
        b.y0 * s + oy - pad,
        b.x1 * s + ox + pad,
        b.y1 * s + oy + pad,
        16 / 9,
      );

  /* Corner angles, on the outside of the sheet at each visible corner. */
  const angles: { pts: Pt[]; fill: string }[] = [
    { fill: angR, pts: [P(0, -at, sh), P(al, -at, sh), P(al, -at, H), P(0, -at, H)] },
    { fill: angR, pts: [P(L - al, -at, sh), P(L, -at, sh), P(L, -at, H), P(L - al, -at, H)] },
    { fill: angL, pts: [P(-at, 0, sh), P(-at, al, sh), P(-at, al, H), P(-at, 0, H)] },
    { fill: angL, pts: [P(-at, W - al, sh), P(-at, W, sh), P(-at, W, H), P(-at, W - al, H)] },
  ];

  return (
    <svg
      viewBox={vb}
      className="drawSurface"
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label={`Axonometric scale drawing of a ${lengthFt} foot by ${widthFt} foot garden box, ${heightIn} inches tall overall, ${label}`}
    >
      <DrawingDefs id={uid} />
      <defs>
        <clipPath id={`${uid}-cav`}>
          <polygon points={poly([o0, o1, o2, o3])} />
        </clipPath>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.015" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-25%" y="-40%" width="150%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        {/*
          Section hatch for the ground inside the box: the one cue that the box
          is open-bottomed and sits on soil. Toned off the finish so it tracks
          the colour picker with everything else.
        */}
        <pattern id={`${uid}-soil`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={floorLine} strokeWidth="2.4" />
        </pattern>
      </defs>

      <polygon
        points={poly(shadow)}
        fill="#0e0c0b"
        opacity={0.62}
        transform="translate(9 3)"
        filter={`url(#${uid}-soft)`}
      />

      {/* base skid — the frame the box stands on, proud of the sheet all round */}
      <polygon points={poly([P(-so, -so, 0), P(L + so, -so, 0), P(L + so, -so, sh), P(-so, -so, sh)])} fill={skidR} stroke={line} strokeWidth={0.55} strokeOpacity={0.45} />
      <polygon points={poly([P(-so, -so, 0), P(-so, W + so, 0), P(-so, W + so, sh), P(-so, -so, sh)])} fill={skidL} stroke={line} strokeWidth={0.55} strokeOpacity={0.45} />
      <polygon points={poly([P(-so, -so, sh), P(L + so, -so, sh), P(L + so, 0, sh), P(-so, 0, sh)])} fill={skidTop} />
      <polygon points={poly([P(-so, 0, sh), P(-so, W + so, sh), P(0, W + so, sh), P(0, 0, sh)])} fill={skidTop} />

      {/* sheet sides */}
      <polygon points={poly([P(0, 0, sh), P(L, 0, sh), P(L, 0, H), P(0, 0, H)])} fill={faceR} />
      <polygon points={poly([P(0, 0, sh), P(0, W, sh), P(0, W, H), P(0, 0, H)])} fill={faceL} />
      <polygon points={poly([P(0, 0, sh), P(L, 0, sh), P(L, 0, H), P(0, 0, H)])} fill={`url(#${uid}-face)`} />
      <polygon points={poly([P(0, 0, sh), P(0, W, sh), P(0, W, H), P(0, 0, H)])} fill={`url(#${uid}-face)`} opacity={0.55} />

      {/* the line the folded rim throws down the face beneath it */}
      <polygon points={poly([P(0, 0, H - ov), P(L, 0, H - ov), P(L, 0, H), P(0, 0, H)])} fill={rimShadeR} />
      <polygon points={poly([P(0, 0, H - ov), P(0, W, H - ov), P(0, W, H), P(0, 0, H)])} fill={rimShadeL} />

      {/* corner angles */}
      {angles.map((a, i) => (
        <polygon key={i} points={poly(a.pts)} fill={a.fill} stroke={line} strokeWidth={0.5} strokeOpacity={0.68} />
      ))}

      {/* folded top rim */}
      <polygon points={poly(rimOuter)} fill={rimTop} stroke={line} strokeWidth={1} />

      {/* open interior: two far walls, and the ground showing through */}
      <g clipPath={`url(#${uid}-cav)`}>
        <polygon points={poly([o0, o1, o2, o3])} fill={cavity} />
        <polygon points={poly([o1, o2, g2, g1])} fill={wallX} />
        <polygon points={poly([o2, o3, g3, g2])} fill={wallY} />
        <polygon points={poly([g0, g1, g2, g3])} fill={floor} />
        <polygon points={poly([g0, g1, g2, g3])} fill={`url(#${uid}-soil)`} />
        {/* The line where the walls land on the ground. Without it the soil and
            the shaded inner walls merge into one dark mass and the box reads as
            bottomless — which is the opposite of what it is. */}
        <polygon points={poly([g0, g1, g2, g3])} fill="none" stroke={line} strokeWidth={1.3} strokeOpacity={0.55} />
      </g>
      <polygon points={poly([o0, o1, o2, o3])} fill="none" stroke={line} strokeWidth={0.8} strokeOpacity={0.8} />

      {showDims && (
        <g>
          {/*
            Three dimensions on the object's own three axes. Length and depth lie
            in the ground plane and fan out below the near corner; height stands
            off the left corner, which is the leftmost point of the drawing, so
            its witness lines run straight out into clear space. Nothing crosses
            the steel.
          */}
          <AxoDim
            ax={A0[0]}
            ay={A0[1]}
            bx={B0[0]}
            by={B0[1]}
            offX={CX * 30}
            offY={SY * 30}
            gap={5 + so * CX * s}
            label={ftIn(L)}
            fontSize={11.5}
          />
          <AxoDim
            ax={A0[0]}
            ay={A0[1]}
            bx={D0[0]}
            by={D0[1]}
            offX={-CX * 30}
            offY={SY * 30}
            gap={5 + so * CX * s}
            label={ftIn(W)}
            fontSize={11.5}
          />
          <AxoDim
            ax={D0[0]}
            ay={D0[1]}
            bx={DTop[0]}
            by={DTop[1]}
            offX={-50}
            offY={0}
            gap={4 + 2 * so * CX * s}
            label={`${Math.round(H)}″`}
            fontSize={11.5}
          />
        </g>
      )}
    </svg>
  );
}

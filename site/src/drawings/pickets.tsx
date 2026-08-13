import type { ReactNode } from 'react';
import type { PicketId } from '@/config/products';

/**
 * The seven picket styles Accent Welding advertises, drawn as vector.
 *
 * Each is a real ornament with its own construction — a collar is a forged
 * band around the bar, a basket is woven strap that bulges and returns, a
 * cage is a diamond around the whole thing. Drawn per-brand, not pulled from
 * an icon set.
 *
 * Each function draws one picket on a bar of width `w`, running from `yTop`
 * to `yBot`, centred on `x`.
 */

export type PicketArgs = {
  x: number;
  yTop: number;
  yBot: number;
  w: number;
  fill: string;
  edge: string;
  key?: string | number;
};

/**
 * One inch, in the units the bar is drawn in — which is ¾″ wide.
 *
 * A forged ornament is a stock part: a basket is the same basket whether it
 * goes into a 34″ rail or a 42″ one. So the ornaments below are set out in real
 * inches off the bar rather than as a fraction of the picket's height, which is
 * what stretched a basket-and-cage into a 23″ sliver on a tall rail. They give
 * ground only if the picket is genuinely too short to hold them.
 */
const inch = (a: PicketArgs) => a.w / 0.75;

/**
 * How wide each ornament actually is, in inches. A run of decorative pickets is
 * set out from this, so whichever one is chosen the ornaments come out with
 * real clear space between them instead of touching.
 */
export const picketWidths: Record<PicketId, number> = {
  plainSquare: 0.75,
  knuckleCollar: 1.9,
  diamondCage: 4.6,
  barleyTwist: 0.9,
  scroll: 5.2,
  basket: 4.4,
  ornateBasketCage: 5.2,
};

function bar({ x, yTop, yBot, w, fill, edge }: PicketArgs, extra?: ReactNode) {
  return (
    <g>
      <rect x={x - w / 2} y={yTop} width={w} height={yBot - yTop} fill={fill} stroke={edge} strokeWidth={0.5} />
      {extra}
    </g>
  );
}

function collar(x: number, y: number, w: number, fill: string, edge: string) {
  const cw = w * 2.5;
  const ch = w * 1.5;
  return <rect x={x - cw / 2} y={y - ch / 2} width={cw} height={ch} fill={fill} stroke={edge} strokeWidth={0.5} />;
}

export const picketRenderers: Record<PicketId, (a: PicketArgs) => ReactNode> = {
  plainSquare: (a) => bar(a),

  knuckleCollar: (a) => {
    const h = a.yBot - a.yTop;
    return bar(
      a,
      <>
        {collar(a.x, a.yTop + h * 0.38, a.w, a.fill, a.edge)}
        {collar(a.x, a.yTop + h * 0.62, a.w, a.fill, a.edge)}
      </>,
    );
  },

  diamondCage: (a) => {
    const h = a.yBot - a.yTop;
    const u = inch(a);
    const cy = a.yTop + h * 0.5;
    const rx = 2.3 * u;
    const ry = Math.min(9 * u, h * 0.34);
    const t = 0.54 * u;
    const outer = `${a.x} ${cy - ry} L${a.x + rx} ${cy} L${a.x} ${cy + ry} L${a.x - rx} ${cy} Z`;
    const inner = `${a.x} ${cy - ry + t * 1.7} L${a.x + rx - t * 1.7} ${cy} L${a.x} ${cy + ry - t * 1.7} L${a.x - rx + t * 1.7} ${cy} Z`;
    return bar(
      a,
      <path d={`M${outer} M${inner}`} fillRule="evenodd" fill={a.fill} stroke={a.edge} strokeWidth={0.5} />,
    );
  },

  barleyTwist: (a) => {
    const h = a.yBot - a.yTop;
    const top = a.yTop + h * 0.12;
    const bot = a.yBot - h * 0.12;
    const turns = Math.max(5, Math.round((bot - top) / (a.w * 3.4)));
    const step = (bot - top) / turns;
    const strands: ReactNode[] = [];
    for (let i = 0; i < turns; i++) {
      const y0 = top + i * step;
      strands.push(
        <path
          key={i}
          d={`M${a.x - a.w * 0.62} ${y0} Q${a.x} ${y0 + step * 0.34} ${a.x + a.w * 0.62} ${y0 + step * 0.72}`}
          fill="none"
          stroke={a.edge}
          strokeWidth={a.w * 0.34}
          strokeLinecap="round"
          opacity={0.85}
        />,
      );
    }
    return bar({ ...a, w: a.w * 1.18 }, <>{strands}</>);
  },

  scroll: (a) => {
    const h = a.yBot - a.yTop;
    const cy = a.yTop + h * 0.5;
    const r = a.w * 3.4;
    const sw = a.w * 0.86;
    return bar(
      a,
      <>
        <path
          d={`M${a.x} ${cy - r * 0.95} C${a.x + r} ${cy - r * 0.8} ${a.x + r * 1.05} ${cy + r * 0.28} ${a.x + r * 0.22} ${cy + r * 0.3} C${a.x - r * 0.34} ${cy + r * 0.32} ${a.x - r * 0.3} ${cy - r * 0.22} ${a.x + r * 0.16} ${cy - r * 0.16}`}
          fill="none"
          stroke={a.fill}
          strokeWidth={sw}
          strokeLinecap="round"
        />
        <path
          d={`M${a.x} ${cy + r * 0.95} C${a.x - r} ${cy + r * 0.8} ${a.x - r * 1.05} ${cy - r * 0.28} ${a.x - r * 0.22} ${cy - r * 0.3} C${a.x + r * 0.34} ${cy - r * 0.32} ${a.x + r * 0.3} ${cy + r * 0.22} ${a.x - r * 0.16} ${cy + r * 0.16}`}
          fill="none"
          stroke={a.fill}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      </>,
    );
  },

  basket: (a) => {
    const h = a.yBot - a.yTop;
    const u = inch(a);
    const cy = a.yTop + h * 0.5;
    const bh = Math.min(5.5 * u, h * 0.24); // half the woven length
    const bw = 2.2 * u;
    const sw = 0.46 * u;
    const strands: ReactNode[] = [];
    for (let i = -1; i <= 1; i += 2) {
      strands.push(
        <path
          key={i}
          d={`M${a.x} ${cy - bh} C${a.x + i * bw} ${cy - bh * 0.42} ${a.x + i * bw} ${cy + bh * 0.42} ${a.x} ${cy + bh}`}
          fill="none"
          stroke={a.fill}
          strokeWidth={sw}
          strokeLinecap="round"
        />,
      );
    }
    return bar(
      a,
      <>
        {strands}
        {collar(a.x, cy - bh, a.w, a.fill, a.edge)}
        {collar(a.x, cy + bh, a.w, a.fill, a.edge)}
      </>,
    );
  },

  ornateBasketCage: (a) => {
    const h = a.yBot - a.yTop;
    const u = inch(a);
    const cy = a.yTop + h * 0.5;
    const rx = 2.6 * u;
    const ry = Math.min(9.5 * u, h * 0.36); // the cage around the whole thing
    const bh = Math.min(3.2 * u, ry * 0.36); // and the basket inside it
    const bw = 1.7 * u;
    const sw = 0.42 * u;
    const t = 0.5 * u;
    const strands: ReactNode[] = [];
    for (let i = -1; i <= 1; i += 2) {
      strands.push(
        <path
          key={i}
          d={`M${a.x} ${cy - bh} C${a.x + i * bw} ${cy - bh * 0.42} ${a.x + i * bw} ${cy + bh * 0.42} ${a.x} ${cy + bh}`}
          fill="none"
          stroke={a.fill}
          strokeWidth={sw}
          strokeLinecap="round"
        />,
      );
    }
    const outer = `${a.x} ${cy - ry} L${a.x + rx} ${cy} L${a.x} ${cy + ry} L${a.x - rx} ${cy} Z`;
    const inner = `${a.x} ${cy - ry + t * 1.8} L${a.x + rx - t * 1.8} ${cy} L${a.x} ${cy + ry - t * 1.8} L${a.x - rx + t * 1.8} ${cy} Z`;
    return bar(
      a,
      <>
        <path d={`M${outer} M${inner}`} fillRule="evenodd" fill={a.fill} stroke={a.edge} strokeWidth={0.5} />
        {strands}
        {collar(a.x, cy - bh, a.w, a.fill, a.edge)}
        {collar(a.x, cy + bh, a.w, a.fill, a.edge)}
      </>,
    );
  },
};

/** Spear finial for ornamental fence pickets. */
export function Spear({
  x,
  y,
  w,
  fill,
  edge,
}: {
  x: number;
  y: number;
  w: number;
  fill: string;
  edge: string;
}) {
  const hw = w * 1.35;
  const h = w * 4.6;
  return (
    <path
      d={`M${x} ${y - h} L${x + hw} ${y - h * 0.34} L${x + w * 0.5} ${y} L${x - w * 0.5} ${y} L${x - hw} ${y - h * 0.34} Z`}
      fill={fill}
      stroke={edge}
      strokeWidth={0.5}
      strokeLinejoin="round"
    />
  );
}

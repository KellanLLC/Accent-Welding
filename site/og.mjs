import { chromium } from 'playwright';
import fs from 'fs';
import sharp from 'sharp';

/**
 * Renders src/app/opengraph-image.png (1200×630) — the link-preview card.
 *
 * The composition is the business card's, digitally: warm charcoal stock,
 * the full brand lockup in buckskin and white, centred, generous air, no
 * border. The skull/wordmark/arc geometry is read from markPaths.ts and
 * Lockup.tsx's measurements, so the traced-and-verified vectors stay the
 * single source of truth. Type is the real self-hosted woff2, embedded as
 * data URIs. Rendered at 2× and downsampled for crisp glyph edges.
 *
 * Run:  node og.mjs   (no dev server needed)
 */

const W = 1200;
const H = 630;

// -- the verified vectors, read from the component source ------------------
const src = fs.readFileSync('src/components/markPaths.ts', 'utf8');
const OUTLINE = src.match(/MARK_OUTLINE =\s*\n?\s*'([^']+)'/)[1];
const DETAILS = [...src.matchAll(/^\s+'(M[^']+)',$/gm)].map((m) => m[1]);
if (!OUTLINE || DETAILS.length !== 5) throw new Error('markPaths.ts parse failed');

const font = (p) => fs.readFileSync(`src/fonts/${p}`).toString('base64');

// Ten-point star, identical construction to Lockup.tsx.
const star = (cx, cy, r) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="#D5BA8C"/>`;
};

// The lockup, geometry copied exactly from Lockup.tsx (viewBox -77 -24 614 368).
const LOCKUP_W = 780; // card air tuned by eye against the printed card
const lockup = `
<svg viewBox="-77 -24 614 368" width="${LOCKUP_W}" xmlns="http://www.w3.org/2000/svg">
  <defs><path id="aw-arc" d="M92 176 A 138 138 0 0 0 368 176" fill="none"/></defs>
  <g transform="translate(178 0) scale(1.04)">
    <path d="${OUTLINE}" fill="#D5BA8C" fill-rule="evenodd"/>
    <g stroke="#000" stroke-opacity="0.32" stroke-width="0.42" fill="none" stroke-linecap="round">
      ${DETAILS.map((d) => `<path d="${d}"/>`).join('')}
    </g>
  </g>
  <text x="150" y="52" fill="#FFFFFF" font-family="Trench Slab" font-weight="700"
        font-size="34" text-anchor="middle" dominant-baseline="central" letter-spacing="1">20</text>
  <text x="310" y="52" fill="#FFFFFF" font-family="Trench Slab" font-weight="700"
        font-size="34" text-anchor="middle" dominant-baseline="central" letter-spacing="1">25</text>
  <path d="M28 47 L118 51.5 L28 54 Z" fill="#D5BA8C"/>
  <path d="M432 47 L342 51.5 L432 54 Z" fill="#D5BA8C"/>
  <text x="230" y="126" fill="#FFFFFF" font-family="Trench Slab" font-weight="700"
        font-size="63" text-anchor="middle" dominant-baseline="central" letter-spacing="0.5">ACCENT WELDING</text>
  <path d="M92 176 A 138 138 0 0 0 368 176" fill="none" stroke="#D5BA8C"
        stroke-width="3.5" stroke-linecap="round"/>
  <text fill="#FFFFFF" font-family="Synonym" font-weight="600" font-size="21" letter-spacing="5.4">
    <textPath href="#aw-arc" startOffset="50%" text-anchor="middle">STRENGTH IN STEEL</textPath>
  </text>
  ${star(95, 196, 8.4)}${star(230, 168, 8.4)}${star(365, 196, 8.4)}
</svg>`;

const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: 'Trench Slab'; font-weight: 700;
    src: url(data:font/woff2;base64,${font('trench-slab-700.woff2')}) format('woff2'); }
  @font-face { font-family: 'Synonym'; font-weight: 600;
    src: url(data:font/woff2;base64,${font('synonym-600.woff2')}) format('woff2'); }
  * { margin: 0; }
  body { width: ${W}px; height: ${H}px; overflow: hidden;
    /* The card stock: warm charcoal, lit imperceptibly from the top so the
       surface reads as material, not a flat fill. The grain below keeps the
       transition from ever banding. */
    background: linear-gradient(180deg, #262322 0%, #222020 46%, #1e1c1c 100%);
    display: grid; place-items: center; }
  /* Replaced elements don't stretch from inset alone — without the explicit
     width/height the svg stays at its 300×150 default and the grain renders
     as a pale patch in the corner instead of texturing the whole card. */
  .grain { position: fixed; inset: 0; width: 100%; height: 100%; opacity: 0.05; }
  svg.lockup { position: relative; }
</style>
<svg class="grain" xmlns="http://www.w3.org/2000/svg">
  <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/></filter>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>
${lockup.replace('<svg ', '<svg class="lockup" ')}`;

const browser = await chromium.launch({ channel: 'chromium' });
const page = await (
  await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
).newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const raw = await page.screenshot();
await browser.close();

// Palette-quantized: the card is near-two-tone, so 256 colours are visually
// lossless here, and the grain otherwise defeats PNG compression (~630 KB).
await sharp(raw)
  .resize(W, H, { kernel: 'lanczos3' })
  .png({ palette: true, quality: 90, dither: 1.0 })
  .toFile('src/app/opengraph-image.png');
const kb = Math.round(fs.statSync('src/app/opengraph-image.png').size / 1024);
console.log(`src/app/opengraph-image.png written (${W}×${H}, ${kb} KB)`);

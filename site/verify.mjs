import { chromium } from 'playwright';
import fs from 'fs';

const ROUTES = [
  '', 'railings', 'fencing', 'gates', 'garden-boxes', 'fabrication',
  'work', 'about', 'contact', 'build',
  'build/railing', 'build/fence', 'build/gate', 'build/garden-box',
  'nope-404',
];

const problems = [];
const browser = await chromium.launch({ channel: 'chromium' });

async function run(width, height, tag) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`[${tag}] console: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[${tag}] pageerror: ${e.message}`));

  for (const r of ROUTES) {
    const res = await page.goto('http://localhost:3000/' + r, { waitUntil: 'networkidle' });
    if (r !== 'nope-404' && res && res.status() >= 400) {
      problems.push(`[${tag}] /${r} returned ${res.status()}`);
    }
    await page.waitForTimeout(600);

    // Horizontal overflow: the page body must never scroll sideways.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) problems.push(`[${tag}] /${r} scrolls horizontally by ${overflow}px`);

    // Any element wider than the viewport is a layout escape.
    const wide = await page.evaluate((vw) => {
      const bad = [];
      for (const el of document.querySelectorAll('body *')) {
        const b = el.getBoundingClientRect();
        if (b.width > vw + 2 && b.height > 0) {
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed') continue;
          bad.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 40)} ${Math.round(b.width)}px`);
        }
      }
      return bad.slice(0, 4);
    }, width);
    for (const w of wide) problems.push(`[${tag}] /${r} overflowing element: ${w}`);

    // Every link must point somewhere real.
    const deadLinks = await page.evaluate(() =>
      [...document.querySelectorAll('a')]
        .filter((a) => !a.getAttribute('href') || a.getAttribute('href') === '#')
        .map((a) => a.textContent?.trim().slice(0, 40)),
    );
    for (const d of deadLinks) problems.push(`[${tag}] /${r} dead link: "${d}"`);

    const name = (r === '' ? 'home' : r.replace(/\//g, '-')) + `-${tag}`;
    await page.screenshot({ path: `../shots/${name}.png`, fullPage: true });
  }
  await ctx.close();
}

fs.mkdirSync('../shots', { recursive: true });
await run(1440, 1000, 'desktop');
await run(390, 844, 'mobile');

/* ── Interactive: do the controls actually change the price and the drawing? ── */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => problems.push(`[interact] pageerror: ${e.message}`));

async function readTotal() {
  return (await page.locator('[class*="totalVal"]').first().innerText()).trim();
}
async function drawingSignature() {
  return page.evaluate(() => {
    const svg = document.querySelector('[class*="drawingInner"] svg');
    return svg ? svg.innerHTML.length + ':' + svg.innerHTML.slice(0, 400) : 'NONE';
  });
}

// Garden box: exact published prices must appear.
await page.goto('http://localhost:3000/build/garden-box', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
let before = await readTotal();
let sigBefore = await drawingSignature();
await page.getByText('4 ft × 4 ft', { exact: true }).click();
await page.waitForTimeout(900);
let after = await readTotal();
let sigAfter = await drawingSignature();
if (before === after) problems.push(`[interact] garden box: footprint change did not move the price (${before})`);
if (sigBefore === sigAfter) problems.push('[interact] garden box: drawing did not change with the footprint');
if (after !== '$1,335') problems.push(`[interact] garden box: 4x4x18 powder should be $1,335, got ${after}`);

await page.getByText('24 in', { exact: true }).click();
await page.waitForTimeout(900);
if ((await readTotal()) !== '$1,480') problems.push(`[interact] garden box: 4x4x24 powder should be $1,480, got ${await readTotal()}`);

await page.getByText('Bare steel', { exact: true }).first().click();
await page.waitForTimeout(700);
if ((await readTotal()) !== '$1,080') problems.push(`[interact] garden box: 4x4x24 bare should be $1,080, got ${await readTotal()}`);

// The quote dialog must open, validate, and submit.
await page.getByRole('button', { name: /Order this box/i }).click();
await page.waitForTimeout(600);
if (!(await page.locator('dialog[open]').count())) problems.push('[interact] quote dialog did not open');
const submit = page.getByRole('button', { name: /^Send it$/ });
if (!(await submit.isDisabled())) problems.push('[interact] Send it should be disabled until the box is ticked');
await page.locator('dialog [type="checkbox"]').check();
if (await submit.isDisabled()) problems.push('[interact] Send it still disabled after ticking');
await page.fill('#q-name', 'Test Person');
await page.fill('#q-phone', '801-555-0100');
await page.fill('#q-where', 'Santaquin');
await submit.click();
await page.waitForTimeout(1600);
const ok = await page.getByText(/that spec is with the shop/i).count();
if (!ok) problems.push('[interact] quote submission did not reach the success state');
await page.screenshot({ path: '../shots/quote-success.png' });

// Railing: style + picket must redraw and reprice.
await page.goto('http://localhost:3000/build/railing', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
before = await readTotal();
await page.getByText('Custom picket', { exact: true }).click();
await page.waitForTimeout(900);
after = await readTotal();
if (before === after) problems.push('[interact] railing: switching to custom picket did not change the price');
if (!(await page.getByText('Picket pattern').count())) problems.push('[interact] railing: picket group did not appear');
sigBefore = await drawingSignature();
await page.getByText('Basket & cage', { exact: true }).click();
await page.waitForTimeout(900);
if ((await drawingSignature()) === sigBefore) problems.push('[interact] railing: picket change did not redraw');
await page.screenshot({ path: '../shots/railing-custom.png', fullPage: true });

// Fence: wood grain must reach the drawing.
await page.goto('http://localhost:3000/build/fence', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
sigBefore = await drawingSignature();
await page.getByText('Burnt Wood Charcoal', { exact: true }).click();
await page.waitForTimeout(900);
if ((await drawingSignature()) === sigBefore) problems.push('[interact] fence: wood grain change did not redraw');
before = await readTotal();
await page.getByText('Pasture & ranch', { exact: true }).click();
await page.waitForTimeout(900);
if ((await readTotal()) === before) problems.push('[interact] fence: type change did not reprice');
await page.screenshot({ path: '../shots/fence-ranch.png', fullPage: true });

// Gate: leaf count must change the drawing.
await page.goto('http://localhost:3000/build/gate', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
sigBefore = await drawingSignature();
before = await readTotal();
await page.getByText('Walk gate', { exact: true }).click();
await page.waitForTimeout(900);
if ((await drawingSignature()) === sigBefore) problems.push('[interact] gate: use change did not redraw');
if ((await readTotal()) === before) problems.push('[interact] gate: use change did not reprice');
await page.screenshot({ path: '../shots/gate-walk.png', fullPage: true });

// Mobile nav must actually open.
const m = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mp = await m.newPage();
await mp.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await mp.getByRole('button', { name: /Menu/i }).click();
await mp.waitForTimeout(500);
const panelVisible = await mp.locator('#nav-panel a').first().isVisible();
if (!panelVisible) problems.push('[interact] mobile nav panel did not open');
await mp.screenshot({ path: '../shots/mobile-nav.png' });
await m.close();

await browser.close();

if (problems.length) {
  console.log('PROBLEMS (' + problems.length + ')');
  problems.forEach((p) => console.log(' - ' + p));
} else {
  console.log('ALL CHECKS PASSED');
}

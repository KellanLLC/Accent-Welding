import { chromium } from 'playwright';
import fs from 'fs';

/** Scroll the whole page so every lazy image decodes, then return to the top. */
async function settle(page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = 700;
  for (let y = 0; y < total + step; y += step) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(130);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
}

const routes = (process.argv[2] ?? '').split(',');
const width = Number(process.argv[3] || 1440);
const browser = await chromium.launch({ channel: 'chromium' });
const page = await (await browser.newContext({ viewport: { width, height: 1000 } })).newPage();
fs.mkdirSync('../shots', { recursive: true });
for (const raw of routes) {
  const r = raw.replace(/^\/+/, '');
  await page.goto('http://localhost:3000/' + r, { waitUntil: 'networkidle' });
  await settle(page);
  const name = (r === '' ? 'home' : r.replace(/\//g, '-')) + `-${width}`;
  await page.screenshot({ path: `../shots/${name}.png`, fullPage: true });
  const missing = await page.evaluate(
    () => [...document.images].filter((i) => !i.naturalWidth).length,
  );
  console.log(name, missing ? `${missing} IMAGES FAILED` : 'all images loaded');
}
await browser.close();

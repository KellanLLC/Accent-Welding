/**
 * End-to-end check of the shop panel and everything behind it, against a
 * running `npm run dev` (which reads ../.dev.vars: password "dev", webhook
 * pointed at the local echo route so "sent" paths actually run).
 *
 *   node verify-admin.mjs
 *
 * Walks: login → list a piece with a photo → it shows on /custom and the
 * home strip → ask about it from the public page → the builder and the
 * contact form → requests in the panel → status + note → send a review
 * request → open the tracked link → rate low → leave feedback → rate high on
 * another → settings save → mobile screenshots throughout. Exits non-zero
 * with a list if anything is off.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE = 'http://localhost:3000';
const problems = [];
const shots = path.resolve('../shots/admin');
fs.mkdirSync(shots, { recursive: true });

function check(cond, msg) {
  if (!cond) problems.push(msg);
}

/* A test photo: a warm plate with a plasma-cut shape, 1800×1200, so the
   browser-side resize has something real to do. */
const photoPath = path.join(shots, '_test-photo.jpg');
await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1200">
      <rect width="1800" height="1200" fill="#6e6a66"/>
      <rect x="200" y="160" width="1400" height="880" fill="#3a3735"/>
      <circle cx="900" cy="600" r="300" fill="#d5ba8c"/>
      <polygon points="900,380 960,540 1130,540 990,640 1040,800 900,700 760,800 810,640 670,540 840,540" fill="#222020"/>
    </svg>`,
  ),
)
  .jpeg({ quality: 90 })
  .toFile(photoPath);

const browser = await chromium.launch({ channel: 'chromium' });

async function fresh(viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    // The panel probes /api/admin/data once before login to detect an
    // existing session; the browser logs that expected 401 as an error.
    if (m.type() === 'error' && !/favicon|status of 401/.test(m.text())) problems.push(`console: ${m.text().slice(0, 200)}`);
  });
  return { ctx, page };
}

async function noSideways(page, tag) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(overflow <= 1, `${tag} scrolls horizontally by ${overflow}px`);
}

async function login(page) {
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  await page.fill('#pw', 'nope');
  await page.getByRole('button', { name: /Open the panel/ }).click();
  await page.waitForTimeout(900);
  check((await page.getByText('Wrong password.').count()) === 1, 'wrong password did not say so');
  await page.fill('#pw', 'dev');
  await page.getByRole('button', { name: /Open the panel/ }).click();
  await page.waitForSelector('[role="tablist"]', { timeout: 8000 });
}

/* ─────────────────────────────────────────── mobile, the main path ──── */
{
  const { ctx, page } = await fresh({ width: 390, height: 844 });

  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${shots}/gate-mobile.png`, fullPage: true });
  await noSideways(page, '/admin gate (mobile)');
  await login(page);
  await noSideways(page, '/admin (mobile)');

  // Settings: defaults as seeded.
  await page.getByRole('tab', { name: 'Settings' }).click();
  const owner = await page.inputValue('#ownerPhone');
  check(owner === '(385) 241-4679', `owner phone seeded wrong: "${owner}"`);
  const notify = await page.getByRole('switch', { name: /Text me when a request/ }).getAttribute('aria-checked');
  check(notify === 'true', 'notify switch not on by default');
  const screening = await page.getByRole('switch', { name: /Ask for a rating first/ }).getAttribute('aria-checked');
  check(screening === 'true', 'screening switch not on by default');
  await page.screenshot({ path: `${shots}/settings-mobile.png`, fullPage: true });

  // Save a changed template and confirm it sticks.
  const tpl = page.locator('textarea[aria-label="Review message template"]');
  const stamp = `E2E ${Date.now()}`;
  await tpl.fill(`Hi {{name}}, ${stamp}. Mind telling us how we did? {{link}}`);
  await page.getByRole('button', { name: 'Save everything' }).click();
  await page.waitForTimeout(1200);
  check((await page.getByText('Saved.').count()) >= 1, 'settings did not report Saved');

  // Pieces: list one with a photo.
  await page.getByRole('tab', { name: 'Pieces' }).click();
  await page.getByRole('button', { name: 'New piece' }).click();
  await page.fill('#pnew-title', 'Plasma-cut fire pit ring, 36 in');
  await page.fill('#pnew-price', '450');
  await page.fill('#pnew-desc', 'Quarter-inch plate, bare steel. Will rust to a patina. Pickup in Utah County, or delivery close by.');
  await page.setInputFiles('input[type="file"]', photoPath);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/piece-new-mobile.png`, fullPage: true });
  await page.getByRole('button', { name: 'List it' }).click();
  await page.waitForTimeout(3500);
  const rowName = page.locator('[class*="rowName"]', { hasText: 'Plasma-cut fire pit ring' });
  check((await rowName.count()) >= 1, 'new piece did not appear in the list');
  const thumb = page.locator('img[class*="pieceThumb"]').first();
  check((await thumb.count()) === 1, 'piece row has no thumbnail');
  if (await thumb.count()) {
    const ok = await thumb.evaluate((img) => img.complete && img.naturalWidth > 0);
    check(ok, 'piece thumbnail did not load from /media');
  }
  await page.screenshot({ path: `${shots}/pieces-mobile.png`, fullPage: true });

  // Public: /custom, the detail page, and asking about it.
  await page.goto(`${BASE}/custom`, { waitUntil: 'networkidle' });
  await noSideways(page, '/custom (mobile)');
  await page.screenshot({ path: `${shots}/custom-mobile.png`, fullPage: true });
  const card = page.locator('a[class*="card"]', { hasText: 'Plasma-cut fire pit ring' }).first();
  check((await card.count()) === 1, 'piece not on /custom');
  check((await page.getByText('$450').count()) >= 1, '/custom does not show $450');
  await card.click();
  await page.waitForURL(/\/custom\/\d+-/, { timeout: 8000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  check(/\/custom\/\d+-plasma-cut-fire-pit-ring/.test(page.url()), `detail url wrong: ${page.url()}`);
  await noSideways(page, '/custom/[slug] (mobile)');
  await page.screenshot({ path: `${shots}/piece-detail-mobile.png`, fullPage: true });
  await page.getByRole('button', { name: /Ask about this piece/ }).click();
  await page.waitForTimeout(400);
  await page.fill('#pc-name', 'Test Buyer');
  await page.fill('#pc-phone', '801-555-0199');
  await page.fill('#pc-where', 'Payson');
  await page.fill('#pc-notes', 'Is it still available? Could you deliver to Payson?');
  await page.screenshot({ path: `${shots}/piece-ask-mobile.png`, fullPage: false });
  await page.getByRole('button', { name: /^Send it$/ }).click();
  await page.waitForTimeout(1500);
  check((await page.getByText(/That is with the shop/).count()) === 1, 'piece enquiry did not reach success');

  // Home strip.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  check((await page.getByText('for sale now').count()) >= 1, 'home page has no for-sale strip');
  await noSideways(page, '/ (mobile)');

  // Contact form.
  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
  await page.fill('#ct-name', 'Contact Person');
  await page.fill('#ct-phone', '3855550123');
  await page.fill('#ct-where', 'Spanish Fork');
  await page.selectOption('#ct-product', 'Custom fabrication');
  await page.fill('#ct-notes', 'A bracket for a 6x6 post, two of them, powder coated black.');
  await page.getByRole('button', { name: /^Send it$/ }).click();
  await page.waitForTimeout(1500);
  check((await page.getByText(/That is with the shop/).count()) === 1, 'contact form did not reach success');
  await noSideways(page, '/contact (mobile)');

  // Builder quote still works, with the honeypot in place.
  await page.goto(`${BASE}/build/garden-box`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Order this box/i }).click();
  await page.waitForTimeout(500);
  // The real checkbox is visually hidden behind its drawn box; tap the label.
  await page.getByText(/I understand this is built to order/).click();
  await page.fill('#q-name', 'Box Buyer');
  await page.fill('#q-phone', '801-555-0100');
  await page.fill('#q-where', 'Santaquin');
  await page.getByRole('button', { name: /^Send it$/ }).click();
  await page.waitForTimeout(1600);
  check((await page.getByText(/that spec is with the shop/i).count()) === 1, 'builder quote did not reach success');

  // Back to the panel: three requests, newest first.
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[role="tablist"]');
  const names = await page.locator('#view-requests [class*="rowName"]').allInnerTexts();
  check(names[0] === 'Box Buyer', `newest request should be Box Buyer, got ${names[0]}`);
  check(names.includes('Contact Person') && names.includes('Test Buyer'), `requests missing: ${names.join(', ')}`);
  await page.screenshot({ path: `${shots}/requests-mobile.png`, fullPage: true });

  // Open the first one, move its status, leave a note, send a review request.
  const first = page.locator('#view-requests li').first();
  await first.locator('button[class*="rowHead"]').click();
  await page.waitForTimeout(500);
  await first.getByRole('button', { name: 'Contacted' }).click();
  await page.waitForTimeout(600);
  check((await first.getByRole('button', { name: 'Contacted' }).getAttribute('aria-pressed')) === 'true', 'status did not move');
  await first.locator('textarea[aria-label="Private note"]').fill('Called, left a message.');
  await first.locator('textarea[aria-label="Review request message"]').focus(); // blur saves the note
  await page.waitForTimeout(500);
  const reviewMsg = await first.locator('textarea[aria-label="Review request message"]').inputValue();
  check(reviewMsg.startsWith('Hi Box,') && reviewMsg.includes(stamp), `review template not prefilled with first name + saved template: "${reviewMsg.slice(0, 60)}"`);
  await page.screenshot({ path: `${shots}/request-open-mobile.png`, fullPage: true });
  await first.getByRole('button', { name: /^Text \(801\)/ }).click();
  await page.waitForTimeout(2000);
  check((await first.getByText('Sent.').count()) === 1, 'review request did not report Sent');

  // Reviews tab: the send is there, and its tracked link works.
  await page.getByRole('tab', { name: 'Reviews' }).click();
  await page.waitForTimeout(300);
  const data = await page.evaluate(() => fetch('/api/admin/data').then((r) => r.json()));
  const sent = data.reviews.find((r) => r.name === 'Box Buyer');
  check(!!sent && sent.status === 'sent' && sent.token, 'review row missing or not sent');
  check(!!sent && sent.next_due_at, 'follow-up 1 was not scheduled');
  await page.screenshot({ path: `${shots}/reviews-mobile.png`, fullPage: true });

  // Adhoc send with a name, so a second row exists to rate high.
  await page.fill('#adhocPhone', '801-555-0177');
  await page.fill('#adhocName', 'Rachel Adhoc');
  await page.getByRole('button', { name: 'Send review request' }).click();
  await page.waitForTimeout(2000);
  const data2 = await page.evaluate(() => fetch('/api/admin/data').then((r) => r.json()));
  const adhoc = data2.reviews.find((r) => r.name === 'Rachel Adhoc');
  check(!!adhoc && adhoc.status === 'sent', 'adhoc review request not sent');
  check(!!adhoc && /Hi Rachel,/.test(adhoc.message), `adhoc message did not fill the name: ${adhoc && adhoc.message.slice(0, 40)}`);

  // The rating page, as the customer, with JavaScript off.
  const cust = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const cp = await cust.newPage();
  await cp.goto(`${BASE}/r/${sent.token}`, { waitUntil: 'networkidle' });
  check((await cp.getByRole('button', { name: '3 out of 5' }).count()) === 1, 'rating page has no stars');
  await cp.screenshot({ path: `${shots}/rate-ask-mobile.png`, fullPage: true });
  await noSideways(cp, '/r (mobile)');
  await cp.getByRole('button', { name: '3 out of 5' }).click();
  await cp.waitForLoadState('networkidle');
  check((await cp.getByText('We want to put this right.').count()) === 1, 'low rating did not show the feedback form');
  await cp.screenshot({ path: `${shots}/rate-low-mobile.png`, fullPage: true });
  await cp.fill('textarea[name="feedback"]', 'The gate latch sticks a little.');
  await cp.getByRole('button', { name: 'Send it to the shop' }).click();
  await cp.waitForLoadState('networkidle');
  check((await cp.getByText('We will see this and get back to you.').count()) === 1, 'feedback did not reach the done page');
  await cp.screenshot({ path: `${shots}/rate-done-mobile.png`, fullPage: true });
  // Coming back shows done, not the stars again.
  await cp.goto(`${BASE}/r/${sent.token}`, { waitUntil: 'networkidle' });
  check((await cp.getByRole('button', { name: '3 out of 5' }).count()) === 0, 'a rated link still shows stars');

  // High rating with no Google link: the thank-you fallback.
  await cp.goto(`${BASE}/r/${adhoc.token}`, { waitUntil: 'networkidle' });
  await cp.getByRole('button', { name: '5 out of 5' }).click();
  await cp.waitForLoadState('networkidle');
  check((await cp.getByText('Would you mind saying that on Google?').count()) === 1, 'high rating fallback page missing');
  await cp.screenshot({ path: `${shots}/rate-high-mobile.png`, fullPage: true });
  // An unknown token.
  await cp.goto(`${BASE}/r/nopenopenope`, { waitUntil: 'networkidle' });
  check((await cp.getByText('This link has expired.').count()) === 1, 'unknown token did not show the expired page');
  await cust.close();

  // The panel reflects all of it.
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[role="tablist"]');
  await page.getByRole('tab', { name: 'Reviews' }).click();
  const data3 = await page.evaluate(() => fetch('/api/admin/data').then((r) => r.json()));
  const rated = data3.reviews.find((r) => r.id === sent.id);
  check(rated && rated.rating === 3 && rated.feedback === 'The gate latch sticks a little.', 'rating/feedback not recorded');
  check(rated && rated.stopped_at && rated.stop_reason === 'rated' && !rated.next_due_at, 'follow-ups did not stop on rating');
  const high = data3.reviews.find((r) => r.id === adhoc.id);
  check(high && high.rating === 5 && high.clicked_at, 'high rating not recorded');
  const firstRow = page.locator('#view-reviews li').first();
  await firstRow.locator('button[class*="rowHead"]').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/review-open-mobile.png`, fullPage: true });

  // Run the sweep now: nothing is due yet, and it must not throw.
  await page.getByRole('tab', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Run now' }).click();
  await page.waitForTimeout(1200);
  check((await page.getByText(/sent of \d+ due/).count()) === 1, 'run-now did not report');

  // Webhook test through the dev echo.
  await page.fill('#testPhone', '801-555-0111');
  await page.getByRole('button', { name: 'Fire test' }).click();
  await page.waitForTimeout(1500);
  check((await page.getByText(/Fired\. GoHighLevel now has a sample/).count()) === 1, 'webhook test did not fire');

  // Deep link opens the request.
  const q = data3.quotes.find((x) => x.name === 'Contact Person');
  await page.goto(`${BASE}/admin?r=${q.id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[role="tablist"]');
  await page.waitForTimeout(600);
  const li = page.locator(`#quote-${q.id}`);
  check((await li.getAttribute('class')).includes('rowOpen'), 'deep link did not open the request');
  check((await li.getByText('Custom fabrication').count()) >= 1, 'contact request does not show its product');

  // Sign out actually signs out.
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForTimeout(500);
  check((await page.locator('#pw').count()) === 1, 'sign out did not return to the gate');
  const after = await page.evaluate(() => fetch('/api/admin/data').then((r) => r.status));
  check(after === 401, `API still open after sign out: ${after}`);

  await ctx.close();
}

/* ───────────────────────────────────────────── desktop, for the eye ─── */
{
  const { ctx, page } = await fresh({ width: 1440, height: 1000 });
  await login(page);
  await noSideways(page, '/admin (desktop)');
  await page.locator('#view-requests li').first().locator('button[class*="rowHead"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/requests-desktop.png`, fullPage: true });
  await page.getByRole('tab', { name: 'Pieces' }).click();
  await page.locator('#view-pieces li').first().locator('button[class*="rowHead"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/pieces-desktop.png`, fullPage: true });
  await page.getByRole('tab', { name: 'Settings' }).click();
  await page.screenshot({ path: `${shots}/settings-desktop.png`, fullPage: true });
  await page.goto(`${BASE}/custom`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${shots}/custom-desktop.png`, fullPage: true });
  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${shots}/contact-desktop.png`, fullPage: true });
  await ctx.close();
}

/* ───────────────────────────────────────────────── the guards ──────── */
{
  const res = await fetch(`${BASE}/api/quote`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
    body: JSON.stringify({ name: 'x', phone: '8015550100' }),
  });
  check(res.status === 403, `cross-origin quote POST should be 403, got ${res.status}`);
  const bot = await fetch(`${BASE}/api/quote`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: BASE },
    body: JSON.stringify({ name: 'Bot', phone: '8015550100', website: 'http://spam' }),
  });
  check(bot.status === 200, 'honeypot should answer 200 and drop the row');
  const gated = await fetch(`${BASE}/api/admin/data`);
  check(gated.status === 401, `admin data without a cookie should be 401, got ${gated.status}`);
  const media = await fetch(`${BASE}/media/999999-full.jpg`);
  check(media.status === 404, `missing photo should 404, got ${media.status}`);
}

await browser.close();

if (problems.length) {
  console.log('\nPROBLEMS:');
  for (const p of problems) console.log(' - ' + p);
  process.exit(1);
}
console.log(`\nAll good. Screenshots in ${shots}`);

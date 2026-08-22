# Accent Welding — build handoff

The site is in `site/`. Next.js 16 (App Router) + TypeScript + CSS Modules, no
Tailwind. Everything is static except the quote endpoint.

```bash
cd site
npm install
npm run dev      # http://localhost:3000
npm run build
```

---

## 1. The things Kelly has to answer before this goes live

These are the only blockers. Every one of them is wired to a single constant, so
answering it is a one-line change.

| # | Question | Where to change it | What happens today |
|---|---|---|---|
| 1 | **Which phone leads?** `801-691-3685` (business card + price list) or `385-241-4679` (both IG flyers)? | `src/config/business.ts` → `phone` / `phoneAlt` | 801 leads everywhere on the public site; 385 shows as the second line in the footer and on Contact, and is the "text the shop" link. The **panel texts 385** (Settings, Owner number). |
| 2 | **Which city** is 719 East Center Street in — Genola or Santaquin? | `src/config/business.ts` → `city`, then set `addressPublished: true` | No street address is published anywhere. The site ships as a service-area business and the schema uses a geo radius, not an address. A wrong city would be worse than none. |
| 3 | **Are the garden box prices current?** | `src/config/pricing.ts` → `boxPrices` | All 15 rows are published exactly as printed and quoted as firm prices. |
| 4 | **Licence number, liability, workers' comp?** | `src/config/business.ts` → `licensed`, `licenceNumber` | Footer says "Fabricated in Utah County, Utah". Set `licensed: true` and it renders the licence line instead. This is the strongest trust signal available to a shop with no reviews yet. |
| 5 | **Real hours?** | `src/config/business.ts` → `hoursPublished` | No hours claim is made. The site says "call or text". |
| 6 | **Real lead times?** | `src/config/pricing.ts` → `leadTimeWeeks` | 1–2 weeks boxes, 2–3 railing/gates, 3–4 fence. Currently a guess. |
| 7 | ~~Which domain?~~ **Settled:** the site lives at **accentweldingut.com** (custom domain on the Worker since 21 Aug 2026; the workers.dev address is disabled). | `src/config/site.ts` → `SITE_URL` | Every absolute link (share card, sitemap, schema, the review links in texts, the panel deep link) points at accentweldingut.com. `www.accentweldingut.com` is not attached yet; add it as a second custom domain on the Worker if people type it. |

## 2. Pricing — read this before you touch a number

`src/config/pricing.ts` is the only file with money in it, and it holds **two
different kinds of number**.

**✅ Real.** The 15 garden box prices, transcribed from the shop's own published
price list (`content/facebook/photos/fb-01-pricelist-UPRIGHT.jpg`). The garden
box builder quotes these exactly, as firm prices.

**⚠️ Placeholder.** Every railing, fence and gate rate. Accent Welding has never
published these, so they are industry-plausible stand-ins that make the pricing
engine complete and testable. **They are not Kelly's prices.**

Because of that, those three builders never show an exact figure. They show an
*estimated range*, labelled "Preliminary estimate", with on-screen text saying a
firm number comes from a free site visit.

**To go live with real rates:** replace the values under `RATES_TO_CONFIRM` and
set `ratesConfirmed = true`. That single flag relabels the UI from "Preliminary
estimate" to "Estimate" and tightens the range from ±22% to ±10%. Nothing else
needs changing.

## 3. Where quote submissions go: the shop panel

Every form on the site (the four builders, the contact page, "ask about this
piece") posts to `POST /api/quote`, which writes the row to the `quotes` table
in the site's own Cloudflare D1 database and texts the owner. They show up in
the **shop panel at `/admin`** the moment they land.

The panel (password-gated, built for a phone) does four things:

- **Requests**: every submission, newest first, numbered. Open one to read the
  spec exactly as the customer saw it, call or email them, mark where it
  stands (new / contacted / scheduled / done), leave a private note, or text
  them a review request with the message already prefilled.
- **Reviews**: the full send history with what came back (opened, the star
  they gave, any feedback), plus a box for texting anyone who never went
  through the site. Each row shows where its follow-ups stand and can stop them.
- **Pieces**: the for-sale board. Give a piece a name, a price and a few words,
  add photos straight from the phone (resized in the browser before upload),
  choose *For sale / Sold / Hidden*, and it is live at `/custom` and on the
  home page. Each piece has its own shareable page at `/custom/<id>-<slug>`
  with an "Ask about this piece" form and a text-the-shop link.
- **Settings**: the owner number (seeded to **385-241-4679**, the line that
  takes texts), the alert on/off switch, every line of text the system sends,
  the follow-up ladder (24h / 24h / 48h by default), the rating page on/off
  (on by default) with its threshold and copy, the Google review link, a
  webhook mapping test, and a "run follow-ups now" button.

### The review journey

Every review text carries a tracked link to `/r/<token>`, never the Google URL
directly. Tapping it is recorded and calls off the remaining follow-ups. With
the rating page on (the default) they pick a star: at or above the threshold
(default 4) they are sent to the Google review link; below it they get a
private box, and what they write is texted to the owner instead of going
anywhere public. If they never tap, three follow-ups go out: day 1, day 2,
day 4. The rating page has no JavaScript at all; every step is a plain form
POST, so it works on any phone on bad signal.

> **Worth knowing:** asking for a star before showing the Google link is review
> gating, and Google's policies prohibit it. It is on because it was asked for.
> **Settings, Rating page, off** makes the link count the tap and forward
> everyone straight to Google, which is the compliant behaviour and keeps the
> tracking.

Follow-ups would normally run from a cron trigger, but the account is at
Cloudflare's limit of 5 cron triggers (API error 10072), so the app sweeps off
ordinary traffic instead: any request to the form endpoint, the panel, the
rating page or `/custom` checks whether a sweep is due and sends whatever has
come due, at most once every ten minutes, with a compare-and-set claim so two
requests can never double-send. With no traffic at all nothing fires; in
practice there is plenty, and Settings has **Run now**. Free a cron slot on
another Worker and uncomment `triggers` in `wrangler.jsonc` to make it exact.

### What it is made of

| Thing | Where | Notes |
|---|---|---|
| Database | Cloudflare D1 `accent-welding` | bound as `DB` in `wrangler.jsonc`; schema in `db/schema.sql`, applied remote + local |
| Photo bytes | Cloudflare KV `accent-welding-media` | bound as `MEDIA`. R2 would be the natural home but it is not enabled on this account (needs a dashboard step and a card on file); KV needs neither and serves from the edge cache. Swapping later is one file: `site/src/lib/server/media.ts` |
| Password | Worker secret `ADMIN_PASSWORD` | set. Change it with `npx wrangler secret put ADMIN_PASSWORD` from the repo root |
| Sessions | Worker secret `SESSION_SECRET` | set. Changing it signs everyone out |
| Texts | Worker secret `GHL_WEBHOOK_URL` | **not set yet, the one thing left.** See below |
| Server code | `site/src/lib/server/` + `site/src/app/api/` | auth, quotes, reviews, follow-ups, items, media, settings |
| Panel UI | `site/src/app/admin/` | a client React app in the site's own design system |
| Rating page | `site/src/app/r/[token]/` + `api/r/[token]` | no-JS |
| For-sale pages | `site/src/app/(site)/custom/` | plus the home-page strip in `components/home/ForSale.tsx` |

### Turning the texts on (the one open step)

The GoHighLevel inbound webhook URL is the only thing not set. From the repo root:

```bash
npx wrangler secret put GHL_WEBHOOK_URL
```

Paste the trigger URL when prompted. Every send posts exactly three fields:
`phone` (E.164), `sms-message`, `company` ("Accent Welding", from `COMPANY_NAME`
in `wrangler.jsonc`). Then open the panel, Settings, **Webhook mapping test**,
enter a number and fire one, so the GoHighLevel workflow has an inbound sample
to map its fields against. Until the secret is set, every send is logged in the
panel as *failed* with "GHL_WEBHOOK_URL secret is not set", nothing is lost, and
the site is otherwise fully live.

Also worth doing: the **Google review link** in Settings is blank because the
shop has no Google Business Profile yet. Until it is filled in, a 4+ star
rating sees a thank-you instead of being sent to Google.

### Running it locally

`site/next.config.ts` gives `next dev` the same bindings the deployed Worker
has, via miniflare, from `wrangler.jsonc` and `.dev.vars` at the repo root
(gitignored; password `dev`, webhook pointed at the app's own `/api/dev/echo`
so "sent" paths run without texting anyone). The local database lives in
`.wrangler/state/v3` at the repo root:

```bash
npx wrangler d1 execute accent-welding --local --file=db/schema.sql   # once
cd site && npm run dev                                                  # then /admin, password "dev"
node verify-admin.mjs   # drives the whole thing end to end, mobile first, screenshots to ../shots/admin
```

## 4. Content gaps worth chasing

- **Gate photographs.** There is not one dedicated gate photo in the whole
  archive. The Gates card on the home page shows a *drawing* rather than
  borrowing a fence photo and calling it a gate. Send photos and swap the
  `media` prop in `src/app/page.tsx`.
- **The login-walled garden box carousel** (Instagram, 15 May 2026) holds box
  photos we do not have.
- **Higher-resolution originals.** Everything here came off Facebook at 1536px.
  The camera roll will have better, and on the full-bleed bands it would show.
- **A named testimonial.** All Home Services has posted four collaboration reels
  crediting the shop. Worth asking them for a quote on the record and permission
  to use their logo.
- **The truncated Facebook intro**, which Facebook cuts at "…stronger and m".

## 5. How it is put together

```
src/config/        business.ts, pricing.ts, products.ts — every fact and number
src/drawings/      the parametric shop-drawing engine (SVG, drawn to scale)
src/components/    Nav, Footer, Hero, Mark, Lockup, Star, EnquiryForm, controls/, builder/, page/, home/
src/lib/server/    everything that touches D1 / KV / the webhook (server only)
src/app/(site)/    the public site: routes, build/* configurators, custom/ for-sale pages
src/app/admin/     the shop panel
src/app/r/         the rating page behind every review text
src/app/api/       quote intake, the panel API, the rating POST; media/ serves photos
```

**The drawings are the point.** Each is a real scale projection driven by the
configurator state, not a picture: the garden box is an axonometric, the rest are
elevations. Dimensions read as `8′-0″`, picket spacing is drawn at the 4″ code
maximum, and the whole thing redraws with a spring when you change a number.
`fitViewBox()` crops each drawing to its own content, so a 34″ rail and a 6 ft
privacy panel both sit centred in the panel.

**Brand.** The longhorn mark in `src/components/markPaths.ts` was traced from the
business card artwork and verified by pixel overlay. It is one path with
`fill-rule="evenodd"`, so the eye sockets and nostrils are true holes and it sits
on any background with no tile behind it. Palette is the sampled `#222020`
warm charcoal, `#D5BA8C` buckskin and white. Type is Trench Slab (display) and
Synonym (body), both self-hosted woff2 — no Google Fonts anywhere.

## 6. Checking it still works

```bash
npm run build            # typecheck + build
npx eslint src           # lint
node verify.mjs          # every page at desktop + mobile, every control clicked
node verify-admin.mjs    # the panel, the forms, the rating page, end to end (needs npm run dev)
node shoot.mjs "" 1440   # full-page screenshot with lazy images settled
```

`verify.mjs` asserts real things: that changing a footprint moves the price, that
8×4×18 powder-coated quotes exactly $1,650, that the drawing actually redraws,
that the quote dialog blocks submission until the acknowledgment is ticked, that
no page scrolls sideways, and that there are no dead links. It reports four
known-benign "overflowing element" lines — the hero photo inside its
`overflow:hidden` frame, an SVG group inside its viewBox, and the price table
inside its own `overflow-x` container — plus one 404 from the deliberate
`/nope-404` route test.

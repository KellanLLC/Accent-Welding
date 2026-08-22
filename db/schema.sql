-- Accent Welding — shop panel schema (Cloudflare D1 / SQLite)
--
-- Apply to production:   npx wrangler d1 execute accent-welding --remote --file=db/schema.sql
-- Apply to local dev:    npx wrangler d1 execute accent-welding --local  --file=db/schema.sql
--
-- Every statement is idempotent (IF NOT EXISTS / INSERT OR IGNORE), so running
-- it again on a live database changes nothing and loses nothing.

-- ─────────────────────────────────────────────────────────────── quotes ──
-- Every submission from the website: the four builders, the contact form, and
-- "ask about this piece" on a listed item. `spec` is the JSON list of
-- key/value rows the builder produced, so the panel can show the drawing's
-- title block exactly as the customer saw it.
CREATE TABLE IF NOT EXISTS quotes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product     TEXT    NOT NULL,                -- "Garden box", "Railing", "Custom fabrication", a piece's title…
  spec        TEXT    NOT NULL DEFAULT '[]',   -- JSON [{key, value}]
  price       TEXT,                            -- the label the customer saw, e.g. "Estimate: $1,650"
  name        TEXT    NOT NULL,
  phone       TEXT    NOT NULL,                -- E.164
  phone_raw   TEXT,                            -- exactly what they typed
  email       TEXT,
  town        TEXT,
  notes       TEXT,
  source      TEXT    NOT NULL DEFAULT 'builder',   -- builder | contact | piece
  status      TEXT    NOT NULL DEFAULT 'new',       -- new | contacted | scheduled | done
  note        TEXT,                                 -- private, panel only
  ip          TEXT,
  user_agent  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status  ON quotes (status);

-- ──────────────────────────────────────────────────────── review requests ──
-- Every review-request text handed to GoHighLevel, successful or not, plus
-- the tracked link, the star they gave, and where the follow-up ladder stands.
CREATE TABLE IF NOT EXISTS review_requests (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id     INTEGER,                 -- set when sent from a quote row
  name         TEXT,
  phone        TEXT    NOT NULL,
  message      TEXT    NOT NULL,
  status       TEXT    NOT NULL,        -- sent | failed
  error        TEXT,
  token        TEXT,                    -- the /r/<token> short link
  clicked_at   TEXT,                    -- first tap on that link
  rating       INTEGER,                 -- 1..5, once they answer
  feedback     TEXT,                    -- private note from a low rating
  step         INTEGER NOT NULL DEFAULT 0,
  next_due_at  TEXT,                    -- when follow-up (step+1) fires
  stopped_at   TEXT,
  stop_reason  TEXT,                    -- clicked | rated | manual | exhausted | send_failed
  created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON review_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_quote   ON review_requests (quote_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_token ON review_requests (token);
-- The follow-up sweep reads exactly this: rows still running, with a rung due.
CREATE INDEX IF NOT EXISTS idx_reviews_due ON review_requests (next_due_at)
  WHERE stopped_at IS NULL;

-- ─────────────────────────────────────────────────────────────── pieces ──
-- One-off pieces fabricated in the shop and listed for sale on /custom.
-- Photo bytes live in KV (see site/src/lib/server/media.ts); this table holds
-- everything else.
CREATE TABLE IF NOT EXISTS items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  price       TEXT,                            -- free text as typed: "$450", "450", "Ask"
  description TEXT,
  status      TEXT    NOT NULL DEFAULT 'draft', -- draft (hidden) | live (for sale) | sold (shown, marked sold)
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_items_status ON items (status, id DESC);

CREATE TABLE IF NOT EXISTS item_photos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id     INTEGER NOT NULL,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  sort        INTEGER NOT NULL DEFAULT 0,     -- lowest first; 0 is the cover
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_photos_item ON item_photos (item_id, sort, id);

-- ───────────────────────────────────────────────────────────── settings ──
-- Small key/value bag so every number and every line of text the panel sends
-- is editable from the panel instead of needing a redeploy.
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

INSERT OR IGNORE INTO settings (key, value) VALUES
  -- Who gets texted when the website form is submitted and when a customer
  -- leaves low-star feedback. The 385 line is the one that takes texts.
  ('owner_phone',    '+13852414679'),
  ('notify_owner',   '1'),

  -- Claimed by whichever request runs the follow-up sweep. Must exist as a
  -- row: the claim is an UPDATE, and an UPDATE cannot create one.
  ('last_sweep_at',  ''),

  -- What lands on the owner's phone when a request comes in. {{link}} opens
  -- the panel on that exact request.
  ('owner_alert_template', 'New request from {{name}} ({{phone}}): {{product}}. See it here: {{link}}'),

  -- The first review text. {{link}} is the tracked link to the rating page.
  ('review_template', 'Hi {{name}}, this is Accent Welding. Thanks again for letting us build for you. Mind telling us how we did? {{link}}'),

  -- Where a 4+ star rating gets sent. Blank until the shop has a Google
  -- Business Profile; the rating page shows a thank-you instead until then.
  ('google_review_url', ''),

  -- Rating page (the screen between the text and Google). On by default.
  ('screening_enabled',   '1'),
  ('screening_threshold', '4'),
  ('screening_headline',  'How did we do?'),
  ('screening_sub',       'Tap a star. It takes a second and it genuinely helps a small shop.'),
  ('screening_high_head', 'Thank you.'),
  ('screening_high_sub',  'Would you mind saying that on Google? It is the single biggest thing that helps a shop like ours.'),
  ('screening_low_head',  'We want to put this right.'),
  ('screening_low_sub',   'Tell us what went wrong and it comes straight to the shop, not to a public page.'),
  ('screening_done_head', 'Thank you.'),
  ('screening_done_sub',  'We will see this and get back to you.'),

  -- The follow-up ladder. Hours are counted from the previous message.
  ('followup_1_hours', '24'),
  ('followup_2_hours', '24'),
  ('followup_3_hours', '48'),
  ('followup_1_template', 'Hi {{name}}, Accent Welding again. Did you get a chance to tell us how the job went? {{link}}'),
  ('followup_2_template', 'Hi {{name}}, one more nudge from Accent Welding. Thirty seconds is all it takes: {{link}}'),
  ('followup_3_template', 'Hi {{name}}, last time we will ask. If we did right by you, it would mean a lot: {{link}} Thanks either way.');

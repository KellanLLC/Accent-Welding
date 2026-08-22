/**
 * The shapes the panel API returns. Shared by the route handlers (server) and
 * the panel UI (client), so a column added in one place is typed in the other.
 */

export type QuoteStatus = 'new' | 'contacted' | 'scheduled' | 'done';
export const QUOTE_STATUSES: { key: QuoteStatus; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'done', label: 'Done' },
];

export type SpecRow = { key: string; value: string };

export type Quote = {
  id: number;
  product: string;
  spec: SpecRow[];
  price: string | null;
  name: string;
  phone: string;
  phone_raw: string | null;
  email: string | null;
  town: string | null;
  notes: string | null;
  source: 'builder' | 'contact' | 'piece';
  status: QuoteStatus;
  note: string | null;
  created_at: string;
};

export type ReviewRequest = {
  id: number;
  quote_id: number | null;
  name: string | null;
  phone: string;
  message: string;
  status: 'sent' | 'failed';
  error: string | null;
  token: string | null;
  clicked_at: string | null;
  rating: number | null;
  feedback: string | null;
  step: number;
  next_due_at: string | null;
  stopped_at: string | null;
  stop_reason: string | null;
  created_at: string;
};

export type ItemStatus = 'draft' | 'live' | 'sold';

export type ItemPhoto = {
  id: number;
  item_id: number;
  width: number;
  height: number;
  sort: number;
};

export type Item = {
  id: number;
  slug: string;
  title: string;
  price: string | null;
  description: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
  photos: ItemPhoto[];
};

export type PanelData = {
  quotes: Quote[];
  reviews: ReviewRequest[];
  items: Item[];
  settings: Record<string, string>;
};

/** `/media/<id>-full.jpg` and `/media/<id>-thumb.jpg`, served from KV. */
export function photoUrl(id: number, size: 'full' | 'thumb') {
  return `/media/${id}-${size}.jpg`;
}

/** "450" → "$450"; "$1,200" stays; "Ask" stays; blank → "Ask". */
export function displayPrice(raw: string | null | undefined) {
  const v = String(raw ?? '').trim();
  if (!v) return 'Ask for price';
  if (/^\d[\d,]*(\.\d{1,2})?$/.test(v)) return `$${v}`;
  return v;
}

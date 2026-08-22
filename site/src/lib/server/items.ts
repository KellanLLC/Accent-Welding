import type { Item, ItemPhoto, ItemStatus } from '@/lib/panel-types';
import { db } from './env';

export const ITEM_STATUSES: ItemStatus[] = ['draft', 'live', 'sold'];

type ItemRow = Omit<Item, 'photos'>;

export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'piece'
  );
}

async function attachPhotos(rows: ItemRow[]): Promise<Item[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const { results } = await db()
    .prepare(
      `SELECT id, item_id, width, height, sort FROM item_photos
        WHERE item_id IN (${ids.map(() => '?').join(',')})
        ORDER BY item_id, sort, id`,
    )
    .bind(...ids)
    .all<ItemPhoto>();
  const byItem = new Map<number, ItemPhoto[]>();
  for (const p of results || []) {
    const list = byItem.get(p.item_id) || [];
    list.push(p);
    byItem.set(p.item_id, list);
  }
  return rows.map((r) => ({ ...r, photos: byItem.get(r.id) || [] }));
}

/** Everything, for the panel. */
export async function listItems(): Promise<Item[]> {
  const { results } = await db()
    .prepare(`SELECT id, slug, title, price, description, status, created_at, updated_at FROM items ORDER BY id DESC`)
    .all<ItemRow>();
  return attachPhotos(results || []);
}

/** What the public page shows: for sale first, then sold, newest first in each. */
export async function listPublicItems(): Promise<Item[]> {
  const { results } = await db()
    .prepare(
      `SELECT id, slug, title, price, description, status, created_at, updated_at FROM items
        WHERE status IN ('live','sold')
        ORDER BY CASE status WHEN 'live' THEN 0 ELSE 1 END, id DESC`,
    )
    .all<ItemRow>();
  return attachPhotos(results || []);
}

export async function getItem(id: number): Promise<Item | null> {
  const row = await db()
    .prepare(`SELECT id, slug, title, price, description, status, created_at, updated_at FROM items WHERE id = ?1`)
    .bind(id)
    .first<ItemRow>();
  if (!row) return null;
  return (await attachPhotos([row]))[0];
}

/** Public URL is /custom/<id>-<slug>; only the id has to match. */
export async function getPublicItemByPath(path: string): Promise<Item | null> {
  const id = Number(/^(\d+)/.exec(path)?.[1]);
  if (!Number.isInteger(id)) return null;
  const item = await getItem(id);
  return item && item.status !== 'draft' ? item : null;
}

export async function createItem(fields: { title: string; price: string; description: string; status: ItemStatus }) {
  const row = await db()
    .prepare(
      `INSERT INTO items (slug, title, price, description, status)
       VALUES (?1, ?2, ?3, ?4, ?5)
       RETURNING id, slug, title, price, description, status, created_at, updated_at`,
    )
    .bind(slugify(fields.title), fields.title, fields.price || null, fields.description || null, fields.status)
    .first<ItemRow>();
  return row ? { ...row, photos: [] as ItemPhoto[] } : null;
}

export async function updateItem(
  id: number,
  fields: Partial<{ title: string; price: string; description: string; status: ItemStatus }>,
) {
  const sets: string[] = [];
  const binds: unknown[] = [];
  if (typeof fields.title === 'string') {
    binds.push(fields.title);
    sets.push(`title = ?${binds.length}`);
    binds.push(slugify(fields.title));
    sets.push(`slug = ?${binds.length}`);
  }
  if (typeof fields.price === 'string') {
    binds.push(fields.price || null);
    sets.push(`price = ?${binds.length}`);
  }
  if (typeof fields.description === 'string') {
    binds.push(fields.description || null);
    sets.push(`description = ?${binds.length}`);
  }
  if (fields.status) {
    binds.push(fields.status);
    sets.push(`status = ?${binds.length}`);
  }
  if (!sets.length) return getItem(id);
  sets.push(`updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')`);
  binds.push(id);
  await db()
    .prepare(`UPDATE items SET ${sets.join(', ')} WHERE id = ?${binds.length}`)
    .bind(...binds)
    .run();
  return getItem(id);
}

export async function deleteItem(id: number): Promise<number[]> {
  const { results } = await db()
    .prepare('SELECT id FROM item_photos WHERE item_id = ?1')
    .bind(id)
    .all<{ id: number }>();
  const photoIds = (results || []).map((r) => r.id);
  await db().prepare('DELETE FROM item_photos WHERE item_id = ?1').bind(id).run();
  await db().prepare('DELETE FROM items WHERE id = ?1').bind(id).run();
  return photoIds;
}

export async function addPhoto(itemId: number, width: number, height: number): Promise<ItemPhoto | null> {
  const next = await db()
    .prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM item_photos WHERE item_id = ?1')
    .bind(itemId)
    .first<{ n: number }>();
  return db()
    .prepare(
      `INSERT INTO item_photos (item_id, width, height, sort) VALUES (?1, ?2, ?3, ?4)
       RETURNING id, item_id, width, height, sort`,
    )
    .bind(itemId, width, height, next?.n ?? 0)
    .first<ItemPhoto>();
}

export async function getPhoto(id: number) {
  return db().prepare('SELECT id, item_id, width, height, sort FROM item_photos WHERE id = ?1').bind(id).first<ItemPhoto>();
}

export async function deletePhoto(id: number) {
  await db().prepare('DELETE FROM item_photos WHERE id = ?1').bind(id).run();
}

/** Moves one photo to the front; the rest keep their order behind it. */
export async function makeCover(photo: ItemPhoto) {
  const { results } = await db()
    .prepare('SELECT id FROM item_photos WHERE item_id = ?1 ORDER BY sort, id')
    .bind(photo.item_id)
    .all<{ id: number }>();
  const order = [photo.id, ...(results || []).map((r) => r.id).filter((id) => id !== photo.id)];
  const stmts = order.map((id, i) =>
    db().prepare('UPDATE item_photos SET sort = ?2 WHERE id = ?1').bind(id, i),
  );
  if (stmts.length) await db().batch(stmts);
}

/** Touch updated_at when a photo changes, so the public page's cache key moves. */
export async function touchItem(id: number) {
  await db()
    .prepare(`UPDATE items SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = ?1`)
    .bind(id)
    .run();
}

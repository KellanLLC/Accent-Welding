'use client';

import { useEffect, useRef, useState } from 'react';
import { displayPrice, photoUrl, type Item, type ItemPhoto, type ItemStatus, type PanelData } from '@/lib/panel-types';
import { resizeImage } from '@/lib/resizeImage';
import { Head } from './Requests';
import { ActionButton, Chev, Empty, Msg, api, shortDate, useAction } from './ui';
import s from './admin.module.css';

type Props = { data: PanelData; setData: React.Dispatch<React.SetStateAction<PanelData>> };

const STATUS_OPTS: { key: ItemStatus; label: string; note: string }[] = [
  { key: 'live', label: 'For sale', note: 'Shown on the site' },
  { key: 'sold', label: 'Sold', note: 'Still shown, marked sold' },
  { key: 'draft', label: 'Hidden', note: 'Only you can see it' },
];

export function Pieces({ data, setData }: Props) {
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const newBtn = (
    <button type="button" className="btn" onClick={() => setCreating(true)} disabled={creating}>
      New piece
    </button>
  );

  return (
    <>
      <Head
        title="Pieces for sale"
        copy="One-off work that is built and ready to go. Anything marked for sale shows at /custom on the site, with its photos and price."
        action={newBtn}
      />

      {creating ? (
        <div className={`plate ${s.panel}`}>
          <div className={`plateInner ${s.panelInner}`}>
            <Editor
              onDone={(item) => {
                if (item) setData((d) => ({ ...d, items: [item, ...d.items] }));
                setCreating(false);
              }}
              setData={setData}
            />
          </div>
        </div>
      ) : null}

      {!data.items.length && !creating ? (
        <Empty title="Nothing listed yet">
          Tap New piece, give it a name and a price, add a photo or two from your phone, and it is on the site.
        </Empty>
      ) : (
        <ul className={s.list}>
          {data.items.map((it) => (
            <li key={it.id} className={`${s.row} ${open[it.id] ? s.rowOpen : ''}`}>
              <button
                type="button"
                className={s.rowHead}
                onClick={() => setOpen((o) => ({ ...o, [it.id]: !o[it.id] }))}
                aria-expanded={!!open[it.id]}
              >
                <span className={s.rowLead}>
                  {it.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={s.pieceThumb} src={photoUrl(it.photos[0].id, 'thumb')} alt="" width={44} height={44} />
                  ) : (
                    <span className={`${s.pieceThumb} ${s.pieceThumbEmpty}`} aria-hidden="true" />
                  )}
                </span>
                <span className={s.rowMain}>
                  <span className={s.rowName}>{it.title}</span>
                  <span className={s.rowSub}>
                    {displayPrice(it.price)} · {STATUS_OPTS.find((o) => o.key === it.status)?.label} ·{' '}
                    {it.photos.length} photo{it.photos.length === 1 ? '' : 's'}
                  </span>
                </span>
                <span className={s.rowMeta}>{shortDate(it.created_at)}</span>
                <Chev open={!!open[it.id]} />
              </button>
              <div className={s.rowBody}>
                <div className={s.rowBodyInner}>
                  {open[it.id] ? (
                    <Editor
                      item={it}
                      setData={setData}
                      onDone={() => setOpen((o) => ({ ...o, [it.id]: false }))}
                    />
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

type Pending = { file: File; url: string };

function Editor({
  item,
  setData,
  onDone,
}: {
  item?: Item;
  setData: Props['setData'];
  onDone: (created?: Item) => void;
}) {
  const [title, setTitle] = useState(item?.title || '');
  const [price, setPrice] = useState(item?.price || '');
  const [desc, setDesc] = useState(item?.description || '');
  const [status, setStatus] = useState<ItemStatus>(item?.status || 'live');
  const [pending, setPending] = useState<Pending[]>([]);
  const [busyPhotos, setBusyPhotos] = useState(0);
  const [err, setErr] = useState('');
  const save = useAction();
  const del = useAction();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => pending.forEach((p) => URL.revokeObjectURL(p.url)), [pending]);

  const patchItem = (id: number, fn: (it: Item) => Item) =>
    setData((d) => ({ ...d, items: d.items.map((x) => (x.id === id ? fn(x) : x)) }));

  async function upload(itemId: number, file: File): Promise<ItemPhoto | null> {
    const r = await resizeImage(file);
    const form = new FormData();
    form.append('full', r.full, 'full.jpg');
    form.append('thumb', r.thumb, 'thumb.jpg');
    form.append('width', String(r.width));
    form.append('height', String(r.height));
    const res = await api<{ photo?: ItemPhoto }>(`/api/admin/items/${itemId}/photos`, { method: 'POST', form });
    if (!res.ok) throw new Error(res.data.error || 'Upload failed.');
    return res.data.photo || null;
  }

  // Existing piece: photos upload the moment they are picked.
  // New piece: they wait as previews and go up after the piece is created.
  const onPick = async (files: FileList | null) => {
    if (!files?.length) return;
    setErr('');
    if (!item) {
      setPending((p) => [...p, ...Array.from(files).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
      return;
    }
    setBusyPhotos((n) => n + files.length);
    for (const file of Array.from(files)) {
      try {
        const photo = await upload(item.id, file);
        if (photo) patchItem(item.id, (it) => ({ ...it, photos: [...it.photos, photo] }));
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Upload failed.');
      } finally {
        setBusyPhotos((n) => n - 1);
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const removePhoto = async (photo: ItemPhoto) => {
    if (!item) return;
    patchItem(item.id, (it) => ({ ...it, photos: it.photos.filter((p) => p.id !== photo.id) }));
    const r = await api(`/api/admin/photos/${photo.id}`, { method: 'DELETE' });
    if (!r.ok) patchItem(item.id, (it) => ({ ...it, photos: [...it.photos, photo].sort((a, b) => a.sort - b.sort || a.id - b.id) }));
  };

  const makeCover = async (photo: ItemPhoto) => {
    if (!item) return;
    patchItem(item.id, (it) => ({ ...it, photos: [photo, ...it.photos.filter((p) => p.id !== photo.id)] }));
    await api(`/api/admin/photos/${photo.id}`, { method: 'PATCH', body: { cover: true } });
  };

  const submit = () => {
    if (!title.trim()) {
      setErr('Give the piece a name.');
      return;
    }
    setErr('');
    save.run(async () => {
      const body = { title: title.trim(), price: price.trim(), description: desc.trim(), status };
      if (item) {
        const r = await api<{ item?: Item }>(`/api/admin/items/${item.id}`, { method: 'PATCH', body });
        if (!r.ok || !r.data.item) {
          setErr(r.data.error || 'Could not save.');
          return false;
        }
        const saved = r.data.item;
        patchItem(item.id, () => saved);
        return true;
      }
      const r = await api<{ item?: Item }>('/api/admin/items', { method: 'POST', body });
      if (!r.ok || !r.data.item) {
        setErr(r.data.error || 'Could not save.');
        return false;
      }
      const created = r.data.item;
      const photos: ItemPhoto[] = [];
      for (const p of pending) {
        try {
          const photo = await upload(created.id, p.file);
          if (photo) photos.push(photo);
        } catch (e) {
          setErr(e instanceof Error ? e.message : 'A photo did not upload.');
        }
      }
      onDone({ ...created, photos });
      return true;
    });
  };

  const remove = () => {
    if (!item) return;
    if (!window.confirm(`Delete "${item.title}" and its photos? This cannot be undone.`)) return;
    del.run(async () => {
      const r = await api(`/api/admin/items/${item.id}`, { method: 'DELETE' });
      if (!r.ok) return false;
      setData((d) => ({ ...d, items: d.items.filter((x) => x.id !== item.id) }));
      onDone();
      return true;
    });
  };

  const uid = item ? `p${item.id}` : 'pnew';
  const photos = item?.photos || [];

  return (
    <div className={s.editor}>
      <div className={s.editorFields}>
        <div>
          <label className={s.label} htmlFor={`${uid}-title`}>Name</label>
          <input id={`${uid}-title`} className={s.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Plasma-cut fire pit ring, 36 in" autoComplete="off" />
        </div>
        <div>
          <label className={s.label} htmlFor={`${uid}-price`}>Price</label>
          <input id={`${uid}-price`} className={s.input} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="450, or leave blank for “ask”" inputMode="decimal" autoComplete="off" />
        </div>
        <div className={s.editorWide}>
          <label className={s.label} htmlFor={`${uid}-desc`}>About it</label>
          <textarea id={`${uid}-desc`} className={s.textarea} value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="What it is, what it is made of, size, finish, whether you will deliver." />
        </div>
      </div>

      <span className={`${s.label} ${s.labelGap}`}>Photos</span>
      <div className={s.photos}>
        {photos.map((p, i) => (
          <figure key={p.id} className={s.photo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl(p.id, 'thumb')} alt="" className={s.photoImg} />
            <figcaption className={s.photoActions}>
              {i === 0 ? (
                <span className={s.photoCover}>Cover</span>
              ) : (
                <button type="button" className={s.photoBtn} onClick={() => makeCover(p)}>Make cover</button>
              )}
              <button type="button" className={s.photoBtn} onClick={() => removePhoto(p)}>Remove</button>
            </figcaption>
          </figure>
        ))}
        {pending.map((p, i) => (
          <figure key={p.url} className={s.photo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className={s.photoImg} />
            <figcaption className={s.photoActions}>
              {i === 0 ? <span className={s.photoCover}>Cover</span> : <span />}
              <button
                type="button"
                className={s.photoBtn}
                onClick={() => setPending((list) => list.filter((x) => x !== p))}
              >
                Remove
              </button>
            </figcaption>
          </figure>
        ))}
        <label className={s.addPhotos}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onPick(e.target.files)}
            className="sr"
          />
          <span className={s.addPhotosPlus} aria-hidden="true">+</span>
          <span>{busyPhotos ? `Uploading ${busyPhotos}…` : photos.length || pending.length ? 'Add more' : 'Add photos'}</span>
        </label>
      </div>

      <span className={`${s.label} ${s.labelGap}`}>Where it shows</span>
      <div className={s.segmented} role="radiogroup" aria-label="Status">
        {STATUS_OPTS.map((o) => (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={status === o.key}
            className={`${s.seg} ${status === o.key ? s.segOn : ''}`}
            onClick={() => setStatus(o.key)}
          >
            <span>{o.label}</span>
            <small>{o.note}</small>
          </button>
        ))}
      </div>

      <div className={s.editorActions}>
        <ActionButton
          phase={save.phase}
          labels={{ idle: item ? 'Save changes' : 'List it', busy: 'Saving…', done: 'Saved', failed: 'Not saved' }}
          onClick={submit}
          disabled={busyPhotos > 0}
        />
        {item ? (
          <>
            {item.status !== 'draft' ? (
              <a className={s.textLink} href={`/custom/${item.id}-${item.slug}`} target="_blank" rel="noopener">
                View on the site
              </a>
            ) : null}
            <ActionButton kind="dark" phase={del.phase} labels={{ idle: 'Delete', busy: 'Deleting…', done: 'Deleted', failed: 'Could not delete' }} onClick={remove} />
          </>
        ) : (
          <button type="button" className={s.textLink} onClick={() => onDone()}>
            Cancel
          </button>
        )}
      </div>
      <Msg text={err} kind="err" />
    </div>
  );
}

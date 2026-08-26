'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mark } from '@/components/Mark';
import type { PanelData } from '@/lib/panel-types';
import { ActionButton, Msg, api, useAction } from './ui';
import { Requests } from './Requests';
import { Reviews } from './Reviews';
import { Pieces } from './Pieces';
import { SettingsView } from './SettingsView';
import { SpamView } from './Spam';
import s from './admin.module.css';

type Tab = 'requests' | 'reviews' | 'pieces' | 'settings';

const EMPTY: PanelData = { quotes: [], reviews: [], items: [], settings: {} };

export function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<PanelData>(EMPTY);
  const [tab, setTab] = useState<Tab>('requests');
  const [openQuote, setOpenQuote] = useState<number | null>(null);
  const [spamOpen, setSpamOpen] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');
  const deepLinked = useRef(false);

  const refresh = useCallback(async () => {
    const r = await api<PanelData>('/api/admin/data');
    if (r.status === 401) {
      setAuthed(false);
      return false;
    }
    if (!r.ok) throw new Error(r.data.error || 'Could not load.');
    const quotes = r.data.quotes || [];
    setData({
      quotes,
      reviews: r.data.reviews || [],
      items: r.data.items || [],
      settings: r.data.settings || {},
    });
    setAuthed(true);

    // The owner alert links to /admin?r=<id>: open that request rather than
    // dropping them at the top of the list to hunt for it. Once only.
    if (!deepLinked.current) {
      deepLinked.current = true;
      const m = /[?&]r=(\d+)/.exec(window.location.search);
      const id = m ? Number(m[1]) : NaN;
      if (quotes.some((q) => q.id === id)) {
        setTab('requests');
        setOpenQuote(id);
        window.setTimeout(() => {
          document.getElementById(`quote-${id}`)?.scrollIntoView({ block: 'center' });
        }, 80);
      }
    }
    return true;
  }, []);

  // First load. Kicked off from the effect rather than run inside it, because
  // the whole point is to wait on the server, not to set state on mount.
  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      refresh().catch(() => {
        if (!alive) return;
        setAuthed(false);
        setLoadMsg('Could not reach the server.');
      });
    });
    return () => {
      alive = false;
    };
  }, [refresh]);

  const signOut = async () => {
    await api('/api/admin/session', { method: 'DELETE' });
    setAuthed(false);
    setData(EMPTY);
  };

  if (authed !== true) {
    return <Gate checking={authed === null} message={loadMsg} onOpen={() => refresh().catch(() => setLoadMsg('Could not reach the server.'))} />;
  }

  const fresh = data.quotes.filter((q) => q.status === 'new' && !q.spam_via).length;
  const spam = data.quotes.filter((q) => q.spam_via);
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'requests', label: 'Requests', count: fresh },
    { key: 'reviews', label: 'Reviews', count: data.reviews.length },
    { key: 'pieces', label: 'Pieces', count: data.items.filter((i) => i.status === 'live').length },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div className={s.shell}>
      <header className={s.top}>
        <div className={s.brand}>
          <Mark size={40} />
          <span>
            <span className={s.word}>ACCENT WELDING</span>
            <span className={s.sub}>SHOP PANEL</span>
          </span>
        </div>
        <div className={s.topActions}>
          <button type="button" className={s.ghost} onClick={() => refresh().catch(() => {})}>
            Refresh
          </button>
          <button type="button" className={s.ghost} onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <nav className={s.tabs} role="tablist" aria-label="Panel sections">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`view-${t.key}`}
            className={`${s.tab} ${tab === t.key ? s.tabOn : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.count ? <span className={s.count}>{t.count}</span> : null}
          </button>
        ))}
      </nav>

      <section id="view-requests" role="tabpanel" aria-labelledby="tab-requests" hidden={tab !== 'requests'} className={s.view}>
        <Requests data={data} setData={setData} openId={openQuote} onOpenChange={setOpenQuote} />
      </section>
      <section id="view-reviews" role="tabpanel" aria-labelledby="tab-reviews" hidden={tab !== 'reviews'} className={s.view}>
        <Reviews data={data} setData={setData} />
      </section>
      <section id="view-pieces" role="tabpanel" aria-labelledby="tab-pieces" hidden={tab !== 'pieces'} className={s.view}>
        <Pieces data={data} setData={setData} />
      </section>
      <section id="view-settings" role="tabpanel" aria-labelledby="tab-settings" hidden={tab !== 'settings'} className={s.view}>
        <SettingsView data={data} setData={setData} />
      </section>

      {spamOpen ? <SpamView spam={spam} setData={setData} /> : null}

      <div className={s.footRow}>
        <p className={s.foot}>Accent Welding. Panel data stays in the shop&rsquo;s own database.</p>
        <button type="button" className={s.footLink} onClick={() => setSpamOpen((o) => !o)}>
          {spamOpen ? 'Hide spam' : `Check spam likely${spam.length ? ` (${spam.length})` : ''}`}
        </button>
      </div>
    </div>
  );
}

function Gate({ checking, message, onOpen }: { checking: boolean; message: string; onOpen: () => void }) {
  const [pw, setPw] = useState('');
  // null: nothing typed yet, show whatever the shell reported. A string
  // (even empty) is this form's own word and wins.
  const [own, setOwn] = useState<string | null>(null);
  const err = own === null ? message : own;
  const { phase, run } = useAction();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOwn('');
    run(async () => {
      const r = await api('/api/admin/session', { method: 'POST', body: { password: pw } });
      if (!r.ok) {
        setOwn(r.data.error || 'Wrong password.');
        return false;
      }
      onOpen();
      return true;
    }).catch(() => setOwn('Could not reach the server.'));
  };

  return (
    <div className={s.gate}>
      <form className={s.gateCard} onSubmit={submit}>
        <div className={s.gateBrand}>
          <Mark size={88} detail />
          <span className={s.word}>ACCENT WELDING</span>
          <span className={s.sub}>SHOP PANEL</span>
        </div>
        <label className={s.label} htmlFor="pw">
          Password
        </label>
        <input
          id="pw"
          type="password"
          className={s.input}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="current-password"
          required
          disabled={checking}
        />
        <ActionButton
          type="submit"
          phase={phase}
          labels={{ idle: checking ? 'Checking…' : 'Open the panel', busy: 'Checking…', done: 'Open', failed: 'Denied' }}
          disabled={checking}
          className={s.gateBtn}
        />
        <Msg text={err} kind="err" />
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { PanelData } from '@/lib/panel-types';
import { ActionButton, Msg, Switch, api, prettyPhone, useAction } from './ui';
import s from './admin.module.css';

type Props = { data: PanelData; setData: React.Dispatch<React.SetStateAction<PanelData>> };

const TEXT_FIELDS = [
  'owner_alert_template',
  'review_template',
  'followup_1_template',
  'followup_2_template',
  'followup_3_template',
  'followup_1_hours',
  'followup_2_hours',
  'followup_3_hours',
  'google_review_url',
  'screening_threshold',
  'screening_headline',
  'screening_sub',
  'screening_high_head',
  'screening_high_sub',
  'screening_low_head',
  'screening_low_sub',
  'screening_done_head',
  'screening_done_sub',
] as const;

type Form = Record<(typeof TEXT_FIELDS)[number], string> & {
  owner_phone: string;
  notify_owner: boolean;
  screening_enabled: boolean;
};

function fromSettings(st: Record<string, string>): Form {
  const f = {} as Form;
  for (const k of TEXT_FIELDS) f[k] = st[k] || '';
  f.owner_phone = prettyPhone(st.owner_phone || '');
  f.notify_owner = st.notify_owner === '1';
  f.screening_enabled = st.screening_enabled === '1';
  return f;
}

/** "Last check: 4 minutes ago." or a warning if the clock has not run yet. */
function lastSweep(iso: string | undefined) {
  if (!iso) return 'It has not run yet.';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Last check: just now.';
  if (mins < 60) return `Last check: ${mins} minute${mins === 1 ? '' : 's'} ago.`;
  const h = Math.round(mins / 60);
  if (h < 48) return `Last check: ${h} hour${h === 1 ? '' : 's'} ago.`;
  return `Last check: ${Math.round(h / 24)} days ago.`;
}

function humanAfter(hours: number) {
  if (!hours) return '';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  const d = Math.round((hours / 24) * 10) / 10;
  return `${d} day${d === 1 ? '' : 's'}`;
}

export function SettingsView({ data, setData }: Props) {
  const [f, setF] = useState<Form>(() => fromSettings(data.settings));
  const [out, setOut] = useState<{ text: string; kind?: 'ok' | 'err' }>({ text: '' });
  const save = useAction();
  const test = useAction();
  const sweep = useAction();
  const [testPhone, setTestPhone] = useState('');
  const [testOut, setTestOut] = useState<{ text: string; kind?: 'ok' | 'err' }>({ text: '' });
  const [sweepOut, setSweepOut] = useState('');

  // A refresh from the server replaces what is on screen only if nothing here
  // has been touched since, so a half-edited template is never overwritten.
  // Adjusted during render (the documented "derive from a changed prop"
  // pattern), not in an effect, so there is no extra paint of stale values.
  const [dirty, setDirty] = useState(false);
  const [seen, setSeen] = useState(data.settings);
  if (data.settings !== seen) {
    setSeen(data.settings);
    if (!dirty) setF(fromSettings(data.settings));
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setDirty(true);
    setF((x) => ({ ...x, [k]: v }));
  };

  // Where each rung lands, counted from the first text, so the cumulative
  // schedule reads without doing the arithmetic in your head.
  const landing: string[] = [];
  let total = 0;
  for (const n of [1, 2, 3] as const) {
    const h = Number(f[`followup_${n}_hours`]);
    if (!Number.isFinite(h) || h <= 0) {
      landing.push('off');
      total = 0;
      continue;
    }
    total = total ? total + h : h;
    landing.push(`${humanAfter(total)} after the first text`);
  }

  const doSave = () => {
    setOut({ text: '' });
    save.run(async () => {
      const r = await api<{ settings?: Record<string, string> }>('/api/admin/settings', { method: 'POST', body: f });
      if (!r.ok) {
        setOut({ text: r.data.error || 'Could not save.', kind: 'err' });
        return false;
      }
      const settings = r.data.settings || data.settings;
      setDirty(false);
      setData((d) => ({ ...d, settings }));
      setF(fromSettings(settings));
      setOut({ text: 'Saved.', kind: 'ok' });
      return true;
    });
  };

  const fireTest = () => {
    if (!testPhone.trim()) return setTestOut({ text: 'Enter the number the test should go to.', kind: 'err' });
    setTestOut({ text: '' });
    test.run(async () => {
      const r = await api('/api/admin/test-webhook', { method: 'POST', body: { phone: testPhone.trim() } });
      if (!r.ok) {
        setTestOut({ text: r.data.error || 'The webhook rejected it.', kind: 'err' });
        return false;
      }
      setTestOut({ text: 'Fired. GoHighLevel now has a sample carrying phone, sms-message and company.', kind: 'ok' });
      return true;
    });
  };

  const runSweep = () =>
    sweep.run(async () => {
      const r = await api<{ due?: number; sent?: number }>('/api/admin/run-followups', { method: 'POST' });
      if (!r.ok) return false;
      setSweepOut(`${r.data.sent ?? 0} sent of ${r.data.due ?? 0} due.`);
      return true;
    });

  const saveBar = (
    <div className={s.saveBar}>
      <ActionButton phase={save.phase} labels={{ idle: 'Save everything', busy: 'Saving…', done: 'Saved', failed: 'Not saved' }} onClick={doSave} />
      <Msg text={out.text} kind={out.kind} />
    </div>
  );

  return (
    <div className={s.settings}>
      <Panel title="Who gets the texts" hint="The number that hears about every new request the moment it lands, and about any low-star feedback. Leave it empty to switch the alerts off.">
        <div className={s.narrow}>
          <label className={s.label} htmlFor="ownerPhone">Owner number</label>
          <input id="ownerPhone" type="tel" inputMode="tel" className={s.input} value={f.owner_phone} onChange={(e) => set('owner_phone', e.target.value)} autoComplete="off" />
        </div>
        <Switch on={f.notify_owner} onChange={(v) => set('notify_owner', v)} label="Text me when a request comes in" />
      </Panel>

      <Panel title="Alert text" hint="What lands on your phone when the site form is sent. {{link}} opens the panel on that exact request; {{name}}, {{phone}} and {{product}} are theirs.">
        <textarea className={s.textarea} rows={3} value={f.owner_alert_template} onChange={(e) => set('owner_alert_template', e.target.value)} aria-label="Owner alert message" />
      </Panel>

      <Panel title="Review request" hint="The first message. {{link}} is the tracked link to your rating page: leave it in, or it is added to the end anyway, because that link is how a tap is measured and how the follow-ups know to stop.">
        <textarea className={s.textarea} rows={4} value={f.review_template} onChange={(e) => set('review_template', e.target.value)} aria-label="Review message template" />
      </Panel>

      <Panel title="Follow-ups" hint="Sent only if they never tapped the link. Hours count from the previous message. Clear a box to switch that one off, and everything after it.">
        {([1, 2, 3] as const).map((n) => (
          <div key={n} className={s.rung}>
            <div className={s.rungHead}>
              <span className={s.rungNo}>0{n}</span>
              <span className={s.rungWhen}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`${s.input} ${s.hours}`}
                  value={f[`followup_${n}_hours`]}
                  onChange={(e) => set(`followup_${n}_hours`, e.target.value)}
                  aria-label={`Follow-up ${n} hours`}
                />
                <span>{n === 1 ? 'hours later' : 'hours after that'}</span>
              </span>
              <span className={s.rungAt}>{landing[n - 1]}</span>
            </div>
            <textarea className={s.textarea} rows={2} value={f[`followup_${n}_template`]} onChange={(e) => set(`followup_${n}_template`, e.target.value)} aria-label={`Follow-up ${n} message`} />
          </div>
        ))}
      </Panel>

      <Panel title="Rating page" hint="Where the tracked link goes. They pick a star; anyone at or above your threshold is sent straight to Google, anyone below is asked what went wrong and that answer is texted to you instead of going anywhere public.">
        <Switch on={f.screening_enabled} onChange={(v) => set('screening_enabled', v)} label="Ask for a rating first" hint={f.screening_enabled ? undefined : 'the link counts the tap, then goes straight to Google'} />
        <div className={s.narrow}>
          <label className={s.label} htmlFor="googleUrl">Google review link</label>
          <input id="googleUrl" type="url" className={s.input} value={f.google_review_url} onChange={(e) => set('google_review_url', e.target.value)} placeholder="https://g.page/r/…/review" autoComplete="off" />
          <p className={s.fieldNote}>Blank until the shop has a Google Business Profile. Until then a happy customer sees a thank-you instead.</p>
        </div>
        {f.screening_enabled ? (
          <>
            <div className={s.rungWhen}>
              <input type="text" inputMode="numeric" className={`${s.input} ${s.hours}`} value={f.screening_threshold} onChange={(e) => set('screening_threshold', e.target.value)} aria-label="Star threshold" />
              <span>stars or more goes to Google</span>
            </div>
            <TextPair label="Opening question" a={['screening_headline', f.screening_headline]} b={['screening_sub', f.screening_sub]} set={set} />
            <TextPair label="If they rate you high and the Google link is empty" a={['screening_high_head', f.screening_high_head]} b={['screening_high_sub', f.screening_high_sub]} set={set} />
            <TextPair label="If they rate you low" a={['screening_low_head', f.screening_low_head]} b={['screening_low_sub', f.screening_low_sub]} set={set} />
            <TextPair label="After they send feedback" a={['screening_done_head', f.screening_done_head]} b={['screening_done_sub', f.screening_done_sub]} set={set} />
          </>
        ) : null}
      </Panel>

      {saveBar}

      <Panel title="Webhook test" hint="Fires one message through the GoHighLevel webhook so the workflow has an inbound sample to map against. It carries the three fields: phone, sms-message, company.">
        <div className={s.narrow}>
          <label className={s.label} htmlFor="testPhone">Send the test to</label>
          <input id="testPhone" type="tel" inputMode="tel" className={s.input} value={testPhone} onChange={(e) => setTestPhone(e.target.value)} autoComplete="off" />
        </div>
        <div className={s.actionRow}>
          <ActionButton kind="dark" phase={test.phase} labels={{ idle: 'Fire test', busy: 'Firing…', done: 'Fired', failed: 'Rejected' }} onClick={fireTest} />
          <Msg text={testOut.text} kind={testOut.kind} />
        </div>
      </Panel>

      <Panel title="Follow-up clock" hint={`Follow-ups go out on their own: the site checks for anything due every ten minutes, around the clock, whether or not anyone is on it. ${lastSweep(data.settings.last_sweep_at)} Nothing to do here day to day; the button only forces a check this second.`}>
        <div className={s.actionRow}>
          <ActionButton kind="dark" phase={sweep.phase} labels={{ idle: 'Check now', busy: 'Checking…', done: 'Done', failed: 'Failed' }} onClick={runSweep} />
          <Msg text={sweepOut} kind="ok" />
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className={`plate ${s.panel}`}>
      <div className={`plateInner ${s.panelInner}`}>
        <h2 className={s.h2}>{title}</h2>
        <p className={s.hint}>{hint}</p>
        <div className={s.panelBody}>{children}</div>
      </div>
    </div>
  );
}

function TextPair({
  label,
  a,
  b,
  set,
}: {
  label: string;
  a: [keyof Form, string];
  b: [keyof Form, string];
  set: <K extends keyof Form>(k: K, v: Form[K]) => void;
}) {
  return (
    <div className={s.pair}>
      <span className={s.label}>{label}</span>
      <input className={s.input} value={a[1]} onChange={(e) => set(a[0], e.target.value as never)} aria-label={`${label} headline`} />
      <textarea className={s.textarea} rows={2} value={b[1]} onChange={(e) => set(b[0], e.target.value as never)} aria-label={`${label} subtext`} />
    </div>
  );
}

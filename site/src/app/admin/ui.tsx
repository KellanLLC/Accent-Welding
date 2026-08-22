'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import type { QuoteStatus } from '@/lib/panel-types';
import s from './admin.module.css';

/* ───────────────────────────────────────────── formatting ────────────── */

export function prettyPhone(v: unknown) {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(String(v || ''));
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : String(v || '');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseStamp(iso: unknown) {
  let v = String(iso || '').replace(' ', 'T');
  if (v && v.indexOf('Z') < 0 && v.indexOf('+') < 0) v += 'Z';
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
export function shortDate(iso: unknown) {
  const d = parseStamp(iso);
  return d ? `${MONTHS[d.getMonth()]} ${d.getDate()}` : '';
}
export function fullDate(iso: unknown) {
  const d = parseStamp(iso);
  return d
    ? d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';
}
export function pad3(n: number) {
  return String(n).padStart(3, '0');
}
export function firstName(name: unknown) {
  return String(name || '').trim().split(/\s+/)[0] || 'there';
}

/* ───────────────────────────────────────────────── api ───────────────── */

export type ApiResult<T = Record<string, unknown>> = { status: number; ok: boolean; data: T & { error?: string } };

export async function api<T = Record<string, unknown>>(
  path: string,
  opts: { method?: string; body?: unknown; form?: FormData } = {},
): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    method: opts.method || 'GET',
    headers: opts.body ? { 'content-type': 'application/json' } : undefined,
    body: opts.form ? opts.form : opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'same-origin',
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  return { status: res.status, ok: res.ok, data };
}

/* ──────────────────────────────────────── the status tag ─────────────── */

const TAG_PATH = 'M4 0.5 H15.5 V15 L11.5 19.5 H0.5 V4.5 Z';
const TAG_FILL: Record<QuoteStatus, number> = { new: 1, contacted: 0.62, scheduled: 0.3, done: 0 };

/**
 * A small steel tag, cut on the site's chamfer. It is solid buckskin while a
 * request is new and the tan drains out of it as the job is handled, so the
 * list reads "what still needs me" at a glance without a word of text.
 */
export function Tag({ status, size = 16 }: { status: QuoteStatus; size?: number }) {
  const level = TAG_FILL[status];
  const id = `tag-${status}`;
  return (
    <svg
      className={`${s.tag} ${s['tag_' + status]}`}
      width={size}
      height={(size * 20) / 16}
      viewBox="0 0 16 20"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={id}>
          <path d={TAG_PATH} />
        </clipPath>
      </defs>
      {level > 0 ? (
        <rect
          className={s.tagFill}
          x="0"
          y={(20 * (1 - level)).toFixed(2)}
          width="16"
          height={(20 * level).toFixed(2)}
          clipPath={`url(#${id})`}
        />
      ) : null}
      <path className={s.tagEdge} d={TAG_PATH} fill="none" />
    </svg>
  );
}

/* ────────────────────────────────────────────── the switch ───────────── */

/**
 * A two-position slide: a plate that travels across its track. Cut on the
 * chamfer like everything else here; not a rounded pill, not a sun and moon.
 */
export function Switch({
  on,
  onChange,
  label,
  hint,
  id,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      className={`${s.switch} ${on ? s.switchOn : ''}`}
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
    >
      <span className={s.switchTrack} aria-hidden="true">
        <span className={s.switchKnob} />
      </span>
      <span className={s.switchText}>
        <span className={s.switchLabel}>{label}</span>
        <span className={s.switchState}>{on ? 'On' : 'Off'}{hint ? ` · ${hint}` : ''}</span>
      </span>
    </button>
  );
}

/* ──────────────────────────────────────── the action button ──────────── */

type Phase = 'idle' | 'busy' | 'done' | 'failed';

/**
 * Drives a button through idle → busy → done/failed and back, so every send
 * and save on the page reports what happened in the button itself. No lift,
 * no glow: the label changes, and for two seconds it says what it did.
 */
export function useAction() {
  const [phase, setPhase] = useState<Phase>('idle');
  const timer = useRef<number | null>(null);
  const run = useCallback(async (work: () => Promise<boolean>) => {
    if (timer.current) window.clearTimeout(timer.current);
    setPhase('busy');
    let ok = false;
    try {
      ok = await work();
    } catch {
      ok = false;
    }
    setPhase(ok ? 'done' : 'failed');
    timer.current = window.setTimeout(() => setPhase('idle'), ok ? 2200 : 2800);
    return ok;
  }, []);
  return { phase, run };
}

export function ActionButton({
  phase,
  labels,
  onClick,
  kind = 'primary',
  type = 'button',
  disabled,
  className,
  children,
}: {
  phase: Phase;
  labels: { idle: ReactNode; busy: string; done: string; failed: string };
  onClick?: () => void;
  kind?: 'primary' | 'dark';
  /** 'submit' inside a form, so Enter in a field and a tap both send it. */
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const label =
    phase === 'busy' ? labels.busy : phase === 'done' ? labels.done : phase === 'failed' ? labels.failed : labels.idle;
  return (
    <button
      type={type}
      className={`btn ${kind === 'dark' ? 'btnDark' : ''} ${s.action} ${phase === 'failed' ? s.actionFailed : ''} ${className || ''}`}
      onClick={onClick}
      disabled={disabled || phase === 'busy'}
      aria-live="polite"
    >
      {label}
      {children}
    </button>
  );
}

/* ───────────────────────────────────────────── small bits ────────────── */

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label className={s.label} htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export function Msg({ text, kind }: { text: string; kind?: 'ok' | 'err' }) {
  if (!text) return null;
  return (
    <p className={`${s.msg} ${kind === 'err' ? s.msgErr : ''}`} role="status">
      {text}
    </p>
  );
}

export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={s.empty}>
      <strong>{title}</strong>
      {children}
    </div>
  );
}

/** The open/closed chevron: a short bar that pivots, same as the nav's Order control. */
export function Chev({ open }: { open: boolean }) {
  return (
    <svg
      className={s.chev}
      width="12"
      height="9"
      viewBox="0 0 11 8"
      aria-hidden="true"
      focusable="false"
      style={{ transform: open ? 'rotate(180deg)' : 'none' }}
    >
      <path d="M1.4 2.4 L5.5 6 L9.6 2.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

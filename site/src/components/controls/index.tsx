'use client';

import type { ReactNode } from 'react';
import { useId } from 'react';
import s from './Controls.module.css';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <fieldset className={s.field}>
      <legend className={s.legendHidden}>{label}</legend>
      <p className={s.legend} aria-hidden="true">
        <span>{label}</span>
        {hint ? <span className={s.hint}>{hint}</span> : null}
      </p>
      <div className={s.fieldBody}>{children}</div>
    </fieldset>
  );
}

export type Opt<T extends string> = {
  id: T;
  name: string;
  note?: string;
  meta?: string;
};

export function OptionGrid<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
  name,
}: {
  options: Opt<T>[];
  value: T;
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
  name?: string;
}) {
  const auto = useId();
  const group = name ?? auto;
  return (
    <div className={`${s.options} ${columns === 3 ? s.cols3 : columns === 2 ? s.cols2 : ''}`}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <label key={o.id} className={`${s.option} ${on ? s.optionOn : ''}`}>
            <input
              type="radio"
              name={group}
              checked={on}
              onChange={() => onChange(o.id)}
            />
            <span className={s.optionBody}>
              <span className={s.optionName}>{o.name}</span>
              {o.note ? <span className={s.optionNote}>{o.note}</span> : null}
              {o.meta ? <span className={s.optionMeta}>{o.meta}</span> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  name,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  name?: string;
}) {
  const auto = useId();
  const group = name ?? auto;
  return (
    <div className={s.segmented}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <label key={String(o.id)} className={`${s.seg} ${on ? s.segOn : ''}`}>
            <input type="radio" name={group} checked={on} onChange={() => onChange(o.id)} />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  unit,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className={s.stepper}>
      <button
        type="button"
        className={s.stepBtn}
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <input
        className={`${s.stepVal} tnum`}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
      />
      {unit ? <span className={s.stepUnit}>{unit}</span> : null}
      <button
        type="button"
        className={s.stepBtn}
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={s.sliderRow}>
      <input
        className={s.slider}
        style={{ ['--pct' as string]: `${pct}%` }}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <Stepper value={value} onChange={onChange} min={min} max={max} step={step} unit={unit} label={label} />
    </div>
  );
}

export function Swatches<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: { id: T; name: string; render: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  name?: string;
}) {
  const auto = useId();
  const group = name ?? auto;
  return (
    <div className={s.swatches}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <label key={o.id} className={`${s.swatch} ${on ? s.swatchOn : ''}`}>
            <input type="radio" name={group} checked={on} onChange={() => onChange(o.id)} />
            <span className={s.chip}>{o.render}</span>
            <span className={s.swatchName}>{o.name}</span>
          </label>
        );
      })}
    </div>
  );
}

export function CheckList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; name: string; note?: string; price?: string }[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <div className={s.checks}>
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <label key={o.id} className={`${s.check} ${on ? s.checkOn : ''}`}>
            <input
              type="checkbox"
              checked={on}
              onChange={() =>
                onChange(on ? value.filter((v) => v !== o.id) : [...value, o.id])
              }
            />
            <span className={s.box} aria-hidden="true">
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden="true">
                <path
                  d="M1 4.5 L4 7.5 L10 1.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              <span className={s.checkName}>{o.name}</span>
              {o.note ? <span className={s.checkNote}>{o.note}</span> : null}
            </span>
            {o.price ? <span className={s.checkPrice}>{o.price}</span> : null}
          </label>
        );
      })}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// Presentational half of the intake form.
//
// Split out of intake-form.tsx when the sectioned rewrite pushed that file to
// 1383 lines against the repo's 400-line ceiling. Everything here is dumb: no
// intake state, no submission, no knowledge of step order. intake-form.tsx
// keeps the state machine and the questions; this keeps the widgets that
// render them.

// --- Step card ------------------------------------------------------------

export function StepCard({
  eyebrow,
  question,
  body,
  children,
}: {
  eyebrow: string;
  question: string;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <span
        style={{
          fontFamily: 'var(--font-sc, var(--font-body))',
          fontSize: 12,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
        }}
      >
        {eyebrow}
      </span>
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 5vw, 38px)',
          lineHeight: 1.15,
          color: 'var(--ink)',
          fontWeight: 400,
        }}
      >
        {question}
      </h1>
      {body && (
        <p
          style={{
            margin: 0,
            color: 'var(--ink-soft)',
            fontSize: 'clamp(16px, 2vw, 18px)',
            lineHeight: 1.55,
            maxWidth: 560,
          }}
        >
          {body}
        </p>
      )}
      {children && <div style={{ marginTop: 'var(--space-2)', display: 'grid', gap: 'var(--space-3)' }}>{children}</div>}
    </div>
  );
}

// --- Progress bar ---------------------------------------------------------

export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ display: 'grid', gap: 6, maxWidth: 640, width: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-faint)', fontSize: 12, fontFamily: 'var(--font-sc, var(--font-body))', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        <span>Question {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div
        style={{
          height: 3,
          borderRadius: 3,
          background: 'rgba(138, 113, 86, 0.18)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'var(--oxblood)',
            transition: 'width 260ms ease-out',
          }}
        />
      </div>
    </div>
  );
}

// --- Age slider -----------------------------------------------------------

export function ageToBand(age: number): '3–4' | '5–6' | '7–8' | '9+' {
  if (age < 5) return '3–4';
  if (age < 7) return '5–6';
  if (age < 9) return '7–8';
  return '9+';
}

export function ageToReadingHint(age: number): string {
  if (age < 4) return 'lap-reading · lots of pictures, few words per page';
  if (age < 6) return 'early reader · picture-book pacing, growing sentences';
  if (age < 8) return 'confident reader · full picture book, chapter-like flow';
  return 'independent reader · early chapter-book territory';
}

export function formatAge(age: number): string {
  if (Number.isInteger(age)) return `${age} years old`;
  return `${age} years old`;
}

export function AgeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const min = 2;
  const max = 10;
  const step = 0.5;

  return (
    <div style={{ display: 'grid', gap: 16, paddingTop: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--ink)', lineHeight: 1 }}>
          {formatAge(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lf-intake-slider"
        aria-label="Age in years"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-faint)', fontSize: 12 }}>
        <span>2</span>
        <span>4</span>
        <span>6</span>
        <span>8</span>
        <span>10</span>
      </div>
      <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 15, fontStyle: 'italic' }}>
        {ageToReadingHint(value)}
      </p>
    </div>
  );
}

// --- Combobox (autocomplete) ---------------------------------------------

export function Combobox({
  value,
  onChange,
  suggestions,
  max,
  placeholder,
  ...rest
}: {
  value: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
  max: number;
  placeholder?: string;
  'aria-label'?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    const taken = new Set(value.map((v) => v.toLowerCase()));
    const base = suggestions.filter((s) => !taken.has(s.toLowerCase()));
    if (!q) return base.slice(0, 8);
    const matches = base.filter((s) => s.toLowerCase().includes(q));
    return matches.slice(0, 8);
  }, [suggestions, value, q]);

  const canAddCustom =
    q.length > 0 &&
    !filtered.some((s) => s.toLowerCase() === q) &&
    !value.some((v) => v.toLowerCase() === q);

  useEffect(() => {
    setHighlight(0);
  }, [q]);

  function add(v: string) {
    const clean = v.trim();
    if (!clean) return;
    if (value.length >= max) return;
    if (value.some((x) => x.toLowerCase() === clean.toLowerCase())) return;
    onChange([...value, clean]);
    setQuery('');
    inputRef.current?.focus();
  }

  function remove(v: string) {
    onChange(value.filter((x) => x !== v));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !query && value.length > 0) {
      e.preventDefault();
      const last = value[value.length - 1];
      if (last) remove(last);
      return;
    }
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const total = filtered.length + (canAddCustom ? 1 : 0);
      if (total > 0) setHighlight((highlight + 1) % total);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const total = filtered.length + (canAddCustom ? 1 : 0);
      if (total > 0) setHighlight((highlight - 1 + total) % total);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const pick = filtered[highlight];
      if (pick) {
        add(pick);
      } else if (canAddCustom) {
        add(query);
      }
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const atMax = value.length >= max;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {value.map((v) => (
            <span
              key={v}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--oxblood)',
                background: 'var(--oxblood-wash)',
                color: 'var(--oxblood-text)',
                fontSize: 15,
              }}
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                aria-label={`Remove ${v}`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--oxblood-text)',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={atMax ? `Max ${max} chosen` : placeholder}
          disabled={atMax}
          aria-label={rest['aria-label']}
          className="lf-intake-input"
          autoFocus
        />
        {open && !atMax && (filtered.length > 0 || canAddCustom) && (
          <ul
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 10,
              margin: 0,
              padding: 6,
              listStyle: 'none',
              background: 'var(--paper-warm)',
              border: '1px solid var(--pill-edge)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(28,19,14,0.16)',
              maxHeight: 260,
              overflowY: 'auto',
            }}
          >
            {filtered.map((s, i) => (
              <li
                key={s}
                role="option"
                aria-selected={i === highlight}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(s);
                }}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: i === highlight ? 'var(--oxblood-wash)' : 'transparent',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                {s}
              </li>
            ))}
            {canAddCustom && (
              <li
                role="option"
                aria-selected={highlight === filtered.length}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(query);
                }}
                onMouseEnter={() => setHighlight(filtered.length)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: highlight === filtered.length ? 'var(--oxblood-wash)' : 'transparent',
                  color: 'var(--ink-soft)',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontStyle: 'italic',
                }}
              >
                Add &ldquo;{query.trim()}&rdquo;
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- MoreDetail: expandable "anything more?" field ------------------------

export function MoreDetail({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(value.length > 0);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          justifySelf: 'start',
          padding: '8px 0',
          border: 'none',
          background: 'transparent',
          color: 'var(--ink-soft)',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          textDecoration: 'underline',
          textDecorationColor: 'rgba(138, 113, 86, 0.5)',
          cursor: 'pointer',
        }}
      >
        Add a specific note
      </button>
    );
  }
  return (
    <textarea
      className="lf-intake-input lf-intake-textarea"
      rows={2}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="More detail"
    />
  );
}

// --- Review row -----------------------------------------------------------

// --- Choice grid ----------------------------------------------------------

// Single-select, rendered as stacked buttons rather than a native <select>.
// positioning.md's secondary segment is grandparents, and the whole gift flow
// exists so "the tech doesn't scare them" — a tap target beats a dropdown.

export function ChoiceGrid({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div role="radiogroup" style={{ display: 'grid', gap: 10 }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            style={{
              textAlign: 'left',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: on
                ? '1px solid var(--oxblood)'
                : '1px solid color-mix(in srgb, var(--ink) 22%, transparent)',
              background: on ? 'color-mix(in srgb, var(--oxblood) 8%, transparent)' : 'var(--paper-warm)',
              color: 'var(--ink)',
              font: '500 17px/1.3 var(--font-body)',
              cursor: 'pointer',
              transition: 'border-color var(--motion-tick) var(--ease-mechanical)',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid rgba(138, 113, 86, 0.16)',
        alignItems: 'baseline',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sc, var(--font-body))',
          fontSize: 12,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
        }}
      >
        {label}
      </span>
      <span style={{ color: 'var(--ink)', fontSize: 16, lineHeight: 1.5 }}>{children}</span>
    </li>
  );
}

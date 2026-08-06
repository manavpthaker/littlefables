'use client';

import { useState, useTransition } from 'react';
import { setIntakeNotes, setIntakeStatus } from './actions';

type IntakeStatus = 'awaiting' | 'new' | 'in_progress' | 'delivered' | 'archived';

const STATUS_LABELS: Record<IntakeStatus, string> = {
  awaiting: 'Awaiting buyer',
  new: 'New',
  in_progress: 'In progress',
  delivered: 'Delivered',
  archived: 'Archived',
};

export interface IntakeRowProps {
  id: string;
  status: IntakeStatus;
  buyerEmail: string;
  childName: string;
  ageBand: string | null;
  ageYears: number | null;
  interests: string[];
  interestsNote: string | null;
  traits: string[];
  traitsNote: string | null;
  inspirations: string | null;
  look: string | null;
  companions: string | null;
  giftFrom: string | null;
  etsyOrder: string | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export function IntakeRow(props: IntakeRowProps) {
  const [status, setStatus] = useState<IntakeStatus>(props.status);
  const [notes, setNotes] = useState(props.notes ?? '');
  const [savedNotes, setSavedNotes] = useState(props.notes ?? '');
  const [pending, startTransition] = useTransition();

  const dirty = notes !== savedNotes;

  function updateStatus(next: IntakeStatus) {
    setStatus(next);
    startTransition(async () => {
      try {
        await setIntakeStatus(props.id, next);
      } catch {
        setStatus(props.status);
      }
    });
  }

  function saveNotes() {
    startTransition(async () => {
      try {
        await setIntakeNotes(props.id, notes);
        setSavedNotes(notes);
      } catch {
        // leave dirty so the button stays available
      }
    });
  }

  return (
    <article
      style={{
        background: 'var(--paper-warm)',
        border: 'var(--border-soft)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'grid',
        gap: 'var(--space-3)',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)' }}>
            {props.childName}
            {props.ageYears != null ? (
              <span style={{ color: 'var(--ink-faint)', fontSize: 15, marginLeft: 8 }}>
                · {props.ageYears} yrs{props.ageBand ? ` (${props.ageBand})` : ''}
              </span>
            ) : props.ageBand ? (
              <span style={{ color: 'var(--ink-faint)', fontSize: 15, marginLeft: 8 }}>· {props.ageBand}</span>
            ) : null}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
            <a href={`mailto:${props.buyerEmail}`} style={{ color: 'var(--oxblood)' }}>{props.buyerEmail}</a>
            {props.giftFrom ? <> · gift from <strong>{props.giftFrom}</strong></> : null}
            {props.etsyOrder ? <> · Etsy #{props.etsyOrder}</> : null}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
            {new Date(props.createdAt).toLocaleString()}
          </div>
        </div>

        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value as IntakeStatus)}
          disabled={pending}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--pill-edge)',
            background: 'var(--paper)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
          }}
        >
          {(Object.keys(STATUS_LABELS) as IntakeStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </header>

      <div style={{ display: 'grid', gap: 6, fontSize: 14, color: 'var(--ink-soft)' }}>
        {props.interests.length > 0 && (
          <Row label="Loves">
            {props.interests.join(', ')}
            {props.interestsNote && (
              <div style={{ color: 'var(--ink-faint)', fontStyle: 'italic', marginTop: 4 }}>
                {props.interestsNote}
              </div>
            )}
          </Row>
        )}
        {props.traits.length > 0 && (
          <Row label="Traits">
            {props.traits.join(', ')}
            {props.traitsNote && (
              <div style={{ color: 'var(--ink-faint)', fontStyle: 'italic', marginTop: 4 }}>
                {props.traitsNote}
              </div>
            )}
          </Row>
        )}
        {props.inspirations && <Row label="Inspiration">{props.inspirations}</Row>}
        {props.look && <Row label="Looks like">{props.look}</Row>}
        <Row label="Cast">{props.companions ?? `Just ${props.childName}`}</Row>
      </div>

      {props.photoUrl && (
        <a href={props.photoUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
          <img
            src={props.photoUrl}
            alt={`Reference photo of ${props.childName}`}
            style={{ maxWidth: 160, borderRadius: 8, border: '1px solid var(--pill-edge)' }}
          />
        </a>
      )}

      <div style={{ display: 'grid', gap: 6 }}>
        <label style={{ fontSize: 12, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Slug, provisioned URL, gotchas…"
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--pill-edge)',
            background: 'var(--paper)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--ink)',
            resize: 'vertical',
          }}
        />
        {dirty && (
          <button
            type="button"
            onClick={saveNotes}
            disabled={pending}
            style={{
              justifySelf: 'end',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--oxblood)',
              background: 'var(--oxblood-wash)',
              color: 'var(--oxblood-text)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {pending ? 'Saving…' : 'Save notes'}
          </button>
        )}
      </div>
    </article>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8 }}>
      <span style={{ color: 'var(--ink-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        {label}
      </span>
      <span>{children}</span>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { SectionHeader } from '@ds/components/parent/SectionHeader.jsx';
import { Field } from '@ds/components/parent/Field.jsx';
import type { ChildSettings } from '@/lib/models/settings';

// Per-child settings editor. Bedtime window auto-triggers night mode in the
// reader (sleepy voice, text-only pages). Voice overrides fall back to
// DAY_VOICE_ID / NIGHT_VOICE_ID env vars when blank. Saves as a partial
// merge via PUT /api/parent/settings.

export function SettingsForm({
  childId,
  displayName,
  band,
  initial,
}: {
  childId: string;
  displayName: string;
  band: string;
  initial: ChildSettings;
}) {
  const [settings, setSettings] = useState<ChildSettings>(initial);
  const [bandValue, setBandValue] = useState(band);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  function patch(p: Partial<ChildSettings>) {
    setSettings((prev) => ({ ...prev, ...p }));
    setState('idle');
  }

  async function save() {
    setState('saving');
    try {
      const res = await fetch('/api/parent/settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ childId, settings, band: bandValue }),
      });
      setState(res.ok ? 'saved' : 'error');
    } catch {
      setState('error');
    }
  }

  const input = {
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--ink-faint)',
    background: 'var(--paper-warm)',
    color: 'var(--ink)',
    fontSize: 'var(--text-body-size)',
    fontFamily: 'var(--font-body)',
  } as const;

  return (
    <section
      style={{
        background: 'var(--paper-warm)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        boxShadow: 'var(--shadow-rest)',
        display: 'grid',
        gap: 'var(--space-4)',
      }}
    >
      <SectionHeader label={`${displayName}’s reading`} />

      <Field label="Reading band" help="the age band stories are pitched at">
        <select value={bandValue} onChange={(e) => { setBandValue(e.target.value); setState('idle'); }} style={input}>
          <option value="3-4">3–4</option>
          <option value="4-6">4–6</option>
          <option value="4-8">4–8</option>
          <option value="6-8">6–8</option>
        </select>
      </Field>

      <Field label="Bedtime mode" help="auto-switches the reader to night mode (sleepy voice, no illustrations) inside this window">
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', fontSize: 'var(--text-body-size)' }}>
            <input
              type="checkbox"
              checked={settings.bedtime.enabled}
              onChange={(e) => patch({ bedtime: { ...settings.bedtime, enabled: e.target.checked } })}
            />
            auto from
          </label>
          <select
            value={settings.bedtime.startHour}
            onChange={(e) => patch({ bedtime: { ...settings.bedtime, startHour: Number(e.target.value) } })}
            style={input}
            disabled={!settings.bedtime.enabled}
          >
            {HOURS.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
          <span style={{ fontSize: 'var(--text-body-size)', color: 'var(--ink-soft)' }}>to</span>
          <select
            value={settings.bedtime.endHour}
            onChange={(e) => patch({ bedtime: { ...settings.bedtime, endHour: Number(e.target.value) } })}
            style={input}
            disabled={!settings.bedtime.enabled}
          >
            {HOURS.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>
      </Field>

      <Field label="Day voice" help="ElevenLabs voice id used in day mode; blank = DAY_VOICE_ID env default">
        <input
          type="text"
          value={settings.narratorVoiceId ?? ''}
          placeholder="voice id"
          onChange={(e) => patch({ narratorVoiceId: e.target.value.trim() || null })}
          style={{ ...input, width: 260 }}
        />
      </Field>

      <Field label="Night voice" help="ElevenLabs voice id used in bedtime / night mode; blank = NIGHT_VOICE_ID env default">
        <input
          type="text"
          value={settings.nightVoiceId ?? ''}
          placeholder="voice id"
          onChange={(e) => patch({ nightVoiceId: e.target.value.trim() || null })}
          style={{ ...input, width: 260 }}
        />
      </Field>

      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        <button
          onClick={save}
          disabled={state === 'saving'}
          style={{
            padding: 'var(--space-2) var(--space-5)',
            background: 'var(--oxblood)',
            color: 'var(--paper-warm)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            cursor: state === 'saving' ? 'wait' : 'pointer',
            fontSize: 'var(--text-body-size)',
          }}
        >
          {state === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {state === 'saved' && <span style={{ color: 'var(--forest)', fontSize: 'var(--text-caption-size)' }}>Saved.</span>}
        {state === 'error' && <span style={{ color: 'var(--danger)', fontSize: 'var(--text-caption-size)' }}>Could not save — try again.</span>}
      </div>
    </section>
  );
}

const HOURS = Array.from({ length: 24 }, (_, h) => ({
  value: h,
  label: h === 0 ? '12 am' : h < 12 ? `${h} am` : h === 12 ? '12 pm' : `${h - 12} pm`,
}));

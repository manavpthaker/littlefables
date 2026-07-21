'use client';

import { useState } from 'react';
import { SectionHeader, Field } from '@ds/components/parent/ParentPrimitives.jsx';
import type { ChildSettings, ReadingLevel } from '@/lib/models/settings';

// Per-child settings editor (brief §III.5). Saves as a partial merge via
// PUT /api/parent/settings; the server re-validates the merged object.

const LEVEL_HELP: Record<ReadingLevel, string> = {
  ease: 'a gentler step below the band',
  auto: 'follows the checkpoint signal',
  stretch: 'a reach above the band',
};

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
    background: 'var(--surface-card)',
    color: 'var(--text-body)',
    fontSize: 'var(--text-body)',
    fontFamily: 'var(--font-ui)',
  } as const;

  return (
    <section
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        boxShadow: 'var(--elev-rest)',
        display: 'grid',
        gap: 'var(--space-4)',
      }}
    >
      <SectionHeader>{displayName}&rsquo;s reading</SectionHeader>

      <Field label="Reading level" hint={LEVEL_HELP[settings.readingLevel]}>
        <select
          value={settings.readingLevel}
          onChange={(e) => patch({ readingLevel: e.target.value as ReadingLevel })}
          style={input}
        >
          <option value="ease">Ease</option>
          <option value="auto">Auto</option>
          <option value="stretch">Stretch</option>
        </select>
      </Field>

      <Field label="Reading band" hint="the base level stories and questions are written to">
        <select value={bandValue} onChange={(e) => { setBandValue(e.target.value); setState('idle'); }} style={input}>
          <option value="3-4">3–4</option>
          <option value="4-6">4–6</option>
          <option value="4-8">4–8</option>
          <option value="6-8">6–8</option>
        </select>
      </Field>

      <Field label="Comprehension checks" hint="chapter questions + tell-it-back; off = stories just flow">
        <label style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', fontSize: 'var(--text-body)' }}>
          <input
            type="checkbox"
            checked={settings.checksEnabled}
            onChange={(e) => patch({ checksEnabled: e.target.checked })}
          />
          {settings.checksEnabled ? 'on' : 'off'}
        </label>
      </Field>

      <Field label="Bedtime mode" hint="dims the palette, slows the voice, resolves chapters without questions">
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', fontSize: 'var(--text-body)' }}>
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
          <span style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>to</span>
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

      <Field label="Daily limit" hint="soft — the buddy suggests stopping, never locks">
        <select
          value={settings.dailyLimitMin ?? ''}
          onChange={(e) => patch({ dailyLimitMin: e.target.value === '' ? null : Number(e.target.value) })}
          style={input}
        >
          <option value="">no limit</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">1 hour</option>
        </select>
      </Field>

      <Field label="Narrator voice" hint="ElevenLabs voice id for live speech; blank = the default narrator">
        <input
          type="text"
          value={settings.narratorVoiceId ?? ''}
          placeholder="voice id"
          onChange={(e) => patch({ narratorVoiceId: e.target.value.trim() || null })}
          style={{ ...input, width: 260 }}
        />
      </Field>

      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        <button
          onClick={save}
          disabled={state === 'saving'}
          style={{
            padding: 'var(--space-2) var(--space-5)',
            background: 'var(--action)',
            color: 'var(--action-ink)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            cursor: state === 'saving' ? 'wait' : 'pointer',
            fontSize: 'var(--text-body)',
          }}
        >
          {state === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {state === 'saved' && <span style={{ color: 'var(--sage)', fontSize: 'var(--text-caption)' }}>Saved.</span>}
        {state === 'error' && <span style={{ color: 'var(--danger)', fontSize: 'var(--text-caption)' }}>Could not save — try again.</span>}
      </div>
    </section>
  );
}

const HOURS = Array.from({ length: 24 }, (_, h) => ({
  value: h,
  label: h === 0 ? '12 am' : h < 12 ? `${h} am` : h === 12 ? '12 pm' : `${h - 12} pm`,
}));

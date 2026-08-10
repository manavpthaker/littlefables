import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Adult-density list row + retelling player + form field. Wrap parent surfaces in [data-density="parent"].
export function ListRow({ icon, title, meta, trailing, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
      background: 'var(--paper-bright)', border: 'none', borderBottom: '1px solid rgba(70,54,42,.1)',
      padding: '10px 14px', fontFamily: 'var(--font-ui)', color: 'var(--ink)', minHeight: 'var(--tap-standard)',
    }}>
      {icon && <Icon name={icon} size={18} color="var(--ink-soft)" />}
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 'var(--text-body)', fontWeight: 500 }}>{title}</span>
        {meta && <span style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--ink-soft)' }}>{meta}</span>}
      </span>
      {trailing}
    </button>
  );
}
export function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'block', fontFamily: 'var(--font-ui)', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 'var(--text-label)', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{label}</span>
      {children}
      {hint && <span style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--ink-soft)', marginTop: 3 }}>{hint}</span>}
    </label>
  );
}
export function TextInput(props) {
  return <input {...props} style={{
    width: '100%', boxSizing: 'border-box', background: 'var(--paper-bright)', border: 'var(--border-soft)',
    borderRadius: 'var(--radius-sm)', padding: '8px 10px', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)',
    color: 'var(--ink)', minHeight: 'var(--tap-min)', ...props.style,
  }} />;
}
export function SectionHeader({ children, trailing }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '0 0 6px' }}>
      <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-soft)', margin: 0, fontWeight: 600, flex: 1 }}>{children}</h2>
      {trailing}
    </div>
  );
}
export function RetellingPlayer({ title, duration, transcript, playing, onToggle }) {
  return (
    <div style={{ background: 'var(--paper-bright)', border: 'var(--border-soft)', borderRadius: 'var(--radius-md)', padding: 12, fontFamily: 'var(--font-ui)', maxWidth: 440 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onToggle} aria-label={playing ? 'Pause' : 'Play retelling'} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--terracotta)', color: '#FFF6EA', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name={playing ? 'pause' : 'play'} size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
          <div style={{ height: 5, background: 'var(--paper-deep)', borderRadius: 3, marginTop: 5 }}>
            <div style={{ width: playing ? '38%' : '0%', height: '100%', background: 'var(--teal)', borderRadius: 3, transition: 'width .3s linear' }}></div>
          </div>
        </div>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{duration}</span>
      </div>
      {transcript && <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink-soft)', fontStyle: 'italic', margin: '10px 0 0' }}>&ldquo;{transcript}&rdquo;</p>}
    </div>
  );
}

export const ParentPrimitives = { ListRow, Field, TextInput, RetellingPlayer, SectionHeader };

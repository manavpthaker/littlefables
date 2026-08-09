import React from 'react';
import { Icon } from './Icon.jsx';
// Kid-first button: pill, ≥56px, icon + label + voice. Never gray, never disabled-looking.
export function Button({ variant = 'primary', size = 'standard', icon, children, utterance, onClick, style, ...rest }) {
  const h = size === 'primary' ? 'var(--tap-primary)' : size === 'small' ? 'var(--tap-min)' : 'var(--tap-standard)';
  const looks = {
    primary: { background: 'var(--action)', color: 'var(--action-ink)', border: 'none' },
    soft: { background: 'var(--terracotta-wash)', color: 'var(--ink)', border: 'none' },
    ghost: { background: 'transparent', color: 'var(--ink)', border: 'var(--border-soft)' },
    capsule: { background: 'var(--wash-capsule)', color: 'var(--ink)', border: 'none', backdropFilter: 'blur(14px)' },
  }[variant];
  const speak = () => { if (utterance && 'speechSynthesis' in window) { /* app routes through buddy voice; demo no-op */ } onClick && onClick(); };
  return (
    <button data-utterance={utterance} onClick={speak} {...rest} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
      height: h, minWidth: h, padding: '0 calc(var(--space-5) + var(--space-1))',
      borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-label)',
      cursor: 'pointer', boxShadow: variant === 'ghost' ? 'none' : 'var(--elev-card)',
      transition: `transform var(--dur-tap) var(--ease-settle), box-shadow var(--dur-tap) var(--ease-settle)`,
      ...looks, ...style,
    }}
    onPointerDown={e => { e.currentTarget.style.transform = 'scale(.96)'; e.currentTarget.style.boxShadow = 'var(--elev-press)'; }}
    onPointerUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    onPointerLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      {icon && <Icon name={icon} size={size === 'primary' ? 28 : 22} />}{children}
    </button>
  );
}
export function IconButton({ name, label, utterance, size = 'standard', variant = 'capsule', onClick, style }) {
  return <Button variant={variant} size={size} icon={name} utterance={utterance || label} onClick={onClick}
    style={{ padding: 0, aspectRatio: '1', ...style }} aria-label={label}>{null}</Button>;
}

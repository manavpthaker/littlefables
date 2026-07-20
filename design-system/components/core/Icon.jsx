import React from 'react';
import { icons } from 'lucide-react';

// 2px-stroke line icon. Renders a Lucide glyph by kebab-case name
// ("arrow-left" -> ArrowLeft), bundled via lucide-react.
//
// Was a runtime stand-in that read a global `window.lucide` set by an external
// <script>. Nothing loaded that script, so every icon fell back to a "●" dot
// across the whole app. Bundling removes the CDN dependency (works offline —
// PRD D1), renders on the server (no post-hydration flash), and keeps this
// component's public API unchanged.
export function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2, fill = 'none', style }) {
  const pascal = String(name)
    .split('-')
    .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : ''))
    .join('');
  const Glyph = icons[pascal];
  return (
    <span
      aria-hidden="true"
      style={{ display: 'inline-flex', width: size, height: size, color, flex: 'none', ...style }}
    >
      {Glyph ? <Glyph size={size} stroke="currentColor" strokeWidth={strokeWidth} fill={fill} /> : null}
    </span>
  );
}

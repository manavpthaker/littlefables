import React, { useEffect, useRef } from 'react';
// Lucide stand-in for the future hand-drawn set. Requires <script src="https://unpkg.com/lucide@0.462.0"></script> on the page.
export function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2, fill = 'none', style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const L = window.lucide; el.innerHTML = '';
    const pascal = name.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('');
    const node = L && (L.icons?.[pascal] || L[pascal]);
    if (L && node) {
      const svg = L.createElement(node);
      svg.setAttribute('width', size); svg.setAttribute('height', size);
      svg.setAttribute('stroke-width', strokeWidth); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('fill', fill);
      el.appendChild(svg);
    } else { el.textContent = '●'; }
  }, [name, size, strokeWidth, fill]);
  return <span ref={ref} aria-hidden="true" style={{ display: 'inline-flex', width: size, height: size, color, flex: 'none', ...style }}></span>;
}

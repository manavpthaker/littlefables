import { continueRender, delayRender } from 'remotion';

// Remotion renders in a headless browser with no fonts of its own. Block the
// render until IM Fell English and EB Garamond have actually arrived — without
// this, early frames silently fall back to Times and the film ships wrong.

let started = false;

export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;

  const handle = delayRender('Loading Heritage fonts');

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap';
  document.head.appendChild(link);

  link.onload = () => {
    document.fonts.ready.then(() => continueRender(handle));
  };
  link.onerror = () => continueRender(handle);
};

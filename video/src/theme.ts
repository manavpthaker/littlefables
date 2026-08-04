// Heritage design tokens, mirrored for Remotion.
//
// The DS ships CSS custom properties; compositions need plain values so they
// can be interpolated. Keep these in step with design-system/tokens/colors.css
// and typography.css — if the two drift, the film stops matching the app.

export const paper = {
  base: '#EDE3CE',
  warm: '#F3EBD8',
  deep: '#D9C7A2',
} as const;

export const ink = {
  base: '#2A1D12',
  soft: '#57432E',
  faint: '#8A7156',
} as const;

export const pigment = {
  oxblood: '#7D2E2B',
  brass: '#A67C3A',
  forest: '#2E4B3B',
  gilt: '#B89154',
  navy: '#233450',
  burgundy: '#5A2229',
} as const;

export const font = {
  display: '"IM Fell English", Georgia, "Times New Roman", serif',
  body: '"EB Garamond", Georgia, Cambria, serif',
  sc: '"IM Fell English SC", Georgia, serif',
} as const;

// Motion, in frames at 30fps. Named for the register rather than the number —
// Heritage moves like a music-box gear, not a spring.
export const FPS = 30;
const f = (ms: number) => Math.round((ms / 1000) * FPS);

export const motion = {
  tick: f(200),
  wind: f(600),
  settle: f(1200),
  chime: f(1800),
  pulse: f(3200),
} as const;

// Bezier control points matching design-system/tokens/motion.css.
export const ease = {
  mechanical: [0.2, 0, 0.2, 1] as const,
  pendulum: [0.4, 0, 0.6, 1] as const,
  chime: [0.34, 1.35, 0.64, 1] as const,
};

export const BRAND = {
  navy: '#0B1E3D',
  navyDeep: '#06142B',
  cyan: '#00C2D1',
  gold: '#C9A227',
  white: '#FFFFFF',
} as const;

export const FONT = {
  display: "'GPA Montserrat', 'Montserrat', 'Inter', sans-serif",
  body: "'GPA Inter', 'Inter', 'Helvetica Neue', Arial, sans-serif",
} as const;

export const VIDEO = {width: 1080, height: 1920, fps: 25} as const;

/** Áreas seguras de Instagram Reels (px sobre 1080×1920). */
export const SAFE = {top: 250, bottom: 340, left: 60, right: 100} as const;

export const accentColor = (a?: string) =>
  a === 'gold' ? BRAND.gold : a === 'white' ? BRAND.white : BRAND.cyan;

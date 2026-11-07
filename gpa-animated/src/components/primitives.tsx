import React from 'react';
import {BRAND, FONT} from '../lib/brand';

export const GlassPanel: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  accent?: string;
  glow?: number;
}> = ({style, children, accent = BRAND.cyan, glow = 0.25}) => (
  <div
    style={{
      position: 'relative',
      background: 'linear-gradient(135deg, rgba(11,30,61,0.82), rgba(6,20,43,0.7))',
      border: `1.5px solid ${accent}55`,
      borderRadius: 26,
      boxShadow: `0 0 ${40 * glow}px ${accent}${Math.round(glow * 90).toString(16).padStart(2, '0')}, inset 0 0 40px rgba(0,194,209,0.05), 0 18px 50px rgba(0,0,0,0.35)`,
      backdropFilter: 'blur(14px)',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

export const ICONS: Record<string, React.ReactNode> = {
  cap: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 9 L4 19 L24 29 L44 19 Z" />
      <path d="M12 24.5 V33 C12 38 36 38 36 33 V24.5" />
      <path d="M44 19 V31" />
    </g>
  ),
  steth: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 7 V19 A9 9 0 0 0 28 19 V7" />
      <path d="M19 28 V32 A9 9 0 0 0 37 32 V27" />
      <circle cx="37" cy="23" r="4.2" />
      <circle cx="10" cy="7" r="1.6" />
      <circle cx="28" cy="7" r="1.6" />
    </g>
  ),
  nurse: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 6 H29 V19 H42 V29 H29 V42 H19 V29 H6 V19 H19 Z" />
    </g>
  ),
  scalpel: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 42 L27 21" strokeWidth="4.5" />
      <path d="M27 21 C30 12 38 6 44 5 C43 12 37 20 29 23 Z" />
    </g>
  ),
  laparo: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 40 L30 14" strokeWidth="4" />
      <rect x="28" y="6" width="14" height="12" rx="3" transform="rotate(45 35 12)" />
      <circle cx="38" cy="10" r="2" />
    </g>
  ),
  wound: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="16" width="40" height="16" rx="8" transform="rotate(-35 24 24)" />
      <path d="M19 19 L29 29 M29 19 L19 29" strokeWidth="2" transform="rotate(0)" />
    </g>
  ),
  suture: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 40 C2 24 14 6 34 8" />
      <path d="M34 8 L42 12 L36 18 Z" />
      <path d="M10 40 C16 46 28 40 30 32 C32 26 40 28 44 34" strokeDasharray="2 4" />
    </g>
  ),
  assist: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 26 L18 14 C21 11 25 12 26 16 L28 22" />
      <path d="M40 26 L30 14 C27 11 23 12 22 16" />
      <path d="M8 26 C8 38 16 44 24 44 C32 44 40 38 40 26" />
    </g>
  ),
  check: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 25 L20 35 L39 13" />
    </g>
  ),
};

export const Icon: React.FC<{name: string; size?: number; color?: string; sw?: number}> = ({
  name,
  size = 40,
  color = BRAND.cyan,
  sw = 3,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" stroke={color} strokeWidth={sw} style={{overflow: 'visible'}}>
    {ICONS[name]}
  </svg>
);

export const labelStyle: React.CSSProperties = {
  fontFamily: FONT.display,
  fontWeight: 700,
  letterSpacing: 4,
  textTransform: 'uppercase',
};

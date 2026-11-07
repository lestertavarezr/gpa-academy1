import React from 'react';
import {BRAND, FONT} from '../lib/brand';
import {useAbsSeconds, useRange, useSpringAt, smooth} from '../lib/anim';

/** Wordmark institucional (tipográfico). Sustituye el hexágono por el logo oficial si lo tienes. */
export const BrandReveal: React.FC<{
  title: string;
  subtitle: string;
  at: number;
  box: {w: number; h: number};
  logoSrc?: string;
}> = ({title, subtitle, at, box}) => {
  const t = useAbsSeconds();
  const hex = useRange(at - 0.1, at + 0.7);
  const txt = useSpringAt(at + 0.15, smooth);
  const line = useRange(at + 0.2, at + 1.0);
  const R = 92;
  const pts = Array.from({length: 6}, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${R + R * 0.92 * Math.cos(a)},${R + R * 0.92 * Math.sin(a)}`;
  }).join(' ');
  const pulse = 1 + 0.04 * Math.sin((t - at) * 4);
  return (
    <div style={{width: box.w, height: box.h, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34}}>
      <svg width={R * 2} height={R * 2} viewBox={`0 0 ${R * 2} ${R * 2}`} style={{overflow: 'visible', transform: `scale(${pulse})`}}>
        <defs>
          <filter id="hexglow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <polygon points={pts} fill={BRAND.navy} fillOpacity={0.88 * hex} stroke={BRAND.gold} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - hex} filter="url(#hexglow)" />
        <polygon points={pts} fill="none" stroke={BRAND.cyan} strokeOpacity={0.6 * hex} strokeWidth={1.5} transform={`translate(${R * 0.12} ${R * 0.12}) scale(0.88)`} />
        <text x={R} y={R + 20} textAnchor="middle" fontFamily={FONT.display} fontWeight={800} fontSize={58} fill={BRAND.white} opacity={hex}>
          {title}
        </text>
      </svg>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 86, letterSpacing: 10, color: BRAND.white, opacity: txt, transform: `translateX(${(1 - txt) * 50}px)`, filter: `blur(${(1 - txt) * 10}px)`, textShadow: `0 0 34px ${BRAND.cyan}77, 0 6px 22px rgba(0,0,0,0.6)`, lineHeight: 1}}>
          {subtitle}
        </div>
        <div style={{height: 5, width: 470 * line, background: `linear-gradient(90deg, ${BRAND.gold}, ${BRAND.cyan}, transparent)`, borderRadius: 5, boxShadow: `0 0 16px ${BRAND.gold}88`}} />
      </div>
    </div>
  );
};

import React from 'react';
import {BRAND, FONT} from '../lib/brand';
import {useAbsSeconds, useSpringAt, smooth} from '../lib/anim';

/** Vista previa de simulación quirúrgica (campo laparoscópico esquemático con instrumentos). */
export const SimulationPreview: React.FC<{label?: string; at?: number; box: {w: number; h: number}}> = ({label = 'SIMULACIÓN', at = 0, box}) => {
  const t = useAbsSeconds();
  const p = useSpringAt(at, smooth);
  const s = Math.min(box.w, box.h);
  const a = Math.sin(t * 1.3) * 18;
  const b = Math.cos(t * 1.1) * 14;
  return (
    <div style={{width: box.w, height: box.h, display: 'grid', placeItems: 'center', opacity: p, transform: `scale(${0.9 + 0.1 * p})`}}>
      <svg width={s} height={s} viewBox="0 0 300 300" style={{overflow: 'visible'}}>
        <defs>
          <radialGradient id="sim-bg"><stop offset="0" stopColor={BRAND.cyan} stopOpacity="0.28" /><stop offset="1" stopColor={BRAND.navy} stopOpacity="0.85" /></radialGradient>
          <clipPath id="sim-clip"><circle cx="150" cy="150" r="128" /></clipPath>
        </defs>
        <circle cx="150" cy="150" r="136" fill="none" stroke={BRAND.gold} strokeWidth="3" strokeDasharray="6 10" />
        <circle cx="150" cy="150" r="128" fill="url(#sim-bg)" stroke={BRAND.cyan} strokeWidth="2.5" />
        <g clipPath="url(#sim-clip)" stroke={BRAND.cyan} strokeWidth="1" strokeOpacity="0.25">
          {Array.from({length: 11}, (_, i) => <path key={i} d={`M${30 + i * 24} 20 V280 M20 ${30 + i * 24} H280`} />)}
        </g>
        <g stroke={BRAND.white} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d={`M40 ${250 + b} L${150 + a} ${160}`} />
          <path d={`M260 ${240 - b} L${160 - a} ${170}`} />
        </g>
        <circle cx={155} cy={165} r={8} fill="none" stroke={BRAND.gold} strokeWidth="2" />
        <text x="150" y="292" textAnchor="middle" fontFamily={FONT.display} fontWeight={700} fontSize="16" letterSpacing="6" fill={BRAND.cyan}>{label}</text>
      </svg>
    </div>
  );
};

import React from 'react';
import {BRAND} from '../lib/brand';
import {useAbsSeconds, useRange} from '../lib/anim';

/**
 * Vista abdominal holográfica con puertos laparoscópicos (trocares) y cuadrantes. Educativo y esquemático:
 * no representa datos clínicos reales.
 */
export const AnatomyVisualization: React.FC<{
  variant?: 'torso-ports';
  box: {w: number; h: number};
  startSec?: number;
}> = ({box, startSec = 3.6}) => {
  const t = useAbsSeconds();
  const draw = useRange(startSec, startSec + 1.1);
  const ports = [
    {x: 150, y: 244, at: startSec + 0.55}, // umbilical (cámara)
    {x: 214, y: 178, at: startSec + 0.8},
    {x: 86, y: 178, at: startSec + 1.0},
    {x: 150, y: 118, at: startSec + 1.2},
  ];
  const target = {x: 150, y: 190};
  const scanY = 30 + (((t - startSec) * 80) % 330);
  const stroke = BRAND.cyan;
  const body = 'M70 30 Q150 -8 230 30 L262 120 Q282 250 238 372 Q150 408 62 372 Q18 250 38 120 Z';
  const ring = useRange(startSec + 1.2, startSec + 1.7);
  return (
    <svg width={box.w} height={box.h} viewBox="0 0 300 410" style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="abd-clip"><path d={body} /></clipPath>
        <linearGradient id="abd-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.2" />
          <stop offset="1" stopColor={BRAND.navy} stopOpacity="0.08" />
        </linearGradient>
        <filter id="an-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#an-glow)" fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d={body} fill="url(#abd-fill)" fillOpacity={draw} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <g clipPath="url(#abd-clip)" opacity={draw}>
          {/* arco costal (esquema) */}
          <path d="M44 120 Q150 30 256 120" strokeOpacity={0.55} strokeWidth={1.6} />
          <path d="M54 142 Q150 62 246 142" strokeOpacity={0.35} strokeWidth={1.4} />
          {/* cuadrantes abdominales */}
          <path d="M150 62 V396 M24 236 H276" strokeDasharray="4 7" strokeOpacity={0.55} strokeWidth={1.3} />
          <circle cx="150" cy="244" r="5" strokeOpacity={0.7} strokeWidth={1.4} />
          <rect x="0" y={scanY} width="300" height="3" fill={stroke} stroke="none" opacity={0.55} />
        </g>
      </g>
      {ports.map((p, i) => {
        const a = useRange(p.at, p.at + 0.6);
        const pulse = 1 + 0.5 * Math.sin((t - p.at) * 5);
        return (
          <g key={i} opacity={a}>
            <line x1={p.x} y1={p.y} x2={p.x + (target.x - p.x) * a} y2={p.y + (target.y - p.y) * a} stroke={BRAND.gold} strokeOpacity={0.85} strokeWidth={1.8} strokeDasharray="3 5" />
            <circle cx={p.x} cy={p.y} r={6} fill={BRAND.gold} />
            <circle cx={p.x} cy={p.y} r={10 + 7 * pulse * a} fill="none" stroke={BRAND.gold} strokeOpacity={0.5 / pulse} strokeWidth={1.6} />
          </g>
        );
      })}
      <circle cx={target.x} cy={target.y} r={16 * ring} fill="none" stroke={BRAND.white} strokeOpacity={0.9} strokeWidth={2} />
      <circle cx={target.x} cy={target.y} r={3 * ring} fill={BRAND.white} />
    </svg>
  );
};

import React from 'react';
import {BRAND} from '../lib/brand';
import {useAbsSeconds, useRange} from '../lib/anim';

/** Puertas holográficas que se abren (metáfora de «abre las puertas»). */
export const PortalDoors: React.FC<{box: {w: number; h: number}; startSec?: number}> = ({box, startSec = 0}) => {
  const t = useAbsSeconds();
  const frame = useRange(startSec, startSec + 0.6);
  const open = useRange(startSec + 0.35, startSec + 1.3);
  const w = box.w, h = box.h, half = (w - 24) / 2;
  const glow = 0.25 + 0.15 * Math.sin(t * 3);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="door-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND.white} stopOpacity={0.85} />
          <stop offset="1" stopColor={BRAND.cyan} stopOpacity={0.25 + glow} />
        </linearGradient>
        <clipPath id="door-clip"><rect x="12" y="12" width={w - 24} height={h - 24} /></clipPath>
        <filter id="door-glow"><feGaussianBlur stdDeviation="2.6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect x="12" y="12" width={w - 24} height={h - 24} fill="url(#door-light)" opacity={open} />
      <g filter="url(#door-glow)" fill="rgba(11,30,61,0.85)" stroke={BRAND.cyan} strokeWidth={2.4}>
        <rect x="12" y="12" width={w - 24} height={h - 24} fill="none" stroke={BRAND.gold} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - frame} />
        <g clipPath="url(#door-clip)" opacity={frame}><g transform={`translate(${-open * half} 0)`}>
          <rect x="12" y="12" width={half} height={h - 24} />
          <path d={`M${12 + half - 14} ${h / 2 - 20} V${h / 2 + 20}`} stroke={BRAND.gold} strokeWidth={4} />
        </g>
        <g transform={`translate(${open * half} 0)`}>
          <rect x={12 + half} y="12" width={half} height={h - 24} />
          <path d={`M${12 + half + 14} ${h / 2 - 20} V${h / 2 + 20}`} stroke={BRAND.gold} strokeWidth={4} />
        </g></g>
      </g>
    </svg>
  );
};

/** Escalones ascendentes (metáfora de «da el siguiente paso»). */
export const AscendingSteps: React.FC<{box: {w: number; h: number}; startSec?: number; steps?: number}> = ({box, startSec = 0, steps = 4}) => {
  const t = useAbsSeconds();
  const w = box.w, h = box.h;
  const sw = (w - 20) / steps;
  const arrow = useRange(startSec + 0.5, startSec + 1.6);
  const pts = Array.from({length: steps}, (_, i) => ({x: 10 + i * sw + sw / 2, y: h - 12 - (i + 1) * ((h - 40) / steps)}));
  const ax = pts[0].x + (pts[steps - 1].x - pts[0].x) * arrow;
  const ay = pts[0].y - 22 + (pts[steps - 1].y - pts[0].y) * arrow;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
      <defs><filter id="st-glow"><feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <g filter="url(#st-glow)">
        {pts.map((p, i) => {
          const a = useRange(startSec + i * 0.14, startSec + 0.5 + i * 0.14);
          const bh = (h - 12) - p.y;
          return <rect key={i} x={10 + i * sw + 4} y={h - 12 - bh * a} width={sw - 8} height={bh * a} rx={4} fill={i === steps - 1 ? BRAND.gold : BRAND.cyan} fillOpacity={0.2} stroke={i === steps - 1 ? BRAND.gold : BRAND.cyan} strokeWidth={2.2} />;
        })}
        <g transform={`translate(${ax} ${ay + Math.sin(t * 5) * 3})`} opacity={arrow > 0 ? 1 : 0}>
          <circle r={9} fill={BRAND.white} />
          <path d="M-14 -24 L0 -40 L14 -24" fill="none" stroke={BRAND.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
};

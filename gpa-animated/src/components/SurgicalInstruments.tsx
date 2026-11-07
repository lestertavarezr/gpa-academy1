import React from 'react';
import {interpolate, useVideoConfig} from 'remotion';
import {BRAND, FONT} from '../lib/brand';
import {useAbsSeconds, useRange, useSpringAt, smooth} from '../lib/anim';
import {GlassPanel} from './primitives';

/** Contornos de instrumentos (viewBox 240×60, horizontales). */
const SHAPES: Record<string, {d: string[]; fills?: string[]}> = {
  scalpel: {
    d: [
      'M70 24 H222 Q232 24 232 30 Q232 36 222 36 H70 Z', // mango
      'M70 24 L50 27 H44 V33 H50 L70 36', // cuello
      'M44 27 L14 31 Q7 33 11 34.5 L44 33 Z', // hoja
      'M104 24 V36 M118 24 V36 M132 24 V36 M146 24 V36 M160 24 V36', // agarre
    ],
  },
  forceps: {
    d: [
      'M8 29 L118 26.5 L172 20 L204 10',
      'M8 31 L118 33.5 L172 40 L204 50',
      'M8 29 V31 M18 28.8 V31.2 M28 28.5 V31.5 M38 28.3 V31.7',
      'M104 30 m-4.5 0 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0',
      'M214 10 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0',
      'M214 50 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0',
    ],
  },
  scissors: {
    d: [
      'M6 25 L108 30 L198 49',
      'M6 35 L108 30 L198 11',
      'M6 25 Q40 29 108 30 M6 35 Q40 31 108 30',
      'M108 30 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0',
      'M214 52 m-11 0 a11 7 0 1 0 22 0 a11 7 0 1 0 -22 0',
      'M214 8 m-11 0 a11 7 0 1 0 22 0 a11 7 0 1 0 -22 0',
    ],
  },
  needleholder: {
    d: [
      'M8 28 L48 25.5 L172 22 L204 11',
      'M8 32 L48 34.5 L172 38 L204 49',
      'M8 28 V32 M16 27.7 V32.3 M24 27 V33 M32 26.6 V33.4',
      'M140 30 l9 -3 M150 30.5 l9 -3 M160 31 l9 -3',
      'M104 30 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0',
      'M214 11 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0',
      'M214 49 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0',
    ],
  },
};

export const InstrumentGlyph: React.FC<{
  name: string;
  /** Progreso de dibujado 0→1 */
  draw: number;
  width?: number;
  color?: string;
}> = ({name, draw, width = 240, color = BRAND.cyan}) => {
  const shape = SHAPES[name] ?? SHAPES.scalpel;
  const fillOpacity = interpolate(draw, [0.7, 1], [0, 0.16], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={width} height={width / 4} viewBox="0 0 240 60" style={{overflow: 'visible'}}>
      <defs>
        <filter id={`glow-${name}`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#glow-${name})`} fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
        {shape.d.map((d, i) => (
          <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        ))}
      </g>
    </svg>
  );
};

const Lamp: React.FC<{w: number; h: number}> = ({w, h}) => {
  const t = useAbsSeconds();
  const on = useRange(16.0, 16.7);
  const sway = Math.sin(t * 1.4) * 1.2;
  return (
    <svg width={w} height={h} viewBox="0 0 280 420" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND.white} stopOpacity={0.45 * on} />
          <stop offset="1" stopColor={BRAND.cyan} stopOpacity={0} />
        </linearGradient>
        <filter id="lamp-glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform={`rotate(${sway} 140 0)`}>
        <polygon points="70,196 210,196 270,420 10,420" fill="url(#cone)" />
        <g filter="url(#lamp-glow)" fill="none" stroke={BRAND.cyan} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M140 0 V84" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, on * 1.6)} />
          <circle cx="140" cy="92" r="8" />
          <path d="M140 100 V132" />
          <ellipse cx="140" cy="172" rx="98" ry="30" />
          <ellipse cx="140" cy="172" rx="78" ry="22" opacity="0.55" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const a = (i / 7) * Math.PI * 2;
            return <circle key={i} cx={140 + Math.cos(a) * 52} cy={174 + Math.sin(a) * 13} r="6" fill={BRAND.white} fillOpacity={0.5 * on} />;
          })}
          <circle cx="140" cy="174" r="8" fill={BRAND.gold} fillOpacity={0.9 * on} stroke={BRAND.gold} />
        </g>
      </g>
    </svg>
  );
};

export const SurgicalInstruments: React.FC<{
  variant: 'pair' | 'tray' | 'lamp';
  items?: string[];
  heading?: {text: string; at: number}[];
  box: {w: number; h: number};
  startSec?: number;
}> = ({variant, items = [], heading = [], box}) => {
  const {fps} = useVideoConfig();
  const t = useAbsSeconds();
  // Barrido de escáner holográfico
  const sweep = (t * 0.55) % 1;

  if (variant === 'lamp') return <Lamp w={box.w} h={box.h} />;

  if (variant === 'pair') {
    return (
      <div style={{position: 'relative', width: box.w, height: box.h}}>
        {items.map((name, i) => {
          const dr = useRangeAt(2.64 + i * 0.35, 2.64 + i * 0.35 + 0.9);
          const float = Math.sin(t * 1.6 + i) * 6;
          return (
            <div
              key={name}
              style={{
                position: 'absolute',
                left: 18 + i * 22,
                top: 120 + i * 150 + float,
                transform: `rotate(${-38 + i * 8}deg)`,
                transformOrigin: 'left center',
                opacity: Math.min(1, dr * 2),
              }}
            >
              <InstrumentGlyph name={name} draw={dr} width={280} />
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${sweep * 100}%`,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${BRAND.cyan}aa, transparent)`,
            opacity: 0.5,
          }}
        />
      </div>
    );
  }

  // tray
  const panel = useSpringAt(19.3, smooth);
  return (
    <GlassPanel style={{width: box.w, height: box.h, padding: '26px 40px', opacity: panel}} glow={0.3}>
      <div style={{display: 'flex', gap: 22, alignItems: 'baseline', marginBottom: 10, height: 56}}>
        {heading.map((h, i) => {
          const p = useSpringAt(h.at, {damping: 18, stiffness: 130, mass: 0.7});
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 40,
                letterSpacing: 2,
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                color: i === heading.length - 1 ? BRAND.gold : BRAND.white,
                opacity: p,
                transform: `translateY(${(1 - p) * 20}px)`,
                filter: `blur(${(1 - p) * 8}px)`,
                textShadow: `0 0 24px ${i === heading.length - 1 ? BRAND.gold : BRAND.cyan}66`,
              }}
            >
              {h.text}
            </span>
          );
        })}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 36, rowGap: 6, position: 'relative'}}>
        {items.map((name, i) => {
          const dr = useRangeAt(19.45 + i * 0.16, 19.45 + i * 0.16 + 0.75);
          return (
            <div key={name} style={{height: 84, display: 'flex', alignItems: 'center'}}>
              <InstrumentGlyph name={name} draw={dr} width={330} />
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${((t * 0.45) % 1.3) * 100 - 15}%`,
            width: 70,
            background: `linear-gradient(90deg, transparent, ${BRAND.cyan}33, transparent)`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </GlassPanel>
  );
};

// hook auxiliar (útil dentro de map con claves estables)
function useRangeAt(a: number, b: number) {
  return useRange(a, b);
}

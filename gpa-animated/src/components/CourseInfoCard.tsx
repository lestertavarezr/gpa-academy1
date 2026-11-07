import React from 'react';
import {BRAND, FONT} from '../lib/brand';
import {useAbsSeconds, useRange, useSpringAt, smooth} from '../lib/anim';
import {GlassPanel, Icon} from './primitives';

type Item = {text: string; at: number; icon?: string};

/**
 * Tarjeta de programas académicos. Todo el contenido viene de props (nada inventado);
 * cada línea aparece en el instante `at` en que se pronuncia.
 */
export const CourseInfoCard: React.FC<{
  badge?: {text: string; at: number; highlight?: {text: string; at: number}};
  items?: Item[];
  /** Compatibilidad con el formato simple */
  title?: string;
  lines?: string[];
  rowH?: number;
  box: {w: number; h: number};
  startSec?: number;
}> = ({badge, items = [], title, lines = [], rowH = 58, box, startSec = 0}) => {
  const t = useAbsSeconds();
  const panel = useSpringAt(startSec, smooth);
  const list: Item[] = items.length ? items : lines.map((text, i) => ({text, at: startSec + 0.3 + i * 0.2, icon: 'check'}));
  const hl = useSpringAt(badge?.highlight?.at ?? 0, {damping: 16, stiffness: 140, mass: 0.7});
  return (
    <GlassPanel style={{width: box.w, height: box.h, padding: '24px 34px', opacity: panel, transform: `translateY(${(1 - panel) * 24}px)`}} glow={0.3}>
      <div style={{position: 'absolute', left: 0, top: 22, bottom: 22, width: 7, borderRadius: 7, background: BRAND.gold, boxShadow: `0 0 16px ${BRAND.gold}`}} />
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16, height: 46, marginBottom: 8, fontFamily: FONT.display, fontWeight: 800, fontSize: 34, letterSpacing: 5, textTransform: 'uppercase'}}>
        {badge && (
          <>
            <span style={{color: BRAND.gold, opacity: useSpringAt(badge.at, smooth), textShadow: `0 0 18px ${BRAND.gold}77`}}>{badge.text}</span>
            {badge.highlight && (
              <span style={{color: BRAND.cyan, opacity: hl, transform: `translateY(${(1 - hl) * 12}px)`, textShadow: `0 0 18px ${BRAND.cyan}88`}}>{badge.highlight.text}</span>
            )}
          </>
        )}
        {!badge && title && <span style={{color: BRAND.white}}>{title}</span>}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 9}}>
        {list.map((it, i) => {
          const p = useSpringAt(it.at, {damping: 16, stiffness: 140, mass: 0.7});
          const active = t >= it.at && (list[i + 1] ? t < list[i + 1].at : t < it.at + 1.4);
          return (
            <div
              key={it.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                height: rowH,
                padding: '0 18px 0 10px',
                borderRadius: 16,
                background: active ? 'linear-gradient(90deg, rgba(0,194,209,0.26), rgba(0,194,209,0.02))' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? BRAND.cyan : 'rgba(0,194,209,0.22)'}`,
                opacity: p * (active ? 1 : 0.8),
                transform: `translateX(${(1 - p) * -50}px)`,
                filter: `blur(${(1 - p) * 8}px)`,
              }}
            >
              <span style={{width: 40, height: 40, borderRadius: 20, display: 'grid', placeItems: 'center', background: active ? `${BRAND.gold}33` : 'rgba(0,194,209,0.12)', border: `1.5px solid ${active ? BRAND.gold : 'rgba(0,194,209,0.5)'}`}}>
                <Icon name={it.icon ?? 'check'} size={25} color={active ? BRAND.gold : BRAND.cyan} sw={3.2} />
              </span>
              <span style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 29, letterSpacing: 0.3, color: BRAND.white, whiteSpace: 'nowrap'}}>{it.text}</span>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};

/**
 * Certificado estilizado y genérico (sin logos de terceros, avales ni acreditaciones).
 */
export const CertificateCard: React.FC<{title: string; at: number; box: {w: number; h: number}}> = ({title, at, box}) => {
  const t = useAbsSeconds();
  const p = useSpringAt(at - 0.15, smooth);
  const seal = useSpringAt(at + 0.35, {damping: 11, stiffness: 120, mass: 0.8});
  const frame = useRange(at - 0.1, at + 0.8);
  const shine = ((t - at) * 0.9) % 2;
  return (
    <div style={{width: box.w, height: box.h, display: 'grid', placeItems: 'center'}}>
      <div style={{position: 'relative', width: 700, height: 300, opacity: p, transform: `perspective(900px) rotateX(${(1 - p) * 18}deg) scale(${0.92 + 0.08 * p})`}}>
        <GlassPanel style={{position: 'absolute', inset: 0, borderRadius: 18, border: `2px solid ${BRAND.gold}`}} accent={BRAND.gold} glow={0.35}>
          <svg width="700" height="300" style={{position: 'absolute', inset: 0}}>
            <rect x="14" y="14" width="672" height="272" rx="10" fill="none" stroke={BRAND.gold} strokeOpacity={0.7} strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - frame} />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 56, letterSpacing: 9, color: BRAND.white, textTransform: 'uppercase', textShadow: `0 0 24px ${BRAND.gold}66`}}>
            {title}
          </div>
          <div style={{position: 'absolute', left: 120, right: 120, top: 130, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center'}}>
            {[0.9, 0.7, 0.8].map((w, i) => (
              <div key={i} style={{height: 8, width: `${w * 100}%`, borderRadius: 8, background: `linear-gradient(90deg, transparent, ${BRAND.cyan}55, transparent)`, opacity: useRange(at + 0.1 + i * 0.12, at + 0.5 + i * 0.12)}} />
            ))}
          </div>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${shine * 60 - 20}%`, width: 90, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)', transform: 'skewX(-20deg)'}} />
        </GlassPanel>
        <svg width="130" height="150" viewBox="0 0 130 150" style={{position: 'absolute', right: 46, bottom: -34, transform: `scale(${seal}) rotate(${(1 - seal) * -40}deg)`, filter: `drop-shadow(0 0 14px ${BRAND.gold}99)`}}>
          <path d="M40 90 L26 146 L60 128 L66 90 Z M90 90 L104 146 L70 128 L64 90 Z" fill={BRAND.cyan} fillOpacity={0.85} />
          <circle cx="65" cy="58" r="46" fill={BRAND.gold} />
          <circle cx="65" cy="58" r="36" fill="none" stroke={BRAND.navy} strokeWidth="3" />
          <path d="M65 36 L71 52 L88 53 L75 64 L79 80 L65 71 L51 80 L55 64 L42 53 L59 52 Z" fill={BRAND.navy} />
        </svg>
      </div>
    </div>
  );
};

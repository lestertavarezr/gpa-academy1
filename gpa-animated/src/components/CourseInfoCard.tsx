import React from 'react';
import {BRAND, FONT} from '../lib/brand';
import {useSpringAt, smooth} from '../lib/anim';
import {GlassPanel} from './primitives';

/** Tarjeta de programa académico (reutilizable). Sin datos inventados: todo viene de props. */
export const CourseInfoCard: React.FC<{
  title: string;
  lines: string[];
  badge?: string;
  at?: number;
  box: {w: number; h: number};
}> = ({title, lines, badge, at = 0, box}) => {
  const p = useSpringAt(at, smooth);
  return (
    <GlassPanel style={{width: box.w, height: box.h, padding: '34px 46px', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}} glow={0.3}>
      {badge && (
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 24, letterSpacing: 6, color: BRAND.gold, textTransform: 'uppercase'}}>{badge}</div>
      )}
      <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 60, color: BRAND.white, margin: '10px 0 16px', lineHeight: 1.05}}>{title}</div>
      {lines.map((l, i) => {
        const q = useSpringAt(at + 0.25 + i * 0.18, smooth);
        return (
          <div key={i} style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 32, color: BRAND.white, opacity: q, display: 'flex', gap: 14, alignItems: 'center', marginTop: 8}}>
            <span style={{width: 10, height: 10, background: BRAND.cyan, transform: 'rotate(45deg)'}} />
            {l}
          </div>
        );
      })}
    </GlassPanel>
  );
};

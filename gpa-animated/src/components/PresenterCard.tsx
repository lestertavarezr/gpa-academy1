import React from 'react';
import {BRAND, FONT} from '../lib/brand';
import {useSpringAt, smooth, snappy} from '../lib/anim';
import {GlassPanel} from './primitives';

export const PresenterCard: React.FC<{
  name: string;
  nameAt: number;
  roles: {text: string; at: number}[];
  box: {w: number; h: number};
}> = ({name, nameAt, roles, box}) => {
  const n = useSpringAt(nameAt - 0.1, smooth);
  const bar = useSpringAt(nameAt - 0.1, {damping: 20, stiffness: 100, mass: 1});
  const [dr, ...rest] = name.split(' ');
  return (
    <GlassPanel style={{width: box.w, height: box.h, padding: '30px 44px'}} glow={0.3}>
      <div style={{position: 'absolute', left: 0, top: 24, bottom: 24, width: 7, borderRadius: 7, background: BRAND.gold, transform: `scaleY(${bar})`, transformOrigin: 'top', boxShadow: `0 0 18px ${BRAND.gold}`}} />
      <div
        style={{
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 56,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: BRAND.white,
          opacity: n,
          transform: `translateX(${(1 - n) * -40}px)`,
          filter: `blur(${(1 - n) * 10}px)`,
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{color: BRAND.gold}}>{dr}</span> {rest.join(' ')}
      </div>
      <div style={{height: 3, margin: '14px 0 14px', width: 340 * bar, background: `linear-gradient(90deg, ${BRAND.cyan}, transparent)`}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {roles.map((r) => {
          const p = useSpringAt(r.at, snappy);
          return (
            <div
              key={r.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: p,
                transform: `translateX(${(1 - p) * 40}px)`,
                filter: `blur(${(1 - p) * 8}px)`,
              }}
            >
              <span style={{width: 12, height: 12, borderRadius: 3, transform: 'rotate(45deg)', background: BRAND.cyan, boxShadow: `0 0 12px ${BRAND.cyan}`}} />
              <span style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 35, letterSpacing: 1, color: BRAND.white}}>{r.text}</span>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};

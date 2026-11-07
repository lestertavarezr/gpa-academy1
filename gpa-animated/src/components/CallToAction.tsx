import React from 'react';
import {BRAND, FONT} from '../lib/brand';
import {useAbsSeconds, useSpringAt, snappy} from '../lib/anim';

/** Cierre animado de invitación. Úsalo solo si la narración invita a inscribirse. */
export const CallToAction: React.FC<{headline: string; sub?: string; at?: number; box: {w: number; h: number}}> = ({headline, sub, at = 0, box}) => {
  const t = useAbsSeconds();
  const p = useSpringAt(at, snappy);
  const pulse = 1 + 0.04 * Math.sin((t - at) * 5);
  return (
    <div style={{width: box.w, height: box.h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: p}}>
      <div
        style={{
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 76,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: BRAND.navy,
          background: `linear-gradient(90deg, ${BRAND.gold}, #E6C657)`,
          padding: '20px 56px',
          borderRadius: 60,
          transform: `scale(${pulse * (0.8 + 0.2 * p)})`,
          boxShadow: `0 0 44px ${BRAND.gold}88`,
        }}
      >
        {headline}
      </div>
      {sub && <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: BRAND.white, textTransform: 'uppercase'}}>{sub}</div>}
    </div>
  );
};

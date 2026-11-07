import React, {useContext} from 'react';
import {interpolate} from 'remotion';
import {VIDEOS} from '../lib/timeline';
import {BRAND, FONT} from '../lib/brand';
import {AnimContext, useAbsSeconds} from '../lib/anim';

type Group = {words: [number, number]; start: number; end: number; text: string};

/** Subtítulos dinámicos: la palabra activa se resalta en cian y escala ligeramente. */
export const Captions: React.FC<{groups: Group[]; box: {w: number; h: number}}> = ({groups, box}) => {
  const t = useAbsSeconds();
  const {videoId} = useContext(AnimContext);
  const WORDS = VIDEOS[videoId].words;
  const g = [...groups].reverse().find((x) => t >= x.start - 0.08 && t <= x.end + 0.4); // el grupo más reciente gana
  if (!g) return null;
  const words = WORDS.slice(g.words[0], g.words[1] + 1);
  const inP = interpolate(t, [g.start - 0.08, g.start + 0.14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outP = interpolate(t, [g.end + 0.2, g.end + 0.4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o = Math.min(inP, outP);
  return (
    <div style={{width: box.w, height: box.h, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0px 22px',
          maxWidth: box.w,
          padding: '16px 34px 18px',
          borderRadius: 30,
          background: 'rgba(6,20,43,0.66)',
          border: `1.5px solid ${BRAND.cyan}40`,
          backdropFilter: 'blur(12px)',
          opacity: o,
          transform: `translateY(${(1 - inP) * 18}px)`,
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
        }}
      >
        {words.map((w) => {
          const active = t >= w.start && t < w.end + 0.06;
          const spoken = t >= w.start;
          return (
            <span
              key={w.i}
              style={{
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: 48,
                lineHeight: 1.22,
                color: active ? BRAND.cyan : BRAND.white,
                opacity: spoken ? 1 : 0.42,
                transform: `scale(${active ? 1.045 : 1})`,
                textShadow: active ? `0 0 22px ${BRAND.cyan}aa` : '0 2px 10px rgba(0,0,0,0.55)',
                display: 'inline-block',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

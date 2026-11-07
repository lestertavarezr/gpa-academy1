import React from 'react';
import {BRAND, FONT, accentColor} from '../lib/brand';
import {useAbsSeconds, useRange, useSpringAt, snappy} from '../lib/anim';
import {Icon} from './primitives';

type Item = {text: string; at: number; icon?: string};

const Chip: React.FC<{item: Item; nextAt?: number}> = ({item, nextAt}) => {
  const t = useAbsSeconds();
  const p = useSpringAt(item.at, {damping: 15, stiffness: 150, mass: 0.7});
  const active = t >= item.at && (nextAt === undefined || t < nextAt);
  const dim = nextAt !== undefined && t >= nextAt ? 0.62 : 1;
  const pulse = active ? 0.5 + 0.5 * Math.sin((t - item.at) * 6) : 0;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 18,
        height: 64,
        padding: '0 30px 0 12px',
        borderRadius: 40,
        background: active
          ? 'linear-gradient(90deg, rgba(0,194,209,0.30), rgba(11,30,61,0.88))'
          : 'linear-gradient(90deg, rgba(11,30,61,0.82), rgba(6,20,43,0.72))',
        border: `1.5px solid ${active ? BRAND.cyan : 'rgba(0,194,209,0.35)'}`,
        boxShadow: active ? `0 0 ${24 + pulse * 14}px ${BRAND.cyan}77` : '0 8px 24px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)',
        opacity: p * dim,
        transform: `translateX(${(1 - p) * -60}px) scale(${0.92 + 0.08 * p})`,
        filter: `blur(${(1 - p) * 10}px)`,
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          display: 'grid',
          placeItems: 'center',
          background: active ? `${BRAND.gold}33` : 'rgba(0,194,209,0.14)',
          border: `1.5px solid ${active ? BRAND.gold : 'rgba(0,194,209,0.5)'}`,
        }}
      >
        <Icon name={item.icon ?? 'check'} size={28} color={active ? BRAND.gold : BRAND.cyan} sw={3.2} />
      </span>
      <span
        style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: 31,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: BRAND.white,
          whiteSpace: 'nowrap',
        }}
      >
        {item.text}
      </span>
    </div>
  );
};

const Chips: React.FC<{items: Item[]; prefix?: {text: string; at: number; ellipsis?: boolean}}> = ({items, prefix}) => {
  const pre = useSpringAt(prefix?.at ?? 0, snappy);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11}}>
      {prefix && (
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: 9,
            textTransform: 'uppercase',
            color: BRAND.gold,
            opacity: pre,
            transform: `translateY(${(1 - pre) * 14}px)`,
            textShadow: `0 0 18px ${BRAND.gold}88`,
            marginBottom: 2,
          }}
        >
          {prefix.text}{prefix.ellipsis === false ? '' : '…'}
        </div>
      )}
      {items.map((it, i) => (
        <Chip key={it.text} item={it} nextAt={items[i + 1]?.at} />
      ))}
    </div>
  );
};

const Word: React.FC<{text: string; at: number; size: number; color: string; accent: string}> = ({text, at, size, color, accent}) => {
  const p = useSpringAt(at, {damping: 17, stiffness: 140, mass: 0.7});
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 34}px) scale(${1.18 - 0.18 * p})`,
        filter: `blur(${(1 - p) * 12}px)`,
        textShadow: `0 0 30px ${accent}88, 0 6px 22px rgba(0,0,0,0.55)`,
        margin: '0 14px',
      }}
    >
      {text}
    </span>
  );
};

const Headline: React.FC<{
  items: Item[];
  accent?: string;
  progress?: {from: number; to: number};
}> = ({items, accent, progress}) => {
  const ac = accentColor(accent);
  const longest = Math.max(...items.map((i) => i.text.length));
  const total = items.reduce((n, i) => n + i.text.length + 1, 0) - 1;
  const size = Math.min(total > 18 ? 78 : 108, Math.floor(820 / (longest * 0.8)));
  const first = items[0].at;
  const bar = useRange(first, first + 0.5);
  const prog = progress ? useRange(progress.from, progress.to) : 0;
  const done = progress ? Math.min(1, Math.max(0, (prog - 0.85) / 0.15)) : 0;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900}}>
        {items.map((it, i) => (
          <Word key={i} text={it.text} at={it.at} size={size} accent={ac} color={i === items.length - 1 && items.length > 1 ? ac : BRAND.white} />
        ))}
      </div>
      <div style={{height: 6, width: 440 * bar, borderRadius: 6, background: `linear-gradient(90deg, ${ac}, ${ac}00)`, boxShadow: `0 0 18px ${ac}`}} />
      {progress && (
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 520, height: 14, borderRadius: 14, background: 'rgba(255,255,255,0.14)', overflow: 'hidden', border: `1px solid ${BRAND.cyan}66`}}>
            <div style={{width: `${prog * 100}%`, height: '100%', background: `linear-gradient(90deg, ${BRAND.cyan}, ${BRAND.gold})`, boxShadow: `0 0 16px ${BRAND.cyan}`}} />
          </div>
          <div style={{opacity: done, transform: `scale(${0.6 + 0.4 * done})`}}>
            <Icon name="check" size={46} color={BRAND.gold} sw={4.5} />
          </div>
        </div>
      )}
    </div>
  );
};

export const AnimatedKeywords: React.FC<{
  variant: 'chips' | 'headline';
  items: Item[];
  prefix?: {text: string; at: number; ellipsis?: boolean};
  accent?: string;
  progress?: {from: number; to: number};
  box: {w: number; h: number};
}> = ({variant, items, prefix, accent, progress, box}) => (
  <div style={{width: box.w, height: box.h, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    {variant === 'chips' ? <Chips items={items} prefix={prefix} /> : <Headline items={items} accent={accent} progress={progress} />}
  </div>
);

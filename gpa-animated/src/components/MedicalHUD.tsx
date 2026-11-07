import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {BRAND, FONT, SAFE, VIDEO} from '../lib/brand';
import {useAbsSeconds, useRange} from '../lib/anim';

/* ───────────────────────── marco HUD (esquinas + etiqueta + barrido inicial) ───────────────────────── */
const Bracket: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <path d="M0 62 V8 Q0 0 8 0 H62" fill="none" stroke={BRAND.cyan} strokeWidth={3} strokeLinecap="round" />
    <path d="M0 80 V70" stroke={BRAND.gold} strokeWidth={3} strokeLinecap="round" />
  </g>
);

const HudFrame: React.FC<{tag?: string}> = ({tag}) => {
  const t = useAbsSeconds();
  const draw = useRange(0.2, 1.1);
  const sweepP = interpolate(t, [0.2, 1.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x0 = SAFE.left;
  const x1 = VIDEO.width - SAFE.left;
  const y0 = SAFE.top - 40;
  const y1 = VIDEO.height - SAFE.bottom - 20;
  const blink = 0.55 + 0.45 * Math.sin(t * 4);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0, opacity: 0.8 * draw}}>
        <Bracket x={x0} y={y0} r={0} />
        <Bracket x={x1} y={y0} r={90} />
        <Bracket x={x1} y={y1} r={180} />
        <Bracket x={x0} y={y1} r={270} />
      </svg>
      {tag && (
        <div
          style={{
            position: 'absolute',
            left: x0 + 26,
            top: y0 + 22,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: draw,
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 5,
            color: BRAND.white,
            textShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}
        >
          <span style={{width: 10, height: 10, borderRadius: 10, background: BRAND.cyan, boxShadow: `0 0 14px ${BRAND.cyan}`, opacity: blink}} />
          {tag}
        </div>
      )}
      {sweepP > 0 && sweepP < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: sweepP * VIDEO.height,
            height: 160,
            marginTop: -160,
            background: `linear-gradient(180deg, transparent, ${BRAND.cyan}22 80%, ${BRAND.cyan}77)`,
            opacity: Math.sin(sweepP * Math.PI),
          }}
        />
      )}
    </div>
  );
};

/* ───────────────────────── halo 3D (Three.js) detrás del presentador ───────────────────────── */
const HaloScene: React.FC = () => {
  const frame = useCurrentFrame();
  const a = frame * 0.012;
  const mat = (color: string, opacity: number) => <meshBasicMaterial color={color} transparent opacity={opacity} />;
  const dots = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 90;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      const r = 3.35 + ((i * 7919) % 13) / 60;
      pos[i * 3] = Math.cos(ang) * r;
      pos[i * 3 + 1] = Math.sin(ang) * r;
      pos[i * 3 + 2] = (((i * 104729) % 17) - 8) / 40;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <>
      <group rotation={[0.28, -0.18, 0]}>
        <group rotation={[0, 0, a]}>
          <mesh><torusGeometry args={[2.55, 0.009, 8, 200]} />{mat(BRAND.cyan, 0.55)}</mesh>
          <mesh rotation={[0, 0, 0.7]}><torusGeometry args={[2.9, 0.028, 8, 220, Math.PI * 1.15]} />{mat(BRAND.cyan, 0.85)}</mesh>
        </group>
        <group rotation={[0, 0, -a * 0.7]}>
          <mesh><torusGeometry args={[3.25, 0.007, 8, 220]} />{mat(BRAND.white, 0.3)}</mesh>
          <mesh rotation={[0, 0, 3.4]}><torusGeometry args={[3.25, 0.03, 8, 200, Math.PI * 0.45]} />{mat(BRAND.gold, 0.9)}</mesh>
        </group>
        <points geometry={dots} rotation={[0, 0, a * 0.4]}>
          <pointsMaterial color={BRAND.cyan} size={0.045} transparent opacity={0.8} sizeAttenuation />
        </points>
      </group>
    </>
  );
};

const Halo: React.FC<{box: {w: number; h: number}}> = ({box}) => (
  <ThreeCanvas width={box.w} height={box.h} camera={{fov: 38, position: [0, 0, 11]}} style={{opacity: 0.85}}>
    <HaloScene />
  </ThreeCanvas>
);

/* ───────────────────────── anillo de progreso HUD ───────────────────────── */
const Ring: React.FC<{box: {w: number; h: number}; from?: number; to?: number}> = ({box, from = 0, to = 1}) => {
  const p = useRange(from, to);
  const r = Math.min(box.w, box.h) / 2 - 14;
  const c = 2 * Math.PI * r;
  return (
    <svg width={box.w} height={box.h}>
      <circle cx={box.w / 2} cy={box.h / 2} r={r} fill="none" stroke={BRAND.cyan} strokeOpacity={0.2} strokeWidth={6} />
      <circle
        cx={box.w / 2}
        cy={box.h / 2}
        r={r}
        fill="none"
        stroke={BRAND.cyan}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        transform={`rotate(-90 ${box.w / 2} ${box.h / 2})`}
      />
    </svg>
  );
};

export const MedicalHUD: React.FC<{
  variant: 'frame' | 'halo' | 'ring';
  tag?: string;
  from?: number;
  to?: number;
  box: {w: number; h: number};
}> = ({variant, tag, box, from, to}) => {
  const {width, height} = useVideoConfig();
  void width;
  void height;
  if (variant === 'frame') return <HudFrame tag={tag} />;
  if (variant === 'halo') return <Halo box={box} />;
  return <Ring box={box} from={from} to={to} />;
};

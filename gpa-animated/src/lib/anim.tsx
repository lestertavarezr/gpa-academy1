import React, {createContext, useContext} from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Transition} from './timeline';

/** Frame absoluto del video = frame local de la <Sequence> + offset. */
export const AnimContext = createContext<{offset: number}>({offset: 0});
export const useAbsFrame = () => {
  const f = useCurrentFrame();
  const {offset} = useContext(AnimContext);
  return f + offset;
};
/** Segundos absolutos del video (para comparar con los tiempos de la narración). */
export const useAbsSeconds = () => {
  const {fps} = useVideoConfig();
  return useAbsFrame() / fps;
};

export const smooth = {damping: 200, stiffness: 120, mass: 0.8};
export const snappy = {damping: 16, stiffness: 140, mass: 0.7};

/** Progreso 0→1 con spring a partir de un instante absoluto (segundos). */
export const useSpringAt = (atSec: number, config = smooth, delaySec = 0) => {
  const {fps} = useVideoConfig();
  const frame = useAbsFrame();
  return spring({frame: frame - Math.round((atSec + delaySec) * fps), fps, config});
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Progreso lineal-suave entre dos instantes absolutos (segundos). */
export const useRange = (fromSec: number, toSec: number) => {
  const t = useAbsSeconds();
  return interpolate(t, [fromSec, toSec], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
};

/**
 * Entrada y salida de una capa: devuelve estilo con opacidad, desplazamiento, escala y
 * desenfoque (pseudo motion-blur) según la transición del timeline.
 */
export const useLayerTransition = (tr: Transition, durationFrames: number): React.CSSProperties => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inF = Math.max(1, Math.round(tr.in * fps));
  const outF = Math.max(1, Math.round(tr.out * fps));
  const pin = tr.in > 0 ? spring({frame, fps, config: smooth, durationInFrames: inF}) : 1;
  const pout =
    tr.out > 0
      ? interpolate(frame, [durationFrames - outF, durationFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.in(Easing.cubic),
        })
      : 0;
  const e = 1 - pin; // 1 al inicio
  const x = pout; // 1 al final
  const style = tr.style;
  let tx = 0;
  let ty = 0;
  let sc = 1;
  if (style === 'rise') {
    ty = e * 46 - x * 24;
  } else if (style === 'slide-left') {
    tx = -e * 90 - x * 50;
  } else if (style === 'slide-right') {
    tx = e * 90 + x * 50;
  } else if (style === 'scale') {
    sc = 0.9 + 0.1 * pin - x * 0.06;
    ty = e * 18;
  }
  const blur = (e * 14 + x * 8) * (style === 'none' ? 0 : 1);
  return {
    opacity: clamp01(pin) * (1 - x),
    transform: `translate(${tx}px, ${ty}px) scale(${sc})`,
    filter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined,
    willChange: 'transform, opacity, filter',
  };
};

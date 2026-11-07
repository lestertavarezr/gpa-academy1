import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useVideoConfig} from 'remotion';
import {AnimContext, useLayerTransition} from './lib/anim';
import {AnimationDef, VIDEOS} from './lib/timeline';
import {BRAND} from './lib/brand';
import {AnimatedKeywords} from './components/AnimatedKeywords';
import {MedicalHUD} from './components/MedicalHUD';
import {SurgicalInstruments} from './components/SurgicalInstruments';
import {AnatomyVisualization} from './components/AnatomyVisualization';
import {CourseInfoCard, CertificateCard} from './components/CourseInfoCard';
import {SimulationPreview} from './components/SimulationPreview';
import {CallToAction} from './components/CallToAction';
import {PresenterCard} from './components/PresenterCard';
import {BrandReveal} from './components/BrandReveal';
import {Captions} from './components/Captions';

/** Registro: nombre en animation-timeline.json → componente React. */
const REGISTRY: Record<string, React.ComponentType<any>> = {
  AnimatedKeywords,
  MedicalHUD,
  SurgicalInstruments,
  AnatomyVisualization,
  CourseInfoCard,
  CertificateCard,
  SimulationPreview,
  CallToAction,
  PresenterCard,
  BrandReveal,
  Captions,
};

const FONTS: [string, string, number][] = [
  ['GPA Montserrat', 'montserrat-latin-500-normal.woff2', 500],
  ['GPA Montserrat', 'montserrat-latin-600-normal.woff2', 600],
  ['GPA Montserrat', 'montserrat-latin-700-normal.woff2', 700],
  ['GPA Montserrat', 'montserrat-latin-800-normal.woff2', 800],
  ['GPA Inter', 'inter-latin-500-normal.woff2', 500],
  ['GPA Inter', 'inter-latin-600-normal.woff2', 600],
  ['GPA Inter', 'inter-latin-700-normal.woff2', 700],
];

const useFonts = () => {
  const [handle] = useState(() => delayRender('Cargando tipografías GPA'));
  useEffect(() => {
    Promise.all(
      FONTS.map(([family, file, weight]) =>
        new FontFace(family, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight: String(weight)}).load().then((f) => document.fonts.add(f)),
      ),
    )
      .catch((e) => console.warn('Fuente no cargada', e))
      .finally(() => continueRender(handle));
  }, [handle]);
};

const Layer: React.FC<{def: AnimationDef; durationFrames: number}> = ({def, durationFrames}) => {
  const style = useLayerTransition(def.transition, durationFrames);
  const C = REGISTRY[def.component];
  if (!C) return null;
  const {x, y, w, h} = def.position;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>
      <C {...def.props} box={{w, h}} startSec={def.start} />
    </div>
  );
};

const renderLayers = (defs: AnimationDef[], fps: number, videoId: string) =>
  defs.map((def) => {
    const from = Math.round(def.start * fps);
    const dur = Math.max(1, Math.round((def.end - def.start) * fps));
    return (
      <Sequence key={def.id} from={from} durationInFrames={dur} layout="none" name={`${def.component} · ${def.id}`}>
        <AnimContext.Provider value={{offset: from, videoId}}>
          <Layer def={def} durationFrames={dur} />
        </AnimContext.Provider>
      </Sequence>
    );
  });

export const GPAAcademy: React.FC<{videoId: string}> = ({videoId}) => {
  useFonts();
  const {fps} = useVideoConfig();
  const active = VIDEOS[videoId].timeline.animations.filter((a) => a.enabled && a.end > a.start);
  const behind = active.filter((a) => a.layer === 'behind');
  const front = active.filter((a) => a.layer === 'front');
  return (
    <AbsoluteFill style={{backgroundColor: BRAND.navyDeep}}>
      {/* 1 · Video original (audio intacto) */}
      <OffthreadVideo src={staticFile(`${videoId}/original.mp4`)} muted />
      <Audio src={staticFile(`${videoId}/audio.m4a`)} />
      {/* 2 · Tinte navy suave: da contraste a los hologramas del fondo */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 70% at 50% 18%, rgba(6,20,43,0) 35%, rgba(6,20,43,0.5) 100%), linear-gradient(180deg, rgba(6,20,43,0.38) 0%, rgba(6,20,43,0.08) 45%, rgba(6,20,43,0) 70%)',
        }}
      />
      {/* 3 · Capas detrás del presentador */}
      {renderLayers(behind, fps, videoId)}
      {/* 4 · Presentador recortado (WebM con alfa, sin audio) */}
      <OffthreadVideo src={staticFile(`${videoId}/person.webm`)} transparent muted />
      {/* 5 · Capas frente */}
      {renderLayers(front, fps, videoId)}
    </AbsoluteFill>
  );
};

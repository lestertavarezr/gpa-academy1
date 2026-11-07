import tl01 from '../../videos/01/animation-timeline.json';
import tr01 from '../../videos/01/transcript/transcript.json';
import tl02 from '../../videos/02/animation-timeline.json';
import tr02 from '../../videos/02/transcript/transcript.json';

export type Box = {x: number; y: number; w: number; h: number};
export type Transition = {in: number; out: number; style: string};
export type AnimationDef = {
  id: string;
  component: string;
  enabled: boolean;
  start: number; // segundos
  end: number; // segundos
  narration: string;
  trigger: string;
  layer: 'behind' | 'front';
  position: Box;
  transition: Transition;
  props: Record<string, any>;
  note?: string;
};
export type Timeline = {
  meta: {fps: number; width: number; height: number; durationInFrames: number};
  animations: AnimationDef[];
};
export type TranscriptWord = {i: number; text: string; start: number; end: number};
import tl03 from '../../videos/03/animation-timeline.json';
import tr03 from '../../videos/03/transcript/transcript.json';

/** Para añadir un video: crea videos/NN/, public/NN/ y regístralo aquí. */
export const VIDEOS: Record<string, {timeline: Timeline; words: TranscriptWord[]}> = {
  '01': {timeline: tl01 as unknown as Timeline, words: tr01.words as TranscriptWord[]},
  '03': {timeline: tl03 as unknown as Timeline, words: tr03.words as TranscriptWord[]},
  '02': {timeline: tl02 as unknown as Timeline, words: tr02.words as TranscriptWord[]},
};

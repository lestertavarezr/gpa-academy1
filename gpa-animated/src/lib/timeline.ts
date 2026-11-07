import raw from '../../animation-timeline.json';

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

export const timeline = raw as unknown as Timeline;

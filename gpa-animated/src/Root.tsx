import React from 'react';
import {Composition} from 'remotion';
import {GPAAcademy} from './Composition';
import {timeline} from './lib/timeline';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GPAAcademy"
    component={GPAAcademy}
    durationInFrames={timeline.meta.durationInFrames}
    fps={timeline.meta.fps}
    width={timeline.meta.width}
    height={timeline.meta.height}
  />
);

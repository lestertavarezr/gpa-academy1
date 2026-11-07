import React from 'react';
import {Composition} from 'remotion';
import {GPAAcademy} from './Composition';
import {VIDEOS} from './lib/timeline';

export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(VIDEOS).map(([id, v]) => (
      <Composition
        key={id}
        id={`Video${id}`}
        component={GPAAcademy}
        defaultProps={{videoId: id}}
        durationInFrames={v.timeline.meta.durationInFrames}
        fps={v.timeline.meta.fps}
        width={v.timeline.meta.width}
        height={v.timeline.meta.height}
      />
    ))}
  </>
);

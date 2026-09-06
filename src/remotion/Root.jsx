import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { GuiaVotacionVideo } from './GuiaVotacionVideo';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="GuiaVotacion"
        component={GuiaVotacionVideo}
        durationInFrames={1200}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

registerRoot(RemotionRoot);

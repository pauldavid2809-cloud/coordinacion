import React from 'react';
import { Series } from 'remotion';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2Access } from './scenes/Scene2Access';
import { Scene3Identity } from './scenes/Scene3Identity';
import { Scene4Vote } from './scenes/Scene4Vote';
import { Scene5TV } from './scenes/Scene5TV';
import { Scene6Outro } from './scenes/Scene6Outro';

export const GuiaVotacionVideo = () => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#040714',
        width: '100%',
        height: '100%',
      }}
    >
      <Series>
        {/* Scene 1: Portada y Bienvenida Solemne (5 seg / 150 frames) */}
        <Series.Sequence durationInFrames={150}>
          <Scene1Intro />
        </Series.Sequence>

        {/* Scene 2: Acceso Directo y Universal Móvil (7 seg / 210 frames) */}
        <Series.Sequence durationInFrames={210}>
          <Scene2Access />
        </Series.Sequence>

        {/* Scene 3: Identificación Rápida y Master Key (7 seg / 210 frames) */}
        <Series.Sequence durationInFrames={210}>
          <Scene3Identity />
        </Series.Sequence>

        {/* Scene 4: Votación Secreta e Individual (8 seg / 240 frames) */}
        <Series.Sequence durationInFrames={240}>
          <Scene4Vote />
        </Series.Sequence>

        {/* Scene 5: TV en Vivo y Distribución de Oficios (8 seg / 240 frames) */}
        <Series.Sequence durationInFrames={240}>
          <Scene5TV />
        </Series.Sequence>

        {/* Scene 6: Cierre Solemne y Cita Bíblica (5 seg / 150 frames) */}
        <Series.Sequence durationInFrames={150}>
          <Scene6Outro />
        </Series.Sequence>
      </Series>
    </div>
  );
};

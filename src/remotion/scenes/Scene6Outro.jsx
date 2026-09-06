import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene6Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const textScale = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const quoteEntrance = spring({
    frame: frame - 45,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // End fade to dark (last 20 frames)
  const fadeOut = interpolate(frame, [130, 150], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 40%, #0D1B3E 0%, #040714 85%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 50px',
        color: '#FFFFFF',
        fontFamily: 'sans-serif',
        position: 'relative',
        opacity: fadeOut,
      }}
    >
      {/* Seminary Crest with radiant glow */}
      <div
        style={{
          transform: `scale(${Math.max(0, logoScale)})`,
          marginBottom: '40px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(245, 158, 11, 0) 70%)',
            filter: 'blur(20px)',
            transform: `scale(${1 + Math.sin(frame * 0.08) * 0.08})`,
          }}
        />
        <Img
          src={staticFile('/logo.png')}
          alt="Escudo Oficial"
          style={{
            width: '190px',
            height: '190px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 2,
            filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.8))',
          }}
        />
      </div>

      {/* Main Title & Subtitle */}
      <div
        style={{
          transform: `scale(${Math.max(0, Math.min(1, textScale))})`,
          textAlign: 'center',
          marginBottom: '45px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontFamily: 'monospace',
            letterSpacing: '5px',
            color: '#F59E0B',
            textTransform: 'uppercase',
            fontWeight: 800,
            marginBottom: '15px',
          }}
        >
          Seminario Santa Rosa de Lima
        </div>

        <h1
          style={{
            fontSize: '52px',
            fontFamily: 'serif',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 16px 0',
            lineHeight: 1.25,
            maxWidth: '900px',
          }}
        >
          Por el Bien Común y la Fraternidad Sacerdotal
        </h1>

        <p
          style={{
            fontSize: '24px',
            color: '#94A3B8',
            margin: 0,
            letterSpacing: '1px',
          }}
        >
          Arquidiócesis de Caracas • Periodo Pastoral 2026 - 2027
        </p>
      </div>

      {/* Scripture quote */}
      <div
        style={{
          transform: `scale(${Math.max(0, Math.min(1, quoteEntrance))})`,
          opacity: quoteEntrance > 0 ? 1 : 0,
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '24px',
          padding: '28px 45px',
          maxWidth: '860px',
          textAlign: 'center',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <p
          style={{
            fontSize: '26px',
            fontFamily: 'serif',
            fontStyle: 'italic',
            color: '#F1F5F9',
            margin: '0 0 12px 0',
            lineHeight: 1.5,
          }}
        >
          «El que quiera ser el primero entre ustedes, que sea el servidor de todos.»
        </p>
        <span
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#F59E0B',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          San Marcos 9, 35
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene1Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const logoGlow = interpolate(
    Math.sin(frame / 10),
    [-1, 1],
    [20, 45]
  );

  const titleOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [20, 45], [40, 0], { extrapolateRight: 'clamp' });

  const badgeScale = spring({
    frame: frame - 45,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const subtitleOpacity = interpolate(frame, [60, 85], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 35%, #0B1739 0%, #040714 80%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 60px',
        color: '#FFFFFF',
        fontFamily: 'serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Golden spotlight effect */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Diocese Tag */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '28px',
          fontWeight: 'bold',
          letterSpacing: '6px',
          color: '#FBBF24',
          textTransform: 'uppercase',
          marginBottom: '40px',
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        Arquidiócesis de Maracaibo
      </div>

      {/* Official Crest */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: '50px',
          position: 'relative',
        }}
      >
        <Img
          src={staticFile('logo.png')}
          alt="Escudo Oficial"
          style={{
            width: '260px',
            height: '260px',
            objectFit: 'contain',
            filter: `drop-shadow(0 0 ${logoGlow}px rgba(251, 191, 36, 0.6))`,
          }}
        />
      </div>

      {/* Main Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
          maxWidth: '900px',
        }}
      >
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 900,
            lineHeight: 1.15,
            margin: '0 0 20px 0',
            color: '#FFFFFF',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          Seminario Mayor<br />
          <span style={{ color: '#FEF08A' }}>Santo Tomás de Aquino</span>
        </h1>

        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '32px',
            fontWeight: 700,
            color: '#93C5FD',
            letterSpacing: '3px',
            marginBottom: '35px',
          }}
        >
          CURSO FORMATIVO 2026–2027
        </div>
      </div>

      {/* Guide Badge */}
      <div
        style={{
          transform: `scale(${Math.max(0, badgeScale)})`,
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(180, 83, 9, 0.4) 100%)',
          border: '3px solid #F59E0B',
          borderRadius: '50px',
          padding: '20px 50px',
          boxShadow: '0 0 40px rgba(245, 158, 11, 0.35)',
          marginBottom: '35px',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '34px',
            fontWeight: 900,
            color: '#FEF08A',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          🗳️ Guía Oficial de Votación
        </span>
      </div>

      {/* Subtitle */}
      <p
        style={{
          opacity: subtitleOpacity,
          fontSize: '30px',
          color: '#CBD5E1',
          textAlign: 'center',
          maxWidth: '820px',
          lineHeight: 1.4,
          margin: 0,
          fontFamily: 'sans-serif',
        }}
      >
        Aprende en 40 segundos cómo participar en la <strong style={{ color: '#FFFFFF' }}>Elección del Coordinador General</strong> desde tu celular.
      </p>
    </div>
  );
};

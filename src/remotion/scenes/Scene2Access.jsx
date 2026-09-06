import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene2Access = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const phoneEntrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 90 },
  });

  const stepBadgeScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  // URL typing simulation
  const fullUrl = 'seminario.org/votar';
  const charsShown = Math.min(
    fullUrl.length,
    Math.floor(interpolate(frame, [25, 75], [0, fullUrl.length], { extrapolateRight: 'clamp' }))
  );
  const typedUrl = fullUrl.slice(0, charsShown);

  // Screen content reveal
  const screenContentOpacity = interpolate(frame, [80, 110], [0, 1], { extrapolateRight: 'clamp' });
  const screenContentY = interpolate(frame, [80, 110], [30, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 25%, #0B1739 0%, #040714 80%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '90px 50px',
        color: '#FFFFFF',
        fontFamily: 'sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Step Badge */}
      <div
        style={{
          transform: `scale(${Math.max(0, stepBadgeScale)})`,
          background: '#F59E0B',
          color: '#040714',
          fontFamily: 'monospace',
          fontSize: '26px',
          fontWeight: 900,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          padding: '12px 32px',
          borderRadius: '50px',
          marginBottom: '25px',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)',
        }}
      >
        Paso 1
      </div>

      {/* Main Instruction */}
      <h2
        style={{
          fontSize: '52px',
          fontFamily: 'serif',
          fontWeight: 900,
          color: '#FFFFFF',
          textAlign: 'center',
          margin: '0 0 15px 0',
          lineHeight: 1.2,
        }}
      >
        Ingresa desde tu Celular
      </h2>

      <p
        style={{
          fontSize: '28px',
          color: '#94A3B8',
          textAlign: 'center',
          maxWidth: '780px',
          margin: '0 0 50px 0',
          lineHeight: 1.4,
        }}
      >
        Abre el navegador en cualquier teléfono inteligente conectado a la red.
      </p>

      {/* Phone Mockup Frame */}
      <div
        style={{
          width: '580px',
          height: '1080px',
          background: '#050817',
          border: '12px solid #1E293B',
          borderRadius: '56px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 40px rgba(56, 189, 248, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          transform: `translateY(${(1 - phoneEntrance) * 150}px)`,
          opacity: phoneEntrance,
        }}
      >
        {/* Phone Notch */}
        <div
          style={{
            width: '180px',
            height: '26px',
            background: '#1E293B',
            borderRadius: '0 0 16px 16px',
            alignSelf: 'center',
            zIndex: 10,
          }}
        />

        {/* Browser Address Bar */}
        <div
          style={{
            margin: '20px 24px 15px 24px',
            padding: '14px 20px',
            background: '#0E172F',
            border: '2px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '20px' }}>🔒</span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '26px',
              fontWeight: 'bold',
              color: '#38BDF8',
            }}
          >
            {typedUrl}
            {frame % 16 < 8 && <span style={{ color: '#FBBF24' }}>|</span>}
          </span>
        </div>

        {/* Inside Portal Screen */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: screenContentOpacity,
            transform: `translateY(${screenContentY}px)`,
          }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: '90px', height: '90px', objectFit: 'contain', marginBottom: '16px' }}
          />

          <div
            style={{
              fontFamily: 'serif',
              fontSize: '28px',
              fontWeight: 900,
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            Elección de Coordinador General
          </div>

          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              color: '#FEF08A',
              fontSize: '18px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              padding: '8px 18px',
              borderRadius: '20px',
              marginBottom: '30px',
            }}
          >
            Primera Vuelta Electoral
          </div>

          {/* Feature Highlights */}
          <div
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginTop: 'auto',
              marginBottom: '30px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '22px', color: '#E2E8F0' }}>
              <span style={{ fontSize: '24px' }}>⚡</span>
              <span>Sin descargar ninguna aplicación</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '22px', color: '#E2E8F0' }}>
              <span style={{ fontSize: '24px' }}>📱</span>
              <span>Funciona en Chrome, Safari y más</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '22px', color: '#E2E8F0' }}>
              <span style={{ fontSize: '24px' }}>🔐</span>
              <span>Sufragio totalmente confidencial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

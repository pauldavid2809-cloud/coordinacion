import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene3Identity = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stepBadgeScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  // Search input typing animation
  const queryText = 'higuera';
  const queryChars = Math.min(
    queryText.length,
    Math.floor(interpolate(frame, [20, 60], [0, queryText.length], { extrapolateRight: 'clamp' }))
  );
  const typedQuery = queryText.slice(0, queryChars);

  // Result card pop
  const cardScale = spring({
    frame: frame - 65,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Cedula typing animation
  const cedulaText = '30892603';
  const cedulaChars = Math.min(
    cedulaText.length,
    Math.floor(interpolate(frame, [90, 130], [0, cedulaText.length], { extrapolateRight: 'clamp' }))
  );
  const typedCedula = cedulaText.slice(0, cedulaChars);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 25%, #0B1739 0%, #040714 80%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '70px 50px',
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
        Paso 2
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
        Busca tu Nombre y Valida
      </h2>

      <p
        style={{
          fontSize: '28px',
          color: '#94A3B8',
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 0 45px 0',
          lineHeight: 1.4,
        }}
      >
        El buscador no es sensible a los acentos. Puedes escribir rápido sin tildes.
      </p>

      {/* Search & Identification Container Card */}
      <div
        style={{
          width: '880px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '2px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '36px',
          padding: '40px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '26px',
          marginBottom: '35px',
        }}
      >
        {/* Search Input Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '20px', fontFamily: 'monospace', color: '#94A3B8', textTransform: 'uppercase' }}>
            1. Escribe tu nombre o apellido:
          </span>
          <div
            style={{
              padding: '18px 24px',
              background: '#040714',
              border: '2px solid #F59E0B',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.25)',
            }}
          >
            <span style={{ fontSize: '26px' }}>🔍</span>
            <span style={{ fontFamily: 'monospace', fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF' }}>
              {typedQuery}
              {frame < 65 && frame % 14 < 7 && <span style={{ color: '#FBBF24' }}>|</span>}
            </span>
          </div>
        </div>

        {/* Search Result Card Highlight */}
        {frame >= 65 && (
          <div
            style={{
              transform: `scale(${Math.max(0, cardScale)})`,
              padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: '2px solid #10B981',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontFamily: 'serif', fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF', display: 'block' }}>
                Juan Higuera
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '20px', color: '#34D399' }}>
                1° de Teología • V-30.892.603
              </span>
            </div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#10B981',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 'bold',
              }}
            >
              ✓
            </div>
          </div>
        )}

        {/* Cedula Input Simulation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '20px', fontFamily: 'monospace', color: '#94A3B8', textTransform: 'uppercase' }}>
            2. Ingresa tu número de Cédula:
          </span>
          <div
            style={{
              padding: '18px 24px',
              background: '#040714',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span style={{ fontSize: '26px' }}>🪪</span>
            <span style={{ fontFamily: 'monospace', fontSize: '32px', fontWeight: 'bold', color: '#38BDF8' }}>
              {typedCedula}
              {frame >= 90 && frame < 130 && frame % 14 < 7 && <span style={{ color: '#FBBF24' }}>|</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Security & Authentication Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '14px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1.5px solid rgba(56, 189, 248, 0.3)',
          padding: '16px 36px',
          borderRadius: '50px',
          fontSize: '22px',
          color: '#BAE6FD',
          boxShadow: '0 0 25px rgba(56, 189, 248, 0.15)',
        }}
      >
        <span style={{ fontSize: '24px' }}>🔒</span>
        <span style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>
          Autenticación directa con el Padrón Oficial de Seminaristas
        </span>
      </div>
    </div>
  );
};

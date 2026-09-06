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

  // Master key callout entrance
  const masterKeyEntrance = spring({
    frame: frame - 95,
    fps,
    config: { damping: 13, stiffness: 100 },
  });

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

      {/* Master Secret Key Banner (Crucial User Requirement) */}
      <div
        style={{
          width: '880px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(180, 83, 9, 0.3) 100%)',
          border: '2.5px solid #FBBF24',
          borderRadius: '28px',
          padding: '24px 30px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 0 45px rgba(245, 158, 11, 0.3)',
          transform: `scale(${Math.max(0, Math.min(1, masterKeyEntrance))})`,
          opacity: Math.max(0, Math.min(1, masterKeyEntrance)),
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'rgba(251, 191, 36, 0.2)',
            border: '2px solid #FBBF24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            flexShrink: 0,
          }}
        >
          🔐
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 900, color: '#FBBF24', textTransform: 'uppercase' }}>
              Clave Maestra Secreta de Respaldo:
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '28px',
                fontWeight: 900,
                color: '#FFFFFF',
                background: '#B45309',
                padding: '4px 14px',
                borderRadius: '12px',
                border: '1.5px solid #FDE68A',
                letterSpacing: '2px',
              }}
            >
              28092002
            </span>
          </div>
          <p style={{ fontSize: '20px', color: '#E2E8F0', margin: 0, lineHeight: 1.35 }}>
            Si el sistema presenta alguna discrepancia con tu cédula, ingresa este código maestro para habilitar tu voto de inmediato.
          </p>
        </div>
      </div>
    </div>
  );
};

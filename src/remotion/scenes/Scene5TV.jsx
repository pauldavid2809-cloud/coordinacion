import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene5TV = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance
  const badgeScale = spring({ frame, fps, config: { damping: 12, stiffness: 110 } });
  const tvScale = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 115 } });

  // Telemetry gauge counter: from 12 to 38 votes
  const votesCount = Math.min(
    38,
    Math.floor(interpolate(frame, [10, 60], [12, 38], { extrapolateRight: 'clamp' }))
  );
  const progressPercent = Math.round((votesCount / 38) * 100);

  // Winner card pop-in around frame 65
  const winnerScale = spring({
    frame: frame - 65,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  // Coordinaciones grid entrance around frame 90
  const coordinationsScale = spring({
    frame: frame - 90,
    fps,
    config: { damping: 14, stiffness: 110 },
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
      {/* Badge */}
      <div
        style={{
          transform: `scale(${Math.max(0, badgeScale)})`,
          background: '#38BDF8',
          color: '#040714',
          fontFamily: 'monospace',
          fontSize: '24px',
          fontWeight: 900,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          padding: '12px 30px',
          borderRadius: '50px',
          marginBottom: '20px',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)',
        }}
      >
        En Pantalla Grande (TV)
      </div>

      {/* Main Title */}
      <h2
        style={{
          fontSize: '48px',
          fontFamily: 'serif',
          fontWeight: 900,
          color: '#FFFFFF',
          textAlign: 'center',
          margin: '0 0 10px 0',
          lineHeight: 1.2,
        }}
      >
        Escrutinio y Distribución
      </h2>

      <p
        style={{
          fontSize: '24px',
          color: '#94A3B8',
          textAlign: 'center',
          maxWidth: '840px',
          margin: '0 0 30px 0',
        }}
      >
        Transparencia absoluta en vivo para toda la comunidad del Seminario.
      </p>

      {/* Live Telemetry Card (Mockup of Big Screen / TV) */}
      <div
        style={{
          width: '920px',
          transform: `scale(${Math.max(0, Math.min(1, tvScale))})`,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)',
          border: '2px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '26px',
          padding: '30px 35px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          marginBottom: '28px',
          position: 'relative',
        }}
      >
        {/* TV Header with Live indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#EF4444',
                boxShadow: '0 0 12px #EF4444',
              }}
            />
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#CBD5E1', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Transmisión en Directo • Salón Principal
            </span>
          </div>

          <div
            style={{
              fontSize: '18px',
              fontFamily: 'monospace',
              color: '#38BDF8',
              background: 'rgba(56, 189, 248, 0.12)',
              padding: '6px 16px',
              borderRadius: '20px',
            }}
          >
            Quórum: 38 Seminaristas
          </div>
        </div>

        {/* Telemetry Progress Bar & Numbers */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <span style={{ fontSize: '24px', color: '#94A3B8' }}>Votos Escrutados:</span>
            <span style={{ fontSize: '38px', fontWeight: 900, color: '#38BDF8', fontFamily: 'monospace' }}>
              {votesCount} / 38 <span style={{ fontSize: '26px', color: '#64748B' }}>({progressPercent}%)</span>
            </span>
          </div>

          {/* Bar track */}
          <div
            style={{
              width: '100%',
              height: '18px',
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '10px',
              overflow: 'hidden',
              padding: '3px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0284C7 0%, #38BDF8 50%, #F59E0B 100%)',
                borderRadius: '8px',
                boxShadow: '0 0 18px rgba(56, 189, 248, 0.6)',
              }}
            />
          </div>
        </div>

        {/* Winner Proclamation (revealed after votes finish) */}
        {frame >= 65 && (
          <div
            style={{
              transform: `scale(${Math.max(0, Math.min(1, winnerScale))})`,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)',
              border: '2px solid #F59E0B',
              borderRadius: '18px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 0 35px rgba(245, 158, 11, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '42px' }}>👑</div>
              <div>
                <div style={{ fontSize: '18px', color: '#FDE68A', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                  Proclamación Oficial
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF' }}>
                  Coordinador General Electo
                </div>
              </div>
            </div>
            <div
              style={{
                background: '#F59E0B',
                color: '#040714',
                padding: '10px 22px',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 900,
              }}
            >
              ¡Electo!
            </div>
          </div>
        )}
      </div>

      {/* Coordinaciones & Oficios distribution cards */}
      <div
        style={{
          width: '920px',
          transform: `scale(${Math.max(0, Math.min(1, coordinationsScale))})`,
          opacity: coordinationsScale > 0 ? 1 : 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📋</span>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#F1F5F9' }}>
              Distribución de Oficios del Seminario
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '17px',
              color: '#FCA5A5',
              fontWeight: 700,
            }}
          >
            <span>📄</span>
            <span>Exportable a PDF</span>
          </div>
        </div>

        {/* Grid of the 4 coordinaciones */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Liturgia */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '16px',
              padding: '16px 18px',
              border: '1px solid rgba(148, 163, 184, 0.25)',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#38BDF8', marginBottom: '6px' }}>
              ✝️ Liturgia
            </div>
            <div style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.3 }}>
              Capilla Teología, Capilla Filosofía, Sacristán Mayor, Sacristán Menor, Depósito y Mantelería.
            </div>
          </div>

          {/* Cultura */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '16px',
              padding: '16px 18px',
              border: '1px solid rgba(148, 163, 184, 0.25)',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#A855F7', marginBottom: '6px' }}>
              🎨 Cultura
            </div>
            <div style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.3 }}>
              Biblioteca, Redes Sociales, Deporte, Acto Cívico, Películas, Juegos y Recreación.
            </div>
          </div>

          {/* Servicios Generales */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '16px',
              padding: '16px 18px',
              border: '1px solid rgba(148, 163, 184, 0.25)',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981', marginBottom: '6px' }}>
              🧹 Servicios Generales
            </div>
            <div style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.3 }}>
              Limpieza, Lavandería, Jardinería, Mantenimiento, Hospedería y Campana.
            </div>
          </div>

          {/* Cocina */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '16px',
              padding: '16px 18px',
              border: '1px solid rgba(148, 163, 184, 0.25)',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#F59E0B', marginBottom: '6px' }}>
              🍳 Cocina
            </div>
            <div style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.3 }}>
              Dispensa, Meriendas, Subcoordinador y Sala de Padres.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

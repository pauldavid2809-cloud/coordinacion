import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene4Vote = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for badge & header
  const stepBadgeScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  // Candidate cards stagger
  const card1Scale = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 120 } });
  const card2Scale = spring({ frame: frame - 25, fps, config: { damping: 14, stiffness: 120 } });
  const card3Scale = spring({ frame: frame - 35, fps, config: { damping: 14, stiffness: 120 } });

  // Tap animation on Candidate 2 around frame 70
  const tapScale = spring({
    frame: frame - 70,
    fps,
    config: { damping: 10, stiffness: 160 },
  });

  // Modal appears at frame 95
  const modalScale = spring({
    frame: frame - 95,
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  // Success seal appears at frame 155
  const successScale = spring({
    frame: frame - 155,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  // Bottom rules banner entrance at frame 45
  const rulesEntrance = spring({
    frame: frame - 45,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const isCard2Selected = frame >= 75;
  const isModalConfirmed = frame >= 150;

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
          marginBottom: '20px',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)',
        }}
      >
        Paso 3
      </div>

      {/* Main Instruction */}
      <h2
        style={{
          fontSize: '50px',
          fontFamily: 'serif',
          fontWeight: 900,
          color: '#FFFFFF',
          textAlign: 'center',
          margin: '0 0 12px 0',
          lineHeight: 1.2,
        }}
      >
        Voto Secreto e Individual
      </h2>

      <p
        style={{
          fontSize: '26px',
          color: '#94A3B8',
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 0 35px 0',
          lineHeight: 1.4,
        }}
      >
        Selecciona a tu candidato y confirma tu elección. El voto es 100% anónimo y encriptado.
      </p>

      {/* Candidate List Container */}
      <div
        style={{
          width: '880px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          position: 'relative',
          marginBottom: '35px',
        }}
      >
        {/* Candidate 1 */}
        <div
          style={{
            transform: `scale(${Math.max(0, Math.min(1, card1Scale))})`,
            opacity: card1Scale > 0 ? 1 : 0,
            background: 'rgba(30, 41, 59, 0.65)',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '20px',
            padding: '22px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(148, 163, 184, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800,
                color: '#94A3B8',
              }}
            >
              1
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#F1F5F9' }}>
                Pedro A. Pérez
              </div>
              <div style={{ fontSize: '20px', color: '#94A3B8' }}>Teología III • Diócesis Central</div>
            </div>
          </div>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #64748B',
            }}
          />
        </div>

        {/* Candidate 2 (Target) */}
        <div
          style={{
            transform: `scale(${Math.max(0, Math.min(1.02, isCard2Selected ? 1.02 : card2Scale))})`,
            opacity: card2Scale > 0 ? 1 : 0,
            background: isCard2Selected
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(30, 41, 59, 0.95) 100%)'
              : 'rgba(30, 41, 59, 0.65)',
            border: isCard2Selected ? '3px solid #F59E0B' : '2px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '20px',
            padding: '22px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: isCard2Selected ? '0 0 35px rgba(245, 158, 11, 0.35)' : 'none',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: isCard2Selected ? '#F59E0B' : 'rgba(148, 163, 184, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800,
                color: isCard2Selected ? '#040714' : '#94A3B8',
              }}
            >
              2
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>
                Juan David Higuera
              </div>
              <div style={{ fontSize: '20px', color: isCard2Selected ? '#FDE68A' : '#94A3B8' }}>
                Filosofía II • Arquidiócesis de Barquisimeto
              </div>
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: isCard2Selected ? 'none' : '2px solid #64748B',
              background: isCard2Selected ? '#F59E0B' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isCard2Selected && (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#040714" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          {/* Finger Tap Indicator */}
          {frame >= 68 && frame < 95 && (
            <div
              style={{
                position: 'absolute',
                right: '40px',
                bottom: '-25px',
                transform: `scale(${Math.max(0.8, tapScale)}) translateY(${Math.sin(frame * 0.4) * 6}px)`,
                background: 'rgba(245, 158, 11, 0.95)',
                color: '#040714',
                padding: '10px 18px',
                borderRadius: '30px',
                fontSize: '20px',
                fontWeight: 900,
                boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 10,
              }}
            >
              <span>👆 Tocar para elegir</span>
            </div>
          )}
        </div>

        {/* Candidate 3 */}
        <div
          style={{
            transform: `scale(${Math.max(0, Math.min(1, card3Scale))})`,
            opacity: card3Scale > 0 ? 1 : 0,
            background: 'rgba(30, 41, 59, 0.65)',
            border: '2px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '20px',
            padding: '22px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(148, 163, 184, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800,
                color: '#94A3B8',
              }}
            >
              3
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#F1F5F9' }}>
                Carlos M. Rodríguez
              </div>
              <div style={{ fontSize: '20px', color: '#94A3B8' }}>Teología I • Diócesis de Carora</div>
            </div>
          </div>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #64748B',
            }}
          />
        </div>

        {/* Modal Overlay / Confirmation Pop-in */}
        {frame >= 95 && (
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              right: '-20px',
              bottom: '-20px',
              background: 'rgba(4, 7, 20, 0.88)',
              backdropFilter: 'blur(10px)',
              borderRadius: '28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px',
              zIndex: 30,
              transform: `scale(${Math.max(0, Math.min(1, modalScale))})`,
              border: '2px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          >
            {!isModalConfirmed ? (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '2px solid #F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    fontSize: '32px',
                  }}
                >
                  🗳️
                </div>
                <h3 style={{ fontSize: '34px', margin: '0 0 10px 0', color: '#FFFFFF', fontFamily: 'serif' }}>
                  ¿Confirmar tu Voto?
                </h3>
                <p style={{ fontSize: '24px', color: '#CBD5E1', margin: '0 0 24px 0', lineHeight: 1.4 }}>
                  Estás a punto de emitir tu voto por:
                  <br />
                  <strong style={{ color: '#F59E0B', fontSize: '28px' }}>Juan David Higuera</strong>
                </p>

                <div style={{ display: 'flex', gap: '18px', justifyContent: 'center' }}>
                  <div
                    style={{
                      padding: '16px 36px',
                      borderRadius: '14px',
                      background: '#10B981',
                      color: '#040714',
                      fontSize: '24px',
                      fontWeight: 900,
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span>Confirmar y Sellar</span>
                    <span>✓</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Success Seal */
              <div
                style={{
                  textAlign: 'center',
                  transform: `scale(${Math.max(0, Math.min(1, successScale))})`,
                }}
              >
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 45px rgba(16, 185, 129, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px auto',
                  }}
                >
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '38px', margin: '0 0 10px 0', color: '#10B981', fontWeight: 900 }}>
                  ¡Voto Sellado y Computado!
                </h3>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '8px 24px',
                    borderRadius: '30px',
                    fontSize: '22px',
                    color: '#6EE7B7',
                  }}
                >
                  <span>🔒 Voto secreto e inviolable</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rules Banner (1st Round 75% vs 2nd Round 50%+1) */}
      <div
        style={{
          width: '880px',
          transform: `scale(${Math.max(0, Math.min(1, rulesEntrance))})`,
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '22px',
          padding: '24px 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '26px' }}>⚖️</span>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#F59E0B', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Reglas de la Elección
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '16px 20px',
              borderRadius: '16px',
              borderLeft: '4px solid #F59E0B',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              1ª Vuelta: 75%
            </div>
            <div style={{ fontSize: '18px', color: '#94A3B8', lineHeight: 1.3 }}>
              Requiere 29 de 38 votos para consagración directa.
            </div>
          </div>

          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '16px 20px',
              borderRadius: '16px',
              borderLeft: '4px solid #38BDF8',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              2ª Vuelta: Mayoría Simple
            </div>
            <div style={{ fontSize: '18px', color: '#94A3B8', lineHeight: 1.3 }}>
              Balotaje directo entre los 2 candidatos más votados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

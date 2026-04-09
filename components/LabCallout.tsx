'use client'

import { Atom } from 'lucide-react'

interface LabCalloutProps {
  /** Cor accent (vem do setor) */
  color: string
  /** Estado da aula */
  state: 'loading' | 'ready' | 'unavailable'
  /** Counter em segundos quando loading */
  elapsed?: number
  /** Click no callout — scroll suave pro lab no fim do modal */
  onClick?: () => void
}

/**
 * LabCallout — banner cyan grande antes do conteúdo da aula.
 *
 * Estados:
 *   - loading: "Estamos quase la, fique de olho..." com Atom girando
 *   - ready: "Laboratorio pronto. Click pra mexer." com Atom pulsando
 *   - unavailable: card discreto "Sem laboratorio nesta NR"
 *
 * Visual canonico do iconsaiStats: rounded card, border accent, glow,
 * Atom com atomSpin animation, gradient text shimmer.
 */
export default function LabCallout({ color, state, elapsed = 0, onClick }: LabCalloutProps) {
  if (state === 'unavailable') {
    return (
      <div style={{
        background: '#0c1320',
        border: '1px dashed rgba(100,116,139,0.3)',
        borderRadius: 14,
        padding: '14px 20px',
        marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(100,116,139,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Atom size={18} color="#64748b" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            Laboratorio
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
            Esta NR ainda nao tem simulacao interativa. Em breve.
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        background: `linear-gradient(135deg, ${color}1A 0%, ${color}08 100%)`,
        border: `1.5px solid ${color}`,
        borderRadius: 14,
        padding: '18px 22px',
        marginBottom: 24,
        cursor: state === 'ready' ? 'pointer' : 'default',
        fontFamily: 'inherit',
        position: 'relative', overflow: 'hidden',
        boxShadow: state === 'ready'
          ? `0 0 40px ${color}33, inset 0 0 20px ${color}11`
          : `0 0 24px ${color}22, inset 0 0 14px ${color}08`,
        animation: state === 'ready' ? 'lab-pulse 2.2s ease-in-out infinite' : undefined,
      }}
    >
      {/* Glow background */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at top right, ${color}22 0%, transparent 60%)`,
      }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Avatar Atom */}
        <div style={{
          flexShrink: 0,
          width: 48, height: 48, borderRadius: 14,
          background: `${color}1A`,
          border: `1.5px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 20px ${color}55`,
        }}>
          <Atom
            size={26}
            color={color}
            style={{
              animation: state === 'loading'
                ? 'atomSpin 4s linear infinite'
                : 'atomSpin 6s linear infinite, lab-glow 2s ease-in-out infinite',
              transformOrigin: 'center',
              transformBox: 'fill-box',
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </div>

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em',
            background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899, #22d3ee)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 3s linear infinite',
            marginBottom: 4,
          }}>
            Laboratorio interativo
          </div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3,
          }}>
            {state === 'loading'
              ? 'Estamos quase la, fique de olho...'
              : 'Laboratorio pronto. Mexe nos parametros.'}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
            {state === 'loading'
              ? `ai.tutor montando ha ${elapsed}s`
              : 'Click pra abrir e brincar com a curva.'}
          </div>
        </div>

        {state === 'ready' && (
          <div style={{
            flexShrink: 0,
            padding: '8px 16px', borderRadius: 9999,
            background: color, color: '#050d1a',
            fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8,
          }}>
            Abrir →
          </div>
        )}
      </div>

      <style>{`
        @keyframes atomSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes lab-pulse {
          0%, 100% { box-shadow: 0 0 40px ${color}33, inset 0 0 20px ${color}11; }
          50% { box-shadow: 0 0 60px ${color}66, inset 0 0 28px ${color}22; }
        }
        @keyframes lab-glow {
          0%, 100% { filter: drop-shadow(0 0 6px ${color}); }
          50% { filter: drop-shadow(0 0 14px ${color}) drop-shadow(0 0 4px ${color}); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </button>
  )
}

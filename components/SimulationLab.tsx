'use client'

import { FlaskConical } from 'lucide-react'
import { getSimulation } from '@/lib/nr-simulations'
import AiTutorAgent from './AiTutorAgent'

interface SimulationLabProps {
  nrId: number
  nrCode: string
  nrTitle: string
  accentColor: string
}

/**
 * SimulationLab — wrapper do laboratorio interativo de uma NR.
 *
 * Estrutura visual:
 *   [Header lab — atom + titulo + tagline]
 *   [Sim component (full width)]
 *   [ai.tutor agent (1a pessoa, com TTS)]
 *
 * Se a NR ainda nao tem simulacao no registro, mostra placeholder
 * "em desenvolvimento" honesto.
 */
export default function SimulationLab({ nrId, nrCode, nrTitle, accentColor }: SimulationLabProps) {
  const sim = getSimulation(nrId)

  if (!sim) {
    return (
      <div style={{
        background: '#0c1320',
        border: `1px dashed ${accentColor}55`,
        borderRadius: 14, padding: 32,
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, marginInline: 'auto', marginBottom: 16,
          borderRadius: 14,
          background: `${accentColor}11`,
          border: `1px solid ${accentColor}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FlaskConical size={26} color={accentColor} />
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: accentColor,
          textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8,
        }}>
          Laboratorio em desenvolvimento
        </div>
        <h3 style={{ fontSize: 18, color: '#e2e8f0', fontWeight: 700, marginBottom: 8 }}>
          Simulacao para {nrCode} ainda nao chegou
        </h3>
        <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
          Ainda nao temos uma simulacao interativa pra esta norma. Estamos comecando pelas mais
          criticas (a primeira vai ser a NR-6 EPI: voce vai ver o que muda quando o trabalhador
          coloca ou tira o equipamento).
        </p>
      </div>
    )
  }

  // NR tem simulacao registrada
  const SimComponent = sim.Component
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header do lab */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '16px 18px', borderRadius: 14,
        background: `linear-gradient(135deg, ${accentColor}11, transparent)`,
        border: `1px solid ${accentColor}55`,
      }}>
        <div style={{
          flexShrink: 0,
          width: 44, height: 44, borderRadius: 12,
          background: `${accentColor}22`,
          border: `1.5px solid ${accentColor}88`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 16px ${accentColor}44`,
        }}>
          <FlaskConical size={22} color={accentColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em',
            color: accentColor, marginBottom: 4,
          }}>
            Laboratorio interativo
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
            {sim.title}
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
            {sim.subtitle}
          </p>
        </div>
      </div>

      {/* Simulacao */}
      <SimComponent accentColor={accentColor} />
    </div>
  )
}

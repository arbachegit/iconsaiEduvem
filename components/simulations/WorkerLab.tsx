'use client'

import { useState } from 'react'
import { Bot, AlertTriangle, ShieldCheck, Heart, Clock } from 'lucide-react'
import PlayButton from '../education/PlayButton'
import WorkerSVG, { type WorkerProps } from './WorkerSVG'

/* ═══════════════════════════════════════════════════════════
   WorkerLab — template generico pra laboratorios com trabalhador.

   Recebe uma config com 4 niveis (0..3). Cada nivel descreve:
   - Estado do worker (EPIs, riscos, mood)
   - Stats (grau de risco, risco fatal, conformidade, multa, expectativa de vida)
   - Fala do ai.tutor (headline, detail, warning, suggestion)

   A mesma UI (slider + SVG + stats + ai.tutor) serve pra todas
   as NRs que tem 'trabalhador em risco'.
   ═══════════════════════════════════════════════════════════ */

export type RiskGrade = 'Baixo' | 'Médio' | 'Alto' | 'Crítico'

export interface LabLevel {
  label: string
  worker: Partial<WorkerProps>
  stats: {
    riskGrade?: RiskGrade
    fatalRisk?: number           // 0-100 %
    compliance?: number          // 0-100 %
    fineEstimate?: number        // R$
    lifeExpectancy?: number      // anos (impacto esperado na expectativa de vida)
  }
  tutor: {
    headline: string
    detail: string
    warning?: string
    suggestion?: string
  }
}

export interface WorkerLabConfig {
  sliderLabel: string           // ex: "Nivel de EPI", "Altura de trabalho", etc
  sliderTicks: string[]         // ex: ["Nenhum","Capacete","+Luvas","Completo"]
  defaultBackground?: WorkerProps['backgroundHint']
  levels: [LabLevel, LabLevel, LabLevel, LabLevel]   // exatamente 4 niveis
}

const ACCENT = '#22d3ee'

const RISK_COLOR: Record<RiskGrade, string> = {
  'Baixo':    '#4ade80',
  'Médio':    '#fbbf24',
  'Alto':     '#f97316',
  'Crítico':  '#ef4444',
}

export default function WorkerLab({ config }: { config: WorkerLabConfig }) {
  const [level, setLevel] = useState<0 | 1 | 2 | 3>(0)
  const data = config.levels[level]
  const { stats, tutor, worker } = data

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    const v = parseInt((e.target as HTMLInputElement).value, 10)
    if (v >= 0 && v <= 3) setLevel(v as 0 | 1 | 2 | 3)
  }

  const fatalColor = stats.fatalRisk === undefined ? ACCENT
    : stats.fatalRisk >= 60 ? '#ef4444'
    : stats.fatalRisk >= 30 ? '#f97316'
    : stats.fatalRisk > 10 ? '#fbbf24'
    : '#4ade80'

  const complianceColor = stats.compliance === undefined ? ACCENT
    : stats.compliance >= 80 ? '#4ade80'
    : stats.compliance >= 40 ? '#fbbf24'
    : '#ef4444'

  const tutorFullText = [tutor.headline, tutor.detail, tutor.warning, tutor.suggestion].filter(Boolean).join(' ')

  return (
    <div>
      {/* Grid: SVG + controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
        gap: 20,
        marginBottom: 20,
      }}>
        {/* SVG do trabalhador */}
        <div style={{
          background: '#080c14',
          border: '1px solid #1e293b',
          borderRadius: 10,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 360,
        }}>
          <WorkerSVG
            mood={worker.mood ?? 0}
            helmet={worker.helmet}
            gloves={worker.gloves}
            boots={worker.boots}
            harness={worker.harness}
            mask={worker.mask}
            goggles={worker.goggles}
            earProtection={worker.earProtection}
            apron={worker.apron}
            risks={worker.risks}
            backgroundHint={worker.backgroundHint || config.defaultBackground || 'scaffold'}
          />
        </div>

        {/* Sliders + stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: '#080c14', border: '1px solid #1e293b', borderRadius: 10,
            padding: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              {config.sliderLabel}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT, marginBottom: 10 }}>
              {data.label}
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={level}
              onChange={handleSliderChange}
              onInput={handleSliderChange}
              style={{ width: '100%' }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 10, color: '#64748b', marginTop: 4,
            }}>
              {config.sliderTicks.map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          {stats.riskGrade && (
            <StatCard
              label="Grau de risco"
              value={stats.riskGrade}
              color={RISK_COLOR[stats.riskGrade]}
              icon={AlertTriangle}
            />
          )}
          {stats.fatalRisk !== undefined && (
            <StatCard
              label="Risco de acidente grave"
              value={`${stats.fatalRisk}%`}
              color={fatalColor}
              icon={AlertTriangle}
            />
          )}
          {stats.compliance !== undefined && (
            <StatCard
              label="Conformidade"
              value={`${stats.compliance}%`}
              color={complianceColor}
              icon={ShieldCheck}
            />
          )}
          {stats.lifeExpectancy !== undefined && (
            <StatCard
              label="Expectativa de vida"
              value={`${stats.lifeExpectancy} anos`}
              color={stats.lifeExpectancy >= 75 ? '#4ade80' : stats.lifeExpectancy >= 68 ? '#fbbf24' : '#ef4444'}
              icon={Heart}
            />
          )}
          {stats.fineEstimate !== undefined && (
            <StatCard
              label="Multa estimada (por trabalhador)"
              value={stats.fineEstimate === 0 ? 'R$ 0' : `R$ ${stats.fineEstimate.toLocaleString('pt-BR')}`}
              color={stats.fineEstimate === 0 ? '#4ade80' : '#ef4444'}
            />
          )}
        </div>
      </div>

      {/* ai.tutor */}
      <div style={{
        background: '#080c14',
        border: `1px solid ${ACCENT}55`,
        borderRadius: 12,
        padding: '18px 22px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -12, left: 18, padding: '3px 12px',
          background: '#0c1320', borderRadius: 9999, border: `1px solid ${ACCENT}55`,
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Bot size={11} color={ACCENT} />
          <span style={{
            background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899, #22d3ee)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 3s linear infinite',
          }}>
            ai.tutor
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            flexShrink: 0,
            width: 42, height: 42, borderRadius: '50%',
            background: `${ACCENT}22`,
            border: `1.5px solid ${ACCENT}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 14px ${ACCENT}55`,
          }}>
            <Bot size={22} color={ACCENT} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div key={level} className="fadeIn"
              style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3, marginBottom: 6 }}>
              {tutor.headline}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.65, color: '#cbd5e1' }}>
              {tutor.detail}
            </div>
            {tutor.warning && (
              <div style={{
                marginTop: 10, padding: '8px 12px',
                background: 'rgba(249,115,22,0.10)',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 8,
                fontSize: 13, color: '#fbbf24', lineHeight: 1.5,
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Cuidado:</strong> {tutor.warning}</span>
              </div>
            )}
            {tutor.suggestion && (
              <div style={{
                marginTop: 10, fontSize: 13, color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic',
              }}>
                <strong style={{ color: ACCENT, fontStyle: 'normal' }}>Tenta isso:</strong> {tutor.suggestion}
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            <PlayButton text={tutorFullText} size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon: Icon }: {
  label: string
  value: string
  color: string
  icon?: React.ComponentType<{ size?: number; color?: string }>
}) {
  return (
    <div style={{
      background: '#080c14',
      border: `1px solid ${color}33`,
      borderRadius: 10,
      padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {Icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}1A`, border: `1px solid ${color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={15} color={color} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>
          {value}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useCallback } from 'react'
import { Bot, AlertTriangle, ShieldCheck, Heart } from 'lucide-react'
import PlayButton from '../education/PlayButton'
import WorkerSVG, { type WorkerProps, type WorkerRisks } from './WorkerSVG'
import { EpiIcon, type EpiType } from './EpiIcons'
import { trackEvent } from '@/lib/track-event'

/* ═══════════════════════════════════════════════════════════
   WorkerLab — laboratorio interativo com BOTOES TOGGLE DE EPI.

   Em vez de slider linear, o aluno escolhe QUAIS EPIs/medidas
   de protecao ativar. Começa tudo desligado (estado "sem EPI").
   Cada toggle muda o trabalhador SVG, as stats e o ai.tutor.
   ═══════════════════════════════════════════════════════════ */

export type RiskGrade = 'Baixo' | 'Médio' | 'Alto' | 'Crítico'

export interface ProtectionItem {
  id: EpiType
  label: string
  workerProp?: keyof Pick<WorkerProps, 'helmet' | 'gloves' | 'boots' | 'harness' | 'mask' | 'goggles' | 'earProtection' | 'apron'>
  risksRemoved?: (keyof WorkerRisks)[]
  riskReduction: number          // 0-25 (reducao no risco fatal %)
  complianceWeight: number       // 0-25 (contribuicao pra compliance %)
  lifeYearsAdded: number         // 0-6 (anos na expectativa de vida)
  fineReduction: number          // R$ (quanto a multa cai com esse item)
  tutorAdded: string             // ai.tutor quando ativado
  tutorRemoved: string           // ai.tutor quando desativado
}

export interface WorkerLabConfig {
  sliderLabel?: string           // legado, ignorado na nova UI
  sliderTicks?: string[]         // legado, ignorado
  defaultBackground?: WorkerProps['backgroundHint']
  /** NOVO: itens de protecao disponiveis como botoes toggle */
  items?: ProtectionItem[]
  /** Base stats quando ZERO itens selecionados */
  baseStats?: {
    riskFatal: number
    compliance: number
    fineEstimate: number
    lifeExpectancy: number
  }
  /** Riscos visuais quando ZERO protecao */
  baseRisks?: WorkerRisks
  /** ai.tutor quando zero protecao */
  tutorEmpty?: string
  /** ai.tutor quando tudo selecionado */
  tutorFull?: string
  /** LEGADO: levels (backward compat — converte pra items on the fly) */
  levels?: Array<{
    label: string
    worker: Partial<WorkerProps>
    stats: {
      riskGrade?: RiskGrade
      fatalRisk?: number
      compliance?: number
      fineEstimate?: number
      lifeExpectancy?: number
    }
    tutor: {
      headline: string
      detail: string
      warning?: string
      suggestion?: string
    }
  }>
}

const ACCENT = '#22d3ee'

const RISK_GRADE = (risk: number): RiskGrade =>
  risk >= 60 ? 'Crítico' : risk >= 35 ? 'Alto' : risk >= 15 ? 'Médio' : 'Baixo'

const RISK_COLOR: Record<RiskGrade, string> = {
  'Baixo': '#4ade80',
  'Médio': '#fbbf24',
  'Alto': '#f97316',
  'Crítico': '#ef4444',
}

/** Gera items default a partir dos levels legados */
function itemsFromLevels(config: WorkerLabConfig): ProtectionItem[] {
  const levels = config.levels
  if (!levels || levels.length < 4) return []

  // Detecta quais equipamentos aparecem nas progressoes
  const allProps: Array<keyof Pick<WorkerProps, 'helmet' | 'gloves' | 'boots' | 'harness' | 'mask' | 'goggles' | 'earProtection' | 'apron'>> =
    ['helmet', 'gloves', 'boots', 'harness', 'mask', 'goggles', 'earProtection', 'apron']

  const usedProps = allProps.filter(p =>
    levels.some(l => (l.worker as Record<string, unknown>)[p])
  )

  const riskDrop = (levels[0].stats.fatalRisk || 80) - (levels[3].stats.fatalRisk || 5)
  const perItem = usedProps.length > 0 ? riskDrop / usedProps.length : 20

  const complianceTotal = levels[3].stats.compliance || 100
  const perItemComp = usedProps.length > 0 ? complianceTotal / usedProps.length : 25

  const fineTotal = (levels[0].stats.fineEstimate || 4000) - (levels[3].stats.fineEstimate || 0)
  const perItemFine = usedProps.length > 0 ? fineTotal / usedProps.length : 1000

  const lifeTotal = (levels[3].stats.lifeExpectancy || 77) - (levels[0].stats.lifeExpectancy || 55)
  const perItemLife = usedProps.length > 0 ? lifeTotal / usedProps.length : 4

  const LABELS: Record<string, string> = {
    helmet: 'Capacete', gloves: 'Luvas', boots: 'Botas',
    harness: 'Cinturão', mask: 'Máscara', goggles: 'Óculos',
    earProtection: 'Abafador', apron: 'Avental',
  }

  const RISK_MAP: Record<string, (keyof WorkerRisks)[]> = {
    helmet: ['headImpact'],
    gloves: ['handCuts'],
    boots: ['bodyImpact'],
    harness: ['fallRisk'],
    mask: ['breathing', 'chemical'],
    goggles: ['chemical'],
    earProtection: ['noise'],
    apron: ['heatExposure'],
  }

  return usedProps.map((prop, i) => ({
    id: prop as EpiType,
    label: LABELS[prop] || prop,
    workerProp: prop,
    risksRemoved: RISK_MAP[prop],
    riskReduction: Math.round(perItem),
    complianceWeight: Math.round(perItemComp),
    lifeYearsAdded: Math.round(perItemLife * 10) / 10,
    fineReduction: Math.round(perItemFine),
    tutorAdded: levels[Math.min(i + 1, 3)].tutor.headline,
    tutorRemoved: levels[0].tutor.headline,
  }))
}

export default function WorkerLab({ config, nrId }: { config: WorkerLabConfig; nrId?: number }) {
  // Converte levels legados pra items se necessario
  const items = useMemo(() => config.items || itemsFromLevels(config), [config])

  const baseStats = config.baseStats || {
    riskFatal: config.levels?.[0]?.stats?.fatalRisk ?? 80,
    compliance: 0,
    fineEstimate: config.levels?.[0]?.stats?.fineEstimate ?? 4000,
    lifeExpectancy: config.levels?.[0]?.stats?.lifeExpectancy ?? 55,
  }
  const baseRisks = config.baseRisks || config.levels?.[0]?.worker?.risks || { headImpact: true, handCuts: true, fallRisk: true }

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [lastAction, setLastAction] = useState<{ id: string; added: boolean } | null>(null)

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setLastAction({ id, added: false })
        trackEvent('lab_interact', { nrId, itemId: id, added: false, selectedCount: next.size })
      } else {
        next.add(id)
        setLastAction({ id, added: true })
        trackEvent('lab_interact', { nrId, itemId: id, added: true, selectedCount: next.size })
      }
      return next
    })
  }, [nrId])

  const clearAll = useCallback(() => {
    setSelected(new Set())
    setLastAction(null)
  }, [])

  // Calcula stats a partir da selecao
  const stats = useMemo(() => {
    const selectedItems = items.filter(it => selected.has(it.id))
    const riskFatal = Math.max(2, baseStats.riskFatal - selectedItems.reduce((s, it) => s + it.riskReduction, 0))
    const compliance = Math.min(100, selectedItems.reduce((s, it) => s + it.complianceWeight, 0))
    const fineEstimate = Math.max(0, baseStats.fineEstimate - selectedItems.reduce((s, it) => s + it.fineReduction, 0))
    const lifeExpectancy = Math.round(baseStats.lifeExpectancy + selectedItems.reduce((s, it) => s + it.lifeYearsAdded, 0))
    const riskGrade = RISK_GRADE(riskFatal)
    return { riskFatal, compliance, fineEstimate, lifeExpectancy, riskGrade }
  }, [selected, items, baseStats])

  // Worker props a partir da selecao
  const workerProps = useMemo(() => {
    const w: Partial<WorkerProps> = {
      mood: Math.min(1, selected.size / Math.max(1, items.length)),
      backgroundHint: config.defaultBackground || 'scaffold',
    }
    // EPIs
    for (const item of items) {
      if (selected.has(item.id) && item.workerProp) {
        (w as Record<string, unknown>)[item.workerProp] = true
      }
    }
    // Riscos: comeca com todos os base, remove os cobertos por items selecionados
    const risks = { ...baseRisks } as Record<string, boolean>
    for (const item of items) {
      if (selected.has(item.id) && item.risksRemoved) {
        for (const r of item.risksRemoved) risks[r] = false
      }
    }
    w.risks = risks as WorkerRisks
    return w
  }, [selected, items, config.defaultBackground, baseRisks])

  // ai.tutor: reage a ultima acao ou estado geral
  const tutorText = useMemo(() => {
    if (selected.size === 0) {
      return config.tutorEmpty || config.levels?.[0]?.tutor?.headline || 'Sem proteção. Arraste pra ativar.'
    }
    if (selected.size === items.length) {
      return config.tutorFull || config.levels?.[3]?.tutor?.headline || 'Proteção completa.'
    }
    if (lastAction) {
      const item = items.find(it => it.id === lastAction.id)
      if (item) {
        return lastAction.added ? item.tutorAdded : item.tutorRemoved
      }
    }
    const missing = items.filter(it => !selected.has(it.id))
    return `Faltam ${missing.length} itens: ${missing.map(it => it.label).join(', ')}.`
  }, [selected, items, lastAction, config])

  const tutorDetail = useMemo(() => {
    if (selected.size === 0) return config.levels?.[0]?.tutor?.detail || ''
    if (selected.size === items.length) return config.levels?.[3]?.tutor?.detail || ''
    if (lastAction) {
      const levelIdx = Math.min(3, Math.round((selected.size / items.length) * 3))
      return config.levels?.[levelIdx]?.tutor?.detail || ''
    }
    return ''
  }, [selected, items, lastAction, config])

  const fatalColor = stats.riskFatal >= 60 ? '#ef4444' : stats.riskFatal >= 35 ? '#f97316' : stats.riskFatal > 15 ? '#fbbf24' : '#4ade80'
  const compColor = stats.compliance >= 80 ? '#4ade80' : stats.compliance >= 40 ? '#fbbf24' : '#ef4444'
  const fullTutorText = [tutorText, tutorDetail].filter(Boolean).join(' ')

  return (
    <div>
      {/* Grid: SVG + botoes/stats */}
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
            mood={workerProps.mood ?? 0}
            helmet={workerProps.helmet}
            gloves={workerProps.gloves}
            boots={workerProps.boots}
            harness={workerProps.harness}
            mask={workerProps.mask}
            goggles={workerProps.goggles}
            earProtection={workerProps.earProtection}
            apron={workerProps.apron}
            risks={workerProps.risks}
            backgroundHint={workerProps.backgroundHint}
          />
        </div>

        {/* Botoes toggle + stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* BOTOES DE EPI */}
          <div style={{
            background: '#080c14', border: '1px solid #1e293b', borderRadius: 10,
            padding: 14,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                Equipamentos de proteção
              </div>
              {selected.size > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    fontSize: 10, color: '#ef4444', background: 'none',
                    border: '1px solid #ef444444', borderRadius: 6,
                    padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit',
                    fontWeight: 600,
                  }}
                >
                  Tirar todos
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {items.map(item => {
                const isActive = selected.has(item.id)
                const itemColor = isActive ? ACCENT : '#475569'
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    title={item.label}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 4,
                      padding: '8px 10px', borderRadius: 10,
                      border: `2px solid ${isActive ? ACCENT : '#1e293b'}`,
                      background: isActive ? `${ACCENT}1A` : 'transparent',
                      cursor: 'pointer',
                      opacity: isActive ? 1 : 0.5,
                      transition: 'all 0.2s',
                      minWidth: 60,
                      boxShadow: isActive ? `0 0 12px ${ACCENT}44` : 'none',
                      fontFamily: 'inherit',
                    }}
                  >
                    <EpiIcon type={item.id} color={itemColor} size={28} />
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: itemColor,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div style={{
              marginTop: 10, fontSize: 11, color: '#64748b',
              textAlign: 'center',
            }}>
              {selected.size === 0 ? 'Nenhum EPI selecionado' :
               selected.size === items.length ? '✓ Proteção completa' :
               `${selected.size} de ${items.length} itens ativos`}
            </div>
          </div>

          {/* STAT CARDS */}
          <StatCard label="Grau de risco" value={stats.riskGrade} color={RISK_COLOR[stats.riskGrade]} icon={AlertTriangle}/>
          <StatCard label="Risco de acidente grave" value={`${stats.riskFatal}%`} color={fatalColor} icon={AlertTriangle}/>
          <StatCard label="Conformidade" value={`${stats.compliance}%`} color={compColor} icon={ShieldCheck}/>
          <StatCard label="Expectativa de vida" value={`${stats.lifeExpectancy} anos`} color={stats.lifeExpectancy >= 75 ? '#4ade80' : stats.lifeExpectancy >= 68 ? '#fbbf24' : '#ef4444'} icon={Heart}/>
          <StatCard label="Multa estimada" value={stats.fineEstimate === 0 ? 'R$ 0' : `R$ ${stats.fineEstimate.toLocaleString('pt-BR')}`} color={stats.fineEstimate === 0 ? '#4ade80' : '#ef4444'}/>
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
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 3s linear infinite',
          }}>ai.tutor</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            flexShrink: 0, width: 42, height: 42, borderRadius: '50%',
            background: `${ACCENT}22`, border: `1.5px solid ${ACCENT}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 14px ${ACCENT}55`,
          }}>
            <Bot size={22} color={ACCENT} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div key={`${selected.size}-${lastAction?.id}`} className="fadeIn"
              style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3, marginBottom: 6 }}>
              {tutorText}
            </div>
            {tutorDetail && (
              <div style={{ fontSize: 14, lineHeight: 1.65, color: '#cbd5e1' }}>
                {tutorDetail}
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            <PlayButton text={fullTutorText} size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon: Icon }: {
  label: string; value: string; color: string
  icon?: React.ComponentType<{ size?: number; color?: string }>
}) {
  return (
    <div style={{
      background: '#080c14', border: `1px solid ${color}33`,
      borderRadius: 10, padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {Icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}1A`, border: `1px solid ${color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={15} color={color} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
        <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{value}</div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useCallback } from 'react'
import { Bot, AlertTriangle, ShieldCheck, Heart, X, Lightbulb } from 'lucide-react'
import PlayButton from '../education/PlayButton'
import WorkerSVG, { type WorkerProps, type WorkerRisks } from './WorkerSVG'
import { EpiIcon, EPI_LABELS, type EpiType } from './EpiIcons'
import { useIsMobile } from '@/hooks/useIsMobile'
import { trackEvent } from '@/lib/track-event'

/* ═══════════════════════════════════════════════════════════
   WorkerLab — painel de controle PCMAT.
   Arquitetura: main (SVG + EPI toggle) + aside (stats + Ella).
   Mobile colapsa em coluna via regras em globals.css.
   ═══════════════════════════════════════════════════════════ */

export type RiskGrade = 'Baixo' | 'Médio' | 'Alto' | 'Crítico'

export interface ProtectionItem {
  id: EpiType
  label: string
  fullName?: string
  description?: string
  normRef?: string
  workerProp?: keyof Pick<WorkerProps, 'helmet' | 'gloves' | 'boots' | 'harness' | 'mask' | 'goggles' | 'earProtection' | 'apron'>
  risksRemoved?: (keyof WorkerRisks)[]
  riskReduction: number
  complianceWeight: number
  lifeYearsAdded: number
  fineReduction: number
  tutorAdded: string
  tutorRemoved: string
}

export interface WorkerLabConfig {
  sliderLabel?: string
  sliderTicks?: string[]
  defaultBackground?: WorkerProps['backgroundHint']
  items?: ProtectionItem[]
  baseStats?: {
    riskFatal: number
    compliance: number
    fineEstimate: number
    lifeExpectancy: number
  }
  baseRisks?: WorkerRisks
  tutorEmpty?: string
  tutorFull?: string
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
const HAZARD_RED = '#ef4444'
const HAZARD_GREEN = '#4ade80'

const RISK_GRADE = (risk: number): RiskGrade =>
  risk >= 60 ? 'Crítico' : risk >= 35 ? 'Alto' : risk >= 15 ? 'Médio' : 'Baixo'

const RISK_COLOR: Record<RiskGrade, string> = {
  'Baixo': '#4ade80',
  'Médio': '#fbbf24',
  'Alto': '#f97316',
  'Crítico': '#ef4444',
}

function itemsFromLevels(config: WorkerLabConfig): ProtectionItem[] {
  const levels = config.levels
  if (!levels || levels.length < 4) return []

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
  const items = useMemo(() => config.items || itemsFromLevels(config), [config])

  const baseStats = config.baseStats || {
    riskFatal: config.levels?.[0]?.stats?.fatalRisk ?? 80,
    compliance: 0,
    fineEstimate: config.levels?.[0]?.stats?.fineEstimate ?? 4000,
    lifeExpectancy: config.levels?.[0]?.stats?.lifeExpectancy ?? 55,
  }
  const baseRisks = config.baseRisks || config.levels?.[0]?.worker?.risks || { headImpact: true, handCuts: true, fallRisk: true }

  const isMobile = useIsMobile()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [lastAction, setLastAction] = useState<{ id: string; added: boolean } | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(true)

  const toggle = useCallback((id: string) => {
    setShowOnboarding(false)
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

  const stats = useMemo(() => {
    const selectedItems = items.filter(it => selected.has(it.id))
    const riskFatal = Math.max(2, baseStats.riskFatal - selectedItems.reduce((s, it) => s + it.riskReduction, 0))
    const compliance = Math.min(100, selectedItems.reduce((s, it) => s + it.complianceWeight, 0))
    const fineEstimate = Math.max(0, baseStats.fineEstimate - selectedItems.reduce((s, it) => s + it.fineReduction, 0))
    const lifeExpectancy = Math.round(baseStats.lifeExpectancy + selectedItems.reduce((s, it) => s + it.lifeYearsAdded, 0))
    const riskGrade = RISK_GRADE(riskFatal)
    return { riskFatal, compliance, fineEstimate, lifeExpectancy, riskGrade }
  }, [selected, items, baseStats])

  const workerProps = useMemo(() => {
    const w: Partial<WorkerProps> = {
      mood: Math.min(1, selected.size / Math.max(1, items.length)),
      backgroundHint: config.defaultBackground || 'scaffold',
    }
    for (const item of items) {
      if (selected.has(item.id) && item.workerProp) {
        (w as Record<string, unknown>)[item.workerProp] = true
      }
    }
    const risks = { ...baseRisks } as Record<string, boolean>
    for (const item of items) {
      if (selected.has(item.id) && item.risksRemoved) {
        for (const r of item.risksRemoved) risks[r] = false
      }
    }
    w.risks = risks as WorkerRisks
    return w
  }, [selected, items, config.defaultBackground, baseRisks])

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

  const tutorWarning = useMemo(() => {
    const levelIdx = Math.min(3, Math.round((selected.size / Math.max(1, items.length)) * 3))
    const configWarning = config.levels?.[levelIdx]?.tutor?.warning
    if (configWarning) return configWarning

    if (stats.riskFatal >= 70) {
      return `Risco fatal em ${stats.riskFatal}%. Cada minuto sem proteção é roleta russa. Não é exagero — é estatística.`
    }
    if (stats.riskFatal >= 40) {
      const missing = items.filter(it => !selected.has(it.id))
      return `Ainda faltam ${missing.length} itens críticos (${missing.slice(0, 3).map(m => m.label).join(', ')}${missing.length > 3 ? '...' : ''}). Risco em ${stats.riskFatal}% — alto demais pra operar.`
    }
    if (stats.riskFatal >= 15) {
      return `Risco em ${stats.riskFatal}%. Melhorou, mas qualquer descuido vira acidente. Não relaxa agora.`
    }
    if (stats.compliance < 100 && selected.size > 0) {
      return `Conformidade em ${stats.compliance}%. Falta pouco — mas "quase conforme" não passa na auditoria.`
    }
    return ''
  }, [selected, items, config, stats])

  const tutorSuggestion = useMemo(() => {
    const levelIdx = Math.min(3, Math.round((selected.size / Math.max(1, items.length)) * 3))
    const configSuggestion = config.levels?.[levelIdx]?.tutor?.suggestion
    if (configSuggestion) return configSuggestion

    if (selected.size === 0) {
      const first = items[0]
      return first ? `Começa pelo ${first.label} — é o item mais básico. Clica e vê o que muda.` : ''
    }
    if (selected.size === items.length) {
      return 'Agora faz o contrário: tira um por um e observa qual item faz mais diferença nos números. Isso é análise de risco na prática.'
    }
    const missing = items
      .filter(it => !selected.has(it.id))
      .sort((a, b) => b.riskReduction - a.riskReduction)
    if (missing.length > 0) {
      const next = missing[0]
      return `Próximo passo: ativa o ${next.label}. Ele sozinho corta ${next.riskReduction}% do risco fatal e adiciona ${next.lifeYearsAdded} anos na expectativa de vida.`
    }
    return ''
  }, [selected, items, config])

  const fatalColor = stats.riskFatal >= 60 ? '#ef4444' : stats.riskFatal >= 35 ? '#f97316' : stats.riskFatal > 15 ? '#fbbf24' : '#4ade80'
  const compColor = stats.compliance >= 80 ? '#4ade80' : stats.compliance >= 40 ? '#fbbf24' : '#ef4444'
  const fullTutorText = [tutorText, tutorDetail, tutorWarning, tutorSuggestion].filter(Boolean).join(' ')

  const zeroSelected = selected.size === 0
  const allSelected = selected.size === items.length && items.length > 0
  const statusTint = zeroSelected ? HAZARD_RED : allSelected ? HAZARD_GREEN : ACCENT
  const labNumber = nrId ? String(nrId).padStart(3, '0') : '---'

  return (
    <div className="worker-lab-container">
      {/* ═══════════ MAIN PANEL ═══════════ */}
      <section className="worker-lab-main">
        {/* ─── META ROW ─── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.18em',
          color: '#64748b',
        }}>
          <span style={{ width: 20, height: 1, background: statusTint, opacity: 0.7 }} />
          <span>PAINEL PCMAT</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: `${statusTint}cc` }}>LAB·N°{labNumber}</span>
          <span style={{ flex: 1 }} />
          {selected.size > 0 && (
            <button onClick={clearAll} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, fontWeight: 700,
              color: HAZARD_RED, background: `${HAZARD_RED}0f`,
              border: `1px solid ${HAZARD_RED}44`,
              borderRadius: 3, padding: '3px 8px',
              cursor: 'pointer', letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <X size={10} strokeWidth={2.5} />
              Reset
            </button>
          )}
        </div>

        {/* ─── STATUS BADGE ─── */}
        <StatusBar
          selected={selected.size}
          total={items.length}
          tint={statusTint}
        />

        {/* ─── SVG PANEL ─── */}
        <div className="worker-svg-row" style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #0a1120 0%, #060b15 100%)',
          border: `1px solid ${statusTint}33`,
          borderRadius: 4,
          minHeight: 280, overflow: 'hidden',
          padding: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* grid paper background */}
          <span aria-hidden style={{
            position: 'absolute', inset: 0, opacity: 0.25,
            backgroundImage: `
              linear-gradient(${statusTint}0f 1px, transparent 1px),
              linear-gradient(90deg, ${statusTint}0f 1px, transparent 1px)
            `,
            backgroundSize: '22px 22px',
            pointerEvents: 'none',
          }} />
          {/* hazard stripe left edge */}
          <span aria-hidden style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 5,
            background: zeroSelected
              ? `repeating-linear-gradient(135deg, ${HAZARD_RED} 0 8px, #0a0a0a 8px 16px)`
              : allSelected ? HAZARD_GREEN : statusTint,
            opacity: 0.9, pointerEvents: 'none',
          }} />
          {/* viewfinder brackets */}
          <Bracket pos="tl" color={statusTint} />
          <Bracket pos="tr" color={statusTint} />
          <Bracket pos="bl" color={statusTint} />
          <Bracket pos="br" color={statusTint} />

          <div className="worker-svg-wrapper" style={{ position: 'relative', zIndex: 1, maxWidth: '100%' }}>
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

          {/* Onboarding overlay */}
          {showOnboarding && zeroSelected && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'rgba(5,10,20,0.88)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              pointerEvents: 'auto',
            }}>
              <button
                onClick={() => setShowOnboarding(false)}
                aria-label="Fechar onboarding"
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 26, height: 26,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  borderRadius: 4, color: '#e2e8f0', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: isMobile ? 22 : 28, color: '#fff',
                fontWeight: 700, textAlign: 'center', lineHeight: 1.25,
                marginBottom: 6, padding: '0 20px',
              }}>
                Escolha um EPI<br/>pra ver o que acontece
              </div>
              <svg width="36" height="32" viewBox="0 0 36 32" fill="none" style={{ marginBottom: 6 }} aria-hidden>
                <path d="M 18 2 C 12 6 10 12 14 20 C 16 24 17 26 18 28" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M 14 25 L 18 31 L 22 25" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* ─── PERFORATION ─── */}
        <div aria-hidden style={{
          height: 1,
          backgroundImage: `repeating-linear-gradient(90deg, ${statusTint}55 0 4px, transparent 4px 9px)`,
          backgroundSize: '9px 1px',
          margin: '2px 0',
        }} />

        {/* ─── EPI CONTROLS ─── */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, fontWeight: 700,
          color: '#475569',
          textTransform: 'uppercase', letterSpacing: '0.2em',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>EQUIPAMENTOS</span>
          <span style={{ flex: 1, height: 1, background: '#1e293b' }} />
          <span style={{ color: statusTint }}>
            {String(selected.size).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
        </div>

        <div className="worker-lab-controls" style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(auto-fill, minmax(72px, 1fr))'
            : 'repeat(auto-fill, minmax(88px, 1fr))',
          gap: 6,
        }}>
          {items.map(item => {
            const isActive = selected.has(item.id)
            const label = EPI_LABELS[item.id as EpiType] || item.label
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                title={item.fullName || item.label}
                aria-pressed={isActive}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 4,
                  padding: isMobile ? '8px 4px' : '10px 4px', borderRadius: 4,
                  border: `1px solid ${isActive ? ACCENT : '#1e293b'}`,
                  background: isActive ? `${ACCENT}12` : '#080c14',
                  cursor: 'pointer',
                  opacity: isActive ? 1 : 0.7,
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? `0 0 0 1px ${ACCENT}, 0 0 20px -4px ${ACCENT}66` : 'none',
                  fontFamily: 'inherit',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <span aria-hidden style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                  }} />
                )}
                <EpiIcon type={item.id} color={isActive ? ACCENT : '#94a3b8'} size={isMobile ? 26 : 32} />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: isMobile ? 8 : 9,
                  color: isActive ? '#e2e8f0' : '#64748b',
                  fontWeight: 600, lineHeight: 1,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  width: '100%',
                }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ═══════════ ASIDE ═══════════ */}
      <aside className="worker-lab-aside">
        {/* ─── STATS PANEL ─── */}
        <div style={{
          background: 'linear-gradient(180deg, #0a1120 0%, #060b15 100%)',
          border: '1px solid #1e293b', borderRadius: 4,
          padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.22em',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>INDICADORES</span>
            <span style={{ flex: 1, height: 1, background: '#1e293b' }} />
            <span style={{ color: statusTint }}>LIVE</span>
          </div>

          <StatRow label="Grau de risco" value={stats.riskGrade} color={RISK_COLOR[stats.riskGrade]} icon={AlertTriangle} />
          <StatRow label="Risco fatal"   value={`${stats.riskFatal}%`} color={fatalColor} icon={AlertTriangle} bar={stats.riskFatal} barMax={100} />
          <StatRow label="Conformidade"  value={`${stats.compliance}%`} color={compColor} icon={ShieldCheck} bar={stats.compliance} barMax={100} />
          <StatRow label="Vida estimada" value={`${stats.lifeExpectancy} a`} color={stats.lifeExpectancy >= 75 ? '#4ade80' : stats.lifeExpectancy >= 68 ? '#fbbf24' : '#ef4444'} icon={Heart} />
          <StatRow label="Multa MTE"     value={stats.fineEstimate === 0 ? 'R$ 0' : `R$ ${stats.fineEstimate.toLocaleString('pt-BR')}`} color={stats.fineEstimate === 0 ? '#4ade80' : '#ef4444'} />
        </div>

        {/* ─── ELLA PANEL ─── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #0a1120 0%, #060b15 100%)',
          border: `1px solid ${ACCENT}44`, borderRadius: 4,
          padding: '14px 14px 12px',
          overflow: 'hidden',
        }}>
          <span aria-hidden style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, ${ACCENT}, #a855f7, #ec4899, ${ACCENT})`,
            backgroundSize: '200% 100%',
            animation: 'gradientShift 3s linear infinite',
          }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.22em',
            marginBottom: 10,
          }}>
            <Bot size={11} color={ACCENT} />
            <span style={{
              background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899, #22d3ee)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 3s linear infinite',
            }}>
              Ella · Tutor IA
            </span>
            <span style={{ flex: 1, height: 1, background: `${ACCENT}22` }} />
            <span style={{ color: '#475569' }}>LIVE</span>
          </div>

          <div key={`${selected.size}-${lastAction?.id}`} className="fadeIn"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 14, fontWeight: 700, color: '#e2e8f0',
              lineHeight: 1.35, marginBottom: tutorDetail ? 8 : 0,
            }}>
            <TutorTextWithCitations text={tutorText} />
          </div>

          {tutorDetail && (
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13, lineHeight: 1.55, color: '#cbd5e1',
              marginBottom: tutorWarning || tutorSuggestion ? 10 : 0,
            }}>
              <TutorTextWithCitations text={tutorDetail} />
            </div>
          )}

          {tutorWarning && (
            <div style={{
              position: 'relative',
              marginTop: 8, padding: '8px 10px 8px 14px',
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.3)',
              borderRadius: 3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12, color: '#fbbf24', lineHeight: 1.5,
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <span aria-hidden style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                background: 'repeating-linear-gradient(135deg, #f97316 0 6px, #0a0a0a 6px 12px)',
              }} />
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: '#f97316', display: 'block', marginBottom: 2,
                }}>ALERTA</strong>
                <TutorTextWithCitations text={tutorWarning} />
              </div>
            </div>
          )}

          {tutorSuggestion && (
            <div style={{
              marginTop: 8, padding: '8px 10px 8px 14px',
              position: 'relative',
              background: 'rgba(34,211,238,0.05)',
              border: `1px solid ${ACCENT}33`,
              borderRadius: 3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12, color: '#cbd5e1', lineHeight: 1.5,
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <span aria-hidden style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                background: ACCENT, opacity: 0.7,
              }} />
              <Lightbulb size={13} color={ACCENT} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: ACCENT, display: 'block', marginBottom: 2,
                }}>PRÓXIMO PASSO</strong>
                <TutorTextWithCitations text={tutorSuggestion} />
              </div>
            </div>
          )}

          <div style={{
            marginTop: 10, paddingTop: 8,
            borderTop: `1px dashed ${ACCENT}22`,
            display: 'flex', justifyContent: 'flex-end',
          }}>
            <PlayButton text={fullTutorText} size={12} />
          </div>
        </div>
      </aside>
    </div>
  )
}

/* ─────────────── helpers ─────────────── */

function StatusBar({ selected, total, tint }: { selected: number; total: number; tint: string }) {
  const pct = total > 0 ? selected / total : 0
  const label = selected === 0 ? 'SEM PROTEÇÃO ATIVA' :
    selected === total ? 'PROTEÇÃO COMPLETA · PCMAT CONFORME' :
    `${selected} DE ${total} EPIS ATIVOS · AUDITORIA INCOMPLETA`

  return (
    <div style={{
      position: 'relative',
      padding: '6px 10px',
      background: `${tint}0d`,
      border: `1px solid ${tint}33`,
      borderRadius: 3,
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10, fontWeight: 700,
      color: tint, letterSpacing: '0.14em', textTransform: 'uppercase',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${pct * 100}%`,
        background: `${tint}14`,
        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }} />
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: tint, boxShadow: `0 0 10px ${tint}`,
          animation: 'pulse 1.6s ease-in-out infinite',
        }} />
        {label}
      </span>
      <span style={{ position: 'relative', zIndex: 1, color: `${tint}cc` }}>
        {Math.round(pct * 100)}%
      </span>
    </div>
  )
}

function Bracket({ pos, color }: { pos: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const size = 12
  const thickness = 1.5
  const common: React.CSSProperties = {
    position: 'absolute', width: size, height: size,
    pointerEvents: 'none', zIndex: 2,
    borderColor: `${color}99`,
    borderStyle: 'solid',
    borderWidth: 0,
  }
  const styles: Record<string, React.CSSProperties> = {
    tl: { ...common, top: 4, left: 4, borderTopWidth: thickness, borderLeftWidth: thickness },
    tr: { ...common, top: 4, right: 4, borderTopWidth: thickness, borderRightWidth: thickness },
    bl: { ...common, bottom: 4, left: 4, borderBottomWidth: thickness, borderLeftWidth: thickness },
    br: { ...common, bottom: 4, right: 4, borderBottomWidth: thickness, borderRightWidth: thickness },
  }
  return <span aria-hidden style={styles[pos]} />
}

function StatRow({ label, value, color, icon: Icon, bar, barMax }: {
  label: string; value: string; color: string
  icon?: React.ComponentType<{ size?: number; color?: string }>
  bar?: number; barMax?: number
}) {
  const barPct = bar !== undefined && barMax ? Math.min(1, bar / barMax) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && (
          <div style={{
            width: 22, height: 22, borderRadius: 3,
            background: `${color}14`, border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={12} color={color} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, color: '#64748b', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>{label}</div>
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14, fontWeight: 700, color,
          lineHeight: 1,
        }}>{value}</div>
      </div>
      {bar !== undefined && barMax && (
        <div style={{
          height: 3, borderRadius: 1,
          background: `${color}15`,
          overflow: 'hidden', marginLeft: 30,
        }}>
          <span style={{
            display: 'block',
            height: '100%',
            width: `${barPct * 100}%`,
            background: color,
            boxShadow: `0 0 8px ${color}66`,
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </div>
      )}
    </div>
  )
}

/**
 * TutorTextWithCitations — transforma [NR-X, item Y.Z] em links clicáveis
 * que abrem um modal explicando o item via Claude (/api/eduven/term-explain).
 */
function TutorTextWithCitations({ text }: { text: string }) {
  const [modalTerm, setModalTerm] = useState<string | null>(null)
  const [modalContent, setModalContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const openCitation = async (cite: string) => {
    setModalTerm(cite)
    setLoading(true)
    setModalContent(null)
    try {
      const res = await fetch('/api/eduven/term-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: cite, lessonContext: `Citação normativa: ${cite}` }),
      })
      const data = await res.json()
      const c = data.content
      if (c) {
        setModalContent([c.whatIs, c.howItWorks, c.whyItMatters, c.realExample].filter(Boolean).join('\n\n'))
      } else {
        setModalContent('Não foi possível carregar a explicação.')
      }
    } catch {
      setModalContent('Erro ao buscar explicação.')
    }
    setLoading(false)
  }

  const parts = text.split(/(\[NR-\d+[^\]]*\])/g)

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[(NR-\d+[^\]]*)\]$/)
        if (match) {
          return (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); openCitation(match[1]) }}
              style={{
                display: 'inline', padding: '1px 6px', margin: '0 2px',
                borderRadius: 3, border: `1px solid ${ACCENT}44`,
                background: `${ACCENT}15`, color: ACCENT,
                fontSize: 'inherit', fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600, cursor: 'pointer',
                textDecoration: 'underline', textDecorationStyle: 'dotted',
                textUnderlineOffset: '2px',
              }}
              title={`Clique pra saber mais sobre ${match[1]}`}
            >
              {match[1]}
            </button>
          )
        }
        return <span key={i}>{part}</span>
      })}

      {modalTerm && (
        <div
          onClick={() => setModalTerm(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1400,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0c1320', border: `1px solid ${ACCENT}55`,
              borderRadius: 6, padding: '24px 28px',
              maxWidth: 560, width: '100%', maxHeight: '70vh', overflowY: 'auto',
            }}
          >
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, fontWeight: 700, color: ACCENT,
              textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: 10,
            }}>
              REFERÊNCIA NORMATIVA
            </div>
            <h3 style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 16,
              letterSpacing: '-0.01em',
            }}>
              {modalTerm}
            </h3>
            {loading && (
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#64748b', fontSize: 14,
              }}>Buscando explicação...</div>
            )}
            {modalContent && (
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14, lineHeight: 1.7, color: '#cbd5e1', whiteSpace: 'pre-wrap',
              }}>
                {modalContent}
              </div>
            )}
            <button
              onClick={() => setModalTerm(null)}
              style={{
                marginTop: 20, padding: '8px 20px', borderRadius: 4,
                border: `1px solid ${ACCENT}`, background: 'transparent',
                color: ACCENT, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

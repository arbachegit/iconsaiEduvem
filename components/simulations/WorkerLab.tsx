'use client'

import { useState, useMemo, useCallback } from 'react'
import { Bot, AlertTriangle, ShieldCheck, Heart } from 'lucide-react'
import PlayButton from '../education/PlayButton'
import WorkerSVG, { type WorkerProps, type WorkerRisks } from './WorkerSVG'
import { EpiIcon, EPI_LABELS, type EpiType } from './EpiIcons'
import { useIsMobile } from '@/hooks/useIsMobile'
import { trackEvent } from '@/lib/track-event'

/* ═══════════════════════════════════════════════════════════
   WorkerLab — laboratorio interativo com BOTOES TOGGLE DE EPI.

   Em vez de slider linear, o aluno escolhe QUAIS EPIs/medidas
   de protecao ativar. Começa tudo desligado (estado "sem EPI").
   Cada toggle muda o trabalhador SVG, as stats e o Ella.
   ═══════════════════════════════════════════════════════════ */

export type RiskGrade = 'Baixo' | 'Médio' | 'Alto' | 'Crítico'

export interface ProtectionItem {
  id: EpiType
  label: string
  /** Nome completo do equipamento (ex: "Capacete classe B com jugular") */
  fullName?: string
  /** Por que esse item importa — 1 frase (ex: "Protege contra impacto de objetos em queda") */
  description?: string
  /** Norma de referencia (ex: "NR-6, Anexo I") */
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
  /** Ella quando zero protecao */
  tutorEmpty?: string
  /** Ella quando tudo selecionado */
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

  // Ella: reage a ultima acao ou estado geral
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

  // WARNING — sempre ativo quando ha risco. Prioriza config, fallback dinamico.
  const tutorWarning = useMemo(() => {
    const levelIdx = Math.min(3, Math.round((selected.size / Math.max(1, items.length)) * 3))
    const configWarning = config.levels?.[levelIdx]?.tutor?.warning

    if (configWarning) return configWarning

    // Geracao dinamica baseada no estado
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

  // SUGGESTION — sempre ativo. Guia o proximo passo do aluno.
  const tutorSuggestion = useMemo(() => {
    const levelIdx = Math.min(3, Math.round((selected.size / Math.max(1, items.length)) * 3))
    const configSuggestion = config.levels?.[levelIdx]?.tutor?.suggestion

    if (configSuggestion) return configSuggestion

    // Geracao dinamica
    if (selected.size === 0) {
      const first = items[0]
      return first ? `Começa pelo ${first.label} — é o item mais básico. Clica e vê o que muda.` : ''
    }
    if (selected.size === items.length) {
      return 'Agora faz o contrário: tira um por um e observa qual item faz mais diferença nos números. Isso é análise de risco na prática.'
    }
    // Sugere o proximo item mais impactante (maior riskReduction) que ainda nao foi selecionado
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Título + PCMAT */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 4px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
          Escolha um equipamento para atender o <span title="Programa de Condições e Meio Ambiente de Trabalho" style={{ color: '#22d3ee', cursor: 'help', borderBottom: '1px dotted #22d3ee' }}>PCMAT</span>
        </div>
        {selected.size > 0 && (
          <button onClick={clearAll} style={{
            fontSize: 10, color: '#ef4444', background: 'none',
            border: '1px solid #ef444444', borderRadius: 6,
            padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
          }}>Tirar todos</button>
        )}
      </div>

      {/* Badge de status */}
      <div style={{ textAlign: 'center', fontSize: 10, color: '#64748b', padding: '2px 0' }}>
        {selected.size === 0 ? 'Selecione os EPIs necessários' :
         selected.size === items.length ? '✓ Proteção completa' :
         `${selected.size} de ${items.length} itens ativos`}
      </div>

      {/* SVG do trabalhador — FULL WIDTH + modal onboarding sobreposto */}
      <div style={{
        background: '#080c14', border: '1px solid #1e293b', borderRadius: 6,
        padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 280, position: 'relative',
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

        {/* Modal onboarding — APENAS sobre o boneco */}
        {showOnboarding && selected.size === 0 && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(5,10,20,0.88)', borderRadius: 6,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <button
              onClick={() => setShowOnboarding(false)}
              style={{
                position: 'absolute', top: 6, right: 6,
                width: 26, height: 26, display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: 5, color: '#e2e8f0', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, lineHeight: 1,
              }}
            >✕</button>
            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: isMobile ? 18 : 24, color: '#fff',
              fontWeight: 600, textAlign: 'center', lineHeight: 1.3,
            }}>
              Escolha uma EPI para<br/>ver o que ocorrerá
            </div>
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
              <path d="M 20 2 C 12 8 10 18 14 28 C 18 38 19 42 20 46" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <path d="M 16 42 L 20 48 L 24 42" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* Botões EPI — ícone + label, horizontal wrap */}
      <div className="worker-lab-controls" style={{
        display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center',
        padding: '4px 0', position: 'relative',
      }}>
        {items.map(item => {
          const isActive = selected.has(item.id)
          const itemColor = isActive ? ACCENT : '#64748b'
          const label = EPI_LABELS[item.id as EpiType] || item.label
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              title={item.fullName || item.label}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 2,
                width: isMobile ? 52 : 64, padding: '6px 2px', borderRadius: 8,
                border: `2px solid ${isActive ? ACCENT : '#1e293b'}`,
                background: isActive ? `${ACCENT}15` : '#080c14',
                cursor: 'pointer', opacity: isActive ? 1 : 0.5,
                transition: 'all 0.15s',
                boxShadow: isActive ? `0 0 8px ${ACCENT}33` : 'none',
                fontFamily: 'inherit',
              }}
            >
              <EpiIcon type={item.id} color={itemColor} size={isMobile ? 20 : 24} />
              <span style={{
                fontSize: isMobile ? 7 : 9, color: isActive ? '#e2e8f0' : '#64748b',
                fontWeight: 600, lineHeight: 1, textAlign: 'center',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                width: '100%',
              }}>
                {label}
              </span>
            </button>
          )
        })}

        {/* overlay movido para position absolute sobre todo o lab */}
      </div>

      {/* overlay antigo removido */}

      {/* Stat Cards — grid 2 colunas, compacto */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        <StatCard label="Grau de risco" value={stats.riskGrade} color={RISK_COLOR[stats.riskGrade]} icon={AlertTriangle}/>
        <StatCard label="Risco acidente" value={`${stats.riskFatal}%`} color={fatalColor} icon={AlertTriangle}/>
        <StatCard label="Conformidade" value={`${stats.compliance}%`} color={compColor} icon={ShieldCheck}/>
        <StatCard label="Vida estimada" value={`${stats.lifeExpectancy}a`} color={stats.lifeExpectancy >= 75 ? '#4ade80' : stats.lifeExpectancy >= 68 ? '#fbbf24' : '#ef4444'} icon={Heart}/>
        <StatCard label="Multa" value={stats.fineEstimate === 0 ? 'R$ 0' : `R$ ${stats.fineEstimate.toLocaleString('pt-BR')}`} color={stats.fineEstimate === 0 ? '#4ade80' : '#ef4444'}/>
      </div>

      {/* Ella — full width, espaço mínimo */}
      <div style={{
        background: '#080c14', border: `1px solid ${ACCENT}44`,
        borderRadius: 6, padding: '10px 6px', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -10, left: 8, padding: '2px 10px',
          background: '#0c1320', borderRadius: 9999, border: `1px solid ${ACCENT}44`,
          fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Bot size={10} color={ACCENT} />
          <span style={{
            background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899, #22d3ee)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 3s linear infinite',
          }}>Ella</span>
        </div>
        <div style={{ marginTop: 4 }}>
          <div key={`${selected.size}-${lastAction?.id}`} className="fadeIn"
            style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3, marginBottom: 4 }}>
            <TutorTextWithCitations text={tutorText} />
          </div>
          {tutorDetail && (
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#cbd5e1' }}>
              <TutorTextWithCitations text={tutorDetail} />
            </div>
          )}
          {tutorWarning && (
            <div style={{
              marginTop: 6, padding: '6px 8px',
              background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.3)',
              borderRadius: 6, fontSize: 12, color: '#fbbf24', lineHeight: 1.4,
              display: 'flex', alignItems: 'flex-start', gap: 6,
            }}>
              <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
              <span><strong>Cuidado:</strong> <TutorTextWithCitations text={tutorWarning} /></span>
            </div>
          )}
          {tutorSuggestion && (
            <div style={{
              marginTop: 6, padding: '6px 8px',
              background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)',
              borderRadius: 6, fontSize: 12, color: '#94a3b8', lineHeight: 1.4, fontStyle: 'italic',
            }}>
              <strong style={{ color: ACCENT, fontStyle: 'normal' }}>↗ Tenta isso:</strong> <TutorTextWithCitations text={tutorSuggestion} />
            </div>
          )}
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
            <PlayButton text={fullTutorText} size={12} />
          </div>
        </div>
      </div>
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

  // Split text por citações [NR-X, ...]
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
                borderRadius: 4, border: `1px solid ${ACCENT}44`,
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

      {/* Modal de citação */}
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
              borderRadius: 14, padding: '24px 28px',
              maxWidth: 560, width: '100%', maxHeight: '70vh', overflowY: 'auto',
            }}
          >
            <div style={{
              fontSize: 11, fontWeight: 700, color: ACCENT,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
            }}>
              Referência normativa
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>
              {modalTerm}
            </h3>
            {loading && (
              <div style={{ color: '#64748b', fontSize: 14 }}>Buscando explicação...</div>
            )}
            {modalContent && (
              <div style={{ fontSize: 14, lineHeight: 1.7, color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                {modalContent}
              </div>
            )}
            <button
              onClick={() => setModalTerm(null)}
              style={{
                marginTop: 20, padding: '8px 20px', borderRadius: 8,
                border: `1px solid ${ACCENT}`, background: 'transparent',
                color: ACCENT, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
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

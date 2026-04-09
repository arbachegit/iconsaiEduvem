'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Sparkles, Sprout, Mountain, Flame, Skull, FlaskConical } from 'lucide-react'
import LessonView, { type LessonSection } from './LessonView'
import SimulationLab from './SimulationLab'
import { getSectorMeta } from '@/lib/sectors-meta'
import { hasSimulation } from '@/lib/nr-simulations'

/* ═══════════════════════════════════════════════════════════
   LessonModal — modal horizontal canonico (padrao stats)
   - Orquestra fluxo lesson-fast → lesson-rest
   - Verbos rotativos com gradient shimmer
   - Difficulty toggle (Facil/Medio/Dificil) com easter egg PhD
   - Generation guard (cancela respostas obsoletas em troca de difficulty)
   - Botao Laboratorio (placeholder ate criarmos a 1a simulacao)
   - Esc fecha
   ═══════════════════════════════════════════════════════════ */

type Difficulty = 'easier' | 'same' | 'harder' | 'phd'

const THINKING_VERBS_STAGE1 = [
  'Pensando', 'Lendo a norma', 'Iluminando ideias', 'Aquecendo o quadro',
  'Garimpando exemplos do setor', 'Conectando conceitos',
  'Considerando o caso do trabalhador', 'Tecendo a abertura',
]

const THINKING_VERBS_STAGE2 = [
  'Costurando os exemplos', 'Cozinhando a aula', 'Provando os numeros',
  'Ajustando o passo a passo', 'Garimpando casos reais',
  'Refinando a explicacao', 'Calibrando o tom',
]

const DIFFICULTY_OPTIONS: Array<{
  key: Difficulty
  label: string
  Icon: React.ComponentType<{ size?: number }>
  color: string
  tooltip: string
}> = [
  { key: 'easier', label: 'Facil',  Icon: Sprout,  color: '#22c55e', tooltip: 'Linguagem do dia a dia, exemplos concretos' },
  { key: 'same',   label: 'Medio',  Icon: Mountain,color: '#eab308', tooltip: 'Equilibrado, com termos tecnicos explicados' },
  { key: 'harder', label: 'Dificil',Icon: Flame,   color: '#f97316', tooltip: 'Aprofundamento juridico-tecnico' },
]

interface Props {
  nrId: number
  nrCode: string
  nrTitle: string
  sectorSlug: string
  sectorName: string
  initialDifficulty?: 'easier' | 'same' | 'harder'
  onClose: () => void
}

export default function LessonModal({
  nrId, nrCode, nrTitle, sectorSlug, sectorName, initialDifficulty = 'same', onClose,
}: Props) {
  const meta = getSectorMeta(sectorSlug)
  const accent = meta?.color || '#00d4ff'
  const accentSoft = meta?.colorSoft || 'rgba(0,212,255,0.10)'
  const accentBorder = meta?.borderColor || 'rgba(0,212,255,0.40)'

  // ── State ────────────────────────────────────────────────
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(initialDifficulty)
  const [phdUnlocked, setPhdUnlocked] = useState(false)

  const [title, setTitle] = useState('')
  const [sections, setSections] = useState<LessonSection[]>([])
  const [lessonId, setLessonId] = useState(0)
  const [stage1Loading, setStage1Loading] = useState(false)
  const [restLoading, setRestLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [verbIdx, setVerbIdx] = useState(0)

  // Generation guard — invalida respostas antigas em troca de difficulty
  const generationRef = useRef(0)

  // StrictMode dedupe — previne useEffect rodando 2x em dev
  const lastBootKeyRef = useRef<string>('')

  // PhD easter egg
  const phdClickRef = useRef<{ key: Difficulty | null; count: number; lastTs: number }>({
    key: null, count: 0, lastTs: 0,
  })

  // ── Esc fecha ────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  // Bloqueia scroll do body
  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  // ── Timer + verbo rotativo ───────────────────────────────
  useEffect(() => {
    if (!stage1Loading && !restLoading) return
    setElapsed(0)
    setVerbIdx(0)
    const tEl = setInterval(() => setElapsed(e => e + 1), 1000)
    const tVerb = setInterval(() => setVerbIdx(i => i + 1), 1500)
    return () => { clearInterval(tEl); clearInterval(tVerb) }
  }, [stage1Loading, restLoading])

  // ── Geracao ──────────────────────────────────────────────
  const generate = useCallback(async (genId: number) => {
    setError(null)
    setSections([])
    setTitle('')
    setStage1Loading(true)

    try {
      // STAGE 1
      const fastRes = await fetch('/api/eduven/lesson-fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nrId, sector: sectorSlug, difficulty: currentDifficulty }),
      })
      const fastJson = await fastRes.json()
      if (generationRef.current !== genId) return    // cancelado por troca de difficulty
      if (!fastRes.ok) throw new Error(fastJson?.error || 'Falha ao gerar inicio da aula')

      setTitle(fastJson.title)
      setSections([fastJson.section1])
      setLessonId(fastJson.lessonId)
      setStage1Loading(false)

      // STAGE 2
      setRestLoading(true)
      const restRes = await fetch('/api/eduven/lesson-rest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: fastJson.lessonId }),
      })
      const restJson = await restRes.json()
      if (generationRef.current !== genId) return
      if (!restRes.ok) throw new Error(restJson?.error || 'Falha ao gerar restante da aula')

      setSections(prev => [...prev, ...(restJson.sections || [])])
      setRestLoading(false)
    } catch (e) {
      if (generationRef.current !== genId) return
      setError((e as Error).message)
      setStage1Loading(false)
      setRestLoading(false)
    }
  }, [nrId, sectorSlug, currentDifficulty])

  // Boot inicial + qualquer mudanca de difficulty regenera.
  // StrictMode dedupe: ignora 2a invocacao com mesma key (dev only).
  useEffect(() => {
    const bootKey = `${nrId}-${sectorSlug}-${currentDifficulty}`
    if (lastBootKeyRef.current === bootKey) return
    lastBootKeyRef.current = bootKey
    generationRef.current += 1
    const genId = generationRef.current
    generate(genId)
  }, [generate, nrId, sectorSlug, currentDifficulty])

  // ── Difficulty handler com easter egg PhD ────────────────
  const handleDifficultyClick = (key: Difficulty) => {
    const now = Date.now()
    const tracker = phdClickRef.current
    if (tracker.key === key && now - tracker.lastTs < 1000) {
      tracker.count += 1
    } else {
      tracker.key = key
      tracker.count = 1
    }
    tracker.lastTs = now

    if (tracker.count >= 5 && !phdUnlocked) {
      setPhdUnlocked(true)
      setCurrentDifficulty('phd')
      tracker.count = 0
      return
    }
    if (key !== currentDifficulty) setCurrentDifficulty(key)
  }

  // ── Render ───────────────────────────────────────────────
  const verbList = restLoading && !stage1Loading ? THINKING_VERBS_STAGE2 : THINKING_VERBS_STAGE1
  const currentVerb = verbList[verbIdx % verbList.length]
  const isLoading = stage1Loading || restLoading

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: 'min(1400px, 96vw)', height: '92vh',
          background: '#050d1a', border: `1px solid ${accentBorder}`, borderRadius: 16,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${accent}11`,
        }}
      >
        {/* ═══ HEADER ═══ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 20px', borderBottom: '1px solid #1e293b',
          background: `linear-gradient(135deg, ${accent}0F, ${accent}03)`,
        }}>
          {/* Titulo */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
            }}>
              <span style={{ color: accent }}>{nrCode}</span>
              <span style={{ color: '#475569' }}>·</span>
              <span style={{ color: '#94a3b8' }}>{sectorName}</span>
            </div>
            <h2 style={{
              margin: 0, color: '#e2e8f0', fontSize: 17, fontWeight: 700,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {title || (isLoading ? 'Gerando aula sobre ' + nrTitle : nrTitle)}
            </h2>
          </div>

          {/* Verbos rotativos */}
          {isLoading && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 9999,
              border: `1px solid ${accent}4D`, background: `${accent}0D`,
            }}>
              <Sparkles size={14} style={{ animation: 'starGlow 2s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{
                fontSize: 12, fontWeight: 600,
                background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899, #22d3ee)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 3s linear infinite',
              }}>
                {currentVerb}…
              </span>
              <span style={{ fontSize: 11, color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>{elapsed}s</span>
            </div>
          )}

          {/* Difficulty toggle */}
          <div style={{
            display: 'inline-flex', gap: 4, padding: 3, borderRadius: 9999,
            border: '1px solid #1e293b', background: 'rgba(15,23,42,0.6)',
          }}>
            {DIFFICULTY_OPTIONS.map(d => {
              const active = currentDifficulty === d.key
              return (
                <button
                  key={d.key}
                  onClick={() => handleDifficultyClick(d.key)}
                  title={d.tooltip}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 9999, padding: 0,
                    border: 'none', cursor: 'pointer',
                    background: active ? `${d.color}25` : 'transparent',
                    color: active ? d.color : '#64748b',
                    transition: 'all 0.15s',
                  }}
                >
                  <d.Icon size={15} />
                </button>
              )
            })}
            {phdUnlocked && (
              <button
                onClick={() => handleDifficultyClick('phd')}
                title="Modo PhD — extra-denso, com base juridica completa"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: 9999, padding: 0,
                  border: 'none', cursor: 'pointer',
                  background: currentDifficulty === 'phd' ? 'rgba(168,85,247,0.25)' : 'transparent',
                  color: currentDifficulty === 'phd' ? '#a855f7' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                <Skull size={15} />
              </button>
            )}
          </div>

          {/* Laboratorio button — sempre aparece, scroll para o lab no fim do modal */}
          {!isLoading && (
            <button
              onClick={() => {
                document.getElementById('eduven-lab-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              title={hasSimulation(nrId) ? 'Ir para o laboratorio interativo' : 'Laboratorio (em desenvolvimento)'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 9999,
                border: `1px solid ${accent}88`,
                background: `${accent}1A`,
                color: accent, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                fontFamily: 'inherit',
                boxShadow: hasSimulation(nrId) ? `0 0 12px ${accent}44` : 'none',
              }}
            >
              <FlaskConical size={14} />
              Laboratorio
            </button>
          )}

          {/* Fechar */}
          <button
            onClick={onClose}
            aria-label="Fechar aula"
            style={{
              background: 'transparent', border: '1px solid #1e293b', borderRadius: 8,
              color: '#94a3b8', cursor: 'pointer', padding: 6, display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ═══ BODY ═══ */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px 24px 60px' }}>
          {error && sections.length === 0 && (
            <div style={{ padding: '60px 24px', color: '#fca5a5', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Erro ao gerar a aula</div>
              <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>{error}</div>
            </div>
          )}

          {!error && stage1Loading && sections.length === 0 && (
            <div style={{ padding: '80px 24px', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, marginBottom: 24, marginInline: 'auto',
                borderRadius: '50%',
                border: `3px solid rgba(100,116,139,0.15)`,
                borderTopColor: accent,
                animation: 'spin 1.1s linear infinite',
                boxShadow: `0 0 40px ${accent}33`,
              }} />
              <div style={{ fontSize: 11, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
                Gerando aula adaptativa
              </div>
              <p style={{ fontSize: 13, color: '#64748b', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
                Lendo a NR e estruturando a primeira secao com exemplos do seu setor.
                A aula vai aparecer em alguns segundos.
              </p>
            </div>
          )}

          {sections.length > 0 && (
            <>
              <LessonView
                lessonId={lessonId}
                nrId={nrId}
                nrCode={nrCode}
                nrTitle={nrTitle}
                sectorSlug={sectorSlug}
                sectorName={sectorName}
                title={title}
                sections={sections}
                restLoading={restLoading}
                generationElapsed={elapsed}
              />

              {/* Laboratorio anchor + render */}
              <div id="eduven-lab-anchor" style={{ marginTop: 40 }}>
                <SimulationLab
                  nrId={nrId}
                  nrCode={nrCode}
                  nrTitle={nrTitle}
                  accentColor={accent}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes starGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(34,211,238,0.4)); color: #22d3ee; }
          25% { transform: scale(1.3); filter: drop-shadow(0 0 8px rgba(34,211,238,0.8)); color: #3b82f6; }
          50% { transform: scale(0.9); filter: drop-shadow(0 0 4px rgba(168,85,247,0.6)); color: #a855f7; }
          75% { transform: scale(1.2); filter: drop-shadow(0 0 6px rgba(236,72,153,0.7)); color: #ec4899; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  )
}

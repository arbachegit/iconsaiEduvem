'use client'

import { useRef, useState, useCallback, useMemo } from 'react'
import { LessonNavigation } from './education/LessonNavigation'
import { SvgComprehensionCheck } from './education/SvgComprehensionCheck'
import { TermModal, useTermModalStack } from './education/TermModal'
import { ExerciseWindow } from './education/ExerciseWindow'
import LabBanner from './education/LabBanner'
import PlayButton from './education/PlayButton'
import { getSectorMeta } from '@/lib/sectors-meta'
import { NR_CONCEPTUAL_TERMS } from '@/data/domain-configs/nr'
import { getSimulation } from '@/lib/nr-simulations'
import { trackEvent } from '@/lib/track-event'

export interface LessonSection {
  index: number
  titlePt: string
  content: string
  exerciseData?: {
    prompt: string
    exerciseType: string
    expectedSolution: Record<string, unknown>
    hints: string[]
    difficultyScore: number
  }
}

interface LessonViewProps {
  lessonId: number
  nrId: number
  nrCode: string
  nrTitle: string
  sectorSlug: string
  sectorName: string
  title: string
  sections: LessonSection[]
  exerciseIds?: Record<number, number>
  restLoading?: boolean
  generationElapsed?: number
}

export default function LessonView({
  lessonId, nrId, nrCode, nrTitle, sectorSlug, sectorName, title, sections,
  exerciseIds = {}, restLoading = false, generationElapsed = 0,
}: LessonViewProps) {
  // Simulacao vem do registro por nrId. useMemo pra ref estavel — sem isso, cada
  // re-render do LessonView (mudanca de currentSection, comprehension, etc) cria
  // um novo objeto literal e reseta o state interno do componente da simulacao.
  const registeredSim = getSimulation(nrId)
  const simulation = useMemo(
    () => !restLoading && registeredSim
      ? { title: registeredSim.title, subtitle: registeredSim.subtitle, Component: registeredSim.Component }
      : null,
    [restLoading, registeredSim]
  )
  const [currentSection, setCurrentSectionRaw] = useState(1)
  const navigateToSection = useCallback((newIndex: number) => {
    setCurrentSectionRaw(newIndex)
    trackEvent('section_view', { nrId, sectionIndex: newIndex })
  }, [nrId])
  const [comprehensionFeedback, setComprehensionFeedback] = useState<Record<number, boolean | undefined>>({})
  const [recapText, setRecapText] = useState<Record<number, string>>({})
  const [recapLoading, setRecapLoading] = useState<number | null>(null)
  const laboratoryRef = useRef<HTMLDivElement | null>(null)

  const meta = getSectorMeta(sectorSlug)
  const accent = meta?.color || '#22d3ee'

  const active = sections.find(s => s.index === currentSection)

  const termModals = useTermModalStack({
    lessonTopic: 'nr',
    lessonContext: active?.content?.slice(0, 300) || '',
    lessonId,
    sectionIndex: currentSection,
    nrCode,
    sectorSlug,
  })

  const handleComprehension = useCallback(async (sectionIndex: number, understood: boolean) => {
    setComprehensionFeedback(prev => ({ ...prev, [sectionIndex]: understood }))
    trackEvent('comprehension', { nrId, sectionIndex, understood })

    fetch('/api/eduven/comprehension', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: lessonId, section_index: sectionIndex, understood }),
    }).catch(() => {})

    if (!understood) {
      const section = sections.find(s => s.index === sectionIndex)
      if (!section) return
      setRecapLoading(sectionIndex)
      try {
        const res = await fetch('/api/eduven/comprehension', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: lessonId,
            section_index: sectionIndex,
            understood: false,
            section_title: section.titlePt,
            section_content: section.content,
          }),
        })
        const data = await res.json()
        if (data.recap) setRecapText(prev => ({ ...prev, [sectionIndex]: data.recap }))
      } catch { /* ignore */ }
      setRecapLoading(null)
    }
  }, [lessonId, nrId, sections])

  return (
    <>
      {/* ═══ LabBanner no TOPO do body — canon iconsaiStats ═══ */}
      <LabBanner
        laboratoryRef={laboratoryRef}
        simulation={simulation}
        isLoading={restLoading}
        elapsed={generationElapsed}
        simulationNotAvailable={!registeredSim && !restLoading}
      />

      {/* ═══ Sidebar + conteudo ═══ */}
      <div style={{ display: 'flex', gap: 24, maxWidth: 1200, margin: '0 auto', padding: '0 16px 24px' }}>
        <div style={{
          width: 240, flexShrink: 0, position: 'sticky', top: 24, alignSelf: 'flex-start',
          background: '#0c1320', borderRadius: 12, padding: 8, border: '1px solid #1e293b',
        }}>
          <div style={{ padding: '12px 14px', fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            {nrCode} / {sectorName}
          </div>
          <LessonNavigation
            currentSection={currentSection}
            comprehensionFeedback={comprehensionFeedback}
            onNavigate={navigateToSection}
            accentColor={accent}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {!active && restLoading && (
            <div style={{ padding: '60px 24px', color: accent, textAlign: 'center' }}>
              Gerando esta secao… pode continuar lendo a anterior.
            </div>
          )}
          {!active && !restLoading && (
            <div style={{ padding: '60px 24px', color: '#94a3b8', textAlign: 'center' }}>
              Secao indisponivel.
            </div>
          )}
          {active && (
            <div key={active.index}>
              {/* Header da secao com PlayButton */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
                padding: '0 4px',
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: accent,
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  Seção {active.index} — {active.titlePt}
                </div>
                <div style={{ flex: 1 }} />
                <PlayButton text={active.content} size={14} />
              </div>

              {/* Content com clickable terms */}
              <div
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  if (target.dataset.termLink) {
                    trackEvent('term_click', { nrId, term: target.dataset.termLink, sectionIndex: currentSection })
                    termModals.openTerm(target.dataset.termLink)
                  }
                }}
                style={{
                  background: '#0c1320', borderRadius: 12, padding: '28px 32px',
                  border: '1px solid #1e293b', fontSize: 15, lineHeight: 1.8, color: '#cbd5e1',
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdownWithTerms(active.content, accent) }}
              />

              {/* ExerciseWindow nas secoes 4 e 6 (canon) */}
              {active.exerciseData && exerciseIds[active.index] && (
                <ExerciseWindow
                  exerciseId={exerciseIds[active.index]}
                  prompt={active.exerciseData.prompt}
                  hints={active.exerciseData.hints}
                  expectedInputExample={
                    typeof (active.exerciseData.expectedSolution as { expectedInput?: unknown })?.expectedInput === 'string'
                      ? String((active.exerciseData.expectedSolution as { expectedInput: string }).expectedInput)
                      : undefined
                  }
                />
              )}

              {/* Comprehension check (sempre, exceto secao 6) */}
              {active.index < 6 && (
                <SvgComprehensionCheck
                  onFeedback={(u) => handleComprehension(active.index, u)}
                  disabled={comprehensionFeedback[active.index] !== undefined}
                />
              )}

              {/* Recap */}
              {recapLoading === active.index && (
                <div style={{
                  background: '#0c1320', border: '1px solid #f59e0b', borderRadius: 12,
                  padding: 24, marginTop: 16, color: '#fbbf24', fontSize: 14,
                }}>
                  Gerando recapitulação…
                </div>
              )}
              {recapText[active.index] && (
                <div style={{
                  background: '#0c1320', border: '1px solid #f59e0b', borderRadius: 12,
                  padding: 24, marginTop: 16,
                }}>
                  <div style={{
                    fontSize: 13, color: '#f59e0b', fontWeight: 700, marginBottom: 12,
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    Recapitulação — vamos de outro ângulo
                  </div>
                  <div
                    style={{ fontSize: 15, lineHeight: 1.8, color: '#cbd5e1' }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdownWithTerms(recapText[active.index], accent) }}
                  />
                </div>
              )}

              {/* Nav buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                {currentSection > 1 && (
                  <button
                    onClick={() => navigateToSection(currentSection - 1)}
                    style={{
                      padding: '10px 24px', borderRadius: 8, border: '1px solid #1e293b',
                      background: 'transparent', color: '#94a3b8', fontSize: 14, cursor: 'pointer',
                      fontWeight: 600, fontFamily: 'inherit',
                    }}
                  >
                    Anterior
                  </button>
                )}
                <div style={{ flex: 1 }} />
                {currentSection < 6 && sections.some(s => s.index === currentSection + 1) && (
                  <button
                    onClick={() => navigateToSection(currentSection + 1)}
                    style={{
                      padding: '10px 24px', borderRadius: 8, border: 'none',
                      background: accent, color: '#0a0e17', fontSize: 14, cursor: 'pointer',
                      fontWeight: 700, fontFamily: 'inherit',
                    }}
                  >
                    Próxima seção
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {termModals.loading && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 1250,
          background: '#0c1320', border: `1px solid ${accent}`, borderRadius: 8,
          padding: '8px 16px', fontSize: 12, color: accent,
        }}>
          Carregando conceito…
        </div>
      )}

      {termModals.stack.map((content, i) => (
        <TermModal
          key={`${content.term}-${i}`}
          content={content}
          stackLevel={i}
          onClose={termModals.closeTop}
          onTermClick={termModals.openTerm}
        />
      ))}
    </>
  )
}

function renderMarkdownWithTerms(md: string, accentColor: string): string {
  let html = md
    .replace(/\[(NR-\d+,[^\]]+)\]/g, `<span style="display:inline-block;padding:1px 8px;margin:0 2px;border-radius:4px;background:${accentColor}1A;color:${accentColor};font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;border:1px solid ${accentColor}33">$1</span>`)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#080c14;padding:14px;border-radius:8px;overflow-x:auto;border:1px solid #1e293b;margin:14px 0"><code style="color:#4ade80;font-family:\'JetBrains Mono\',monospace;font-size:13px;line-height:1.6">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#22d3ee;font-size:13px;font-family:\'JetBrains Mono\',monospace">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#e2e8f0;font-weight:700">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em style="color:#94a3b8;font-style:italic">$1</em>')
    .replace(/^### (.+)$/gm, '<h3 style="color:#e2e8f0;font-size:17px;font-weight:600;margin:24px 0 10px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#e2e8f0;font-size:20px;font-weight:700;margin:28px 0 14px">$1</h2>')
    .replace(/^[\-\*] (.+)$/gm, '<li style="margin:6px 0">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin:6px 0;list-style-type:decimal">$2</li>')

  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>(?:\s*<li[^>]*>[\s\S]*?<\/li>)*)/g, '<ul style="padding-left:24px;margin:12px 0">$1</ul>')
  html = html.split(/\n{2,}/).map(p => p.trim().startsWith('<') ? p : `<p style="margin:14px 0">${p}</p>`).join('\n')

  const sorted = [...NR_CONCEPTUAL_TERMS].sort((a, b) => b.length - a.length)
  for (const term of sorted) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(?<!data-term-link=")(?<![\\w])${escaped}(?![\\w])`, 'gi')
    html = html.replace(regex, (match) =>
      `<span data-term-link="${match}" style="color:${accentColor};cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px;text-decoration-color:${accentColor}88;font-weight:600">${match}</span>`
    )
  }
  return html
}

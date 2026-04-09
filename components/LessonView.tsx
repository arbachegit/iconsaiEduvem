'use client'

import { useState, useCallback } from 'react'
import { LessonNavigation } from './education/LessonNavigation'
import { SvgComprehensionCheck } from './education/SvgComprehensionCheck'
import { TermModal, useTermModalStack } from './education/TermModal'
import { getSectorMeta } from '@/lib/sectors-meta'
import { NR_CONCEPTUAL_TERMS } from '@/data/domain-configs/nr'
import { hasSimulation } from '@/lib/nr-simulations'
import AudioPlayer from './AudioPlayer'
import LabCallout from './LabCallout'

// Canon iconsaiStats: termos clicaveis na cor do accent (cyan no stats,
// cor do setor no eduven pra coerencia visual com o resto do modal).

export interface LessonSection {
  index: number
  titlePt: string
  content: string
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
  restLoading?: boolean
  /** Quantos segundos a aula esta gerando — usado pelo LabCallout em modo loading */
  generationElapsed?: number
}

export default function LessonView({
  lessonId, nrId, nrCode, nrTitle, sectorSlug, sectorName, title, sections, restLoading = false, generationElapsed = 0,
}: LessonViewProps) {
  const [currentSection, setCurrentSection] = useState(1)
  const [comprehensionFeedback, setComprehensionFeedback] = useState<Record<number, boolean | undefined>>({})
  const [recapText, setRecapText] = useState<Record<number, string>>({})
  const [recapLoading, setRecapLoading] = useState<number | null>(null)

  const meta = getSectorMeta(sectorSlug)
  const accent = meta?.color || '#22d3ee'

  const active = sections.find(s => s.index === currentSection)

  // Stacked term modals
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
        if (data.recap) {
          setRecapText(prev => ({ ...prev, [sectionIndex]: data.recap }))
        }
      } catch { /* ignore */ }
      setRecapLoading(null)
    }
  }, [lessonId, sections])

  return (
    <div style={{ display: 'flex', gap: 24, maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Sidebar */}
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
          onNavigate={setCurrentSection}
          accentColor={accent}
        />
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Lab callout banner — antes do conteudo */}
        <LabCallout
          color={accent}
          state={hasSimulation(nrId) ? (restLoading ? 'loading' : 'ready') : 'unavailable'}
          elapsed={generationElapsed}
          onClick={() => {
            document.getElementById('eduven-lab-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        />

        {!active && restLoading && (
          <div style={{
            background: '#0c1320', border: '1px solid #1e293b', borderRadius: 12,
            padding: '40px 32px', textAlign: 'center', color: accent,
          }}>
            Gerando esta secao... pode continuar lendo a anterior.
          </div>
        )}
        {!active && !restLoading && (
          <div style={{
            background: '#0c1320', border: '1px solid #1e293b', borderRadius: 12,
            padding: '40px 32px', textAlign: 'center', color: '#94a3b8',
          }}>
            Secao indisponivel.
          </div>
        )}
        {active && (
          <div key={active.index}>
            {/* Header da secao com AudioPlayer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
              padding: '0 4px',
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: accent,
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Secao {active.index} de 6
              </span>
              <div style={{ flex: 1 }} />
              <AudioPlayer text={active.content} color={accent} />
            </div>

            {/* Content with clickable terms */}
            <div
              onClick={(e) => {
                const target = e.target as HTMLElement
                if (target.dataset.termLink) termModals.openTerm(target.dataset.termLink)
              }}
              style={{
                background: '#0c1320', borderRadius: 12, padding: '28px 32px',
                border: '1px solid #1e293b', fontSize: 15, lineHeight: 1.8, color: '#cbd5e1',
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdownWithTerms(active.content, accent) }}
            />

            {/* Comprehension check (sempre, exceto secao 6) */}
            {active.index < 6 && (
              <SvgComprehensionCheck
                onFeedback={(understood) => handleComprehension(active.index, understood)}
                disabled={comprehensionFeedback[active.index] !== undefined}
              />
            )}

            {/* Recap */}
            {recapLoading === active.index && (
              <div style={{
                background: '#0c1320', border: '1px solid #f59e0b', borderRadius: 12,
                padding: 24, marginTop: 16, color: '#fbbf24', fontSize: 14,
              }}>
                Gerando recapitulacao...
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
                  Recapitulacao — vamos de outro angulo
                </div>
                <div
                  style={{ fontSize: 15, lineHeight: 1.8, color: '#cbd5e1' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdownWithTerms(recapText[active.index], accent) }}
                />
              </div>
            )}

            {/* Nav buttons */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 24,
            }}>
              {currentSection > 1 && (
                <button
                  onClick={() => setCurrentSection(currentSection - 1)}
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
                  onClick={() => setCurrentSection(currentSection + 1)}
                  style={{
                    padding: '10px 24px', borderRadius: 8, border: 'none',
                    background: accent, color: '#0a0e17', fontSize: 14, cursor: 'pointer',
                    fontWeight: 700, fontFamily: 'inherit',
                  }}
                >
                  Proxima secao
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Term loading indicator */}
      {termModals.loading && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 1250,
          background: '#0c1320', border: `1px solid ${accent}`, borderRadius: 8,
          padding: '8px 16px', fontSize: 12, color: accent,
        }}>
          Carregando conceito...
        </div>
      )}

      {/* Stacked term modals */}
      {termModals.stack.map((content, i) => (
        <TermModal
          key={`${content.term}-${i}`}
          content={content}
          stackLevel={i}
          onClose={termModals.closeTop}
          onTermClick={termModals.openTerm}
        />
      ))}
    </div>
  )
}

/** Markdown to HTML with clickable terms (NR_CONCEPTUAL_TERMS) and citation badges */
function renderMarkdownWithTerms(md: string, accentColor: string): string {
  let html = md
    // Citacoes [NR-X, item Y.Z] viram badges
    .replace(/\[(NR-\d+,[^\]]+)\]/g, `<span style="display:inline-block;padding:1px 8px;margin:0 2px;border-radius:4px;background:${accentColor}1A;color:${accentColor};font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;border:1px solid ${accentColor}33">$1</span>`)
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#080c14;padding:14px;border-radius:8px;overflow-x:auto;border:1px solid #1e293b;margin:14px 0"><code style="color:#4ade80;font-family:\'JetBrains Mono\',monospace;font-size:13px;line-height:1.6">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#22d3ee;font-size:13px;font-family:\'JetBrains Mono\',monospace">$1</code>')
    // Bold + italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#e2e8f0;font-weight:700">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em style="color:#94a3b8;font-style:italic">$1</em>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="color:#e2e8f0;font-size:17px;font-weight:600;margin:24px 0 10px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#e2e8f0;font-size:20px;font-weight:700;margin:28px 0 14px">$1</h2>')
    // Lists
    .replace(/^[\-\*] (.+)$/gm, '<li style="margin:6px 0">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin:6px 0;list-style-type:decimal">$2</li>')

  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>(?:\s*<li[^>]*>[\s\S]*?<\/li>)*)/g, '<ul style="padding-left:24px;margin:12px 0">$1</ul>')
  html = html.split(/\n{2,}/).map(p => p.trim().startsWith('<') ? p : `<p style="margin:14px 0">${p}</p>`).join('\n')

  // Clickable terms na cor do accent (canon iconsaiStats).
  // Sorted by length desc para casar termos compostos primeiro.
  const sorted = [...NR_CONCEPTUAL_TERMS].sort((a, b) => b.length - a.length)
  for (const term of sorted) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(?<!data-term-link=")(?<![\\w])${escaped}(?![\\w])`, 'gi')
    html = html.replace(regex, (match) =>
      `<span data-term-link="${match}" style="color:${accentColor};cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px;text-decoration-color:${accentColor}88;font-weight:600;transition:all 0.15s">${match}</span>`
    )
  }

  return html
}

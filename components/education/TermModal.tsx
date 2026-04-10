'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import PlayButton from './PlayButton'

/* ═══════════════════════════════════════════════════════════
   TermModal — Stackable pedagogical modals (porta 1:1 do stats)
   Endpoint adaptado: /api/ai/term-explain → /api/eduven/term-explain
   ═══════════════════════════════════════════════════════════ */

export interface TermModalContent {
  term: string
  whatIs: string
  howItWorks: string
  visualSvg?: string
  visualDescription?: string
  realExample: string
  whyItMatters: string
  lessonConnection: string
  relatedTerms?: string[]
}

interface TermModalProps {
  content: TermModalContent
  stackLevel: number
  onClose: () => void
  onTermClick: (term: string) => void
}

export function TermModal({ content, stackLevel, onClose, onTermClick }: TermModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const offset = stackLevel * 20

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0,
        background: `rgba(0, 0, 0, ${0.6 - stackLevel * 0.05})`,
        zIndex: 1300 + stackLevel,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        paddingTop: 60 + offset, paddingBottom: 40,
        overflowY: 'auto',
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: '#0c1320',
          border: '1px solid #1e293b',
          borderRadius: 16,
          width: '90%',
          maxWidth: 680,
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          boxShadow: `0 ${20 + stackLevel * 5}px ${40 + stackLevel * 10}px rgba(0,0,0,0.5)`,
          transform: `translateX(${offset}px)`,
        }}
      >
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #1e293b',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          position: 'sticky', top: 0, background: '#0c1320', zIndex: 1,
          borderRadius: '16px 16px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Conceito {stackLevel > 0 ? `(nivel ${stackLevel + 1})` : ''}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#22d3ee', margin: 0 }}>
                {content.term}
              </h2>
            </div>
            <div style={{ flexShrink: 0 }}>
              <PlayButton text={[content.whatIs, content.howItWorks, content.realExample, content.whyItMatters].filter(Boolean).join('. ')} size={14} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid #1e293b',
              background: 'transparent', color: '#64748b', fontSize: 18,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontFamily: 'inherit',
            }}
          >
            x
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <Section title="O que e" color="#22d3ee">
            <TermText text={content.whatIs} onTermClick={onTermClick} relatedTerms={content.relatedTerms} />
          </Section>
          <Section title="Como funciona" color="#818cf8">
            <TermText text={content.howItWorks} onTermClick={onTermClick} relatedTerms={content.relatedTerms} />
          </Section>
          {content.visualSvg && content.visualSvg.trim() && (
            <Section title="Visualizacao" color="#4ade80">
              <div style={{
                background: '#080c14', borderRadius: 8, padding: 20,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                overflow: 'hidden', maxWidth: '100%', maxHeight: 240,
                border: '1px solid #1e293b',
              }}>
                <div
                  style={{ width: '100%', maxWidth: 400, maxHeight: 200, display: 'block' }}
                  dangerouslySetInnerHTML={{ __html: content.visualSvg }}
                />
              </div>
            </Section>
          )}
          <Section title="Exemplo real" color="#fbbf24">
            <TermText text={content.realExample} onTermClick={onTermClick} relatedTerms={content.relatedTerms} />
          </Section>
          <Section title="Por que isso importa" color="#f97316">
            <TermText text={content.whyItMatters} onTermClick={onTermClick} relatedTerms={content.relatedTerms} />
          </Section>
          <Section title="Relacao com esta aula" color="#ec4899">
            <TermText text={content.lessonConnection} onTermClick={onTermClick} relatedTerms={content.relatedTerms} />
          </Section>
          {content.relatedTerms && content.relatedTerms.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1e293b' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Conceitos relacionados
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {content.relatedTerms.map(t => (
                  <button
                    key={t}
                    onClick={() => onTermClick(t)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, border: '1px solid #1e293b',
                      background: '#0f172a', color: '#22d3ee', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: '#cbd5e1' }}>
        {children}
      </div>
    </div>
  )
}

function TermText({ text, onTermClick, relatedTerms }: { text: string; onTermClick: (t: string) => void; relatedTerms?: string[] }) {
  if (!relatedTerms || relatedTerms.length === 0) return <span>{text}</span>
  const pattern = relatedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = relatedTerms.some(t => t.toLowerCase() === part.toLowerCase())
        if (isMatch) {
          return (
            <button
              key={i}
              onClick={() => onTermClick(part)}
              style={{
                background: 'none', border: 'none', padding: 0, margin: 0,
                color: '#22d3ee', fontWeight: 600, cursor: 'pointer',
                textDecoration: 'underline', textDecorationStyle: 'dotted',
                textUnderlineOffset: '3px', fontSize: 'inherit', fontFamily: 'inherit',
              }}
            >
              {part}
            </button>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════
   useTermModalStack — gerencia stack de modais empilhados
   Endpoint: /api/eduven/term-explain
   ═══════════════════════════════════════════════════════════ */

interface TermModalStackProps {
  lessonTopic: string
  lessonContext: string
  lessonId?: number
  sectionIndex?: number
  nrCode?: string         // ex: 'NR-35'
  sectorSlug?: string     // ex: 'construcao_civil'
}

interface StackEntry extends TermModalContent {
  __openedAt: number
}

export function useTermModalStack({
  lessonTopic, lessonContext, lessonId, sectionIndex, nrCode, sectorSlug,
}: TermModalStackProps) {
  const [stack, setStack] = useState<StackEntry[]>([])
  const [loading, setLoading] = useState(false)

  const openTerm = useCallback(async (term: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/eduven/term-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term,
          lessonContext,
          lesson_id: lessonId || 0,
          section_index: sectionIndex || 0,
          nr_code: nrCode,
          sector_slug: sectorSlug,
        }),
      })
      const data = await res.json()
      if (data.content) {
        setStack(prev => [...prev, { ...data.content, __openedAt: Date.now() }])
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [lessonContext, lessonId, sectionIndex, nrCode, sectorSlug])

  const closeTop = useCallback(() => {
    setStack(prev => prev.slice(0, -1))
  }, [])

  const closeAll = useCallback(() => setStack([]), [])

  return { stack, loading, openTerm, closeTop, closeAll }
}

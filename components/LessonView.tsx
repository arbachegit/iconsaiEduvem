'use client'

import { useState, useEffect } from 'react'
import { getSectorMeta } from '@/lib/sectors-meta'
import AudioPlayer from './AudioPlayer'

export interface LessonSection {
  index: number
  titlePt: string
  content: string
}

interface LessonViewProps {
  nrCode: string
  nrTitle: string
  sectorSlug: string
  sectorName: string
  title: string
  sections: LessonSection[]
  restLoading?: boolean
}

const SECTION_TITLES: Record<number, string> = {
  1: 'Por que isso importa?',
  2: 'Entendendo na pratica',
  3: 'Passo a passo',
  4: 'Exemplo com dados reais',
  5: 'Pontos fortes',
  6: 'Desafio Pratico',
}

export default function LessonView({
  nrCode, nrTitle, sectorSlug, sectorName, title, sections, restLoading = false,
}: LessonViewProps) {
  const [current, setCurrent] = useState(1)
  const meta = getSectorMeta(sectorSlug)
  const accentColor = meta?.color || '#00d4ff'
  const accentSoft = meta?.colorSoft || 'rgba(0,212,255,0.1)'

  const active = sections.find(s => s.index === current)
  const isPending = !active && restLoading && current > 1

  // Quando rest termina e o aluno esta numa secao que acabou de chegar, scroll top
  useEffect(() => {
    if (active) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [current, active])

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Sidebar com 6 secoes */}
      <nav style={{
        width: 220, flexShrink: 0, position: 'sticky', top: 24,
        background: '#0c1320', borderRadius: 12, padding: 8,
        border: '1px solid rgba(100,116,139,0.2)',
      }}>
        <div style={{ padding: '10px 12px 14px', fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
          Aula em 6 secoes
        </div>
        {[1, 2, 3, 4, 5, 6].map(idx => {
          const isActive = idx === current
          const isAvailable = sections.some(s => s.index === idx)
          const isLoading = !isAvailable && restLoading && idx > 1
          return (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              disabled={!isAvailable && !isLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                padding: '11px 14px', borderRadius: 8,
                background: isActive ? accentSoft : 'transparent',
                border: isActive ? `1px solid ${meta?.borderColor || accentColor}` : '1px solid transparent',
                color: isActive ? accentColor : isAvailable ? '#94a3b8' : '#475569',
                textAlign: 'left',
                cursor: !isAvailable && !isLoading ? 'not-allowed' : 'pointer',
                marginBottom: 4,
                opacity: isAvailable ? 1 : 0.6,
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: isActive ? accentColor : 'rgba(100,116,139,0.15)',
                color: isActive ? '#050d1a' : isAvailable ? '#94a3b8' : '#475569',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                position: 'relative',
              }}>
                {isLoading ? <span className="spin" style={{ fontSize: 10 }}>⟳</span> : idx}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>
                {SECTION_TITLES[idx]}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!active && isPending && (
          <div style={{
            background: '#0c1320', border: `1px solid ${accentColor}33`,
            borderRadius: 12, padding: '40px 32px', textAlign: 'center',
          }}>
            <div className="spin" style={{ display: 'inline-block', fontSize: 28, color: accentColor, marginBottom: 14 }}>⟳</div>
            <div style={{ color: accentColor, fontSize: 13, fontWeight: 700 }}>
              Esta secao ainda esta sendo gerada...
            </div>
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
              Pode continuar lendo a anterior. Volta aqui em alguns segundos.
            </div>
          </div>
        )}

        {!active && !isPending && (
          <div style={{
            background: '#0c1320', border: '1px solid rgba(100,116,139,0.2)',
            borderRadius: 12, padding: '40px 32px', textAlign: 'center', color: '#94a3b8',
          }}>
            Secao indisponivel.
          </div>
        )}

        {active && (
          <article
            key={active.index}
            className="fadeIn"
            style={{
              background: '#0c1320',
              border: '1px solid rgba(100,116,139,0.2)',
              borderRadius: 12, padding: '28px 32px',
              fontSize: 15, lineHeight: 1.8, color: '#cbd5e1',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
              paddingBottom: 14, borderBottom: '1px solid rgba(100,116,139,0.15)',
              flexWrap: 'wrap',
            }}>
              <span style={{
                fontSize: 11, color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Secao {active.index} de 6
              </span>
              <div style={{ flex: 1 }} />
              <AudioPlayer text={active.content} color={accentColor} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 18, lineHeight: 1.3 }}>
              {active.titlePt}
            </h2>
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(active.content, accentColor) }} />

            {/* Nav buttons */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 28,
              paddingTop: 18, borderTop: '1px solid rgba(100,116,139,0.15)',
            }}>
              <button
                onClick={() => setCurrent(c => Math.max(1, c - 1))}
                disabled={current === 1}
                style={{
                  padding: '9px 18px', borderRadius: 8,
                  background: 'transparent', border: '1px solid rgba(100,116,139,0.3)',
                  color: current === 1 ? '#475569' : '#94a3b8',
                  fontSize: 13, fontWeight: 600,
                  cursor: current === 1 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ← Anterior
              </button>
              <button
                onClick={() => setCurrent(c => Math.min(6, c + 1))}
                disabled={current === 6 || (!sections.some(s => s.index === current + 1) && !restLoading)}
                style={{
                  padding: '9px 18px', borderRadius: 8,
                  background: current === 6 ? 'transparent' : accentColor,
                  border: current === 6 ? '1px solid rgba(100,116,139,0.3)' : 'none',
                  color: current === 6 ? '#475569' : '#050d1a',
                  fontSize: 13, fontWeight: 700,
                  cursor: current === 6 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Proxima secao →
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}

/**
 * Markdown minimal → HTML, com badges nas citacoes [NR-X, item Y.Z].
 */
function renderMarkdown(md: string, accentColor: string): string {
  let html = md
    .replace(/\[(NR-\d+,[^\]]+)\]/g, `<span style="display:inline-block;padding:1px 8px;margin:0 2px;border-radius:4px;background:${accentColor}1A;color:${accentColor};font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;border:1px solid ${accentColor}33">$1</span>`)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#050d1a;padding:14px;border-radius:8px;overflow-x:auto;border:1px solid rgba(100,116,139,0.2);margin:14px 0"><code style="color:#4ade80;font-family:\'JetBrains Mono\',monospace;font-size:13px;line-height:1.6">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(100,116,139,0.15);padding:2px 6px;border-radius:4px;color:#22d3ee;font-size:13px;font-family:\'JetBrains Mono\',monospace">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#e2e8f0;font-weight:700">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em style="color:#94a3b8;font-style:italic">$1</em>')
    .replace(/^### (.+)$/gm, '<h3 style="color:#e2e8f0;font-size:17px;font-weight:600;margin:24px 0 10px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#e2e8f0;font-size:20px;font-weight:700;margin:28px 0 14px">$1</h2>')
    .replace(/^[\-\*] (.+)$/gm, '<li style="margin:6px 0">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin:6px 0;list-style-type:decimal">$2</li>')

  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>(?:\s*<li[^>]*>[\s\S]*?<\/li>)*)/g, '<ul style="padding-left:24px;margin:12px 0">$1</ul>')

  html = html
    .split(/\n{2,}/)
    .map(p => p.trim().startsWith('<') ? p : `<p style="margin:14px 0">${p}</p>`)
    .join('\n')

  return html
}

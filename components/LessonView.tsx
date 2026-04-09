'use client'

import { useState } from 'react'
import { getSectorMeta } from '@/lib/sectors-meta'

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
}

const SECTION_ICONS: Record<number, string> = {
  1: '?',
  2: '!',
  3: '·',
  4: '◆',
  5: '★',
  6: '►',
}

export default function LessonView({ nrCode, nrTitle, sectorSlug, sectorName, title, sections }: LessonViewProps) {
  const [current, setCurrent] = useState(1)
  const meta = getSectorMeta(sectorSlug)
  const accentColor = meta?.color || '#22d3ee'
  const accentSoft = meta?.colorSoft || 'rgba(34,211,238,0.1)'

  const active = sections.find(s => s.index === current)

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(100,116,139,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: accentColor,
            padding: '4px 10px', borderRadius: 6,
            background: accentSoft, border: `1px solid ${meta?.borderColor || 'transparent'}`,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {nrCode}
          </span>
          <span style={{ fontSize: 13, color: '#64748b' }}>·</span>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{sectorName}</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.2, marginBottom: 6 }}>
          {title}
        </h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>{nrTitle}</p>
      </div>

      {/* Layout: sidebar + content */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <nav style={{
          width: 240, flexShrink: 0, position: 'sticky', top: 88,
          background: '#0c1320', borderRadius: 12, padding: 8,
          border: '1px solid rgba(100,116,139,0.2)',
        }}>
          <div style={{ padding: '10px 12px 14px', fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            Aula em 6 secoes
          </div>
          {sections.map(s => {
            const isActive = s.index === current
            return (
              <button
                key={s.index}
                onClick={() => setCurrent(s.index)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '12px 14px', borderRadius: 8,
                  background: isActive ? accentSoft : 'transparent',
                  border: isActive ? `1px solid ${meta?.borderColor || accentColor}` : '1px solid transparent',
                  color: isActive ? accentColor : '#94a3b8',
                  textAlign: 'left', cursor: 'pointer',
                  marginBottom: 4,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: isActive ? accentColor : 'rgba(100,116,139,0.15)',
                  color: isActive ? '#050d1a' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {s.index}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                  {s.titlePt}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {active && (
            <article
              key={active.index}
              className="fadeIn"
              style={{
                background: '#0c1320',
                border: '1px solid rgba(100,116,139,0.2)',
                borderRadius: 12, padding: '32px 36px',
                fontSize: 15, lineHeight: 1.8, color: '#cbd5e1',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
                paddingBottom: 14, borderBottom: '1px solid rgba(100,116,139,0.15)',
              }}>
                <span style={{
                  fontSize: 11, color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  Secao {active.index} de 6
                </span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 18, lineHeight: 1.3 }}>
                {active.titlePt}
              </h2>
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(active.content, accentColor) }} />

              {/* Nav */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 32,
                paddingTop: 20, borderTop: '1px solid rgba(100,116,139,0.15)',
              }}>
                <button
                  onClick={() => setCurrent(c => Math.max(1, c - 1))}
                  disabled={current === 1}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    background: 'transparent',
                    border: '1px solid rgba(100,116,139,0.3)',
                    color: current === 1 ? '#475569' : '#94a3b8',
                    fontSize: 14, fontWeight: 600,
                    cursor: current === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setCurrent(c => Math.min(6, c + 1))}
                  disabled={current === 6}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    background: current === 6 ? 'transparent' : accentColor,
                    border: current === 6 ? '1px solid rgba(100,116,139,0.3)' : 'none',
                    color: current === 6 ? '#475569' : '#050d1a',
                    fontSize: 14, fontWeight: 700,
                    cursor: current === 6 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Proxima secao →
                </button>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Markdown minimal → HTML, com destaque pras citacoes [NR-X, item Y.Z].
 * Sem clickable terms ainda (vai entrar na Fase 5.3).
 */
function renderMarkdown(md: string, accentColor: string): string {
  let html = md
    // Citacoes [NR-X, item Y.Z] viram badge inline
    .replace(/\[(NR-\d+,[^\]]+)\]/g, `<span style="display:inline-block;padding:1px 8px;margin:0 2px;border-radius:4px;background:${accentColor}1A;color:${accentColor};font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;border:1px solid ${accentColor}33">$1</span>`)
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#050d1a;padding:14px;border-radius:8px;overflow-x:auto;border:1px solid rgba(100,116,139,0.2);margin:14px 0"><code style="color:#4ade80;font-family:\'JetBrains Mono\',monospace;font-size:13px;line-height:1.6">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:rgba(100,116,139,0.15);padding:2px 6px;border-radius:4px;color:#22d3ee;font-size:13px;font-family:\'JetBrains Mono\',monospace">$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#e2e8f0;font-weight:700">$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em style="color:#94a3b8;font-style:italic">$1</em>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="color:#e2e8f0;font-size:17px;font-weight:600;margin:24px 0 10px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#e2e8f0;font-size:20px;font-weight:700;margin:28px 0 14px">$1</h2>')
    // List items
    .replace(/^[\-\*] (.+)$/gm, '<li style="margin:6px 0">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin:6px 0;list-style-type:decimal">$2</li>')

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>(?:\s*<li[^>]*>[\s\S]*?<\/li>)*)/g, '<ul style="padding-left:24px;margin:12px 0">$1</ul>')

  // Paragraphs
  html = html
    .split(/\n{2,}/)
    .map(p => p.trim().startsWith('<') ? p : `<p style="margin:14px 0">${p}</p>`)
    .join('\n')

  return html
}

'use client'

import { useState } from 'react'
import { getSectorMeta } from '@/lib/sectors-meta'
import LessonModal from './LessonModal'

interface NRWithRelevance {
  id: number
  code: string
  title: string
  status: string
  current_portaria: string | null
  relevance: number
  rationale: string | null
}

interface NRGridProps {
  nrs: NRWithRelevance[]
  sectorSlug: string
  sectorName: string
}

const RELEVANCE_LABEL: Record<number, string> = {
  5: 'Critica',
  4: 'Muito relevante',
  3: 'Relevante',
  2: 'Ocasional',
  1: 'Tangencial',
  0: 'Irrelevante',
}

export default function NRGrid({ nrs, sectorSlug, sectorName }: NRGridProps) {
  const [openNR, setOpenNR] = useState<NRWithRelevance | null>(null)
  const meta = getSectorMeta(sectorSlug)
  const accentColor = meta?.color || '#22d3ee'

  const critical   = nrs.filter(n => n.relevance >= 4)
  const relevant   = nrs.filter(n => n.relevance === 3)
  const occasional = nrs.filter(n => n.relevance > 0 && n.relevance < 3)

  return (
    <>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: '#e2e8f0', marginBottom: 8, lineHeight: 1.2 }}>
            NRs para {sectorName}
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8' }}>
            {nrs.length} normas aplicaveis ao setor, ordenadas por relevancia. Click numa pra abrir a aula adaptativa.
          </p>
        </div>

        {critical.length > 0 && (
          <Section title="Criticas e muito relevantes" subtitle="Sao a base da seguranca neste setor. Comece por aqui." color={accentColor} nrs={critical} onOpen={setOpenNR} />
        )}
        {relevant.length > 0 && (
          <Section title="Relevantes" subtitle="Aplicam-se a parte significativa do dia-a-dia." color="#94a3b8" nrs={relevant} onOpen={setOpenNR} />
        )}
        {occasional.length > 0 && (
          <Section title="Ocasionais e tangenciais" subtitle="Tocam o setor em situacoes especificas." color="#475569" nrs={occasional} onOpen={setOpenNR} />
        )}
        {nrs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>
            Nenhuma NR classificada para este setor ainda.
          </div>
        )}
      </div>

      {openNR && (
        <LessonModal
          nrId={openNR.id}
          nrCode={openNR.code}
          nrTitle={openNR.title}
          sectorSlug={sectorSlug}
          sectorName={sectorName}
          onClose={() => setOpenNR(null)}
        />
      )}
    </>
  )
}

function Section({ title, subtitle, color, nrs, onOpen }: {
  title: string
  subtitle: string
  color: string
  nrs: NRWithRelevance[]
  onOpen: (nr: NRWithRelevance) => void
}) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${color}33` }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{subtitle}</p>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 14,
      }}>
        {nrs.map((nr, idx) => (
          <NRCard key={nr.id} nr={nr} color={color} onOpen={onOpen} delay={idx * 0.15} />
        ))}
      </div>
    </div>
  )
}

function NRCard({ nr, color, onOpen, delay }: {
  nr: NRWithRelevance
  color: string
  onOpen: (nr: NRWithRelevance) => void
  delay: number
}) {
  // Cor mais intensa para criticas (relevance >= 4)
  const isHighlight = nr.relevance >= 4
  return (
    <button
      onClick={() => onOpen(nr)}
      className="nr-card"
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'block', textAlign: 'left',
        background: '#0c1320',
        border: `1px solid ${color}33`,
        borderRadius: 12,
        padding: '18px 20px',
        cursor: 'pointer', fontFamily: 'inherit',
        width: '100%',
        // CSS variables consumidas pelas classes .nr-card
        ['--nr-color' as never]: color,
        ['--nr-delay' as never]: `${delay}s`,
      }}
    >
      {/* Shimmer line animation — passa por cima do card a cada ciclo */}
      <span className="nr-shimmer" aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `linear-gradient(115deg, transparent 40%, ${color}1F 50%, transparent 60%)`,
        backgroundSize: '250% 100%',
      }} />

      {/* Glow border pulsante — so para criticas (>=4) */}
      {isHighlight && (
        <span className="nr-glow" aria-hidden style={{
          position: 'absolute', inset: -1, borderRadius: 12, pointerEvents: 'none',
          boxShadow: `0 0 0 1px ${color}66, 0 0 16px ${color}33`,
        }} />
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span
          className="nr-code"
          style={{
            fontSize: 14, fontWeight: 700, color,
            fontFamily: "'JetBrains Mono', monospace",
            textShadow: `0 0 10px ${color}66`,
          }}
        >
          {nr.code}
        </span>
        <RelevanceBadge relevance={nr.relevance} />
      </div>
      <h3 style={{ position: 'relative', fontSize: 14, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4, marginBottom: 8 }}>
        {nr.title}
      </h3>
      {nr.rationale && (
        <p style={{ position: 'relative', fontSize: 12, color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic' }}>
          {nr.rationale}
        </p>
      )}

      <style>{`
        .nr-card {
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .nr-card:hover {
          transform: translateY(-3px);
          border-color: var(--nr-color);
          box-shadow: 0 8px 28px rgba(0,0,0,0.4), 0 0 0 1px var(--nr-color);
        }
        @keyframes nr-shimmer-anim {
          0%, 100% { background-position: -100% 0; opacity: 0; }
          15% { opacity: 1; }
          50% { background-position: 100% 0; opacity: 1; }
          65% { opacity: 0; }
        }
        .nr-shimmer {
          animation: nr-shimmer-anim 5s ease-in-out infinite;
          animation-delay: var(--nr-delay);
        }
        @keyframes nr-glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .nr-glow {
          animation: nr-glow-pulse 3.5s ease-in-out infinite;
          animation-delay: var(--nr-delay);
        }
        @keyframes nr-code-pulse {
          0%, 100% { text-shadow: 0 0 6px var(--nr-color); }
          50% { text-shadow: 0 0 16px var(--nr-color), 0 0 24px var(--nr-color); }
        }
        .nr-card .nr-code {
          animation: nr-code-pulse 4s ease-in-out infinite;
          animation-delay: var(--nr-delay);
        }
      `}</style>
    </button>
  )
}

function RelevanceBadge({ relevance }: { relevance: number }) {
  const colors: Record<number, { bg: string; fg: string }> = {
    5: { bg: 'rgba(239,68,68,0.15)', fg: '#fca5a5' },
    4: { bg: 'rgba(249,115,22,0.15)', fg: '#fdba74' },
    3: { bg: 'rgba(34,197,94,0.15)', fg: '#86efac' },
    2: { bg: 'rgba(100,116,139,0.15)', fg: '#94a3b8' },
    1: { bg: 'rgba(100,116,139,0.10)', fg: '#64748b' },
    0: { bg: 'rgba(100,116,139,0.05)', fg: '#475569' },
  }
  const c = colors[relevance] || colors[0]
  return (
    <span style={{
      fontSize: 10, fontWeight: 700,
      padding: '3px 8px', borderRadius: 999,
      background: c.bg, color: c.fg,
      textTransform: 'uppercase', letterSpacing: 0.5,
    }}>
      {RELEVANCE_LABEL[relevance]}
    </span>
  )
}

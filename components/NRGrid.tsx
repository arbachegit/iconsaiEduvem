'use client'

import { useState } from 'react'
import { Sprout, Mountain, Flame, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { getSectorMeta } from '@/lib/sectors-meta'
import type { NRProgress } from '@/lib/student-progress'
import LessonModal from './LessonModal'
import NRAnimation from './NRAnimation'
import PlayButton from './education/PlayButton'

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
  progress?: Record<number, NRProgress>
}

type TierMeta = {
  label: string
  short: string
  hazard: boolean
  tint: string
  glyph: string
}

const RELEVANCE_TIER: Record<number, TierMeta> = {
  5: { label: 'CRÍTICA',     short: 'NV-5', hazard: true,  tint: '#ef4444', glyph: '▲▲▲▲▲' },
  4: { label: 'ALTA',        short: 'NV-4', hazard: true,  tint: '#f97316', glyph: '▲▲▲▲·' },
  3: { label: 'RELEVANTE',   short: 'NV-3', hazard: false, tint: '#eab308', glyph: '▲▲▲··' },
  2: { label: 'OCASIONAL',   short: 'NV-2', hazard: false, tint: '#64748b', glyph: '▲▲···' },
  1: { label: 'TANGENCIAL',  short: 'NV-1', hazard: false, tint: '#475569', glyph: '▲····' },
  0: { label: 'ARQUIVADA',   short: 'NV-0', hazard: false, tint: '#334155', glyph: '·····' },
}

export default function NRGrid({ nrs, sectorSlug, sectorName, progress = {} }: NRGridProps) {
  const [openNR, setOpenNR] = useState<NRWithRelevance | null>(null)
  const meta = getSectorMeta(sectorSlug)
  const accentColor = meta?.color || '#22d3ee'

  const critical   = nrs.filter(n => n.relevance >= 4)
  const relevant   = nrs.filter(n => n.relevance === 3)
  const occasional = nrs.filter(n => n.relevance > 0 && n.relevance < 3)

  return (
    <>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 24px 96px' }}>
        {/* ═══ HEADER DO CATALOGO ═══ */}
        <header style={{ marginBottom: 40, position: 'relative' }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: accentColor, opacity: 0.75,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.22em', textTransform: 'uppercase',
            marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              width: 28, height: 1, background: accentColor, opacity: 0.6,
            }} />
            CATÁLOGO DE DOSSIÊS REGULATÓRIOS · MTE / CNAE
          </div>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 40, fontWeight: 800,
            color: '#f1f5f9', lineHeight: 1.04,
            letterSpacing: '-0.02em',
            marginBottom: 14,
          }}>
            Normas para <span style={{ color: accentColor }}>{sectorName}</span>
          </h1>

          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap',
            fontSize: 13, color: '#94a3b8',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            <span>
              <strong style={{
                color: '#e2e8f0',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
              }}>{String(nrs.length).padStart(2, '0')}</strong> normas aplicáveis
            </span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>ordenadas por nível de criticidade</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ fontStyle: 'italic' }}>clique para abrir o dossiê</span>
          </div>
        </header>

        {critical.length > 0 && (
          <Section tier="critical" title="Crítica · Alta" subtitle="Base da segurança neste setor. Comece por aqui." color={accentColor} nrs={critical} onOpen={setOpenNR} progress={progress} />
        )}
        {relevant.length > 0 && (
          <Section tier="relevant" title="Relevante" subtitle="Aplica-se a parte significativa do dia-a-dia." color={accentColor} nrs={relevant} onOpen={setOpenNR} progress={progress} />
        )}
        {occasional.length > 0 && (
          <Section tier="occasional" title="Ocasional · Tangencial" subtitle="Tocam o setor em situações específicas." color={accentColor} nrs={occasional} onOpen={setOpenNR} progress={progress} />
        )}

        {nrs.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            color: '#64748b',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.12em',
            border: '1px dashed rgba(100,116,139,0.3)',
            borderRadius: 12,
          }}>
            NENHUMA NORMA CLASSIFICADA PARA ESTE SETOR AINDA.
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

function Section({ tier, title, subtitle, color, nrs, onOpen, progress = {} }: {
  tier: 'critical' | 'relevant' | 'occasional'
  title: string
  subtitle: string
  color: string
  nrs: NRWithRelevance[]
  onOpen: (nr: NRWithRelevance) => void
  progress?: Record<number, NRProgress>
}) {
  const tierTint = tier === 'critical' ? color : tier === 'relevant' ? '#cbd5e1' : '#64748b'

  return (
    <section style={{ marginBottom: 52 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 14,
        marginBottom: 20, paddingBottom: 10,
        borderBottom: `1px solid ${tierTint}26`,
      }}>
        <span style={{
          display: 'inline-block', width: 12, height: 12,
          border: `2px solid ${tierTint}`,
          borderRadius: 2,
          transform: 'rotate(45deg)',
          flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12, fontWeight: 700,
            color: tierTint,
            textTransform: 'uppercase', letterSpacing: '0.25em',
            lineHeight: 1,
            marginBottom: 6,
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: 13, color: '#64748b',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontStyle: 'italic',
          }}>
            {subtitle}
          </p>
        </div>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, color: `${tierTint}aa`,
          letterSpacing: '0.1em',
        }}>
          [ {String(nrs.length).padStart(2, '0')} ]
        </span>
      </div>

      <div className="nr-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: 18,
      }}>
        {nrs.map((nr, idx) => (
          <NRCard
            key={nr.id}
            nr={nr}
            sectorColor={color}
            onOpen={onOpen}
            delay={idx * 0.08}
            progress={progress[nr.id]}
          />
        ))}
      </div>
    </section>
  )
}

function NRCard({ nr, sectorColor, onOpen, delay, progress }: {
  nr: NRWithRelevance
  sectorColor: string
  onOpen: (nr: NRWithRelevance) => void
  delay: number
  progress?: NRProgress
}) {
  const tier = RELEVANCE_TIER[nr.relevance] || RELEVANCE_TIER[0]
  const accent = tier.hazard ? tier.tint : sectorColor
  const p = progress
  const hasActivity = !!p && p.totalSessions > 0
  const dossierNum = String(nr.id).padStart(3, '0')

  const maxDiffCount = Math.max(1, p?.easierCount || 0, p?.sameCount || 0, p?.harderCount || 0)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(nr)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(nr)
        }
      }}
      className="nr-card"
      aria-label={`Abrir dossiê ${nr.code}: ${nr.title}`}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        textAlign: 'left',
        background:
          'linear-gradient(180deg, #0c1425 0%, #070d1a 100%)',
        border: `1px solid ${accent}33`,
        borderRadius: 4,
        cursor: 'pointer', fontFamily: 'inherit',
        width: '100%', minHeight: 400,
        padding: 0,
        isolation: 'isolate',
        ['--nr-color' as never]: accent,
        ['--nr-delay' as never]: `${delay}s`,
        animation: `nr-card-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* ═══ HAZARD STRIPE (borda esquerda) ═══ */}
      <span aria-hidden className="nr-hazard-stripe" style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 8,
        background: tier.hazard
          ? `repeating-linear-gradient(135deg, ${tier.tint} 0 10px, #0a0a0a 10px 20px)`
          : accent,
        opacity: tier.hazard ? 0.92 : 0.6,
        zIndex: 2,
      }} />

      {/* ═══ PAPEL DE FUNDO (noise + blueprint) ═══ */}
      <span aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          radial-gradient(ellipse at top left, ${accent}14 0%, transparent 55%),
          radial-gradient(ellipse at bottom right, ${accent}08 0%, transparent 60%)
        `,
      }} />
      <span aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 0, opacity: 0.35,
        backgroundImage: `
          linear-gradient(${accent}0f 1px, transparent 1px),
          linear-gradient(90deg, ${accent}0f 1px, transparent 1px)
        `,
        backgroundSize: '22px 22px',
        maskImage: 'radial-gradient(ellipse at 70% 25%, #000 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 70% 25%, #000 0%, transparent 70%)',
      }} />

      {/* ═══ SHIMMER SWEEP ═══ */}
      <span className="nr-shimmer" aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: `linear-gradient(115deg, transparent 40%, ${accent}22 50%, transparent 60%)`,
        backgroundSize: '250% 100%',
      }} />

      {/* ═══ VIEWFINDER BRACKETS ═══ */}
      <Bracket pos="tr" color={accent} />
      <Bracket pos="br" color={accent} />

      {/* ═══ META ROW (topo) ═══ */}
      <div style={{
        position: 'relative', zIndex: 3,
        padding: '14px 18px 0 24px',
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.18em',
      }}>
        <span style={{ color: `${accent}cc` }}>
          DOSSIÊ №{dossierNum}
        </span>
        <span style={{ color: '#475569' }}>·</span>
        <span style={{
          color: tier.tint,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <span aria-hidden>{tier.glyph}</span>
          {tier.label}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{
          color: '#475569',
          fontSize: 9,
        }}>
          {tier.short}
        </span>
      </div>

      {/* ═══ HEADER: CODE + ICON ═══ */}
      <div style={{
        position: 'relative', zIndex: 3,
        padding: '18px 18px 10px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <div className="nr-code-xl" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 38, fontWeight: 800,
            color: '#f1f5f9',
            lineHeight: 1, letterSpacing: '-0.02em',
            textShadow: `0 0 24px ${accent}40`,
            display: 'inline-block',
          }}>
            {nr.code}
          </div>
        </div>

        <div style={{
          position: 'relative',
          width: 76, height: 76,
          borderRadius: 6,
          background: `radial-gradient(circle at 40% 35%, ${accent}18 0%, ${accent}04 60%, transparent 100%)`,
          border: `1px solid ${accent}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* crosshair lines (instrument panel feel) */}
          <span aria-hidden style={{
            position: 'absolute', left: 0, right: 0, top: '50%', height: 1,
            background: `${accent}22`,
          }} />
          <span aria-hidden style={{
            position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1,
            background: `${accent}22`,
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <NRAnimation nrId={nr.id} color={accent} size={58} />
          </div>
        </div>
      </div>

      {/* ═══ ACCENT RULE ═══ */}
      <div style={{
        position: 'relative', zIndex: 3,
        margin: '4px 18px 0 24px',
        height: 2,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ flex: 1, height: 1, background: `${accent}55` }} />
        <span style={{ width: 4, height: 4, background: accent, borderRadius: 1 }} />
        <span style={{ width: 18, height: 1, background: `${accent}22` }} />
      </div>

      {/* ═══ TITLE + RATIONALE ═══ */}
      <div style={{
        position: 'relative', zIndex: 3,
        padding: '14px 20px 12px 24px',
        flex: 1,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 14, fontWeight: 700,
          color: '#e2e8f0',
          lineHeight: 1.3,
          letterSpacing: '0.01em',
          textTransform: 'uppercase',
        }}>
          {nr.title}
        </h3>

        {nr.rationale && (
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 12, fontWeight: 500,
            color: '#94a3b8',
            lineHeight: 1.55,
            fontStyle: 'italic',
            position: 'relative',
            paddingLeft: 10,
            borderLeft: `2px solid ${accent}33`,
          }}>
            {nr.rationale}
          </p>
        )}
      </div>

      {/* ═══ PERFORATION DIVIDER ═══ */}
      <div aria-hidden style={{
        position: 'relative', zIndex: 3,
        margin: '0 20px 0 24px',
        height: 1,
        backgroundImage: `repeating-linear-gradient(90deg, ${accent}44 0 4px, transparent 4px 9px)`,
        backgroundSize: '9px 1px',
      }} />

      {/* ═══ FOOTER DE PROGRESSO ═══ */}
      <div style={{
        position: 'relative', zIndex: 3,
        padding: '12px 20px 14px 24px',
      }}>
        {/* Barras de dificuldade — mini bar graph */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10, marginBottom: 10,
        }}>
          <DiffBar icon={Sprout} label="FÁCIL"  count={p?.easierCount || 0} max={maxDiffCount} color="#4ade80" />
          <DiffBar icon={Mountain} label="MÉDIO"  count={p?.sameCount   || 0} max={maxDiffCount} color="#facc15" />
          <DiffBar icon={Flame}   label="FORTE"  count={p?.harderCount || 0} max={maxDiffCount} color="#fb923c" />
        </div>

        {/* Chips de checklist */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 4,
          marginBottom: 12,
        }}>
          <Chip done={p?.exerciseDone} label="EX" />
          <Chip done={p?.labInteracted} label="LAB" />
          <Chip done={(p?.sectionsViewed || 0) >= 6} label="6·SEC" />
          <Chip done={(p?.termsClicked || 0) > 0} label={`${p?.termsClicked || 0}·TRM`} />
        </div>

        {/* CTA + PlayButton */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 700,
            color: accent,
            textTransform: 'uppercase', letterSpacing: '0.14em',
          }}>
            <ArrowUpRight size={13} strokeWidth={2.5} className="nr-cta-arrow" />
            {hasActivity ? 'Continuar dossiê' : 'Abrir dossiê'}
          </div>
          <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
            <PlayButton text={`${nr.code}. ${nr.title}. ${nr.rationale || ''}`} size={12} />
          </div>
        </div>
      </div>

      {/* ═══ STAMP "INSPECIONADO" (quando completo) ═══ */}
      {p?.completed && (
        <span aria-label="Dossiê completo" className="nr-stamp" style={{
          position: 'absolute', top: 58, right: -18,
          zIndex: 4, pointerEvents: 'none',
          padding: '6px 22px',
          fontFamily: "'Caveat', cursive",
          fontSize: 26, fontWeight: 700,
          color: '#4ade80',
          border: '2px solid #4ade80',
          borderRadius: 4,
          transform: 'rotate(-10deg)',
          background: 'rgba(74,222,128,0.06)',
          textShadow: '0 0 4px rgba(74,222,128,0.4)',
          letterSpacing: '0.04em',
          boxShadow: '0 0 0 2px rgba(74,222,128,0.12)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <CheckCircle2 size={16} strokeWidth={2.5} />
          Inspecionado
        </span>
      )}
    </div>
  )
}

/* ─────────────── helpers ─────────────── */

function Bracket({ pos, color }: { pos: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const size = 12
  const thickness = 1.5
  const common: React.CSSProperties = {
    position: 'absolute', width: size, height: size,
    pointerEvents: 'none', zIndex: 2,
    borderColor: `${color}88`,
    borderStyle: 'solid',
    borderWidth: 0,
  }
  const styles: Record<string, React.CSSProperties> = {
    tl: { ...common, top: 6, left: 14, borderTopWidth: thickness, borderLeftWidth: thickness },
    tr: { ...common, top: 6, right: 6, borderTopWidth: thickness, borderRightWidth: thickness },
    bl: { ...common, bottom: 6, left: 14, borderBottomWidth: thickness, borderLeftWidth: thickness },
    br: { ...common, bottom: 6, right: 6, borderBottomWidth: thickness, borderRightWidth: thickness },
  }
  return <span aria-hidden style={styles[pos]} />
}

function DiffBar({ icon: Icon, label, count, max, color }: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  count: number
  max: number
  color: string
}) {
  const active = count > 0
  const pct = Math.min(1, count / max)
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      opacity: active ? 1 : 0.35,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9, fontWeight: 600,
        letterSpacing: '0.1em',
        color: active ? color : '#475569',
      }}>
        <Icon size={10} />
        <span>{label}</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: active ? '#e2e8f0' : '#475569' }}>
          {String(count).padStart(2, '0')}
        </span>
      </div>
      <div style={{
        height: 3, borderRadius: 1,
        background: `${color}1a`,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <span style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: `${pct * 100}%`,
          background: color,
          boxShadow: active ? `0 0 6px ${color}66` : 'none',
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
    </div>
  )
}

function Chip({ done, label }: { done?: boolean; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 6px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 9, fontWeight: 600,
      letterSpacing: '0.1em',
      color: done ? '#4ade80' : '#475569',
      border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : 'rgba(71,85,105,0.3)'}`,
      borderRadius: 2,
      background: done ? 'rgba(74,222,128,0.06)' : 'transparent',
    }}>
      <span aria-hidden style={{ opacity: done ? 1 : 0.4 }}>
        {done ? '✓' : '·'}
      </span>
      {label}
    </span>
  )
}

'use client'

import { useState } from 'react'
import { Sprout, Mountain, Flame, FlaskConical, BookOpen, CheckCircle2 } from 'lucide-react'
import { getSectorMeta } from '@/lib/sectors-meta'
import type { NRProgress } from '@/lib/student-progress'
import LessonModal from './LessonModal'
import NRAnimation from './NRAnimation'

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

const RELEVANCE_LABEL: Record<number, string> = {
  5: 'Critica',
  4: 'Muito relevante',
  3: 'Relevante',
  2: 'Ocasional',
  1: 'Tangencial',
  0: 'Irrelevante',
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
          <Section title="Criticas e muito relevantes" subtitle="Sao a base da seguranca neste setor. Comece por aqui." color={accentColor} nrs={critical} onOpen={setOpenNR} progress={progress} />
        )}
        {relevant.length > 0 && (
          <Section title="Relevantes" subtitle="Aplicam-se a parte significativa do dia-a-dia." color="#94a3b8" nrs={relevant} onOpen={setOpenNR} progress={progress} />
        )}
        {occasional.length > 0 && (
          <Section title="Ocasionais e tangenciais" subtitle="Tocam o setor em situacoes especificas." color="#475569" nrs={occasional} onOpen={setOpenNR} progress={progress} />
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

function Section({ title, subtitle, color, nrs, onOpen, progress = {} }: {
  title: string
  subtitle: string
  color: string
  nrs: NRWithRelevance[]
  onOpen: (nr: NRWithRelevance) => void
  progress?: Record<number, NRProgress>
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
          <NRCard key={nr.id} nr={nr} color={color} onOpen={onOpen} delay={idx * 0.15} progress={progress[nr.id]} />
        ))}
      </div>
    </div>
  )
}

function NRCard({ nr, color, onOpen, delay, progress }: {
  nr: NRWithRelevance
  color: string
  onOpen: (nr: NRWithRelevance) => void
  delay: number
  progress?: NRProgress
}) {
  const p = progress
  const hasActivity = p && p.totalSessions > 0

  return (
    <button
      onClick={() => onOpen(nr)}
      className="nr-card"
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        textAlign: 'left',
        background: '#0c1320',
        border: `1px solid ${hasActivity ? `${color}66` : `${color}33`}`,
        borderRadius: 14,
        cursor: 'pointer', fontFamily: 'inherit',
        width: '100%', minHeight: 380,
        ['--nr-color' as never]: color,
        ['--nr-delay' as never]: `${delay}s`,
      }}
    >
      {/* ═══ ANIMATION BANNER (topo) ═══ */}
      <div style={{
        position: 'relative',
        width: '100%', height: 130,
        background: `linear-gradient(135deg, ${color}1A 0%, ${color}08 50%, transparent 100%)`,
        borderBottom: `1px solid ${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, opacity: 0.4,
          backgroundImage: `radial-gradient(${color}22 1px, transparent 1px)`,
          backgroundSize: '14px 14px',
        }} />
        <span className="nr-shimmer" aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(115deg, transparent 40%, ${color}33 50%, transparent 60%)`,
          backgroundSize: '250% 100%',
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <NRAnimation nrId={nr.id} color={color} size={88} />
        </div>
        <div style={{ position: 'absolute', top: 10, right: 12, zIndex: 3 }}>
          <RelevanceBadge relevance={nr.relevance} />
        </div>
        <div style={{ position: 'absolute', top: 10, left: 12, zIndex: 3 }}>
          <span className="nr-code" style={{
            fontSize: 12, fontWeight: 800, color,
            fontFamily: "'JetBrains Mono', monospace",
            textShadow: `0 0 12px ${color}88`,
            padding: '3px 8px', borderRadius: 6,
            background: `${color}1A`, border: `1px solid ${color}55`,
          }}>
            {nr.code}
          </span>
        </div>
        {/* Badge de completude no canto inferior direito do banner */}
        {p?.completed && (
          <div style={{
            position: 'absolute', bottom: 8, right: 12, zIndex: 3,
            background: '#4ade8022', border: '1px solid #4ade8066',
            borderRadius: 6, padding: '2px 8px',
            fontSize: 10, fontWeight: 700, color: '#4ade80',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <CheckCircle2 size={10} /> Completa
          </div>
        )}
      </div>

      {/* ═══ CONTEUDO ═══ */}
      <div style={{ padding: '14px 18px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.35, marginBottom: 8 }}>
          {nr.title}
        </h3>
        {nr.rationale && (
          <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic', flex: 1 }}>
            {nr.rationale}
          </p>
        )}
      </div>

      {/* ═══ FOOTER DE PROGRESSO DO ALUNO ═══ */}
      <div style={{
        padding: '10px 18px 14px',
        borderTop: '1px solid rgba(100,116,139,0.15)',
      }}>
        {/* Dificuldades */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <DiffBadge icon={Sprout} label="Fácil" count={p?.easierCount || 0} color="#22c55e" />
          <DiffBadge icon={Mountain} label="Médio" count={p?.sameCount || 0} color="#eab308" />
          <DiffBadge icon={Flame} label="Forte" count={p?.harderCount || 0} color="#f97316" />
        </div>

        {/* Checklist */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginBottom: 10 }}>
          <ProgressCheck done={p?.exerciseDone} label="Exercício" />
          <ProgressCheck done={p?.labInteracted} label="Lab" icon={FlaskConical} />
          <ProgressCheck done={(p?.sectionsViewed || 0) >= 6} label="6 seções" icon={BookOpen} />
          <ProgressCheck done={(p?.termsClicked || 0) > 0} label={`${p?.termsClicked || 0} termos`} />
        </div>

        {/* CTA */}
        <div style={{
          fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.8,
        }}>
          {hasActivity ? 'Continuar aula →' : 'Abrir aula adaptativa →'}
        </div>
      </div>
    </button>
  )
}

function DiffBadge({ icon: Icon, label, count, color }: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  count: number
  color: string
}) {
  const active = count > 0
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      opacity: active ? 1 : 0.3,
      transition: 'opacity 0.2s',
    }}>
      <Icon size={12} />
      <span style={{
        fontSize: 10, fontWeight: 700, color: active ? color : '#475569',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {count}
      </span>
      <span style={{ fontSize: 9, color: '#64748b' }}>{label}</span>
    </div>
  )
}

function ProgressCheck({ done, label, icon: Icon }: {
  done?: boolean
  label: string
  icon?: React.ComponentType<{ size?: number }>
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 3,
      fontSize: 10, color: done ? '#4ade80' : '#475569',
      fontWeight: done ? 600 : 400,
    }}>
      {Icon ? <Icon size={10} /> : <span>{done ? '✓' : '✗'}</span>}
      <span>{label}</span>
    </div>
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

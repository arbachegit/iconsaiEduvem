'use client'

import { useEffect, useState } from 'react'
import LessonView, { type LessonSection } from './LessonView'
import { getSectorMeta } from '@/lib/sectors-meta'

interface LessonLoaderProps {
  nrId: number
  sector: string
  difficulty?: 'easier' | 'same' | 'harder'
}

interface LessonResponse {
  nrCode: string
  nrTitle: string
  sectorSlug: string
  sectorName: string
  title: string
  sections: LessonSection[]
}

const STAGES = [
  { ms: 0,     label: 'Buscando contexto da norma...' },
  { ms: 4000,  label: 'Recuperando trechos relevantes pro seu setor...' },
  { ms: 9000,  label: 'Pedindo pro Claude estruturar a aula...' },
  { ms: 18000, label: 'Validando citacoes [NR-X, item Y.Z]...' },
  { ms: 28000, label: 'Quase la — montando as 6 secoes...' },
  { ms: 40000, label: 'Aulas longas levam mais alguns segundos. Aguarde.' },
]

export default function LessonLoader({ nrId, sector, difficulty = 'same' }: LessonLoaderProps) {
  const [lesson, setLesson] = useState<LessonResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const meta = getSectorMeta(sector)
  const accent = meta?.color || '#00d4ff'

  useEffect(() => {
    setLesson(null); setError(null); setStage(0); setElapsed(0)
    const t0 = Date.now()
    const tick = setInterval(() => setElapsed(Date.now() - t0), 250)

    fetch('/api/eduven/lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nrId, sector, difficulty }),
    })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || `HTTP ${r.status}`)
        return r.json()
      })
      .then(data => setLesson(data))
      .catch(err => setError(err.message))
      .finally(() => clearInterval(tick))

    return () => clearInterval(tick)
  }, [nrId, sector, difficulty])

  // Avança o estágio do loader baseado em elapsed
  useEffect(() => {
    if (lesson || error) return
    const next = STAGES.findIndex((s, i) => i === STAGES.length - 1 || elapsed < STAGES[i + 1].ms)
    if (next !== -1 && next !== stage) setStage(next)
  }, [elapsed, stage, lesson, error])

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: '120px auto', padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, color: '#fca5a5', marginBottom: 12 }}>Erro ao gerar aula</h1>
        <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 13, fontFamily: 'monospace' }}>{error}</p>
        <a
          href={`/?sector=${sector}`}
          style={{ display: 'inline-block', padding: '10px 20px', background: '#00d4ff', color: '#050d1a', borderRadius: 8, fontWeight: 700 }}
        >
          Voltar ao catalogo
        </a>
      </div>
    )
  }

  if (lesson) {
    return (
      <LessonView
        nrCode={lesson.nrCode}
        nrTitle={lesson.nrTitle}
        sectorSlug={lesson.sectorSlug}
        sectorName={lesson.sectorName}
        title={lesson.title}
        sections={lesson.sections}
      />
    )
  }

  // Loading skeleton
  const elapsedSec = Math.floor(elapsed / 1000)
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(100,116,139,0.2)' }}>
        <div className="skeleton" style={{ width: 80, height: 24, marginBottom: 14 }} />
        <div className="skeleton" style={{ width: '70%', height: 32, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '40%', height: 16 }} />
      </div>

      {/* Layout: sidebar + main */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
        {/* Sidebar skeleton */}
        <div style={{
          width: 240, flexShrink: 0,
          background: '#0c1320', borderRadius: 12, padding: 8,
          border: '1px solid rgba(100,116,139,0.2)',
        }}>
          <div className="skeleton" style={{ width: '60%', height: 12, margin: '12px 14px 14px' }} />
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
              <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0 }} />
              <div className="skeleton" style={{ flex: 1, height: 14 }} />
            </div>
          ))}
        </div>

        {/* Main skeleton + status overlay */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: '#0c1320',
            border: '1px solid rgba(100,116,139,0.2)',
            borderRadius: 12, padding: '40px 36px',
            position: 'relative', minHeight: 480,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
          }}>
            {/* Spinner */}
            <div style={{
              width: 64, height: 64, marginBottom: 24,
              borderRadius: '50%',
              border: `3px solid rgba(100,116,139,0.15)`,
              borderTopColor: accent,
              animation: 'spin 1.1s linear infinite',
              boxShadow: `0 0 40px ${accent}33`,
            }} />

            <div style={{
              fontSize: 11, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em',
              marginBottom: 10,
            }}>
              Gerando aula adaptativa
            </div>

            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 16, lineHeight: 1.3,
              maxWidth: 520,
            }}>
              {STAGES[stage].label}
            </h2>

            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28, maxWidth: 460, lineHeight: 1.6 }}>
              O Claude esta lendo {12} trechos da norma e estruturando 6 secoes
              com citacoes diretas. Tempo medio: 30-60s.
            </p>

            {/* Progress timeline */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {STAGES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === stage ? 32 : 8, height: 4, borderRadius: 2,
                    background: i <= stage ? accent : 'rgba(100,116,139,0.2)',
                    transition: 'all 0.4s',
                  }}
                />
              ))}
            </div>

            <div style={{ fontSize: 11, color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>
              {elapsedSec}s decorridos
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

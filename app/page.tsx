'use client'

import { useState } from 'react'
import { SECTORS, DEFAULT_SECTOR, getNRsForSector } from '@/data/sectors'
import { NR_INDEX } from '@/data/nr-index'
import { useIsMobile } from '@/hooks/useIsMobile'
import NRGrid from '@/components/NRGrid'
import { GitFork } from 'lucide-react'
import NRCorrelationGraph from '@/components/NRCorrelationGraph'

const C = {
  bg: '#050d1a', cyan: '#00d4ff', muted: '#94a3b8', dim: '#64748b',
  border: 'rgba(100,116,139,0.25)', font: "'Inter', sans-serif",
}

const SECTOR_COLORS: Record<string, string> = {
  construcao_civil: '#f97316',
  industria_calcados: '#ef4444',
  escritorio_contabilidade: '#94a3b8',
}

const MOBILE_NAMES: Record<string, string> = {
  construcao_civil: 'Construção Civil',
  industria_calcados: 'Fab. de Calçados',
  escritorio_contabilidade: 'Contabilidade',
}

export default function HomePage() {
  const [activeSector, setActiveSector] = useState(DEFAULT_SECTOR)
  const [showGraph, setShowGraph] = useState(false)
  const isMobile = useIsMobile()
  const sector = SECTORS.find(s => s.slug === activeSector)!
  const nrMap = new Map(NR_INDEX.filter(n => n.status === 'vigente').map(n => [n.id, n]))

  const nrsWithRelevance = getNRsForSector(activeSector)
    .map(r => {
      const nr = nrMap.get(r.nrId)
      if (!nr) return null
      return {
        id: nr.id, code: nr.code, title: nr.title, status: nr.status,
        current_portaria: null, relevance: r.score, rationale: r.rationale,
      }
    })
    .filter(Boolean) as any[]

  return (
    <main style={{ minHeight: '100vh', backgroundColor: C.bg }}>
      {/* Title bar — compact */}
      <div style={{
        padding: isMobile ? '0.5rem 0.5rem' : '0.625rem 1rem',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        <h1 style={{
          margin: 0, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          fontWeight: 800, fontSize: isMobile ? '0.9375rem' : '1.125rem',
          letterSpacing: '-0.02em', whiteSpace: 'nowrap',
          background: 'linear-gradient(135deg, #e2e8f0, #00d4ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          O Interativo Mundo da{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00d4ff, #0a84ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>NR</span>
        </h1>

        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'nowrap' }}>
          {/* Sector tabs */}
          {SECTORS.map(s => {
            const isActive = s.slug === activeSector
            const color = SECTOR_COLORS[s.slug] || C.cyan
            const label = isMobile ? (MOBILE_NAMES[s.slug] || s.name) : s.name
            return (
              <button
                key={s.slug}
                onClick={() => setActiveSector(s.slug)}
                style={{
                  padding: isMobile ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
                  borderRadius: 9999, cursor: 'pointer',
                  backgroundColor: isActive ? `${color}20` : 'transparent',
                  border: `1.5px solid ${isActive ? color : C.border}`,
                  color: isActive ? color : C.muted,
                  fontSize: isMobile ? '0.625rem' : '0.6875rem',
                  fontWeight: isActive ? 700 : 400,
                  fontFamily: C.font, transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            )
          })}

          {/* Grafo button */}
          <button
            onClick={() => setShowGraph(true)}
            title="Mapa de Correlações entre NRs"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: isMobile ? 28 : 32, height: isMobile ? 28 : 32,
              borderRadius: 8, cursor: 'pointer',
              border: `1.5px solid ${C.cyan}44`,
              background: `${C.cyan}0A`, color: C.cyan,
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            <GitFork size={isMobile ? 14 : 16} />
          </button>
        </div>
      </div>

      {/* Sector description — compact */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0.375rem 0.5rem 0' : '0.5rem 1rem 0' }}>
        <p style={{
          fontSize: isMobile ? '0.6875rem' : '0.75rem', color: C.dim, fontFamily: C.font,
          maxWidth: 600, lineHeight: 1.5, margin: 0,
        }}>
          {sector.description}
          <span style={{
            marginLeft: 6, fontSize: '0.625rem',
            color: SECTOR_COLORS[activeSector] || C.cyan,
          }}>
            {nrsWithRelevance.length} NRs
          </span>
        </p>
      </div>

      {/* NR Grid */}
      <NRGrid
        nrs={nrsWithRelevance}
        sectorSlug={activeSector}
        sectorName={sector.name}
        progress={{}}
      />

      {/* Graph Modal */}
      {showGraph && (
        <NRCorrelationGraph
          nrs={nrsWithRelevance}
          sectorName={sector.name}
          onClose={() => setShowGraph(false)}
        />
      )}
    </main>
  )
}

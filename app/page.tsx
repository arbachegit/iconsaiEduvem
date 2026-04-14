'use client'

import { useState } from 'react'
import { SECTORS, DEFAULT_SECTOR, getNRsForSector, type Sector } from '@/data/sectors'
import { NR_INDEX } from '@/data/nr-index'
import AppHeader from '@/components/AppHeader'
import NRGrid from '@/components/NRGrid'
import FloatingButton from '@/components/FloatingButton'

const C = {
  bg: '#050d1a', cyan: '#00d4ff', muted: '#94a3b8', dim: '#64748b',
  border: 'rgba(100,116,139,0.25)', font: "'Inter', sans-serif",
}

const SECTOR_COLORS: Record<string, string> = {
  construcao_civil: '#f97316',
  industria_calcados: '#ef4444',
  escritorio_contabilidade: '#94a3b8',
}

export default function HomePage() {
  const [activeSector, setActiveSector] = useState(DEFAULT_SECTOR)
  const sector = SECTORS.find(s => s.slug === activeSector)!
  const nrMap = new Map(NR_INDEX.filter(n => n.status === 'vigente').map(n => [n.id, n]))

  const nrsWithRelevance = getNRsForSector(activeSector)
    .map(r => {
      const nr = nrMap.get(r.nrId)
      if (!nr) return null
      return {
        id: nr.id,
        code: nr.code,
        title: nr.title,
        status: nr.status,
        current_portaria: null,
        relevance: r.score,
        rationale: r.rationale,
      }
    })
    .filter(Boolean) as any[]

  return (
    <>
      <AppHeader activeSectorSlug={activeSector} activeSectorName={sector.name} />
      <main>
        {/* Sector Tabs */}
        <div style={{
          maxWidth: 1200, margin: '80px auto 0', padding: '0 1.5rem',
          display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
        }}>
          {SECTORS.map(s => {
            const isActive = s.slug === activeSector
            const color = SECTOR_COLORS[s.slug] || C.cyan
            return (
              <button
                key={s.slug}
                onClick={() => setActiveSector(s.slug)}
                style={{
                  padding: '0.625rem 1.25rem', borderRadius: 9999, cursor: 'pointer',
                  backgroundColor: isActive ? `${color}20` : 'transparent',
                  border: `1.5px solid ${isActive ? color : C.border}`,
                  color: isActive ? color : C.muted,
                  fontSize: '0.8125rem', fontWeight: isActive ? 700 : 400,
                  fontFamily: C.font, transition: 'all 0.2s',
                }}
              >
                {s.name}
              </button>
            )
          })}
        </div>

        {/* Sector Description */}
        <div style={{
          maxWidth: 1200, margin: '1rem auto 0', padding: '0 1.5rem',
        }}>
          <p style={{
            fontSize: '0.8125rem', color: C.dim, fontFamily: C.font,
            maxWidth: 600, lineHeight: 1.6,
          }}>
            {sector.description}
            <span style={{
              marginLeft: 8, fontSize: '0.6875rem',
              color: SECTOR_COLORS[activeSector] || C.cyan,
            }}>
              {nrsWithRelevance.length} NRs aplicáveis
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
      </main>
      <FloatingButton />
    </>
  )
}

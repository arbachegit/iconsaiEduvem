'use client'

import { useEffect, useMemo, useState } from 'react'
import { X, MapPin } from 'lucide-react'
import { geoIdentity, geoPath } from 'd3-geo'
import {
  UF_META, UF_LIST, REGION_NAMES, REGION_COLORS, type RegionSlug, type UFMeta,
} from '@/data/uf-meta'

/* ═══════════════════════════════════════════════════════════════════
   BrazilMapModal — mapa interativo do Brasil (geometria IBGE oficial).
   Click num UF dispara onSelect(uf). Hover destaca + tooltip flutuante.
   Geometria: public/data/br-uf.geojson (FeatureCollection 27 UFs com codarea).
   ═══════════════════════════════════════════════════════════════════ */

interface BrazilMapModalProps {
  selectedCodarea?: string | null
  onSelect: (uf: UFMeta) => void
  onClose: () => void
}

interface Feature {
  type: 'Feature'
  properties: { codarea: string }
  geometry: { type: string; coordinates: unknown }
}

interface FeatureCollection {
  type: 'FeatureCollection'
  features: Feature[]
}

const VIEW_W = 720
const VIEW_H = 720

export default function BrazilMapModal({ selectedCodarea, onSelect, onClose }: BrazilMapModalProps) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null)
  const [hoverCodarea, setHoverCodarea] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [activeRegion, setActiveRegion] = useState<RegionSlug | null>(null)

  // ESC fecha
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  // Fetch GeoJSON 1x
  useEffect(() => {
    fetch('/data/br-uf.geojson')
      .then(r => r.json())
      .then((d: FeatureCollection) => setGeo(d))
      .catch(() => {})
  }, [])

  // Build paths quando geo chega.
  // geoIdentity sem antimeridian/sphere clipping — apenas translate+scale.
  // reflectY pra inverter o eixo Y (latitude cresce pra cima, SVG cresce pra baixo).
  const paths = useMemo(() => {
    if (!geo) return null
    const projection = geoIdentity()
      .reflectY(true)
      .fitSize([VIEW_W, VIEW_H], geo as unknown as GeoJSON.FeatureCollection)
    const path = geoPath(projection)
    return geo.features.map(f => ({
      codarea: f.properties.codarea,
      d: path(f as unknown as GeoJSON.Feature) || '',
    }))
  }, [geo])

  const hovered = hoverCodarea ? UF_META[hoverCodarea] : null
  const selected = selectedCodarea ? UF_META[selectedCodarea] : null

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2200,
        background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4vh 4vw',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{
        width: 'min(960px, 96vw)', maxHeight: '92vh',
        background: '#050d1a', border: '1px solid rgba(100,116,139,0.4)', borderRadius: 16,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* HEADER */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid rgba(100,116,139,0.25)',
          background: '#0c1220',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={18} style={{ color: '#22c55e' }} />
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>
                Sotaques do Brasil
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>
                Clique em um estado pra escolher o sotaque que a Ella usa
              </div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            style={{
              background: 'transparent', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8,
              color: '#94a3b8', cursor: 'pointer', padding: 6, display: 'flex',
            }}>
            <X size={18} />
          </button>
        </div>

        {/* BODY: mapa + sidebar legenda */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Mapa */}
          <div style={{ flex: 1, position: 'relative', minWidth: 0, padding: 12 }}>
            {!geo && (
              <div style={{ color: '#94a3b8', fontSize: 13, padding: 40, textAlign: 'center' }}>
                Carregando malha territorial do IBGE…
              </div>
            )}
            {paths && (
              <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                style={{ width: '100%', height: '100%', display: 'block' }}
                onMouseLeave={() => { setHoverCodarea(null); setTooltipPos(null) }}
              >
                {paths.map(({ codarea, d }) => {
                  const meta = UF_META[codarea]
                  const region = meta?.regiao
                  const color = region ? REGION_COLORS[region] : '#475569'
                  const isHover = hoverCodarea === codarea
                  const isSelected = selectedCodarea === codarea
                  const isRegionActive = activeRegion && region === activeRegion
                  const fill = isSelected
                    ? color
                    : isHover
                    ? `${color}aa`
                    : isRegionActive
                    ? `${color}55`
                    : `${color}22`
                  const stroke = isSelected ? '#ffffff' : `${color}99`
                  return (
                    <path
                      key={codarea}
                      d={d}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? 2 : 1}
                      style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
                      onMouseEnter={(e) => {
                        setHoverCodarea(codarea)
                        const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
                        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                      }}
                      onMouseMove={(e) => {
                        const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
                        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                      }}
                      onClick={() => { if (meta) onSelect(meta) }}
                    />
                  )
                })}
              </svg>
            )}

            {/* Tooltip */}
            {hovered && tooltipPos && (
              <div style={{
                position: 'absolute',
                left: Math.min(tooltipPos.x + 12, VIEW_W - 180),
                top: Math.max(tooltipPos.y - 60, 8),
                pointerEvents: 'none',
                background: '#0c1220',
                border: `1px solid ${REGION_COLORS[hovered.regiao]}`,
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                color: '#e2e8f0',
                zIndex: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                minWidth: 160,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                    color: REGION_COLORS[hovered.regiao], fontSize: 11,
                  }}>{hovered.sigla}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{hovered.nome}</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11, fontStyle: 'italic' }}>
                  Sotaque {hovered.regiao.replace('_', '-')}
                </div>
                <div style={{ color: '#64748b', fontSize: 10, marginTop: 4 }}>
                  Clique pra selecionar
                </div>
              </div>
            )}
          </div>

          {/* Sidebar legenda regional */}
          <div style={{
            width: 200, flexShrink: 0,
            borderLeft: '1px solid rgba(100,116,139,0.25)',
            background: '#0c1220',
            padding: 14, overflowY: 'auto',
          }}>
            <div style={{
              fontSize: 10, color: '#64748b', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
            }}>
              Grandes Regiões
            </div>
            {(Object.keys(REGION_NAMES) as RegionSlug[]).map(r => {
              const isActive = activeRegion === r
              return (
                <button
                  key={r}
                  onMouseEnter={() => setActiveRegion(r)}
                  onMouseLeave={() => setActiveRegion(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 8px', marginBottom: 4, width: '100%',
                    background: isActive ? `${REGION_COLORS[r]}1a` : 'transparent',
                    border: `1px solid ${isActive ? REGION_COLORS[r] : 'transparent'}`,
                    borderRadius: 6, cursor: 'pointer', color: '#e2e8f0',
                    fontSize: 12, textAlign: 'left', fontFamily: 'inherit',
                  }}
                >
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: REGION_COLORS[r], flexShrink: 0,
                  }} />
                  {REGION_NAMES[r]}
                  <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 10 }}>
                    {UF_LIST.filter(u => u.regiao === r).length}
                  </span>
                </button>
              )
            })}

            {selected && (
              <div style={{
                marginTop: 14, padding: 10,
                background: `${REGION_COLORS[selected.regiao]}12`,
                border: `1px solid ${REGION_COLORS[selected.regiao]}66`,
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                  Selecionado
                </div>
                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13 }}>
                  {selected.sigla} — {selected.nome}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                  {REGION_NAMES[selected.regiao]}
                </div>
              </div>
            )}

            <div style={{
              marginTop: 14, padding: '8px 10px',
              background: 'rgba(34,211,238,0.06)',
              border: '1px solid rgba(34,211,238,0.25)',
              borderRadius: 6, fontSize: 10, color: '#94a3b8', lineHeight: 1.5,
            }}>
              Geometria: <strong style={{ color: '#22d3ee' }}>IBGE</strong> ·
              {' '}Malhas Territoriais (qualidade mínima) · Divisão Regional oficial.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


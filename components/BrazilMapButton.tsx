'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { geoIdentity, geoPath } from 'd3-geo'
import { UF_META, REGION_COLORS, type UFMeta } from '@/data/uf-meta'

/* ═══════════════════════════════════════════════════════════════════
   BrazilMapButton — botao do header com SVG do Brasil OU do UF selecionado.
   Cache do GeoJSON em modulo (1 fetch global por sessao).
   Paths gerados via d3-geo direto pra escala 28x28 ou 32x32.
   ═══════════════════════════════════════════════════════════════════ */

interface FeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: { codarea: string }
    geometry: { type: string; coordinates: unknown }
  }>
}

interface BrazilMapButtonProps {
  selectedCodarea?: string | null
  size?: number  // 28 (mobile) ou 32 (desktop)
  onClick: () => void
  onHover?: (uf: UFMeta | null) => void
}

let _geoCache: FeatureCollection | null = null
let _geoPromise: Promise<FeatureCollection> | null = null

function loadGeo(): Promise<FeatureCollection> {
  if (_geoCache) return Promise.resolve(_geoCache)
  if (_geoPromise) return _geoPromise
  _geoPromise = fetch('/data/br-uf.geojson')
    .then(r => r.json())
    .then((d: FeatureCollection) => { _geoCache = d; return d })
  return _geoPromise
}

export default function BrazilMapButton({
  selectedCodarea, size = 32, onClick, onHover,
}: BrazilMapButtonProps) {
  const [geo, setGeo] = useState<FeatureCollection | null>(_geoCache)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!geo) loadGeo().then(setGeo).catch(() => {})
  }, [geo])

  const selectedUF = selectedCodarea ? UF_META[selectedCodarea] : null
  const accent = selectedUF ? REGION_COLORS[selectedUF.regiao] : '#22c55e'

  // Path do conteudo: Brasil inteiro (todos UFs) OU so o UF selecionado
  const svgContent = useMemo(() => {
    if (!geo) return null
    const innerPad = 2
    const w = size, h = size
    if (selectedUF) {
      const feature = geo.features.find(f => f.properties.codarea === selectedUF.codarea)
      if (!feature) return null
      const projection = geoIdentity().reflectY(true).fitSize([w - innerPad * 2, h - innerPad * 2], feature as unknown as GeoJSON.Feature)
      const path = geoPath(projection)
      return [{ codarea: selectedUF.codarea, d: path(feature as unknown as GeoJSON.Feature) || '', region: selectedUF.regiao }]
    }
    // Brasil completo, com cor por região
    const projection = geoIdentity().reflectY(true).fitSize([w - innerPad * 2, h - innerPad * 2], geo as unknown as GeoJSON.FeatureCollection)
    const path = geoPath(projection)
    return geo.features.map(f => {
      const meta = UF_META[f.properties.codarea]
      return {
        codarea: f.properties.codarea,
        d: path(f as unknown as GeoJSON.Feature) || '',
        region: meta?.regiao,
      }
    })
  }, [geo, selectedUF, size])

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); onHover?.(selectedUF) }}
      onMouseLeave={() => { setHovered(false); onHover?.(null) }}
      title={selectedUF ? `Sotaque: ${selectedUF.nome} (${selectedUF.sigla})` : 'Escolher sotaque do Brasil'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: 8, cursor: 'pointer',
        border: `1.5px solid ${accent}${hovered ? '88' : '44'}`,
        background: hovered ? `${accent}1a` : `${accent}0A`,
        transition: 'all 0.2s', flexShrink: 0,
        padding: 0, fontFamily: 'inherit',
      }}
    >
      <svg width={size - 4} height={size - 4} viewBox={`0 0 ${size} ${size}`}>
        {svgContent && svgContent.map(p => (
          <path
            key={p.codarea}
            d={p.d}
            fill={selectedUF
              ? accent
              : (p.region ? `${REGION_COLORS[p.region]}` : '#22c55e')}
            fillOpacity={selectedUF ? 0.9 : 0.85}
            stroke={selectedUF ? '#0c1220' : '#0c1220'}
            strokeWidth={0.4}
          />
        ))}
        {!svgContent && (
          <circle cx={size/2} cy={size/2} r={size/3} fill={`${accent}66`} />
        )}
      </svg>
    </button>
  )
}

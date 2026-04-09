import Link from 'next/link'
import { SECTORS_META } from '@/lib/sectors-meta'

interface Sector {
  id: number
  slug: string
  name: string
  description: string
  example_companies: string
  typical_jobs: string[]
}

export default function SectorPicker({ sectors }: { sectors: Sector[] }) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 38, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.1, marginBottom: 16 }}>
          Em qual setor voce trabalha?
        </h1>
        <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
          As Normas Regulamentadoras se aplicam de forma diferente a cada setor. Escolha o seu pra
          ver as NRs mais relevantes pro seu dia-a-dia, com exemplos e cenarios do seu chao de fabrica.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20,
      }}>
        {sectors.map(sector => {
          const meta = SECTORS_META[sector.slug]
          if (!meta) return null
          return (
            <Link
              key={sector.slug}
              href={`/?sector=${sector.slug}`}
              className="card-hover"
              style={{
                display: 'block',
                background: '#0c1320',
                border: `1px solid ${meta.borderColor}`,
                borderRadius: 14,
                padding: 28,
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: meta.color,
              }} />
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: meta.colorSoft,
                border: `1px solid ${meta.borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
                fontSize: 22, color: meta.color, fontWeight: 700,
              }}>
                {sector.name.charAt(0)}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 10, lineHeight: 1.3 }}>
                {sector.name}
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
                {meta.shortDesc}
              </p>
              <div style={{
                fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5,
                borderTop: '1px solid rgba(100,116,139,0.15)', paddingTop: 12,
              }}>
                Exemplos: {sector.example_companies.split(',').slice(0, 3).join(',')}
              </div>
              <div style={{
                marginTop: 16,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: meta.color, fontWeight: 600,
              }}>
                Ver NRs deste setor →
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

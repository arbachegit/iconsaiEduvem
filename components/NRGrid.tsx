import Link from 'next/link'
import { getSectorMeta } from '@/lib/sectors-meta'

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
  const meta = getSectorMeta(sectorSlug)
  const accentColor = meta?.color || '#22d3ee'

  // Group by relevance bucket: critica/muito (4-5), relevante (3), ocasional/tangencial (1-2)
  const critical = nrs.filter(n => n.relevance >= 4)
  const relevant = nrs.filter(n => n.relevance === 3)
  const occasional = nrs.filter(n => n.relevance > 0 && n.relevance < 3)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#e2e8f0', marginBottom: 8, lineHeight: 1.2 }}>
          NRs para {sectorName}
        </h1>
        <p style={{ fontSize: 15, color: '#94a3b8' }}>
          {nrs.length} normas aplicaveis ao setor, ordenadas por relevancia.
        </p>
      </div>

      {critical.length > 0 && (
        <Section title="Criticas e muito relevantes" subtitle="Sao a base da seguranca neste setor. Comece por aqui." color={accentColor} nrs={critical} sectorSlug={sectorSlug} />
      )}
      {relevant.length > 0 && (
        <Section title="Relevantes" subtitle="Aplicam-se a parte significativa do dia-a-dia." color="#94a3b8" nrs={relevant} sectorSlug={sectorSlug} />
      )}
      {occasional.length > 0 && (
        <Section title="Ocasionais e tangenciais" subtitle="Tocam o setor em situacoes especificas." color="#475569" nrs={occasional} sectorSlug={sectorSlug} />
      )}
      {nrs.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>
          Nenhuma NR classificada para este setor ainda.
        </div>
      )}
    </div>
  )
}

function Section({ title, subtitle, color, nrs, sectorSlug }: {
  title: string
  subtitle: string
  color: string
  nrs: NRWithRelevance[]
  sectorSlug: string
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
        {nrs.map(nr => (
          <Link
            key={nr.id}
            href={`/aulas?nr=${nr.id}&sector=${sectorSlug}`}
            className="card-hover"
            style={{
              display: 'block',
              background: '#0c1320',
              border: '1px solid rgba(100,116,139,0.2)',
              borderRadius: 12,
              padding: '18px 20px',
              textDecoration: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
                {nr.code}
              </span>
              <RelevanceBadge relevance={nr.relevance} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4, marginBottom: 8 }}>
              {nr.title}
            </h3>
            {nr.rationale && (
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic' }}>
                {nr.rationale}
              </p>
            )}
          </Link>
        ))}
      </div>
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

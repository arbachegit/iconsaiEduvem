import Link from 'next/link'
import { getSectorMeta } from '@/lib/sectors-meta'

interface AppHeaderProps {
  activeSectorSlug?: string | null
  activeSectorName?: string | null
}

export default function AppHeader({ activeSectorSlug, activeSectorName }: AppHeaderProps) {
  const meta = activeSectorSlug ? getSectorMeta(activeSectorSlug) : null

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(5, 13, 26, 0.85)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(100,116,139,0.2)',
      padding: '14px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: '#050d1a', fontSize: 18,
          }}>
            ai
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.1 }}>
              O Interativo Mundo da NR
            </div>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
              by IconsAI
            </div>
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        {activeSectorSlug && activeSectorName && meta && (
          <Link
            href="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 8,
              background: meta.colorSoft,
              border: `1px solid ${meta.borderColor}`,
              color: meta.color,
              fontSize: 13, fontWeight: 600,
            }}
            title="Trocar setor"
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
            {activeSectorName}
            <span style={{ color: '#64748b', fontSize: 11, marginLeft: 4 }}>trocar</span>
          </Link>
        )}
      </div>
    </header>
  )
}

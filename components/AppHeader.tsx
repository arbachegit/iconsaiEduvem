'use client'

import Link from 'next/link'
import { LayoutGrid, Briefcase, Replace } from 'lucide-react'
import { getSectorMeta } from '@/lib/sectors-meta'

const C = {
  bg2: '#0f172a',
  text: '#e2e8f0',
  muted: '#94a3b8',
  dim: '#64748b',
  cyan: '#00d4ff',
  border: 'rgba(100,116,139,0.3)',
  font: "'Inter', sans-serif",
}

interface AppHeaderProps {
  activeSectorSlug?: string | null
  activeSectorName?: string | null
}

export default function AppHeader({ activeSectorSlug, activeSectorName }: AppHeaderProps) {
  const meta = activeSectorSlug ? getSectorMeta(activeSectorSlug) : null

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: 'rgba(15,23,42,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border}`,
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem',
    }}>
      <style>{`
        @keyframes beacon {
          0%, 100% { filter: drop-shadow(0 0 2px currentColor); opacity: 1; }
          50% { filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 16px currentColor); opacity: 0.85; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* LEFT: logo + title + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/iconsai-logo.png" alt="IconsAI" style={{ height: 28, objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{
              fontFamily: C.font, fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #e2e8f0, #00d4ff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              O Interativo Mundo da{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff, #0a84ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>NR</span>
            </span>
            <span style={{
              fontSize: '0.5625rem', color: C.dim, fontWeight: 400,
              letterSpacing: '0.15em', textTransform: 'uppercase',
            }}>
              by IconsAI
            </span>
          </div>
        </Link>

        {/* Divider */}
        <div style={{ width: 1, height: 32, backgroundColor: C.border, marginLeft: '0.25rem' }} />

        {/* Nav */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a
            href="https://icon.iconsai.ai/tools"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1.125rem', borderRadius: 9999, cursor: 'pointer',
              fontFamily: C.font, fontSize: '0.8125rem', fontWeight: 600,
              background: 'transparent', textDecoration: 'none',
              border: `1.5px solid rgba(100,116,139,0.25)`,
              color: '#f59e0b',
              transition: 'all 0.25s',
            }}
          >
            <LayoutGrid size={14} /> Tools
          </a>
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1.125rem', borderRadius: 9999, cursor: 'pointer',
              fontFamily: C.font, fontSize: '0.8125rem', fontWeight: 600,
              background: 'transparent', textDecoration: 'none',
              border: `1.5px solid ${activeSectorSlug ? 'rgba(100,116,139,0.25)' : C.cyan}`,
              color: activeSectorSlug ? C.dim : C.cyan,
              transition: 'all 0.25s',
            }}
          >
            <Briefcase size={14} style={!activeSectorSlug ? { animation: 'beacon 2.5s ease-in-out infinite', color: C.cyan } : {}} /> Setores
          </Link>
        </div>
      </div>

      {/* RIGHT: sector badge + ai.t tutor logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {activeSectorSlug && activeSectorName && meta && (
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.875rem', borderRadius: 9999,
              background: meta.colorSoft,
              border: `1.5px solid ${meta.borderColor}`,
              color: meta.color,
              fontSize: '0.75rem', fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.25s',
            }}
            title="Trocar setor"
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: meta.color,
              boxShadow: `0 0 8px ${meta.color}`,
            }} />
            {activeSectorName}
            <Replace size={12} style={{ opacity: 0.6, marginLeft: '0.125rem' }} />
          </Link>
        )}

        <div style={{ width: 1, height: 24, backgroundColor: C.border }} />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aitutor-logo.png" alt="Learn by ai.t tutor" style={{ height: 40, objectFit: 'contain' }} />
      </div>
    </header>
  )
}

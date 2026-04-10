'use client'

import { Sprout, Mountain, Flame } from 'lucide-react'

interface DifficultyFooterProps {
  counts: { easier: number; same: number; harder: number }
  currentDifficulty: string
}

const BADGES = [
  { key: 'easier' as const, label: 'Facil',   Icon: Sprout,   color: '#22c55e' },
  { key: 'same'   as const, label: 'Medio',   Icon: Mountain, color: '#eab308' },
  { key: 'harder' as const, label: 'Dificil', Icon: Flame,    color: '#f97316' },
] as const

export default function DifficultyFooter({ counts, currentDifficulty }: DifficultyFooterProps) {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '10px 20px',
        background: '#0a1628',
        borderTop: '1px solid #1e293b',
        flexShrink: 0,
      }}
    >
      {BADGES.map(({ key, label, Icon, color }) => {
        const count = counts[key]
        const isCurrent = currentDifficulty === key
        const isEmpty = count === 0

        return (
          <div
            key={key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 9999,
              border: `1px solid ${isCurrent ? color + '66' : isEmpty ? '#1e293b' : color + '33'}`,
              background: isCurrent ? color + '15' : 'transparent',
              opacity: isEmpty ? 0.3 : 1,
              transition: 'all 0.2s ease',
              ...(isCurrent && !isEmpty
                ? { boxShadow: `0 0 12px ${color}22` }
                : {}),
            }}
          >
            <Icon
              size={14}
              style={{
                color: isEmpty ? '#475569' : color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: isEmpty ? '#475569' : '#94a3b8',
              }}
            >
              {label}:
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: isEmpty ? '#475569' : color,
              }}
            >
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}

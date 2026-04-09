'use client'

import { useState, useEffect } from 'react'

/* ═══════════════════════════════════════════════════════════
   SvgComprehensionCheck — Portado 1:1 do iconsaiStats
   Pergunta "Compreendi?" / "Nao compreendi" no fim de cada
   secao. Nao bloqueia progressao — coleta feedback.
   ═══════════════════════════════════════════════════════════ */

interface SvgComprehensionCheckProps {
  onFeedback: (understood: boolean) => void
  disabled?: boolean
}

export function SvgComprehensionCheck({ onFeedback, disabled }: SvgComprehensionCheckProps) {
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState<boolean | null>(null)
  const [variant, setVariant] = useState(0)

  useEffect(() => {
    setVariant(Math.floor(Math.random() * 3))
  }, [])

  const handleClick = (understood: boolean) => {
    if (disabled || answered) return
    setAnswered(true)
    setSelected(understood)
    onFeedback(understood)
  }

  const colors = [
    { yes: '#22d3ee', no: '#f97316', bg: '#0f172a' },
    { yes: '#4ade80', no: '#ef4444', bg: '#0c1320' },
    { yes: '#818cf8', no: '#fb923c', bg: '#0e1526' },
  ][variant]

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0', gap: 16 }}>
      <button
        onClick={() => handleClick(true)}
        disabled={disabled || answered}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 24px', borderRadius: 12,
          background: answered && selected === true ? colors.yes : colors.bg,
          border: `2px solid ${answered && selected === true ? colors.yes : '#1e293b'}`,
          color: answered && selected === true ? '#fff' : colors.yes,
          cursor: disabled || answered ? 'default' : 'pointer',
          fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
          transition: 'all 0.3s ease',
          opacity: answered && selected !== true ? 0.4 : 1,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke={colors.yes} strokeWidth="2" fill="none">
            {!answered && <animate attributeName="r" values="11;13;11" dur={`${1.5 + variant * 0.3}s`} repeatCount="indefinite" />}
          </circle>
          <path d="M9 14l3 3 7-7" stroke={colors.yes} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        Compreendi
      </button>

      <button
        onClick={() => handleClick(false)}
        disabled={disabled || answered}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 24px', borderRadius: 12,
          background: answered && selected === false ? colors.no : colors.bg,
          border: `2px solid ${answered && selected === false ? colors.no : '#1e293b'}`,
          color: answered && selected === false ? '#fff' : colors.no,
          cursor: disabled || answered ? 'default' : 'pointer',
          fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
          transition: 'all 0.3s ease',
          opacity: answered && selected !== false ? 0.4 : 1,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke={colors.no} strokeWidth="2" fill="none">
            {!answered && <animate attributeName="r" values="11;13;11" dur={`${1.8 + variant * 0.2}s`} repeatCount="indefinite" />}
          </circle>
          <path d="M10 10l8 8M18 10l-8 8" stroke={colors.no} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
        Nao compreendi
      </button>
    </div>
  )
}

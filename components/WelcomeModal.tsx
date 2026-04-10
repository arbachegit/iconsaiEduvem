'use client'

import { useState, useEffect, CSSProperties } from 'react'
import { trackEvent } from '@/lib/track-event'
import PlayButton from './education/PlayButton'

/* ─── Tutorial slides ─── */
const slides = [
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="4" stroke="#22d3ee" strokeWidth="2" />
        <rect x="36" y="4" width="24" height="24" rx="4" stroke="#22d3ee" strokeWidth="2" />
        <rect x="4" y="36" width="24" height="24" rx="4" stroke="#22d3ee" strokeWidth="2" />
        <rect x="36" y="36" width="24" height="24" rx="4" stroke="#22d3ee" strokeWidth="2" />
      </svg>
    ),
    title: 'Escolha seu setor',
    text: 'As NRs mudam conforme o chao de fabrica. Escolha o seu.',
  },
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="8" width="48" height="48" rx="6" stroke="#22d3ee" strokeWidth="2" />
        <line x1="8" y1="20" x2="56" y2="20" stroke="#22d3ee" strokeWidth="2" />
        <rect x="14" y="26" width="18" height="4" rx="2" fill="#22d3ee" opacity="0.6" />
        <rect x="14" y="34" width="28" height="4" rx="2" fill="#22d3ee" opacity="0.4" />
        <rect x="14" y="42" width="22" height="4" rx="2" fill="#22d3ee" opacity="0.3" />
      </svg>
    ),
    title: 'Aprenda interativamente',
    text: '6 secoes, exercicios, laboratorio com simulacao. Tudo adaptado ao seu setor.',
  },
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="20" cy="32" r="10" stroke="#22d3ee" strokeWidth="2" />
        <circle cx="32" cy="18" r="8" stroke="#22d3ee" strokeWidth="2" />
        <circle cx="44" cy="32" r="10" stroke="#22d3ee" strokeWidth="2" />
        <text x="17" y="36" fontSize="10" fill="#22d3ee" fontWeight="700">F</text>
        <text x="29" y="22" fontSize="9" fill="#22d3ee" fontWeight="700">M</text>
        <text x="40" y="36" fontSize="10" fill="#22d3ee" fontWeight="700">A</text>
      </svg>
    ),
    title: 'Acompanhe seu progresso',
    text: 'Cada card mostra o que voce ja fez. Facil, Medio, Forte.',
  },
]

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false)
  const [screen, setScreen] = useState<'lgpd' | 'tutorial'>('lgpd')
  const [checked, setChecked] = useState(false)
  const [slideIdx, setSlideIdx] = useState(0)

  useEffect(() => {
    const lgpdOk = localStorage.getItem('eduven_lgpd_accepted') === 'true'
    const welcomeOk = localStorage.getItem('eduven_welcome_done') === 'true'
    if (!lgpdOk) {
      setScreen('lgpd')
      setVisible(true)
    } else if (!welcomeOk) {
      setScreen('tutorial')
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  function handleAcceptLgpd() {
    localStorage.setItem('eduven_lgpd_accepted', 'true')
    trackEvent('lgpd_accepted')
    setScreen('tutorial')
    setSlideIdx(0)
  }

  function handleNextSlide() {
    if (slideIdx < slides.length - 1) {
      setSlideIdx(slideIdx + 1)
    }
  }

  function handleFinish() {
    localStorage.setItem('eduven_welcome_done', 'true')
    setVisible(false)
  }

  /* ─── Styles ─── */
  const overlay: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(5, 13, 26, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  }

  const card: CSSProperties = {
    background: '#0c1320',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    borderRadius: 16,
    maxWidth: 600,
    width: '100%',
    padding: '36px 32px',
    color: '#e2e8f0',
    fontFamily: 'Inter, sans-serif',
  }

  const titleStyle: CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 16,
    color: '#ffffff',
    textAlign: 'center',
  }

  const bodyText: CSSProperties = {
    fontSize: 15,
    lineHeight: 1.7,
    color: '#94a3b8',
    marginBottom: 24,
    textAlign: 'center',
  }

  const btnCyan: CSSProperties = {
    display: 'inline-block',
    padding: '12px 28px',
    background: '#22d3ee',
    color: '#050d1a',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
  }

  const btnDisabled: CSSProperties = {
    ...btnCyan,
    opacity: 0.35,
    cursor: 'not-allowed',
  }

  /* ─── LGPD Screen ─── */
  if (screen === 'lgpd') {
    return (
      <div style={overlay}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <h2 style={{ ...titleStyle, marginBottom: 0 }}>Bem-vindo ao Interativo Mundo da NR</h2>
            <PlayButton text="Pra te dar a melhor experiência, a gente coleta quais aulas você abriu, por quanto tempo, e suas respostas nos exercícios. Não vendemos seus dados. Você pode pedir exclusão a qualquer momento escrevendo pra arbache@gmail.com." size={14} />
          </div>
          <p style={bodyText}>
            Pra te dar a melhor experiencia, a gente coleta quais aulas voce abriu,
            por quanto tempo, e suas respostas nos exercicios. Nao vendemos seus dados.
            Voce pode pedir exclusao a qualquer momento escrevendo pra{' '}
            <span style={{ color: '#22d3ee' }}>arbache@gmail.com</span>.
          </p>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 24,
              cursor: 'pointer',
              fontSize: 14,
              color: '#cbd5e1',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked(!checked)}
              style={{
                width: 18,
                height: 18,
                accentColor: '#22d3ee',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
            Li e aceito os termos de uso de dados
          </label>

          <button
            disabled={!checked}
            onClick={handleAcceptLgpd}
            style={checked ? btnCyan : btnDisabled}
          >
            Aceitar e continuar
          </button>
        </div>
      </div>
    )
  }

  /* ─── Tutorial Screen ─── */
  const slide = slides[slideIdx]
  const isLast = slideIdx === slides.length - 1

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>{slide.icon}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <h2 style={{ ...titleStyle, marginBottom: 0 }}>{slide.title}</h2>
          <PlayButton text={`${slide.title}. ${slide.text}`} size={14} />
        </div>
        <p style={bodyText}>{slide.text}</p>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: i === slideIdx ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        <button onClick={isLast ? handleFinish : handleNextSlide} style={btnCyan}>
          {isLast ? 'Comecar' : 'Proximo'}
        </button>
      </div>
    </div>
  )
}

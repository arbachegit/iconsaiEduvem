'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Play, Pause, Loader2 } from 'lucide-react'

interface AiTutorAgentProps {
  /** Texto que o agente esta dizendo agora */
  message: string
  /** Cor accent (vem do setor) */
  color: string
  /** Indicador de "pensando" enquanto params mudam — opcional */
  thinking?: boolean
}

/**
 * AiTutorAgent — agente do laboratorio em primeira pessoa.
 *
 * Visual:
 *   - Avatar Bot com glow pulsante
 *   - Balao de fala com headline e subtitle
 *   - Botao Play TTS (Whisper OpenAI) integrado
 *   - Estado "..." quando o aluno mexe params (sensacao de pensando)
 *
 * Tom canonico em 1a pessoa:
 *   "Olha so:..." "Reparou?..." "Bota a mediana junto..."
 *
 * O texto vem de fora (lib/simulation-insights.ts gera por contexto).
 * Aqui so renderiza + cuida do TTS.
 */
export default function AiTutorAgent({ message, color, thinking = false }: AiTutorAgentProps) {
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)
  const lastTextRef = useRef('')

  // Reset quando texto muda
  useEffect(() => {
    if (lastTextRef.current === message) return
    lastTextRef.current = message
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null }
    setAudioState('idle')
  }, [message])

  useEffect(() => () => {
    if (audioRef.current) audioRef.current.pause()
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
  }, [])

  async function handlePlay() {
    if (audioState === 'playing') {
      audioRef.current?.pause()
      setAudioState('paused')
      return
    }
    if (audioState === 'paused' && audioRef.current) {
      audioRef.current.play()
      setAudioState('playing')
      return
    }
    setAudioState('loading')
    try {
      const res = await fetch('/api/eduven/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, voice: 'nova' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      blobUrlRef.current = url
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setAudioState('idle')
      await audio.play()
      setAudioState('playing')
    } catch {
      setAudioState('idle')
    }
  }

  const Icon = audioState === 'loading' ? Loader2 : audioState === 'playing' ? Pause : Play

  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'flex-start',
      background: '#0c1320',
      border: `1px solid ${color}55`,
      borderRadius: 14,
      padding: '16px 18px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow layer */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at top left, ${color}11 0%, transparent 60%)`,
      }} />

      {/* Avatar com glow */}
      <div style={{
        flexShrink: 0, position: 'relative',
        width: 44, height: 44, borderRadius: '50%',
        background: `${color}22`,
        border: `1.5px solid ${color}88`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 16px ${color}44`,
      }}>
        <Bot size={22} color={color} className={thinking ? 'pulse' : ''} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899, #22d3ee)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 3s linear infinite',
          }}>
            ai.tutor
          </div>
          <div style={{ fontSize: 10, color: '#64748b' }}>do laboratorio</div>

          <div style={{ flex: 1 }} />

          <button
            onClick={handlePlay}
            disabled={audioState === 'loading'}
            title={audioState === 'playing' ? 'Pausar' : 'Ouvir'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 9999,
              background: audioState === 'playing' ? `${color}22` : 'transparent',
              border: `1px solid ${color}66`,
              color, cursor: audioState === 'loading' ? 'wait' : 'pointer',
              fontSize: 10, fontWeight: 700, fontFamily: 'inherit',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            <Icon size={11} className={audioState === 'loading' ? 'spin' : ''} />
            {audioState === 'playing' ? 'Pausar' : 'Ouvir'}
          </button>
        </div>

        {thinking ? (
          <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>...</div>
        ) : (
          <div
            key={message}
            className="fadeIn"
            style={{ fontSize: 14, lineHeight: 1.6, color: '#e2e8f0' }}
          >
            {message}
          </div>
        )}
      </div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  )
}

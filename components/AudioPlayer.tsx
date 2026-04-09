'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Loader2 } from 'lucide-react'

interface AudioPlayerProps {
  text: string                  // texto a converter em audio
  color?: string                // accent color (do setor)
  label?: string                // tooltip ou label opcional
}

/**
 * AudioPlayer — botao Play minimalista que dispara TTS via /api/eduven/tts.
 *
 * Estado:
 *   idle    → botao Play
 *   loading → spinner (gerando audio)
 *   playing → botao Pause
 *   paused  → botao Play (reusa audio gerado)
 *   error   → tooltip com mensagem
 *
 * Cache em-memoria por instancia: gera audio 1x, replay sem refazer fetch.
 *
 * "Brasileiro e preguicoso" — feature critica de UX.
 */
export default function AudioPlayer({ text, color = '#00d4ff', label = 'Ouvir' }: AudioPlayerProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  // Reset quando texto muda
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setState('idle')
    setErrMsg(null)
  }, [text])

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause()
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  async function fetchAndPlay() {
    setState('loading')
    setErrMsg(null)
    try {
      const res = await fetch('/api/eduven/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      blobUrlRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setState('idle')
      audio.onerror = () => { setState('error'); setErrMsg('audio error') }
      await audio.play()
      setState('playing')
    } catch (err) {
      const msg = (err as Error).message
      console.error('[AudioPlayer]', msg)
      setState('error')
      setErrMsg(msg)
    }
  }

  function togglePause() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play()
      setState('playing')
    } else {
      audio.pause()
      setState('paused')
    }
  }

  function handleClick() {
    if (state === 'idle') return fetchAndPlay()
    if (state === 'playing' || state === 'paused') return togglePause()
    if (state === 'error') return fetchAndPlay()
  }

  const Icon = state === 'loading' ? Loader2 : state === 'playing' ? Pause : Play
  const tooltip = state === 'error'
    ? `Erro: ${errMsg || 'falha'}`
    : state === 'loading' ? 'Gerando audio...'
    : state === 'playing' ? 'Pausar'
    : state === 'paused' ? 'Continuar'
    : label

  return (
    <button
      onClick={handleClick}
      title={tooltip}
      disabled={state === 'loading'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 9999,
        background: state === 'playing' ? `${color}22` : 'rgba(15,23,42,0.6)',
        border: `1px solid ${state === 'error' ? '#ef4444' : `${color}66`}`,
        color: state === 'error' ? '#fca5a5' : color,
        cursor: state === 'loading' ? 'wait' : 'pointer',
        fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
        transition: 'all 0.15s',
      }}
    >
      <Icon size={13} className={state === 'loading' ? 'spin' : ''} />
      {state === 'loading' ? 'Gerando...' : state === 'playing' ? 'Tocando' : state === 'paused' ? 'Pausado' : 'Ouvir'}
    </button>
  )
}

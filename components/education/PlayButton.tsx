'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, Pause, Loader2, VolumeX } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   PlayButton — TTS via OpenAI tts-1 (voz nova).
   Copiado verbatim do iconsaiStats. Endpoint swapped para /api/eduven/tts.
   ═══════════════════════════════════════════════════════════ */

interface Props {
  text: string;
  size?: number;
}

type PlayState = 'idle' | 'loading' | 'playing' | 'error';

export default function PlayButton({ text, size = 16 }: Props) {
  const [state, setState] = useState<PlayState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState('idle');
  };

  const play = async () => {
    if (state === 'playing') { stop(); return; }
    if (state === 'loading' || state === 'error') return;

    const cleanText = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\[\[LAB\]\]|\[\[\/LAB\]\]/g, '')
      .replace(/\$\$([^$]+)\$\$/g, '$1')
      .replace(/\$([^$]+)\$/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[NR-\d+,[^\]]+\]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    setState('loading');

    try {
      const res = await fetch('/api/eduven/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, voice: 'nova' }),
      });
      if (!res.ok) { setState('error'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setState('idle'); URL.revokeObjectURL(url); };
      audio.onerror = () => { setState('error'); URL.revokeObjectURL(url); };
      await audio.play();
      setState('playing');
    } catch {
      setState('error');
    }
  };

  const Icon = state === 'loading' ? Loader2
    : state === 'playing' ? Pause
    : state === 'error' ? VolumeX
    : Volume2;

  const isError = state === 'error';
  const isPlaying = state === 'playing';

  return (
    <button
      onClick={play}
      disabled={isError}
      title={isError ? 'TTS indisponível' : isPlaying ? 'Pausar' : 'Ouvir em voz alta'}
      aria-label={isError ? 'Áudio indisponível' : isPlaying ? 'Pausar áudio' : 'Ouvir texto em voz alta'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size + 14, height: size + 14, borderRadius: 9999,
        border: `1.5px solid ${isError ? 'rgba(100,116,139,0.4)' : isPlaying ? '#ec4899' : '#fbbf24'}`,
        background: isError
          ? 'rgba(100,116,139,0.1)'
          : isPlaying
          ? 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(168,85,247,0.15))'
          : 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(236,72,153,0.10))',
        color: isError ? '#64748b' : isPlaying ? '#ec4899' : '#fbbf24',
        cursor: isError ? 'not-allowed' : 'pointer',
        padding: 0,
        transition: 'all 0.2s',
        flexShrink: 0,
        boxShadow: isPlaying
          ? '0 0 12px rgba(236,72,153,0.5)'
          : isError
          ? 'none'
          : '0 0 8px rgba(251,191,36,0.3)',
        animation: state === 'idle' ? 'audioIdlePulse 3s ease-in-out infinite' : 'none',
      }}
    >
      <Icon
        size={size}
        style={state === 'loading' ? { animation: 'spin 1s linear infinite' } : undefined}
      />
    </button>
  );
}

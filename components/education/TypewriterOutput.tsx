'use client'

import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════
   TypewriterOutput — Terminal-style character-by-character.
   Copiado verbatim do iconsaiStats.
   ═══════════════════════════════════════════════════════════ */

interface TypewriterOutputProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export function TypewriterOutput({ text, speed = 15, onComplete }: TypewriterOutputProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!text) return
    setDisplayedText('')
    setIsComplete(false)

    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      } else {
        clearInterval(interval)
        setIsComplete(true)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: '#0a0e17',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: 16,
        fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
        fontSize: 13,
        lineHeight: 1.6,
        color: '#4ade80',
        maxHeight: 400,
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      <div style={{ color: '#64748b', fontSize: 11, marginBottom: 8, fontFamily: 'inherit' }}>
        {'>'} debug mode
      </div>
      {displayedText}
      {!isComplete && (
        <span style={{ animation: 'blink 1s step-end infinite', color: '#4ade80' }}>|</span>
      )}
      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </div>
  )
}

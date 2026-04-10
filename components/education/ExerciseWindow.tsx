'use client'

import { useState, useRef } from 'react'
import { TypewriterOutput } from './TypewriterOutput'
import { safeEval, formatResult } from '@/lib/safe-eval'
import { trackEvent } from '@/lib/track-event'

/* ═══════════════════════════════════════════════════════════
   ExerciseWindow — Portado 1:1 do iconsaiStats.
   Endpoints swapped: /api/ai/exercise → /api/eduven/exercise,
                      /api/ai/debug → /api/eduven/debug
   ═══════════════════════════════════════════════════════════ */

interface ExerciseWindowProps {
  exerciseId: number
  prompt: string
  hints: string[]
  expectedInputExample?: string
  onNewExercise?: () => void
}

type ExerciseState = 'idle' | 'executing' | 'correct' | 'error' | 'debugging' | 'debug_complete'

export function ExerciseWindow({ exerciseId, prompt, hints, expectedInputExample, onNewExercise }: ExerciseWindowProps) {
  const [userInput, setUserInput] = useState('')
  const [output, setOutput] = useState('')
  const [debugText, setDebugText] = useState('')
  const [state, setState] = useState<ExerciseState>('idle')
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab' && e.key !== 'Enter') return
    const textarea = e.currentTarget
    const cursor = textarea.selectionStart
    const textBefore = userInput.slice(0, cursor)
    const textAfter = userInput.slice(cursor)
    const lineStart = textBefore.lastIndexOf('\n') + 1
    const currentLine = textBefore.slice(lineStart)
    const match = currentLine.match(/^(.*?)=\s*$/)
    if (!match) return
    const leftSide = match[1].trim()
    if (!leftSide) return
    const result = safeEval(leftSide)
    if (result === null) return
    e.preventDefault()
    const formatted = formatResult(result)
    const before = textBefore.replace(/=\s*$/, '= ')
    const newText = before + formatted + textAfter
    const newCursor = before.length + formatted.length
    setUserInput(newText)
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursor
        textareaRef.current.selectionEnd = newCursor
      }
    })
  }

  /**
   * Handler do botao "Calcular": avalia a ultima linha da textarea que termina com =
   * e substitui o resultado na mesma linha. Funciona igual ao Tab/Enter reativo mas
   * de forma explicita — para alunos que nao descobrem o atalho do teclado.
   */
  const handleCalcular = () => {
    const lines = userInput.split('\n')
    // Busca de tras pra frente a ultima linha que termina com =
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i]
      const match = line.match(/^(.*?)=\s*$/)
      if (!match) continue
      const leftSide = match[1].trim()
      if (!leftSide) continue
      const result = safeEval(leftSide)
      if (result === null) continue
      const formatted = formatResult(result)
      lines[i] = line.replace(/=\s*$/, '= ') + formatted
      setUserInput(lines.join('\n'))
      return
    }
    // Nenhuma linha com = valida — flash visual no output (sem quebrar)
    setOutput('Nada pra calcular. Escreva uma expressão terminada em "=" e clique Calcular.')
    setState('idle')
  }

  const handleExecute = async () => {
    if (!userInput.trim()) return
    setState('executing')
    setOutput('')
    setDebugText('')

    try {
      const res = await fetch('/api/eduven/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_id: exerciseId, user_input: userInput }),
      })
      const data = await res.json()

      if (!res.ok) {
        setOutput(data.error || 'Erro ao avaliar')
        setState('error')
        return
      }

      setSubmissionId(data.submissionId)
      setScore(data.score)
      trackEvent('exercise_submit', { exerciseId, score: data.score, isCorrect: data.isCorrect })

      if (data.isCorrect) {
        setOutput(data.executionOutput || 'Resposta correta! Parabéns!')
        setState('correct')
      } else {
        setOutput(data.executionOutput || `Resposta incorreta. ${data.errorType ? `Tipo de erro: ${data.errorType}` : ''}\nAperte "Debugar" para entender o que deu errado.`)
        setState('error')
      }
    } catch {
      setOutput('Erro de conexão. Tente novamente.')
      setState('error')
    }
  }

  const handleDebug = async () => {
    if (!submissionId) return
    setState('debugging')

    try {
      const res = await fetch('/api/eduven/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId }),
      })
      const data = await res.json()
      setDebugText(data.debugText || 'Erro ao gerar debug.')
      setState('debug_complete')
    } catch {
      setDebugText('Erro de conexão ao gerar debug.')
      setState('debug_complete')
    }
  }

  const inputBorderColor =
    state === 'correct' ? '#4ade80' :
    state === 'error' || state === 'debugging' || state === 'debug_complete' ? '#f97316' :
    '#1e293b'

  return (
    <div style={{ margin: '20px 0', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b' }}>
      <div style={{ padding: '16px 20px', background: '#0c1320', borderBottom: '1px solid #1e293b' }}>
        <div style={{ fontSize: 15, color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {prompt}
        </div>
        {showHints && hints.length > 0 && (
          <ul style={{ margin: '12px 0 0', paddingLeft: 20, color: '#94a3b8', fontSize: 13 }}>
            {hints.map((h, i) => <li key={i} style={{ marginBottom: 4 }}>{h}</li>)}
          </ul>
        )}
        {/* [Ver dicas] [Calcular] — mesma linha, DENTRO do prompt, ACIMA do input (canon stats) */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {hints.length > 0 && (
            <button
              onClick={() => setShowHints(!showHints)}
              style={{
                padding: '8px 18px', borderRadius: 8,
                border: '1px solid #64748b',
                background: showHints ? 'rgba(100,116,139,0.2)' : 'transparent',
                color: '#94a3b8',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {showHints ? 'Ocultar dicas' : `Ver dicas (${hints.length})`}
            </button>
          )}
          <button
            onClick={handleCalcular}
            disabled={!userInput.trim() || state === 'executing' || state === 'debugging'}
            style={{
              padding: '8px 18px', borderRadius: 8,
              border: 'none',
              background: '#f97316',
              color: '#fff',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              opacity: !userInput.trim() ? 0.4 : 1,
            }}
            title='Calcula a última expressão que termina com "=" na resposta'
          >
            Calcular
          </button>
        </div>
      </div>

      <div style={{ background: '#080c14' }}>
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={expectedInputExample
            ? `Exemplo de formato:\n${expectedInputExample}\n\nEscreva sua resolução aqui...\n\nDica: termine uma linha com "=" e aperte Tab pra calcular.`
            : 'Escreva sua resolução aqui.\n\nDica: termine uma linha com "=" e aperte Tab pra calcular.'}
          disabled={state === 'executing' || state === 'debugging'}
          style={{
            width: '100%', minHeight: 150, padding: 16, resize: 'vertical',
            background: '#080c14', color: '#e2e8f0', border: 'none',
            borderLeft: `3px solid ${inputBorderColor}`,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: 14,
            lineHeight: 1.6, outline: 'none',
            transition: 'border-color 0.3s',
          }}
        />
      </div>

      {/* Action row ABAIXO do input: so Corrigir + Debugar + Score (canon stats) */}
      <div style={{
        display: 'flex', gap: 10, padding: '12px 16px',
        background: '#0c1320', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b',
        alignItems: 'center',
      }}>
        <button
          onClick={handleExecute}
          disabled={!userInput.trim() || state === 'executing' || state === 'debugging'}
          style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: state === 'executing' ? '#1e293b' : '#22d3ee',
            color: state === 'executing' ? '#64748b' : '#0a0e17',
            fontWeight: 700, fontSize: 14, cursor: state === 'executing' ? 'wait' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            opacity: !userInput.trim() ? 0.4 : 1,
          }}
        >
          {state === 'executing' ? 'Corrigindo...' : 'Corrigir'}
        </button>

        <button
          onClick={handleDebug}
          disabled={state !== 'error' || !submissionId}
          style={{
            padding: '10px 24px', borderRadius: 8,
            border: '1px solid #f97316',
            background: state === 'debugging' ? '#f97316' : 'transparent',
            color: state === 'debugging' ? '#fff' : '#f97316',
            fontWeight: 700, fontSize: 14,
            cursor: state !== 'error' ? 'default' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            opacity: state !== 'error' ? 0.3 : 1,
          }}
        >
          {state === 'debugging' ? 'Debugando...' : 'Debugar'}
        </button>

        {score !== null && (
          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: score >= 0.8 ? '#4ade80' : score >= 0.5 ? '#fbbf24' : '#ef4444',
            fontWeight: 600,
          }}>
            Score: {(score * 100).toFixed(0)}%
          </div>
        )}
      </div>

      <div style={{ minHeight: 80, background: '#080c14', padding: state === 'idle' ? 0 : 16 }}>
        {state === 'correct' && (
          <div style={{ color: '#4ade80', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {output}
          </div>
        )}
        {state === 'error' && (
          <div style={{ color: '#f97316', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {output}
          </div>
        )}
        {(state === 'debugging' || state === 'debug_complete') && debugText && (
          <TypewriterOutput text={debugText} speed={12} />
        )}
        {state === 'executing' && (
          <div style={{ color: '#64748b', fontSize: 13, padding: 16 }}>
            Avaliando sua resposta...
          </div>
        )}
      </div>

      {(state === 'correct' || state === 'debug_complete') && onNewExercise && (
        <div style={{
          padding: '16px', background: '#0c1320', borderTop: '1px solid #1e293b',
          textAlign: 'center',
        }}>
          <button
            onClick={onNewExercise}
            style={{
              padding: '12px 32px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            Vamos tentar um novo exercício?
          </button>
        </div>
      )}
    </div>
  )
}

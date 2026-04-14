import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/eduven/debug — A Ella explica melhor o erro do aluno via LLM.
 * Body: { exercise_id, submission_id, user_input?, prompt? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userInput = String(body.user_input || '').trim()
    const exercisePrompt = String(body.prompt || 'Exercício sobre NR')
    const previousFeedback = String(body.previous_feedback || '')

    const llmPrompt = `Você é a Ella, instrutora paciente e didática de Segurança e Saúde do Trabalho.

O aluno errou ou não completou um exercício e pediu ajuda. Explique melhor:

EXERCÍCIO:
${exercisePrompt.slice(0, 600)}

RESPOSTA DO ALUNO:
${userInput.slice(0, 800)}

${previousFeedback ? `FEEDBACK ANTERIOR:\n${previousFeedback.slice(0, 400)}` : ''}

Explique de forma clara e encorajadora:
1. O que o aluno acertou (se algo)
2. Onde está o erro ou a lacuna
3. Uma dica concreta para chegar na resposta correta
4. Um exemplo prático do dia-a-dia do trabalhador

Tom: acolhedor, direto, sem ser condescendente. Use "você" (segunda pessoa).
Máximo 4 parágrafos. Português BR.`

    const claudeKey = process.env.ANTHROPIC_API_KEY
    if (claudeKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 800, messages: [{ role: 'user', content: llmPrompt }] }),
      })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({ debugOutput: data.content?.[0]?.text || 'A Ella está pensando...' })
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 800, messages: [{ role: 'user', content: llmPrompt }] }),
      })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({ debugOutput: data.choices?.[0]?.message?.content || '' })
      }
    }

    return NextResponse.json({ error: 'No LLM configured' }, { status: 500 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

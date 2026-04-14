import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/eduven/exercise — Ella diagnostica a resposta do aluno via LLM.
 * Body: { exercise_id, user_input, prompt? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userInput = String(body.user_input || '').trim()
    const exercisePrompt = String(body.prompt || 'Exercício sobre NR')

    if (!userInput) {
      return NextResponse.json({ error: 'Resposta vazia' }, { status: 400 })
    }

    const llmPrompt = `Você é a Ella, instrutora de Segurança e Saúde do Trabalho. Avalie a resposta do aluno ao exercício abaixo.

EXERCÍCIO:
${exercisePrompt.slice(0, 800)}

RESPOSTA DO ALUNO:
${userInput.slice(0, 1500)}

Avalie em JSON (sem markdown):
{
  "isCorrect": true/false,
  "score": 0.0 a 1.0,
  "errorType": null ou "conceitual" ou "incompleto" ou "incorreto",
  "executionOutput": "feedback detalhado da Ella em 2-3 parágrafos: o que está certo, o que falta, como melhorar"
}`

    const content = await callLLM(llmPrompt)
    try {
      const clean = content.replace(/```json?\s*/g, '').replace(/```/g, '').trim()
      const result = JSON.parse(clean)
      return NextResponse.json({
        submissionId: Date.now(),
        isCorrect: result.isCorrect ?? false,
        score: result.score ?? 0,
        errorType: result.errorType ?? null,
        executionOutput: result.executionOutput ?? 'Resposta avaliada.',
        canDebug: !result.isCorrect,
      })
    } catch {
      return NextResponse.json({
        submissionId: Date.now(),
        isCorrect: false, score: 0.5, errorType: null,
        executionOutput: content || 'A Ella avaliou sua resposta. Tente novamente com mais detalhes.',
        canDebug: true,
      })
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

async function callLLM(prompt: string): Promise<string> {
  const claudeKey = process.env.ANTHROPIC_API_KEY
  if (claudeKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.content?.[0]?.text || ''
    }
  }
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    }
  }
  throw new Error('No LLM configured')
}

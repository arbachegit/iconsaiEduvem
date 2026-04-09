import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { createMessage, extractText } from '@/lib/llm-client'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/eduven/debug
 * Body: { submission_id }
 *
 * Pega a submissao + exercicio + contexto, e gera uma explicacao
 * passo-a-passo do que deu errado. Retorna { debugText } pra typewriter.
 */

const DEBUG_SYSTEM_PROMPT = `Voce e um auditor fiscal do trabalho explicando pro aluno o que deu errado na resposta dele.

# REGRAS

- Passo a passo, com numeros. Ex: "1. Voce falou X. 2. O problema e Y. 3. A resposta certa e Z porque...".
- Tom direto, segunda pessoa, sem condescendencia.
- Concreto: use as palavras que o aluno usou, nao seja generico.
- Cite o item da norma quando relevante no formato [NR-X, item Y.Z].
- Maximo 200 palavras.
- Markdown simples (sem headings, so numeracao e bold se precisar).

Nao retorne JSON. Retorne texto puro, como se voce estivesse explicando pro aluno na tela.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const submissionId = parseInt(String(body.submission_id), 10)
    if (!submissionId) {
      return NextResponse.json({ error: 'submission_id obrigatorio' }, { status: 400 })
    }

    const db = getDb()

    // Load submission + exercise
    const { data: submission, error: subErr } = await db
      .from('submissions')
      .select('id, user_input, is_correct, score, error_type, error_detail, exercise_id')
      .eq('id', submissionId)
      .single()

    if (subErr || !submission) {
      return NextResponse.json({ error: 'Submissão não encontrada' }, { status: 404 })
    }

    const { data: exercise } = await db
      .from('exercises')
      .select('prompt_text, expected_solution_json')
      .eq('id', submission.exercise_id)
      .single()

    if (!exercise) {
      return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })
    }

    const userMsg = `Exercicio:
"${exercise.prompt_text}"

Expected solution:
${JSON.stringify(exercise.expected_solution_json, null, 2)}

Resposta do aluno:
"${submission.user_input}"

Erro detectado: ${submission.error_type || 'geral'}
${submission.error_detail ? `Detalhe: ${submission.error_detail}` : ''}

Explique passo a passo o que deu errado e como chegar na resposta certa. Texto puro, direto.`

    const response = await createMessage(
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: DEBUG_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
      },
      { route: '/api/eduven/debug' }
    )

    const debugText = extractText(response).trim()
    return NextResponse.json({ debugText })
  } catch (err) {
    console.error('[api/eduven/debug]', (err as Error).message)
    return NextResponse.json({ error: 'Erro ao gerar debug' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { createMessage, extractText } from '@/lib/llm-client'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/eduven/exercise
 * Body: { exercise_id, user_input }
 *
 * Avalia a resposta do aluno usando Claude. Salva em eduven.submissions.
 * Retorna { submissionId, isCorrect, score, errorType, executionOutput, canDebug }.
 */

const EVAL_SYSTEM_PROMPT = `Voce e um auditor fiscal do trabalho avaliando a resposta de um aluno a um exercicio sobre Norma Regulamentadora.

# REGRAS DE AVALIACAO

- NAO exija palavras exatas. Aceite diferentes formas de expressar a mesma ideia.
- NAO penalize por typos ou falta de acento.
- Aceite respostas que demonstrem COMPREENSAO dos conceitos-chave.
- Penalize respostas vazias, evasivas, ou que inventam NRs/itens inexistentes.
- Se o aluno cita um item da norma no formato [NR-X, item Y.Z], verifique coerencia com a expected_solution.

# TOM DA AVALIACAO

- Direto sem condescendencia
- Concreto: aponte o que acertou e o que faltou
- Sem fillers ("e importante destacar")
- Maximo 100 palavras no executionOutput

# FORMATO JSON ESTRITO

Retorne APENAS este JSON:

{
  "isCorrect": true | false,
  "score": 0.0 a 1.0,
  "errorType": null | "incomplete" | "incorrect" | "off_topic" | "vague",
  "errorDetail": null | "frase curta explicando o gap",
  "executionOutput": "Feedback direto pro aluno (se correto: elogio + por que; se errado: o que faltou)"
}

Score: 0.9-1.0 correto e completo. 0.6-0.8 correto parcial. 0.3-0.5 incorreto mas no caminho. 0.0-0.2 vazio/off-topic.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const exerciseId = parseInt(String(body.exercise_id), 10)
    const userInput = String(body.user_input || '').trim().slice(0, 5000)

    if (!exerciseId || !userInput) {
      return NextResponse.json({ error: 'exercise_id e user_input obrigatorios' }, { status: 400 })
    }

    const db = getDb()

    // Load exercise
    const { data: exercise, error: exErr } = await db
      .from('exercises')
      .select('id, lesson_id, section_index, exercise_type, prompt_text, expected_solution_json')
      .eq('id', exerciseId)
      .single()

    if (exErr || !exercise) {
      return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })
    }

    // Evaluate via Claude
    const userMsg = `Exercicio:
"${exercise.prompt_text}"

Expected solution (referencia):
${JSON.stringify(exercise.expected_solution_json, null, 2)}

Resposta do aluno:
"${userInput}"

Avalie e retorne APENAS o JSON especificado.`

    const response = await createMessage(
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: EVAL_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
      },
      { route: '/api/eduven/exercise' }
    )

    const raw = extractText(response)
    let parsed: {
      isCorrect: boolean
      score: number
      errorType: string | null
      errorDetail: string | null
      executionOutput: string
    }
    try {
      let s = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
      const start = s.indexOf('{'), end = s.lastIndexOf('}')
      parsed = JSON.parse(s.slice(start, end + 1))
    } catch {
      parsed = {
        isCorrect: false,
        score: 0,
        errorType: 'parse_error',
        errorDetail: 'Nao consegui parsear a avaliacao do Claude.',
        executionOutput: 'Erro ao processar sua resposta. Tenta de novo.',
      }
    }

    // Persist submission
    const { data: submission, error: subErr } = await db
      .from('submissions')
      .insert({
        exercise_id: exerciseId,
        user_id: null,
        user_input: userInput,
        is_correct: parsed.isCorrect,
        score: parsed.score,
        error_type: parsed.errorType,
        error_detail: parsed.errorDetail,
        attempt_number: 1,
      })
      .select('id')
      .single()

    return NextResponse.json({
      submissionId: submission?.id ?? null,
      isCorrect: parsed.isCorrect,
      score: parsed.score,
      errorType: parsed.errorType,
      executionOutput: parsed.executionOutput,
      canDebug: !parsed.isCorrect,
    })
  } catch (err) {
    console.error('[api/eduven/exercise]', (err as Error).message)
    return NextResponse.json({ error: 'Erro ao avaliar' }, { status: 500 })
  }
}

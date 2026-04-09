/**
 * exercise-generator — enriquece as secoes 4 e 6 de uma aula com exerciseData.
 *
 * Canon iconsaiStats: secoes 4 e 6 SEMPRE tem ExerciseWindow renderizada,
 * mesmo se o Claude falhar. Fallback 3-level:
 *
 *   Level 1 — Claude gera exerciseData estruturado (qualidade alta)
 *   Level 2 — usa exerciseData inline se o lesson-rest ja gerou junto
 *   Level 3 — stub minimal a partir do content da secao
 *
 * Persiste cada exercicio em eduven.exercises e retorna {sections, exerciseIds}.
 */
import { getDb } from './db'
import { createMessage, extractText } from './llm-client'
import type { LessonSection } from './lesson-generator'

export interface ExerciseData {
  prompt: string
  exerciseType: string
  expectedSolution: Record<string, unknown>
  hints: string[]
  difficultyScore: number
}

export interface EnrichedSection extends LessonSection {
  exerciseData?: ExerciseData
}

export interface EnrichResult {
  sections: EnrichedSection[]          // mesmas secoes, com exerciseData populado em 4 e 6
  exerciseIds: Record<number, number>  // { 4: 101, 6: 102 }
}

const TARGET_INDEXES = [4, 6] as const

const EXERCISE_SYSTEM_PROMPT = `Voce e um auditor fiscal do trabalho criando um exercicio pratico curto para um aluno do curso "O Interativo Mundo da NR".

# TOM
- Direto sem ser frio
- Concreto, com cenario do setor do aluno
- Enunciado curto (maximo 80 palavras)
- Nenhum filler

# FORMATO JSON ESTRITO
Retorne APENAS este JSON, sem markdown wrappers:

{
  "prompt": "Enunciado do exercicio. Cenario + pergunta direta. Termina com '?' ou 'Qual sua acao?'",
  "exerciseType": "open_text | checklist | multiple_choice",
  "expectedSolution": {
    "keyPoints": ["ponto 1 que a resposta deve conter", "ponto 2", "ponto 3"],
    "citations": ["NR-X, item Y.Z"]
  },
  "hints": ["Dica 1 curta", "Dica 2 mais especifica"],
  "difficultyScore": 0.5
}

difficultyScore: 0.2 (facil), 0.5 (medio), 0.8 (dificil).`

/**
 * Tenta parsear um JSON "sujo" (com markdown wrappers, texto antes/depois, etc).
 */
function safeParseJSON(raw: string): unknown {
  let s = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('no JSON found')
  return JSON.parse(s.slice(start, end + 1))
}

/**
 * LEVEL 1 — Claude gera exerciseData estruturado.
 */
async function generateExerciseViaLLM(
  nrCode: string,
  sectionTitle: string,
  sectionContent: string,
  sectorName: string
): Promise<ExerciseData | null> {
  try {
    const userMsg = `Crie um exercicio curto para a secao "${sectionTitle}" da aula sobre ${nrCode}, setor de ${sectorName}.

Contexto da secao (para basear o exercicio):
${sectionContent.slice(0, 800)}

Retorne APENAS o JSON especificado.`

    const response = await createMessage(
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: EXERCISE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
      },
      { route: '/lib/exercise-generator' }
    )

    const raw = extractText(response)
    const parsed = safeParseJSON(raw) as Partial<ExerciseData>

    if (!parsed.prompt || !parsed.exerciseType || !parsed.expectedSolution) {
      console.warn('[exercise-generator] LLM returned incomplete JSON')
      return null
    }

    return {
      prompt: String(parsed.prompt),
      exerciseType: String(parsed.exerciseType),
      expectedSolution: parsed.expectedSolution as Record<string, unknown>,
      hints: Array.isArray(parsed.hints) ? parsed.hints.map(String) : [],
      difficultyScore: typeof parsed.difficultyScore === 'number' ? parsed.difficultyScore : 0.5,
    }
  } catch (err) {
    console.warn('[exercise-generator] LLM generation failed:', (err as Error).message)
    return null
  }
}

/**
 * LEVEL 3 — stub minimal a partir do content da secao.
 * Ultima linha de defesa: sempre retorna algo valido, mesmo que generico.
 */
function stubExercise(sectionTitle: string, sectionContent: string): ExerciseData {
  // Tenta extrair a primeira frase do content pra usar como pergunta
  const firstSentence = sectionContent.split(/[.!?]/)[0]?.trim().slice(0, 200) || sectionContent.slice(0, 200)
  const promptText = sectionTitle.toLowerCase().includes('desafio')
    ? `Baseado no que voce leu, descreva em 3-4 linhas o que voce faria numa situacao similar e por que. Cite pelo menos 1 item da norma.`
    : `Com base nesta secao, identifique a acao mais critica que o trabalhador (ou a organizacao) precisa tomar. Explique em 3-4 linhas e cite o item da norma.`

  return {
    prompt: promptText,
    exerciseType: 'open_text',
    expectedSolution: {
      keyPoints: [
        'Identificar a acao ou medida critica relevante a secao',
        'Explicar o racional usando linguagem direta',
        'Citar pelo menos 1 item da norma [NR-X, item Y.Z]',
      ],
      citations: [],
      note: 'stub — avaliacao deve aceitar respostas que demonstrem compreensao da secao, nao cobrar palavras exatas',
    },
    hints: [
      'Reveja a secao e identifique a medida de seguranca mais critica mencionada',
      'Use o formato [NR-X, item Y.Z] para citar',
    ],
    difficultyScore: 0.4,
  }
}

/**
 * Persiste um exerciseData em eduven.exercises e retorna o ID.
 */
async function persistExercise(
  lessonId: number,
  sectionIndex: number,
  exerciseData: ExerciseData
): Promise<number | null> {
  try {
    const db = getDb()
    const { data, error } = await db
      .from('exercises')
      .insert({
        lesson_id: lessonId,
        section_index: sectionIndex,
        exercise_type: exerciseData.exerciseType,
        prompt_text: exerciseData.prompt,
        expected_solution_json: exerciseData.expectedSolution,
        hints_json: exerciseData.hints,
        difficulty_score: exerciseData.difficultyScore,
      })
      .select('id')
      .single()

    if (error || !data) {
      console.warn(`[exercise-generator] persist failed for section ${sectionIndex}: ${error?.message}`)
      return null
    }
    return (data as { id: number }).id
  } catch (err) {
    console.warn(`[exercise-generator] persist exception: ${(err as Error).message}`)
    return null
  }
}

/**
 * MAIN — enriquece as secoes 4 e 6 com exerciseData e persiste em eduven.exercises.
 *
 * Se o Claude falhar (level 1) E o lesson-rest nao gerou exerciseData inline (level 2),
 * usa stub minimal (level 3). SEMPRE retorna exerciseIds populados para 4 e 6.
 */
export async function enrichWithExercises(
  lessonId: number,
  sections: EnrichedSection[],
  nrCode: string,
  sectorName: string
): Promise<EnrichResult> {
  const enriched: EnrichedSection[] = [...sections]
  const exerciseIds: Record<number, number> = {}

  for (const targetIndex of TARGET_INDEXES) {
    const idx = enriched.findIndex(s => s.index === targetIndex)
    if (idx === -1) {
      console.warn(`[exercise-generator] secao ${targetIndex} nao existe nas sections retornadas`)
      continue
    }
    const section = enriched[idx]
    let exerciseData: ExerciseData | null = null

    // LEVEL 2 — exerciseData inline (se o lesson-rest ja gerou junto)
    if (section.exerciseData) {
      exerciseData = section.exerciseData
    }

    // LEVEL 1 — Claude gera estruturado (substitui inline se nao existia)
    if (!exerciseData) {
      exerciseData = await generateExerciseViaLLM(nrCode, section.titlePt, section.content, sectorName)
    }

    // LEVEL 3 — stub minimal
    if (!exerciseData) {
      exerciseData = stubExercise(section.titlePt, section.content)
    }

    enriched[idx] = { ...section, exerciseData }

    // Persiste
    const exId = await persistExercise(lessonId, targetIndex, exerciseData)
    if (exId) exerciseIds[targetIndex] = exId
  }

  return { sections: enriched, exerciseIds }
}

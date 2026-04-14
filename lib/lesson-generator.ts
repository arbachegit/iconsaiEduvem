/**
 * Lesson generator — gera aula em 2 estagios (fast + rest), padrao canonico do stats.
 *
 * STAGE 1 (generateLessonFast):
 *   - Gera APENAS a Secao 1 ("Por que isso importa?") em ~5-10s
 *   - Persiste lesson com sections=[s1]
 *   - Aluno comeca a ler imediatamente
 *
 * STAGE 2 (generateLessonRest):
 *   - Gera as Secoes 2-6 em background (~25-40s)
 *   - Atualiza o mesmo lessonId com sections completas
 *
 * Ambos os estagios:
 *   - Recebem nrId + sectorSlug + difficulty
 *   - Fazem RAG no banco vetorial
 *   - Aplicam tom canonico via composeLessonPrompt
 */
import { getDb } from './db'
import { queryNR, type RAGChunk } from './nr-rag'
import { createMessage, extractText, getProvider } from './llm-client'
import {
  buildLessonFastPrompt,
  buildLessonRestPrompt,
  NR_MODELS,
  NR_RAG_CONFIG,
  NR_DIFFICULTY_PROFILES,
  LESSON_SECTIONS,
  type NRDifficulty,
  type SectorContext,
} from '@/data/domain-configs/nr'
import { enrichWithExercises, type EnrichedSection } from './exercise-generator'
import { pickRandomCachedLesson, bumpViewCount } from './lesson-cache'

export interface LessonSection {
  index: number
  titlePt: string
  content: string
  exerciseData?: {
    prompt: string
    exerciseType: string
    expectedSolution: Record<string, unknown>
    hints: string[]
    difficultyScore: number
  }
}

interface NRRow { id: number; code: string; title: string; status: string }
interface SectorRow {
  id: number; slug: string; name: string;
  description: string; example_companies: string; typical_jobs: string[];
}

export interface LessonFastResult {
  lessonId: number
  nrId: number
  nrCode: string
  nrTitle: string
  sectorId: number
  sectorSlug: string
  sectorName: string
  difficulty: NRDifficulty
  title: string
  section1: LessonSection
  ragChunksUsed: number[]
  provider: 'anthropic' | 'openai' | 'unknown'
  generationMs: number
}

export interface LessonRestResult {
  lessonId: number
  sections: EnrichedSection[]           // secoes 2-6 (4 e 6 com exerciseData)
  exerciseIds: Record<number, number>   // { 4: id, 6: id }
  ragChunksUsed: number[]
  provider: 'anthropic' | 'openai' | 'unknown'
  generationMs: number
}

/* ─────────────────────────────────────────────────────────── */
/*   Helpers                                                    */
/* ─────────────────────────────────────────────────────────── */

async function loadNR(nrId: number): Promise<NRRow> {
  const db = getDb()
  const { data, error } = await db.from('nrs').select('id, code, title, status').eq('id', nrId).single()
  if (error || !data) throw new Error(`NR ${nrId} not found: ${error?.message}`)
  return data as NRRow
}

async function loadSector(sectorIdOrSlug: number | string): Promise<SectorRow> {
  const db = getDb()
  const q = db.from('sectors').select('id, slug, name, description, example_companies, typical_jobs')
  const { data, error } = typeof sectorIdOrSlug === 'number'
    ? await q.eq('id', sectorIdOrSlug).single()
    : await q.eq('slug', sectorIdOrSlug).single()
  if (error || !data) throw new Error(`Sector ${sectorIdOrSlug} not found: ${error?.message}`)
  return data as SectorRow
}

function sectorToContext(sector: SectorRow): SectorContext {
  return {
    slug: sector.slug,
    name: sector.name,
    description: sector.description,
    exampleCompanies: sector.example_companies,
    typicalJobs: sector.typical_jobs,
  }
}

function buildContextText(chunks: RAGChunk[]): string {
  return chunks
    .map((c, i) => `<chunk index=${i + 1} cite="[${c.nr_code}, item ${c.chapter}]">\n${c.content}\n</chunk>`)
    .join('\n\n')
}

function safeParseJSON(raw: string): unknown {
  let s = raw.trim()
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('no JSON object found in LLM response')
  return JSON.parse(s.slice(start, end + 1))
}

/* ─────────────────────────────────────────────────────────── */
/*   STAGE 1 — generateLessonFast                              */
/* ─────────────────────────────────────────────────────────── */

export interface FastOptions {
  sector: number | string
  difficulty?: NRDifficulty
}

export async function generateLessonFast(nrId: number, options: FastOptions): Promise<LessonFastResult> {
  const t0 = Date.now()
  if (!options.sector) throw new Error('generateLessonFast: sector obrigatorio')
  const difficulty: NRDifficulty = options.difficulty ?? 'same'

  const [nr, sector] = await Promise.all([loadNR(nrId), loadSector(options.sector)])

  // ═══ CACHE-FIRST ═══ tenta pegar variacao pre-gerada random
  const cached = await pickRandomCachedLesson(nr.id, sector.id, difficulty)
  if (cached && cached.sections.length >= 1) {
    bumpViewCount(cached.id)
    const section1 = cached.sections.find(s => s.index === 1) || cached.sections[0]
    return {
      lessonId: cached.id,
      nrId: nr.id,
      nrCode: nr.code,
      nrTitle: nr.title,
      sectorId: sector.id,
      sectorSlug: sector.slug,
      sectorName: sector.name,
      difficulty,
      title: cached.title,
      section1,
      ragChunksUsed: cached.rag_chunks_used,
      provider: 'unknown',    // cached — nao tem provider atual
      generationMs: Date.now() - t0,
    }
  }

  // CACHE MISS — gera live
  const rag = await queryNR(`${nr.code} ${nr.title} ${sector.name}`, {
    nrId,
    topK: NR_RAG_CONFIG.lessonGeneration.topK,
    minSimilarity: NR_RAG_CONFIG.lessonGeneration.minSimilarity,
  })
  if (rag.chunks.length === 0) throw new Error(`RAG retornou 0 chunks para ${nr.code}`)

  // Prompt: SECAO 1 only
  const sectorContext = sectorToContext(sector)
  const systemPrompt = buildLessonFastPrompt(sectorContext)
  const profile = NR_DIFFICULTY_PROFILES[difficulty]
  const userMsg = `Gere a Secao 1 da aula sobre ${nr.code}: "${nr.title}".

DIFICULDADE: ${difficulty.toUpperCase()}
${profile}

CONTEXTO DA NORMA (use APENAS isso para citar):

${buildContextText(rag.chunks)}

Lembre: TODO exemplo dentro do setor de ${sector.name}. Retorne APENAS o JSON especificado.`

  const response = await createMessage(
    {
      model: NR_MODELS.lessonGenerator,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMsg }],
    },
    { route: '/api/eduven/lesson-fast' }
  )

  const provider = getProvider(response)
  const rawText = extractText(response)
  const parsed = safeParseJSON(rawText) as { title: string; section1: LessonSection }

  if (!parsed.title || !parsed.section1?.content) {
    throw new Error('lesson-fast: JSON invalido (faltam title ou section1)')
  }

  // Persiste lesson com sections=[section1] e flag implicita "incompleta"
  const ragChunksUsed = rag.chunks.map(c => c.id)
  const db = getDb()
  const { data, error } = await db.from('lessons').insert({
    nr_id: nr.id,
    sector_id: sector.id,
    title: parsed.title,
    difficulty,
    sections: [parsed.section1],
    rag_chunks_used: ragChunksUsed,
  }).select('id').single()

  if (error || !data) throw new Error(`persist fast lesson: ${error?.message}`)
  const lessonId = (data as { id: number }).id

  return {
    lessonId,
    nrId: nr.id,
    nrCode: nr.code,
    nrTitle: nr.title,
    sectorId: sector.id,
    sectorSlug: sector.slug,
    sectorName: sector.name,
    difficulty,
    title: parsed.title,
    section1: parsed.section1,
    ragChunksUsed,
    provider,
    generationMs: Date.now() - t0,
  }
}

/* ─────────────────────────────────────────────────────────── */
/*   STAGE 2 — generateLessonRest                              */
/* ─────────────────────────────────────────────────────────── */

export interface RestOptions {
  lessonId: number
}

export async function generateLessonRest(options: RestOptions): Promise<LessonRestResult> {
  const t0 = Date.now()
  const db = getDb()

  // Carrega o lesson criado pelo fast
  const { data: lessonRow, error } = await db
    .from('lessons')
    .select('id, nr_id, sector_id, title, difficulty, sections, rag_chunks_used')
    .eq('id', options.lessonId)
    .single()
  if (error || !lessonRow) throw new Error(`lesson ${options.lessonId} not found: ${error?.message}`)

  const lesson = lessonRow as {
    id: number; nr_id: number; sector_id: number; title: string;
    difficulty: NRDifficulty; sections: LessonSection[]; rag_chunks_used: number[];
  }

  if (lesson.sections.length >= 6) {
    // Ja completa — retorna 2-6 do que ja tem (idempotencia + cache hit do pregenerated).
    // Cobre 2 casos:
    //   1. Usuario recarregou a mesma aula (idempotencia)
    //   2. lesson-fast retornou um cached pregenerated — todas as 6 secoes ja existem
    const sections26 = lesson.sections.filter(s => s.index >= 2)
    // Busca exerciseIds existentes pra essa lesson (pre-gerada ja populou)
    const { data: existingExercises } = await db
      .from('exercises')
      .select('id, section_index')
      .eq('lesson_id', lesson.id)
    const exerciseIds: Record<number, number> = {}
    if (existingExercises) {
      for (const ex of existingExercises as Array<{ id: number; section_index: number }>) {
        exerciseIds[ex.section_index] = ex.id
      }
    }
    return {
      lessonId: lesson.id,
      sections: sections26,
      exerciseIds,
      ragChunksUsed: lesson.rag_chunks_used,
      provider: 'unknown',
      generationMs: 0,
    }
  }

  // Re-load NR + sector pro prompt
  const [nr, sector] = await Promise.all([loadNR(lesson.nr_id), loadSector(lesson.sector_id)])

  // RAG (refaz pra ter chunks frescos pro contexto das secoes 2-6)
  const rag = await queryNR(`${nr.code} ${nr.title} ${sector.name} procedimentos exemplos`, {
    nrId: nr.id,
    topK: NR_RAG_CONFIG.lessonGeneration.topK,
    minSimilarity: NR_RAG_CONFIG.lessonGeneration.minSimilarity,
  })
  if (rag.chunks.length === 0) throw new Error(`RAG retornou 0 chunks na rest para ${nr.code}`)

  const sectorContext = sectorToContext(sector)
  const systemPrompt = buildLessonRestPrompt(sectorContext)
  const profile = NR_DIFFICULTY_PROFILES[lesson.difficulty]
  const section1Recap = lesson.sections[0]?.content?.slice(0, 400) || ''

  const userMsg = `Continue a aula sobre ${nr.code}: "${nr.title}".

DIFICULDADE: ${lesson.difficulty.toUpperCase()}
${profile}

A SECAO 1 ja foi gerada (resumo):
"${section1Recap}..."

CONTEXTO DA NORMA (use APENAS isso para citar):

${buildContextText(rag.chunks)}

Gere AGORA as secoes 2, 3, 4, 5 e 6, mantendo continuidade tonal. TODO exemplo dentro do setor de ${sector.name}. Retorne APENAS o JSON especificado.`

  const response = await createMessage(
    {
      model: NR_MODELS.lessonGenerator,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMsg }],
    },
    { route: '/api/eduven/lesson-rest' }
  )

  const provider = getProvider(response)
  const rawText = extractText(response)
  let parsed: { sections: Array<Partial<LessonSection> & { exerciseData?: unknown }> }
  try {
    parsed = safeParseJSON(rawText) as typeof parsed
  } catch (e) {
    console.error('[lesson-rest] JSON parse failed. Raw response (first 500 chars):', rawText.slice(0, 500))
    throw new Error(`lesson-rest: JSON parse error — ${(e as Error).message}`)
  }

  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    console.error('[lesson-rest] sections missing. Parsed:', JSON.stringify(parsed).slice(0, 500))
    throw new Error('lesson-rest: response missing sections array')
  }

  // ═══ KEYWORD MAPPING (canon iconsaiStats) ═══
  // Claude as vezes inventa titulos extras ou troca a ordem. NUNCA confiar em
  // posicao cega. Mapeamento por keyword pra slots 2-6, com fallback posicional.
  const rawInputs = parsed.sections.filter(s => s && typeof s.content === 'string' && s.content.trim())
  const mappedSlots = mapSectionsByKeyword(rawInputs)

  // Force canonical titles (sobrescreve o que o Claude escreveu)
  const canonicalSections: EnrichedSection[] = mappedSlots.map((raw, i) => {
    const canonIdx = i + 2 // slots 0..4 → indexes 2..6
    const canonMeta = LESSON_SECTIONS.find(s => s.index === canonIdx)!
    return {
      index: canonIdx,
      titlePt: canonMeta.titlePt, // forca canonico
      content: String(raw.content || ''),
      // preserva exerciseData inline se veio (level 2 do fallback)
      exerciseData: (raw as any).exerciseData as any,
    }
  })

  if (canonicalSections.length === 0) {
    throw new Error(`lesson-rest: nenhuma secao 2-6 valida no JSON retornado`)
  }

  // ═══ ENRICH WITH EXERCISES (canon iconsaiStats) ═══
  // Secoes 4 e 6 SEMPRE terao exerciseData + exerciseId (3-level fallback).
  const { sections: enrichedSections, exerciseIds } = await enrichWithExercises(
    lesson.id,
    canonicalSections,
    nr.code,
    sector.name
  )

  // Junta secao1 + secoes 2-6 enriched e atualiza o lesson
  const fullSections = [...lesson.sections, ...enrichedSections]
  const newRagUsed = Array.from(new Set([...lesson.rag_chunks_used, ...rag.chunks.map(c => c.id)]))

  const { error: upErr } = await db
    .from('lessons')
    .update({ sections: fullSections, rag_chunks_used: newRagUsed })
    .eq('id', lesson.id)
  if (upErr) console.warn(`[lesson-rest] update failed: ${upErr.message}`)

  return {
    lessonId: lesson.id,
    sections: enrichedSections,
    exerciseIds,
    ragChunksUsed: newRagUsed,
    provider,
    generationMs: Date.now() - t0,
  }
}

/**
 * Keyword mapping pras 5 secoes (2-6) do lesson-rest.
 * Canon iconsaiStats: nunca confiar em posicao cega no array do Claude.
 *
 * Ordem dos slots:
 *   slot 0 (→ index 2) — 'Entendendo na prática' — keywords: entend, pratica
 *   slot 1 (→ index 3) — 'Passo a passo'          — keywords: passo
 *   slot 2 (→ index 4) — 'Exemplo'                — keywords: exemplo, aplicacao, caso
 *   slot 3 (→ index 5) — 'Pontos fortes'          — keywords: ponto, forte, destaque
 *   slot 4 (→ index 6) — 'Desafio Prático'        — keywords: desafio, pratico
 */
function mapSectionsByKeyword<T extends { titlePt?: string; content?: string }>(inputs: T[]): T[] {
  const matchers: Array<(s: string) => boolean> = [
    (s) => /entend|prática|pratica/i.test(s),
    (s) => /passo/i.test(s),
    (s) => /exemplo|aplicac|caso/i.test(s),
    (s) => /ponto|forte|destaque/i.test(s),
    (s) => /desafio|prático|pratico/i.test(s),
  ]

  const slots: (T | null)[] = [null, null, null, null, null]
  const unclaimed = new Set(inputs.map((_, i) => i))

  // Primeira passada: match por titulo (mais confiavel)
  for (let slotIdx = 0; slotIdx < 5; slotIdx++) {
    const match = matchers[slotIdx]
    for (const i of unclaimed) {
      const title = (inputs[i].titlePt || '').toLowerCase()
      if (title && match(title)) {
        slots[slotIdx] = inputs[i]
        unclaimed.delete(i)
        break
      }
    }
  }

  // Segunda passada: fallback posicional pros slots vazios
  const remainder = [...unclaimed].sort((a, b) => a - b)
  for (let slotIdx = 0; slotIdx < 5; slotIdx++) {
    if (slots[slotIdx] !== null) continue
    const next = remainder.shift()
    if (next !== undefined) {
      slots[slotIdx] = inputs[next]
    }
  }

  // Remove slots ainda vazios (casos extremos)
  return slots.filter((s): s is T => s !== null)
}

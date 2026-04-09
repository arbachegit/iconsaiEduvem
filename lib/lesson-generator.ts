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
  type NRDifficulty,
  type SectorContext,
} from '@/data/domain-configs/nr'

export interface LessonSection {
  index: number
  titlePt: string
  content: string
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
  sections: LessonSection[]   // secoes 2-6
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

  // RAG
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
    // Ja completa — retorna 2-6 do que ja tem (idempotencia)
    return {
      lessonId: lesson.id,
      sections: lesson.sections.filter(s => s.index >= 2),
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
  let parsed: { sections: LessonSection[] }
  try {
    parsed = safeParseJSON(rawText) as { sections: LessonSection[] }
  } catch (e) {
    console.error('[lesson-rest] JSON parse failed. Raw response (first 500 chars):', rawText.slice(0, 500))
    throw new Error(`lesson-rest: JSON parse error — ${(e as Error).message}`)
  }

  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    console.error('[lesson-rest] sections missing. Parsed:', JSON.stringify(parsed).slice(0, 500))
    throw new Error('lesson-rest: response missing sections array')
  }

  // Aceita 4-6 secoes (modelo as vezes corta a 6 ou inclui 1 extra). Filtra so 2-6.
  parsed.sections = parsed.sections
    .filter(s => s && typeof s.index === 'number' && s.index >= 2 && s.index <= 6 && s.content)
    .sort((a, b) => a.index - b.index)

  if (parsed.sections.length === 0) {
    throw new Error(`lesson-rest: nenhuma secao 2-6 valida no JSON retornado`)
  }
  if (parsed.sections.length < 5) {
    console.warn(`[lesson-rest] aviso: recebeu ${parsed.sections.length} secoes (esperava 5). Continuando.`)
  }

  // Junta secao1 + secoes 2-6 e atualiza o lesson
  const fullSections = [...lesson.sections, ...parsed.sections]
  const newRagUsed = Array.from(new Set([...lesson.rag_chunks_used, ...rag.chunks.map(c => c.id)]))

  const { error: upErr } = await db
    .from('lessons')
    .update({ sections: fullSections, rag_chunks_used: newRagUsed })
    .eq('id', lesson.id)
  if (upErr) console.warn(`[lesson-rest] update failed: ${upErr.message}`)

  return {
    lessonId: lesson.id,
    sections: parsed.sections,
    ragChunksUsed: newRagUsed,
    provider,
    generationMs: Date.now() - t0,
  }
}

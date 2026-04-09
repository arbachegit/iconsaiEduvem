/**
 * Lesson generator — orquestra RAG + Claude para gerar uma aula de 6 secoes
 * sobre uma NR especifica.
 *
 * Pipeline:
 *   1. Carrega NR do banco (titulo, codigo, status)
 *   2. queryNR(titulo, { nrId, topK: 12 }) → 12 chunks de contexto
 *   3. Monta prompt: SYSTEM = LESSON_SYSTEM_PROMPT + difficulty profile
 *                    USER   = "Gere uma aula sobre <NR>" + contexto RAG
 *   4. Chama createMessage() (Claude com fallback OpenAI)
 *   5. Parse JSON (com retry de 1 reparse se vier sujo)
 *   6. Persiste em eduven.lessons com rag_chunks_used
 *   7. Retorna LessonResult
 */
import { getDb } from './db'
import { queryNR, type RAGChunk } from './nr-rag'
import { createMessage, extractText, getProvider } from './llm-client'
import {
  composeLessonPrompt,
  LESSON_SECTIONS,
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

export interface LessonResult {
  lessonId: number | null    // null se persistencia falhou (raro)
  nrId: number
  nrCode: string
  nrTitle: string
  sectorId: number
  sectorSlug: string
  sectorName: string
  difficulty: NRDifficulty
  title: string
  sections: LessonSection[]
  ragChunksUsed: number[]    // IDs dos chunks recuperados
  provider: 'anthropic' | 'openai' | 'unknown'
  generationMs: number
}

interface NRRow {
  id: number
  code: string
  title: string
  status: string
}

interface SectorRow {
  id: number
  slug: string
  name: string
  description: string
  example_companies: string
  typical_jobs: string[]
}

async function loadNR(nrId: number): Promise<NRRow> {
  const db = getDb()
  const { data, error } = await db
    .from('nrs')
    .select('id, code, title, status')
    .eq('id', nrId)
    .single()
  if (error || !data) throw new Error(`NR ${nrId} not found in eduven.nrs: ${error?.message}`)
  return data as NRRow
}

async function loadSector(sectorIdOrSlug: number | string): Promise<SectorRow> {
  const db = getDb()
  const query = db.from('sectors').select('id, slug, name, description, example_companies, typical_jobs')
  const { data, error } = typeof sectorIdOrSlug === 'number'
    ? await query.eq('id', sectorIdOrSlug).single()
    : await query.eq('slug', sectorIdOrSlug).single()
  if (error || !data) throw new Error(`Sector ${sectorIdOrSlug} not found in eduven.sectors: ${error?.message}`)
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

function buildUserMessage(
  nr: NRRow,
  sector: SectorRow,
  difficulty: NRDifficulty,
  context: string
): string {
  const profile = NR_DIFFICULTY_PROFILES[difficulty]
  return `Gere a aula completa sobre a ${nr.code}: "${nr.title}".

SETOR DO ALUNO: ${sector.name}
DIFICULDADE: ${difficulty.toUpperCase()}
${profile}

CONTEXTO DA NORMA (use APENAS isso para citar — NAO invente itens):

${context}

Lembre-se: TODO exemplo, TODA analogia, TODO cenario inventado deve estar dentro do setor de **${sector.name}**. Retorne APENAS o JSON conforme especificacao. Nada antes, nada depois. Sem markdown wrappers.`
}

/**
 * Tenta extrair JSON de uma resposta que pode ter wrappers markdown ou texto extra.
 */
function safeParseJSON(raw: string): unknown {
  // strip markdown code fences
  let s = raw.trim()
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  // find first { and last }
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('no JSON object found in response')
  return JSON.parse(s.slice(start, end + 1))
}

interface ParsedLesson {
  title: string
  sections: LessonSection[]
}

function validateLesson(parsed: unknown): ParsedLesson {
  if (!parsed || typeof parsed !== 'object') throw new Error('lesson is not an object')
  const p = parsed as Record<string, unknown>
  if (typeof p.title !== 'string') throw new Error('lesson.title missing')
  if (!Array.isArray(p.sections)) throw new Error('lesson.sections missing or not array')

  const sections: LessonSection[] = p.sections.map((s, i) => {
    if (!s || typeof s !== 'object') throw new Error(`section[${i}] not object`)
    const sec = s as Record<string, unknown>
    if (typeof sec.index !== 'number') throw new Error(`section[${i}].index missing`)
    if (typeof sec.titlePt !== 'string') throw new Error(`section[${i}].titlePt missing`)
    if (typeof sec.content !== 'string') throw new Error(`section[${i}].content missing`)
    return { index: sec.index, titlePt: sec.titlePt, content: sec.content }
  })

  if (sections.length !== LESSON_SECTIONS.length) {
    throw new Error(`expected ${LESSON_SECTIONS.length} sections, got ${sections.length}`)
  }

  return { title: p.title, sections }
}

/**
 * Persiste a aula em eduven.lessons. Retorna o id ou null se falhou.
 */
async function persistLesson(
  nr: NRRow,
  sector: SectorRow,
  difficulty: NRDifficulty,
  parsed: ParsedLesson,
  ragChunksUsed: number[]
): Promise<number | null> {
  try {
    const db = getDb()
    const { data, error } = await db.from('lessons').insert({
      nr_id: nr.id,
      sector_id: sector.id,
      title: parsed.title,
      difficulty,
      sections: parsed.sections,
      rag_chunks_used: ragChunksUsed,
    }).select('id').single()
    if (error || !data) {
      console.warn(`[lesson-generator] persist failed: ${error?.message}`)
      return null
    }
    return (data as { id: number }).id
  } catch (err) {
    console.warn(`[lesson-generator] persist exception: ${(err as Error).message}`)
    return null
  }
}

export interface GenerateOptions {
  /** ID numerico OU slug ('construcao_civil') do setor. Obrigatorio. */
  sector: number | string
  difficulty?: NRDifficulty   // default 'same'
  topK?: number               // default 12 (de NR_RAG_CONFIG)
  persist?: boolean           // default true
}

export async function generateLesson(nrId: number, options: GenerateOptions): Promise<LessonResult> {
  const t0 = Date.now()
  if (options.sector === undefined || options.sector === null) {
    throw new Error('generateLesson: options.sector eh obrigatorio (id ou slug)')
  }
  const difficulty: NRDifficulty = options.difficulty ?? 'same'
  const topK = options.topK ?? NR_RAG_CONFIG.lessonGeneration.topK
  const persist = options.persist !== false

  // 1. Load NR + Sector em paralelo
  const [nr, sector] = await Promise.all([loadNR(nrId), loadSector(options.sector)])

  // 2. RAG: query usando o titulo da NR + setor como semente
  const ragQuery = `${nr.code} ${nr.title} ${sector.name}`
  const rag = await queryNR(ragQuery, {
    nrId,
    topK,
    minSimilarity: NR_RAG_CONFIG.lessonGeneration.minSimilarity,
  })
  if (rag.chunks.length === 0) {
    throw new Error(`RAG retornou 0 chunks para ${nr.code} — verifique se a NR foi ingerida`)
  }

  // 3. Build prompt (sector-aware)
  const sectorContext = sectorToContext(sector)
  const systemPrompt = composeLessonPrompt(sectorContext)
  const context = buildContextText(rag.chunks)
  const userMessage = buildUserMessage(nr, sector, difficulty, context)

  // 4. Call LLM
  const llmResponse = await createMessage(
    {
      model: NR_MODELS.lessonGenerator,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    },
    { route: '/lib/lesson-generator' }
  )

  const provider = getProvider(llmResponse)
  const rawText = extractText(llmResponse)

  // 5. Parse + validate (com retry)
  let parsed: ParsedLesson
  try {
    parsed = validateLesson(safeParseJSON(rawText))
  } catch (err) {
    console.warn(`[lesson-generator] parse failed, retrying: ${(err as Error).message}`)
    const retryResponse = await createMessage(
      {
        model: NR_MODELS.lessonGenerator,
        max_tokens: 4000,
        system: systemPrompt + '\n\nIMPORTANTE: Sua resposta anterior nao era JSON valido. Retorne APENAS o objeto JSON, sem texto antes/depois, sem markdown.',
        messages: [{ role: 'user', content: userMessage }],
      },
      { route: '/lib/lesson-generator/retry' }
    )
    parsed = validateLesson(safeParseJSON(extractText(retryResponse)))
  }

  // 6. Persist
  const ragChunksUsed = rag.chunks.map(c => c.id)
  const lessonId = persist ? await persistLesson(nr, sector, difficulty, parsed, ragChunksUsed) : null

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
    sections: parsed.sections,
    ragChunksUsed,
    provider,
    generationMs: Date.now() - t0,
  }
}

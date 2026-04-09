/**
 * NR RAG — busca semantica nos chunks vetorizados das NRs.
 *
 * Uso:
 *   const result = await queryNR("o que diz a NR-35 sobre ancoragem?", { nrId: 35 })
 *   // result.chunks  → top-K chunks ordenados por similaridade
 *   // result.citations → ['NR-35, item 35.5.1', 'NR-35, item 35.5.2', ...]
 *
 * Implementacao:
 *   1. Embed da query via OpenAI text-embedding-3-small
 *   2. RPC eduven.match_nr_chunks(query_embedding, nr_filter, match_count)
 *   3. Format citations
 */
import { getDb } from './db'
import { embedTexts } from './embeddings'
import { NR_INDEX } from '@/data/nr-index'

export interface RAGChunk {
  id: number
  nr_id: number
  nr_code: string         // 'NR-35' (resolved from NR_INDEX)
  chapter: string         // '35.4.2.1'
  section_type: 'item' | 'annex' | 'header' | 'table'
  content: string
  token_count: number
  breadcrumb: Array<{ n: string; t: string }>
  similarity: number      // 0..1 (cosine, 1 = identical)
}

export interface RAGResult {
  query: string
  chunks: RAGChunk[]
  citations: string[]     // ['NR-35, item 35.4.2.1', ...]
  contextText: string     // chunks concatenados, prontos pra injetar em LLM
  totalTokens: number
}

export interface QueryOptions {
  nrId?: number           // filtra por uma NR especifica
  topK?: number           // default 6
  minSimilarity?: number  // default 0.3
}

const NR_BY_ID = new Map(NR_INDEX.map(n => [n.id, n]))

export async function queryNR(question: string, options: QueryOptions = {}): Promise<RAGResult> {
  const topK = options.topK ?? 6
  const minSim = options.minSimilarity ?? 0.3

  // 1. Embed query
  const [queryEmbedding] = await embedTexts([question])

  // 2. Vector search via RPC
  const db = getDb()
  const { data, error } = await db.rpc('match_nr_chunks', {
    query_embedding: queryEmbedding,
    nr_filter: options.nrId ?? null,
    match_count: topK,
    min_similarity: minSim,
  })

  if (error) throw new Error(`RAG query failed: ${error.message}`)
  if (!data || !Array.isArray(data)) return emptyResult(question)

  // 3. Enrich + format
  const chunks: RAGChunk[] = data.map((row: any) => ({
    id: row.id,
    nr_id: row.nr_id,
    nr_code: NR_BY_ID.get(row.nr_id)?.code || `NR-${String(row.nr_id).padStart(2, '0')}`,
    chapter: row.chapter,
    section_type: row.section_type,
    content: row.content,
    token_count: row.token_count,
    breadcrumb: row.breadcrumb || [],
    similarity: row.similarity,
  }))

  const citations = chunks.map(c => `${c.nr_code}, item ${c.chapter}`)
  const contextText = chunks
    .map(c => `[${c.nr_code}, item ${c.chapter}] ${c.content}`)
    .join('\n\n')
  const totalTokens = chunks.reduce((s, c) => s + c.token_count, 0)

  return { query: question, chunks, citations, contextText, totalTokens }
}

function emptyResult(query: string): RAGResult {
  return { query, chunks: [], citations: [], contextText: '', totalTokens: 0 }
}

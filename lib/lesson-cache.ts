/**
 * lesson-cache — busca aulas pre-geradas no banco.
 *
 * Cache-first: antes de chamar Claude, o lesson-fast e o lesson-rest
 * buscam uma variacao pre-gerada random via RPC. Se acham, servem
 * direto do DB (instantaneo). Se nao, geram live.
 *
 * 5 variacoes por (nrId, sectorId, difficulty) = 144 pares × 5 = 720
 * aulas pre-geradas total no cache.
 */
import { getDb } from './db'
import type { LessonSection } from './lesson-generator'

export interface CachedLesson {
  id: number
  nr_id: number
  sector_id: number
  title: string
  difficulty: string
  sections: LessonSection[]
  rag_chunks_used: number[]
  variation_index: number
}

/**
 * Busca uma variacao random pre-gerada que case com (nrId, sectorId, difficulty).
 * Retorna null se nenhuma disponivel (cache miss → caller deve gerar live).
 */
export async function pickRandomCachedLesson(
  nrId: number,
  sectorId: number,
  difficulty: string
): Promise<CachedLesson | null> {
  try {
    const db = getDb()
    const { data, error } = await db.rpc('pick_random_pregenerated_lesson', {
      p_nr_id: nrId,
      p_sector_id: sectorId,
      p_difficulty: difficulty,
    })

    if (error) {
      console.warn(`[lesson-cache] RPC failed: ${error.message}`)
      return null
    }
    if (!data || !Array.isArray(data) || data.length === 0) return null

    const row = data[0]
    return {
      id: row.id,
      nr_id: row.nr_id,
      sector_id: row.sector_id,
      title: row.title,
      difficulty: row.difficulty,
      sections: Array.isArray(row.sections) ? row.sections : [],
      rag_chunks_used: Array.isArray(row.rag_chunks_used) ? row.rag_chunks_used : [],
      variation_index: row.variation_index ?? 0,
    }
  } catch (err) {
    console.warn(`[lesson-cache] exception: ${(err as Error).message}`)
    return null
  }
}

/**
 * Incrementa view_count de uma aula servida do cache. Best-effort.
 * Roda em background (nao bloqueia resposta).
 */
export function bumpViewCount(lessonId: number): void {
  try {
    const db = getDb()
    // Direct UPDATE (SQLite, no RPC)
    db.from('lessons').update({ view_count: 1 }).eq('id', lessonId)
  } catch { /* best-effort */ }
  // Dead code below kept for reference (original Supabase version)
  if (false as boolean) {
  const db = getDb()
  }
}

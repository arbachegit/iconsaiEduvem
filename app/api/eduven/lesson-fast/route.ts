import { NextRequest, NextResponse } from 'next/server'
import { generateLessonFast } from '@/lib/lesson-generator'
import type { NRDifficulty } from '@/data/domain-configs/nr'

export const dynamic = 'force-dynamic'
export const maxDuration = 30   // stage 1 deve ser ~5-15s; cap em 30s

/**
 * POST /api/eduven/lesson-fast
 * Body: { nrId, sector, difficulty? }
 *
 * Gera APENAS a Secao 1 da aula (~5-10s).
 * Retorna { lessonId, title, section1, ... }
 *
 * Stage 2 (secoes 2-6) deve ser chamado em seguida via /api/eduven/lesson-rest
 * passando { lessonId } retornado aqui.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const nrId = parseInt(String(body.nrId), 10)
    const sector = body.sector
    const difficulty: NRDifficulty = body.difficulty || 'same'

    if (!nrId || isNaN(nrId)) return NextResponse.json({ error: 'nrId required' }, { status: 400 })
    if (!sector) return NextResponse.json({ error: 'sector required' }, { status: 400 })

    const result = await generateLessonFast(nrId, { sector, difficulty })
    return NextResponse.json(result)
  } catch (err) {
    const msg = (err as Error).message || 'unknown error'
    console.error('[api/eduven/lesson-fast]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

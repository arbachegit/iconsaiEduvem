import { NextRequest, NextResponse } from 'next/server'
import { generateLesson } from '@/lib/lesson-generator'
import type { NRDifficulty } from '@/data/domain-configs/nr'

export const dynamic = 'force-dynamic'
export const maxDuration = 90  // aulas levam 30-60s; cap em 90s

/**
 * POST /api/eduven/lesson
 * Body: { nrId: number, sector: string|number, difficulty?: 'easier'|'same'|'harder' }
 *
 * Retorna o LessonResult completo.
 * Sem rate-limit nesta versao MVP — adicionar quando expor pra producao.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const nrId = parseInt(String(body.nrId), 10)
    const sector = body.sector
    const difficulty: NRDifficulty = body.difficulty || 'same'

    if (!nrId || isNaN(nrId)) {
      return NextResponse.json({ error: 'nrId is required' }, { status: 400 })
    }
    if (!sector) {
      return NextResponse.json({ error: 'sector is required (slug or id)' }, { status: 400 })
    }

    const result = await generateLesson(nrId, { sector, difficulty })
    return NextResponse.json(result)
  } catch (err) {
    const msg = (err as Error).message || 'unknown error'
    console.error('[api/eduven/lesson]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

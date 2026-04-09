import { NextRequest, NextResponse } from 'next/server'
import { generateLessonRest } from '@/lib/lesson-generator'

export const dynamic = 'force-dynamic'
export const maxDuration = 90   // stage 2 e mais longo, cap 90s

/**
 * POST /api/eduven/lesson-rest
 * Body: { lessonId }
 *
 * Gera as secoes 2-6 da aula iniciada via /lesson-fast (~25-40s).
 * Retorna { lessonId, sections (2-6) }.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const lessonId = parseInt(String(body.lessonId), 10)
    if (!lessonId || isNaN(lessonId)) {
      return NextResponse.json({ error: 'lessonId required' }, { status: 400 })
    }

    const result = await generateLessonRest({ lessonId })
    return NextResponse.json(result)
  } catch (err) {
    const msg = (err as Error).message || 'unknown error'
    console.error('[api/eduven/lesson-rest]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

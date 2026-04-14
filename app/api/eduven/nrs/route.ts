import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/eduven/nrs                       → todas as 36 NRs vigentes
 * GET /api/eduven/nrs?sector=construcao_civil → NRs ordenadas por relevancia
 *                                              para o setor (descending)
 * GET /api/eduven/nrs?sector=X&min=3        → so NRs com relevance >= 3
 */
export async function GET(req: NextRequest) {
  try {
    const db = getDb()
    const sectorSlug = req.nextUrl.searchParams.get('sector')
    const minRelevance = parseInt(req.nextUrl.searchParams.get('min') || '0', 10)

    // Carrega NRs vigentes
    const { data: nrs, error: nrErr } = await db
      .from('nrs')
      .select('id, code, title, status, current_portaria')
      .eq('status', 'vigente')
      .order('id')

    if (nrErr) return NextResponse.json({ error: nrErr.message }, { status: 500 })

    // Sem filtro de setor → retorna todas
    if (!sectorSlug) {
      return NextResponse.json({ nrs: nrs || [], sector: null })
    }

    // Resolve setor
    const { data: sector, error: sErr } = await db
      .from('sectors')
      .select('id, slug, name')
      .eq('slug', sectorSlug)
      .single()
    if (sErr || !sector) {
      return NextResponse.json({ error: `sector '${sectorSlug}' not found` }, { status: 404 })
    }

    // Carrega relevancia
    const { data: rel, error: rErr } = await db
      .from('nr_sector_relevance')
      .select('nr_id, relevance, rationale')
      .eq('sector_id', sector.id)
    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

    // Junta + filtra + ordena
    const relMap = new Map((rel || []).map((r: any) => [r.nr_id, r]))
    const enriched = (nrs as any[] || [])
      .map((nr: any) => {
        const r = relMap.get(nr.id) as any
        return {
          ...nr,
          relevance: r?.relevance ?? 0,
          rationale: r?.rationale ?? null,
        }
      })
      .filter((nr: any) => nr.relevance >= minRelevance)
      .sort((a: any, b: any) => b.relevance - a.relevance || a.id - b.id)

    return NextResponse.json({ nrs: enriched, sector })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

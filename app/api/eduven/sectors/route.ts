import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { SECTORS_META } from '@/lib/sectors-meta'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb()
    const { data, error } = await db
      .from('sectors')
      .select('id, slug, name, description, example_companies, typical_jobs')
      .order('id')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Enrich with visual metadata
    const enriched = (data || []).map(s => ({
      ...s,
      meta: SECTORS_META[s.slug] || null,
    }))

    return NextResponse.json({ sectors: enriched })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

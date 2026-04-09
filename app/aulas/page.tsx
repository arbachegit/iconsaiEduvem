import { getDb } from '@/lib/db'
import AppHeader from '@/components/AppHeader'
import LessonLoader from '@/components/LessonLoader'
import FloatingButton from '@/components/FloatingButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ nr?: string; sector?: string; difficulty?: string }>
}

export default async function AulasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const nrId = params?.nr ? parseInt(params.nr, 10) : NaN
  const sectorSlug = params?.sector
  const difficulty = (params?.difficulty as 'easier' | 'same' | 'harder') || 'same'

  if (!nrId || isNaN(nrId) || !sectorSlug) {
    return (
      <>
        <AppHeader />
        <main style={{ maxWidth: 600, margin: '120px auto', padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, color: '#fca5a5', marginBottom: 12 }}>Parametros invalidos</h1>
          <p style={{ color: '#94a3b8', marginBottom: 20 }}>
            Use a URL no formato <code style={{ background: '#0c1320', padding: '2px 8px', borderRadius: 4 }}>?nr=35&amp;sector=construcao_civil</code>
          </p>
          <a href="/" style={{ display: 'inline-block', padding: '10px 20px', background: '#00d4ff', color: '#050d1a', borderRadius: 8, fontWeight: 700 }}>
            Voltar ao inicio
          </a>
        </main>
        <FloatingButton />
      </>
    )
  }

  // Resolve sector pra header (rapido — query simples)
  const db = getDb()
  const { data: sector } = await db.from('sectors').select('id, slug, name').eq('slug', sectorSlug).single()

  return (
    <>
      <AppHeader activeSectorSlug={sector?.slug || sectorSlug} activeSectorName={sector?.name || sectorSlug} />
      <main>
        <LessonLoader nrId={nrId} sector={sectorSlug} difficulty={difficulty} />
      </main>
      <FloatingButton />
    </>
  )
}

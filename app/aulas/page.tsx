import { generateLesson } from '@/lib/lesson-generator'
import { getDb } from '@/lib/db'
import AppHeader from '@/components/AppHeader'
import LessonView from '@/components/LessonView'
import FloatingButton from '@/components/FloatingButton'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

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
          <a href="/" style={{ display: 'inline-block', padding: '10px 20px', background: '#22d3ee', color: '#050d1a', borderRadius: 8, fontWeight: 700 }}>
            Voltar ao inicio
          </a>
        </main>
        <FloatingButton />
      </>
    )
  }

  // Resolve sector pra header
  const db = getDb()
  const { data: sector } = await db.from('sectors').select('id, slug, name').eq('slug', sectorSlug).single()

  try {
    const lesson = await generateLesson(nrId, { sector: sectorSlug, difficulty })
    return (
      <>
        <AppHeader activeSectorSlug={lesson.sectorSlug} activeSectorName={lesson.sectorName} />
        <main>
          <LessonView
            nrCode={lesson.nrCode}
            nrTitle={lesson.nrTitle}
            sectorSlug={lesson.sectorSlug}
            sectorName={lesson.sectorName}
            title={lesson.title}
            sections={lesson.sections}
          />
        </main>
        <FloatingButton />
      </>
    )
  } catch (err) {
    return (
      <>
        <AppHeader activeSectorSlug={sector?.slug} activeSectorName={sector?.name} />
        <main style={{ maxWidth: 600, margin: '120px auto', padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, color: '#fca5a5', marginBottom: 12 }}>Erro ao gerar aula</h1>
          <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 13, fontFamily: 'monospace' }}>
            {(err as Error).message}
          </p>
          <a href={sectorSlug ? `/?sector=${sectorSlug}` : '/'} style={{ display: 'inline-block', padding: '10px 20px', background: '#22d3ee', color: '#050d1a', borderRadius: 8, fontWeight: 700 }}>
            Voltar ao catalogo
          </a>
        </main>
        <FloatingButton />
      </>
    )
  }
}

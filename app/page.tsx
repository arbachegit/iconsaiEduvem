import { cookies } from 'next/headers'
import { getDb } from '@/lib/db'
import { getStudentProgress, type NRProgress } from '@/lib/student-progress'
import AppHeader from '@/components/AppHeader'
import SectorPicker from '@/components/SectorPicker'
import NRGrid from '@/components/NRGrid'
import FloatingButton from '@/components/FloatingButton'
import WelcomeModal from '@/components/WelcomeModal'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ sector?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const sectorSlug = params?.sector

  // Identifica aluno pelo cookie persistente (set pelo middleware)
  const cookieStore = await cookies()
  const studentId = cookieStore.get('eduven_student_id')?.value || ''
  const progress = studentId ? await getStudentProgress(studentId) : {}

  const db = getDb()

  // Sem setor → mostra picker
  if (!sectorSlug) {
    const { data: sectors } = await db
      .from('sectors')
      .select('id, slug, name, description, example_companies, typical_jobs')
      .order('id')
    return (
      <>
        <AppHeader />
        <main>
          <SectorPicker sectors={sectors || []} />
        </main>
        <WelcomeModal />
        <FloatingButton />
      </>
    )
  }

  // Com setor → carrega NRs ordenadas por relevancia
  const { data: sector } = await db
    .from('sectors')
    .select('id, slug, name')
    .eq('slug', sectorSlug)
    .single()

  if (!sector) {
    return (
      <>
        <AppHeader />
        <main style={{ maxWidth: 600, margin: '120px auto', padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, color: '#fca5a5', marginBottom: 12 }}>Setor nao encontrado</h1>
          <p style={{ color: '#94a3b8' }}>O setor &quot;{sectorSlug}&quot; nao existe.</p>
          <a href="/" style={{ display: 'inline-block', marginTop: 20, padding: '10px 20px', background: '#22d3ee', color: '#050d1a', borderRadius: 8, fontWeight: 700 }}>
            Voltar ao inicio
          </a>
        </main>
        <WelcomeModal />
        <FloatingButton />
      </>
    )
  }

  const { data: nrs } = await db
    .from('nrs')
    .select('id, code, title, status, current_portaria')
    .eq('status', 'vigente')

  const { data: rels } = await db
    .from('nr_sector_relevance')
    .select('nr_id, relevance, rationale')
    .eq('sector_id', sector.id)

  const relMap = new Map((rels || []).map(r => [r.nr_id, r]))
  const enriched = (nrs || [])
    .map(nr => {
      const r = relMap.get(nr.id)
      return {
        ...nr,
        relevance: r?.relevance ?? 0,
        rationale: r?.rationale ?? null,
      }
    })
    .filter(nr => nr.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || a.id - b.id)

  return (
    <>
      <AppHeader activeSectorSlug={sector.slug} activeSectorName={sector.name} />
      <main>
        <NRGrid nrs={enriched} sectorSlug={sector.slug} sectorName={sector.name} progress={progress} />
      </main>
      <WelcomeModal />
      <FloatingButton />
    </>
  )
}

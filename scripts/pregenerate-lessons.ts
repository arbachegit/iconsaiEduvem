/**
 * pregenerate-lessons — popular o banco com 5 variacoes por NR × setor × difficulty.
 *
 * Estrategia:
 *   Para cada (nrId, sectorId, difficulty='same') gera 5 aulas distintas e salva
 *   com is_pregenerated=true + variation_index=0..4. O API lesson-fast vai
 *   escolher uma random a cada request.
 *
 * Uso:
 *   npx tsx scripts/pregenerate-lessons.ts                    # todas as NRs/setores
 *   npx tsx scripts/pregenerate-lessons.ts --nr 6             # so NR-6 em todos os setores
 *   npx tsx scripts/pregenerate-lessons.ts --sector 1         # so construcao_civil em todas NRs
 *   npx tsx scripts/pregenerate-lessons.ts --variations 3     # so 3 variacoes por par
 *   npx tsx scripts/pregenerate-lessons.ts --force            # regera mesmo se ja existe
 *
 * Custo estimado (todas as 36 NRs × 4 setores × 5 variacoes = 720 pares):
 *   - Haiku 4.5 lesson-fast: ~1000 tokens in, ~500 out = ~$0.002
 *   - Haiku 4.5 lesson-rest: ~3000 in, ~2000 out = ~$0.008
 *   - Exercise eval x2: ~$0.001
 *   - Embedding RAG x2: ~$0.00001
 *   - Total por par: ~$0.011
 *   - Total 720 pares: ~$8
 *
 * Tempo: cada par ~20s → 720 × 20s = 4h. Roda com --nr e --sector em paralelo
 * se quiser acelerar.
 */
import '../lib/load-env'
import { getDb } from '../lib/db'
import { generateLessonFast, generateLessonRest } from '../lib/lesson-generator'
import { NR_INDEX } from '../data/nr-index'
import type { NRDifficulty } from '../data/domain-configs/nr'

interface CliArgs {
  nrIds: number[] | null
  sectorIds: number[] | null
  variations: number
  difficulty: NRDifficulty
  force: boolean
  dryRun: boolean
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  let nrIds: number[] | null = null
  let sectorIds: number[] | null = null
  let variations = 5
  let difficulty: NRDifficulty = 'same'
  let force = false
  let dryRun = false

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--nr')          nrIds = args[++i].split(',').map(n => parseInt(n, 10))
    else if (a === '--sector') sectorIds = args[++i].split(',').map(n => parseInt(n, 10))
    else if (a === '--variations') variations = parseInt(args[++i], 10)
    else if (a === '--difficulty') difficulty = args[++i] as NRDifficulty
    else if (a === '--force')  force = true
    else if (a === '--dry-run') dryRun = true
  }
  return { nrIds, sectorIds, variations, difficulty, force, dryRun }
}

interface Pair {
  nrId: number
  nrCode: string
  sectorId: number
  sectorSlug: string
}

async function loadPairs(args: CliArgs): Promise<Pair[]> {
  const db = getDb()
  const { data: sectors, error: sErr } = await db
    .from('sectors')
    .select('id, slug, name')
    .order('id')
  if (sErr || !sectors) throw new Error(`load sectors: ${sErr?.message}`)

  const activeNRs = NR_INDEX.filter(n => n.status === 'vigente')

  const nrs = args.nrIds
    ? activeNRs.filter(n => args.nrIds!.includes(n.id))
    : activeNRs
  const secs = args.sectorIds
    ? (sectors as Array<{ id: number; slug: string }>).filter(s => args.sectorIds!.includes(s.id))
    : (sectors as Array<{ id: number; slug: string }>)

  const pairs: Pair[] = []
  for (const nr of nrs) {
    for (const sec of secs) {
      pairs.push({ nrId: nr.id, nrCode: nr.code, sectorId: sec.id, sectorSlug: sec.slug })
    }
  }
  return pairs
}

async function alreadyPregenerated(
  pair: Pair, difficulty: NRDifficulty, variations: number
): Promise<number> {
  const db = getDb()
  const { count, error } = await db
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('nr_id', pair.nrId)
    .eq('sector_id', pair.sectorId)
    .eq('difficulty', difficulty)
    .eq('is_pregenerated', true)
  if (error) return 0
  return count ?? 0
}

async function markAsPregenerated(lessonId: number, variationIndex: number): Promise<void> {
  const db = getDb()
  const { error } = await db
    .from('lessons')
    .update({ is_pregenerated: true, variation_index: variationIndex })
    .eq('id', lessonId)
  if (error) console.warn(`[pregenerate] mark failed: ${error.message}`)
}

async function generateOneVariation(
  pair: Pair, difficulty: NRDifficulty, variationIndex: number, dryRun: boolean
): Promise<{ ok: boolean; ms: number; error?: string }> {
  const t0 = Date.now()
  try {
    if (dryRun) {
      console.log(`  [DRY-RUN] would generate var ${variationIndex}`)
      return { ok: true, ms: 0 }
    }

    const fast = await generateLessonFast(pair.nrId, {
      sector: pair.sectorId,
      difficulty,
    })

    // Wait stage2
    const rest = await generateLessonRest({ lessonId: fast.lessonId })
    void rest

    // Marca como pre-gerada
    await markAsPregenerated(fast.lessonId, variationIndex)

    return { ok: true, ms: Date.now() - t0 }
  } catch (err) {
    return { ok: false, ms: Date.now() - t0, error: (err as Error).message }
  }
}

async function main() {
  const args = parseArgs()
  const pairs = await loadPairs(args)

  console.log(`\npregenerate-lessons`)
  console.log(`  Pairs: ${pairs.length}`)
  console.log(`  Variations per pair: ${args.variations}`)
  console.log(`  Difficulty: ${args.difficulty}`)
  console.log(`  Total generations: ${pairs.length * args.variations}`)
  console.log(`  Mode: ${args.dryRun ? 'DRY-RUN' : args.force ? 'FORCE' : 'skip-existing'}`)
  console.log(`  Custo estimado: $${((pairs.length * args.variations) * 0.011).toFixed(2)}`)
  console.log(``)

  let totalOk = 0, totalFail = 0, totalSkip = 0
  const tAll = Date.now()

  for (const pair of pairs) {
    const existing = args.force ? 0 : await alreadyPregenerated(pair, args.difficulty, args.variations)
    if (existing >= args.variations) {
      console.log(`[${pair.nrCode}/${pair.sectorSlug}] ${existing} variacoes ja existem — skip`)
      totalSkip += args.variations
      continue
    }

    const startFrom = args.force ? 0 : existing
    console.log(`[${pair.nrCode}/${pair.sectorSlug}] gerando variacoes ${startFrom}..${args.variations - 1}`)

    for (let v = startFrom; v < args.variations; v++) {
      const result = await generateOneVariation(pair, args.difficulty, v, args.dryRun)
      if (result.ok) {
        console.log(`  var ${v}: OK (${result.ms}ms)`)
        totalOk++
      } else {
        console.error(`  var ${v}: FAIL — ${result.error}`)
        totalFail++
      }
    }
  }

  const elapsedMin = ((Date.now() - tAll) / 60000).toFixed(1)
  console.log(`\n${'='.repeat(60)}`)
  console.log(`SUMMARY`)
  console.log(`${'='.repeat(60)}`)
  console.log(`OK:     ${totalOk}`)
  console.log(`Skip:   ${totalSkip}`)
  console.log(`Fail:   ${totalFail}`)
  console.log(`Tempo:  ${elapsedMin} min`)
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})

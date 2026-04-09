/**
 * seed-nr-sector-relevance — usa Claude para classificar a relevancia
 * de cada par (NR, Setor) numa escala 0-5, com justificativa.
 *
 * Uso:
 *   npx tsx scripts/seed-nr-sector-relevance.ts                # processa tudo
 *   npx tsx scripts/seed-nr-sector-relevance.ts --sector 1     # so um setor
 *   npx tsx scripts/seed-nr-sector-relevance.ts --dry-run      # nao grava
 *   npx tsx scripts/seed-nr-sector-relevance.ts --force        # reclassifica tudo
 *
 * Estrategia:
 *   - 1 chamada Claude por SETOR (nao por par), passando a lista das 36 NRs
 *   - Claude retorna JSON com {nr_id: relevance, rationale}[]
 *   - Custo: ~$0.05 por setor x 4 setores = ~$0.20 total
 *   - Tempo: ~30s por setor
 *
 * Idempotencia: pula pares ja classificados (a menos que --force).
 */
import '../lib/load-env'
import { getDb } from '../lib/db'
import { createMessage, extractText } from '../lib/llm-client'

interface NRRow {
  id: number
  code: string
  title: string
}

interface SectorRow {
  id: number
  slug: string
  name: string
  description: string
  example_companies: string
  typical_jobs: string[]
}

interface CliArgs {
  sectorId: number | null
  dryRun: boolean
  force: boolean
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  let sectorId: number | null = null
  let dryRun = false
  let force = false
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--sector') sectorId = parseInt(args[++i], 10)
    else if (a === '--dry-run') dryRun = true
    else if (a === '--force') force = true
  }
  return { sectorId, dryRun, force }
}

const SYSTEM_PROMPT = `Voce eh um auditor fiscal do trabalho experiente, classificando relevancia de Normas Regulamentadoras brasileiras por setor de atividade.

Para cada NR da lista que o usuario fornecer, classifique de 0 a 5 quanto ela eh relevante para o setor descrito:

- 0 = irrelevante (nao se aplica de forma alguma ao setor)
- 1 = tangencial (so se aplica em situacao excepcional, como visita a outro setor)
- 2 = ocasional (aplica-se a uma minoria de cargos ou situacoes do setor)
- 3 = relevante (aplica-se a parte significativa do setor, mas nao eh nucleo)
- 4 = muito relevante (parte central da seguranca do setor)
- 5 = critica (sem essa NR, o setor nao opera legalmente; eh fundacional)

Seja honesto. Nao infle a relevancia. Uma NR de mineracao para escritorio de contabilidade eh 0 ou 1, nao 3.

Formato de saida: JSON estrito, sem markdown wrappers, sem texto antes/depois:

{
  "classifications": [
    { "nr_id": 1, "relevance": 5, "rationale": "frase curta de 1-2 linhas" },
    { "nr_id": 3, "relevance": 0, "rationale": "..." },
    ...
  ]
}

A frase de rationale deve ser SEM rodeios, direto ao ponto, citando o motivo concreto. Ex: "obrigatoria — toda obra com >20 trabalhadores tem CIPA" ou "irrelevante — escritorio nao tem agente quimico ou biologico".`

function buildUserMessage(sector: SectorRow, nrs: NRRow[]): string {
  const nrList = nrs.map(n => `- ${n.code} (id=${n.id}): ${n.title}`).join('\n')
  return `SETOR: ${sector.name}
${sector.description}
Empresas tipicas: ${sector.example_companies}
Cargos tipicos: ${sector.typical_jobs.join(', ')}

CLASSIFIQUE AS SEGUINTES NRs (relevancia 0-5):

${nrList}

Retorne JSON com classificacoes para TODAS as NRs listadas.`
}

interface Classification {
  nr_id: number
  relevance: number
  rationale: string
}

function safeParseJSON(raw: string): { classifications: Classification[] } {
  let s = raw.trim()
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('no JSON object found')
  return JSON.parse(s.slice(start, end + 1))
}

async function classifySector(sector: SectorRow, nrs: NRRow[]): Promise<Classification[]> {
  const userMsg = buildUserMessage(sector, nrs)
  console.log(`  classifying ${nrs.length} NRs for ${sector.slug}...`)
  const t0 = Date.now()
  const response = await createMessage(
    {
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }],
    },
    { route: '/scripts/seed-nr-sector-relevance' }
  )
  const text = extractText(response)
  const parsed = safeParseJSON(text)
  console.log(`  got ${parsed.classifications.length} classifications in ${Date.now() - t0}ms`)
  return parsed.classifications
}

async function main() {
  const args = parseArgs()
  const db = getDb()

  // Load sectors + NRs
  const sectorsQ = db.from('sectors').select('id, slug, name, description, example_companies, typical_jobs').order('id')
  const { data: sectors, error: sErr } = args.sectorId
    ? await sectorsQ.eq('id', args.sectorId)
    : await sectorsQ
  if (sErr) throw new Error(`load sectors: ${sErr.message}`)
  if (!sectors || sectors.length === 0) throw new Error('No sectors found. Run migration 20260409000002 first.')

  const { data: nrs, error: nErr } = await db
    .from('nrs')
    .select('id, code, title')
    .eq('status', 'vigente')
    .order('id')
  if (nErr) throw new Error(`load nrs: ${nErr.message}`)
  if (!nrs || nrs.length === 0) throw new Error('No NRs found. Run ingestion first.')

  console.log(`\nseed-nr-sector-relevance`)
  console.log(`  Sectors: ${sectors.length}`)
  console.log(`  NRs: ${nrs.length}`)
  console.log(`  Total pairs: ${sectors.length * nrs.length}`)
  console.log(`  Mode: ${args.dryRun ? 'DRY-RUN' : args.force ? 'FORCE' : 'idempotent'}`)
  console.log()

  let totalUpserted = 0
  let totalSkipped = 0
  let totalFailed = 0

  for (const sector of sectors as SectorRow[]) {
    console.log(`\n[${sector.slug}] ${sector.name}`)

    // Idempotency: skip if already has classifications (unless --force)
    if (!args.force) {
      const { count } = await db
        .from('nr_sector_relevance')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sector.id)
      if (count && count >= nrs.length) {
        console.log(`  ${count} classifications already exist — skipping (use --force to redo)`)
        totalSkipped += count
        continue
      }
    }

    try {
      const classifications = await classifySector(sector, nrs as NRRow[])

      if (args.dryRun) {
        console.log(`  [DRY-RUN] would upsert ${classifications.length} rows`)
        for (const c of classifications.slice(0, 5)) {
          console.log(`    NR-${String(c.nr_id).padStart(2, '0')}: ${c.relevance}/5 — ${c.rationale}`)
        }
        if (classifications.length > 5) console.log(`    ... +${classifications.length - 5} more`)
        totalUpserted += classifications.length
        continue
      }

      // Upsert
      const rows = classifications.map(c => ({
        nr_id: c.nr_id,
        sector_id: sector.id,
        relevance: Math.max(0, Math.min(5, c.relevance)),
        rationale: c.rationale,
        classified_by: 'llm',
      }))

      const { error: upErr } = await db
        .from('nr_sector_relevance')
        .upsert(rows, { onConflict: 'nr_id,sector_id' })
      if (upErr) throw new Error(`upsert: ${upErr.message}`)

      totalUpserted += rows.length
      console.log(`  ✓ ${rows.length} pairs upserted`)

      // Quick distribution summary
      const byLvl: Record<number, number> = {}
      for (const r of rows) byLvl[r.relevance] = (byLvl[r.relevance] || 0) + 1
      const distStr = [0, 1, 2, 3, 4, 5].map(l => `${l}:${byLvl[l] || 0}`).join(' ')
      console.log(`  distribution: ${distStr}`)
    } catch (err) {
      totalFailed++
      console.error(`  FAIL: ${(err as Error).message}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`SUMMARY  upserted=${totalUpserted}  skipped=${totalSkipped}  failed=${totalFailed}`)
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})

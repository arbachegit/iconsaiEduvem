/**
 * ingest-nr — pipeline completo de ingestao de NRs.
 *
 * Uso:
 *   npm run ingest:nr            # todas as 38 NRs
 *   npm run ingest:nr:pilot      # 5 piloto (NR-01, NR-05, NR-06, NR-10, NR-35)
 *   npx tsx scripts/ingest-nr.ts --nr 35       # uma especifica
 *   npx tsx scripts/ingest-nr.ts --nr 1,5,10   # multiplas
 *
 * Pipeline (por NR):
 *   1. Fetch landing page → extrai URL do PDF "atualizado"
 *   2. Download PDF → sha256
 *   3. Se ja existe raw_source com mesmo sha256 → pula (idempotente)
 *   4. pdf-parse → texto
 *   5. extractHeaderMeta() → metadados de portarias
 *   6. parseNRText() → chunks hierarquicos
 *   7. embedTexts() → batch OpenAI
 *   8. Upsert eduven.nrs + nr_raw_sources + nr_chunks (delete old chunks)
 *   9. Report stats
 *
 * Idempotente: re-rodar so reprocessa NRs que mudaram.
 */
import 'dotenv/config'
import pdfParse from 'pdf-parse'
import { getDb } from '../lib/db'
import { NR_INDEX, PILOT_NRS, type NRIndexEntry } from '../data/nr-index'
import { parseNRText, extractHeaderMeta, type ParsedChunk } from '../lib/nr-parser'
import { resolvePdfUrl, downloadPdf } from '../lib/nr-fetcher'
import { embedTexts, EMBEDDING_MODEL_NAME } from '../lib/embeddings'

const PARSER_VERSION = 'v1'

interface CliArgs {
  pilot: boolean
  nrIds: number[] | null  // null = all
  force: boolean          // re-ingest even if sha matches
  dryRun: boolean         // skip DB writes
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  let pilot = false
  let nrIds: number[] | null = null
  let force = false
  let dryRun = false

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--pilot') pilot = true
    else if (a === '--force') force = true
    else if (a === '--dry-run') dryRun = true
    else if (a === '--nr') {
      const v = args[++i]
      if (!v) throw new Error('--nr requires a value')
      nrIds = v.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    }
  }
  return { pilot, nrIds, force, dryRun }
}

function selectNRs(args: CliArgs): NRIndexEntry[] {
  if (args.nrIds) return NR_INDEX.filter(n => args.nrIds!.includes(n.id))
  if (args.pilot) return NR_INDEX.filter(n => PILOT_NRS.includes(n.id))
  return NR_INDEX.filter(n => n.status === 'vigente')
}

interface IngestStats {
  code: string
  status: 'success' | 'skipped' | 'failed'
  chunks: number
  tokens: number
  ms: number
  error?: string
}

async function ingestOne(nr: NRIndexEntry, args: CliArgs): Promise<IngestStats> {
  const t0 = Date.now()
  const db = getDb()
  console.log(`\n[${nr.code}] ${nr.title}`)

  try {
    // 1+2. Resolve + download PDF
    console.log(`  resolving PDF URL...`)
    const pdfUrl = await resolvePdfUrl(nr.source_url)
    console.log(`  PDF: ${pdfUrl.split('/').pop()}`)
    const { buf, sha256 } = await downloadPdf(pdfUrl)
    console.log(`  downloaded ${(buf.length / 1024).toFixed(0)}KB sha=${sha256.slice(0, 12)}`)

    // 3. Idempotency check
    if (!args.force) {
      const { data: existing } = await db
        .from('nr_raw_sources')
        .select('id, parser_version')
        .eq('nr_id', nr.id)
        .eq('pdf_sha256', sha256)
        .maybeSingle()
      if (existing && existing.parser_version === PARSER_VERSION) {
        console.log(`  unchanged (sha + parser_version match) — skipping`)
        return { code: nr.code, status: 'skipped', chunks: 0, tokens: 0, ms: Date.now() - t0 }
      }
    }

    // 4. Parse PDF
    console.log(`  parsing PDF...`)
    const parsed = await pdfParse(buf)
    const rawText = parsed.text
    if (rawText.length < 500) throw new Error(`PDF text too short (${rawText.length} chars) — possibly scanned image`)

    // 5. Extract header metadata
    const headerMeta = extractHeaderMeta(rawText)

    // 6. Chunk hierarchically
    const chunks = parseNRText(rawText)
    if (chunks.length === 0) throw new Error('parseNRText returned 0 chunks')
    const totalTok = chunks.reduce((s, c) => s + c.token_count, 0)
    console.log(`  ${chunks.length} chunks (${totalTok} tokens, avg ${Math.round(totalTok / chunks.length)})`)

    // 7. Embed all chunks
    console.log(`  embedding via ${EMBEDDING_MODEL_NAME}...`)
    const embeddings = await embedTexts(chunks.map(c => c.content))

    if (args.dryRun) {
      console.log(`  [DRY-RUN] would upsert NR + ${chunks.length} chunks`)
      return { code: nr.code, status: 'success', chunks: chunks.length, tokens: totalTok, ms: Date.now() - t0 }
    }

    // 8. Upsert NR row
    const { error: nrErr } = await db.from('nrs').upsert({
      id: nr.id,
      code: nr.code,
      title: nr.title,
      status: nr.status,
      source_url: nr.source_url,
      pdf_url: pdfUrl,
      pdf_sha256: sha256,
      current_portaria: headerMeta.current_portaria,
      current_portaria_date: headerMeta.current_portaria_date,
      full_text: rawText,
      metadata: {
        portarias_history: headerMeta.portarias_history,
        chunk_count: chunks.length,
        token_count: totalTok,
        parser_version: PARSER_VERSION,
        embedding_model: EMBEDDING_MODEL_NAME,
      },
    })
    if (nrErr) throw new Error(`upsert nr: ${nrErr.message}`)

    // 8b. Save raw source
    const { error: rawErr } = await db.from('nr_raw_sources').insert({
      nr_id: nr.id,
      pdf_url: pdfUrl,
      pdf_bytes: buf,
      pdf_sha256: sha256,
      extracted_text: rawText,
      parser_version: PARSER_VERSION,
    })
    if (rawErr && !rawErr.message.includes('duplicate')) throw new Error(`insert raw: ${rawErr.message}`)

    // 8c. Replace chunks (delete old + insert new)
    const { error: delErr } = await db.from('nr_chunks').delete().eq('nr_id', nr.id)
    if (delErr) throw new Error(`delete old chunks: ${delErr.message}`)

    const chunkRows = chunks.map((c: ParsedChunk, i) => ({
      nr_id: nr.id,
      chapter: c.chapter,
      breadcrumb: c.breadcrumb,
      section_type: c.section_type,
      chunk_index: i,
      content: c.content,
      token_count: c.token_count,
      embedding: embeddings[i],
      parser_version: PARSER_VERSION,
    }))

    // Insert in batches of 50 to avoid payload size issues
    for (let i = 0; i < chunkRows.length; i += 50) {
      const batch = chunkRows.slice(i, i + 50)
      const { error: insErr } = await db.from('nr_chunks').insert(batch)
      if (insErr) throw new Error(`insert chunks batch ${i}: ${insErr.message}`)
    }

    console.log(`  OK (${Date.now() - t0}ms)`)
    return { code: nr.code, status: 'success', chunks: chunks.length, tokens: totalTok, ms: Date.now() - t0 }
  } catch (err: unknown) {
    const msg = (err as Error).message
    console.error(`  FAIL: ${msg}`)
    return { code: nr.code, status: 'failed', chunks: 0, tokens: 0, ms: Date.now() - t0, error: msg }
  }
}

async function main() {
  const args = parseArgs()
  const targets = selectNRs(args)
  console.log(`Ingest plan: ${targets.length} NRs${args.dryRun ? ' [DRY-RUN]' : ''}${args.force ? ' [FORCE]' : ''}`)
  console.log(`  ${targets.map(n => n.code).join(', ')}`)

  const stats: IngestStats[] = []
  for (const nr of targets) {
    stats.push(await ingestOne(nr, args))
  }

  // Summary
  const ok = stats.filter(s => s.status === 'success')
  const skipped = stats.filter(s => s.status === 'skipped')
  const failed = stats.filter(s => s.status === 'failed')
  const totalChunks = ok.reduce((s, r) => s + r.chunks, 0)
  const totalTokens = ok.reduce((s, r) => s + r.tokens, 0)

  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`Success: ${ok.length}`)
  console.log(`Skipped: ${skipped.length}`)
  console.log(`Failed:  ${failed.length}`)
  console.log(`Total chunks: ${totalChunks}`)
  console.log(`Total tokens: ${totalTokens}`)
  if (failed.length) {
    console.log('\nFailures:')
    for (const f of failed) console.log(`  ${f.code}: ${f.error}`)
    process.exit(1)
  }
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})

/**
 * test-lesson — gera uma aula completa de uma NR via CLI.
 *
 * Uso:
 *   npx tsx scripts/test-lesson.ts --nr 35
 *   npx tsx scripts/test-lesson.ts --nr 5 --difficulty easier
 *   npx tsx scripts/test-lesson.ts --nr 10 --difficulty harder --no-persist
 *
 * Mostra: 6 secoes formatadas, citacoes detectadas por secao, chunks usados,
 * provider (anthropic/openai), tempo total. Custo: ~$0.05 por chamada.
 *
 * Use --no-persist se quiser testar sem gravar em eduven.lessons.
 */
import '../lib/load-env'
import { generateLesson } from '../lib/lesson-generator'
import type { NRDifficulty } from '@/data/domain-configs/nr'

interface CliArgs {
  nrId: number
  sector: string
  difficulty: NRDifficulty
  persist: boolean
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  let nrId: number | undefined
  let sector: string | undefined
  let difficulty: NRDifficulty = 'same'
  let persist = true

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--nr') nrId = parseInt(args[++i], 10)
    else if (a === '--sector') sector = args[++i]
    else if (a === '--difficulty') {
      const v = args[++i]
      if (v !== 'easier' && v !== 'same' && v !== 'harder') {
        throw new Error(`difficulty deve ser easier|same|harder, recebido: ${v}`)
      }
      difficulty = v
    }
    else if (a === '--no-persist') persist = false
  }
  if (!nrId || isNaN(nrId) || !sector) {
    console.error('Uso: npx tsx scripts/test-lesson.ts --nr <id> --sector <slug> [--difficulty easier|same|harder] [--no-persist]')
    console.error('Setores disponiveis: construcao_civil | engenharia_civil | industria_calcados | escritorio_contabilidade')
    process.exit(1)
  }
  return { nrId, sector, difficulty, persist }
}

function countCitations(text: string): { count: number; cites: string[] } {
  // [NR-X, item Y.Z] e variantes com ", alínea g" / ", parágrafo único" etc.
  const re = /\[NR-\d+,[^\]]+\]/gi
  const matches = text.match(re) || []
  return { count: matches.length, cites: matches }
}

function pluralize(n: number, sing: string, plur: string): string {
  return n === 1 ? `${n} ${sing}` : `${n} ${plur}`
}

async function main() {
  const args = parseArgs()
  console.log(`\nGerando aula NR-${String(args.nrId).padStart(2, '0')} | setor=${args.sector} | difficulty=${args.difficulty} | persist=${args.persist}`)
  console.log('Isso leva 10-30s. Aguarde.\n')

  const t0 = Date.now()
  const lesson = await generateLesson(args.nrId, {
    sector: args.sector,
    difficulty: args.difficulty,
    persist: args.persist,
  })
  const ms = Date.now() - t0

  console.log('='.repeat(80))
  console.log(`AULA GERADA — ${lesson.nrCode} ${lesson.nrTitle}`)
  console.log(`SETOR: ${lesson.sectorName}`)
  console.log('='.repeat(80))
  console.log(`Titulo:      ${lesson.title}`)
  console.log(`Provider:    ${lesson.provider}`)
  console.log(`Tempo:       ${ms}ms`)
  console.log(`Lesson ID:   ${lesson.lessonId ?? '(nao persistido)'}`)
  console.log(`Chunks RAG:  ${lesson.ragChunksUsed.length} (ids: ${lesson.ragChunksUsed.slice(0, 5).join(', ')}${lesson.ragChunksUsed.length > 5 ? '...' : ''})`)
  console.log()

  let totalCites = 0
  for (const sec of lesson.sections) {
    const { count, cites } = countCitations(sec.content)
    totalCites += count
    const status = count >= 1 ? '✓' : '✗'
    console.log('─'.repeat(80))
    console.log(`${status} Secao ${sec.index} — ${sec.titlePt}  (${pluralize(count, 'citacao', 'citacoes')})`)
    if (cites.length > 0) console.log(`   Citacoes: ${cites.join(' | ')}`)
    console.log('─'.repeat(80))
    console.log(sec.content)
    console.log()
  }

  console.log('='.repeat(80))
  console.log('VALIDACAO')
  console.log('='.repeat(80))
  console.log(`Secoes:           ${lesson.sections.length}/6  ${lesson.sections.length === 6 ? '✓' : '✗'}`)
  console.log(`Total citacoes:   ${totalCites}`)
  console.log(`Min 1 cite/secao: ${lesson.sections.every(s => countCitations(s.content).count >= 1) ? '✓' : '✗'}`)
  console.log(`Provider:         ${lesson.provider}`)
}

main().catch(err => {
  console.error('FATAL:', err)
  if (err instanceof Error && err.stack) console.error(err.stack)
  process.exit(1)
})

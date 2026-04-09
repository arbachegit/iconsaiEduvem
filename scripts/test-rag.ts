/**
 * test-rag — CLI para testar a busca semantica nos chunks das NRs.
 *
 * Uso:
 *   npx tsx scripts/test-rag.ts "o que diz a NR-35 sobre ancoragem?"
 *   npx tsx scripts/test-rag.ts --nr 10 "quais sao as medidas de protecao individual em servicos eletricos?"
 *   npx tsx scripts/test-rag.ts --topk 10 "como deve ser a CIPA?"
 *   npx tsx scripts/test-rag.ts --min 0.5 "trabalho em altura"
 *
 * Mostra: chunks recuperados ordenados por similaridade, com citacao,
 * preview do conteudo e tokens. Custo por query: ~$0.00002.
 */
import '../lib/load-env'
import { queryNR } from '../lib/nr-rag'

interface CliArgs {
  question: string
  nrId?: number
  topK?: number
  minSimilarity?: number
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  let nrId: number | undefined
  let topK: number | undefined
  let minSimilarity: number | undefined
  const free: string[] = []

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--nr')   { nrId = parseInt(args[++i], 10) }
    else if (a === '--topk') { topK = parseInt(args[++i], 10) }
    else if (a === '--min')  { minSimilarity = parseFloat(args[++i]) }
    else { free.push(a) }
  }
  if (free.length === 0) {
    console.error('Uso: npx tsx scripts/test-rag.ts [--nr N] [--topk K] [--min 0.X] "sua pergunta"')
    process.exit(1)
  }
  return { question: free.join(' '), nrId, topK, minSimilarity }
}

function preview(s: string, len = 220): string {
  if (s.length <= len) return s
  return s.substring(0, len) + '…'
}

async function main() {
  const args = parseArgs()
  console.log(`\nQuery: "${args.question}"`)
  if (args.nrId) console.log(`Filtro: NR-${String(args.nrId).padStart(2, '0')}`)
  console.log(`Top-K: ${args.topK ?? 6}  | min similarity: ${args.minSimilarity ?? 0.3}\n`)

  const t0 = Date.now()
  const result = await queryNR(args.question, {
    nrId: args.nrId,
    topK: args.topK,
    minSimilarity: args.minSimilarity,
  })
  const ms = Date.now() - t0

  if (result.chunks.length === 0) {
    console.log('Nenhum chunk acima do limiar de similaridade.')
    console.log(`(${ms}ms)`)
    return
  }

  console.log('='.repeat(80))
  console.log(`${result.chunks.length} chunks recuperados em ${ms}ms (${result.totalTokens} tokens totais)`)
  console.log('='.repeat(80))
  result.chunks.forEach((c, i) => {
    const breadcrumb = c.breadcrumb.length > 0
      ? '  ' + c.breadcrumb.map(b => `${b.n}`).join(' › ') + ` › ${c.chapter}`
      : ''
    console.log(`\n#${i + 1}  [${c.nr_code} item ${c.chapter}]  similarity=${c.similarity.toFixed(3)}  tok=${c.token_count}`)
    if (breadcrumb) console.log(breadcrumb)
    console.log(`  ${preview(c.content)}`)
  })

  console.log('\n' + '='.repeat(80))
  console.log('Citations (formato pronto pra LLM):')
  console.log('  ' + result.citations.join(' | '))
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})

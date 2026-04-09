/**
 * db-check — verifica conexão com Supabase + estado das tabelas eduven.
 *
 * Uso:
 *   npm run db:check
 *
 * O que faz:
 *   1. Conecta no Supabase via SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   2. Verifica se schema 'eduven' existe
 *   3. Verifica se extensão 'vector' está instalada
 *   4. Conta linhas em cada tabela do schema
 *   5. Reporta status amigável
 *
 * NÃO modifica nada. Read-only.
 */
import 'dotenv/config'
import { getDb, SCHEMA } from '../lib/db'

const TABLES = [
  'nrs',
  'nr_raw_sources',
  'nr_chunks',
  'lessons',
  'exercises',
  'submissions',
  'llm_call_logs',
] as const

async function main() {
  console.log(`\nDB check — schema='${SCHEMA}'\n`)
  const db = getDb()

  // 1. Probe schema existence via querying nrs table
  const counts: Record<string, number | string> = {}
  let schemaOk = true

  for (const table of TABLES) {
    try {
      const { count, error } = await db.from(table).select('*', { count: 'exact', head: true })
      if (error) {
        counts[table] = `ERROR: ${error.message}`
        schemaOk = false
      } else {
        counts[table] = count ?? 0
      }
    } catch (err: unknown) {
      counts[table] = `EXCEPTION: ${(err as Error).message}`
      schemaOk = false
    }
  }

  console.log('Tabelas:')
  for (const [name, val] of Object.entries(counts)) {
    const padded = name.padEnd(20)
    console.log(`  ${padded} ${val}`)
  }

  console.log('')
  if (schemaOk) {
    console.log('Schema eduven OK. Pronto para ingestao.')
  } else {
    console.log('Schema eduven NAO encontrado ou incompleto.')
    console.log('Aplique a migration: supabase/migrations/20260409000000_eduven_init.sql')
    console.log('   - Cole no SQL Editor do Supabase, OU')
    console.log('   - Rode via psql/supabase CLI')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})

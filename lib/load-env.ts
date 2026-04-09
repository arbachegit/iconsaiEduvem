/**
 * Carrega .env.local (e .env como fallback) explicitamente.
 *
 * dotenv/config carrega apenas .env por default. Os scripts CLI deste projeto
 * usam .env.local (convencao Next.js), entao precisamos importar este helper
 * ANTES de qualquer codigo que leia process.env.
 *
 * Uso: `import './lib/load-env'` (ou `import '@/lib/load-env'`) no topo do script.
 */
import { config } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

const candidates = ['.env.local', '.env']
for (const f of candidates) {
  const p = resolve(process.cwd(), f)
  if (existsSync(p)) {
    config({ path: p })
  }
}

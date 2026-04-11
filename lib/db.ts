/**
 * Supabase client — schema-aware via SUPABASE_SCHEMA env var.
 *
 * Portabilidade: trocar de banco/schema = mudar 2 vars no .env.local.
 * Hoje: banco do iconsaiIcon, schema 'eduven'.
 * Futuro: banco próprio do eduven, schema 'public'.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const schema = process.env.SUPABASE_SCHEMA || 'eduven'

if (!url || !key) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any, any, any> | null = null

export function getDb() {
  if (!_client) {
    _client = createClient(url!, key!, {
      db: { schema },
      auth: { persistSession: false },
    })
  }
  return _client
}

export const SCHEMA = schema

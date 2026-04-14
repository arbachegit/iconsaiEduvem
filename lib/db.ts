/**
 * DB stub — Eduvem POC usa dados hardcoded.
 * Este stub existe apenas para que imports existentes não quebrem.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY_CHAIN: any = {
  select: () => EMPTY_CHAIN,
  eq: () => EMPTY_CHAIN,
  neq: () => EMPTY_CHAIN,
  gte: () => EMPTY_CHAIN,
  lte: () => EMPTY_CHAIN,
  like: () => EMPTY_CHAIN,
  ilike: () => EMPTY_CHAIN,
  in: () => EMPTY_CHAIN,
  or: () => EMPTY_CHAIN,
  order: () => EMPTY_CHAIN,
  limit: () => EMPTY_CHAIN,
  range: () => EMPTY_CHAIN,
  single: () => ({ data: null, error: null, count: 0 }),
  maybeSingle: () => ({ data: null, error: null }),
  insert: () => ({ data: null, error: null, select: () => ({ single: () => ({ data: null, error: null }) }) }),
  upsert: () => ({ data: null, error: null }),
  update: () => EMPTY_CHAIN,
  delete: () => EMPTY_CHAIN,
  then: (resolve: any) => resolve({ data: [], error: null, count: 0 }),
  _exec: () => ({ data: [], error: null, count: 0 }),
}

export function getDb() {
  return {
    from: (_table?: string) => EMPTY_CHAIN,
    rpc: (_name?: string, _params?: any) => ({ data: null, error: null }),
  }
}

export function from(_table?: string) { return EMPTY_CHAIN }

export const SCHEMA = 'eduvem'

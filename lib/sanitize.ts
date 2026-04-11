/**
 * Centralized sanitization utilities for API routes.
 * All external input MUST pass through these functions before use.
 */

/** Trim and normalize Unicode (NFC) */
export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  let clean = input.trim().normalize('NFC');
  clean = clean.replace(/[\r\n\t]/g, ' ');       // log injection
  clean = clean.replace(/\s{2,}/g, ' ');          // collapse whitespace
  if (clean.length > maxLength) clean = clean.substring(0, maxLength);
  return clean;
}

/** Parse and validate positive integer */
export function sanitizeInt(input: unknown, defaultVal = 0, min = 0, max = 999999): number {
  const n = typeof input === 'string' ? parseInt(input, 10) : typeof input === 'number' ? input : defaultVal;
  if (isNaN(n)) return defaultVal;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

/** Sanitize error for logging (no stack traces or DB details in production) */
export function sanitizeError(err: unknown): string {
  if (err instanceof Error) {
    return err.message.replace(/[\r\n]/g, ' ').substring(0, 200);
  }
  return String(err).replace(/[\r\n]/g, ' ').substring(0, 200);
}

/** Validate table name against whitelist */
const ALLOWED_TABLES = [
  'nrs', 'nr_chunks', 'nr_raw_sources', 'sectors', 'nr_sector_relevance',
  'lessons', 'exercises', 'submissions', 'llm_call_logs', 'user_events',
];

export function isValidTable(name: unknown): name is string {
  return typeof name === 'string' && ALLOWED_TABLES.includes(name);
}

/** Validate sort column against whitelist */
const ALLOWED_SORT_COLUMNS = [
  'id', 'slug', 'label', 'title', 'description', 'nr_code', 'nr_number',
  'chunk_index', 'content', 'source_url', 'sector_name', 'relevance_score',
  'difficulty', 'created_at', 'updated_at', 'ts', 'provider', 'model_req',
  'model_used', 'route', 'latency_ms', 'success', 'type', 'user_ip',
];

export function sanitizeSort(input: unknown): string {
  if (typeof input !== 'string') return '';
  return ALLOWED_SORT_COLUMNS.includes(input) ? input : '';
}

/** Validate sort order */
export function sanitizeOrder(input: unknown): 'ASC' | 'DESC' {
  return input === 'DESC' ? 'DESC' : 'ASC';
}

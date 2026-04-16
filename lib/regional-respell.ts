/**
 * regional-respell.ts — reescreve texto pra induzir sotaque regional no TTS.
 *
 * Estratégia: gpt-4o-mini-tts pronuncia o que lê. Trocando ortografia
 * (palavras + fonemas comuns) conseguimos mover a percepção do sotaque
 * MUITO mais que via `instructions` (que dá só nuance de tom/ritmo).
 *
 * NÃO mexer em:
 *   - códigos de NR (NR-01, etc)
 *   - números (24, 60%, etc)
 *   - palavras técnicas-chave (PCMSO, PGR, EPI, CIPA, NR, SESMT)
 *
 * Aplicação por sigla de UF; fallback pra grupo regional quando não há
 * regra específica.
 */

import { type RegionSlug, type UFMeta, getUFBySigla } from '@/data/uf-meta'

const PROTECTED_TOKENS = [
  /NR-?\d{1,2}/gi,
  /\b(PCMSO|PGR|EPI|EPC|CIPA|SESMT|NR|MTE|MTb|MTP|GRO|PCMAT|PPP)\b/gi,
  /\b\d+([.,]\d+)?\s*(%|mil|R\$)?\b/gi,
]

interface RespellRule {
  /** Aplicada como find/replace global, case-INSENSITIVE. */
  pattern: RegExp
  replace: string
}

/* ── Conjuntos de regras por região ───────────────────────────────── */

// CARIOCA (RJ): chiado em S — a marca do sotaque. Aplica em duas posicoes:
//   1) S em coda interna antes de consoante: "esta" → "eshta", "escola" → "eshcola"
//   2) S no final de palavra: "vamos" → "vamosh", "as casas" → "ash cazash"
// Tambem ti/di palatal e RR arrastado.
const CARIOCA: RespellRule[] = [
  // (1) S em coda interna — antes de qualquer consoante (exceto S/H/J/X que ja sao chiantes)
  { pattern: /s(?=[pctkqgbdfvmnlr])/gi, replace: 'sh' },
  // (2) Final -s antes de pausa ou espaço: "vamos" → "vamosh"
  { pattern: /s(?=\s|$|[.,!?;:])/gi, replace: 'sh' },
  // ti/di palatalizados (toda BR mas marcado no RJ)
  { pattern: /ti(?=[aeoiu])/gi, replace: 'tchi' },
  { pattern: /di(?=[aeoiu])/gi, replace: 'dji' },
  // -te / -de finais
  { pattern: /te\b/gi, replace: 'tchi' },
  { pattern: /de\b/gi, replace: 'dji' },
  // RR arrastado (sugere com "rr")
  { pattern: /\brr/gi, replace: 'rrr' },
]

// PAULISTANO (SP capital): default, sem mudanças (o nova já é base)
const PAULISTANO: RespellRule[] = []

// MINEIRO: "cê" no lugar de "você", drop de letras finais, "uai"
const MINEIRO: RespellRule[] = [
  { pattern: /\bvocês\b/gi, replace: 'cêis' },
  { pattern: /(?<![A-Za-zÀ-ÿ])você(?![A-Za-zÀ-ÿ])/gi, replace: 'cê' },
  { pattern: /(?<![A-Za-zÀ-ÿ])está(?![A-Za-zÀ-ÿ])/gi, replace: 'tá' },
  { pattern: /\bestou\b/gi, replace: 'tô' },
  { pattern: /\bestamos\b/gi, replace: 'tamo' },
  { pattern: /\bpor\s+favor\b/gi, replace: 'pôfavô' },
  // Drop -r final dos infinitivos
  { pattern: /([aeiou])r\b/gi, replace: '$1' },
  // "menino" → "minino"
  { pattern: /\bmenin/gi, replace: 'minin' },
]

// GAÚCHO (RS): "tu" no lugar de "você", rr forte
const GAUCHO: RespellRule[] = [
  { pattern: /\bvocês\b/gi, replace: 'vocês' },  // mantém pra plural
  { pattern: /(?<![A-Za-zÀ-ÿ])você(?![A-Za-zÀ-ÿ])/gi, replace: 'tu' },
  { pattern: /\bvai\s+fazer\b/gi, replace: 'vais fazer' },
  { pattern: /\bvai\b/gi, replace: 'vais' },
  { pattern: /(?<![A-Za-zÀ-ÿ])está(?![A-Za-zÀ-ÿ])/gi, replace: 'tá' },
  // RR forte
  { pattern: /\brr/gi, replace: 'rrr' },
  { pattern: /\bcarro\b/gi, replace: 'carrro' },
]

// BAIANO (BA): vogais abertas, drop de -r, "oxe"
const BAIANO: RespellRule[] = [
  { pattern: /(?<![A-Za-zÀ-ÿ])você(?![A-Za-zÀ-ÿ])/gi, replace: 'cê' },
  { pattern: /(?<![A-Za-zÀ-ÿ])está(?![A-Za-zÀ-ÿ])/gi, replace: 'tá' },
  { pattern: /\bestou\b/gi, replace: 'tô' },
  { pattern: /([aeiou])r\b/gi, replace: '$1' },     // drop -r final
  { pattern: /\bporta\b/gi, replace: 'pôrta' },
  { pattern: /\bbocas\b/gi, replace: 'bôcas' },
  { pattern: /\bgosto\b/gi, replace: 'gôsto' },
  { pattern: /\boutro\b/gi, replace: 'ôtro' },
]

// NORDESTINO genérico (PE/AL/CE/PB/RN/PI/MA/SE)
const NORDESTINO: RespellRule[] = [
  { pattern: /(?<![A-Za-zÀ-ÿ])você(?![A-Za-zÀ-ÿ])/gi, replace: 'cê' },
  { pattern: /(?<![A-Za-zÀ-ÿ])está(?![A-Za-zÀ-ÿ])/gi, replace: 'tá' },
  { pattern: /\bestou\b/gi, replace: 'tô' },
  // ti/di palatal forte
  { pattern: /ti(?=[aeoiu])/gi, replace: 'tchi' },
  { pattern: /di(?=[aeoiu])/gi, replace: 'dji' },
  { pattern: /te\b/gi, replace: 'tchi' },
  { pattern: /de\b/gi, replace: 'dji' },
  // "muito" → "muinto"
  { pattern: /\bmuito\b/gi, replace: 'muinto' },
  // Drop -r final
  { pattern: /([aeiou])r\b/gi, replace: '$1' },
]

// CAPIXABA (ES): proximo do mineiro
const CAPIXABA: RespellRule[] = [
  { pattern: /(?<![A-Za-zÀ-ÿ])você(?![A-Za-zÀ-ÿ])/gi, replace: 'cê' },
  { pattern: /(?<![A-Za-zÀ-ÿ])está(?![A-Za-zÀ-ÿ])/gi, replace: 'tá' },
  { pattern: /\bestou\b/gi, replace: 'tô' },
]

// CURITIBANO/PARANAENSE (PR): "leite quente", articulação clara, RR forte
const CURITIBANO: RespellRule[] = [
  { pattern: /\bleite\b/gi, replace: 'leitchê' },
  { pattern: /\bquente\b/gi, replace: 'quentchê' },
  { pattern: /\brr/gi, replace: 'rrh' },
]

// CATARINENSE (SC manezinho): chia o S igual carioca + "ti/di" suave
const CATARINENSE: RespellRule[] = [
  // Chiamento de S em coda interna e final (manezinho herdou de Açores)
  { pattern: /s(?=[pctkqgbdfvmnlr])/gi, replace: 'sh' },
  { pattern: /s(?=\s|$|[.,!?;:])/gi, replace: 'sh' },
  { pattern: /ti(?=[aeoiu])/gi, replace: 'tchi' },
  { pattern: /di(?=[aeoiu])/gi, replace: 'dji' },
  { pattern: /te\b/gi, replace: 'tchi' },
  { pattern: /de\b/gi, replace: 'dji' },
]

// GOIANO/SERTANEJO (GO): caipira, "rr" cortado, drop -r final
const GOIANO: RespellRule[] = [
  { pattern: /(?<![A-Za-zÀ-ÿ])você(?![A-Za-zÀ-ÿ])/gi, replace: 'cê' },
  { pattern: /(?<![A-Za-zÀ-ÿ])está(?![A-Za-zÀ-ÿ])/gi, replace: 'tá' },
  { pattern: /\bestou\b/gi, replace: 'tô' },
  { pattern: /([aeiou])r\b/gi, replace: '$1' },
  { pattern: /\bei\b/gi, replace: 'ê' },
  { pattern: /eira\b/gi, replace: 'êra' },
  { pattern: /eiro\b/gi, replace: 'êro' },
]

// MATO-GROSSENSE / SUL-MATO-GROSSENSE
const MATOGROSSENSE: RespellRule[] = GOIANO.slice()

// CANDANGO (DF): mistura migrante, relativamente neutro
const CANDANGO: RespellRule[] = [
  { pattern: /(?<![A-Za-zÀ-ÿ])está(?![A-Za-zÀ-ÿ])/gi, replace: 'tá' },
  { pattern: /\bestou\b/gi, replace: 'tô' },
]

// NORTISTA (PA/AM/RR/AP/RO/AC/TO): cantado, paraense forte
const NORTISTA: RespellRule[] = [
  { pattern: /(?<![A-Za-zÀ-ÿ])você(?![A-Za-zÀ-ÿ])/gi, replace: 'cê' },
  { pattern: /(?<![A-Za-zÀ-ÿ])está(?![A-Za-zÀ-ÿ])/gi, replace: 'tá' },
  { pattern: /\bestou\b/gi, replace: 'tô' },
  // "ti/di" palatal
  { pattern: /ti(?=[aeoiu])/gi, replace: 'tchi' },
  { pattern: /di(?=[aeoiu])/gi, replace: 'dji' },
  { pattern: /te\b/gi, replace: 'tchi' },
  { pattern: /de\b/gi, replace: 'dji' },
]

// PARAENSE (PA específico): cantado bem marcado
const PARAENSE: RespellRule[] = [
  ...NORTISTA,
  // "marinheiro" → "ma-rinheiro" tipo cantado (sugere com hifen suave)
  { pattern: /(\w)inheiro\b/gi, replace: '$i-nheiro' },
]

// MARANHENSE (MA): "lusitano-like", clareza
const MARANHENSE: RespellRule[] = [
  { pattern: /(?<![A-Za-zÀ-ÿ])você(?![A-Za-zÀ-ÿ])/gi, replace: 'tu' },
]

const RULES_BY_SIGLA: Record<string, RespellRule[]> = {
  // Sudeste
  SP: PAULISTANO,
  RJ: CARIOCA,
  MG: MINEIRO,
  ES: CAPIXABA,
  // Sul
  RS: GAUCHO,
  PR: CURITIBANO,
  SC: CATARINENSE,
  // Centro-Oeste
  GO: GOIANO,
  MT: MATOGROSSENSE,
  MS: MATOGROSSENSE,
  DF: CANDANGO,
  // Nordeste
  BA: BAIANO,
  PE: NORDESTINO,
  CE: NORDESTINO,
  AL: NORDESTINO,
  PB: NORDESTINO,
  RN: NORDESTINO,
  PI: NORDESTINO,
  SE: NORDESTINO,
  MA: MARANHENSE,
  // Norte
  PA: PARAENSE,
  AM: NORTISTA,
  RR: NORTISTA,
  AP: NORTISTA,
  RO: NORTISTA,
  AC: NORTISTA,
  TO: NORTISTA,
}

/**
 * Aplica respell preservando tokens protegidos (NR codes, siglas técnicas, números).
 *
 * Estratégia: substitui tokens protegidos por placeholders único, aplica regras,
 * restaura placeholders.
 */
export function respellForRegion(text: string, sigla: string | null | undefined): string {
  if (!text || !sigla) return text
  const rules = RULES_BY_SIGLA[sigla.toUpperCase()]
  if (!rules || rules.length === 0) return text

  // 1. Extrai e substitui tokens protegidos por placeholders.
  // Usamos chars Unicode da área privada (PUA) — não são letras nem dígitos,
  // então as regras de respell e o próprio PROTECTED_TOKENS não os corrompem.
  // Cada placeholder fica entre \uE000 ... \uE001, com o índice em hex.
  const placeholders: string[] = []
  let working = text
  for (const re of PROTECTED_TOKENS) {
    working = working.replace(re, (match) => {
      const idx = placeholders.length
      placeholders.push(match)
      // Codifica o índice em chars PUA (\uE100 + idx) — single char por índice
      return `\uE000${String.fromCharCode(0xE100 + idx)}\uE001`
    })
  }

  // 2. Aplica regras
  for (const r of rules) {
    working = working.replace(r.pattern, r.replace)
  }

  // 3. Restaura placeholders.
  const restored = working.replace(/\uE000([\uE100-\uE9FF])\uE001/g, (_m, ch) => {
    const idx = ch.charCodeAt(0) - 0xE100
    return placeholders[idx] ?? ''
  })

  return restored
}

/**
 * Resolve sigla a partir de codarea OU sigla.
 */
export function regionFromAnyId(id: string | null | undefined): string | null {
  if (!id) return null
  // Se vier sigla direta
  if (/^[A-Z]{2}$/i.test(id)) return id.toUpperCase()
  // Se vier UFMeta-like
  const meta = getUFBySigla(id) as UFMeta | undefined
  return meta?.sigla ?? null
}

export type { RegionSlug }

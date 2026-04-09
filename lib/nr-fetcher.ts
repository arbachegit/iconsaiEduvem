/**
 * NR fetcher — resolve PDF URL a partir da landing page do gov.br
 * e baixa o PDF.
 *
 * Fluxo:
 *   1. fetch(landingUrl) → HTML
 *   2. extractPdfUrl(html) → URL do PDF "atualizado" mais recente
 *   3. downloadPdf(pdfUrl) → Buffer + sha256
 *
 * Estrategia de extracao do PDF:
 *   - Procura links .pdf que contenham "atualizada" ou "atualizado"
 *   - Se nenhum, fallback para qualquer .pdf na pagina
 *   - Se ainda nenhum, throw com erro descritivo
 */
import { createHash } from 'crypto'

const UA = 'Mozilla/5.0 (compatible; iconsaiEduven/1.0; +https://eduven.iconsai.ai)'

/**
 * Extrai URL do PDF principal de uma landing page de NR.
 *
 * @param html       HTML da landing page
 * @param baseUrl    URL base para resolver links relativos
 * @param nrId       Numero da NR (1, 5, 10, 35, ...) — usado para EXIGIR
 *                   que o PDF mencione esse numero. CRITICO: sem isso o
 *                   scoring pode pegar PDFs auxiliares (portarias genericas
 *                   sobre estrutura/interpretacao das NRs).
 */
export function extractPdfUrl(html: string, baseUrl: string, nrId: number): string | null {
  // Variações do código da NR no path/label: nr-10, nr10, nr_10, nr 10, nr-010, nr-1
  const padded = String(nrId).padStart(2, '0')
  const nrPatterns = [
    new RegExp(`\\bnr[-_\\s]?0?${nrId}\\b`, 'i'),
    new RegExp(`\\bnr[-_\\s]?${padded}\\b`, 'i'),
    new RegExp(`\\bnr${nrId}\\b`, 'i'),
    new RegExp(`\\bnr${padded}\\b`, 'i'),
  ]
  const matchesNR = (s: string): boolean => nrPatterns.some(re => re.test(s))

  // EXCLUDE list: padroes que indicam PDF auxiliar / generico, NAO a norma em si
  const HARD_EXCLUDE = [
    /manual[-_\s]?consolid/i,
    /historic/i,
    /interpreta[cç][aã]o/i,
    /estrutura/i,
    /portaria[-_\s]?sit/i,
    /portaria[-_\s]?mt[bp]?[-_\s]?\d/i,  // portaria MTE/MTb XYZ (alteradora)
    /\/sst[-_\s]?portarias\//i,
    /guia[-_\s]?de[-_\s]?boas/i,
    /ata[-_\s]?ctpp/i,
  ]

  const linkRe = /<a[^>]+href=["']([^"']+\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi
  const candidates: Array<{ url: string; label: string; score: number }> = []

  let m: RegExpExecArray | null
  while ((m = linkRe.exec(html)) !== null) {
    const rawUrl = m[1]
    const label = m[2].replace(/<[^>]+>/g, '').trim()
    const url = new URL(rawUrl, baseUrl).toString()
    const haystack = `${url} ${label}`

    // Hard exclude
    if (HARD_EXCLUDE.some(re => re.test(haystack))) continue

    // REQUIRE: PDF must mention this NR's number somewhere (URL or label)
    if (!matchesNR(url) && !matchesNR(label)) continue

    let score = 0
    if (/atualizad/i.test(url)) score += 10
    if (/atualizad/i.test(label)) score += 10
    if (/2026/.test(url)) score += 6
    if (/2025/.test(url)) score += 5
    if (/2024/.test(url)) score += 4
    if (/2023/.test(url)) score += 3
    if (/2022/.test(url)) score += 2
    // Bonus se URL tem path /normas-regulamentadoras/
    if (/normas[-_\s]?regulamentadoras?/i.test(url)) score += 3
    // Bonus extra se URL contem o nr-XX no proprio basename do arquivo
    const basename = url.split('/').pop() || ''
    if (matchesNR(basename)) score += 5

    candidates.push({ url, label, score })
  }

  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.score - a.score)
  return candidates[0].url
}

/**
 * Fetch landing HTML + extract PDF URL.
 */
export async function resolvePdfUrl(landingUrl: string, nrId: number): Promise<string> {
  const res = await fetch(landingUrl, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`landing fetch failed ${res.status}: ${landingUrl}`)
  const html = await res.text()
  const pdfUrl = extractPdfUrl(html, landingUrl, nrId)
  if (!pdfUrl) throw new Error(`no PDF link matching NR-${nrId} found in ${landingUrl}`)
  return pdfUrl
}

/**
 * Download PDF as Buffer + sha256.
 */
export async function downloadPdf(pdfUrl: string): Promise<{ buf: Buffer; sha256: string }> {
  const res = await fetch(pdfUrl, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`pdf fetch failed ${res.status}: ${pdfUrl}`)
  const arrayBuf = await res.arrayBuffer()
  const buf = Buffer.from(arrayBuf)
  const sha256 = createHash('sha256').update(buf).digest('hex')
  return { buf, sha256 }
}

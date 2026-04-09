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
 */
export function extractPdfUrl(html: string, baseUrl: string): string | null {
  // Match all <a href="...pdf">
  const linkRe = /<a[^>]+href=["']([^"']+\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi
  const candidates: Array<{ url: string; label: string; score: number }> = []

  let m: RegExpExecArray | null
  while ((m = linkRe.exec(html)) !== null) {
    const rawUrl = m[1]
    const label = m[2].replace(/<[^>]+>/g, '').trim().toLowerCase()
    const url = new URL(rawUrl, baseUrl).toString()

    // Skip "manual consolidado" and historical files
    if (/manual.consolid/i.test(url) || /manual.consolid/i.test(label)) continue
    if (/historic/i.test(url)) continue

    let score = 0
    if (/atualizad/i.test(url)) score += 10
    if (/atualizad/i.test(label)) score += 10
    if (/2025/.test(url)) score += 5
    if (/2024/.test(url)) score += 4
    if (/2023/.test(url)) score += 3
    // Prefer files that contain "nr-XX" or "nrXX"
    if (/nr[-_]?\d/i.test(url)) score += 2

    candidates.push({ url, label, score })
  }

  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.score - a.score)
  return candidates[0].url
}

/**
 * Fetch landing HTML + extract PDF URL.
 */
export async function resolvePdfUrl(landingUrl: string): Promise<string> {
  const res = await fetch(landingUrl, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`landing fetch failed ${res.status}: ${landingUrl}`)
  const html = await res.text()
  const pdfUrl = extractPdfUrl(html, landingUrl)
  if (!pdfUrl) throw new Error(`no PDF link found in ${landingUrl}`)
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

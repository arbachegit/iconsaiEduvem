/**
 * NR parser — extrai chunks hierárquicos do texto bruto de uma NR.
 *
 * Validado nas 5 NRs piloto (NR-01, NR-05, NR-06, NR-10, NR-35) no spike Fase 1.
 * Total ~210 chunks, avg 130 tokens/chunk, max 500.
 *
 * Pipeline:
 *   1. limpa footer "DOU" e cabeçalho de portarias
 *   2. detecta headings via regex `^\s*\d+(\.\d+)+[\s\-:.]+`
 *   3. agrupa órfãos (heading sem corpo) com filhos via breadcrumb hierárquico
 *   4. divide chunks gigantes (>MAX_TOKENS) por sentença
 */

const HEADING_RE = /^\s*(\d+(?:\.\d+)+)\.?\s*[-:.]?\s+(.+?)\s*$/
const FOOTER_RE = /^.*Este texto não substitui o publicado no DOU.*$/gm
const MAX_TOKENS = 500
const MIN_TOKENS = 30

export interface ParsedChunk {
  chapter: string                    // '35.4.2.1'
  title: string                      // 'O treinamento inicial...'
  breadcrumb: Array<{ n: string; t: string }>  // [{n:'35.4', t:'Autorização...'}, ...]
  content: string                    // texto completo do chunk
  token_count: number
  section_type: 'item' | 'annex' | 'header' | 'table'
}

export function tokenize(s: string): number {
  return Math.ceil(s.split(/\s+/).filter(Boolean).length * 1.3)
}

interface RawNode {
  chapter: string
  title: string
  body: string[]
}

function parseRaw(text: string): RawNode[] {
  const cleaned = text.replace(FOOTER_RE, '')
  const lines = cleaned.split('\n')
  const nodes: RawNode[] = []
  let cur: RawNode | null = null

  for (const ln of lines) {
    const m = ln.match(HEADING_RE)
    if (m && m[2].length < 120) {
      if (cur) nodes.push(cur)
      cur = { chapter: m[1], title: m[2].trim(), body: [] }
    } else if (cur && ln.trim()) {
      cur.body.push(ln.trim())
    }
  }
  if (cur) nodes.push(cur)
  return nodes
}

/**
 * Para cada chunk, calcula a cadeia de ancestrais hierárquicos.
 * Ex: 35.4.2.1 → ancestrais 35.4.2, 35.4, 35
 * Procura o título de cada ancestral nos nodes anteriores.
 */
function buildBreadcrumb(chapter: string, allNodes: RawNode[]): Array<{ n: string; t: string }> {
  const parts = chapter.split('.')
  const ancestors: Array<{ n: string; t: string }> = []

  for (let i = 1; i < parts.length; i++) {
    const ancestorChapter = parts.slice(0, i + 1).join('.')
    if (ancestorChapter === chapter) continue
    const found = allNodes.find(n => n.chapter === ancestorChapter)
    if (found) {
      ancestors.push({ n: ancestorChapter, t: found.title })
    }
  }
  return ancestors
}

function isAnnex(node: RawNode): boolean {
  return /^anexo/i.test(node.title)
}

function splitGiantChunk(chunk: ParsedChunk): ParsedChunk[] {
  if (chunk.token_count <= MAX_TOKENS) return [chunk]
  const sentences = chunk.content.split(/(?<=[.!?])\s+/)
  const out: ParsedChunk[] = []
  let buf: string[] = []
  let curTok = 0
  let subIdx = 1

  for (const s of sentences) {
    const stok = tokenize(s)
    if (curTok + stok > MAX_TOKENS && buf.length) {
      out.push({
        ...chunk,
        chapter: `${chunk.chapter}#${subIdx}`,
        content: buf.join(' '),
        token_count: curTok,
      })
      subIdx++
      buf = [s]
      curTok = stok
    } else {
      buf.push(s)
      curTok += stok
    }
  }
  if (buf.length) {
    out.push({
      ...chunk,
      chapter: subIdx > 1 ? `${chunk.chapter}#${subIdx}` : chunk.chapter,
      content: buf.join(' '),
      token_count: curTok,
    })
  }
  return out
}

export function parseNRText(text: string): ParsedChunk[] {
  const nodes = parseRaw(text)
  const chunks: ParsedChunk[] = []

  for (const node of nodes) {
    const content = node.body.join(' ').trim()
    const tok = tokenize(content)
    // Skip pure headings (no body) — their title is preserved in breadcrumb of children
    if (tok < MIN_TOKENS && content.length === 0) continue

    const breadcrumb = buildBreadcrumb(node.chapter, nodes)
    const baseChunk: ParsedChunk = {
      chapter: node.chapter,
      title: node.title,
      breadcrumb,
      content,
      token_count: tok,
      section_type: isAnnex(node) ? 'annex' : 'item',
    }
    chunks.push(...splitGiantChunk(baseChunk))
  }

  return chunks
}

/**
 * Extrai metadados estruturais do cabeçalho da NR (lista de portarias).
 * Retorna a portaria mais recente + histórico completo.
 */
export interface NRHeaderMeta {
  current_portaria: string | null
  current_portaria_date: string | null    // YYYY-MM-DD
  portarias_history: Array<{ name: string; date: string; dou: string }>
}

export function extractHeaderMeta(text: string): NRHeaderMeta {
  // Padrão: "Portaria X nº N, de DD de MMMM de YYYY    DD/MM/YY"
  const PORT_RE = /Portaria\s+([A-Z]+\w*)\s+n[º°.\s]+([\d.]+),?\s+de\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})\s+(\d{2}\/\d{2}\/\d{2})/g
  const MONTHS: Record<string, string> = {
    janeiro: '01', fevereiro: '02', marco: '03', março: '03', abril: '04',
    maio: '05', junho: '06', julho: '07', agosto: '08',
    setembro: '09', outubro: '10', novembro: '11', dezembro: '12',
  }
  const history: NRHeaderMeta['portarias_history'] = []
  let m: RegExpExecArray | null
  while ((m = PORT_RE.exec(text)) !== null) {
    const [, org, num, day, monthRaw, year, dou] = m
    const month = MONTHS[monthRaw.toLowerCase()] || '01'
    history.push({
      name: `Portaria ${org} nº ${num}`,
      date: `${year}-${month}-${day.padStart(2, '0')}`,
      dou,
    })
  }
  history.sort((a, b) => b.date.localeCompare(a.date))
  const latest = history[0] || null
  return {
    current_portaria: latest ? `${latest.name}, de ${latest.date}` : null,
    current_portaria_date: latest?.date || null,
    portarias_history: history,
  }
}

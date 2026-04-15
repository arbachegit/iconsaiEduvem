import { NextRequest } from 'next/server'
import { createMessage, extractText } from '@/lib/llm-client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/eduven/graph-analysis
 * Body: {
 *   node: { code: string, title: string, group: string, relevance?: number },
 *   neighbors: Array<{ code: string, title: string, group: string, strength: number, label?: string }>,
 *   sectorName: string,
 * }
 *
 * Retorno: { text: string, suggestion: string }
 *
 * Ella analisa o nó no grafo: causas, consequências e uma sugestão
 * de próximo clique. Usa Anthropic Haiku 4.5 com fallback OpenAI
 * via createMessage.
 */

interface NeighborDTO {
  code: string
  title: string
  group: string
  strength: number
  label?: string
}
interface NodeDTO {
  code: string
  title: string
  group: string
  relevance?: number
}

const SYSTEM = `Você é a Ella, tutora de segurança e saúde no trabalho.

Tom: paulistano descontraído, direto, sem fillers, sem "vale ressaltar".
Segunda pessoa. Frases curtas. Humor leve quando couber. Honesta sobre incertezas.

Sua missão quando um nó do grafo é clicado:
1. Analisar CAUSAS (por que essa NR se conecta às vizinhas).
2. Analisar CONSEQUÊNCIAS (o que acontece quando descumprimento de uma afeta a outra).
3. Citar 2 ou 3 vizinhas mais fortes pelo código e título.
4. Terminar com UMA sugestão curta no campo "suggestion" do formato:
   "Tente apertar o nó da NR-XX que te conto a importância dela."
   (ou variação autêntica — escolha um vizinho forte não redundante).

Formato de retorno: JSON puro, sem markdown, sem prefixo, sem backticks.
Shape obrigatório: { "text": "2 a 3 parágrafos separados por \\n\\n", "suggestion": "frase de uma linha" }
Texto em português brasileiro. Máximo 180 palavras no "text".`

function buildPrompt(node: NodeDTO, neighbors: NeighborDTO[], sectorName: string): string {
  const sorted = [...neighbors].sort((a, b) => b.strength - a.strength)
  const list = sorted.length
    ? sorted.map(n => `- ${n.code} ${n.title} (${n.group}, força ${Math.round(n.strength * 100)}%${n.label ? ', ' + n.label : ''})`).join('\n')
    : '(sem conexões registradas neste setor)'

  return `Setor: ${sectorName}
Nó clicado: ${node.code} — ${node.title} (grupo ${node.group}${typeof node.relevance === 'number' ? `, relevância setorial ${node.relevance}/5` : ''})

Vizinhas neste setor (ordenadas por força da correlação):
${list}

Gere a análise no JSON do system. Foque nas 2–3 conexões mais fortes se houver muitas.`
}

function parseLLMJson(raw: string): { text: string; suggestion: string } {
  const cleaned = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end < start) throw new Error('LLM response não contém JSON')
  const json = cleaned.slice(start, end + 1)
  const obj = JSON.parse(json)
  const text = String(obj.text || '').trim()
  const suggestion = String(obj.suggestion || '').trim()
  if (!text) throw new Error('Campo "text" vazio')
  return { text, suggestion }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const node: NodeDTO = body.node
    const neighbors: NeighborDTO[] = Array.isArray(body.neighbors) ? body.neighbors : []
    const sectorName: string = String(body.sectorName || 'setor não informado')

    if (!node || !node.code || !node.title) {
      return Response.json({ error: 'node.code and node.title required' }, { status: 400 })
    }

    const msg = await createMessage({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system: SYSTEM,
      messages: [{ role: 'user', content: buildPrompt(node, neighbors, sectorName) }],
    }, { route: '/api/eduven/graph-analysis' })

    const raw = extractText(msg)
    const { text, suggestion } = parseLLMJson(raw)

    return Response.json({ text, suggestion })
  } catch (err) {
    const errMsg = (err as Error).message || 'unknown error'
    console.error('[api/eduven/graph-analysis]', errMsg)
    return Response.json({ error: errMsg }, { status: 500 })
  }
}

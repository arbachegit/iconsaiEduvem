import { NextRequest } from 'next/server'
import { createMessage, extractText } from '@/lib/llm-client'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

/**
 * POST /api/eduven/storytelling
 *
 * Pipeline em 3 stages para transformar um objetivo do aluno
 * (ex: "reduzir custos") em um plano narrativo.
 *
 *   step1 — LLM escolhe a NR de maior impacto (driver principal)
 *   step2 — LLM escolhe NRs de suporte que reforcam o driver
 *   step3 — LLM redige plano narrativo (fases, custos, riscos, disclaimer)
 *
 * Cada stage recebe o contexto acumulado e retorna JSON estruturado.
 */

interface NRDTO {
  id: number
  code: string
  title: string
  group: string
  relevance: number
}
interface SupportingDTO extends NRDTO {
  role?: string
  reason?: string
  effect?: string
}

const TOM = `Tom canonico (obrigatorio):
- Paulistano descontraido, direto, sem fillers ("vale ressaltar", "e importante notar").
- Segunda pessoa. Frases curtas. Humor leve.
- Honestidade intelectual: tradeoffs explicitos.
- Concreto > abstrato. Numeros quando possivel.
- Sempre uma recomendacao, nunca "depende".`

const SYSTEM_BASE = `Voce e Ella, tutora de seguranca e saude no trabalho especializada em NRs brasileiras.

${TOM}

Grupos das NRs:
- gestao (NR-01, 03, 04, 05, 28): organizam o sistema.
- saude (NR-07, 09, 15, 17, 24, 32): saude ocupacional.
- protecao (NR-06, 08, 10, 16, 23, 26): protecao imediata (EPI, edificacao, eletrica).
- setorial (NR-11, 12, 13, 18, 20, 21, 33, 35, etc): especifica do setor.

Retorno: JSON puro, sem markdown, sem backticks, sem prefixo.`

function nrListAsText(nrs: NRDTO[]): string {
  return nrs
    .slice()
    .sort((a, b) => b.relevance - a.relevance)
    .map(n => `- ${n.code} ${n.title} [grupo=${n.group}, relevancia=${n.relevance}/5]`)
    .join('\n')
}

function buildStep1(goal: string, sectorName: string, nrs: NRDTO[]): { system: string; prompt: string } {
  return {
    system: SYSTEM_BASE + `
Sua missao AGORA (step1): dado o objetivo do aluno, eleger UMA UNICA NR que seja o
"driver principal" — aquela cujo descumprimento mais causa o problema que ele quer
resolver (custo, produtividade, acidente, etc). E o ponto de maior impacto.

Shape: {
  "primary": { "code": "NR-XX", "reason": "por que ela e o driver, em 2-3 frases curtas", "impact": "frase curta quantificando o impacto potencial" }
}`,
    prompt: `Setor: ${sectorName}
Objetivo do aluno: "${goal}"

NRs disponiveis neste setor (ordenadas por relevancia):
${nrListAsText(nrs)}

Escolha a UMA NR de maior impacto para o objetivo. Retorne JSON no shape exigido.`,
  }
}

function buildStep2(
  goal: string,
  sectorName: string,
  primary: NRDTO,
  nrs: NRDTO[],
): { system: string; prompt: string } {
  return {
    system: SYSTEM_BASE + `
Sua missao AGORA (step2): escolher de 3 a 5 NRs "de suporte" que reforcam a NR driver
e ajudam a atingir o objetivo. Justifique cada uma com 1-2 frases. Para cada NR de
suporte, dar um papel ("role") curto (ex: "reduz sinistralidade", "acelera ciclo
produtivo", "reduz multas", "baseline legal").

Shape: {
  "supporting": [
    { "code": "NR-XX", "role": "papel curto", "reason": "2 frases", "effect": "efeito esperado em 1 frase" },
    ...
  ],
  "summary": "2-3 frases conectando o driver com as NRs de suporte"
}`,
    prompt: `Setor: ${sectorName}
Objetivo do aluno: "${goal}"
Driver principal ja escolhido: ${primary.code} ${primary.title} (grupo ${primary.group})

NRs disponiveis:
${nrListAsText(nrs.filter(n => n.code !== primary.code))}

Escolha 3 a 5 NRs de suporte. Retorne JSON.`,
  }
}

function buildStep3(
  goal: string,
  sectorName: string,
  primary: NRDTO,
  supporting: SupportingDTO[],
): { system: string; prompt: string } {
  const sup = supporting.map(s => `- ${s.code} ${s.title} (${s.role || 'suporte'})`).join('\n')
  return {
    system: SYSTEM_BASE + `
Sua missao AGORA (step3): escrever um plano narrativo didatico, em forma de historia.
Imagine um engenheiro de seguranca contando pro diretor financeiro como ele vai atingir
o objetivo. Nao lista fria — narrativa que leva o leitor pelo raciocinio.

Alem da narrativa, devolver fases de implementacao, custos APROXIMADOS (disclaimer
explicito: sao estimativas indicativas, nao orcamento real), riscos e um disclaimer
final.

LIMITES RIGIDOS — obrigatorios pra nao estourar o JSON:
- narrative: EXATAMENTE 3 paragrafos, maximo 150 palavras no TOTAL.
- phases: EXATAMENTE 3 fases. Cada uma com 3 actions curtas (<= 80 caracteres cada).
- costs: EXATAMENTE 4 itens. item/note curtos, range no formato "R$ X-Y mil" ou "R$ X-Y".
- risks: EXATAMENTE 3 riscos. risk e mitigation em 1 frase curta cada.
- disclaimer: 1 frase.
NAO use palavras desnecessarias. Seja direto. Cortar > alongar.

Shape obrigatorio (JSON puro):
{"narrative":"...","phases":[{"title":"...","duration":"...","actions":["...","...","..."]},{...},{...}],"costs":[{"item":"...","range":"...","note":"..."},...],"risks":[{"risk":"...","mitigation":"..."},...],"disclaimer":"..."}`,
    prompt: `Setor: ${sectorName}
Objetivo do aluno: "${goal}"
Driver principal: ${primary.code} ${primary.title}
NRs de suporte:
${sup}

Escreva o plano narrativo didatico no shape exigido.`,
  }
}

function parseJson(raw: string): unknown {
  const cleaned = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim()
  const start = cleaned.indexOf('{')
  if (start < 0) throw new Error('LLM sem JSON')
  let slice = cleaned.slice(start)
  try {
    const end = slice.lastIndexOf('}')
    if (end >= 0) return JSON.parse(slice.slice(0, end + 1))
  } catch {
    // fallthrough para repair
  }
  // Repair: fecha strings, arrays e objetos abertos quando a resposta foi truncada.
  return JSON.parse(repairTruncatedJson(slice))
}

function repairTruncatedJson(input: string): string {
  let out = input
  // Remove virgula pendente no final
  out = out.replace(/[\s,]*$/, '')
  // Conta abertos/fechados fora de strings
  let inStr = false
  let esc = false
  const stack: string[] = []
  for (let i = 0; i < out.length; i++) {
    const c = out[i]
    if (esc) { esc = false; continue }
    if (c === '\\' && inStr) { esc = true; continue }
    if (c === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (c === '{' || c === '[') stack.push(c)
    else if (c === '}') { if (stack[stack.length - 1] === '{') stack.pop() }
    else if (c === ']') { if (stack[stack.length - 1] === '[') stack.pop() }
  }
  // Se terminou dentro de uma string, fecha a aspa
  if (inStr) out += '"'
  // Fecha abertos na ordem reversa
  while (stack.length) {
    const top = stack.pop()
    out += top === '{' ? '}' : ']'
  }
  return out
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const stage: 'step1' | 'step2' | 'step3' = body.stage
    const goal: string = String(body.goal || '').slice(0, 500)
    const sectorName: string = String(body.sectorName || 'setor nao informado')
    const nrs: NRDTO[] = Array.isArray(body.nrs) ? body.nrs : []

    if (!goal.trim()) return Response.json({ error: 'goal required' }, { status: 400 })
    if (stage !== 'step1' && stage !== 'step2' && stage !== 'step3') {
      return Response.json({ error: 'stage invalid' }, { status: 400 })
    }

    let built: { system: string; prompt: string }
    if (stage === 'step1') {
      if (!nrs.length) return Response.json({ error: 'nrs required' }, { status: 400 })
      built = buildStep1(goal, sectorName, nrs)
    } else if (stage === 'step2') {
      if (!body.primary) return Response.json({ error: 'primary required' }, { status: 400 })
      built = buildStep2(goal, sectorName, body.primary, nrs)
    } else {
      if (!body.primary || !Array.isArray(body.supporting)) {
        return Response.json({ error: 'primary + supporting required' }, { status: 400 })
      }
      built = buildStep3(goal, sectorName, body.primary, body.supporting)
    }

    const msg = await createMessage({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: stage === 'step3' ? 3200 : 900,
      system: built.system,
      messages: [{ role: 'user', content: built.prompt }],
    }, { route: `/api/eduven/storytelling:${stage}` })

    const parsed = parseJson(extractText(msg))
    return Response.json({ stage, ...(parsed as Record<string, unknown>) })
  } catch (err) {
    const errMsg = (err as Error).message || 'unknown'
    console.error('[api/eduven/storytelling]', errMsg)
    return Response.json({ error: errMsg }, { status: 500 })
  }
}

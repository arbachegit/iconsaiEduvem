import { NextRequest, NextResponse } from 'next/server'
import { NR_INDEX } from '@/data/nr-index'
import { getSector } from '@/data/sectors'
import { LESSON_SECTIONS } from '@/data/domain-configs/nr'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/eduven/lesson-fast — Gera seção 1 da aula via LLM (sem banco).
 * Body: { nrId, sector, difficulty? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const nrId = parseInt(String(body.nrId), 10)
    const sectorSlug = body.sector
    const difficulty = body.difficulty || 'same'

    if (!nrId || isNaN(nrId)) return NextResponse.json({ error: 'nrId required' }, { status: 400 })
    if (!sectorSlug) return NextResponse.json({ error: 'sector required' }, { status: 400 })

    const nr = NR_INDEX.find(n => n.id === nrId)
    if (!nr) return NextResponse.json({ error: `NR ${nrId} not found` }, { status: 404 })

    const sector = getSector(sectorSlug)
    if (!sector) return NextResponse.json({ error: `Sector ${sectorSlug} not found` }, { status: 404 })

    const sectionDef = LESSON_SECTIONS[0]

    // Try Claude first, fallback to OpenAI
    let content: string
    try {
      content = await generateWithClaude(nr.code, nr.title, sector.name, sector.description, sectionDef.titlePt, difficulty)
    } catch {
      try {
        content = await generateWithOpenAI(nr.code, nr.title, sector.name, sector.description, sectionDef.titlePt, difficulty)
      } catch (err2) {
        return NextResponse.json({ error: `LLM failed: ${(err2 as Error).message}` }, { status: 500 })
      }
    }

    return NextResponse.json({
      lessonId: `${nrId}-${sectorSlug}-${Date.now()}`,
      nrId,
      nrCode: nr.code,
      nrTitle: nr.title,
      sectorSlug,
      sectorName: sector.name,
      difficulty,
      title: `${nr.code} — ${nr.title}`,
      section1: { index: 1, titlePt: sectionDef.titlePt, content },
    })
  } catch (err) {
    console.error('[lesson-fast]', (err as Error).message)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

function buildPrompt(nrCode: string, nrTitle: string, sectorName: string, sectorDesc: string, sectionTitle: string, difficulty: string): string {
  const diffLabel = difficulty === 'easier' ? 'básico (iniciante)' : difficulty === 'harder' ? 'avançado (técnico)' : 'intermediário'
  return `Você é um instrutor de Segurança e Saúde do Trabalho (SST) brasileiro, especialista em Normas Regulamentadoras.

Gere a SEÇÃO 1 de uma aula sobre a ${nrCode} — "${nrTitle}" para trabalhadores do setor: ${sectorName} (${sectorDesc}).

TÍTULO DA SEÇÃO: "${sectionTitle}"
NÍVEL: ${diffLabel}

REGRAS:
- Português BR fluente e direto
- Tom: conversa de especialista com o trabalhador, sem ser formal demais
- Cite itens específicos da norma quando possível [${nrCode}, item X.Y]
- Exemplos concretos do setor ${sectorName}
- 3-4 parágrafos, ~300 palavras
- NÃO use bullet points na seção 1 (é narrativa)
- Comece explicando POR QUE essa norma existe e o que acontece quando não é cumprida

Retorne APENAS o texto da seção, sem título, sem markdown headers.`
}

async function generateWithClaude(nrCode: string, nrTitle: string, sectorName: string, sectorDesc: string, sectionTitle: string, difficulty: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY not set')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: buildPrompt(nrCode, nrTitle, sectorName, sectorDesc, sectionTitle, difficulty) }],
    }),
  })

  if (!res.ok) throw new Error(`Claude ${res.status}`)
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

async function generateWithOpenAI(nrCode: string, nrTitle: string, sectorName: string, sectorDesc: string, sectionTitle: string, difficulty: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY not set')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [{ role: 'user', content: buildPrompt(nrCode, nrTitle, sectorName, sectorDesc, sectionTitle, difficulty) }],
    }),
  })

  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

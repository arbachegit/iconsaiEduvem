import { NextRequest, NextResponse } from 'next/server'
import { createMessage, extractText } from '@/lib/llm-client'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/eduven/comprehension
 * Body: { lesson_id, section_index, understood, section_title?, section_content? }
 *
 * Quando understood=false, gera recap da secao com:
 *   1. Nova analogia
 *   2. Exemplo numerico/concreto adicional
 *   3. Resumo em 1 frase
 *
 * Quando understood=true, apenas registra (poderia gravar em DB futuramente).
 */

const RECAP_SYSTEM_PROMPT = `Voce e um auditor fiscal do trabalho experiente, recapitulando uma secao de aula que o aluno disse que NAO entendeu.

# TOM (NAO NEGOCIAVEL)
- Direto sem condescendencia ("entendi, vamos de outro jeito")
- NAO repete o texto original — tem que ser ANGULO DIFERENTE
- Concreto > abstrato. Cite numeros, cite cenarios reais.
- Segunda pessoa.
- Sem fillers.

# ESTRUTURA DA RECAPITULACAO

1. **Analogia diferente** (1-2 frases): explique o conceito com uma comparacao do dia-a-dia que NAO foi usada antes.
2. **Exemplo numerico ou cenario** (1-2 frases): traga numero, situacao, decisao real.
3. **Resumo em 1 frase**: a coisa central que o aluno tem que sair daqui sabendo.

Maximo 120 palavras totais. Markdown puro. Nao retorne JSON.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const understood = !!body.understood
    const sectionTitle = String(body.section_title || '')
    const sectionContent = String(body.section_content || '')

    if (understood) {
      return NextResponse.json({ ok: true })
    }

    if (!sectionContent) {
      return NextResponse.json({ error: 'section_content required for recap' }, { status: 400 })
    }

    const userMsg = `O aluno disse que NAO compreendeu a secao "${sectionTitle}".

Conteudo original que ele leu:
${sectionContent.slice(0, 800)}

Gere uma recapitulacao no formato pedido (analogia diferente + exemplo concreto + resumo em 1 frase). Markdown.`

    const response = await createMessage(
      {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 800,
        system: RECAP_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
      },
      { route: '/api/eduven/comprehension' }
    )

    const recap = extractText(response).trim()
    return NextResponse.json({ recap })
  } catch (err) {
    const msg = (err as Error).message
    console.error('[api/eduven/comprehension]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

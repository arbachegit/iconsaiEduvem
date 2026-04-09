import { NextRequest, NextResponse } from 'next/server'
import { createMessage, extractText } from '@/lib/llm-client'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/eduven/term-explain
 * Body: { term, lessonContext, nr_code?, sector_slug?, lesson_id?, section_index? }
 *
 * Gera explicacao didatica de um termo tecnico de SST (EPI, PCMSO, CIPA, etc)
 * em formato estruturado pra TermModal stacked.
 *
 * Tom canonico em 1a pessoa: direto, concreto, contextual ao setor.
 */

const SYSTEM_PROMPT = `Voce e um auditor fiscal do trabalho experiente, explicando termos tecnicos de Seguranca e Saude no Trabalho (SST) para um aluno do curso "O Interativo Mundo da NR".

# TOM (NAO NEGOCIAVEL)
- Direto sem ser frio. Frases curtas. Personalidade.
- Concreto > abstrato. Sempre exemplo do chao de fabrica/obra/escritorio.
- Sem fillers ("e importante destacar", "vale ressaltar").
- Segunda pessoa quando faz sentido.
- Honestidade quando ha incerteza.

# FORMATO JSON ESTRITO

Retorne APENAS este JSON, sem markdown wrappers:

{
  "content": {
    "term": "EPI",
    "whatIs": "Frase curta definindo o termo. 1-2 linhas.",
    "howItWorks": "Como funciona na pratica. 2-3 frases.",
    "realExample": "Exemplo real, com nome ficticio plausivel do setor do aluno se fornecido.",
    "whyItMatters": "Por que importa. Consequencia concreta.",
    "lessonConnection": "Como isso se conecta com o que o aluno esta aprendendo agora.",
    "relatedTerms": ["termo1", "termo2", "termo3"]
  }
}

A relatedTerms deve listar 3-5 conceitos relacionados, em portugues, exatamente como apareceriam em outra busca.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const term = String(body.term || '').trim()
    if (!term) return NextResponse.json({ error: 'term required' }, { status: 400 })

    const ctx = String(body.lessonContext || '')
    const nrCode = body.nr_code as string | undefined
    const sector = body.sector_slug as string | undefined

    const userMsg = `Explique o termo: **${term}**

${nrCode ? `Norma sendo ensinada: ${nrCode}` : ''}
${sector ? `Setor do aluno: ${sector}` : ''}
${ctx ? `Contexto da aula:\n"${ctx.slice(0, 400)}"` : ''}

Retorne APENAS o JSON especificado.`

    const response = await createMessage(
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
      },
      { route: '/api/eduven/term-explain' }
    )

    const text = extractText(response)
    let s = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const start = s.indexOf('{')
    const end = s.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('no JSON in response')
    const parsed = JSON.parse(s.slice(start, end + 1))

    return NextResponse.json(parsed)
  } catch (err) {
    const msg = (err as Error).message
    console.error('[api/eduven/term-explain]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

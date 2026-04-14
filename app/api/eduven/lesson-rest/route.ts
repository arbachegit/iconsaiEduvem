import { NextRequest, NextResponse } from 'next/server'
import { NR_INDEX } from '@/data/nr-index'
import { getSector } from '@/data/sectors'
import { LESSON_SECTIONS } from '@/data/domain-configs/nr'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

/**
 * POST /api/eduven/lesson-rest — Gera seções 2-6 da aula via LLM (sem banco).
 * Body: { lessonId } (formato: "nrId-sectorSlug-timestamp")
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const lessonId = String(body.lessonId || '')

    // Parse lessonId: "1-construcao_civil-1713100000"
    const parts = lessonId.split('-')
    const nrId = parseInt(parts[0], 10)
    const sectorSlug = parts.slice(1, -1).join('-')
    const difficulty = body.difficulty || 'same'

    const nr = NR_INDEX.find(n => n.id === nrId)
    if (!nr) return NextResponse.json({ error: `NR ${nrId} not found` }, { status: 404 })

    const sector = getSector(sectorSlug)
    const sectorName = sector?.name || sectorSlug
    const sectorDesc = sector?.description || ''

    // Generate sections 2-6
    const sections = []
    for (let i = 1; i < LESSON_SECTIONS.length; i++) {
      const sec = LESSON_SECTIONS[i]
      try {
        const content = await generateSection(nr.code, nr.title, sectorName, sectorDesc, sec.titlePt, sec.index, difficulty)
        sections.push({ index: sec.index, titlePt: sec.titlePt, content })
      } catch {
        sections.push({
          index: sec.index,
          titlePt: sec.titlePt,
          content: `Conteúdo da seção "${sec.titlePt}" para ${nr.code} está sendo preparado.`,
        })
      }
    }

    return NextResponse.json({ lessonId, sections })
  } catch (err) {
    console.error('[lesson-rest]', (err as Error).message)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

function buildPrompt(nrCode: string, nrTitle: string, sectorName: string, sectorDesc: string, sectionTitle: string, sectionIndex: number, difficulty: string): string {
  const diffLabel = difficulty === 'easier' ? 'básico' : difficulty === 'harder' ? 'avançado' : 'intermediário'

  const sectionGuidance: Record<number, string> = {
    2: 'Explique o que a norma exige na prática. Liste as principais obrigações, prazos, documentos. Use exemplos do setor.',
    3: 'Mostre o passo a passo de implementação no setor. Como uma empresa desse setor cumpre essa norma no dia-a-dia.',
    4: 'Dê um EXEMPLO CONCRETO com dados reais ou realistas. Descreva uma situação, o que deu certo ou errado, e o resultado.',
    5: 'Liste os pontos fortes e destaques da norma. O que ela protege. Benefícios para o trabalhador e para a empresa.',
    6: 'Proponha um desafio prático para o aluno. Uma situação-problema onde ele precisa aplicar o que aprendeu. Inclua dados para análise.',
  }

  return `Você é um instrutor de SST brasileiro. Gere a SEÇÃO ${sectionIndex} de uma aula sobre ${nrCode} — "${nrTitle}" para o setor ${sectorName} (${sectorDesc}).

TÍTULO: "${sectionTitle}"
NÍVEL: ${diffLabel}
ORIENTAÇÃO: ${sectionGuidance[sectionIndex] || 'Desenvolva o conteúdo de forma clara e prática.'}

REGRAS:
- Português BR direto, tom de especialista acessível
- Cite itens da norma [${nrCode}, item X.Y] quando possível
- Exemplos do setor ${sectorName}
- 3-4 parágrafos, ~250-350 palavras
- Seções 4 e 6 podem usar bullet points se necessário
- SEM título na resposta, retorne apenas o conteúdo

Retorne APENAS o texto.`
}

async function generateSection(nrCode: string, nrTitle: string, sectorName: string, sectorDesc: string, sectionTitle: string, sectionIndex: number, difficulty: string): Promise<string> {
  const prompt = buildPrompt(nrCode, nrTitle, sectorName, sectorDesc, sectionTitle, sectionIndex, difficulty)

  // Try Claude
  const claudeKey = process.env.ANTHROPIC_API_KEY
  if (claudeKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.content?.[0]?.text || ''
    }
  }

  // Fallback OpenAI
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    }
  }

  throw new Error('No LLM API key configured')
}

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
        const section: any = { index: sec.index, titlePt: sec.titlePt, content }

        // Seções 4 e 6: gerar exercício interativo
        if (sec.index === 4 || sec.index === 6) {
          try {
            section.exerciseData = await generateExercise(nr.code, nr.title, sectorName, sec.titlePt, sec.index, content)
          } catch { /* exercise generation failed — section still works without it */ }
        }

        sections.push(section)
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

async function generateExercise(
  nrCode: string, nrTitle: string, sectorName: string,
  sectionTitle: string, sectionIndex: number, sectionContent: string
) {
  const isChallenge = sectionIndex === 6
  const prompt = `Você é a Ella, instrutora de SST. Crie um exercício interativo sobre ${nrCode} — "${nrTitle}" para o setor ${sectorName}.

CONTEXTO DA SEÇÃO "${sectionTitle}":
${sectionContent.slice(0, 500)}

${isChallenge
  ? 'Crie um DESAFIO PRÁTICO: uma situação-problema real onde o aluno precisa analisar e propor solução. Inclua dados concretos (números, prazos, situações).'
  : 'Crie um EXERCÍCIO de análise: apresente um cenário do setor e peça ao aluno para identificar riscos, EPIs necessários ou procedimentos corretos.'}

Retorne APENAS JSON válido (sem markdown):
{
  "prompt": "texto do exercício com a situação-problema (3-5 parágrafos)",
  "exerciseType": "open",
  "expectedSolution": {"expectedInput": "resposta esperada resumida em 1-2 frases"},
  "hints": ["dica 1", "dica 2", "dica 3"],
  "difficultyScore": 0.6
}`

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
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (res.ok) {
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      try {
        const clean = text.replace(/```json?\s*/g, '').replace(/```/g, '').trim()
        return JSON.parse(clean)
      } catch { /* parse failed */ }
    }
  }

  // Fallback: static exercise
  return {
    prompt: `Com base no conteúdo sobre ${nrCode} para o setor ${sectorName}, descreva:\n\n1. Quais são os principais riscos ocupacionais neste contexto?\n2. Quais medidas de controle a norma exige?\n3. O que acontece se a empresa não cumprir?`,
    exerciseType: 'open',
    expectedSolution: { expectedInput: 'O aluno deve identificar riscos, citar medidas da norma e consequências do descumprimento.' },
    hints: [
      `Releia a seção sobre ${nrCode} prestando atenção nos itens citados`,
      'Pense nos riscos específicos do seu setor de atuação',
      'Considere tanto medidas individuais (EPIs) quanto coletivas (EPCs)',
    ],
    difficultyScore: 0.5,
  }
}

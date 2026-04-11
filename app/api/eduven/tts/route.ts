import { NextRequest } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/eduven/tts
 * Body: { text: string, voice?: 'nova' | ... }
 *
 * TTS via OpenAI gpt-4o-mini-tts com instructions para voz paulistana
 * relaxada. Preprocessa o texto pra expandir numeros, simbolos e
 * abreviacoes antes de enviar (TTS neural le melhor texto por extenso).
 *
 * "Brasileiro e preguicoso" — botao Play em cada secao da aula.
 */

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

const VOICE_DEFAULT = 'nova' as const
const MAX_CHARS = 4096

// Instrucoes de voz — aplicadas via gpt-4o-mini-tts.
// Paulistano relaxado, ritmo de conversa, sem pressa, sem robo.
const VOICE_INSTRUCTIONS = `Fale em português brasileiro com sotaque paulistano descontraído, como se estivesse explicando pra um amigo no balcão do café. Ritmo natural, sem pressa, com ginga brasileira. Evite tom robótico ou formal demais. Quando encontrar números, leia por extenso de forma natural (ex: "2.025" como "dois mil e vinte e cinco", "87%" como "oitenta e sete por cento", "NR-35" como "ene erre trinta e cinco"). Pausas naturais antes de pontos importantes. Personalidade, não locução de jornal.`

/**
 * Expande numeros, simbolos e codigos NR pra texto por extenso.
 * TTS neural le numeros razoavelmente mas falha em casos especiais:
 *   - R$ → "reais"
 *   - NR-X → "ene erre X"
 *   - X% → "X por cento"
 *   - Itens como "35.4.2.1" ficam esquisitos
 *
 * Esta funcao faz um preprocessamento leve. O gpt-4o-mini-tts faz
 * a maior parte do trabalho ja via instructions.
 */
function preprocessForTTS(text: string): string {
  return text
    // Remove citacoes [NR-X, item Y.Z] (o ai.tutor muitas vezes faz referencia,
    // mas TTS ler tudo fica ruim; usuario pode olhar o texto pra detalhes)
    .replace(/\[NR-\d+,[^\]]+\]/g, '')
    // Remove markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[\[LAB\]\]|\[\[\/LAB\]\]/g, '')
    // KaTeX
    .replace(/\$\$([^$]+)\$\$/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    // Numeros brasileiros com ponto de milhar: 4.025 → 4025 (TTS le melhor)
    .replace(/(\d+)\.(\d{3})\b/g, '$1$2')
    // Simbolos comuns pra leitura mais natural
    .replace(/R\$\s*/g, 'reais ')
    .replace(/%/g, ' por cento')
    .replace(/\bNR-?(\d+)/gi, 'ene erre $1')
    // Quebras de linha viram pausas
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\.+/g, '.')
    .trim()
    .slice(0, MAX_CHARS)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text = String(body.text || '')
    const voice = (body.voice || VOICE_DEFAULT) as
      | 'nova' | 'alloy' | 'shimmer' | 'onyx' | 'echo' | 'fable' | 'sage' | 'coral'

    if (!text.trim()) {
      return Response.json({ error: 'text required' }, { status: 400 })
    }

    const cleaned = preprocessForTTS(text)
    if (!cleaned) {
      return Response.json({ error: 'text empty after cleaning' }, { status: 400 })
    }

    const openai = getOpenAI()

    // Tenta gpt-4o-mini-tts (novo modelo com instructions). Se falhar
    // (modelo nao disponivel na conta), cai pra tts-1 com voz nova.
    let mp3Response
    try {
      mp3Response = await openai.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice,
        input: cleaned,
        response_format: 'mp3',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        instructions: VOICE_INSTRUCTIONS as any,
      })
    } catch (err) {
      const msg = (err as Error).message || ''
      // Fallback pra tts-1 se gpt-4o-mini-tts nao tiver acesso
      if (msg.includes('model') || msg.includes('not found') || msg.includes('404')) {
        console.warn('[tts] gpt-4o-mini-tts unavailable, falling back to tts-1')
        mp3Response = await openai.audio.speech.create({
          model: 'tts-1',
          voice,
          input: cleaned,
          response_format: 'mp3',
          speed: 0.95,   // leve lentidao pra naturalidade
        })
      } else {
        throw err
      }
    }

    const buf = Buffer.from(await mp3Response.arrayBuffer())
    return new Response(buf, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(buf.length),
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    const msg = (err as Error).message || 'unknown error'
    console.error('[api/eduven/tts]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

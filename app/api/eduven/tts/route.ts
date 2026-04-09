import { NextRequest } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/eduven/tts
 * Body: { text: string, voice?: 'nova'|'alloy'|'shimmer'|'onyx'|'echo'|'fable' }
 *
 * Gera audio MP3 do texto via OpenAI tts-1 (~$0.015/1k chars).
 * Retorna binario MP3 stream.
 *
 * "Brasileiro e preguicoso" — botao Play em cada secao da aula.
 *
 * Limpeza pre-envio:
 *  - remove citacoes [NR-X, item Y.Z] (TTS nao precisa ler)
 *  - remove markdown wrappers (** _ ` etc)
 *  - normaliza whitespace
 */

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

const VOICE_DEFAULT = 'nova' as const   // nova soa mais natural em pt-BR
const MAX_CHARS = 4096                  // limite tts-1

function cleanForTTS(text: string): string {
  return text
    .replace(/\[NR-\d+,[^\]]+\]/g, '')        // citacoes inline
    .replace(/```[\s\S]*?```/g, '')           // code blocks
    .replace(/`([^`]+)`/g, '$1')              // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1')        // bold
    .replace(/\*([^*]+)\*/g, '$1')            // italic
    .replace(/^#{1,6}\s+/gm, '')              // headings
    .replace(/^[\-\*]\s+/gm, '')              // bullet markers
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CHARS)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text = String(body.text || '')
    const voice = (body.voice || VOICE_DEFAULT) as
      | 'nova' | 'alloy' | 'shimmer' | 'onyx' | 'echo' | 'fable'

    if (!text.trim()) {
      return Response.json({ error: 'text required' }, { status: 400 })
    }

    const cleaned = cleanForTTS(text)
    if (!cleaned) {
      return Response.json({ error: 'text empty after cleaning' }, { status: 400 })
    }

    const openai = getOpenAI()
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: cleaned,
      response_format: 'mp3',
      speed: 1.0,
    })

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

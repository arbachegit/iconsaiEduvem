/**
 * OpenAI embeddings — batch wrapper.
 *
 * Modelo: text-embedding-3-small (1536 dimensoes, $0.02/1M tokens)
 * Batch size: 100 inputs por chamada (limite seguro da API)
 * Retry: 3 tentativas com backoff exponencial
 */
import OpenAI from 'openai'

const MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'
const DIMS = parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10)
const BATCH_SIZE = 100

let _client: OpenAI | null = null
function client(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing')
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

async function embedBatch(inputs: string[], attempt = 1): Promise<number[][]> {
  try {
    const res = await client().embeddings.create({
      model: MODEL,
      input: inputs,
      dimensions: DIMS,
    })
    return res.data.map(d => d.embedding)
  } catch (err: unknown) {
    if (attempt >= 3) throw err
    const delay = 1000 * Math.pow(2, attempt)
    console.warn(`  embed batch failed (attempt ${attempt}/3), retrying in ${delay}ms: ${(err as Error).message}`)
    await sleep(delay)
    return embedBatch(inputs, attempt + 1)
  }
}

/**
 * Embed an array of texts. Splits into batches automatically.
 * Returns array of embeddings in the same order.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const out: number[][] = []
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const embeddings = await embedBatch(batch)
    out.push(...embeddings)
  }
  return out
}

export const EMBEDDING_MODEL_NAME = MODEL
export const EMBEDDING_DIMS = DIMS

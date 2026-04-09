/**
 * LLM Client — wrapper Anthropic primario + OpenAI fallback + circuit breaker.
 *
 * Portado do iconsaiStats (lib/llm-client.ts), adaptado para o schema 'eduven'.
 *
 * Uso:
 *   import { createMessage } from '@/lib/llm-client'
 *   const res = await createMessage(
 *     { model: 'claude-sonnet-4-5-20250929', max_tokens: 4000, messages: [...] },
 *     { route: '/api/eduven/lesson' }
 *   )
 *
 * Comportamento:
 *   1. Se circuito aberto → vai DIRETO no OpenAI.
 *   2. Senao tenta Anthropic com timeout de 60s.
 *   3. Em qualquer falha → fallback OpenAI.
 *   4. 3 falhas Anthropic em 60s abrem o circuito por 5 min.
 *   5. Cada chamada eh logada em eduven.llm_call_logs (best-effort).
 *   6. Resposta sempre no shape Anthropic Message — drop-in safe.
 */
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { getDb } from './db'

let _anthropic: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic()
  return _anthropic
}

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI()
  return _openai
}

// Circuit breaker (process-local)
const CB_THRESHOLD = 3
const CB_WINDOW_MS = 60_000
const CB_OPEN_DURATION_MS = 5 * 60_000
const ANTHROPIC_TIMEOUT_MS = 60_000

let cbFailures: number[] = []
let cbOpenUntil = 0

function recordAnthropicFailure(): void {
  const now = Date.now()
  cbFailures.push(now)
  cbFailures = cbFailures.filter(t => now - t < CB_WINDOW_MS)
  if (cbFailures.length >= CB_THRESHOLD) {
    cbOpenUntil = now + CB_OPEN_DURATION_MS
    console.warn(`[llm-client] CIRCUIT BREAKER OPEN — Anthropic skipped por ${CB_OPEN_DURATION_MS / 1000}s`)
    cbFailures = []
  }
}

function recordAnthropicSuccess(): void {
  if (cbFailures.length > 0 || cbOpenUntil > 0) {
    cbFailures = []
    cbOpenUntil = 0
  }
}

function isCircuitOpen(): boolean {
  return Date.now() < cbOpenUntil
}

export function getCircuitState() {
  return {
    open: isCircuitOpen(),
    failuresInWindow: cbFailures.length,
    openUntil: cbOpenUntil ? new Date(cbOpenUntil).toISOString() : null,
  }
}

interface LogEntry {
  provider: 'anthropic' | 'openai'
  modelReq: string
  modelUsed: string
  route: string | null
  latencyMs: number
  inputTok: number | null
  outputTok: number | null
  success: boolean
  errorMsg: string | null
  circuitOpen: boolean
}

async function logCall(entry: LogEntry): Promise<void> {
  try {
    const db = getDb()
    await db.from('llm_call_logs').insert({
      provider: entry.provider,
      model_req: entry.modelReq,
      model_used: entry.modelUsed,
      route: entry.route,
      latency_ms: entry.latencyMs,
      input_tok: entry.inputTok,
      output_tok: entry.outputTok,
      success: entry.success,
      error_msg: entry.errorMsg,
      circuit_open: entry.circuitOpen,
    })
  } catch {
    // best-effort, nunca quebra a chamada
  }
}

function mapModelToOpenAI(claudeModel: string): string {
  if (claudeModel.includes('haiku')) return 'gpt-4o-mini'
  return 'gpt-4o'
}

type MessageCreateParams = Anthropic.Messages.MessageCreateParamsNonStreaming
type Message = Anthropic.Messages.Message

export interface CallContext {
  route?: string
}

export async function createMessage(
  params: MessageCreateParams,
  ctx: CallContext = {}
): Promise<Message> {
  const route = ctx.route ?? null
  const modelReq = params.model

  if (isCircuitOpen()) {
    return tryOpenAI(params, route, modelReq, true)
  }

  const startedAt = Date.now()
  const ctrl = new AbortController()
  const timeoutId = setTimeout(() => ctrl.abort(), ANTHROPIC_TIMEOUT_MS)

  try {
    const msg = await getAnthropic().messages.create(params, { signal: ctrl.signal })
    clearTimeout(timeoutId)
    Object.defineProperty(msg, '_provider', { value: 'anthropic', enumerable: false })
    recordAnthropicSuccess()
    void logCall({
      provider: 'anthropic',
      modelReq,
      modelUsed: modelReq,
      route,
      latencyMs: Date.now() - startedAt,
      inputTok: msg.usage?.input_tokens ?? null,
      outputTok: msg.usage?.output_tokens ?? null,
      success: true,
      errorMsg: null,
      circuitOpen: false,
    })
    return msg
  } catch (anthropicError) {
    clearTimeout(timeoutId)
    recordAnthropicFailure()
    const errMsg = anthropicError instanceof Error ? anthropicError.message : String(anthropicError)
    console.warn('[llm-client] Anthropic falhou, tentando OpenAI:', errMsg)
    void logCall({
      provider: 'anthropic',
      modelReq,
      modelUsed: modelReq,
      route,
      latencyMs: Date.now() - startedAt,
      inputTok: null,
      outputTok: null,
      success: false,
      errorMsg: errMsg.slice(0, 500),
      circuitOpen: isCircuitOpen(),
    })
    return tryOpenAI(params, route, modelReq, false)
  }
}

async function tryOpenAI(
  params: MessageCreateParams,
  route: string | null,
  modelReq: string,
  circuitWasOpen: boolean
): Promise<Message> {
  const startedAt = Date.now()
  try {
    const msg = await callOpenAIFallback(params)
    Object.defineProperty(msg, '_provider', { value: 'openai', enumerable: false })
    void logCall({
      provider: 'openai',
      modelReq,
      modelUsed: mapModelToOpenAI(modelReq),
      route,
      latencyMs: Date.now() - startedAt,
      inputTok: msg.usage?.input_tokens ?? null,
      outputTok: msg.usage?.output_tokens ?? null,
      success: true,
      errorMsg: null,
      circuitOpen: circuitWasOpen,
    })
    return msg
  } catch (openaiError) {
    const oErr = openaiError instanceof Error ? openaiError.message : String(openaiError)
    console.error('[llm-client] OpenAI fallback tambem falhou:', oErr)
    void logCall({
      provider: 'openai',
      modelReq,
      modelUsed: mapModelToOpenAI(modelReq),
      route,
      latencyMs: Date.now() - startedAt,
      inputTok: null,
      outputTok: null,
      success: false,
      errorMsg: oErr.slice(0, 500),
      circuitOpen: circuitWasOpen,
    })
    throw openaiError
  }
}

async function callOpenAIFallback(params: MessageCreateParams): Promise<Message> {
  const openai = getOpenAI()
  const openaiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []
  if (params.system) {
    const systemText = typeof params.system === 'string'
      ? params.system
      : params.system.map(b => (b.type === 'text' ? b.text : '')).join('\n')
    if (systemText.trim()) openaiMessages.push({ role: 'system', content: systemText })
  }
  for (const msg of params.messages) {
    let content: string
    if (typeof msg.content === 'string') {
      content = msg.content
    } else {
      content = msg.content.map(b => (b.type === 'text' ? b.text : '')).filter(Boolean).join('\n')
    }
    openaiMessages.push({ role: msg.role, content })
  }

  const openaiResp = await openai.chat.completions.create({
    model: mapModelToOpenAI(params.model),
    messages: openaiMessages,
    max_tokens: params.max_tokens,
    temperature: params.temperature ?? undefined,
  })

  const text = openaiResp.choices[0]?.message?.content ?? ''
  const finishReason = openaiResp.choices[0]?.finish_reason

  return {
    id: openaiResp.id,
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text, citations: null }],
    model: params.model,
    stop_reason: finishReason === 'length' ? 'max_tokens' : 'end_turn',
    stop_sequence: null,
    usage: {
      input_tokens: openaiResp.usage?.prompt_tokens ?? 0,
      output_tokens: openaiResp.usage?.completion_tokens ?? 0,
      cache_creation_input_tokens: null,
      cache_read_input_tokens: null,
      server_tool_use: null,
      service_tier: null,
    },
  } as unknown as Message
}

export function getProvider(msg: Message): 'anthropic' | 'openai' | 'unknown' {
  const p = (msg as unknown as { _provider?: string })._provider
  return p === 'anthropic' || p === 'openai' ? p : 'unknown'
}

/** Extrai texto da resposta (helper). */
export function extractText(msg: Message): string {
  return msg.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
}

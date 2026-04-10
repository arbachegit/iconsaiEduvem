import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface TrackBody {
  type: string
  metadata?: Record<string, unknown>
  sessionId?: string
  deviceInfo?: {
    deviceType?: string
    deviceOS?: string
    deviceBrowser?: string
    screenWidth?: number
    screenHeight?: number
    language?: string
    timezone?: string
    connectionType?: string | null
    isTouch?: boolean
    darkMode?: boolean
    referrer?: string
  }
}

/** Simple server-side device type detection from user-agent */
function detectDeviceTypeFromUA(ua: string): string {
  const lower = ua.toLowerCase()
  if (/ipad|tablet|playbook|silk/.test(lower)) return 'tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/.test(lower)) return 'mobile'
  return 'desktop'
}

export async function POST(req: NextRequest) {
  try {
    const body: TrackBody = await req.json()
    const { type, metadata, sessionId, deviceInfo } = body

    if (!type) {
      return NextResponse.json({ ok: false, error: 'missing type' }, { status: 400 })
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null
    const userAgent = req.headers.get('user-agent') || null

    const row = {
      event_type: type,
      user_ip: ip,
      user_agent: userAgent,
      device_type: deviceInfo?.deviceType || (userAgent ? detectDeviceTypeFromUA(userAgent) : null),
      device_os: deviceInfo?.deviceOS || null,
      device_browser: deviceInfo?.deviceBrowser || null,
      screen_width: deviceInfo?.screenWidth || null,
      screen_height: deviceInfo?.screenHeight || null,
      language: deviceInfo?.language || null,
      timezone: deviceInfo?.timezone || null,
      connection_type: deviceInfo?.connectionType || null,
      is_touch: deviceInfo?.isTouch ?? null,
      dark_mode: deviceInfo?.darkMode ?? null,
      referrer: deviceInfo?.referrer || null,
      metadata: metadata || {},
      session_id: sessionId || null,
    }

    const db = getDb()
    const { error } = await db.from('user_events').insert(row)

    if (error) {
      console.error('[track] insert error:', error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    // Best-effort: never fail the caller
    console.error('[track] unexpected error:', (err as Error).message)
    return NextResponse.json({ ok: true })
  }
}

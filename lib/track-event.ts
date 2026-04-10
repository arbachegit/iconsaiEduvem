'use client'

import { collectDeviceInfo, getSessionId } from './device-fingerprint'

/**
 * Fire-and-forget event tracking.
 * Components call: trackEvent('lesson_open', { nrId: 35, sector: 'construcao_civil' })
 */
export function trackEvent(type: string, metadata?: Record<string, unknown>): void {
  try {
    const deviceInfo = collectDeviceInfo()
    const sessionId = getSessionId()

    fetch('/api/eduven/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, metadata, sessionId, deviceInfo }),
      keepalive: true,
    }).catch(() => {
      // silent — tracking must never break the app
    })
  } catch {
    // silent
  }
}

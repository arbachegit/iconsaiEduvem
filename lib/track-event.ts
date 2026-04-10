'use client'

import { collectDeviceInfo, getSessionId } from './device-fingerprint'

/**
 * Fire-and-forget event tracking.
 * Components call: trackEvent('lesson_open', { nrId: 35, sector: 'construcao_civil' })
 */
/** Le o cookie eduven_student_id (set pelo middleware, persistente 1 ano) */
function getStudentId(): string {
  try {
    const match = document.cookie.match(/eduven_student_id=([^;]+)/)
    return match ? match[1] : ''
  } catch { return '' }
}

export function trackEvent(type: string, metadata?: Record<string, unknown>): void {
  try {
    const deviceInfo = collectDeviceInfo()
    const sessionId = getSessionId()
    const studentId = getStudentId()

    // Injeta studentId em TODA metadata pra poder buscar progresso por aluno
    const enrichedMeta = { ...metadata, studentId }

    fetch('/api/eduven/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, metadata: enrichedMeta, sessionId, deviceInfo }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // silent
  }
}

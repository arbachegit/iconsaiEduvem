'use client'

export interface DeviceInfo {
  deviceType: 'mobile' | 'desktop' | 'tablet'
  deviceOS: string
  deviceBrowser: string
  screenWidth: number
  screenHeight: number
  language: string
  timezone: string
  connectionType: string | null
  isTouch: boolean
  darkMode: boolean
  referrer: string
}

/** Detect device type from user-agent and screen width */
function detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  const ua = navigator.userAgent.toLowerCase()
  const width = window.innerWidth

  if (/ipad|tablet|playbook|silk/i.test(ua) || (width >= 600 && width <= 1024 && 'ontouchstart' in window)) {
    return 'tablet'
  }
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua) || width < 600) {
    return 'mobile'
  }
  return 'desktop'
}

/** Detect OS from user-agent */
function detectOS(): string {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS'
  if (/Android/.test(ua)) return 'Android'
  if (/Windows/.test(ua)) return 'Windows'
  if (/Mac OS X|Macintosh/.test(ua)) return 'macOS'
  if (/Linux/.test(ua)) return 'Linux'
  if (/CrOS/.test(ua)) return 'ChromeOS'
  return 'Unknown'
}

/** Detect browser from user-agent */
function detectBrowser(): string {
  const ua = navigator.userAgent
  // Order matters: Edge before Chrome, Chrome before Safari
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari'
  if (/MSIE|Trident/.test(ua)) return 'IE'
  return 'Unknown'
}

/** Collect all device info for tracking */
export function collectDeviceInfo(): DeviceInfo {
  const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection
  return {
    deviceType: detectDeviceType(),
    deviceOS: detectOS(),
    deviceBrowser: detectBrowser(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    language: navigator.language || 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
    connectionType: conn?.effectiveType ?? null,
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    darkMode: window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
    referrer: document.referrer || '',
  }
}

const SESSION_KEY = 'eduven_session_id'

/** Get or create a session UUID (persists within a single tab) */
export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

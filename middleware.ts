import { NextRequest, NextResponse } from 'next/server'

/**
 * iconsaiEduven — tools-auth gate (mesmo padrao do stats/python/finance/esg).
 *
 * Cookies:
 *   course_session_eduven        — sessao normal (1h)
 *   course_admin_session_eduven  — sessao admin (1h, scope=course_admin_access)
 *
 * Skip list inclui webmanifest/json/txt/xml para evitar bug de CORS no
 * manifest (mesmo que ja foi descoberto e corrigido nos outros apps).
 */
const TOOLS_VERIFY_URL = process.env.TOOLS_VERIFY_URL || 'https://icon.iconsai.ai/icon/api/tools-auth/verify'
const TOOLS_LOGIN_URL = process.env.TOOLS_LOGIN_URL || 'https://icon.iconsai.ai/icon/tools?reason=auth'
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || 'course_session_eduven'
const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE_NAME || 'course_admin_session_eduven'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets, health, version, manifest, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/health') ||
    pathname.includes('/version') ||
    pathname.includes('/favicon') ||
    pathname === '/.deploy-sha' ||
    pathname === '/.deploy-timestamp' ||
    /\.(svg|png|jpg|jpeg|webp|ico|gif|css|js|woff2?|ttf|otf|map|webmanifest|json|txt|xml)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  const isAdmin = pathname.startsWith('/admin')
  const courseToken = request.nextUrl.searchParams.get('course_token')
  const sessionCookie = request.cookies.get(isAdmin ? ADMIN_SESSION_COOKIE : SESSION_COOKIE)?.value

  if (courseToken) {
    try {
      const verifyRes = await fetch(`${TOOLS_VERIFY_URL}?course_token=${encodeURIComponent(courseToken)}`, {
        headers: {
          'User-Agent': request.headers.get('user-agent') || '',
          'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        },
      })

      if (verifyRes.status === 200) {
        const scope = verifyRes.headers.get('x-tools-scope') || ''
        if (isAdmin && scope !== 'course_admin_access') {
          return NextResponse.redirect(new URL(TOOLS_LOGIN_URL))
        }
        const response = NextResponse.next()
        response.cookies.set(isAdmin ? ADMIN_SESSION_COOKIE : SESSION_COOKIE, courseToken, {
          httpOnly: true, secure: true, sameSite: 'lax', maxAge: 3600,
        })
        return response
      }
    } catch { /* fall through */ }
    return NextResponse.redirect(new URL(TOOLS_LOGIN_URL))
  }

  if (sessionCookie) return NextResponse.next()
  return NextResponse.redirect(new URL(TOOLS_LOGIN_URL))
}

export const config = {
  matcher: ['/', '/((?!_next|api|health|version|favicon|manifest\\.webmanifest|manifest\\.json|robots\\.txt|sitemap\\.xml).*)'],
}

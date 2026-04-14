import { NextResponse } from 'next/server'

/**
 * Eduvem — sem autenticação. Acesso aberto.
 * Apenas garante cookie de student_id para tracking.
 */
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon).*)'],
}

import { NextRequest, NextResponse } from 'next/server'

const ADMIN_EMAIL = 'arbache@gmail.com'
const ADMIN_PASSWORD = 'Sarbache*6570'
const COOKIE_NAME = 'admin_eduven_session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha sao obrigatorios' },
        { status: 400 }
      )
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Credenciais invalidas' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, 'valid', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24h
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar requisicao' },
      { status: 500 }
    )
  }
}

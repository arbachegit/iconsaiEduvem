import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

/**
 * POST /api/eduven/admin/login
 *
 * Valida credenciais contra a tabela eduven.admin_users no banco.
 * NENHUMA credencial hardcoded no código.
 *
 * Pra adicionar/remover admin: INSERT/DELETE em eduven.admin_users via SQL.
 * Pra trocar senha: UPDATE eduven.admin_users SET password_hash = '...'
 */

const COOKIE_NAME = 'admin_eduven_session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Busca no banco — credenciais NUNCA ficam no código
    const db = getDb()
    const { data, error } = await db
      .from('admin_users')
      .select('id, email, password_hash')
      .eq('email', String(email).trim().toLowerCase())
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Comparação direta (MVP). Futuro: bcrypt.compare(password, data.password_hash)
    if ((data as any).password_hash !== password) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
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
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}

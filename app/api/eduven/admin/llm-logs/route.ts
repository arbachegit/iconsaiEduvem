/* ═══════════════════════════════════════════════════════════
   GET /api/eduven/admin/llm-logs
   Returns logs of LLM calls + circuit breaker state.

   Auth: admin_eduven_session cookie.

   Query params:
     limit       — default 100, max 500
     provider    — 'anthropic' | 'openai' | (omit = both)
     success     — 'true' | 'false' | (omit = both)
     since_hours — default 24
   ═══════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { getCircuitState } from '@/lib/llm-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_eduven_session');
  if (!session || session.value !== 'valid') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '100', 10) || 100, 500);
  const provider = req.nextUrl.searchParams.get('provider');
  const success = req.nextUrl.searchParams.get('success');
  const sinceHours = parseInt(req.nextUrl.searchParams.get('since_hours') || '24', 10) || 24;
  const sinceIso = new Date(Date.now() - sinceHours * 3600 * 1000).toISOString();

  const db = getDb();
  let q = db.from('llm_call_logs').select('*').gte('ts', sinceIso).order('ts', { ascending: false }).limit(limit);
  if (provider === 'anthropic' || provider === 'openai') q = q.eq('provider', provider);
  if (success === 'true') q = q.eq('success', true);
  if (success === 'false') q = q.eq('success', false);

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({
      logs: [],
      circuit: getCircuitState(),
      stats: { total: 0, success: 0, failure: 0, anthropic: 0, openai: 0, fallbacks: 0 },
      error: error.message,
    });
  }

  const logs = data || [];
  const stats = {
    total: logs.length,
    success: logs.filter((l: { success: boolean }) => l.success).length,
    failure: logs.filter((l: { success: boolean }) => !l.success).length,
    anthropic: logs.filter((l: { provider: string }) => l.provider === 'anthropic').length,
    openai: logs.filter((l: { provider: string }) => l.provider === 'openai').length,
    fallbacks: logs.filter((l: { provider: string; success: boolean }) => l.provider === 'openai' && l.success).length,
  };

  return NextResponse.json({
    logs,
    circuit: getCircuitState(),
    stats,
  });
}

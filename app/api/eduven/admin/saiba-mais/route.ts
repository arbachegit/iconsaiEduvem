import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { createMessage } from '@/lib/llm-client';

/* ═══════════════════════════════════════════════════════════
   GET /api/eduven/admin/saiba-mais?table=nrs
   Claude-powered table description — returns Markdown

   Cache in-memory com TTL 1h.
   Auth: admin_eduven_session cookie.
   ═══════════════════════════════════════════════════════════ */

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_eduven_session');
  if (!session || session.value !== 'valid') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const table = req.nextUrl.searchParams.get('table');
  if (!table || !/^[a-z_]+$/.test(table)) {
    return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
  }

  const cached = cache.get(table);
  if (cached && Date.now() < cached.expiresAt) return NextResponse.json(cached.data);

  try {
    const db = getDb();
    const { data: samples } = await db.from(table).select('*').limit(5);

    const colSummary = samples && samples.length > 0
      ? Object.keys(samples[0]).map(col => `- \`${col}\` \`text\``).join('\n')
      : 'Nao disponivel';

    const sampleStr = JSON.stringify(samples?.slice(0, 3) || [], null, 2).slice(0, 1500);

    const response = await createMessage({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Descreva a tabela "${table}" de um banco de dados educacional de NRs (Normas Regulamentadoras). Portugues BR.

COLUNAS:
${colSummary}

AMOSTRA:
${sampleStr}

Retorne APENAS Markdown formatado com EXATAMENTE estas secoes:

## Descricao
2-3 frases descrevendo o proposito da tabela.

## Campos Principais
- **nome_coluna** \`tipo\` — explicacao curta
- **outra_coluna** \`tipo\` — explicacao curta

## Relacionamentos
- Relacao com outra tabela via FK
- Outra relacao

## Evolucao
1 frase sobre como a tabela pode evoluir.

Use **negrito** para nomes de colunas, \`codigo\` para tipos SQL. Seja conciso e didatico. APENAS Markdown, sem JSON.`,
      }],
    }, { route: '/api/eduven/admin/saiba-mais' });

    const description = response.content[0].type === 'text' ? response.content[0].text : `# ${table}\n\nDescricao nao disponivel.`;
    const result = { table, description, generated_at: new Date().toISOString() };

    cache.set(table, { data: result, expiresAt: Date.now() + CACHE_TTL });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[saiba-mais] Error:', (err as Error).message);
    return NextResponse.json({ error: 'Erro ao gerar descricao' }, { status: 500 });
  }
}

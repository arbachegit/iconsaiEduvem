import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { sanitizeText, sanitizeInt, sanitizeSort, sanitizeOrder, sanitizeError, isValidTable } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_eduven_session');
  if (!session || session.value !== 'valid') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'stats';
  const db = getDb();

  try {
    if (action === 'auth') {
      return NextResponse.json({ ok: true });
    }

    if (action === 'stats') {
      const tables = [
        'nrs', 'nr_chunks', 'nr_raw_sources', 'sectors', 'nr_sector_relevance',
        'lessons', 'exercises', 'submissions', 'llm_call_logs', 'user_events',
      ];
      const tableStats = [];
      for (const name of tables) {
        try {
          const { count, data: sample } = await db.from(name).select('*', { count: 'exact' }).limit(1);
          const columns = sample && sample.length > 0
            ? Object.keys(sample[0]).map(col => ({ name: col, type: 'text', pk: col === 'id', required: false }))
            : [];
          tableStats.push({ name, rows: count || 0, columns });
        } catch {
          // table might not exist yet — skip silently
          tableStats.push({ name, rows: 0, columns: [] });
        }
      }
      const totalRows = tableStats.reduce((sum, t) => sum + t.rows, 0);
      return NextResponse.json({ totalTables: tableStats.length, totalRows, tables: tableStats });
    }

    if (action === 'rows') {
      const table = searchParams.get('table');
      const limit = sanitizeInt(searchParams.get('limit'), 50, 1, 200);
      const offset = sanitizeInt(searchParams.get('offset'), 0, 0, 100000);
      const search = sanitizeText(searchParams.get('search'), 100);
      const sort = sanitizeSort(searchParams.get('sort'));
      const order = sanitizeOrder(searchParams.get('order'));

      if (!isValidTable(table)) {
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
      }

      let query = db.from(table).select('*', { count: 'exact' });

      if (search.length >= 2) {
        const q = `%${search}%`;
        const textFilters = ['title', 'label', 'slug', 'description', 'nr_code', 'content', 'sector_name', 'type', 'route', 'provider']
          .map(col => `${col}.ilike.${q}`)
          .join(',');
        query = query.or(textFilters);
      }

      if (sort) {
        query = query.order(sort, { ascending: order !== 'DESC' });
      }

      query = query.range(offset, offset + limit - 1);

      const { data: rows, count: total, error } = await query;

      if (error) {
        if (search.length >= 2) {
          const { data: fallbackRows, count: fallbackTotal } = await db
            .from(table)
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1);
          const fr = fallbackRows || [];
          const fc = fr.length > 0 ? Object.keys(fr[0]) : [];
          return NextResponse.json({ table, columns: fc, types: fc.map(() => 'text'), rows: fr, total: fallbackTotal || 0, limit, offset });
        }
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
      }

      const safeRows = rows || [];
      const columns = safeRows.length > 0 ? Object.keys(safeRows[0]) : [];
      const types = columns.map(() => 'text');
      return NextResponse.json({ table, columns, types, rows: safeRows, total: total || 0, limit, offset });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Admin DB error:', sanitizeError(err));
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

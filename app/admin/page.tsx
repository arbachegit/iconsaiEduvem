'use client';

import { useState, useEffect, useCallback } from 'react';
import { Database, Table, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, X, Layers, LogOut, GitBranch, Info, BarChart3, FileText } from 'lucide-react';
import ERDiagram from '@/components/ERDiagram';
import ReactMarkdown from 'react-markdown';

const C = {
  bg: '#05070d', bg2: '#0c1220', bgCard: 'rgba(15,25,42,0.6)',
  text: '#eaf0f6', muted: '#94a3b8', dim: '#64748b',
  cyan: '#00d4ff', border: 'rgba(100,116,139,0.25)',
  mono: "'JetBrains Mono', monospace",
  font: "'Inter', sans-serif",
};

const TABLE_COLORS: Record<string, string> = {
  nrs: '#a855f7',
  nr_chunks: '#22d3ee',
  nr_raw_sources: '#22c55e',
  sectors: '#ef4444',
  nr_sector_relevance: '#fb923c',
  lessons: '#eab308',
  exercises: '#3b82f6',
  submissions: '#ec4899',
  llm_call_logs: '#64748b',
  user_events: '#8b5cf6',
};

const TEXT_COLS = new Set([
  'description', 'desc', 'content', 'text', 'label', 'title',
  'source_url', 'error_msg', 'metadata', 'question', 'answer',
  'explanation', 'options', 'nr_code',
]);

interface TableInfo { name: string; rows: number; columns: { name: string; type: string; pk: boolean; required: boolean }[] }
interface TableData { table: string; columns?: string[]; types?: string[]; rows: Record<string, unknown>[]; total: number; limit: number; offset: number }

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);

  const [stats, setStats] = useState<{ totalTables: number; totalRows: number; tables: TableInfo[] } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<TableData | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [cellModal, setCellModal] = useState<{ col: string; value: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'explorer' | 'diagram'>('explorer');
  const [saibaMais, setSaibaMais] = useState<{ table: string; description: string; generated_at: string } | null>(null);
  const [saibaMaisLoading, setSaibaMaisLoading] = useState<string | null>(null);

  const LIMIT = 50;

  const fetchSaibaMais = useCallback(async (tableName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaibaMaisLoading(tableName);
    try {
      const res = await fetch(`/api/eduven/admin/saiba-mais?table=${tableName}`);
      if (res.ok) {
        const data = await res.json();
        setSaibaMais(data);
      }
    } catch { /* ignore */ }
    setSaibaMaisLoading(null);
  }, []);

  const api = useCallback(async (action: string, params: Record<string, string> = {}) => {
    const qs = new URLSearchParams({ action, ...params });
    const res = await fetch(`/api/eduven/admin/db?${qs}`);
    if (res.status === 401) {
      document.cookie = 'admin_eduven_session=; Max-Age=0; Path=/';
      window.location.href = '/admin/login';
      return null;
    }
    return res.json();
  }, []);

  // Auth check on mount
  useEffect(() => {
    // Check if cookie exists by calling API
    api('auth').then(d => {
      if (d) setAuthenticated(true);
    });
  }, [api]);

  // Load stats when authenticated
  useEffect(() => {
    if (authenticated) { api('stats').then(d => d && setStats(d)); }
  }, [authenticated, api]);

  const handleLogout = () => {
    document.cookie = 'admin_eduven_session=; Max-Age=0; Path=/';
    window.location.href = '/api/eduven/admin/logout';
  };

  const loadTable = useCallback(async (table: string, offset = 0, s?: string, so?: string, o?: string) => {
    setLoading(true);
    const params: Record<string, string> = { table, limit: String(LIMIT), offset: String(offset) };
    const q = s !== undefined ? s : search;
    const srt = so !== undefined ? so : sort;
    const ord = o !== undefined ? o : order;
    if (q.length >= 2) params.search = q;
    if (srt) { params.sort = srt; params.order = ord; }
    const result = await api('rows', params);
    if (result) setData(result);
    setLoading(false);
  }, [api, search, sort, order]);

  const handleSelectTable = (name: string) => {
    setSelected(name); setPage(0); setSearch(''); setSort(''); setOrder('ASC');
    loadTable(name, 0, '', '', 'ASC');
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    if ((q.length >= 2 || q.length === 0) && selected) {
      setPage(0);
      loadTable(selected, 0, q);
    }
  };

  const handleSort = (col: string) => {
    const newOrder = sort === col && order === 'ASC' ? 'DESC' : 'ASC';
    setSort(col); setOrder(newOrder); setPage(0);
    if (selected) loadTable(selected, 0, search, col, newOrder);
  };

  const handlePage = (dir: number) => {
    const newPage = page + dir; setPage(newPage);
    if (selected) loadTable(selected, newPage * LIMIT);
  };

  const truncate = (val: unknown, max = 80): string => {
    const s = val === null ? 'NULL' : String(val);
    return s.length > max ? s.substring(0, max) + '...' : s;
  };

  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: C.font,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: C.dim }}>Verificando autenticacao...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: C.font }}>
      {/* Header */}
      <header style={{
        padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.bg2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database size={24} style={{ color: C.cyan }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Eduven Admin</h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: C.dim }}>Database Explorer</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {(['explorer', 'diagram'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: 'none',
              backgroundColor: activeTab === tab ? 'rgba(0,212,255,0.15)' : 'transparent',
              color: activeTab === tab ? C.cyan : C.muted, cursor: 'pointer',
              fontFamily: C.font, fontSize: '0.8125rem', fontWeight: 500,
            }}>
              {tab === 'explorer' ? <Table size={14} /> : <GitBranch size={14} />}
              {tab === 'explorer' ? 'Explorer' : 'Diagrama'}
            </button>
          ))}
          <a href="/admin/analytics" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: 'none',
            backgroundColor: 'transparent', color: C.muted, cursor: 'pointer',
            fontFamily: C.font, fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none',
          }}>
            <BarChart3 size={14} />
            Analytics
          </a>
          <a href="/admin/llm-logs" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: 'none',
            backgroundColor: 'transparent', color: C.muted, cursor: 'pointer',
            fontFamily: C.font, fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none',
          }}>
            <FileText size={14} />
            LLM Logs
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8125rem' }}>
          {stats && (
            <>
              <span><strong style={{ color: C.cyan }}>{stats.totalTables}</strong> tabelas</span>
              <span><strong style={{ color: C.cyan }}>{stats.totalRows.toLocaleString()}</strong> registros</span>
            </>
          )}
          <button onClick={handleLogout} title="Sair" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: `1px solid ${C.border}`,
            backgroundColor: 'transparent', color: C.muted, cursor: 'pointer', fontFamily: C.font, fontSize: '0.75rem',
          }}><LogOut size={14} />Sair</button>
        </div>
      </header>

      {activeTab === 'diagram' ? (
        <ERDiagram />
      ) : (
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: 280, borderRight: `1px solid ${C.border}`, padding: '1rem',
          overflowY: 'auto', backgroundColor: 'rgba(5,7,13,0.5)',
        }}>
          <p style={{ fontSize: '0.6875rem', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontWeight: 600 }}>Tabelas</p>
          {stats?.tables.map(t => {
            const color = TABLE_COLORS[t.name] || C.cyan;
            const active = selected === t.name;
            return (
              <button key={t.name} onClick={() => handleSelectTable(t.name)} style={{
                width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: C.font,
                padding: '0.75rem', marginBottom: '0.5rem', borderRadius: '0.5rem',
                border: `1px solid ${active ? color : C.border}`,
                backgroundColor: active ? `${color}15` : C.bgCard, transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Table size={14} style={{ color }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: active ? '#fff' : C.text }}>{t.name}</span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: C.dim, fontFamily: C.mono }}>{t.rows}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: C.dim }}>{t.columns.length} colunas</span>
                  <button
                    onClick={(e) => fetchSaibaMais(t.name, e)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: '2px 8px', borderRadius: 10, border: `1px solid ${color}40`,
                      background: `${color}10`, color, fontSize: '0.625rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: C.font, transition: 'all 0.15s',
                    }}
                  >
                    <Info size={10} />
                    {saibaMaisLoading === t.name ? '...' : 'Saiba mais'}
                  </button>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '1.25rem', overflowX: 'auto' }}>
          {!selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.dim }}>
              <Layers size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.125rem' }}>Selecione uma tabela para explorar</p>
            </div>
          ) : (
            <>
              {/* Table Header + Search */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>{selected}</h2>
                  {data && <p style={{ margin: 0, fontSize: '0.75rem', color: C.dim }}>{data.total.toLocaleString()} registros</p>}
                </div>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.dim, pointerEvents: 'none' }} />
                  <input type="text" placeholder="Buscar (min 2 letras)..." value={search} onChange={e => handleSearch(e.target.value)}
                    style={{
                      backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem 0.5rem 2rem', color: C.text, fontSize: '0.8125rem',
                      fontFamily: C.font, outline: 'none', width: 260,
                    }} />
                </div>
              </div>

              {/* Data Table */}
              <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: '0.5rem', backgroundColor: C.bgCard }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', fontFamily: C.mono }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {(data?.columns || []).map((col, i) => (
                        <th key={col} onClick={() => handleSort(col)} style={{
                          padding: '0.625rem 0.75rem', textAlign: 'left', cursor: 'pointer',
                          color: sort === col ? C.cyan : C.muted, fontWeight: 600, fontSize: '0.75rem',
                          whiteSpace: 'nowrap', userSelect: 'none',
                          borderRight: i < ((data?.columns || []).length || 0) - 1 ? `1px solid ${C.border}` : 'none',
                        }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            {col} <span style={{ fontSize: '0.625rem', color: C.dim }}>{(data?.types || [])[i]}</span>
                            {sort === col && (order === 'ASC' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={(data?.columns || []).length || 1} style={{ padding: '2rem', textAlign: 'center', color: C.dim }}>Carregando...</td></tr>
                    ) : data?.rows.length === 0 ? (
                      <tr><td colSpan={(data?.columns || []).length || 1} style={{ padding: '2rem', textAlign: 'center', color: C.dim }}>Nenhum resultado</td></tr>
                    ) : data?.rows.map((row, ri) => (
                      <tr key={ri} style={{ borderBottom: `1px solid ${C.border}` }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        {(data?.columns || []).map((col, ci) => {
                          const val = row[col];
                          const text = truncate(val);
                          const isLong = val !== null && String(val).length > 80;
                          const isTextCol = TEXT_COLS.has(col.toLowerCase());
                          const clickable = isLong || (isTextCol && val !== null && String(val).length > 0);
                          return (
                            <td key={ci} onClick={() => clickable ? setCellModal({ col, value: String(val) }) : null}
                              title={String(val ?? '')} style={{
                                padding: '0.5rem 0.75rem', maxWidth: 300, overflow: 'hidden',
                                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                color: val === null ? C.dim : clickable ? C.cyan : C.text,
                                fontStyle: val === null ? 'italic' : 'normal',
                                cursor: clickable ? 'pointer' : 'default',
                                textDecoration: clickable ? 'underline' : 'none',
                                textDecorationColor: clickable ? 'rgba(0,212,255,0.3)' : 'transparent',
                                borderRight: ci < (data?.columns || []).length - 1 ? `1px solid ${C.border}` : 'none',
                              }}>{text}</td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.total > LIMIT && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '0.8125rem', color: C.muted }}>
                  <button onClick={() => handlePage(-1)} disabled={page === 0} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: `1px solid ${C.border}`,
                    backgroundColor: page === 0 ? 'transparent' : C.bgCard,
                    color: page === 0 ? C.dim : C.text, cursor: page === 0 ? 'not-allowed' : 'pointer',
                    fontFamily: C.font, fontSize: '0.8125rem',
                  }}><ChevronLeft size={14} />Anterior</button>
                  <span>{page * LIMIT + 1}\u2013{Math.min((page + 1) * LIMIT, data.total)} de {data.total.toLocaleString()}</span>
                  <button onClick={() => handlePage(1)} disabled={(page + 1) * LIMIT >= data.total} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: `1px solid ${C.border}`,
                    backgroundColor: (page + 1) * LIMIT >= data.total ? 'transparent' : C.bgCard,
                    color: (page + 1) * LIMIT >= data.total ? C.dim : C.text,
                    cursor: (page + 1) * LIMIT >= data.total ? 'not-allowed' : 'pointer',
                    fontFamily: C.font, fontSize: '0.8125rem',
                  }}>Proximo<ChevronRight size={14} /></button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      )}

      {/* Cell Modal */}
      {cellModal && (
        <div onClick={() => setCellModal(null)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '2rem', backdropFilter: 'blur(4px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: C.bg2, border: `1px solid ${C.border}`, borderRadius: '0.75rem',
            maxWidth: 700, width: '100%', maxHeight: '80vh', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontWeight: 600, color: C.cyan }}>{cellModal.col}</span>
              <button onClick={() => setCellModal(null)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <pre style={{
              padding: '1.25rem', overflowY: 'auto', maxHeight: 'calc(80vh - 60px)',
              fontFamily: C.mono, fontSize: '0.8125rem', lineHeight: 1.6,
              color: C.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
            }}>{cellModal.value}</pre>
          </div>
        </div>
      )}

      {/* Saiba Mais Modal */}
      {saibaMais && (
        <div onClick={() => setSaibaMais(null)} style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '8vh', overflowY: 'auto',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16,
            width: '90%', maxWidth: 640, padding: '2rem', position: 'relative',
          }}>
            <button onClick={() => setSaibaMais(null)} style={{
              position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
              color: C.dim, cursor: 'pointer',
            }}><X size={20} /></button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${TABLE_COLORS[saibaMais.table] || C.cyan}20`, border: `1px solid ${TABLE_COLORS[saibaMais.table] || C.cyan}40`,
              }}>
                <Info size={18} style={{ color: TABLE_COLORS[saibaMais.table] || C.cyan }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>{saibaMais.table}</h3>
                <span style={{ fontSize: '0.6875rem', color: C.dim }}>Descricao gerada por IA</span>
              </div>
            </div>

            <div className="saiba-mais-md" style={{ fontSize: '0.875rem', color: C.text, lineHeight: 1.7 }}>
              <ReactMarkdown
                components={{
                  h2: ({ children }) => <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: C.cyan, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 20, marginBottom: 8, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.text, marginTop: 12, marginBottom: 6 }}>{children}</h3>,
                  p: ({ children }) => <p style={{ margin: '0 0 10px', color: C.muted, fontSize: '0.8125rem', lineHeight: 1.7 }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ margin: '4px 0 12px', paddingLeft: 18 }}>{children}</ul>,
                  li: ({ children }) => <li style={{ fontSize: '0.8125rem', color: C.muted, lineHeight: 1.8, marginBottom: 2 }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ color: C.text, fontWeight: 600 }}>{children}</strong>,
                  code: ({ children }) => <code style={{ background: 'rgba(0,212,255,0.08)', color: C.cyan, padding: '1px 5px', borderRadius: 4, fontSize: '0.75rem', fontFamily: C.mono }}>{children}</code>,
                }}
              >
                {saibaMais.description}
              </ReactMarkdown>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 16, fontSize: '0.625rem', color: C.dim, textAlign: 'right' }}>
              Gerado em {new Date(saibaMais.generated_at).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

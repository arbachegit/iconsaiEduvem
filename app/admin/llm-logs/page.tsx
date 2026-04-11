'use client';

/* ═══════════════════════════════════════════════════════════
   /admin/llm-logs — Tela de monitoramento de chamadas LLM
   Mostra: estado do circuit breaker, stats agregadas, ultimas
   chamadas (provider, rota, latencia, sucesso/erro).
   ═══════════════════════════════════════════════════════════ */

import { useState, useEffect, useCallback } from 'react';

const C = {
  bg: '#05070d',
  bgCard: 'rgba(15,25,42,0.6)',
  text: '#eaf0f6',
  muted: '#94a3b8',
  dim: '#64748b',
  cyan: '#00d4ff',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
  border: 'rgba(100,116,139,0.25)',
  mono: "'JetBrains Mono', monospace",
  font: "'Inter', sans-serif",
};

interface LogRow {
  id: number;
  ts: string;
  provider: 'anthropic' | 'openai';
  model_req: string;
  model_used: string | null;
  route: string | null;
  latency_ms: number | null;
  input_tok: number | null;
  output_tok: number | null;
  success: boolean;
  error_msg: string | null;
  circuit_open: boolean;
}

interface ApiResp {
  logs: LogRow[];
  circuit: { open: boolean; failuresInWindow: number; openUntil: string | null };
  stats: { total: number; success: number; failure: number; anthropic: number; openai: number; fallbacks: number };
  error?: string;
}

export default function LlmLogsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterProvider, setFilterProvider] = useState<'' | 'anthropic' | 'openai'>('');
  const [filterSuccess, setFilterSuccess] = useState<'' | 'true' | 'false'>('');
  const [sinceHours, setSinceHours] = useState(24);

  // Check auth via cookie (cookie is httpOnly=false so we check via API)
  useEffect(() => {
    // The cookie is set by the login page. We check auth by calling the API.
    setAuthenticated(true);
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ since_hours: String(sinceHours), limit: '200' });
      if (filterProvider) params.set('provider', filterProvider);
      if (filterSuccess) params.set('success', filterSuccess);
      const res = await fetch(`/api/eduven/admin/llm-logs?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (res.ok) {
        const json: ApiResp = await res.json();
        setData(json);
      } else {
        setData({
          logs: [],
          circuit: { open: false, failuresInWindow: 0, openUntil: null },
          stats: { total: 0, success: 0, failure: 0, anthropic: 0, openai: 0, fallbacks: 0 },
          error: `HTTP ${res.status}`,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sinceHours, filterProvider, filterSuccess]);

  useEffect(() => {
    if (!authenticated) return;
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [authenticated, fetchLogs]);

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: C.font, padding: '2rem' }}>
        <h1>LLM Logs</h1>
        <p style={{ color: C.muted }}>Verificando autenticacao...</p>
      </div>
    );
  }

  const stats = data?.stats;
  const circuit = data?.circuit;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: C.font, padding: '2rem' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/admin" style={{
              padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: `1px solid ${C.border}`,
              backgroundColor: 'transparent', color: C.muted, textDecoration: 'none',
              fontFamily: C.font, fontSize: '0.8125rem',
            }}>Voltar</a>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>LLM Call Logs</h1>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer',
              backgroundColor: 'transparent', border: `1px solid ${C.cyan}`, color: C.cyan,
              fontFamily: C.font, fontSize: '0.875rem',
            }}
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>

        {/* Circuit breaker state */}
        <div style={{
          backgroundColor: C.bgCard, border: `1px solid ${circuit?.open ? C.red : C.border}`,
          borderRadius: 8, padding: '1rem', marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              backgroundColor: circuit?.open ? C.red : C.green,
              boxShadow: `0 0 8px ${circuit?.open ? C.red : C.green}`,
            }} />
            <strong>Circuit Breaker:</strong>
            <span style={{ color: circuit?.open ? C.red : C.green }}>
              {circuit?.open ? 'OPEN (Anthropic skipped)' : 'CLOSED (normal)'}
            </span>
            {circuit && (
              <span style={{ color: C.muted, fontSize: '0.875rem' }}>
                · falhas na janela: {circuit.failuresInWindow}
                {circuit.openUntil && ` · reabre em ${new Date(circuit.openUntil).toLocaleTimeString()}`}
              </span>
            )}
          </div>
        </div>

        {/* Stats cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <StatCard label="Total" value={stats.total} color={C.cyan} />
            <StatCard label="Sucesso" value={stats.success} color={C.green} />
            <StatCard label="Erros" value={stats.failure} color={C.red} />
            <StatCard label="Anthropic" value={stats.anthropic} color={C.cyan} />
            <StatCard label="OpenAI" value={stats.openai} color={C.amber} />
            <StatCard label="Fallbacks ok" value={stats.fallbacks} color={C.amber} />
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
          <select value={filterProvider} onChange={e => setFilterProvider(e.target.value as '' | 'anthropic' | 'openai')}
            style={selectStyle}>
            <option value="">Todos provedores</option>
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
          </select>
          <select value={filterSuccess} onChange={e => setFilterSuccess(e.target.value as '' | 'true' | 'false')}
            style={selectStyle}>
            <option value="">Sucesso + erro</option>
            <option value="true">So sucesso</option>
            <option value="false">So erros</option>
          </select>
          <select value={sinceHours} onChange={e => setSinceHours(Number(e.target.value))} style={selectStyle}>
            <option value={1}>Ultima 1h</option>
            <option value={6}>Ultimas 6h</option>
            <option value={24}>Ultimas 24h</option>
            <option value={72}>Ultimas 72h</option>
            <option value={168}>Ultima semana</option>
          </select>
          <span style={{ color: C.muted, fontSize: '0.875rem' }}>
            Auto-refresh: 10s
          </span>
        </div>

        {/* Error banner */}
        {data?.error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.1)', border: `1px solid ${C.red}`,
            color: C.red, padding: '0.75rem', borderRadius: 6, marginBottom: '1rem',
            fontFamily: C.mono, fontSize: '0.8125rem',
          }}>
            {data.error}
          </div>
        )}

        {/* Logs table */}
        <div style={{
          backgroundColor: C.bgCard, border: `1px solid ${C.border}`,
          borderRadius: 8, overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', fontFamily: C.mono }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.3)', textAlign: 'left' }}>
                  <th style={th}>ts</th>
                  <th style={th}>provider</th>
                  <th style={th}>model</th>
                  <th style={th}>route</th>
                  <th style={th}>latency</th>
                  <th style={th}>tok in/out</th>
                  <th style={th}>status</th>
                  <th style={th}>erro</th>
                </tr>
              </thead>
              <tbody>
                {(data?.logs || []).map(row => (
                  <tr key={row.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={td}>{new Date(row.ts).toLocaleString('pt-BR')}</td>
                    <td style={{ ...td, color: row.provider === 'openai' ? C.amber : C.cyan }}>{row.provider}</td>
                    <td style={td}>{row.model_used || row.model_req}</td>
                    <td style={{ ...td, color: C.muted }}>{row.route || '\u2014'}</td>
                    <td style={td}>{row.latency_ms != null ? `${row.latency_ms}ms` : '\u2014'}</td>
                    <td style={td}>
                      {row.input_tok != null && row.output_tok != null
                        ? `${row.input_tok}/${row.output_tok}`
                        : '\u2014'}
                    </td>
                    <td style={{ ...td, color: row.success ? C.green : C.red }}>
                      {row.success ? 'OK' : 'ERR'}
                    </td>
                    <td style={{ ...td, maxWidth: 400, color: C.red, fontSize: '0.75rem', whiteSpace: 'normal' }}>
                      {row.error_msg || '\u2014'}
                    </td>
                  </tr>
                ))}
                {(!data || data.logs.length === 0) && (
                  <tr>
                    <td colSpan={8} style={{ ...td, textAlign: 'center', color: C.muted, padding: '2rem' }}>
                      Nenhuma chamada registrada na janela selecionada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: '0.625rem 0.875rem', color: C.muted, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' };
const td: React.CSSProperties = { padding: '0.5rem 0.875rem', whiteSpace: 'nowrap' };
const selectStyle: React.CSSProperties = {
  backgroundColor: C.bgCard, color: C.text, border: `1px solid ${C.border}`,
  padding: '0.5rem 0.75rem', borderRadius: 6, fontFamily: C.font, fontSize: '0.875rem',
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      backgroundColor: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '0.875rem',
    }}>
      <div style={{ color: C.muted, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ color, fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{value}</div>
    </div>
  );
}

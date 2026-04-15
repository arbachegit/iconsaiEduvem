'use client';

import { useCallback, useMemo, useState } from 'react';
import { X, Sparkles, Target, BookOpen, Loader2, ArrowRight, Play } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   StorytellingModal — 3 colunas (driver → suporte → plano narrativo)
   Layout canonico importado do iconsaiStats (30/35/35).
   Pipeline progressivo via /api/eduven/storytelling stages.
   ═══════════════════════════════════════════════════════════════ */

interface NRItem {
  id: number;
  code: string;
  title: string;
  group?: string;
  relevance: number;
}

interface NRForLLM {
  id: number;
  code: string;
  title: string;
  group: string;
  relevance: number;
}

interface PrimaryData {
  primary: { code: string; reason: string; impact: string };
}

interface SupportingItem {
  code: string;
  role: string;
  reason: string;
  effect: string;
}
interface SupportingData {
  supporting: SupportingItem[];
  summary: string;
}

interface Phase { title: string; duration: string; actions: string[] }
interface CostItem { item: string; range: string; note: string }
interface RiskItem { risk: string; mitigation: string }
interface PlanData {
  narrative: string;
  phases: Phase[];
  costs: CostItem[];
  risks: RiskItem[];
  disclaimer: string;
}

interface StorytellingModalProps {
  nrs: NRItem[];
  sectorSlug: string;
  sectorName: string;
  onClose: () => void;
}

const C = {
  bg: '#050d1a',
  bg2: '#0f172a',
  bgCard: 'rgba(15,25,42,0.8)',
  text: '#e2e8f0',
  muted: '#94a3b8',
  dim: '#64748b',
  border: 'rgba(100,116,139,0.3)',
  borderStrong: 'rgba(100,116,139,0.5)',
  cyan: '#00d4ff',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  red: '#ef4444',
  pink: '#ec4899',
};

// Mapeamento hardcoded por NR-id → grupo (duplica o do NRCorrelationGraph
// pra nao acoplar os dois componentes; se mudar, mudar nos dois).
const NR_GROUPS: Record<string, number[]> = {
  gestao:   [1, 3, 4, 5, 28],
  saude:    [7, 9, 15, 17, 24, 32],
  protecao: [6, 8, 10, 16, 23, 26],
  setorial: [11, 12, 13, 14, 18, 19, 20, 21, 22, 25, 29, 30, 31, 33, 34, 35, 36, 37, 38],
};
function groupOf(id: number): string {
  for (const [g, ids] of Object.entries(NR_GROUPS)) if (ids.includes(id)) return g;
  return 'setorial';
}

const GOAL_CHIPS = [
  'Reduzir custos com acidentes e afastamentos',
  'Aumentar produtividade sem sacrificar segurança',
  'Evitar multas e fiscalização desfavorável',
  'Reduzir LER/DORT e doenças ocupacionais',
  'Preparar a obra para auditoria de compliance',
];

export default function StorytellingModal({ nrs, sectorSlug, sectorName, onClose }: StorytellingModalProps) {
  const [goal, setGoal] = useState('');
  const [loadingStage, setLoadingStage] = useState<null | 'step1' | 'step2' | 'step3'>(null);
  const [err, setErr] = useState<string | null>(null);
  const [step1, setStep1] = useState<PrimaryData | null>(null);
  const [step2, setStep2] = useState<SupportingData | null>(null);
  const [step3, setStep3] = useState<PlanData | null>(null);

  const nrByCode = useMemo(() => {
    const m = new Map<string, NRItem>();
    nrs.forEach(n => m.set(n.code, n));
    return m;
  }, [nrs]);

  const nrsForLLM: NRForLLM[] = useMemo(
    () => nrs.map(n => ({
      id: n.id, code: n.code, title: n.title,
      group: n.group ?? groupOf(n.id),
      relevance: n.relevance,
    })),
    [nrs],
  );

  const reset = () => { setStep1(null); setStep2(null); setStep3(null); setErr(null); };

  const runPipeline = useCallback(async (submittedGoal: string) => {
    if (!submittedGoal.trim()) return;
    reset();
    try {
      setLoadingStage('step1');
      const r1 = await fetch('/api/eduven/storytelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'step1', goal: submittedGoal, sectorSlug, sectorName, nrs: nrsForLLM,
        }),
      }).then(r => r.ok ? r.json() : Promise.reject(new Error(`step1 ${r.status}`)));
      setStep1(r1 as PrimaryData);

      const primaryNR = nrByCode.get(r1.primary.code);
      const primaryForLLM: NRForLLM | null = primaryNR
        ? { id: primaryNR.id, code: primaryNR.code, title: primaryNR.title, group: primaryNR.group ?? groupOf(primaryNR.id), relevance: primaryNR.relevance }
        : null;
      if (!primaryForLLM) throw new Error(`Driver "${r1.primary.code}" não está no setor`);

      setLoadingStage('step2');
      const r2 = await fetch('/api/eduven/storytelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'step2', goal: submittedGoal, sectorSlug, sectorName, nrs: nrsForLLM, primary: primaryForLLM,
        }),
      }).then(r => r.ok ? r.json() : Promise.reject(new Error(`step2 ${r.status}`)));
      setStep2(r2 as SupportingData);

      const supportingForLLM = (r2.supporting || [])
        .map((s: SupportingItem) => {
          const n = nrByCode.get(s.code);
          if (!n) return null;
          return {
            id: n.id, code: n.code, title: n.title,
            group: n.group ?? groupOf(n.id),
            relevance: n.relevance,
            role: s.role, reason: s.reason, effect: s.effect,
          };
        })
        .filter(Boolean);

      setLoadingStage('step3');
      const r3 = await fetch('/api/eduven/storytelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'step3', goal: submittedGoal, sectorSlug, sectorName,
          nrs: nrsForLLM, primary: primaryForLLM, supporting: supportingForLLM,
        }),
      }).then(r => r.ok ? r.json() : Promise.reject(new Error(`step3 ${r.status}`)));
      setStep3(r3 as PlanData);
      setLoadingStage(null);
    } catch (e) {
      setErr((e as Error).message);
      setLoadingStage(null);
    }
  }, [nrsForLLM, nrByCode, sectorSlug, sectorName]);

  const handleSubmit = () => runPipeline(goal);
  const handleChip = (chip: string) => { setGoal(chip); runPipeline(chip); };

  const primaryNR = step1 ? nrByCode.get(step1.primary.code) : null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2100,
        background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3vh 3vw',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{
        width: '94vw', height: '94vh',
        background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* HEADER */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: C.bg2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={18} style={{ color: C.purple }} />
            <div>
              <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>
                Storytelling — Plano de Ação com IA
              </div>
              <div style={{ color: C.dim, fontSize: 11 }}>{sectorName}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            style={{
              background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8,
              color: C.muted, cursor: 'pointer', padding: 6, display: 'flex',
            }}>
            <X size={18} />
          </button>
        </div>

        {/* INPUT BAR */}
        <div style={{
          padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: C.bg2,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder={'Ex.: "Quero reduzir custos com afastamentos por LER/DORT no canteiro, sem brecar a produção"'}
              style={{
                flex: 1, padding: '10px 14px', fontSize: 13,
                background: 'rgba(15,23,42,0.6)', color: C.text,
                border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none',
                fontFamily: 'inherit',
              }}
              className="fg-story-input"
            />
            <button
              onClick={handleSubmit}
              disabled={!goal.trim() || loadingStage !== null}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0 18px', fontSize: 13, fontWeight: 700,
                background: goal.trim() && !loadingStage ? `linear-gradient(135deg, ${C.purple}, ${C.pink})` : 'rgba(100,116,139,0.2)',
                color: goal.trim() && !loadingStage ? '#ffffff' : C.muted,
                border: 'none', borderRadius: 8, cursor: loadingStage ? 'wait' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {loadingStage
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Gerando…</>
                : <><Sparkles size={14} /> Gerar plano</>}
            </button>
          </div>
          {/* Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {GOAL_CHIPS.map(c => (
              <button
                key={c}
                onClick={() => handleChip(c)}
                disabled={loadingStage !== null}
                style={{
                  padding: '5px 10px', fontSize: 11,
                  background: 'rgba(168,85,247,0.08)', color: C.purple,
                  border: `1px solid rgba(168,85,247,0.3)`, borderRadius: 9999,
                  cursor: loadingStage ? 'wait' : 'pointer', fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                {c}
              </button>
            ))}
          </div>
          {err && <div style={{ color: C.red, fontSize: 12 }}>Erro: {err}</div>}
        </div>

        {/* 3 COLUMNS BODY */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          {/* COL 1 — Driver principal (30%) */}
          <Column
            width="30%" minWidth={280}
            icon={<Target size={18} style={{ color: C.cyan }} />}
            title="Driver principal"
            subtitle="NR de maior impacto"
            accent={C.cyan}
            bordered
          >
            {!step1 && loadingStage === 'step1' && <LoadingCard label="Analisando seu objetivo…" color={C.cyan} />}
            {!step1 && !loadingStage && <EmptyState text="Descreva seu objetivo acima e clique em Gerar" />}
            {step1 && primaryNR && (
              <Card accent={C.cyan}>
                <Badge color={C.cyan}>{primaryNR.code}</Badge>
                <h3 style={{ margin: '6px 0 4px', fontSize: 14, fontWeight: 700, color: C.text }}>
                  {primaryNR.title}
                </h3>
                <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  grupo: {primaryNR.group ?? groupOf(primaryNR.id)}
                </div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.55 }}>
                  {step1.primary.reason}
                </div>
                {step1.primary.impact && (
                  <div style={{
                    marginTop: 10, padding: '8px 10px',
                    background: 'rgba(0,212,255,0.08)', border: `1px solid rgba(0,212,255,0.3)`,
                    borderRadius: 6, fontSize: 11, color: C.cyan, lineHeight: 1.5,
                  }}>
                    <strong style={{ color: '#7dd3fc' }}>Impacto: </strong>{step1.primary.impact}
                  </div>
                )}
              </Card>
            )}
          </Column>

          {/* COL 2 — NRs de suporte (35%) */}
          <Column
            width="35%" minWidth={300}
            icon={<ArrowRight size={18} style={{ color: C.green }} />}
            title="NRs de suporte"
            subtitle="Amplificam o driver"
            accent={C.green}
            bordered
          >
            {loadingStage === 'step2' && <LoadingCard label="Buscando NRs de suporte…" color={C.green} />}
            {!step2 && loadingStage !== 'step2' && <EmptyState text="Aguardando driver…" />}
            {step2 && (
              <>
                {step2.summary && (
                  <div style={{
                    padding: '10px 12px', marginBottom: 10,
                    background: 'rgba(34,197,94,0.06)', border: `1px solid rgba(34,197,94,0.25)`,
                    borderRadius: 6, fontSize: 12, color: '#86efac', lineHeight: 1.55,
                  }}>
                    {step2.summary}
                  </div>
                )}
                {step2.supporting.map(s => {
                  const nr = nrByCode.get(s.code);
                  return (
                    <Card key={s.code} accent={C.green}>
                      <Badge color={C.green}>{s.code}</Badge>
                      <h4 style={{ margin: '6px 0 4px', fontSize: 13, fontWeight: 700, color: C.text }}>
                        {nr?.title ?? s.code}
                      </h4>
                      {s.role && (
                        <div style={{
                          display: 'inline-block', padding: '2px 8px', marginBottom: 6,
                          background: 'rgba(34,197,94,0.12)', color: C.green,
                          border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 9999,
                          fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
                        }}>
                          {s.role}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5, marginBottom: 6 }}>
                        {s.reason}
                      </div>
                      {s.effect && (
                        <div style={{ fontSize: 11, color: C.muted, fontStyle: 'italic' }}>
                          Efeito: {s.effect}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </>
            )}
          </Column>

          {/* COL 3 — Plano narrativo (35%) */}
          <Column
            width="35%" minWidth={320}
            icon={<Play size={16} style={{ color: C.yellow }} />}
            title="Plano de implementação"
            subtitle="Narrativa, custos, riscos"
            accent={C.yellow}
          >
            {loadingStage === 'step3' && <LoadingCard label="Redigindo a história do plano…" color={C.yellow} />}
            {!step3 && loadingStage !== 'step3' && <EmptyState text="Aguardando NRs de suporte…" />}
            {step3 && (
              <>
                {/* Narrativa */}
                <Card accent={C.yellow}>
                  <div style={{ fontSize: 10, color: C.yellow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    História do plano
                  </div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {step3.narrative}
                  </div>
                </Card>

                {/* Fases */}
                <Section title="Fases">
                  {step3.phases.map((p, i) => (
                    <div key={i} style={{
                      padding: '10px 12px', marginBottom: 6,
                      background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 6,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ fontSize: 12, color: C.text }}>{p.title}</strong>
                        <span style={{ fontSize: 10, color: C.muted }}>{p.duration}</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                        {p.actions.map((a, j) => <li key={j}>{a}</li>)}
                      </ul>
                    </div>
                  ))}
                </Section>

                {/* Custos */}
                <Section title="Custos aproximados">
                  {step3.costs.map((c, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', marginBottom: 4,
                      background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 6,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{c.item}</div>
                        {c.note && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{c.note}</div>}
                      </div>
                      <div style={{
                        fontSize: 11, color: C.yellow, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                        whiteSpace: 'nowrap',
                      }}>
                        {c.range}
                      </div>
                    </div>
                  ))}
                </Section>

                {/* Riscos */}
                <Section title="Riscos e mitigação">
                  {step3.risks.map((r, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', marginBottom: 4,
                      background: 'rgba(239,68,68,0.04)', border: `1px solid rgba(239,68,68,0.25)`, borderRadius: 6,
                    }}>
                      <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600, marginBottom: 2 }}>
                        ⚠ {r.risk}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                        <strong style={{ color: C.green }}>Mitigação:</strong> {r.mitigation}
                      </div>
                    </div>
                  ))}
                </Section>

                {/* Disclaimer */}
                {step3.disclaimer && (
                  <div style={{
                    padding: '8px 12px', marginTop: 10,
                    background: 'rgba(251,191,36,0.05)', border: `1px dashed rgba(251,191,36,0.35)`, borderRadius: 6,
                    fontSize: 10, color: '#fbbf24', fontStyle: 'italic', lineHeight: 1.5,
                  }}>
                    ⚠ {step3.disclaimer}
                  </div>
                )}
              </>
            )}
          </Column>
        </div>
      </div>

      <style>{`
        .fg-story-input::placeholder {
          color: rgba(226,232,240,0.40);
          font-style: italic;
          font-weight: 400;
        }
        .fg-story-input::-webkit-input-placeholder { color: rgba(226,232,240,0.40); font-style: italic; }
      `}</style>
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────────── */

function Column({
  width, minWidth, icon, title, subtitle, accent, bordered = false, children,
}: {
  width: string; minWidth: number;
  icon: React.ReactNode; title: string; subtitle?: string; accent: string;
  bordered?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{
      width, minWidth, display: 'flex', flexDirection: 'column',
      borderRight: bordered ? `1px solid ${C.border}` : undefined,
      minHeight: 0,
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
        background: C.bg2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <div style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{title}</div>
        </div>
        {subtitle && (
          <div style={{ color: C.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
            {subtitle}
          </div>
        )}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}, transparent)`, marginTop: 8, borderRadius: 1 }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}

function Card({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: 12, marginBottom: 10, borderRadius: 8,
      background: C.bgCard, borderLeft: `3px solid ${accent}`, border: `1px solid ${C.border}`,
    }}>
      {children}
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      background: `${color}18`, color, border: `1px solid ${color}55`,
      fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
    }}>
      {children}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      textAlign: 'center', color: C.dim, fontSize: 12, fontStyle: 'italic',
      padding: '32px 12px',
    }}>
      {text}
    </div>
  );
}

function LoadingCard({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      padding: 16, borderRadius: 8, border: `1px dashed ${color}55`,
      background: `${color}08`, display: 'flex', alignItems: 'center', gap: 10,
      color, fontSize: 12,
    }}>
      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
      {label}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{
        fontSize: 10, color: C.dim, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

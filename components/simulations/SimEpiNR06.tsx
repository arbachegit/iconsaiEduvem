'use client'

import { useState } from 'react'
import { Bot, AlertTriangle, ShieldCheck } from 'lucide-react'
import PlayButton from '../education/PlayButton'

/* ═══════════════════════════════════════════════════════════
   SimEpiNR06 — Primeira simulacao interativa do eduven.
   NR-6 EPI: o aluno arrasta um slider (0..3) e ve o trabalhador
   ganhando EPIs, os riscos caindo, a multa estimada zerando e
   o ai.tutor reagindo em 1a pessoa brasileira.
   ═══════════════════════════════════════════════════════════ */

type EpiLevel = 0 | 1 | 2 | 3

interface LevelData {
  label: string
  riskFatal: number           // 0-100
  compliance: number          // 0-100
  fineEstimate: number        // R$
  tutor: {
    headline: string
    detail: string
    warning?: string
    suggestion?: string
  }
}

const LEVELS: Record<EpiLevel, LevelData> = {
  0: {
    label: 'Nenhum EPI',
    riskFatal: 87,
    compliance: 0,
    fineEstimate: 4025,
    tutor: {
      headline: 'Assim o acidente é questão de tempo.',
      detail: 'Trabalhador exposto a queda, impacto na cabeça, corte nas mãos. Em construção civil, 38% dos acidentes fatais envolvem queda de altura sem proteção [NR-6, item 6.3.1].',
      warning: 'Multa média por trabalhador sem EPI: R$ 4.025 (FAP NR-28). Por trabalhador. Se tiver 20 na obra, faça a conta.',
      suggestion: 'Arrasta o slider pra nível 1 e veja o que muda só colocando o capacete.',
    },
  },
  1: {
    label: 'Capacete',
    riskFatal: 52,
    compliance: 25,
    fineEstimate: 2800,
    tutor: {
      headline: 'Cabeça protegida, mas as mãos continuam expostas.',
      detail: 'Capacete corta ~40% do risco de lesão fatal em queda de pequena altura. Mas em construção civil, 38% dos acidentes envolvem as mãos — cortes, queimaduras, esmagamento [NR-6, item 6.3].',
      suggestion: 'Coloca a luva também. A luva é barata e evita metade dos acidentes do setor.',
    },
  },
  2: {
    label: 'Capacete + luvas',
    riskFatal: 28,
    compliance: 55,
    fineEstimate: 1200,
    tutor: {
      headline: 'Tá melhorando. Falta a parte crítica.',
      detail: 'Capacete + luva cobrem impactos comuns, mas não resolvem trabalho em altura. Se esse trabalhador subir num andaime ou telhado, sem cinto de segurança é queda livre. [NR-6] trabalha junto com [NR-35, item 35.5].',
      warning: 'Construção civil tem 52% dos acidentes fatais em trabalho em altura. Cinto não é opcional em obra.',
      suggestion: 'Puxa pra nível 3 e vê o cinto paraquedista entrar.',
    },
  },
  3: {
    label: 'EPI completo',
    riskFatal: 6,
    compliance: 100,
    fineEstimate: 0,
    tutor: {
      headline: 'Agora sim. É isso que o auditor quer ver.',
      detail: 'Trabalhador autorizado, documentado, com capacete + luvas + cinturão paraquedista + trava-quedas. Conformidade total com [NR-6, item 6.3.1] e [NR-35, item 35.4.1.1].',
      suggestion: 'Nota: mesmo com EPI completo, a empresa ainda precisa de Análise de Risco e Permissão de Trabalho pra altura. EPI é a última linha de defesa, não a primeira.',
    },
  },
}

const ACCENT = '#22d3ee'

export default function SimEpiNR06() {
  const [level, setLevel] = useState<EpiLevel>(0)
  const data = LEVELS[level]

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    const v = parseInt((e.target as HTMLInputElement).value, 10)
    if (v >= 0 && v <= 3) setLevel(v as EpiLevel)
  }
  const riskColor = data.riskFatal >= 60 ? '#ef4444' : data.riskFatal >= 30 ? '#f97316' : '#4ade80'
  const complianceColor = data.compliance >= 80 ? '#4ade80' : data.compliance >= 40 ? '#fbbf24' : '#ef4444'

  // Texto completo para o PlayButton TTS
  const tutorFullText = [
    data.tutor.headline,
    data.tutor.detail,
    data.tutor.warning,
    data.tutor.suggestion,
  ].filter(Boolean).join(' ')

  return (
    <div>
      {/* ═══ Grid: SVG + Sliders ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
        gap: 20,
        marginBottom: 20,
      }}>
        {/* SVG do trabalhador */}
        <div style={{
          background: '#080c14',
          border: '1px solid #1e293b',
          borderRadius: 10,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 360,
        }}>
          <WorkerSVG level={level} />
        </div>

        {/* Sliders + stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            background: '#080c14', border: '1px solid #1e293b', borderRadius: 10,
            padding: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Nível de EPI
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT, marginBottom: 10 }}>
              {data.label}
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={level}
              onChange={handleSliderChange}
              onInput={handleSliderChange}
              style={{ width: '100%' }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 10, color: '#64748b', marginTop: 4,
            }}>
              <span>0 — Nenhum</span>
              <span>1 — Capacete</span>
              <span>2 — + Luvas</span>
              <span>3 — Completo</span>
            </div>
          </div>

          <StatCard
            label="Risco de acidente fatal"
            value={`${data.riskFatal}%`}
            color={riskColor}
            icon={AlertTriangle}
          />
          <StatCard
            label="Conformidade NR-6"
            value={`${data.compliance}%`}
            color={complianceColor}
            icon={ShieldCheck}
          />
          <StatCard
            label="Multa estimada (por trabalhador)"
            value={data.fineEstimate === 0 ? 'R$ 0' : `R$ ${data.fineEstimate.toLocaleString('pt-BR')}`}
            color={data.fineEstimate === 0 ? '#4ade80' : '#ef4444'}
          />
        </div>
      </div>

      {/* ═══ ai.tutor (full width abaixo) ═══ */}
      <div style={{
        background: '#080c14',
        border: `1px solid ${ACCENT}55`,
        borderRadius: 12,
        padding: '18px 22px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -12, left: 18, padding: '3px 12px',
          background: '#0c1320', borderRadius: 9999, border: `1px solid ${ACCENT}55`,
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Bot size={11} color={ACCENT} />
          <span style={{
            background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899, #22d3ee)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 3s linear infinite',
          }}>
            ai.tutor
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <div style={{
            flexShrink: 0,
            width: 42, height: 42, borderRadius: '50%',
            background: `${ACCENT}22`,
            border: `1.5px solid ${ACCENT}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 14px ${ACCENT}55`,
          }}>
            <Bot size={22} color={ACCENT} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              key={level}
              className="fadeIn"
              style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3, marginBottom: 6 }}
            >
              {data.tutor.headline}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.65, color: '#cbd5e1' }}>
              {data.tutor.detail}
            </div>
            {data.tutor.warning && (
              <div style={{
                marginTop: 10,
                padding: '8px 12px',
                background: 'rgba(249,115,22,0.10)',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 8,
                fontSize: 13, color: '#fbbf24', lineHeight: 1.5,
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>Cuidado:</strong> {data.tutor.warning}</span>
              </div>
            )}
            {data.tutor.suggestion && (
              <div style={{
                marginTop: 10,
                fontSize: 13, color: '#94a3b8', lineHeight: 1.5,
                fontStyle: 'italic',
              }}>
                <strong style={{ color: ACCENT, fontStyle: 'normal' }}>Tenta isso:</strong> {data.tutor.suggestion}
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            <PlayButton text={tutorFullText} size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────────────────── */
/*   Stat card                                */
/* ───────────────────────────────────────── */
function StatCard({ label, value, color, icon: Icon }: {
  label: string
  value: string
  color: string
  icon?: React.ComponentType<{ size?: number; color?: string }>
}) {
  return (
    <div style={{
      background: '#080c14',
      border: `1px solid ${color}33`,
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {Icon && (
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: `${color}1A`,
          border: `1px solid ${color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} color={color} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {label}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
          {value}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────────────────── */
/*   SVG do trabalhador                       */
/* ───────────────────────────────────────── */
function WorkerSVG({ level }: { level: EpiLevel }) {
  const hasHelmet = level >= 1
  const hasGloves = level >= 2
  const hasHarness = level >= 3

  return (
    <svg viewBox="0 0 300 360" width="100%" height="100%" style={{ maxHeight: 340 }}>
      <defs>
        <linearGradient id="danger-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Ground line */}
      <line x1="20" y1="340" x2="280" y2="340" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4"/>

      {/* Scaffolding (background) */}
      <g opacity="0.25" stroke="#475569" strokeWidth="2" fill="none">
        <line x1="40" y1="340" x2="40" y2="60"/>
        <line x1="260" y1="340" x2="260" y2="60"/>
        <line x1="40" y1="140" x2="260" y2="140"/>
        <line x1="40" y1="60" x2="260" y2="60"/>
      </g>

      {/* Warning glow quando sem EPI (pulse) */}
      {level === 0 && (
        <>
          <circle cx="150" cy="70" r="40" fill="url(#danger-glow)">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.2s" repeatCount="indefinite"/>
          </circle>
        </>
      )}

      {/* Body — stick figure com mais volume */}
      <g stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" fill="none">
        {/* Torso */}
        <line x1="150" y1="110" x2="150" y2="230"/>
        {/* Arms */}
        <line x1="150" y1="140" x2="115" y2="195"/>
        <line x1="150" y1="140" x2="185" y2="195"/>
        {/* Legs */}
        <line x1="150" y1="230" x2="125" y2="310"/>
        <line x1="150" y1="230" x2="175" y2="310"/>
        {/* Feet */}
        <line x1="115" y1="310" x2="130" y2="310" strokeWidth="4"/>
        <line x1="165" y1="310" x2="180" y2="310" strokeWidth="4"/>
      </g>

      {/* Head */}
      <circle cx="150" cy="85" r="22" fill="#fce7f3" stroke="#e2e8f0" strokeWidth="2.5"/>
      {/* Face details */}
      <circle cx="144" cy="82" r="1.5" fill="#1e293b"/>
      <circle cx="156" cy="82" r="1.5" fill="#1e293b"/>
      <path d="M 144 93 Q 150 96 156 93" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* CAPACETE (level >= 1) */}
      {hasHelmet && (
        <g>
          {/* Cupula */}
          <path d="M 128 78 Q 128 56 150 56 Q 172 56 172 78 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round"/>
          {/* Aba */}
          <ellipse cx="150" cy="78" rx="26" ry="3" fill="#f59e0b"/>
          {/* Listra refletiva */}
          <line x1="132" y1="68" x2="168" y2="68" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.7"/>
        </g>
      )}

      {/* LUVAS (level >= 2) */}
      {hasGloves && (
        <g>
          <rect x="108" y="188" width="14" height="18" rx="3" fill="#3b82f6" stroke="#1e40af" strokeWidth="1.5"/>
          <rect x="178" y="188" width="14" height="18" rx="3" fill="#3b82f6" stroke="#1e40af" strokeWidth="1.5"/>
        </g>
      )}

      {/* CINTURAO PARAQUEDISTA (level >= 3) */}
      {hasHarness && (
        <g stroke="#22d3ee" strokeWidth="2.5" fill="none">
          {/* Cinta horizontal no peito */}
          <line x1="135" y1="155" x2="165" y2="155"/>
          {/* Alcas verticais (2) */}
          <line x1="142" y1="120" x2="142" y2="185"/>
          <line x1="158" y1="120" x2="158" y2="185"/>
          {/* Cinto horizontal na cintura */}
          <line x1="133" y1="185" x2="167" y2="185"/>
          {/* Argola dorsal */}
          <circle cx="150" cy="145" r="4" fill="#22d3ee"/>
          {/* Talabarte subindo pra ancoragem */}
          <path d="M 150 145 Q 190 60 250 45" strokeDasharray="2 2" opacity="0.8"/>
          {/* Trava-queda (ancoragem) */}
          <rect x="242" y="38" width="14" height="14" fill="#22d3ee" opacity="0.9"/>
        </g>
      )}

      {/* ⚡ Raios de impacto na cabeca (level < 1) */}
      {!hasHelmet && (
        <g stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 108 35 L 118 50 L 112 55 L 125 70">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite"/>
          </path>
          <path d="M 192 35 L 182 50 L 188 55 L 175 70">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>
          </path>
        </g>
      )}

      {/* ❌ Cortes nas maos (level < 2) */}
      {!hasGloves && (
        <g stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
          <line x1="110" y1="198" x2="120" y2="208"/>
          <line x1="120" y1="198" x2="110" y2="208"/>
          <line x1="180" y1="198" x2="190" y2="208"/>
          <line x1="190" y1="198" x2="180" y2="208"/>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.4s" repeatCount="indefinite"/>
        </g>
      )}

      {/* ↓ Indicador de queda (level < 3) */}
      {!hasHarness && (
        <g>
          <path d="M 220 150 L 220 200 L 215 195 M 220 200 L 225 195" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.1s" repeatCount="indefinite"/>
          </path>
          <text x="222" y="140" fontSize="10" fill="#f97316" fontFamily="monospace" fontWeight="700">queda</text>
        </g>
      )}

      {/* Indicador de seguranca (level 3) */}
      {hasHarness && (
        <g>
          <circle cx="250" cy="170" r="14" fill="#4ade8022" stroke="#4ade80" strokeWidth="2">
            <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
          </circle>
          <path d="M 243 170 l 5 5 l 10 -10" stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      )}
    </svg>
  )
}

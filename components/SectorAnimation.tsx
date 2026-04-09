'use client'

/**
 * SectorAnimation — animacoes SVG em looping para os 4 setores POC.
 *
 * Cada setor tem uma animacao geometrica/iconografica simples,
 * leve (sem GIF, sem video), que sugere a identidade do setor.
 *
 * Tudo via CSS @keyframes inline no <style> do componente.
 */

interface SectorAnimationProps {
  slug: string
  size?: number
  color: string
}

export default function SectorAnimation({ slug, size = 64, color }: SectorAnimationProps) {
  switch (slug) {
    case 'construcao_civil':       return <ConstructionAnim size={size} color={color} />
    case 'engenharia_civil':       return <EngineeringAnim size={size} color={color} />
    case 'industria_calcados':     return <FactoryAnim size={size} color={color} />
    case 'escritorio_contabilidade': return <AccountingAnim size={size} color={color} />
    default: return <DefaultAnim size={size} color={color} />
  }
}

/* ─── CONSTRUCAO CIVIL ───────────────────────────────────────
   Capacete oscilando + martelo batendo + faisca de impacto
   ────────────────────────────────────────────────────────── */
function ConstructionAnim({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <style>{`
        @keyframes hammer-${color.replace('#','')} {
          0%, 100% { transform: rotate(-30deg); transform-origin: 18px 38px; }
          40%      { transform: rotate(20deg);  transform-origin: 18px 38px; }
          50%      { transform: rotate(20deg);  transform-origin: 18px 38px; }
          60%      { transform: rotate(-30deg); transform-origin: 18px 38px; }
        }
        @keyframes spark-${color.replace('#','')} {
          0%, 39%   { opacity: 0; transform: scale(0); }
          40%       { opacity: 1; transform: scale(1); }
          70%, 100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes helmet-bob-${color.replace('#','')} {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-1.5px); }
        }
        .ca-helmet  { animation: helmet-bob-${color.replace('#','')} 2s ease-in-out infinite; transform-origin: center; }
        .ca-hammer  { animation: hammer-${color.replace('#','')} 2s ease-in-out infinite; }
        .ca-spark   { animation: spark-${color.replace('#','')} 2s ease-in-out infinite; transform-origin: 30px 36px; }
      `}</style>

      {/* Capacete (helmet) */}
      <g className="ca-helmet">
        <path d="M 14 26 Q 14 14 32 14 Q 50 14 50 26 L 50 32 L 14 32 Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M 14 32 L 50 32 L 50 36 L 14 36 Z" fill={color} fillOpacity="0.30" stroke={color} strokeWidth="2"/>
        <line x1="32" y1="14" x2="32" y2="32" stroke={color} strokeWidth="1.5" strokeOpacity="0.6"/>
      </g>

      {/* Martelo */}
      <g className="ca-hammer">
        {/* Cabo */}
        <rect x="16.5" y="38" width="3" height="14" rx="1" fill={color} fillOpacity="0.7"/>
        {/* Cabeca */}
        <rect x="11" y="35" width="14" height="6" rx="1.5" fill={color}/>
      </g>

      {/* Faisca de impacto */}
      <g className="ca-spark">
        <circle cx="30" cy="36" r="1.5" fill={color}/>
        <line x1="30" y1="32" x2="30" y2="29" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="33" y1="36" x2="36" y2="36" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="30" y1="40" x2="30" y2="43" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="32.5" y1="33.5" x2="34.5" y2="31.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="32.5" y1="38.5" x2="34.5" y2="40.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

/* ─── ENGENHARIA CIVIL ──────────────────────────────────────
   Esquadro + linha sendo desenhada num grid (stroke-dashoffset)
   ────────────────────────────────────────────────────────── */
function EngineeringAnim({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <style>{`
        @keyframes draw-line-${color.replace('#','')} {
          0%        { stroke-dashoffset: 60; }
          50%, 60%  { stroke-dashoffset: 0; }
          100%      { stroke-dashoffset: -60; }
        }
        @keyframes pulse-grid-${color.replace('#','')} {
          0%, 100% { opacity: 0.15; }
          50%      { opacity: 0.30; }
        }
        .ec-line  { stroke-dasharray: 60; animation: draw-line-${color.replace('#','')} 3s ease-in-out infinite; }
        .ec-grid  { animation: pulse-grid-${color.replace('#','')} 3s ease-in-out infinite; }
      `}</style>

      {/* Grid de fundo */}
      <g className="ec-grid" stroke={color} strokeWidth="0.5">
        <line x1="14" y1="14" x2="50" y2="14"/>
        <line x1="14" y1="22" x2="50" y2="22"/>
        <line x1="14" y1="30" x2="50" y2="30"/>
        <line x1="14" y1="38" x2="50" y2="38"/>
        <line x1="14" y1="46" x2="50" y2="46"/>
        <line x1="14" y1="14" x2="14" y2="46"/>
        <line x1="22" y1="14" x2="22" y2="46"/>
        <line x1="30" y1="14" x2="30" y2="46"/>
        <line x1="38" y1="14" x2="38" y2="46"/>
        <line x1="46" y1="14" x2="46" y2="46"/>
      </g>

      {/* Esquadro (triangulo) */}
      <path d="M 14 50 L 14 14 L 50 50 Z" fill={color} fillOpacity="0.10" stroke={color} strokeWidth="2" strokeLinejoin="round"/>

      {/* Linha sendo desenhada (hipotenusa do esquadro projetada) */}
      <line x1="18" y1="50" x2="50" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" className="ec-line"/>

      {/* Ponto de medida */}
      <circle cx="32" cy="32" r="2.5" fill={color}/>
    </svg>
  )
}

/* ─── INDUSTRIA DE CALCADOS ─────────────────────────────────
   Maquina de costura: agulha vertical batendo + linha pontilhada
   ────────────────────────────────────────────────────────── */
function FactoryAnim({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <style>{`
        @keyframes needle-${color.replace('#','')} {
          0%, 100% { transform: translateY(0); }
          25%      { transform: translateY(8px); }
          50%      { transform: translateY(0); }
          75%      { transform: translateY(8px); }
        }
        @keyframes stitch-${color.replace('#','')} {
          0%   { stroke-dashoffset: 32; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes fabric-shift-${color.replace('#','')} {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(2px); }
        }
        .fa-needle { animation: needle-${color.replace('#','')} 1s ease-in-out infinite; }
        .fa-stitch { stroke-dasharray: 4 2; animation: stitch-${color.replace('#','')} 2s linear infinite; }
        .fa-fabric { animation: fabric-shift-${color.replace('#','')} 1s ease-in-out infinite; }
      `}</style>

      {/* Estrutura da maquina (cabecote) */}
      <rect x="22" y="10" width="20" height="14" rx="2" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2"/>

      {/* Eixo vertical da agulha */}
      <line x1="32" y1="24" x2="32" y2="34" stroke={color} strokeWidth="1.5" strokeOpacity="0.5"/>

      {/* Agulha (animada) */}
      <g className="fa-needle">
        <line x1="32" y1="32" x2="32" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="32" cy="33" r="1.5" fill={color}/>
      </g>

      {/* Tecido (placa horizontal animada com linha pontilhada) */}
      <g className="fa-fabric">
        <rect x="10" y="42" width="44" height="10" rx="1.5" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.5"/>
        {/* Linha de costura */}
        <line x1="14" y1="47" x2="46" y2="47" stroke={color} strokeWidth="1.5" strokeLinecap="round" className="fa-stitch"/>
      </g>
    </svg>
  )
}

/* ─── ESCRITORIO DE CONTABILIDADE ───────────────────────────
   Calculadora com numeros aparecendo + folha sendo preenchida
   ────────────────────────────────────────────────────────── */
function AccountingAnim({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <style>{`
        @keyframes type-line-1-${color.replace('#','')} {
          0%, 19%   { width: 0; }
          20%, 100% { width: 18px; }
        }
        @keyframes type-line-2-${color.replace('#','')} {
          0%, 39%   { width: 0; }
          40%, 100% { width: 22px; }
        }
        @keyframes type-line-3-${color.replace('#','')} {
          0%, 59%   { width: 0; }
          60%, 100% { width: 14px; }
        }
        @keyframes display-flicker-${color.replace('#','')} {
          0%, 30%, 60%, 100% { opacity: 1; }
          15%, 45%, 75%      { opacity: 0.4; }
        }
        @keyframes loop-reset-${color.replace('#','')} {
          0%, 95%  { opacity: 1; }
          100%     { opacity: 0; }
        }
        .ac-line   { fill: ${color}; height: 2px; transform-origin: left; }
        .ac-line1  { animation: type-line-1-${color.replace('#','')} 4s steps(1) infinite, loop-reset-${color.replace('#','')} 4s linear infinite; }
        .ac-line2  { animation: type-line-2-${color.replace('#','')} 4s steps(1) infinite, loop-reset-${color.replace('#','')} 4s linear infinite; }
        .ac-line3  { animation: type-line-3-${color.replace('#','')} 4s steps(1) infinite, loop-reset-${color.replace('#','')} 4s linear infinite; }
        .ac-display-text { animation: display-flicker-${color.replace('#','')} 4s ease-in-out infinite; }
      `}</style>

      {/* Folha de papel */}
      <rect x="32" y="14" width="22" height="34" rx="2" fill={color} fillOpacity="0.10" stroke={color} strokeWidth="1.8"/>
      {/* "Cabecalho" da folha */}
      <line x1="36" y1="20" x2="50" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
      {/* Linhas digitando — usamos rect com width animado */}
      <rect x="36" y="26" className="ac-line ac-line1" rx="1"/>
      <rect x="36" y="32" className="ac-line ac-line2" rx="1"/>
      <rect x="36" y="38" className="ac-line ac-line3" rx="1"/>

      {/* Calculadora */}
      <rect x="10" y="20" width="18" height="28" rx="2" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.8"/>
      {/* Display */}
      <rect x="12" y="22" width="14" height="6" rx="0.5" fill={color} fillOpacity="0.4"/>
      <text x="24" y="27" fontSize="5" fontFamily="monospace" fontWeight="700" fill="#050d1a" textAnchor="end" className="ac-display-text">1234</text>
      {/* Botoes */}
      <rect x="13" y="31" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6"/>
      <rect x="17.5" y="31" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6"/>
      <rect x="22" y="31" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6"/>
      <rect x="13" y="35.5" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6"/>
      <rect x="17.5" y="35.5" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6"/>
      <rect x="22" y="35.5" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6"/>
      <rect x="13" y="40" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6"/>
      <rect x="17.5" y="40" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6"/>
      <rect x="22" y="40" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6"/>
    </svg>
  )
}

function DefaultAnim({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="20" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
    </svg>
  )
}

'use client'

/**
 * NRAnimation — animacao SVG em loop para cada NR (38 normas).
 *
 * Cada NR tem 1 micro-animacao distinta (capacete batendo, raio piscando,
 * engrenagem girando, etc). Tudo SVG + CSS @keyframes inline. Sem JS, sem
 * deps externas.
 *
 * Tamanho padrao 36px (cabe no canto do card de NR).
 * Cor passada como prop (vem da relevancia da NR no setor).
 */

interface NRAnimationProps {
  nrId: number
  color: string
  size?: number
}

export default function NRAnimation({ nrId, color, size = 36 }: NRAnimationProps) {
  // ID unico de keyframe por (nrId + color hex) — evita colisao entre instancias
  const k = `${nrId}-${color.replace('#', '')}`

  switch (nrId) {
    case 1:  return <NR01 k={k} color={color} size={size} />
    case 3:  return <NR03 k={k} color={color} size={size} />
    case 4:  return <NR04 k={k} color={color} size={size} />
    case 5:  return <NR05 k={k} color={color} size={size} />
    case 6:  return <NR06 k={k} color={color} size={size} />
    case 7:  return <NR07 k={k} color={color} size={size} />
    case 8:  return <NR08 k={k} color={color} size={size} />
    case 9:  return <NR09 k={k} color={color} size={size} />
    case 10: return <NR10 k={k} color={color} size={size} />
    case 11: return <NR11 k={k} color={color} size={size} />
    case 12: return <NR12 k={k} color={color} size={size} />
    case 13: return <NR13 k={k} color={color} size={size} />
    case 14: return <NR14 k={k} color={color} size={size} />
    case 15: return <NR15 k={k} color={color} size={size} />
    case 16: return <NR16 k={k} color={color} size={size} />
    case 17: return <NR17 k={k} color={color} size={size} />
    case 18: return <NR18 k={k} color={color} size={size} />
    case 19: return <NR19 k={k} color={color} size={size} />
    case 20: return <NR20 k={k} color={color} size={size} />
    case 21: return <NR21 k={k} color={color} size={size} />
    case 22: return <NR22 k={k} color={color} size={size} />
    case 23: return <NR23 k={k} color={color} size={size} />
    case 24: return <NR24 k={k} color={color} size={size} />
    case 25: return <NR25 k={k} color={color} size={size} />
    case 26: return <NR26 k={k} color={color} size={size} />
    case 28: return <NR28 k={k} color={color} size={size} />
    case 29: return <NR29 k={k} color={color} size={size} />
    case 30: return <NR30 k={k} color={color} size={size} />
    case 31: return <NR31 k={k} color={color} size={size} />
    case 32: return <NR32 k={k} color={color} size={size} />
    case 33: return <NR33 k={k} color={color} size={size} />
    case 34: return <NR34 k={k} color={color} size={size} />
    case 35: return <NR35 k={k} color={color} size={size} />
    case 36: return <NR36 k={k} color={color} size={size} />
    case 37: return <NR37 k={k} color={color} size={size} />
    case 38: return <NR38 k={k} color={color} size={size} />
    default: return <Generic k={k} color={color} size={size} />
  }
}

type P = { k: string; color: string; size: number }
const SVG = ({ size, children }: { size: number; children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">{children}</svg>
)

/* ─── NR-01 Disposicoes Gerais — livro abrindo ─── */
function NR01({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr01-${k} { 0%,100%{transform:rotateY(0)} 50%{transform:rotateY(-30deg)} }
        .nr01-${k} { animation: nr01-${k} 3s ease-in-out infinite; transform-origin: 20px center; }
      `}</style>
      <g className={`nr01-${k}`}>
        <rect x="6" y="10" width="13" height="20" rx="1" fill={`${color}22`} stroke={color} strokeWidth="1.8"/>
        <line x1="9" y1="15" x2="16" y2="15" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
        <line x1="9" y1="19" x2="16" y2="19" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
        <line x1="9" y1="23" x2="14" y2="23" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
      </g>
      <rect x="21" y="10" width="13" height="20" rx="1" fill={`${color}22`} stroke={color} strokeWidth="1.8"/>
      <line x1="24" y1="15" x2="31" y2="15" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
      <line x1="24" y1="19" x2="31" y2="19" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
    </SVG>
  )
}

/* ─── NR-03 Embargo e Interdicao — cadeado fechando ─── */
function NR03({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr03-${k} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        .nr03-${k} { animation: nr03-${k} 1.6s ease-in-out infinite; transform-origin: center; }
      `}</style>
      <path d="M 13 18 L 13 14 a 7 7 0 0 1 14 0 L 27 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" className={`nr03-${k}`}/>
      <rect x="9" y="18" width="22" height="16" rx="2" fill={`${color}1A`} stroke={color} strokeWidth="2"/>
      <circle cx="20" cy="25" r="2" fill={color}/>
      <line x1="20" y1="25" x2="20" y2="29" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </SVG>
  )
}

/* ─── NR-04 SESMT — estetoscopio com pulso ─── */
function NR04({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr04-${k} { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
        .nr04-${k} { animation: nr04-${k} 1.4s ease-in-out infinite; transform-origin: 28px 26px; }
      `}</style>
      <path d="M 10 8 L 10 18 a 6 6 0 0 0 12 0 L 22 8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="16" y1="24" x2="16" y2="30" stroke={color} strokeWidth="2"/>
      <circle cx="28" cy="26" r="4" fill={`${color}33`} stroke={color} strokeWidth="2" className={`nr04-${k}`}/>
      <path d="M 16 30 Q 16 32 18 32 Q 24 32 24 26" stroke={color} strokeWidth="2" fill="none"/>
    </SVG>
  )
}

/* ─── NR-05 CIPA — 3 pessoinhas ─── */
function NR05({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr05-${k} { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .nr05a-${k} { animation: nr05-${k} 2s ease-in-out infinite; }
        .nr05b-${k} { animation: nr05-${k} 2s ease-in-out infinite 0.4s; }
        .nr05c-${k} { animation: nr05-${k} 2s ease-in-out infinite 0.8s; }
      `}</style>
      <g className={`nr05a-${k}`}><circle cx="10" cy="14" r="3" fill={color}/><rect x="7" y="19" width="6" height="9" rx="1" fill={`${color}55`}/></g>
      <g className={`nr05b-${k}`}><circle cx="20" cy="12" r="3.5" fill={color}/><rect x="16" y="17" width="8" height="11" rx="1" fill={`${color}55`}/></g>
      <g className={`nr05c-${k}`}><circle cx="30" cy="14" r="3" fill={color}/><rect x="27" y="19" width="6" height="9" rx="1" fill={`${color}55`}/></g>
    </SVG>
  )
}

/* ─── NR-06 EPI — capacete + luva alternando ─── */
function NR06({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr06-${k} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
        .nr06-${k} { animation: nr06-${k} 1.8s ease-in-out infinite; }
      `}</style>
      <g className={`nr06-${k}`}>
        <path d="M 8 22 Q 8 12 18 12 Q 28 12 28 22" fill={`${color}33`} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <rect x="6" y="22" width="24" height="3" rx="0.5" fill={color}/>
      </g>
      <line x1="18" y1="12" x2="18" y2="22" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
      {/* sparkle */}
      <circle cx="33" cy="15" r="1.5" fill={color}>
        <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/>
      </circle>
    </SVG>
  )
}

/* ─── NR-07 PCMSO — cruz medica pulsando ─── */
function NR07({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr07-${k} { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }
        .nr07-${k} { animation: nr07-${k} 1.6s ease-in-out infinite; transform-origin: 20px 20px; }
      `}</style>
      <circle cx="20" cy="20" r="14" fill={`${color}1A`} stroke={color} strokeWidth="2"/>
      <g className={`nr07-${k}`}>
        <rect x="17" y="11" width="6" height="18" rx="1" fill={color}/>
        <rect x="11" y="17" width="18" height="6" rx="1" fill={color}/>
      </g>
    </SVG>
  )
}

/* ─── NR-08 Edificacoes — predio com janelas acendendo ─── */
function NR08({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr08-${k} { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .nr08a-${k} { animation: nr08-${k} 2s ease-in-out infinite; }
        .nr08b-${k} { animation: nr08-${k} 2s ease-in-out infinite 0.5s; }
        .nr08c-${k} { animation: nr08-${k} 2s ease-in-out infinite 1s; }
      `}</style>
      <rect x="10" y="8" width="20" height="28" rx="1" fill={`${color}22`} stroke={color} strokeWidth="2"/>
      <rect x="13" y="12" width="4" height="4" fill={color} className={`nr08a-${k}`}/>
      <rect x="19" y="12" width="4" height="4" fill={color} className={`nr08b-${k}`}/>
      <rect x="13" y="20" width="4" height="4" fill={color} className={`nr08c-${k}`}/>
      <rect x="19" y="20" width="4" height="4" fill={color} className={`nr08a-${k}`}/>
      <rect x="13" y="28" width="10" height="6" fill={color}/>
    </SVG>
  )
}

/* ─── NR-09 Agentes Quimicos/Fisicos/Biologicos — gota caindo ─── */
function NR09({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr09-${k} { 0%{transform:translateY(-8px);opacity:0} 30%,70%{opacity:1} 100%{transform:translateY(8px);opacity:0} }
        .nr09-${k} { animation: nr09-${k} 1.8s ease-in infinite; }
      `}</style>
      <path d="M 10 10 L 10 20 L 30 20 L 30 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="10" x2="34" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <g className={`nr09-${k}`}>
        <path d="M 20 22 C 18 24 18 26 20 26 C 22 26 22 24 20 22 Z" fill={color}/>
      </g>
      <path d="M 17 32 C 17 36 23 36 23 32" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    </SVG>
  )
}

/* ─── NR-10 Eletricidade — raio piscando ─── */
function NR10({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr10-${k} { 0%,100%{opacity:1;filter:drop-shadow(0 0 0 transparent)} 50%{opacity:0.5;filter:drop-shadow(0 0 6px ${color})} }
        .nr10-${k} { animation: nr10-${k} 1.2s ease-in-out infinite; }
      `}</style>
      <path d="M 22 6 L 12 22 L 19 22 L 16 34 L 28 16 L 21 16 L 24 6 Z" fill={color} className={`nr10-${k}`}/>
    </SVG>
  )
}

/* ─── NR-11 Movimentacao — caixa subindo ─── */
function NR11({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr11-${k} { 0%,100%{transform:translateY(4px)} 50%{transform:translateY(-2px)} }
        .nr11-${k} { animation: nr11-${k} 2s ease-in-out infinite; }
      `}</style>
      <line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2"/>
      <g className={`nr11-${k}`}>
        <rect x="13" y="14" width="14" height="14" rx="1" fill={`${color}33`} stroke={color} strokeWidth="2"/>
        <line x1="13" y1="21" x2="27" y2="21" stroke={color} strokeWidth="1.5"/>
        <line x1="20" y1="14" x2="20" y2="28" stroke={color} strokeWidth="1.5"/>
      </g>
      <path d="M 14 28 L 26 28 L 26 32 L 14 32 Z" stroke={color} strokeWidth="1.5" fill="none"/>
    </SVG>
  )
}

/* ─── NR-12 Maquinas — engrenagem girando ─── */
function NR12({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr12-${k} { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .nr12-${k} { animation: nr12-${k} 6s linear infinite; transform-origin: 20px 20px; }
      `}</style>
      <g className={`nr12-${k}`}>
        <circle cx="20" cy="20" r="6" fill={`${color}33`} stroke={color} strokeWidth="2"/>
        <circle cx="20" cy="20" r="2" fill={color}/>
        <rect x="18.5" y="6" width="3" height="5" fill={color}/>
        <rect x="18.5" y="29" width="3" height="5" fill={color}/>
        <rect x="6" y="18.5" width="5" height="3" fill={color}/>
        <rect x="29" y="18.5" width="5" height="3" fill={color}/>
        <rect x="9" y="9" width="3" height="5" fill={color} transform="rotate(-45 10.5 11.5)"/>
        <rect x="28" y="9" width="3" height="5" fill={color} transform="rotate(45 29.5 11.5)"/>
        <rect x="9" y="26" width="3" height="5" fill={color} transform="rotate(45 10.5 28.5)"/>
        <rect x="28" y="26" width="3" height="5" fill={color} transform="rotate(-45 29.5 28.5)"/>
      </g>
    </SVG>
  )
}

/* ─── NR-13 Caldeiras — vapor saindo ─── */
function NR13({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr13-${k} { 0%{transform:translateY(0);opacity:0.8} 100%{transform:translateY(-12px);opacity:0} }
        .nr13a-${k} { animation: nr13-${k} 2s ease-out infinite; }
        .nr13b-${k} { animation: nr13-${k} 2s ease-out infinite 0.7s; }
      `}</style>
      <ellipse cx="20" cy="26" rx="12" ry="8" fill={`${color}22`} stroke={color} strokeWidth="2"/>
      <line x1="18" y1="18" x2="18" y2="14" stroke={color} strokeWidth="2"/>
      <line x1="22" y1="18" x2="22" y2="14" stroke={color} strokeWidth="2"/>
      <circle cx="14" cy="26" r="1.5" fill={color}/>
      <circle cx="20" cy="26" r="1.5" fill={color}/>
      <circle cx="26" cy="26" r="1.5" fill={color}/>
      <circle cx="18" cy="12" r="2" fill={`${color}88`} className={`nr13a-${k}`}/>
      <circle cx="22" cy="12" r="2" fill={`${color}88`} className={`nr13b-${k}`}/>
    </SVG>
  )
}

/* ─── NR-14 Fornos — chama tremendo ─── */
function NR14({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr14-${k} { 0%,100%{transform:scaleY(1) scaleX(1)} 50%{transform:scaleY(1.1) scaleX(0.92)} }
        .nr14-${k} { animation: nr14-${k} 0.7s ease-in-out infinite; transform-origin: 20px 28px; }
      `}</style>
      <rect x="8" y="22" width="24" height="14" rx="1" fill={`${color}1A`} stroke={color} strokeWidth="2"/>
      <line x1="14" y1="32" x2="26" y2="32" stroke={color} strokeWidth="1.5"/>
      <g className={`nr14-${k}`}>
        <path d="M 16 28 Q 16 22 20 18 Q 24 22 24 28 Q 22 30 20 30 Q 18 30 16 28 Z" fill={color} fillOpacity="0.7"/>
        <path d="M 18 26 Q 18 22 20 20 Q 22 22 22 26 Z" fill={color}/>
      </g>
    </SVG>
  )
}

/* ─── NR-15 Insalubridade — simbolo de risco rotando ─── */
function NR15({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr15-${k} { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .nr15-${k} { animation: nr15-${k} 8s linear infinite; transform-origin: 20px 20px; }
      `}</style>
      <circle cx="20" cy="20" r="14" fill={`${color}1A`} stroke={color} strokeWidth="2"/>
      <g className={`nr15-${k}`}>
        <circle cx="20" cy="20" r="3" fill={color}/>
        <path d="M 20 8 a 6 6 0 0 1 5.2 9 L 20 20 Z" fill={color}/>
        <path d="M 25.2 17 a 6 6 0 0 1 -10.4 0 L 20 20 Z" fill={color} transform="rotate(120 20 20)"/>
        <path d="M 25.2 17 a 6 6 0 0 1 -10.4 0 L 20 20 Z" fill={color} transform="rotate(240 20 20)"/>
      </g>
    </SVG>
  )
}

/* ─── NR-16 Periculosidade — explosao expandindo ─── */
function NR16({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr16-${k} { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.2);opacity:0.6} }
        .nr16-${k} { animation: nr16-${k} 1s ease-in-out infinite; transform-origin: 20px 20px; }
      `}</style>
      <g className={`nr16-${k}`}>
        <polygon points="20,4 24,14 34,12 27,20 34,28 24,26 20,36 16,26 6,28 13,20 6,12 16,14" fill={`${color}55`} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      </g>
      <text x="20" y="24" fontSize="10" fontWeight="900" textAnchor="middle" fill={color}>!</text>
    </SVG>
  )
}

/* ─── NR-17 Ergonomia — figura sentada (oscila) ─── */
function NR17({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr17-${k} { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        .nr17-${k} { animation: nr17-${k} 3s ease-in-out infinite; transform-origin: 20px 24px; }
      `}</style>
      <g className={`nr17-${k}`}>
        <circle cx="20" cy="10" r="3" fill={color}/>
        <line x1="20" y1="13" x2="20" y2="22" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="20" y1="17" x2="14" y2="20" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="20" y1="22" x2="26" y2="22" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="26" y1="22" x2="26" y2="28" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      </g>
      <line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2"/>
      <rect x="22" y="28" width="10" height="6" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
    </SVG>
  )
}

/* ─── NR-18 Construcao — andaime sendo erguido ─── */
function NR18({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr18-${k} { 0%{stroke-dashoffset:30} 100%{stroke-dashoffset:0} }
        .nr18-${k} { stroke-dasharray:30; animation: nr18-${k} 2.5s ease-in-out infinite; }
      `}</style>
      <line x1="8" y1="36" x2="32" y2="36" stroke={color} strokeWidth="2"/>
      <line x1="10" y1="36" x2="10" y2="8" stroke={color} strokeWidth="2"/>
      <line x1="30" y1="36" x2="30" y2="8" stroke={color} strokeWidth="2"/>
      <line x1="10" y1="14" x2="30" y2="14" stroke={color} strokeWidth="2" className={`nr18-${k}`}/>
      <line x1="10" y1="22" x2="30" y2="22" stroke={color} strokeWidth="2" className={`nr18-${k}`}/>
      <line x1="10" y1="30" x2="30" y2="30" stroke={color} strokeWidth="2"/>
      <rect x="14" y="8" width="12" height="6" fill={color}/>
    </SVG>
  )
}

/* ─── NR-19 Explosivos — pavio queimando ─── */
function NR19({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr19-${k} { 0%,100%{transform:translateX(0);opacity:1} 50%{transform:translateX(2px);opacity:0.6} }
        .nr19-${k} { animation: nr19-${k} 0.6s ease-in-out infinite; transform-origin: 8px 14px; }
      `}</style>
      <circle cx="22" cy="22" r="11" fill={`${color}33`} stroke={color} strokeWidth="2.2"/>
      <line x1="22" y1="11" x2="14" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <g className={`nr19-${k}`}>
        <circle cx="11" cy="13" r="2.5" fill={color}/>
      </g>
    </SVG>
  )
}

/* ─── NR-20 Inflamaveis — chama dancando ─── */
function NR20({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr20-${k} { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.15)} }
        .nr20-${k} { animation: nr20-${k} 0.9s ease-in-out infinite; transform-origin: 20px 32px; }
      `}</style>
      <g className={`nr20-${k}`}>
        <path d="M 14 32 Q 14 22 20 18 Q 22 14 20 8 Q 28 12 28 22 Q 28 30 26 32 Q 24 34 20 34 Q 16 34 14 32 Z" fill={color} fillOpacity="0.6" stroke={color} strokeWidth="1.5"/>
        <path d="M 18 30 Q 18 24 22 22 Q 24 26 24 30 Z" fill={color}/>
      </g>
    </SVG>
  )
}

/* ─── NR-21 Ceu Aberto — sol pulsando ─── */
function NR21({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr21-${k} { 0%,100%{transform:rotate(0)} 100%{transform:rotate(45deg)} }
        @keyframes nr21p-${k} { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        .nr21r-${k} { animation: nr21-${k} 8s linear infinite; transform-origin: 20px 20px; }
        .nr21p-${k} { animation: nr21p-${k} 2.5s ease-in-out infinite; transform-origin: 20px 20px; }
      `}</style>
      <g className={`nr21r-${k}`}>
        <line x1="20" y1="4" x2="20" y2="9" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="20" y1="31" x2="20" y2="36" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="4" y1="20" x2="9" y2="20" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="31" y1="20" x2="36" y2="20" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="8" y1="8" x2="11" y2="11" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="29" y1="29" x2="32" y2="32" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="8" y1="32" x2="11" y2="29" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="29" y1="11" x2="32" y2="8" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      </g>
      <circle cx="20" cy="20" r="6" fill={color} className={`nr21p-${k}`}/>
    </SVG>
  )
}

/* ─── NR-22 Mineracao — pa batendo ─── */
function NR22({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr22-${k} { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(20deg)} }
        .nr22-${k} { animation: nr22-${k} 1.4s ease-in-out infinite; transform-origin: 24px 28px; }
      `}</style>
      <g className={`nr22-${k}`}>
        <line x1="24" y1="28" x2="10" y2="14" stroke={color} strokeWidth="3" strokeLinecap="round"/>
        <path d="M 6 14 L 14 6 L 18 10 L 10 18 Z" fill={color}/>
      </g>
      <line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2"/>
      <circle cx="28" cy="32" r="1.5" fill={color}/>
      <circle cx="22" cy="33" r="1" fill={color}/>
    </SVG>
  )
}

/* ─── NR-23 Incendio — extintor jorrando ─── */
function NR23({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr23-${k} { 0%{transform:translateX(0);opacity:1} 100%{transform:translateX(-8px);opacity:0} }
        .nr23-${k} { animation: nr23-${k} 0.8s ease-out infinite; }
      `}</style>
      <rect x="20" y="14" width="10" height="20" rx="2" fill={`${color}33`} stroke={color} strokeWidth="2"/>
      <rect x="22" y="10" width="6" height="4" rx="0.5" fill={color}/>
      <line x1="20" y1="20" x2="14" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <g className={`nr23-${k}`}>
        <circle cx="12" cy="14" r="1" fill={color}/>
        <circle cx="9" cy="15" r="0.8" fill={color}/>
        <circle cx="6" cy="16" r="0.6" fill={color}/>
      </g>
    </SVG>
  )
}

/* ─── NR-24 Sanitarias — torneira pingando ─── */
function NR24({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr24-${k} { 0%{transform:translateY(-2px);opacity:0} 30%{opacity:1} 100%{transform:translateY(14px);opacity:0} }
        .nr24-${k} { animation: nr24-${k} 1.6s ease-in infinite; }
      `}</style>
      <rect x="8" y="8" width="6" height="14" rx="1" fill={color}/>
      <rect x="14" y="14" width="14" height="3" fill={color}/>
      <rect x="26" y="17" width="3" height="6" fill={color}/>
      <ellipse cx="27.5" cy="34" rx="6" ry="2" fill="none" stroke={color} strokeWidth="1.5"/>
      <g className={`nr24-${k}`}>
        <circle cx="27.5" cy="25" r="1.8" fill={color}/>
      </g>
    </SVG>
  )
}

/* ─── NR-25 Residuos — lixeira girando ─── */
function NR25({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr25-${k} { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }
        .nr25-${k} { animation: nr25-${k} 3s ease-in-out infinite; transform-origin: 20px 20px; }
      `}</style>
      <g className={`nr25-${k}`}>
        <rect x="11" y="12" width="18" height="2" rx="0.5" fill={color}/>
        <line x1="14" y1="9" x2="26" y2="9" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M 12 14 L 14 32 L 26 32 L 28 14 Z" fill={`${color}22`} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <line x1="17" y1="18" x2="17" y2="28" stroke={color} strokeWidth="1.5"/>
        <line x1="20" y1="18" x2="20" y2="28" stroke={color} strokeWidth="1.5"/>
        <line x1="23" y1="18" x2="23" y2="28" stroke={color} strokeWidth="1.5"/>
      </g>
    </SVG>
  )
}

/* ─── NR-26 Sinalizacao — triangulo de alerta piscando ─── */
function NR26({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr26-${k} { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .nr26-${k} { animation: nr26-${k} 0.9s ease-in-out infinite; }
      `}</style>
      <path d="M 20 6 L 36 32 L 4 32 Z" fill={`${color}33`} stroke={color} strokeWidth="2.2" strokeLinejoin="round" className={`nr26-${k}`}/>
      <rect x="18.5" y="14" width="3" height="10" fill={color}/>
      <circle cx="20" cy="28" r="1.5" fill={color}/>
    </SVG>
  )
}

/* ─── NR-28 Fiscalizacao — balanca oscilando ─── */
function NR28({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr28-${k} { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        .nr28-${k} { animation: nr28-${k} 2.4s ease-in-out infinite; transform-origin: 20px 14px; }
      `}</style>
      <line x1="20" y1="14" x2="20" y2="32" stroke={color} strokeWidth="2.2"/>
      <rect x="14" y="32" width="12" height="2" fill={color}/>
      <g className={`nr28-${k}`}>
        <line x1="6" y1="14" x2="34" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M 6 14 L 4 22 L 12 22 L 10 14 Z" fill={`${color}33`} stroke={color} strokeWidth="1.8"/>
        <path d="M 34 14 L 30 22 L 36 22 L 36 14 Z" fill={`${color}33`} stroke={color} strokeWidth="1.8"/>
      </g>
      <circle cx="20" cy="14" r="2" fill={color}/>
    </SVG>
  )
}

/* ─── NR-29 Portuario — conteiner subindo ─── */
function NR29({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr29-${k} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .nr29-${k} { animation: nr29-${k} 2s ease-in-out infinite; }
      `}</style>
      <line x1="6" y1="6" x2="34" y2="6" stroke={color} strokeWidth="2"/>
      <line x1="20" y1="6" x2="20" y2="14" stroke={color} strokeWidth="1.5"/>
      <g className={`nr29-${k}`}>
        <rect x="10" y="14" width="20" height="14" rx="1" fill={`${color}22`} stroke={color} strokeWidth="2"/>
        <line x1="14" y1="14" x2="14" y2="28" stroke={color} strokeWidth="1.5"/>
        <line x1="20" y1="14" x2="20" y2="28" stroke={color} strokeWidth="1.5"/>
        <line x1="26" y1="14" x2="26" y2="28" stroke={color} strokeWidth="1.5"/>
      </g>
      <line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2"/>
    </SVG>
  )
}

/* ─── NR-30 Aquaviario — onda balancando ─── */
function NR30({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr30-${k} { 0%,100%{transform:translateX(-3px)} 50%{transform:translateX(3px)} }
        .nr30-${k} { animation: nr30-${k} 2.5s ease-in-out infinite; }
      `}</style>
      <path d="M 6 18 Q 12 12 18 18 T 30 18 T 42 18" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" className={`nr30-${k}`}/>
      <path d="M 6 26 Q 12 20 18 26 T 30 26 T 42 26" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" className={`nr30-${k}`} style={{ animationDelay: '0.5s' }}/>
      <path d="M 6 32 Q 12 26 18 32 T 30 32 T 42 32" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" className={`nr30-${k}`} style={{ animationDelay: '1s' }}/>
    </SVG>
  )
}

/* ─── NR-31 Rural — trator se movendo ─── */
function NR31({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr31-${k} { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .nr31a-${k} { animation: nr31-${k} 2s linear infinite; transform-origin: 12px 28px; }
        .nr31b-${k} { animation: nr31-${k} 2s linear infinite; transform-origin: 28px 28px; }
      `}</style>
      <rect x="14" y="12" width="14" height="10" rx="1" fill={`${color}33`} stroke={color} strokeWidth="2"/>
      <line x1="6" y1="22" x2="32" y2="22" stroke={color} strokeWidth="2"/>
      <g className={`nr31a-${k}`}>
        <circle cx="12" cy="28" r="6" fill="none" stroke={color} strokeWidth="2.2"/>
        <line x1="12" y1="22" x2="12" y2="34" stroke={color} strokeWidth="1.5"/>
        <line x1="6" y1="28" x2="18" y2="28" stroke={color} strokeWidth="1.5"/>
      </g>
      <g className={`nr31b-${k}`}>
        <circle cx="28" cy="28" r="4" fill="none" stroke={color} strokeWidth="2.2"/>
        <line x1="28" y1="24" x2="28" y2="32" stroke={color} strokeWidth="1.5"/>
      </g>
    </SVG>
  )
}

/* ─── NR-32 Saude — cruz medica + pulso ─── */
function NR32({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr32-${k} { 0%,100%{stroke-dashoffset:0} 50%{stroke-dashoffset:-30} }
        .nr32-${k} { stroke-dasharray:30; animation: nr32-${k} 1.5s linear infinite; }
      `}</style>
      <rect x="6" y="14" width="28" height="14" rx="1" fill={`${color}1A`} stroke={color} strokeWidth="2"/>
      <rect x="18" y="10" width="4" height="10" fill={color}/>
      <rect x="14" y="14" width="12" height="4" fill={color}/>
      <path d="M 6 22 L 12 22 L 14 18 L 18 26 L 22 22 L 34 22" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" className={`nr32-${k}`}/>
    </SVG>
  )
}

/* ─── NR-33 Espacos Confinados — porta estreita pulsando ─── */
function NR33({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr33-${k} { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .nr33-${k} { animation: nr33-${k} 1.8s ease-in-out infinite; }
      `}</style>
      <rect x="6" y="6" width="28" height="28" fill={`${color}11`} stroke={color} strokeWidth="2"/>
      <rect x="16" y="14" width="8" height="20" fill={`${color}55`} stroke={color} strokeWidth="2" className={`nr33-${k}`}/>
      <circle cx="22" cy="24" r="0.8" fill={color}/>
      <line x1="11" y1="11" x2="14" y2="11" stroke={color} strokeWidth="1.5"/>
      <line x1="26" y1="11" x2="29" y2="11" stroke={color} strokeWidth="1.5"/>
      <line x1="11" y1="29" x2="14" y2="29" stroke={color} strokeWidth="1.5"/>
      <line x1="26" y1="29" x2="29" y2="29" stroke={color} strokeWidth="1.5"/>
    </SVG>
  )
}

/* ─── NR-34 Naval — casco de barco balancando ─── */
function NR34({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr34-${k} { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
        .nr34-${k} { animation: nr34-${k} 3s ease-in-out infinite; transform-origin: 20px 28px; }
      `}</style>
      <g className={`nr34-${k}`}>
        <path d="M 6 22 L 34 22 L 30 32 L 10 32 Z" fill={`${color}33`} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <line x1="20" y1="22" x2="20" y2="6" stroke={color} strokeWidth="2"/>
        <path d="M 20 8 L 28 14 L 20 18 Z" fill={color}/>
      </g>
      <line x1="4" y1="34" x2="36" y2="34" stroke={color} strokeWidth="1.5" strokeOpacity="0.6"/>
    </SVG>
  )
}

/* ─── NR-35 Trabalho em Altura — figura descendo de corda ─── */
function NR35({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr35-${k} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
        .nr35-${k} { animation: nr35-${k} 2.5s ease-in-out infinite; }
      `}</style>
      <line x1="20" y1="4" x2="20" y2="34" stroke={color} strokeWidth="1.5" strokeDasharray="3 3"/>
      <line x1="6" y1="4" x2="34" y2="4" stroke={color} strokeWidth="2.2"/>
      <g className={`nr35-${k}`}>
        <circle cx="20" cy="14" r="3" fill={color}/>
        <line x1="20" y1="17" x2="20" y2="24" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="20" y1="20" x2="14" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="20" x2="26" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="24" x2="16" y2="30" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="20" y1="24" x2="24" y2="30" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      </g>
    </SVG>
  )
}

/* ─── NR-36 Frigorificos — faca descendo ─── */
function NR36({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr36-${k} { 0%,100%{transform:translateY(-3px) rotate(-15deg)} 50%{transform:translateY(2px) rotate(-15deg)} }
        .nr36-${k} { animation: nr36-${k} 1.4s ease-in-out infinite; transform-origin: 20px 8px; }
      `}</style>
      <g className={`nr36-${k}`}>
        <rect x="18" y="6" width="4" height="6" rx="0.5" fill={color}/>
        <path d="M 22 12 L 26 28 L 18 30 L 18 12 Z" fill={`${color}55`} stroke={color} strokeWidth="2"/>
      </g>
      <path d="M 8 34 Q 8 30 12 30 L 28 30 Q 32 30 32 34" stroke={color} strokeWidth="2" fill="none"/>
    </SVG>
  )
}

/* ─── NR-37 Plataformas Petroleo — torre + chama ─── */
function NR37({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr37-${k} { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.2)} }
        .nr37-${k} { animation: nr37-${k} 0.9s ease-in-out infinite; transform-origin: 20px 10px; }
      `}</style>
      <line x1="14" y1="34" x2="20" y2="14" stroke={color} strokeWidth="2"/>
      <line x1="26" y1="34" x2="20" y2="14" stroke={color} strokeWidth="2"/>
      <line x1="16" y1="26" x2="24" y2="26" stroke={color} strokeWidth="1.8"/>
      <line x1="17" y1="22" x2="23" y2="22" stroke={color} strokeWidth="1.8"/>
      <line x1="18" y1="18" x2="22" y2="18" stroke={color} strokeWidth="1.8"/>
      <g className={`nr37-${k}`}>
        <path d="M 17 12 Q 17 6 20 4 Q 23 6 23 12 Z" fill={color} fillOpacity="0.7"/>
      </g>
      <line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2"/>
    </SVG>
  )
}

/* ─── NR-38 Limpeza Urbana — caminhao com lixeira ─── */
function NR38({ k, color, size }: P) {
  return (
    <SVG size={size}>
      <style>{`
        @keyframes nr38-${k} { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .nr38-${k} { animation: nr38-${k} 2s linear infinite; }
      `}</style>
      <rect x="6" y="16" width="22" height="12" fill={`${color}33`} stroke={color} strokeWidth="2"/>
      <rect x="22" y="20" width="10" height="8" fill={`${color}55`} stroke={color} strokeWidth="2"/>
      <line x1="6" y1="32" x2="34" y2="32" stroke={color} strokeWidth="1.5" strokeOpacity="0.6"/>
      <g style={{ transformOrigin: '12px 30px' }} className={`nr38-${k}`}>
        <circle cx="12" cy="30" r="3" fill="none" stroke={color} strokeWidth="2"/>
        <line x1="9" y1="30" x2="15" y2="30" stroke={color} strokeWidth="1.2"/>
      </g>
      <g style={{ transformOrigin: '26px 30px' }} className={`nr38-${k}`}>
        <circle cx="26" cy="30" r="3" fill="none" stroke={color} strokeWidth="2"/>
        <line x1="23" y1="30" x2="29" y2="30" stroke={color} strokeWidth="1.2"/>
      </g>
      <line x1="14" y1="14" x2="20" y2="14" stroke={color} strokeWidth="1.5"/>
      <line x1="14" y1="11" x2="20" y2="11" stroke={color} strokeWidth="1.5"/>
    </SVG>
  )
}

/* ─── Generic fallback ─── */
function Generic({ color, size }: { k: string; color: string; size: number }) {
  return (
    <SVG size={size}>
      <circle cx="20" cy="20" r="14" fill={`${color}22`} stroke={color} strokeWidth="2">
        <animate attributeName="r" values="13;15;13" dur="2s" repeatCount="indefinite"/>
      </circle>
      <text x="20" y="25" textAnchor="middle" fill={color} fontSize="14" fontWeight="700">NR</text>
    </SVG>
  )
}

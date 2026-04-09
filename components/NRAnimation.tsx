'use client'

/**
 * NRAnimation — animacao SVG em loop para cada NR (35 NRs vigentes).
 *
 * IMPLEMENTACAO: cada NR tem classes CSS estaticas (sem interpolacao
 * dinamica) e um <style> com keyframes proprios. Isso garante que o
 * navegador parseie corretamente os seletores e aplique as animacoes
 * em loop infinito.
 *
 * Mesmo padrao do SectorAnimation que ja funciona.
 */

interface NRAnimationProps {
  nrId: number
  color: string
  size?: number
}

export default function NRAnimation({ nrId, color, size = 36 }: NRAnimationProps) {
  switch (nrId) {
    case 1:  return <NR01 color={color} size={size} />
    case 3:  return <NR03 color={color} size={size} />
    case 4:  return <NR04 color={color} size={size} />
    case 5:  return <NR05 color={color} size={size} />
    case 6:  return <NR06 color={color} size={size} />
    case 7:  return <NR07 color={color} size={size} />
    case 8:  return <NR08 color={color} size={size} />
    case 9:  return <NR09 color={color} size={size} />
    case 10: return <NR10 color={color} size={size} />
    case 11: return <NR11 color={color} size={size} />
    case 12: return <NR12 color={color} size={size} />
    case 13: return <NR13 color={color} size={size} />
    case 14: return <NR14 color={color} size={size} />
    case 15: return <NR15 color={color} size={size} />
    case 16: return <NR16 color={color} size={size} />
    case 17: return <NR17 color={color} size={size} />
    case 18: return <NR18 color={color} size={size} />
    case 19: return <NR19 color={color} size={size} />
    case 20: return <NR20 color={color} size={size} />
    case 21: return <NR21 color={color} size={size} />
    case 22: return <NR22 color={color} size={size} />
    case 23: return <NR23 color={color} size={size} />
    case 24: return <NR24 color={color} size={size} />
    case 25: return <NR25 color={color} size={size} />
    case 26: return <NR26 color={color} size={size} />
    case 28: return <NR28 color={color} size={size} />
    case 29: return <NR29 color={color} size={size} />
    case 30: return <NR30 color={color} size={size} />
    case 31: return <NR31 color={color} size={size} />
    case 32: return <NR32 color={color} size={size} />
    case 33: return <NR33 color={color} size={size} />
    case 34: return <NR34 color={color} size={size} />
    case 35: return <NR35 color={color} size={size} />
    case 36: return <NR36 color={color} size={size} />
    case 37: return <NR37 color={color} size={size} />
    case 38: return <NR38 color={color} size={size} />
    default: return <Generic color={color} size={size} />
  }
}

type P = { color: string; size: number }
const SVG = ({ size, children }: { size: number; children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">{children}</svg>
)

/* CSS global injetado 1x — todas as NR animations.
   Classes estaticas, keyframes globais, sem interpolacao runtime. */
const NR_CSS = `
@keyframes nrFlip { 0%,100%{transform:rotateY(0)} 50%{transform:rotateY(-30deg)} }
@keyframes nrBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
@keyframes nrBobBig { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
@keyframes nrSink { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
@keyframes nrPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
@keyframes nrPulseSm { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
@keyframes nrPulseBg { 0%,100%{transform:scale(1)} 50%{transform:scale(1.22)} }
@keyframes nrFade { 0%,100%{opacity:1} 50%{opacity:0.35} }
@keyframes nrFadeFast { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes nrSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes nrSpinSlow { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes nrSwing { 0%,100%{transform:rotate(-22deg)} 50%{transform:rotate(18deg)} }
@keyframes nrSwingSm { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
@keyframes nrTilt { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
@keyframes nrFall { 0%{transform:translateY(-8px);opacity:0} 30%,70%{opacity:1} 100%{transform:translateY(8px);opacity:0} }
@keyframes nrFallSlow { 0%{transform:translateY(-2px);opacity:0} 30%{opacity:1} 100%{transform:translateY(14px);opacity:0} }
@keyframes nrJet { 0%{transform:translateX(0);opacity:1} 100%{transform:translateX(-8px);opacity:0} }
@keyframes nrSteam { 0%{transform:translateY(0);opacity:0.8} 100%{transform:translateY(-12px);opacity:0} }
@keyframes nrFlame { 0%,100%{transform:scaleY(1) scaleX(1)} 50%{transform:scaleY(1.12) scaleX(0.92)} }
@keyframes nrFlameSlow { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.18)} }
@keyframes nrShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-1.5px)} 75%{transform:translateX(1.5px)} }
@keyframes nrDraw { 0%{stroke-dashoffset:30} 50%,100%{stroke-dashoffset:0} }
@keyframes nrWave { 0%,100%{transform:translateX(-3px)} 50%{transform:translateX(3px)} }
@keyframes nrGlow { 0%,100%{opacity:1;filter:drop-shadow(0 0 0 transparent)} 50%{opacity:0.55;filter:drop-shadow(0 0 6px currentColor)} }

/* helmet-bob para NR-06 */
.nrA-helmet { animation: nrBob 1.8s ease-in-out infinite; transform-origin: center; }
.nrA-spark  { animation: nrFadeFast 1.8s ease-in-out infinite; transform-origin: center; }

/* gear */
.nrA-gear { animation: nrSpin 6s linear infinite; transform-origin: 20px 20px; }

/* engrenagem mais lenta */
.nrA-trefoil { animation: nrSpin 8s linear infinite; transform-origin: 20px 20px; }

/* sun rays + sun pulse */
.nrA-sun-rays { animation: nrSpin 12s linear infinite; transform-origin: 20px 20px; }
.nrA-sun-core { animation: nrPulseSm 2.5s ease-in-out infinite; transform-origin: 20px 20px; }

/* truck wheels */
.nrA-wheel-l { animation: nrSpin 2s linear infinite; transform-origin: 12px 30px; }
.nrA-wheel-r { animation: nrSpin 2s linear infinite; transform-origin: 28px 30px; }
.nrA-wheel-tractor-l { animation: nrSpin 2s linear infinite; transform-origin: 12px 28px; }
.nrA-wheel-tractor-r { animation: nrSpin 2s linear infinite; transform-origin: 28px 28px; }

/* lightning glow */
.nrA-lightning { animation: nrGlow 1.2s ease-in-out infinite; }

/* book */
.nrA-book-l { animation: nrFlip 3s ease-in-out infinite; transform-origin: 20px center; }

/* lock */
.nrA-lock-arc { animation: nrBob 1.6s ease-in-out infinite; transform-origin: center; }

/* SESMT pulse */
.nrA-stetho-tip { animation: nrPulse 1.4s ease-in-out infinite; transform-origin: 28px 26px; }

/* CIPA piscadas em sequencia */
.nrA-cipa-1 { animation: nrFade 2s ease-in-out infinite; }
.nrA-cipa-2 { animation: nrFade 2s ease-in-out 0.4s infinite; }
.nrA-cipa-3 { animation: nrFade 2s ease-in-out 0.8s infinite; }

/* PCMSO cruz */
.nrA-cross { animation: nrPulseSm 1.6s ease-in-out infinite; transform-origin: 20px 20px; }

/* Predio janelas */
.nrA-window-1 { animation: nrFade 2s ease-in-out infinite; }
.nrA-window-2 { animation: nrFade 2s ease-in-out 0.5s infinite; }
.nrA-window-3 { animation: nrFade 2s ease-in-out 1s infinite; }
.nrA-window-4 { animation: nrFade 2s ease-in-out 1.5s infinite; }

/* Drop falling */
.nrA-drop { animation: nrFall 1.8s ease-in infinite; transform-origin: 20px 20px; }

/* Box rising */
.nrA-box { animation: nrBob 2s ease-in-out infinite; transform-origin: center; }

/* Steam puffs */
.nrA-steam-1 { animation: nrSteam 2s ease-out infinite; transform-origin: 18px 12px; }
.nrA-steam-2 { animation: nrSteam 2s ease-out 0.7s infinite; transform-origin: 22px 12px; }

/* Flame */
.nrA-flame { animation: nrFlame 0.7s ease-in-out infinite; transform-origin: 20px 28px; }
.nrA-flame-big { animation: nrFlameSlow 0.9s ease-in-out infinite; transform-origin: 20px 32px; }

/* Explosion */
.nrA-explosion { animation: nrPulseBg 1s ease-in-out infinite; transform-origin: 20px 20px; }

/* Ergonomia */
.nrA-sitting { animation: nrTilt 3s ease-in-out infinite; transform-origin: 20px 24px; }

/* Andaime stroke draw */
.nrA-scaffold-line { stroke-dasharray: 30; animation: nrDraw 2.5s ease-in-out infinite; }

/* Pavio */
.nrA-fuse { animation: nrShake 0.6s ease-in-out infinite; transform-origin: 8px 14px; }

/* Inflamavel */
.nrA-fire { animation: nrFlameSlow 0.9s ease-in-out infinite; transform-origin: 20px 32px; }

/* Pa */
.nrA-shovel { animation: nrSwing 1.4s ease-in-out infinite; transform-origin: 24px 28px; }

/* Extintor jato */
.nrA-jet-1 { animation: nrJet 0.8s ease-out infinite; }
.nrA-jet-2 { animation: nrJet 0.8s ease-out 0.2s infinite; }
.nrA-jet-3 { animation: nrJet 0.8s ease-out 0.4s infinite; }

/* Torneira */
.nrA-faucet-drop { animation: nrFallSlow 1.6s ease-in infinite; }

/* Lixeira */
.nrA-trash { animation: nrSwingSm 3s ease-in-out infinite; transform-origin: 20px 20px; }

/* Triangle alert */
.nrA-alert { animation: nrFadeFast 0.9s ease-in-out infinite; }

/* Balanca */
.nrA-scale { animation: nrSwingSm 2.4s ease-in-out infinite; transform-origin: 20px 14px; }

/* Conteiner */
.nrA-container { animation: nrBobBig 2s ease-in-out infinite; }

/* Onda */
.nrA-wave-1 { animation: nrWave 2.5s ease-in-out infinite; }
.nrA-wave-2 { animation: nrWave 2.5s ease-in-out 0.5s infinite; }
.nrA-wave-3 { animation: nrWave 2.5s ease-in-out 1s infinite; }

/* Naval */
.nrA-boat { animation: nrSwingSm 3s ease-in-out infinite; transform-origin: 20px 28px; }

/* NR-35 figura */
.nrA-climber { animation: nrSink 2.5s ease-in-out infinite; }

/* Faca */
.nrA-knife { animation: nrBob 1.4s ease-in-out infinite; transform-origin: 20px 8px; }

/* Petroleo torre */
.nrA-flame-top { animation: nrFlameSlow 0.9s ease-in-out infinite; transform-origin: 20px 10px; }

/* Confinado porta */
.nrA-door { animation: nrFadeFast 1.8s ease-in-out infinite; }
`

let _injected = false
function ensureCSS() {
  if (typeof document === 'undefined') return null
  if (_injected) return null
  _injected = true
  return <style dangerouslySetInnerHTML={{ __html: NR_CSS }} />
}

function CSSWrap({ children }: { children: React.ReactNode }) {
  return (
    <>
      {ensureCSS()}
      {children}
    </>
  )
}

/* ─── NR-01 livro abrindo ─── */
function NR01({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-book-l">
          <rect x="6" y="10" width="13" height="20" rx="1" fill={`${color}22`} stroke={color} strokeWidth="1.8"/>
          <line x1="9" y1="15" x2="16" y2="15" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
          <line x1="9" y1="19" x2="16" y2="19" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
          <line x1="9" y1="23" x2="14" y2="23" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
        </g>
        <rect x="21" y="10" width="13" height="20" rx="1" fill={`${color}22`} stroke={color} strokeWidth="1.8"/>
        <line x1="24" y1="15" x2="31" y2="15" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
        <line x1="24" y1="19" x2="31" y2="19" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-03 cadeado fechando ─── */
function NR03({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <path d="M 13 18 L 13 14 a 7 7 0 0 1 14 0 L 27 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" className="nrA-lock-arc"/>
        <rect x="9" y="18" width="22" height="16" rx="2" fill={`${color}1A`} stroke={color} strokeWidth="2"/>
        <circle cx="20" cy="25" r="2" fill={color}/>
        <line x1="20" y1="25" x2="20" y2="29" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-04 SESMT ─── */
function NR04({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <path d="M 10 8 L 10 18 a 6 6 0 0 0 12 0 L 22 8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="16" y1="24" x2="16" y2="30" stroke={color} strokeWidth="2"/>
        <circle cx="28" cy="26" r="4" fill={`${color}33`} stroke={color} strokeWidth="2" className="nrA-stetho-tip"/>
        <path d="M 16 30 Q 16 32 18 32 Q 24 32 24 26" stroke={color} strokeWidth="2" fill="none"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-05 CIPA ─── */
function NR05({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-cipa-1"><circle cx="10" cy="14" r="3" fill={color}/><rect x="7" y="19" width="6" height="9" rx="1" fill={`${color}55`}/></g>
        <g className="nrA-cipa-2"><circle cx="20" cy="12" r="3.5" fill={color}/><rect x="16" y="17" width="8" height="11" rx="1" fill={`${color}55`}/></g>
        <g className="nrA-cipa-3"><circle cx="30" cy="14" r="3" fill={color}/><rect x="27" y="19" width="6" height="9" rx="1" fill={`${color}55`}/></g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-06 EPI capacete + spark ─── */
function NR06({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-helmet">
          <path d="M 8 22 Q 8 12 18 12 Q 28 12 28 22" fill={`${color}33`} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
          <rect x="6" y="22" width="24" height="3" rx="0.5" fill={color}/>
        </g>
        <line x1="18" y1="12" x2="18" y2="22" stroke={color} strokeWidth="1.2" strokeOpacity="0.6"/>
        <circle cx="33" cy="15" r="1.5" fill={color} className="nrA-spark"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-07 PCMSO cruz pulsando ─── */
function NR07({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <circle cx="20" cy="20" r="14" fill={`${color}1A`} stroke={color} strokeWidth="2"/>
        <g className="nrA-cross">
          <rect x="17" y="11" width="6" height="18" rx="1" fill={color}/>
          <rect x="11" y="17" width="18" height="6" rx="1" fill={color}/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-08 predio janelas ─── */
function NR08({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <rect x="10" y="8" width="20" height="28" rx="1" fill={`${color}22`} stroke={color} strokeWidth="2"/>
        <rect x="13" y="12" width="4" height="4" fill={color} className="nrA-window-1"/>
        <rect x="19" y="12" width="4" height="4" fill={color} className="nrA-window-2"/>
        <rect x="13" y="20" width="4" height="4" fill={color} className="nrA-window-3"/>
        <rect x="19" y="20" width="4" height="4" fill={color} className="nrA-window-4"/>
        <rect x="13" y="28" width="10" height="6" fill={color}/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-09 gota caindo ─── */
function NR09({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <path d="M 10 10 L 10 20 L 30 20 L 30 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="6" y1="10" x2="34" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <g className="nrA-drop">
          <path d="M 20 22 C 18 24 18 26 20 26 C 22 26 22 24 20 22 Z" fill={color}/>
        </g>
        <path d="M 17 32 C 17 36 23 36 23 32" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-10 raio ─── */
function NR10({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <path d="M 22 6 L 12 22 L 19 22 L 16 34 L 28 16 L 21 16 L 24 6 Z" fill={color} className="nrA-lightning" style={{ color }}/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-11 caixa subindo ─── */
function NR11({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2"/>
        <g className="nrA-box">
          <rect x="13" y="14" width="14" height="14" rx="1" fill={`${color}33`} stroke={color} strokeWidth="2"/>
          <line x1="13" y1="21" x2="27" y2="21" stroke={color} strokeWidth="1.5"/>
          <line x1="20" y1="14" x2="20" y2="28" stroke={color} strokeWidth="1.5"/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-12 engrenagem girando ─── */
function NR12({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-gear">
          <circle cx="20" cy="20" r="6" fill={`${color}33`} stroke={color} strokeWidth="2"/>
          <circle cx="20" cy="20" r="2" fill={color}/>
          <rect x="18.5" y="6" width="3" height="5" fill={color}/>
          <rect x="18.5" y="29" width="3" height="5" fill={color}/>
          <rect x="6" y="18.5" width="5" height="3" fill={color}/>
          <rect x="29" y="18.5" width="5" height="3" fill={color}/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-13 caldeira vapor ─── */
function NR13({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <ellipse cx="20" cy="26" rx="12" ry="8" fill={`${color}22`} stroke={color} strokeWidth="2"/>
        <line x1="18" y1="18" x2="18" y2="14" stroke={color} strokeWidth="2"/>
        <line x1="22" y1="18" x2="22" y2="14" stroke={color} strokeWidth="2"/>
        <circle cx="14" cy="26" r="1.5" fill={color}/>
        <circle cx="20" cy="26" r="1.5" fill={color}/>
        <circle cx="26" cy="26" r="1.5" fill={color}/>
        <circle cx="18" cy="12" r="2" fill={`${color}88`} className="nrA-steam-1"/>
        <circle cx="22" cy="12" r="2" fill={`${color}88`} className="nrA-steam-2"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-14 forno chama ─── */
function NR14({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <rect x="8" y="22" width="24" height="14" rx="1" fill={`${color}1A`} stroke={color} strokeWidth="2"/>
        <line x1="14" y1="32" x2="26" y2="32" stroke={color} strokeWidth="1.5"/>
        <g className="nrA-flame">
          <path d="M 16 28 Q 16 22 20 18 Q 24 22 24 28 Q 22 30 20 30 Q 18 30 16 28 Z" fill={color} fillOpacity="0.7"/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-15 trefoil insalubridade ─── */
function NR15({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <circle cx="20" cy="20" r="14" fill={`${color}1A`} stroke={color} strokeWidth="2"/>
        <g className="nrA-trefoil">
          <circle cx="20" cy="20" r="3" fill={color}/>
          <path d="M 20 8 a 6 6 0 0 1 5.2 9 L 20 20 Z" fill={color}/>
          <path d="M 20 8 a 6 6 0 0 1 5.2 9 L 20 20 Z" fill={color} transform="rotate(120 20 20)"/>
          <path d="M 20 8 a 6 6 0 0 1 5.2 9 L 20 20 Z" fill={color} transform="rotate(240 20 20)"/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-16 explosao ─── */
function NR16({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-explosion">
          <polygon points="20,4 24,14 34,12 27,20 34,28 24,26 20,36 16,26 6,28 13,20 6,12 16,14" fill={`${color}55`} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        </g>
        <text x="20" y="24" fontSize="10" fontWeight="900" textAnchor="middle" fill={color}>!</text>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-17 ergonomia ─── */
function NR17({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-sitting">
          <circle cx="20" cy="10" r="3" fill={color}/>
          <line x1="20" y1="13" x2="20" y2="22" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="20" y1="17" x2="14" y2="20" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="20" y1="22" x2="26" y2="22" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="26" y1="22" x2="26" y2="28" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        </g>
        <line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2"/>
        <rect x="22" y="28" width="10" height="6" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-18 andaime ─── */
function NR18({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <line x1="8" y1="36" x2="32" y2="36" stroke={color} strokeWidth="2"/>
        <line x1="10" y1="36" x2="10" y2="8" stroke={color} strokeWidth="2"/>
        <line x1="30" y1="36" x2="30" y2="8" stroke={color} strokeWidth="2"/>
        <line x1="10" y1="14" x2="30" y2="14" stroke={color} strokeWidth="2" className="nrA-scaffold-line"/>
        <line x1="10" y1="22" x2="30" y2="22" stroke={color} strokeWidth="2" className="nrA-scaffold-line" style={{ animationDelay: '0.4s' }}/>
        <line x1="10" y1="30" x2="30" y2="30" stroke={color} strokeWidth="2"/>
        <rect x="14" y="8" width="12" height="6" fill={color}/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-19 explosivo pavio ─── */
function NR19({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <circle cx="22" cy="22" r="11" fill={`${color}33`} stroke={color} strokeWidth="2.2"/>
        <line x1="22" y1="11" x2="14" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <g className="nrA-fuse">
          <circle cx="11" cy="13" r="2.5" fill={color}/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-20 inflamavel chama ─── */
function NR20({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-fire">
          <path d="M 14 32 Q 14 22 20 18 Q 22 14 20 8 Q 28 12 28 22 Q 28 30 26 32 Q 24 34 20 34 Q 16 34 14 32 Z" fill={color} fillOpacity="0.6" stroke={color} strokeWidth="1.5"/>
          <path d="M 18 30 Q 18 24 22 22 Q 24 26 24 30 Z" fill={color}/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-21 sol ─── */
function NR21({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-sun-rays">
          <line x1="20" y1="4" x2="20" y2="9" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="20" y1="31" x2="20" y2="36" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="4" y1="20" x2="9" y2="20" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="31" y1="20" x2="36" y2="20" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="8" y1="8" x2="11" y2="11" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="29" y1="29" x2="32" y2="32" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="8" y1="32" x2="11" y2="29" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="29" y1="11" x2="32" y2="8" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        </g>
        <circle cx="20" cy="20" r="6" fill={color} className="nrA-sun-core"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-22 pa mineracao ─── */
function NR22({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-shovel">
          <line x1="24" y1="28" x2="10" y2="14" stroke={color} strokeWidth="3" strokeLinecap="round"/>
          <path d="M 6 14 L 14 6 L 18 10 L 10 18 Z" fill={color}/>
        </g>
        <line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2"/>
        <circle cx="28" cy="32" r="1.5" fill={color}/>
        <circle cx="22" cy="33" r="1" fill={color}/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-23 incendio extintor ─── */
function NR23({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <rect x="20" y="14" width="10" height="20" rx="2" fill={`${color}33`} stroke={color} strokeWidth="2"/>
        <rect x="22" y="10" width="6" height="4" rx="0.5" fill={color}/>
        <line x1="20" y1="20" x2="14" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="14" r="1" fill={color} className="nrA-jet-1"/>
        <circle cx="9" cy="15" r="0.8" fill={color} className="nrA-jet-2"/>
        <circle cx="6" cy="16" r="0.6" fill={color} className="nrA-jet-3"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-24 torneira ─── */
function NR24({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <rect x="8" y="8" width="6" height="14" rx="1" fill={color}/>
        <rect x="14" y="14" width="14" height="3" fill={color}/>
        <rect x="26" y="17" width="3" height="6" fill={color}/>
        <ellipse cx="27.5" cy="34" rx="6" ry="2" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="27.5" cy="25" r="1.8" fill={color} className="nrA-faucet-drop"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-25 lixeira ─── */
function NR25({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-trash">
          <rect x="11" y="12" width="18" height="2" rx="0.5" fill={color}/>
          <line x1="14" y1="9" x2="26" y2="9" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M 12 14 L 14 32 L 26 32 L 28 14 Z" fill={`${color}22`} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
          <line x1="17" y1="18" x2="17" y2="28" stroke={color} strokeWidth="1.5"/>
          <line x1="20" y1="18" x2="20" y2="28" stroke={color} strokeWidth="1.5"/>
          <line x1="23" y1="18" x2="23" y2="28" stroke={color} strokeWidth="1.5"/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-26 triangulo alerta ─── */
function NR26({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <path d="M 20 6 L 36 32 L 4 32 Z" fill={`${color}33`} stroke={color} strokeWidth="2.2" strokeLinejoin="round" className="nrA-alert"/>
        <rect x="18.5" y="14" width="3" height="10" fill={color}/>
        <circle cx="20" cy="28" r="1.5" fill={color}/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-28 balanca ─── */
function NR28({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <line x1="20" y1="14" x2="20" y2="32" stroke={color} strokeWidth="2.2"/>
        <rect x="14" y="32" width="12" height="2" fill={color}/>
        <g className="nrA-scale">
          <line x1="6" y1="14" x2="34" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M 6 14 L 4 22 L 12 22 L 10 14 Z" fill={`${color}33`} stroke={color} strokeWidth="1.8"/>
          <path d="M 34 14 L 30 22 L 36 22 L 36 14 Z" fill={`${color}33`} stroke={color} strokeWidth="1.8"/>
        </g>
        <circle cx="20" cy="14" r="2" fill={color}/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-29 conteiner ─── */
function NR29({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <line x1="6" y1="6" x2="34" y2="6" stroke={color} strokeWidth="2"/>
        <line x1="20" y1="6" x2="20" y2="14" stroke={color} strokeWidth="1.5"/>
        <g className="nrA-container">
          <rect x="10" y="14" width="20" height="14" rx="1" fill={`${color}22`} stroke={color} strokeWidth="2"/>
          <line x1="14" y1="14" x2="14" y2="28" stroke={color} strokeWidth="1.5"/>
          <line x1="20" y1="14" x2="20" y2="28" stroke={color} strokeWidth="1.5"/>
          <line x1="26" y1="14" x2="26" y2="28" stroke={color} strokeWidth="1.5"/>
        </g>
        <line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-30 ondas ─── */
function NR30({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <path d="M 0 18 Q 8 12 16 18 T 32 18 T 48 18" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" className="nrA-wave-1"/>
        <path d="M 0 26 Q 8 20 16 26 T 32 26 T 48 26" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" className="nrA-wave-2"/>
        <path d="M 0 32 Q 8 26 16 32 T 32 32 T 48 32" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" className="nrA-wave-3"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-31 trator ─── */
function NR31({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <rect x="14" y="12" width="14" height="10" rx="1" fill={`${color}33`} stroke={color} strokeWidth="2"/>
        <line x1="6" y1="22" x2="32" y2="22" stroke={color} strokeWidth="2"/>
        <g className="nrA-wheel-tractor-l">
          <circle cx="12" cy="28" r="6" fill="none" stroke={color} strokeWidth="2.2"/>
          <line x1="12" y1="22" x2="12" y2="34" stroke={color} strokeWidth="1.5"/>
          <line x1="6" y1="28" x2="18" y2="28" stroke={color} strokeWidth="1.5"/>
        </g>
        <g className="nrA-wheel-tractor-r">
          <circle cx="28" cy="28" r="4" fill="none" stroke={color} strokeWidth="2.2"/>
          <line x1="28" y1="24" x2="28" y2="32" stroke={color} strokeWidth="1.5"/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-32 saude ─── */
function NR32({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <rect x="6" y="14" width="28" height="14" rx="1" fill={`${color}1A`} stroke={color} strokeWidth="2"/>
        <rect x="18" y="10" width="4" height="10" fill={color}/>
        <rect x="14" y="14" width="12" height="4" fill={color}/>
        <path d="M 6 22 L 12 22 L 14 18 L 18 26 L 22 22 L 34 22" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" className="nrA-cross"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-33 espaco confinado ─── */
function NR33({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <rect x="6" y="6" width="28" height="28" fill={`${color}11`} stroke={color} strokeWidth="2"/>
        <rect x="16" y="14" width="8" height="20" fill={`${color}55`} stroke={color} strokeWidth="2" className="nrA-door"/>
        <circle cx="22" cy="24" r="0.8" fill={color}/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-34 naval ─── */
function NR34({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-boat">
          <path d="M 6 22 L 34 22 L 30 32 L 10 32 Z" fill={`${color}33`} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
          <line x1="20" y1="22" x2="20" y2="6" stroke={color} strokeWidth="2"/>
          <path d="M 20 8 L 28 14 L 20 18 Z" fill={color}/>
        </g>
        <line x1="4" y1="34" x2="36" y2="34" stroke={color} strokeWidth="1.5" strokeOpacity="0.6"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-35 figura suspensa ─── */
function NR35({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <line x1="20" y1="4" x2="20" y2="34" stroke={color} strokeWidth="1.5" strokeDasharray="3 3"/>
        <line x1="6" y1="4" x2="34" y2="4" stroke={color} strokeWidth="2.2"/>
        <g className="nrA-climber">
          <circle cx="20" cy="14" r="3" fill={color}/>
          <line x1="20" y1="17" x2="20" y2="24" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="20" y1="20" x2="14" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <line x1="20" y1="20" x2="26" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <line x1="20" y1="24" x2="16" y2="30" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="20" y1="24" x2="24" y2="30" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-36 frigorifico faca ─── */
function NR36({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <g className="nrA-knife">
          <rect x="18" y="6" width="4" height="6" rx="0.5" fill={color}/>
          <path d="M 22 12 L 26 28 L 18 30 L 18 12 Z" fill={`${color}55`} stroke={color} strokeWidth="2"/>
        </g>
        <path d="M 8 34 Q 8 30 12 30 L 28 30 Q 32 30 32 34" stroke={color} strokeWidth="2" fill="none"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-37 petroleo torre ─── */
function NR37({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <line x1="14" y1="34" x2="20" y2="14" stroke={color} strokeWidth="2"/>
        <line x1="26" y1="34" x2="20" y2="14" stroke={color} strokeWidth="2"/>
        <line x1="16" y1="26" x2="24" y2="26" stroke={color} strokeWidth="1.8"/>
        <line x1="17" y1="22" x2="23" y2="22" stroke={color} strokeWidth="1.8"/>
        <line x1="18" y1="18" x2="22" y2="18" stroke={color} strokeWidth="1.8"/>
        <g className="nrA-flame-top">
          <path d="M 17 12 Q 17 6 20 4 Q 23 6 23 12 Z" fill={color} fillOpacity="0.7"/>
        </g>
        <line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2"/>
      </SVG>
    </CSSWrap>
  )
}

/* ─── NR-38 caminhao limpeza ─── */
function NR38({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <rect x="6" y="16" width="22" height="12" fill={`${color}33`} stroke={color} strokeWidth="2"/>
        <rect x="22" y="20" width="10" height="8" fill={`${color}55`} stroke={color} strokeWidth="2"/>
        <line x1="6" y1="32" x2="34" y2="32" stroke={color} strokeWidth="1.5" strokeOpacity="0.6"/>
        <g className="nrA-wheel-l">
          <circle cx="12" cy="30" r="3" fill="none" stroke={color} strokeWidth="2"/>
          <line x1="9" y1="30" x2="15" y2="30" stroke={color} strokeWidth="1.2"/>
        </g>
        <g className="nrA-wheel-r">
          <circle cx="28" cy="30" r="3" fill="none" stroke={color} strokeWidth="2"/>
          <line x1="25" y1="30" x2="31" y2="30" stroke={color} strokeWidth="1.2"/>
        </g>
      </SVG>
    </CSSWrap>
  )
}

/* ─── Generic fallback ─── */
function Generic({ color, size }: P) {
  return (
    <CSSWrap>
      <SVG size={size}>
        <circle cx="20" cy="20" r="14" fill={`${color}22`} stroke={color} strokeWidth="2" className="nrA-cross"/>
        <text x="20" y="25" textAnchor="middle" fill={color} fontSize="14" fontWeight="700">NR</text>
      </SVG>
    </CSSWrap>
  )
}

'use client'

import React from 'react'

/**
 * EpiIcons — ícones de EPI com aparência realista.
 *
 * DNA: equipamento de segurança REAL, não pictograma editorial.
 *  - Paleta fiel ao material (amarelo ABS do capacete, laranja alta-visibilidade,
 *    couro marrom, plástico vermelho do extintor, prata reflexiva…).
 *  - Detalhes característicos — tarjas 3M, fivelas, solado com relevo, visor
 *    em policarbonato, filtros laterais, válvulas, parafusos.
 *  - Silhueta reconhecível a 20px (mobile) e nítida a 32–40px.
 *
 * API mantida (`type`, `color`, `size`). O prop `color` serve apenas como
 * realce de contorno — o estado active/inactive é controlado pelo container
 * (botão) via opacity/border/glow.
 */

export type EpiType =
  | 'none' | 'helmet' | 'gloves' | 'boots' | 'harness' | 'mask'
  | 'goggles' | 'earProtection' | 'apron' | 'extinguisher' | 'lockout'
  | 'gasDetector' | 'lifeVest' | 'signaling' | 'firstAid'
  | 'ergonomicChair' | 'lighting' | 'breaks' | 'periodicExam'
  | 'wristSupport' | 'monitorStand'

export const EPI_LABELS: Record<EpiType, string> = {
  none: 'Nenhum', helmet: 'Capacete', gloves: 'Luvas', boots: 'Botas',
  harness: 'Arnês', mask: 'Máscara', goggles: 'Óculos',
  earProtection: 'Protetor', apron: 'Avental', extinguisher: 'Extintor',
  lockout: 'Bloqueio', gasDetector: 'Detector', lifeVest: 'Colete',
  signaling: 'Sinalização', firstAid: 'Primeiros S.',
  ergonomicChair: 'Cadeira', lighting: 'Iluminação', breaks: 'Pausas',
  periodicExam: 'Exame', wristSupport: 'Punho', monitorStand: 'Monitor',
}

/* ───── paleta realista ───── */
const P = {
  helmetYellow: '#fbbf24', helmetYellowDark: '#b45309',
  helmetStrap: '#1f2937',
  gloveOrange: '#ea580c', gloveCuff: '#431407',
  gloveStitch: '#fde68a',
  bootBlack: '#111827', bootSteel: '#cbd5e1', bootStitch: '#fbbf24',
  harnessOrange: '#f97316', harnessBuckle: '#0f172a', harnessDring: '#94a3b8',
  maskWhite: '#f3f4f6', maskShadow: '#cbd5e1', maskStrap: '#64748b', maskValve: '#475569',
  gogglesFrame: '#1f2937', gogglesLens: '#67e8f9', gogglesLensShade: '#0891b2',
  muffCupRed: '#dc2626', muffCupShade: '#7f1d1d', muffBand: '#1f2937', muffFoam: '#fbbf24',
  apronLeather: '#78350f', apronLeatherDark: '#431407', apronStrap: '#d97706', apronStitch: '#fbbf24',
  extBody: '#dc2626', extBodyShade: '#7f1d1d', extValve: '#1f2937', extGauge: '#f8fafc',
  lockBody: '#dc2626', lockShade: '#7f1d1d', lockShackle: '#94a3b8', lockKey: '#0f172a',
  detBody: '#fbbf24', detScreen: '#0f172a', detLed: '#22c55e', detClip: '#1f2937',
  vestOrange: '#f97316', vestShade: '#c2410c', vestTape: '#e2e8f0', vestStrap: '#1f2937',
  coneOrange: '#f97316', coneShade: '#c2410c', coneTape: '#f8fafc', coneBase: '#1f2937',
  aidBox: '#f8fafc', aidShade: '#cbd5e1', aidCross: '#dc2626', aidHandle: '#475569',
  chairMesh: '#1e293b', chairSeat: '#0f172a', chairBase: '#94a3b8', chairAccent: '#475569',
  bulbGlass: '#fef3c7', bulbGlow: '#fde047', bulbBase: '#94a3b8', bulbThread: '#64748b',
  mugBody: '#f3f4f6', mugRim: '#cbd5e1', mugCoffee: '#78350f', mugSteam: '#94a3b8',
  stethoTube: '#dc2626', stethoChest: '#cbd5e1', stethoEar: '#0f172a',
  wristBlack: '#111827', wristStrap: '#1e293b', wristVelcro: '#374151', wristAccent: '#64748b',
  monScreen: '#0f172a', monBezel: '#1f2937', monStand: '#94a3b8', monBase: '#64748b',
  noneSkin: '#94a3b8', noneX: '#ef4444',
}

interface IconProps { color: string; size?: number }

export function EpiIcon({ type, color, size = 24 }: IconProps & { type: EpiType }) {
  const map: Record<EpiType, (p: IconProps) => React.ReactElement> = {
    none: NoneIcon,
    helmet: HelmetIcon,
    gloves: GlovesIcon,
    boots: BootsIcon,
    harness: HarnessIcon,
    mask: MaskIcon,
    goggles: GogglesIcon,
    earProtection: EarMuffIcon,
    apron: ApronIcon,
    extinguisher: ExtinguisherIcon,
    lockout: LockoutIcon,
    gasDetector: GasDetectorIcon,
    lifeVest: LifeVestIcon,
    signaling: SignalingIcon,
    firstAid: FirstAidIcon,
    ergonomicChair: ChairIcon,
    lighting: LightIcon,
    breaks: BreaksIcon,
    periodicExam: ExamIcon,
    wristSupport: WristIcon,
    monitorStand: MonitorIcon,
  }
  const C = map[type] || NoneIcon
  return <C color={color} size={size} />
}

/* ───── SVG wrapper ───── */
const V = ({ s, children }: { s: number; children: React.ReactNode }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
)

/* ═══════════════════════════ ÍCONES ═══════════════════════════ */

function NoneIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <circle cx="12" cy="8" r="3.2" fill={P.noneSkin}/>
    <path d="M6.5 21v-3c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5v3" fill={P.noneSkin} stroke={color} strokeWidth="0.6"/>
    <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" stroke={P.noneX} strokeWidth="3"/>
    <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" stroke="#fff" strokeWidth="1" opacity="0.6"/>
  </V>
}

function HelmetIcon({ color, size = 24 }: IconProps) {
  // Capacete ABS amarelo — cúpula + aba + aeração
  return <V s={size}>
    {/* aba frontal (shadow below dome) */}
    <path d="M3 15.5h18l-1 2.5H4l-1-2.5z" fill={P.helmetYellowDark}/>
    {/* cúpula principal */}
    <path d="M5 15.5c0-4 3-7.5 7-7.5s7 3.5 7 7.5z" fill={P.helmetYellow} stroke={P.helmetYellowDark} strokeWidth="0.6"/>
    {/* crista central (ventilação) */}
    <path d="M12 8v7.5" stroke={P.helmetYellowDark} strokeWidth="0.7" opacity="0.6"/>
    {/* nervuras laterais */}
    <path d="M8 11c.5 1 .7 3 .7 4.5M16 11c-.5 1-.7 3-.7 4.5" stroke={P.helmetYellowDark} strokeWidth="0.5" opacity="0.5"/>
    {/* reflexo topo */}
    <ellipse cx="10.5" cy="10.5" rx="2.5" ry="1.2" fill="#fef3c7" opacity="0.5"/>
    {/* fita da cabeça */}
    <path d="M5 15.5h14" stroke={P.helmetStrap} strokeWidth="0.8"/>
    {/* accent glow do color */}
    <path d="M5 15.5c0-4 3-7.5 7-7.5s7 3.5 7 7.5" fill="none" stroke={color} strokeWidth="0.4" opacity="0.5"/>
  </V>
}

function GlovesIcon({ color, size = 24 }: IconProps) {
  // Luva industrial couro/laranja com punho e reforço na palma
  return <V s={size}>
    {/* punho (cuff) */}
    <path d="M7 20h10v2.5c0 .3-.2.5-.5.5h-9c-.3 0-.5-.2-.5-.5V20z" fill={P.gloveCuff}/>
    <rect x="7" y="19.5" width="10" height="1.2" fill={P.gloveStitch} opacity="0.7"/>
    {/* palma + mão */}
    <path d="M8 20v-9c0-.5.4-1 1-1h.3c.5 0 1 .4 1 1v3"
      fill={P.gloveOrange} stroke={P.gloveCuff} strokeWidth="0.6"/>
    <path d="M10.3 10v-4c0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3v4.5" fill={P.gloveOrange} stroke={P.gloveCuff} strokeWidth="0.6"/>
    <path d="M12.9 5.8c0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3v5.2" fill={P.gloveOrange} stroke={P.gloveCuff} strokeWidth="0.6"/>
    <path d="M15.5 7.5c0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3v6" fill={P.gloveOrange} stroke={P.gloveCuff} strokeWidth="0.6"/>
    {/* corpo da palma */}
    <path d="M8 11c0-.6.5-1 1-1h9c.5 0 1 .4 1 1v9H8v-9z" fill={P.gloveOrange} stroke={P.gloveCuff} strokeWidth="0.7"/>
    {/* reforço da palma (darker patch) */}
    <path d="M10 13h7v5h-7z" fill={P.gloveCuff} opacity="0.22"/>
    {/* costura */}
    <path d="M10 13h7M10 18h7" stroke={P.gloveStitch} strokeWidth="0.35" strokeDasharray="0.6 0.5" opacity="0.8"/>
    {/* polegar */}
    <path d="M8 14c-1 .3-2 1-2.3 2-.3.9.2 1.8 1.2 2l1.1.2" fill={P.gloveOrange} stroke={P.gloveCuff} strokeWidth="0.6"/>
    <path d="M7.5 17.5l.5.3" stroke={color} strokeWidth="0.4" opacity="0"/>
  </V>
}

function BootsIcon({ color, size = 24 }: IconProps) {
  // Bota cano médio couro preto, biqueira de aço, solado com relevo, amarração
  return <V s={size}>
    {/* cano */}
    <path d="M8 3.5h4c.5 0 1 .3 1 .8v6H7V4.3c0-.5.4-.8 1-.8z" fill={P.bootBlack}/>
    {/* corpo + peito do pé */}
    <path d="M7 9.5v7H5.2c-.6 0-1 .4-1 1V19c0 .5.4 1 1 1H19c.5 0 1-.5 1-1v-1.5c0-.6-.4-1-1-1H17v-4c0-2.5-1.5-4-4-4H7z"
      fill={P.bootBlack} stroke="#000" strokeWidth="0.4"/>
    {/* biqueira de aço (highlight) */}
    <path d="M17 13c.5-1.7 1.2-2.5 2.5-2.5" stroke={P.bootSteel} strokeWidth="0.7" opacity="0.8"/>
    <ellipse cx="18.8" cy="14" rx="1.2" ry="1" fill={P.bootSteel} opacity="0.3"/>
    {/* cadarços */}
    <path d="M8.5 5h3.5M8.5 6.5h3.5M8.5 8h3.5M8 10h4" stroke={P.bootStitch} strokeWidth="0.4" opacity="0.85"/>
    {/* ilhoses */}
    <circle cx="8.5" cy="5" r=".35" fill={P.bootSteel}/>
    <circle cx="12" cy="5" r=".35" fill={P.bootSteel}/>
    <circle cx="8.5" cy="6.5" r=".35" fill={P.bootSteel}/>
    <circle cx="12" cy="6.5" r=".35" fill={P.bootSteel}/>
    <circle cx="8.5" cy="8" r=".35" fill={P.bootSteel}/>
    <circle cx="12" cy="8" r=".35" fill={P.bootSteel}/>
    {/* solado */}
    <rect x="4.2" y="18.5" width="15.6" height="1.5" fill="#000"/>
    <path d="M5 19.7L5 20M6.2 19.7L6.2 20M7.4 19.7L7.4 20M8.6 19.7L8.6 20M9.8 19.7L9.8 20M11 19.7L11 20M12.2 19.7L12.2 20M13.4 19.7L13.4 20M14.6 19.7L14.6 20M15.8 19.7L15.8 20M17 19.7L17 20M18.2 19.7L18.2 20"
      stroke={P.bootSteel} strokeWidth="0.25" opacity="0.3"/>
    {/* tarja accent */}
    <rect x="7" y="15.5" width="10" height="0.5" fill={color} opacity="0.6"/>
  </V>
}

function HarnessIcon({ color, size = 24 }: IconProps) {
  // Arnês paraquedista — fita laranja, fivelas metálicas, D-ring dorsal
  return <V s={size}>
    {/* cabeça/torso silhueta (sombra) */}
    <circle cx="12" cy="4" r="1.8" fill="#334155" opacity="0.45"/>
    <path d="M8 6.5l4 3.5 4-3.5" stroke="#334155" strokeWidth="0.6" opacity="0.35"/>
    {/* alça Y do peito */}
    <path d="M8 7L11.5 11.5M16 7L12.5 11.5" stroke={P.harnessOrange} strokeWidth="2.2" strokeLinecap="square"/>
    <path d="M8 7L11.5 11.5M16 7L12.5 11.5" stroke={P.harnessBuckle} strokeWidth="0.4" opacity="0.4"/>
    {/* faixa peitoral horizontal */}
    <rect x="6" y="11" width="12" height="2.4" fill={P.harnessOrange} stroke={P.harnessBuckle} strokeWidth="0.4"/>
    <line x1="6" y1="13.4" x2="18" y2="13.4" stroke={P.harnessBuckle} strokeWidth="0.3" opacity="0.5"/>
    {/* D-ring central */}
    <rect x="10.5" y="10.5" width="3" height="3" rx="0.4" fill={P.harnessDring} stroke={P.harnessBuckle} strokeWidth="0.5"/>
    <rect x="11.2" y="11.2" width="1.6" height="1.6" fill={P.harnessBuckle}/>
    {/* alças perna */}
    <rect x="8" y="13.4" width="2.2" height="6" fill={P.harnessOrange} stroke={P.harnessBuckle} strokeWidth="0.4"/>
    <rect x="13.8" y="13.4" width="2.2" height="6" fill={P.harnessOrange} stroke={P.harnessBuckle} strokeWidth="0.4"/>
    {/* fivelas */}
    <rect x="7.6" y="16" width="3" height="1.3" rx="0.2" fill={P.harnessBuckle}/>
    <rect x="13.4" y="16" width="3" height="1.3" rx="0.2" fill={P.harnessBuckle}/>
    {/* accent */}
    <rect x="6" y="11" width="12" height="0.3" fill={color} opacity="0.6"/>
  </V>
}

function MaskIcon({ color, size = 24 }: IconProps) {
  // Respirador semi-facial PFF2 — cup branca, 2 filtros laterais, válvula central
  return <V s={size}>
    {/* tiras */}
    <path d="M3 8l2.5 1.5M3 15l2.5-1.5M21 8l-2.5 1.5M21 15l-2.5-1.5" stroke={P.maskStrap} strokeWidth="1.2" strokeLinecap="round"/>
    {/* cup principal */}
    <path d="M5 11c0-1.8 3-4 7-4s7 2.2 7 4v2.5c0 3.5-3 6-7 6s-7-2.5-7-6V11z"
      fill={P.maskWhite} stroke={P.maskShadow} strokeWidth="0.6"/>
    {/* linha divisória vertical */}
    <path d="M12 7v12" stroke={P.maskShadow} strokeWidth="0.4" opacity="0.6"/>
    {/* filtros laterais */}
    <rect x="1.5" y="10" width="3.5" height="5" rx="0.8" fill={P.maskValve} stroke={P.maskStrap} strokeWidth="0.4"/>
    <rect x="19" y="10" width="3.5" height="5" rx="0.8" fill={P.maskValve} stroke={P.maskStrap} strokeWidth="0.4"/>
    {/* grelhas filtro */}
    <line x1="2.2" y1="11.5" x2="4.3" y2="11.5" stroke="#94a3b8" strokeWidth="0.3"/>
    <line x1="2.2" y1="12.5" x2="4.3" y2="12.5" stroke="#94a3b8" strokeWidth="0.3"/>
    <line x1="2.2" y1="13.5" x2="4.3" y2="13.5" stroke="#94a3b8" strokeWidth="0.3"/>
    <line x1="19.7" y1="11.5" x2="21.8" y2="11.5" stroke="#94a3b8" strokeWidth="0.3"/>
    <line x1="19.7" y1="12.5" x2="21.8" y2="12.5" stroke="#94a3b8" strokeWidth="0.3"/>
    <line x1="19.7" y1="13.5" x2="21.8" y2="13.5" stroke="#94a3b8" strokeWidth="0.3"/>
    {/* válvula central exala */}
    <circle cx="12" cy="15" r="1.8" fill={P.maskValve}/>
    <circle cx="12" cy="15" r="1" fill="#1f2937"/>
    <circle cx="12" cy="14.6" r=".35" fill="#475569"/>
    {/* accent */}
    <path d="M5 11c0-1.8 3-4 7-4s7 2.2 7 4" fill="none" stroke={color} strokeWidth="0.5" opacity="0.55"/>
  </V>
}

function GogglesIcon({ color, size = 24 }: IconProps) {
  // Óculos de segurança wrap-around — armação grafite, lente policarbonato
  return <V s={size}>
    {/* cinta atrás */}
    <path d="M1 12h3M20 12h3" stroke={P.gogglesFrame} strokeWidth="1.5"/>
    {/* aro esquerdo */}
    <rect x="2.5" y="8" width="8" height="7.5" rx="2.8" fill={P.gogglesLensShade} stroke={P.gogglesFrame} strokeWidth="1"/>
    <rect x="3.3" y="8.8" width="6.4" height="5.9" rx="2" fill={P.gogglesLens} opacity="0.75"/>
    {/* reflexo */}
    <path d="M4 9.5l3 1" stroke="#fff" strokeWidth="0.7" opacity="0.8"/>
    {/* aro direito */}
    <rect x="13.5" y="8" width="8" height="7.5" rx="2.8" fill={P.gogglesLensShade} stroke={P.gogglesFrame} strokeWidth="1"/>
    <rect x="14.3" y="8.8" width="6.4" height="5.9" rx="2" fill={P.gogglesLens} opacity="0.75"/>
    <path d="M15 9.5l3 1" stroke="#fff" strokeWidth="0.7" opacity="0.8"/>
    {/* ponte nasal */}
    <path d="M10.5 11h3" stroke={P.gogglesFrame} strokeWidth="1.5"/>
    {/* accent */}
    <rect x="2.5" y="7.6" width="8" height="0.6" fill={color} opacity="0.55"/>
    <rect x="13.5" y="7.6" width="8" height="0.6" fill={color} opacity="0.55"/>
  </V>
}

function EarMuffIcon({ color, size = 24 }: IconProps) {
  // Protetor auricular over-ear — conchas vermelhas, arco preto, espuma
  return <V s={size}>
    {/* arco superior */}
    <path d="M5 13c0-5 3-9 7-9s7 4 7 9" fill="none" stroke={P.muffBand} strokeWidth="1.8"/>
    {/* arco sombra */}
    <path d="M5 13c0-4.5 3-8.5 7-8.5s7 4 7 8.5" fill="none" stroke={P.muffFoam} strokeWidth="0.4" opacity="0.6"/>
    {/* concha esquerda */}
    <path d="M2 13c0-1.5 1-2.5 2.5-2.5h1c.8 0 1.5.7 1.5 1.5v6c0 1-.7 1.5-1.5 1.5h-1C3 19.5 2 18.5 2 17v-4z"
      fill={P.muffCupRed} stroke={P.muffCupShade} strokeWidth="0.6"/>
    <ellipse cx="4.3" cy="15" rx="1.5" ry="2.5" fill={P.muffCupShade} opacity="0.5"/>
    {/* espuma interna esq */}
    <ellipse cx="5" cy="15" rx=".7" ry="1.7" fill={P.muffFoam} opacity="0.6"/>
    {/* concha direita */}
    <path d="M22 13c0-1.5-1-2.5-2.5-2.5h-1c-.8 0-1.5.7-1.5 1.5v6c0 1 .7 1.5 1.5 1.5h1c1.5 0 2.5-1 2.5-2.5v-4z"
      fill={P.muffCupRed} stroke={P.muffCupShade} strokeWidth="0.6"/>
    <ellipse cx="19.7" cy="15" rx="1.5" ry="2.5" fill={P.muffCupShade} opacity="0.5"/>
    <ellipse cx="19" cy="15" rx=".7" ry="1.7" fill={P.muffFoam} opacity="0.6"/>
    {/* accent contorno */}
    <path d="M5 13c0-5 3-9 7-9s7 4 7 9" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5"/>
  </V>
}

function ApronIcon({ color, size = 24 }: IconProps) {
  // Avental de couro — corpo trapezoidal, alça pescoço, laço cintura
  return <V s={size}>
    {/* alça pescoço */}
    <path d="M9 3c.5-1 5-1 5.5 0" fill="none" stroke={P.apronStrap} strokeWidth="1.4"/>
    {/* peito */}
    <path d="M8 4h8v3.5H8z" fill={P.apronLeatherDark}/>
    <path d="M8 4h8v.5H8z" fill={P.apronStrap}/>
    {/* saia */}
    <path d="M7 7.5h10l1.5 13.5c.1 1-.6 1.5-1.5 1.5h-10c-.9 0-1.6-.5-1.5-1.5L7 7.5z"
      fill={P.apronLeather} stroke={P.apronLeatherDark} strokeWidth="0.6"/>
    {/* laço cintura */}
    <path d="M5.5 11h13" stroke={P.apronStrap} strokeWidth="1.2"/>
    <path d="M4 12c.5-.5 1.5-1 2.5-1M20 12c-.5-.5-1.5-1-2.5-1" stroke={P.apronStrap} strokeWidth="1.2"/>
    {/* costura lateral */}
    <path d="M8 9v11M16 9v11" stroke={P.apronStitch} strokeWidth="0.35" strokeDasharray="0.8 0.7" opacity="0.6"/>
    {/* bolso */}
    <rect x="9" y="14" width="6" height="4" rx="0.4" fill={P.apronLeatherDark} stroke={P.apronStitch} strokeWidth="0.35" strokeDasharray="0.8 0.7"/>
    {/* accent */}
    <path d="M7 7.5h10" stroke={color} strokeWidth="0.5" opacity="0.6"/>
  </V>
}

function ExtinguisherIcon({ color, size = 24 }: IconProps) {
  // Extintor vermelho — cilindro, válvula preta, mangueira, manômetro
  return <V s={size}>
    {/* corpo cilíndrico */}
    <rect x="7" y="7.5" width="9" height="13.5" rx="1.8" fill={P.extBody} stroke={P.extBodyShade} strokeWidth="0.6"/>
    {/* sombra lateral */}
    <rect x="13.5" y="7.5" width="2.5" height="13.5" rx="1.8" fill={P.extBodyShade} opacity="0.45"/>
    {/* highlight */}
    <rect x="7.8" y="8" width="1.5" height="12" rx="0.6" fill="#fca5a5" opacity="0.5"/>
    {/* rótulo */}
    <rect x="8" y="12" width="7" height="4" rx="0.4" fill="#f8fafc" opacity="0.85"/>
    <rect x="8.5" y="13" width="6" height="0.6" fill={P.extBody}/>
    <line x1="9" y1="14.5" x2="14" y2="14.5" stroke={P.extBodyShade} strokeWidth="0.25"/>
    <line x1="9" y1="15.2" x2="13" y2="15.2" stroke={P.extBodyShade} strokeWidth="0.25"/>
    {/* válvula/alavanca topo */}
    <rect x="9.5" y="4.5" width="4" height="3" rx="0.5" fill={P.extValve}/>
    <path d="M13.5 5.5h3c.5 0 1 .4 1 1V8" stroke={P.extValve} strokeWidth="1.2"/>
    {/* manômetro */}
    <circle cx="17.5" cy="8.5" r="1.5" fill={P.extGauge} stroke={P.extValve} strokeWidth="0.5"/>
    <path d="M17.5 8.5l.8-.4" stroke={P.extBody} strokeWidth="0.6"/>
    {/* pino de segurança */}
    <rect x="10.2" y="3" width="2.6" height="1" rx="0.3" fill={P.extValve}/>
    {/* accent base */}
    <rect x="7" y="20.2" width="9" height="0.8" fill={color} opacity="0.7"/>
  </V>
}

function LockoutIcon({ color, size = 24 }: IconProps) {
  // Cadeado LOTO vermelho — corpo, shackle metálico
  return <V s={size}>
    {/* arco */}
    <path d="M8 11V7.5c0-2.2 1.8-4 4-4s4 1.8 4 4V11"
      stroke={P.lockShackle} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    {/* sombra arco */}
    <path d="M8.5 11V7.5c0-2 1.5-3.5 3.5-3.5" stroke="#475569" strokeWidth="0.4" opacity="0.7"/>
    {/* corpo */}
    <rect x="5.5" y="10.5" width="13" height="10" rx="1.6" fill={P.lockBody} stroke={P.lockShade} strokeWidth="0.6"/>
    {/* highlight */}
    <rect x="6" y="11" width="1.8" height="9" rx="0.5" fill="#fca5a5" opacity="0.55"/>
    {/* etiqueta branca */}
    <rect x="7" y="12.5" width="10" height="2.5" rx="0.3" fill="#f8fafc" opacity="0.9"/>
    <line x1="7.5" y1="13.2" x2="16.5" y2="13.2" stroke={P.lockKey} strokeWidth="0.3"/>
    <line x1="7.5" y1="14" x2="14" y2="14" stroke={P.lockKey} strokeWidth="0.3"/>
    {/* keyhole */}
    <circle cx="12" cy="18" r="1.2" fill={P.lockKey}/>
    <path d="M12 18l.6 1.7" stroke={P.lockKey} strokeWidth="0.8"/>
    {/* accent */}
    <rect x="5.5" y="10.5" width="13" height="0.5" fill={color} opacity="0.6"/>
  </V>
}

function GasDetectorIcon({ color, size = 24 }: IconProps) {
  // Detector de gases portátil — corpo amarelo, tela, LED, alto-falante
  return <V s={size}>
    {/* clipe superior */}
    <rect x="10" y="1.5" width="4" height="1.5" rx="0.3" fill={P.detClip}/>
    {/* corpo */}
    <rect x="6" y="3" width="12" height="18" rx="1.8" fill={P.detBody} stroke={P.detClip} strokeWidth="0.7"/>
    {/* borda superior (mais escura) */}
    <rect x="6" y="3" width="12" height="2.2" rx="1.8" fill={P.helmetYellowDark} opacity="0.6"/>
    {/* tela LCD */}
    <rect x="7.5" y="6" width="9" height="5" rx="0.4" fill={P.detScreen}/>
    <text x="8.5" y="9.3" fontSize="2.5" fill={P.detLed} fontFamily="monospace" fontWeight="700">O₂</text>
    <text x="12.8" y="9.3" fontSize="2.5" fill={P.detLed} fontFamily="monospace" fontWeight="700">20.9</text>
    {/* LED */}
    <circle cx="8.5" cy="13" r=".6" fill={P.detLed}/>
    <circle cx="8.5" cy="13" r="1.1" fill={P.detLed} opacity="0.3"/>
    {/* botões */}
    <rect x="10.5" y="12.5" width="5" height="1.2" rx="0.3" fill={P.detClip}/>
    <rect x="10.5" y="14.5" width="5" height="1.2" rx="0.3" fill={P.detClip}/>
    {/* grelha alto-falante */}
    <line x1="8" y1="17" x2="16" y2="17" stroke={P.detClip} strokeWidth="0.4"/>
    <line x1="8" y1="17.8" x2="16" y2="17.8" stroke={P.detClip} strokeWidth="0.4"/>
    <line x1="8" y1="18.6" x2="16" y2="18.6" stroke={P.detClip} strokeWidth="0.4"/>
    <line x1="8" y1="19.4" x2="16" y2="19.4" stroke={P.detClip} strokeWidth="0.4"/>
    {/* accent */}
    <rect x="6" y="3" width="12" height="0.5" fill={color} opacity="0.6"/>
  </V>
}

function LifeVestIcon({ color, size = 24 }: IconProps) {
  // Colete salva-vidas / alta-visibilidade — laranja + tarjas reflexivas + fivelas
  return <V s={size}>
    {/* corpo */}
    <path d="M6 7h12v13c0 1-.8 2-2 2H8c-1.2 0-2-1-2-2V7z"
      fill={P.vestOrange} stroke={P.vestShade} strokeWidth="0.6"/>
    {/* ombros */}
    <path d="M6 7c0-2 2-3.5 4-3.5h4c2 0 4 1.5 4 3.5" fill={P.vestOrange} stroke={P.vestShade} strokeWidth="0.6"/>
    {/* sombra lateral */}
    <path d="M15.5 7v15" stroke={P.vestShade} strokeWidth="0.5" opacity="0.55"/>
    {/* tarja reflexiva inferior */}
    <rect x="6" y="13" width="12" height="1.5" fill={P.vestTape}/>
    <rect x="6" y="14.5" width="12" height="0.4" fill={P.vestShade} opacity="0.6"/>
    {/* tarja reflexiva superior */}
    <rect x="6" y="17" width="12" height="1.5" fill={P.vestTape}/>
    <rect x="6" y="18.5" width="12" height="0.4" fill={P.vestShade} opacity="0.6"/>
    {/* zíper central */}
    <line x1="12" y1="7" x2="12" y2="22" stroke={P.vestStrap} strokeWidth="0.7"/>
    <line x1="12" y1="7" x2="12" y2="22" stroke={P.vestTape} strokeWidth="0.25" strokeDasharray="0.4 0.4" opacity="0.9"/>
    {/* fivelas */}
    <rect x="9" y="10.5" width="6" height="0.8" fill={P.vestStrap}/>
    {/* emblema */}
    <rect x="8" y="8.5" width="3.5" height="2" rx="0.2" fill={P.vestShade} opacity="0.6"/>
    {/* accent top */}
    <path d="M6 7c0-2 2-3.5 4-3.5h4c2 0 4 1.5 4 3.5" fill="none" stroke={color} strokeWidth="0.4" opacity="0.55"/>
  </V>
}

function SignalingIcon({ color, size = 24 }: IconProps) {
  // Cone de sinalização — laranja com tarjas brancas, base preta
  return <V s={size}>
    {/* sombra chão */}
    <ellipse cx="12" cy="21.5" rx="7" ry="0.6" fill="#000" opacity="0.3"/>
    {/* corpo do cone */}
    <path d="M12 3L6 20h12L12 3z" fill={P.coneOrange} stroke={P.coneShade} strokeWidth="0.6"/>
    {/* highlight esquerdo */}
    <path d="M12 3L9 17" stroke="#fb923c" strokeWidth="0.6" opacity="0.7"/>
    {/* tarja reflexiva superior */}
    <path d="M8.2 14h7.6l.5 1.5H7.7z" fill={P.coneTape}/>
    {/* tarja reflexiva inferior */}
    <path d="M7 17.5h10l.4 1.5H6.6z" fill={P.coneTape}/>
    {/* base preta */}
    <rect x="4" y="20" width="16" height="2" rx="0.5" fill={P.coneBase}/>
    <rect x="4" y="20" width="16" height="0.4" fill="#64748b"/>
    {/* accent */}
    <path d="M12 3L6 20h12L12 3z" fill="none" stroke={color} strokeWidth="0.4" opacity="0.5"/>
  </V>
}

function FirstAidIcon({ color, size = 24 }: IconProps) {
  // Maleta de primeiros socorros — branca com cruz vermelha
  return <V s={size}>
    {/* alça */}
    <path d="M9 5c0-1 .7-1.5 1.5-1.5h3c.8 0 1.5.5 1.5 1.5v2" stroke={P.aidHandle} strokeWidth="1.3" fill="none"/>
    {/* corpo */}
    <rect x="3" y="6.5" width="18" height="14.5" rx="1.8" fill={P.aidBox} stroke={P.aidShade} strokeWidth="0.8"/>
    {/* sombra inferior */}
    <rect x="3" y="18" width="18" height="3" rx="1.8" fill={P.aidShade} opacity="0.35"/>
    {/* trinco */}
    <rect x="10.5" y="6" width="3" height="1.3" rx="0.3" fill={P.aidHandle}/>
    {/* cruz vermelha */}
    <rect x="10.5" y="10" width="3" height="8" rx="0.3" fill={P.aidCross}/>
    <rect x="8" y="12.5" width="8" height="3" rx="0.3" fill={P.aidCross}/>
    {/* contorno cruz */}
    <rect x="10.5" y="10" width="3" height="8" rx="0.3" fill="none" stroke="#991b1b" strokeWidth="0.3"/>
    <rect x="8" y="12.5" width="8" height="3" rx="0.3" fill="none" stroke="#991b1b" strokeWidth="0.3"/>
    {/* accent */}
    <rect x="3" y="6.5" width="18" height="0.5" fill={color} opacity="0.6"/>
  </V>
}

function ChairIcon({ color, size = 24 }: IconProps) {
  // Cadeira ergonômica — encosto de mesh, braço, base com rodinhas
  return <V s={size}>
    {/* encosto alto */}
    <path d="M6.5 3h9c.8 0 1.5.7 1.5 1.5v8c0 .8-.7 1.5-1.5 1.5h-9c-.8 0-1.5-.7-1.5-1.5v-8C5 3.7 5.7 3 6.5 3z"
      fill={P.chairMesh} stroke="#0f172a" strokeWidth="0.6"/>
    {/* padrão mesh */}
    <path d="M6 5h10M6 7h10M6 9h10M6 11h10" stroke={P.chairAccent} strokeWidth="0.3" opacity="0.6"/>
    {/* apoio lombar (accent) */}
    <rect x="6" y="10.5" width="10" height="1" fill={P.chairAccent} opacity="0.7"/>
    {/* assento */}
    <path d="M4 14h16l-1 3H5l-1-3z" fill={P.chairSeat} stroke="#000" strokeWidth="0.5"/>
    {/* pistão */}
    <rect x="11.3" y="17" width="1.4" height="2.5" fill={P.chairBase}/>
    {/* base 5 pernas */}
    <path d="M12 19.5L6 22M12 19.5L9 22M12 19.5L15 22M12 19.5L18 22M12 19.5L12 22.5" stroke={P.chairBase} strokeWidth="1.2" strokeLinecap="round"/>
    {/* rodinhas */}
    <circle cx="6" cy="22" r="0.6" fill={P.chairSeat}/>
    <circle cx="9" cy="22" r="0.6" fill={P.chairSeat}/>
    <circle cx="12" cy="22.5" r="0.6" fill={P.chairSeat}/>
    <circle cx="15" cy="22" r="0.6" fill={P.chairSeat}/>
    <circle cx="18" cy="22" r="0.6" fill={P.chairSeat}/>
    {/* accent */}
    <rect x="5" y="3" width="12" height="0.4" fill={color} opacity="0.6"/>
  </V>
}

function LightIcon({ color, size = 24 }: IconProps) {
  // Lâmpada LED — bulbo de vidro, filamento, rosca prateada
  return <V s={size}>
    {/* halo */}
    <circle cx="12" cy="10" r="7" fill={P.bulbGlow} opacity="0.18"/>
    <circle cx="12" cy="10" r="5" fill={P.bulbGlow} opacity="0.22"/>
    {/* bulbo */}
    <path d="M7.5 10c0-3 2-5.5 4.5-5.5s4.5 2.5 4.5 5.5c0 2-.8 3.5-2 4.5v2h-5v-2c-1.2-1-2-2.5-2-4.5z"
      fill={P.bulbGlass} stroke="#fbbf24" strokeWidth="0.5"/>
    {/* reflexo */}
    <path d="M9.5 7.5c.5-.8 1.2-1.3 2-1.5" stroke="#fff" strokeWidth="0.7" opacity="0.85"/>
    {/* filamentos */}
    <path d="M10 11c.5-1.5 1-2.5 2-2.5s1.5 1 2 2.5" stroke={P.bulbBase} strokeWidth="0.5"/>
    <circle cx="10.5" cy="10.5" r=".3" fill={P.bulbBase}/>
    <circle cx="13.5" cy="10.5" r=".3" fill={P.bulbBase}/>
    {/* rosca */}
    <rect x="9.3" y="16.5" width="5.4" height="1" fill={P.bulbBase}/>
    <rect x="9.5" y="17.5" width="5" height="0.6" fill={P.bulbThread}/>
    <rect x="9.7" y="18.1" width="4.6" height="0.6" fill={P.bulbBase}/>
    <rect x="9.9" y="18.7" width="4.2" height="0.6" fill={P.bulbThread}/>
    <rect x="10.1" y="19.3" width="3.8" height="0.6" fill={P.bulbBase}/>
    {/* contato */}
    <ellipse cx="12" cy="20.5" rx="1.2" ry="0.5" fill={P.bulbThread}/>
    {/* accent */}
    <circle cx="12" cy="10" r="5" fill="none" stroke={color} strokeWidth="0.4" opacity="0.5"/>
  </V>
}

function BreaksIcon({ color, size = 24 }: IconProps) {
  // Caneca de café com vapor — pausa descanso
  return <V s={size}>
    {/* vapor */}
    <path d="M9 3c.5 1-.5 2 0 3M12 3c.5 1-.5 2 0 3M15 3c.5 1-.5 2 0 3" stroke={P.mugSteam} strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    {/* asa */}
    <path d="M18 12c2 0 3 1 3 2.5S20 17 18 17" fill="none" stroke={P.mugRim} strokeWidth="1.5"/>
    <path d="M18 13.5c1 0 1.5.5 1.5 1s-.5 1-1.5 1" fill="none" stroke={P.mugRim} strokeWidth="0.6"/>
    {/* corpo da caneca */}
    <path d="M4 8h14v10c0 1.5-1 3-3 3H7c-2 0-3-1.5-3-3V8z"
      fill={P.mugBody} stroke={P.mugRim} strokeWidth="0.7"/>
    {/* sombra lateral */}
    <path d="M15 8v13" stroke={P.mugRim} strokeWidth="0.4" opacity="0.5"/>
    {/* borda superior */}
    <rect x="4" y="8" width="14" height="1.2" fill={P.mugRim}/>
    {/* café dentro */}
    <ellipse cx="11" cy="9" rx="5.5" ry="0.8" fill={P.mugCoffee}/>
    <ellipse cx="11" cy="9" rx="4" ry="0.4" fill="#92400e" opacity="0.7"/>
    {/* accent */}
    <rect x="4" y="8" width="14" height="0.5" fill={color} opacity="0.6"/>
  </V>
}

function ExamIcon({ color, size = 24 }: IconProps) {
  // Estetoscópio — earpieces, tubo flexível em Y, diafragma
  return <V s={size}>
    {/* earpieces */}
    <circle cx="5" cy="4" r="1.2" fill={P.stethoEar}/>
    <circle cx="9" cy="4" r="1.2" fill={P.stethoEar}/>
    {/* hastes */}
    <path d="M5 5.2V8M9 5.2V8" stroke={P.stethoEar} strokeWidth="1" strokeLinecap="round"/>
    {/* tubo em Y */}
    <path d="M5 8c0 4 1 6 2 8M9 8c0 4-1 6-2 8" fill="none" stroke={P.stethoTube} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M7 16v3" stroke={P.stethoTube} strokeWidth="1.8" strokeLinecap="round"/>
    {/* diafragma */}
    <circle cx="15" cy="19" r="3.5" fill={P.stethoChest} stroke={P.stethoEar} strokeWidth="0.6"/>
    <circle cx="15" cy="19" r="2.5" fill="#f1f5f9" stroke={P.stethoEar} strokeWidth="0.3"/>
    <circle cx="15" cy="19" r="1.3" fill={P.stethoChest}/>
    <path d="M7 19c4 0 6 0 8 0" fill="none" stroke={P.stethoTube} strokeWidth="1.8" strokeLinecap="round"/>
    {/* brilho disco */}
    <path d="M14 17.5c.5-.3 1-.3 1.5-.2" stroke="#fff" strokeWidth="0.5" opacity="0.9"/>
    {/* accent */}
    <circle cx="15" cy="19" r="3.5" fill="none" stroke={color} strokeWidth="0.4" opacity="0.5"/>
  </V>
}

function WristIcon({ color, size = 24 }: IconProps) {
  // Munhequeira neoprene — strap velcro horizontal com fivela
  return <V s={size}>
    {/* contorno externo (neoprene) */}
    <rect x="2.5" y="7.5" width="19" height="9" rx="3" fill={P.wristBlack} stroke="#000" strokeWidth="0.6"/>
    {/* costura superior/inferior */}
    <path d="M2.5 9h19M2.5 15h19" stroke={P.wristVelcro} strokeWidth="0.3" strokeDasharray="0.5 0.5" opacity="0.6"/>
    {/* strap velcro principal */}
    <rect x="2.5" y="10.5" width="14" height="3" fill={P.wristStrap}/>
    {/* velcro textura */}
    <path d="M3 11.5h13M3 12.5h13" stroke={P.wristVelcro} strokeWidth="0.25" strokeDasharray="0.3 0.3"/>
    {/* fivela */}
    <rect x="15.5" y="10" width="2.5" height="4" rx="0.3" fill={P.wristAccent}/>
    <rect x="16" y="10.5" width="1.5" height="3" rx="0.2" fill={P.wristStrap}/>
    {/* ponta solta */}
    <path d="M18 11v2l3-1z" fill={P.wristStrap}/>
    {/* logo */}
    <circle cx="7" cy="12" r="0.9" fill={P.wristAccent}/>
    {/* accent */}
    <rect x="2.5" y="7.2" width="19" height="0.5" fill={color} opacity="0.6"/>
  </V>
}

function MonitorIcon({ color, size = 24 }: IconProps) {
  // Monitor em suporte ajustável (ergonomia) — tela, pescoço, base
  return <V s={size}>
    {/* tela externa */}
    <rect x="2" y="3" width="20" height="12" rx="1.2" fill={P.monBezel} stroke="#000" strokeWidth="0.5"/>
    {/* tela interna */}
    <rect x="3" y="4" width="18" height="10" rx="0.4" fill={P.monScreen}/>
    {/* UI fake — barra top */}
    <rect x="3.5" y="4.5" width="17" height="1.2" fill="#1e293b"/>
    <circle cx="4.3" cy="5.1" r="0.25" fill="#ef4444"/>
    <circle cx="5" cy="5.1" r="0.25" fill="#eab308"/>
    <circle cx="5.7" cy="5.1" r="0.25" fill="#22c55e"/>
    {/* UI fake — blocos */}
    <rect x="4" y="7" width="7" height="1.2" rx="0.2" fill="#334155"/>
    <rect x="4" y="9" width="5" height="1.2" rx="0.2" fill="#334155"/>
    <rect x="4" y="11" width="8" height="1.2" rx="0.2" fill="#334155"/>
    <rect x="13" y="7" width="7" height="5.2" rx="0.3" fill="#1e293b"/>
    <path d="M13.5 10l1.5-1.5 1.5 1.5 2-2 1.5 1" stroke="#22d3ee" strokeWidth="0.5" fill="none"/>
    {/* pescoço articulado */}
    <rect x="11.3" y="15" width="1.4" height="3" fill={P.monStand}/>
    <circle cx="12" cy="18" r="0.9" fill={P.monBase}/>
    {/* base */}
    <path d="M6 21h12l-1-2H7l-1 2z" fill={P.monStand} stroke={P.monBase} strokeWidth="0.5"/>
    <ellipse cx="12" cy="21" rx="6" ry="0.6" fill={P.monBase}/>
    {/* accent */}
    <rect x="2" y="3" width="20" height="0.5" fill={color} opacity="0.6"/>
  </V>
}

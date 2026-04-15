'use client'

import React from 'react'

/**
 * EpiIcons — icones SVG pequenos (24x24) pra cada tipo de EPI/medida de protecao.
 * Usados como botoes toggle no InteractiveLab.
 */

export type EpiType =
  | 'none'           // Sem protecao
  | 'helmet'         // Capacete
  | 'gloves'         // Luvas
  | 'boots'          // Botas
  | 'harness'        // Cinturao paraquedista
  | 'mask'           // Mascara respiratoria
  | 'goggles'        // Oculos de protecao
  | 'earProtection'  // Protetor auricular
  | 'apron'          // Avental
  | 'extinguisher'   // Extintor
  | 'lockout'        // Bloqueio eletrico
  | 'gasDetector'    // Detector de gas
  | 'lifeVest'       // Colete salva-vidas
  | 'signaling'      // Sinalizacao
  | 'firstAid'       // Primeiro socorros
  // ERGONOMICOS (escritorio/admin)
  | 'ergonomicChair' // Cadeira ergonomica
  | 'lighting'       // Iluminacao adequada
  | 'breaks'         // Pausas programadas
  | 'periodicExam'   // Exame periodico (PCMSO)
  | 'wristSupport'   // Apoio de pulso
  | 'monitorStand'   // Suporte de monitor

interface IconProps {
  color: string
  size?: number
}

export function EpiIcon({ type, color, size = 24 }: IconProps & { type: EpiType }) {
  const icons: Record<EpiType, (p: IconProps) => React.ReactElement> = {
    none: NoneIcon,
    helmet: HelmetIcon,
    gloves: GlovesIcon,
    boots: BootsIcon,
    harness: HarnessIcon,
    mask: MaskIcon,
    goggles: GogglesIcon,
    earProtection: EarIcon,
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
  const Icon = icons[type] || NoneIcon
  return <Icon color={color} size={size} />
}

const S = ({ size, children }: { size: number; children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">{children}</svg>
)

function NoneIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <circle cx="12" cy="7" r="3" stroke={color} strokeWidth="1.8" fill="none"/>
    <path d="M 6 20 L 6 15 Q 6 12 12 12 Q 18 12 18 15 L 18 20" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <line x1="4" y1="4" x2="20" y2="20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
  </S>
}

function HelmetIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    {/* Dome */}
    <path d="M 5 14 Q 5 5.5 12 5 Q 19 5.5 19 14" fill={`${color}33`} stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
    {/* Brim */}
    <path d="M 3 14.5 L 21 14.5 L 20 16.5 L 4 16.5 Z" fill={`${color}33`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Ridge line */}
    <path d="M 8 9.5 Q 12 8 16 9.5" stroke={color} strokeWidth="1" opacity="0.5" fill="none"/>
    {/* Chin strap */}
    <path d="M 7 16.5 L 6 20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M 17 16.5 L 18 20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M 6 20 Q 12 21.5 18 20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </S>
}

function GlovesIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    {/* Single glove — palm, 4 fingers + thumb */}
    {/* Cuff */}
    <rect x="7" y="17" width="10" height="4" rx="1" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
    {/* Palm */}
    <path d="M 7 17 L 7 10 Q 7 8 9 8 L 15 8 Q 17 8 17 10 L 17 17" fill={`${color}33`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Fingers — index, middle, ring, pinky */}
    <path d="M 8.5 8 L 8.5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M 11 8 L 11 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M 13.5 8 L 13.5 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M 16 8 L 16 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    {/* Finger tips */}
    <circle cx="8.5" cy="4.5" r="1" fill={`${color}33`} stroke={color} strokeWidth="1"/>
    <circle cx="11" cy="3.5" r="1" fill={`${color}33`} stroke={color} strokeWidth="1"/>
    <circle cx="13.5" cy="4" r="1" fill={`${color}33`} stroke={color} strokeWidth="1"/>
    <circle cx="16" cy="5" r="1" fill={`${color}33`} stroke={color} strokeWidth="1"/>
    {/* Thumb — separated, angled out */}
    <path d="M 7 13 L 4 11 L 3.5 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <circle cx="3.5" cy="8.5" r="1" fill={`${color}33`} stroke={color} strokeWidth="1"/>
  </S>
}

function BootsIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    {/* Single safety boot — profile view */}
    {/* Shaft (ankle/leg part) */}
    <path d="M 8 4 L 8 14 L 6 14 L 6 4 Z" fill={`${color}33`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Boot body going forward */}
    <path d="M 6 14 L 6 18 L 3 19 L 3 20.5 L 19 20.5 L 19 18 Q 19 14 14 14 L 8 14" fill={`${color}33`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Steel toe cap — reinforced front */}
    <path d="M 16 15 Q 19.5 15 19 18 L 19 20.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
    {/* Thick sole with tread */}
    <rect x="3" y="20.5" width="16" height="2" rx="0.5" fill={color}/>
    <line x1="5" y1="21.5" x2="5" y2="22.5" stroke={`${color}33`} strokeWidth="1"/>
    <line x1="8" y1="21.5" x2="8" y2="22.5" stroke={`${color}33`} strokeWidth="1"/>
    <line x1="11" y1="21.5" x2="11" y2="22.5" stroke={`${color}33`} strokeWidth="1"/>
    <line x1="14" y1="21.5" x2="14" y2="22.5" stroke={`${color}33`} strokeWidth="1"/>
    <line x1="17" y1="21.5" x2="17" y2="22.5" stroke={`${color}33`} strokeWidth="1"/>
    {/* Boot top trim */}
    <line x1="6" y1="4" x2="8" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </S>
}

function HarnessIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    {/* Shoulder straps forming X */}
    <path d="M 6 3 L 12 12 L 18 3" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M 6 3 L 12 12 L 6 21" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M 18 3 L 12 12 L 18 21" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Waist belt */}
    <path d="M 5 14 L 19 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Leg loops */}
    <path d="M 7 18 Q 9 20 11 18" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M 13 18 Q 15 20 17 18" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* D-ring at chest center */}
    <circle cx="12" cy="10" r="2" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="10" r="0.8" fill={color}/>
  </S>
}

function MaskIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    {/* Half-face respirator */}
    {/* Main mask body — covers nose and mouth */}
    <path d="M 5 8 Q 5 6 12 5 Q 19 6 19 8 L 19 14 Q 19 17 12 18 Q 5 17 5 14 Z" fill={`${color}33`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Nose bridge */}
    <path d="M 9 7 L 12 5.5 L 15 7" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Left filter cartridge */}
    <circle cx="4" cy="12" r="2.5" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
    <circle cx="4" cy="12" r="1" fill={color} opacity="0.4"/>
    {/* Right filter cartridge */}
    <circle cx="20" cy="12" r="2.5" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
    <circle cx="20" cy="12" r="1" fill={color} opacity="0.4"/>
    {/* Elastic straps */}
    <path d="M 4 10 L 2 7 L 1 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <path d="M 20 10 L 22 7 L 23 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    {/* Center seam */}
    <line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth="0.8" opacity="0.4"/>
  </S>
}

function GogglesIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    {/* Wrap-around single lens frame */}
    <path d="M 3 10 Q 3 7 12 7 Q 21 7 21 10 L 21 14 Q 21 17 12 17 Q 3 17 3 14 Z" fill={`${color}22`} stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    {/* Lens shine */}
    <path d="M 7 9 Q 10 8.5 13 9" stroke={color} strokeWidth="0.8" opacity="0.4" fill="none" strokeLinecap="round"/>
    {/* Ventilation holes on top */}
    <circle cx="8" cy="8" r="0.6" fill={color} opacity="0.5"/>
    <circle cx="12" cy="7.5" r="0.6" fill={color} opacity="0.5"/>
    <circle cx="16" cy="8" r="0.6" fill={color} opacity="0.5"/>
    {/* Elastic band — left */}
    <path d="M 3 11 L 1 10.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Elastic band — right */}
    <path d="M 21 11 L 23 10.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Nose bridge notch */}
    <path d="M 10.5 17 Q 12 18.5 13.5 17" stroke={color} strokeWidth="1" fill="none"/>
  </S>
}

function EarIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    {/* Headband arch */}
    <path d="M 5 10 Q 5 3 12 3 Q 19 3 19 10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Left ear cup */}
    <rect x="2" y="9" width="6" height="8" rx="2" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
    {/* Left cup padding */}
    <ellipse cx="5" cy="13" rx="1.8" ry="2.5" fill={color} opacity="0.3"/>
    {/* Right ear cup */}
    <rect x="16" y="9" width="6" height="8" rx="2" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
    {/* Right cup padding */}
    <ellipse cx="19" cy="13" rx="1.8" ry="2.5" fill={color} opacity="0.3"/>
    {/* Headband padding */}
    <path d="M 7 5 Q 12 2.5 17 5" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.3"/>
  </S>
}

function ApronIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    {/* Neck loop */}
    <path d="M 9 5 Q 12 2 15 5" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Apron front panel — wider at bottom */}
    <path d="M 7 5 L 7 20 Q 7 21 8 21 L 16 21 Q 17 21 17 20 L 17 5" fill={`${color}33`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Waist ties */}
    <path d="M 7 12 L 3 13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M 17 12 L 21 13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    {/* Tie knots */}
    <circle cx="2.5" cy="13.3" r="1" fill={color} opacity="0.5"/>
    <circle cx="21.5" cy="13.3" r="1" fill={color} opacity="0.5"/>
    {/* Pocket */}
    <rect x="9" y="14" width="6" height="4" rx="0.5" fill="none" stroke={color} strokeWidth="1" opacity="0.4"/>
  </S>
}

function ExtinguisherIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <rect x="8" y="6" width="8" height="14" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5"/>
    <rect x="10" y="3" width="4" height="4" rx="0.5" fill={color}/>
    <path d="M 12 3 L 6 1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </S>
}

function LockoutIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <path d="M 7 11 L 7 8 a 5 5 0 0 1 10 0 L 17 11" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <rect x="5" y="11" width="14" height="10" rx="2" fill={`${color}33`} stroke={color} strokeWidth="1.8"/>
    <circle cx="12" cy="15" r="1.5" fill={color}/>
    <line x1="12" y1="15" x2="12" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </S>
}

function GasDetectorIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <rect x="7" y="4" width="10" height="16" rx="2" fill={`${color}22`} stroke={color} strokeWidth="1.8"/>
    <rect x="9" y="6" width="6" height="4" rx="0.5" fill={color} opacity="0.4"/>
    <text x="12" y="9" fontSize="4" fill={color} textAnchor="middle" fontWeight="700">O₂</text>
    <circle cx="12" cy="16" r="1.5" fill={color}/>
  </S>
}

function LifeVestIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <path d="M 6 6 L 8 4 L 16 4 L 18 6 L 18 18 L 14 20 L 10 20 L 6 18 Z" fill="#f97316" stroke="#9a3412" strokeWidth="1.5" strokeLinejoin="round"/>
    <line x1="12" y1="4" x2="12" y2="20" stroke="#9a3412" strokeWidth="1"/>
    <rect x="10" y="8" width="4" height="2" rx="0.5" fill="#fbbf24"/>
  </S>
}

function SignalingIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <polygon points="12,3 22,19 2,19" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <rect x="11" y="8" width="2" height="6" fill={color}/>
    <circle cx="12" cy="16" r="1" fill={color}/>
  </S>
}

function FirstAidIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <rect x="4" y="4" width="16" height="16" rx="2" fill={`${color}22`} stroke={color} strokeWidth="1.8"/>
    <rect x="10" y="7" width="4" height="10" fill={color}/>
    <rect x="7" y="10" width="10" height="4" fill={color}/>
  </S>
}

/* ─── ERGONOMICOS ─── */

function ChairIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <path d="M 8 6 Q 8 3 12 3 Q 16 3 16 6 L 16 10 L 8 10 Z" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
    <rect x="7" y="10" width="10" height="3" rx="0.5" fill={color} opacity="0.7"/>
    <line x1="12" y1="13" x2="12" y2="18" stroke={color} strokeWidth="2"/>
    <line x1="8" y1="18" x2="16" y2="18" stroke={color} strokeWidth="1.5"/>
    <circle cx="9" cy="20" r="1.5" fill={color} opacity="0.6"/>
    <circle cx="15" cy="20" r="1.5" fill={color} opacity="0.6"/>
  </S>
}

function LightIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <circle cx="12" cy="10" r="5" fill={`${color}33`} stroke={color} strokeWidth="1.8"/>
    <line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="4" y1="10" x2="6" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="10" x2="20" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="6.5" y1="4.5" x2="8" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="17.5" y1="4.5" x2="16" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="10" y="16" width="4" height="3" rx="0.5" fill={color} opacity="0.7"/>
    <text x="12" y="21" fontSize="4" fill={color} textAnchor="middle" fontWeight="700">lux</text>
  </S>
}

function BreaksIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.8"/>
    <line x1="12" y1="5" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="12" x2="17" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="1.5" fill={color}/>
  </S>
}

function ExamIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <rect x="6" y="2" width="12" height="18" rx="1.5" fill={`${color}22`} stroke={color} strokeWidth="1.5"/>
    <line x1="9" y1="7" x2="15" y2="7" stroke={color} strokeWidth="1" opacity="0.6"/>
    <line x1="9" y1="10" x2="15" y2="10" stroke={color} strokeWidth="1" opacity="0.6"/>
    <line x1="9" y1="13" x2="13" y2="13" stroke={color} strokeWidth="1" opacity="0.6"/>
    <path d="M 9 16 l 2 2 l 4 -4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </S>
}

function WristIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <rect x="3" y="12" width="18" height="4" rx="1" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
    <path d="M 8 12 L 8 7 Q 8 5 10 5 L 14 5 Q 16 5 16 7 L 16 12" fill="none" stroke={color} strokeWidth="1.5"/>
    <circle cx="10" cy="8" r="0.8" fill={color}/>
    <circle cx="12" cy="7" r="0.8" fill={color}/>
    <circle cx="14" cy="8" r="0.8" fill={color}/>
    <line x1="12" y1="16" x2="12" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </S>
}

function MonitorIcon({ color, size = 24 }: IconProps) {
  return <S size={size}>
    <rect x="3" y="4" width="18" height="12" rx="1.5" fill={`${color}22`} stroke={color} strokeWidth="1.5"/>
    <rect x="5" y="6" width="14" height="8" rx="0.5" fill={`${color}11`}/>
    <rect x="10" y="16" width="4" height="3" fill={color} opacity="0.6"/>
    <rect x="7" y="19" width="10" height="1.5" rx="0.5" fill={color} opacity="0.7"/>
    <line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="10" y1="2" x2="14" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </S>
}

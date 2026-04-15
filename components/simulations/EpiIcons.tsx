'use client'

import React from 'react'
import { HardHat, Headphones, Glasses, ShieldAlert, Flame, Zap, Radio, Anchor, Cross, Armchair, Sun, Timer, Stethoscope, Mouse, Monitor } from 'lucide-react'

/**
 * EpiIcons — usa Lucide onde possível + SVGs detalhados para EPIs sem ícone nativo.
 * Cada ícone monocromático, reconhecível em 20-40px.
 */

export type EpiType =
  | 'none' | 'helmet' | 'gloves' | 'boots' | 'harness' | 'mask'
  | 'goggles' | 'earProtection' | 'apron' | 'extinguisher' | 'lockout'
  | 'gasDetector' | 'lifeVest' | 'signaling' | 'firstAid'
  | 'ergonomicChair' | 'lighting' | 'breaks' | 'periodicExam'
  | 'wristSupport' | 'monitorStand'

/** Nomes curtos para labels */
export const EPI_LABELS: Record<EpiType, string> = {
  none: 'Nenhum',
  helmet: 'Capacete',
  gloves: 'Luvas',
  boots: 'Botas',
  harness: 'Arnês',
  mask: 'Máscara',
  goggles: 'Óculos',
  earProtection: 'Protetor',
  apron: 'Avental',
  extinguisher: 'Extintor',
  lockout: 'Bloqueio',
  gasDetector: 'Detector',
  lifeVest: 'Colete',
  signaling: 'Sinalização',
  firstAid: 'Primeiros S.',
  ergonomicChair: 'Cadeira',
  lighting: 'Iluminação',
  breaks: 'Pausas',
  periodicExam: 'Exame',
  wristSupport: 'Punho',
  monitorStand: 'Monitor',
}

interface IconProps {
  color: string
  size?: number
}

export function EpiIcon({ type, color, size = 24 }: IconProps & { type: EpiType }) {
  // Lucide icons where available
  const lucideMap: Partial<Record<EpiType, React.ElementType>> = {
    helmet: HardHat,
    earProtection: Headphones,
    goggles: Glasses,
    extinguisher: Flame,
    lockout: Zap,
    gasDetector: Radio,
    lifeVest: Anchor,
    firstAid: Cross,
    signaling: ShieldAlert,
    ergonomicChair: Armchair,
    lighting: Sun,
    breaks: Timer,
    periodicExam: Stethoscope,
    wristSupport: Mouse,
    monitorStand: Monitor,
  }

  const LucideIcon = lucideMap[type]
  if (LucideIcon) {
    return <LucideIcon size={size} color={color} strokeWidth={1.8} />
  }

  // Custom SVGs for EPIs without Lucide equivalent
  const customMap: Partial<Record<EpiType, (p: IconProps) => React.ReactElement>> = {
    none: NoneIcon,
    gloves: GlovesIcon,
    boots: BootsIcon,
    harness: HarnessIcon,
    mask: MaskIcon,
    apron: ApronIcon,
  }

  const Custom = customMap[type]
  if (Custom) return <Custom color={color} size={size} />

  // Fallback
  return <NoneIcon color={color} size={size} />
}

const V = ({ size, children }: { size: number; children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">{children}</svg>
)

function NoneIcon({ color, size = 24 }: IconProps) {
  return <V size={size}>
    <circle cx="12" cy="8" r="3" stroke={color} strokeWidth="1.8"/>
    <path d="M7 20v-4c0-2.8 2.2-5 5-5s5 2.2 5 5v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="4" y1="4" x2="20" y2="20" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round"/>
  </V>
}

function GlovesIcon({ color, size = 24 }: IconProps) {
  return <V size={size}>
    {/* Punho */}
    <rect x="6" y="16" width="12" height="5" rx="1.5" stroke={color} strokeWidth="1.8" fill={`${color}22`}/>
    {/* Palma */}
    <path d="M6 16V9c0-1 .8-1.8 1.8-1.8h8.4c1 0 1.8.8 1.8 1.8v7" stroke={color} strokeWidth="1.8" fill={`${color}15`}/>
    {/* Dedos — 4 arredondados */}
    <path d="M8 7.2V4.5a1.2 1.2 0 012.4 0" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M10.4 7.2V3.5a1.2 1.2 0 012.4 0" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M12.8 7.2V3.8a1.2 1.2 0 012.4 0" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M15.2 7.2V5a1.2 1.2 0 012.4 0V7.2" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    {/* Polegar */}
    <path d="M6 12L3.5 10a1.2 1.2 0 011.7-1.7L6 9.5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
  </V>
}

function BootsIcon({ color, size = 24 }: IconProps) {
  return <V size={size}>
    {/* Cano */}
    <path d="M8 3v11H6V3h2z" stroke={color} strokeWidth="1.5" fill={`${color}15`} strokeLinejoin="round"/>
    {/* Corpo + biqueira */}
    <path d="M6 14v5h-2c-.6 0-1 .4-1 1v1h16v-1c0-.6-.4-1-1-1h-1v-2c0-2-1.5-3-4-3H8" stroke={color} strokeWidth="1.5" fill={`${color}22`} strokeLinejoin="round"/>
    {/* Sola grossa */}
    <rect x="3" y="21" width="16" height="2" rx="1" fill={color} opacity="0.8"/>
    {/* Biqueira reforçada */}
    <path d="M14 17c2 0 3 .5 3 2" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
  </V>
}

function HarnessIcon({ color, size = 24 }: IconProps) {
  return <V size={size}>
    {/* Alças em X */}
    <path d="M7 3l5 8 5-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11l-5 8M12 11l5 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Cinto na cintura */}
    <path d="M5 14h14" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    {/* D-ring central */}
    <circle cx="12" cy="8" r="2.5" stroke={color} strokeWidth="1.8" fill={`${color}33`}/>
    <circle cx="12" cy="8" r="1" fill={color}/>
    {/* Pernas */}
    <path d="M7 19l-1 3M17 19l1 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </V>
}

function MaskIcon({ color, size = 24 }: IconProps) {
  return <V size={size}>
    {/* Face da máscara — meia face */}
    <path d="M5 9c0-1 1.5-3 7-3s7 2 7 3v4c0 3-3 6-7 6s-7-3-7-6V9z" stroke={color} strokeWidth="1.8" fill={`${color}22`}/>
    {/* Filtros laterais — dois cilindros */}
    <ellipse cx="4" cy="11" rx="2.5" ry="3" stroke={color} strokeWidth="1.5" fill={`${color}33`}/>
    <ellipse cx="20" cy="11" rx="2.5" ry="3" stroke={color} strokeWidth="1.5" fill={`${color}33`}/>
    {/* Grades dos filtros */}
    <line x1="3" y1="10" x2="5" y2="10" stroke={color} strokeWidth="0.8" opacity="0.6"/>
    <line x1="3" y1="11.5" x2="5" y2="11.5" stroke={color} strokeWidth="0.8" opacity="0.6"/>
    <line x1="19" y1="10" x2="21" y2="10" stroke={color} strokeWidth="0.8" opacity="0.6"/>
    <line x1="19" y1="11.5" x2="21" y2="11.5" stroke={color} strokeWidth="0.8" opacity="0.6"/>
    {/* Válvula de exalação */}
    <circle cx="12" cy="14" r="1.5" stroke={color} strokeWidth="1.2" fill={`${color}22`}/>
    {/* Tiras */}
    <path d="M5 9L2 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19 9L22 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </V>
}

function ApronIcon({ color, size = 24 }: IconProps) {
  return <V size={size}>
    {/* Alça do pescoço */}
    <path d="M8 3C8 1.5 16 1.5 16 3" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    {/* Corpo do avental */}
    <path d="M7 5h10v14c0 1-.5 2-2 2H9c-1.5 0-2-1-2-2V5z" stroke={color} strokeWidth="1.8" fill={`${color}22`}/>
    {/* Alças laterais */}
    <path d="M7 10L3 11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 10L21 11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 11L3 13L7 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M21 11L21 13L17 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Bolso */}
    <rect x="9" y="12" width="6" height="4" rx="0.5" stroke={color} strokeWidth="1" opacity="0.5"/>
  </V>
}

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
    {/* Mão aberta com 5 dedos — silhueta de luva industrial */}
    <path d="M9 21h6v-6h2V9a1 1 0 00-2 0V7a1 1 0 00-2 0V5a1 1 0 00-2 0v2a1 1 0 00-2 0v5l-2-2a1.4 1.4 0 00-2 2l3 4v5z"
      fill={`${color}30`} stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    {/* Punho reforçado */}
    <rect x="8.5" y="20" width="7" height="3" rx="1" fill={`${color}40`} stroke={color} strokeWidth="1.5"/>
  </V>
}

function BootsIcon({ color, size = 24 }: IconProps) {
  return <V size={size}>
    {/* Bota de segurança — perfil lateral, forma clara */}
    <path d="M7 4h4v10h6l2 3v2H3v-2l2-3V8c0-2.2 1-4 2-4z"
      fill={`${color}25`} stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    {/* Sola grossa */}
    <rect x="2.5" y="19" width="17" height="3" rx="1.5" fill={color} opacity="0.7"/>
    {/* Biqueira de aço */}
    <path d="M15 14h4l2 3v2h-4" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
  </V>
}

function HarnessIcon({ color, size = 24 }: IconProps) {
  return <V size={size}>
    {/* Corpo humano simplificado com arnês */}
    <circle cx="12" cy="4" r="2.5" stroke={color} strokeWidth="2"/>
    {/* Alças do arnês — V no peito */}
    <path d="M8 8l4 6 4-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Cinto */}
    <rect x="6" y="13" width="12" height="2.5" rx="1" fill={`${color}40`} stroke={color} strokeWidth="1.8"/>
    {/* D-ring no peito */}
    <circle cx="12" cy="10.5" r="1.8" fill={color} opacity="0.7"/>
    {/* Pernas do arnês */}
    <path d="M8 15.5v4M16 15.5v4" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M7 19.5h3M14 19.5h3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </V>
}

function MaskIcon({ color, size = 24 }: IconProps) {
  return <V size={size}>
    {/* Máscara meia-face — frontal, forma clara de respirador */}
    <path d="M4 10c0-2 3.5-5 8-5s8 3 8 5v3c0 4-3.5 7-8 7s-8-3-8-7v-3z"
      fill={`${color}25`} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    {/* Dois filtros redondos laterais */}
    <circle cx="3" cy="12" r="2.5" fill={`${color}40`} stroke={color} strokeWidth="2"/>
    <circle cx="21" cy="12" r="2.5" fill={`${color}40`} stroke={color} strokeWidth="2"/>
    {/* Válvula central */}
    <circle cx="12" cy="14" r="2" fill={`${color}50`} stroke={color} strokeWidth="1.5"/>
    {/* Elásticos */}
    <path d="M4 10L1 8M20 10l3-2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </V>
}

function ApronIcon({ color, size = 24 }: IconProps) {
  return <V size={size}>
    {/* Avental — forma de trapézio com alça */}
    <path d="M9 2c0 0 1.5-1 3-1s3 1 3 1" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 2v1h6V2" stroke={color} strokeWidth="1.5"/>
    {/* Corpo do avental — trapézio */}
    <path d="M6 5h12v14c0 1.5-1 3-3 3H9c-2 0-3-1.5-3-3V5z"
      fill={`${color}25`} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    {/* Amarras na cintura */}
    <path d="M6 11L2 12.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 11l4 1.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Bolso grande */}
    <rect x="8" y="13" width="8" height="5" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}15`}/>
  </V>
}

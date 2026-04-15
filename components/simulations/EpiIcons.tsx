'use client'

import React from 'react'
import { HardHat, Headphones } from 'lucide-react'

/**
 * EpiIcons — Sistema visual de ícones EPI.
 *
 * DNA VISUAL: infográfico técnico premium, minimalista, editorial.
 * - Formas geométricas limpas, proporcionais
 * - Stroke consistente (2px estrutura, 1.5px detalhe)
 * - Silhueta reconhecível em 20-40px
 * - Monochromatic (cor única via prop)
 * - SEM emoji, SEM clipart, SEM infantilismo
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

interface IconProps { color: string; size?: number }

export function EpiIcon({ type, color, size = 24 }: IconProps & { type: EpiType }) {
  // Lucide onde é bom
  if (type === 'helmet') return <HardHat size={size} color={color} strokeWidth={2} />
  if (type === 'earProtection') return <Headphones size={size} color={color} strokeWidth={2} />

  const custom: Partial<Record<EpiType, (p: IconProps) => React.ReactElement>> = {
    none: NoneIcon, gloves: GlovesIcon, boots: BootsIcon, harness: HarnessIcon,
    mask: MaskIcon, goggles: GogglesIcon, apron: ApronIcon,
    extinguisher: ExtinguisherIcon, lockout: LockoutIcon, gasDetector: GasDetectorIcon,
    lifeVest: LifeVestIcon, signaling: SignalingIcon, firstAid: FirstAidIcon,
    ergonomicChair: ChairIcon, lighting: LightIcon, breaks: BreaksIcon,
    periodicExam: ExamIcon, wristSupport: WristIcon, monitorStand: MonitorIcon,
  }
  const C = custom[type] || NoneIcon
  return <C color={color} size={size} />
}

// ── SVG wrapper com viewBox padronizado ──
const V = ({ s, children }: { s: number; children: React.ReactNode }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
)

// ── Stroke system: 2=principal, 1.5=secundário, 1=detalhe ──
// ── Fill: {color}20 translúcido, {color}40 semi ──

function NoneIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth="2"/>
    <path d="M6.5 21v-3c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5v3" stroke={color} strokeWidth="2"/>
    <line x1="4" y1="4" x2="20" y2="20" stroke="#ef4444" strokeWidth="2.5"/>
  </V>
}

function GlovesIcon({ color, size = 24 }: IconProps) {
  // Luva industrial — vista frontal, palma aberta, 5 dedos
  return <V s={size}>
    <path d="M8 22v-8c0-.6.4-1 1-1h6c.6 0 1 .4 1 1v8" stroke={color} strokeWidth="2" fill={`${color}20`}/>
    <path d="M8 14v-3.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5" stroke={color} strokeWidth="2"/>
    <path d="M11 9V6c0-.8.7-1.5 1.5-1.5S14 5.2 14 6v3" stroke={color} strokeWidth="2"/>
    <path d="M14 9V7c0-.8.7-1.5 1.5-1.5S17 6.2 17 7v5" stroke={color} strokeWidth="2"/>
    <path d="M8 14l-2.5-2c-.6-.5-1.5-.3-1.8.4-.3.7 0 1.5.6 1.9L8 17" stroke={color} strokeWidth="2"/>
    <rect x="7.5" y="20.5" width="9" height="2.5" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}15`}/>
  </V>
}

function BootsIcon({ color, size = 24 }: IconProps) {
  // Bota de segurança — perfil lateral técnico
  return <V s={size}>
    <path d="M8 3c-.5 0-1 .5-1 1v11H5.5c-1 0-1.5.8-1.5 1.5V19c0 .6.4 1 1 1h14c.6 0 1-.4 1-1v-2c0-.8-.7-1.5-1.5-1.5H17V8c0-3-2-5-4.5-5H8z"
      stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <rect x="4" y="19.5" width="16" height="2.5" rx="1" fill={color} opacity="0.6"/>
    <path d="M15 15.5h3.5" stroke={color} strokeWidth="2.5" opacity="0.4"/>
  </V>
}

function HarnessIcon({ color, size = 24 }: IconProps) {
  // Arnês paraquedista — vista frontal, pictograma técnico
  return <V s={size}>
    <circle cx="12" cy="4.5" r="2" stroke={color} strokeWidth="2"/>
    <path d="M8.5 8L12 13l3.5-5" stroke={color} strokeWidth="2.5"/>
    <rect x="7" y="12.5" width="10" height="2" rx=".8" stroke={color} strokeWidth="1.5" fill={`${color}30`}/>
    <path d="M9 14.5v5.5M15 14.5v5.5" stroke={color} strokeWidth="2"/>
    <path d="M8 20h3M13 20h3" stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="10" r="1.5" fill={color} opacity="0.6"/>
  </V>
}

function MaskIcon({ color, size = 24 }: IconProps) {
  // Respirador PFF2 — vista frontal, dois filtros laterais
  return <V s={size}>
    <path d="M5 10c0-2 3-4.5 7-4.5s7 2.5 7 4.5v3c0 3.5-3 6.5-7 6.5s-7-3-7-6.5v-3z"
      stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <rect x="1" y="9.5" width="4" height="5" rx="2" stroke={color} strokeWidth="1.8" fill={`${color}25`}/>
    <rect x="19" y="9.5" width="4" height="5" rx="2" stroke={color} strokeWidth="1.8" fill={`${color}25`}/>
    <circle cx="12" cy="14.5" r="1.8" stroke={color} strokeWidth="1.5" fill={`${color}20`}/>
    <path d="M5 10L2.5 8M19 10l2.5-2" stroke={color} strokeWidth="1.5"/>
  </V>
}

function GogglesIcon({ color, size = 24 }: IconProps) {
  // Óculos de proteção — wrap-around, vista frontal
  return <V s={size}>
    <rect x="2" y="8" width="8.5" height="7" rx="2.5" stroke={color} strokeWidth="2" fill={`${color}12`}/>
    <rect x="13.5" y="8" width="8.5" height="7" rx="2.5" stroke={color} strokeWidth="2" fill={`${color}12`}/>
    <path d="M10.5 11.5h3" stroke={color} strokeWidth="2"/>
    <path d="M2 11.5L0 11M22 11.5l2-1" stroke={color} strokeWidth="1.5"/>
    <line x1="4" y1="8" x2="8.5" y2="8" stroke={color} strokeWidth="1" opacity="0.4"/>
    <line x1="15.5" y1="8" x2="20" y2="8" stroke={color} strokeWidth="1" opacity="0.4"/>
  </V>
}

function ApronIcon({ color, size = 24 }: IconProps) {
  // Avental de segurança — vista frontal, forma trapezoidal
  return <V s={size}>
    <path d="M9 2.5C9.5 1.5 14.5 1.5 15 2.5" stroke={color} strokeWidth="2"/>
    <path d="M9 2.5V4h6V2.5" stroke={color} strokeWidth="1.5"/>
    <path d="M7 5.5h10v14.5c0 1-1 2-2.5 2h-5c-1.5 0-2.5-1-2.5-2V5.5z"
      stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <path d="M7 11L3.5 12.5M17 11l3.5 1.5" stroke={color} strokeWidth="2"/>
    <rect x="9" y="13" width="6" height="4.5" rx=".8" stroke={color} strokeWidth="1.2" opacity="0.5"/>
  </V>
}

// ── Ícones menos frequentes (simplificados mas no DNA) ──

function ExtinguisherIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <rect x="8" y="6" width="8" height="14" rx="2" stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <path d="M12 6V3M12 3l3-1M12 3L9 2" stroke={color} strokeWidth="2"/>
    <rect x="10" y="9" width="4" height="2" rx=".5" fill={color} opacity="0.4"/>
    <rect x="7" y="20" width="10" height="2" rx="1" fill={color} opacity="0.5"/>
  </V>
}

function LockoutIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <rect x="6" y="11" width="12" height="10" rx="2" stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <path d="M9 11V7c0-1.7 1.3-3 3-3s3 1.3 3 3v4" stroke={color} strokeWidth="2"/>
    <circle cx="12" cy="16" r="1.5" fill={color}/>
    <line x1="12" y1="17.5" x2="12" y2="19" stroke={color} strokeWidth="1.5"/>
  </V>
}

function GasDetectorIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <rect x="7" y="4" width="10" height="16" rx="2" stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <rect x="9" y="7" width="6" height="4" rx="1" stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="15" r="2" stroke={color} strokeWidth="1.5"/>
    <path d="M10 2h4" stroke={color} strokeWidth="2"/>
  </V>
}

function LifeVestIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <path d="M7 6h10v14c0 1-1 2-2.5 2h-5C8 22 7 21 7 20V6z" stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <path d="M7 6c0-2 2-3 5-3s5 1 5 3" stroke={color} strokeWidth="2"/>
    <path d="M12 6v6" stroke={color} strokeWidth="1.5" opacity="0.5"/>
    <rect x="9" y="14" width="6" height="2" rx=".5" fill={color} opacity="0.3"/>
  </V>
}

function SignalingIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <path d="M12 2L3 20h18L12 2z" stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <line x1="12" y1="9" x2="12" y2="14" stroke={color} strokeWidth="2.5"/>
    <circle cx="12" cy="17" r="1.2" fill={color}/>
  </V>
}

function FirstAidIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <rect x="4" y="4" width="16" height="16" rx="3" stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2.5"/>
  </V>
}

function ChairIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <path d="M7 13h10c1 0 1.5-.5 1.5-1.5V5c0-1-.5-1.5-1.5-1.5H7C6 3.5 5.5 4 5.5 5v6.5c0 1 .5 1.5 1.5 1.5z" stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <rect x="7" y="13" width="10" height="3" rx=".5" stroke={color} strokeWidth="1.5"/>
    <line x1="12" y1="16" x2="12" y2="19" stroke={color} strokeWidth="2"/>
    <path d="M8 19h8" stroke={color} strokeWidth="2"/>
    <path d="M7.5 21l.5-2M16.5 21l-.5-2" stroke={color} strokeWidth="1.5"/>
  </V>
}

function LightIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 20v2M19.07 19.07l-1.41-1.41M22 12h-2M19.07 4.93l-1.41 1.41" stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" fill={`${color}20`}/>
  </V>
}

function BreaksIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <path d="M12 7v5l3.5 3.5" stroke={color} strokeWidth="2"/>
  </V>
}

function ExamIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <path d="M4 15c2-4 4-6 6-6s4 2 6 6" stroke={color} strokeWidth="2"/>
    <circle cx="14" cy="9" r="3.5" stroke={color} strokeWidth="2"/>
    <circle cx="14" cy="9" r="1" fill={color}/>
    <path d="M4 15v4h16v-4" stroke={color} strokeWidth="2"/>
  </V>
}

function WristIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <rect x="3" y="8" width="18" height="8" rx="3" stroke={color} strokeWidth="2" fill={`${color}15`}/>
    <path d="M8 8V6c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="1.5"/>
  </V>
}

function MonitorIcon({ color, size = 24 }: IconProps) {
  return <V s={size}>
    <rect x="3" y="3" width="18" height="12" rx="2" stroke={color} strokeWidth="2" fill={`${color}12`}/>
    <line x1="12" y1="15" x2="12" y2="19" stroke={color} strokeWidth="2"/>
    <path d="M8 19h8" stroke={color} strokeWidth="2"/>
  </V>
}

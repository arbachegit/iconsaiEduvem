'use client'

/* ═══════════════════════════════════════════════════════════
   LessonNavigation — Section progress sidebar
   Portado 1:1 do iconsaiStats. Adaptado: LESSON_SECTIONS vem de
   data/domain-configs/nr.ts em vez de lib/education-types.ts.
   ═══════════════════════════════════════════════════════════ */

import { LESSON_SECTIONS } from '@/data/domain-configs/nr'

interface LessonNavigationProps {
  currentSection: number
  comprehensionFeedback: Record<number, boolean | undefined>
  onNavigate: (index: number) => void
  accentColor?: string
}

export function LessonNavigation({
  currentSection, comprehensionFeedback, onNavigate, accentColor = '#22d3ee',
}: LessonNavigationProps) {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0' }}>
      {LESSON_SECTIONS.map(section => {
        const isCurrent = section.index === currentSection
        const feedback = comprehensionFeedback[section.index]
        const hasExercise = section.hasExercise

        return (
          <button
            key={section.index}
            onClick={() => onNavigate(section.index)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8,
              background: isCurrent ? '#1e293b' : 'transparent',
              border: 'none', cursor: 'pointer',
              textAlign: 'left', width: '100%',
              transition: 'background 0.2s',
              fontFamily: 'inherit',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              background: isCurrent ? accentColor : feedback !== undefined ? '#1e293b' : '#0f172a',
              color: isCurrent ? '#0a0e17' : feedback !== undefined ? '#94a3b8' : '#475569',
              border: `2px solid ${isCurrent ? accentColor : '#1e293b'}`,
              flexShrink: 0,
            }}>
              {feedback === true ? '\u2713' : feedback === false ? '\u2717' : section.index}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: isCurrent ? 600 : 400,
                color: isCurrent ? '#e2e8f0' : '#94a3b8',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {section.titlePt}
              </div>
              {hasExercise && (
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                  Exercicio interativo
                </div>
              )}
            </div>
          </button>
        )
      })}
    </nav>
  )
}

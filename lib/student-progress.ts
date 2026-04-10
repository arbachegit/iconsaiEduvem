/**
 * student-progress — busca o progresso do aluno por NR.
 *
 * Identifica o aluno pelo cookie `eduven_student_id`.
 * Query em `user_events` onde metadata->>'studentId' = X.
 *
 * Retorna um mapa nrId → NRProgress com:
 *   - contagem de aulas por dificuldade (easier/same/harder)
 *   - se exercício foi feito (sections 4/6)
 *   - se lab foi interagido
 *   - quantas seções foram vistas
 *   - quantos termos clicados
 *   - se completou (viu as 6 seções)
 */
import { getDb } from './db'

export interface NRProgress {
  nrId: number
  easierCount: number
  sameCount: number
  harderCount: number
  exerciseDone: boolean
  labInteracted: boolean
  sectionsViewed: number        // max 6
  termsClicked: number
  completed: boolean            // viu as 6 seções
  totalSessions: number
  lastAccessedAt: string | null
}

export async function getStudentProgress(studentId: string): Promise<Record<number, NRProgress>> {
  const result: Record<number, NRProgress> = {}

  if (!studentId) return result

  try {
    const db = getDb()

    // Busca TODOS os eventos deste aluno
    const { data: events, error } = await db
      .from('user_events')
      .select('event_type, metadata, created_at')
      .or(`metadata->>studentId.eq.${studentId},session_id.eq.${studentId}`)
      .order('created_at', { ascending: false })
      .limit(5000)

    if (error || !events) return result

    for (const ev of events as Array<{ event_type: string; metadata: Record<string, unknown>; created_at: string }>) {
      const meta = ev.metadata || {}
      const nrId = parseInt(String(meta.nrId || meta.nr_id || 0), 10)
      if (!nrId) continue

      if (!result[nrId]) {
        result[nrId] = {
          nrId,
          easierCount: 0,
          sameCount: 0,
          harderCount: 0,
          exerciseDone: false,
          labInteracted: false,
          sectionsViewed: 0,
          termsClicked: 0,
          completed: false,
          totalSessions: 0,
          lastAccessedAt: null,
        }
      }
      const p = result[nrId]

      switch (ev.event_type) {
        case 'lesson_open': {
          p.totalSessions++
          if (!p.lastAccessedAt) p.lastAccessedAt = ev.created_at
          const diff = String(meta.difficulty || 'same')
          if (diff === 'easier') p.easierCount++
          else if (diff === 'harder') p.harderCount++
          else p.sameCount++
          break
        }
        case 'section_view': {
          const idx = parseInt(String(meta.sectionIndex || 0), 10)
          if (idx > p.sectionsViewed) p.sectionsViewed = idx
          if (idx >= 6) p.completed = true
          break
        }
        case 'exercise_submit':
          p.exerciseDone = true
          break
        case 'lab_interact':
          p.labInteracted = true
          break
        case 'term_click':
          p.termsClicked++
          break
        case 'lesson_close': {
          const lastSec = parseInt(String(meta.lastSection || meta.last_section_index || 0), 10)
          if (lastSec > p.sectionsViewed) p.sectionsViewed = lastSec
          if (lastSec >= 6 || meta.completed) p.completed = true
          break
        }
      }
    }
  } catch (err) {
    console.warn('[student-progress] error:', (err as Error).message)
  }

  return result
}

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

/* ── types ── */
interface UserEvent {
  id: string
  type: string
  user_ip: string
  device_type: string
  metadata: Record<string, unknown>
  created_at: string
}

interface DeviceRow { device_type: string; count: number }
interface LessonRow { nr_code: string; count: number }
interface DifficultyRow { difficulty: string; count: number }
interface HourRow { hour: number; count: number }

/* ── styles ── */
const colors = {
  bg: '#050d1a',
  card: '#0c1320',
  text: '#e2e8f0',
  muted: '#94a3b8',
  accent: '#22d3ee',
  border: 'rgba(100,116,139,0.3)',
  danger: '#ef4444',
}

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  padding: '1.5rem',
}

const statNumber: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 700,
  color: colors.accent,
  margin: 0,
}

const statLabel: React.CSSProperties = {
  fontSize: '0.875rem',
  color: colors.muted,
  margin: '0.25rem 0 0 0',
}

/* ── helpers ── */
async function queryAnalytics() {
  const db = getDb()

  try {
    // Total sessions
    const { count: totalSessions } = await db
      .from('user_events')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'lesson_open')

    // Unique users (distinct user_ip)
    const { data: uniqueData } = await db
      .rpc('count_distinct_ips') as { data: { count: number }[] | null }
    // Fallback: if RPC doesn't exist, query all and count unique
    let uniqueUsers = 0
    if (uniqueData && uniqueData.length > 0) {
      uniqueUsers = uniqueData[0].count
    } else {
      const { data: allIps } = await db
        .from('user_events')
        .select('user_ip')
      if (allIps) {
        uniqueUsers = new Set(allIps.map((r: { user_ip: string }) => r.user_ip)).size
      }
    }

    // Devices
    const { data: devicesRaw } = await db
      .from('user_events')
      .select('device_type')
    const deviceMap: Record<string, number> = {}
    if (devicesRaw) {
      for (const row of devicesRaw) {
        const dt = (row as { device_type: string }).device_type || 'unknown'
        deviceMap[dt] = (deviceMap[dt] || 0) + 1
      }
    }
    const devices: DeviceRow[] = Object.entries(deviceMap)
      .map(([device_type, count]) => ({ device_type, count }))
      .sort((a, b) => b.count - a.count)

    // Top lessons
    const { data: lessonsRaw } = await db
      .from('user_events')
      .select('metadata')
      .eq('type', 'lesson_open')
    const lessonMap: Record<string, number> = {}
    if (lessonsRaw) {
      for (const row of lessonsRaw) {
        const meta = (row as { metadata: Record<string, unknown> }).metadata
        const code = (meta?.nr_code as string) || 'unknown'
        lessonMap[code] = (lessonMap[code] || 0) + 1
      }
    }
    const topLessons: LessonRow[] = Object.entries(lessonMap)
      .map(([nr_code, count]) => ({ nr_code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Difficulty
    const { data: diffRaw } = await db
      .from('user_events')
      .select('metadata')
      .eq('type', 'lesson_open')
    const diffMap: Record<string, number> = {}
    if (diffRaw) {
      for (const row of diffRaw) {
        const meta = (row as { metadata: Record<string, unknown> }).metadata
        const diff = (meta?.difficulty as string) || 'unknown'
        diffMap[diff] = (diffMap[diff] || 0) + 1
      }
    }
    const difficulties: DifficultyRow[] = Object.entries(diffMap)
      .map(([difficulty, count]) => ({ difficulty, count }))
      .sort((a, b) => b.count - a.count)

    // Peak hours
    const { data: hoursRaw } = await db
      .from('user_events')
      .select('created_at')
    const hourMap: Record<number, number> = {}
    if (hoursRaw) {
      for (const row of hoursRaw) {
        const h = new Date((row as { created_at: string }).created_at).getHours()
        hourMap[h] = (hourMap[h] || 0) + 1
      }
    }
    const peakHours: HourRow[] = Object.entries(hourMap)
      .map(([h, count]) => ({ hour: Number(h), count }))
      .sort((a, b) => b.count - a.count)

    // Recent events
    const { data: recentEvents } = await db
      .from('user_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    return {
      totalSessions: totalSessions ?? 0,
      uniqueUsers,
      devices,
      topLessons,
      difficulties,
      peakHours,
      recentEvents: (recentEvents as UserEvent[]) || [],
      error: null,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('user_events') || message.includes('relation')) {
      return { error: 'Tabela user_events nao encontrada', totalSessions: 0, uniqueUsers: 0, devices: [], topLessons: [], difficulties: [], peakHours: [], recentEvents: [] }
    }
    return { error: message, totalSessions: 0, uniqueUsers: 0, devices: [], topLessons: [], difficulties: [], peakHours: [], recentEvents: [] }
  }
}

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_eduven_session')

  if (!session || session.value !== 'valid') {
    redirect('/admin/login')
  }

  const data = await queryAnalytics()

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
          Admin —{' '}
          <span style={{ color: colors.accent }}>O Interativo Mundo da NR</span>
        </h1>
        <a
          href="/api/eduven/admin/logout"
          style={{
            backgroundColor: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '0.5rem 1.25rem',
            color: colors.muted,
            fontSize: '0.875rem',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Sair
        </a>
      </div>

      {/* Error state */}
      {data.error && (
        <div
          style={{
            ...cardStyle,
            borderColor: colors.danger,
            marginBottom: '1.5rem',
            color: colors.danger,
          }}
        >
          <strong>Erro:</strong> {data.error}
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={cardStyle}>
          <p style={statNumber}>{data.totalSessions}</p>
          <p style={statLabel}>Total de sessoes</p>
        </div>
        <div style={cardStyle}>
          <p style={statNumber}>{data.uniqueUsers}</p>
          <p style={statLabel}>Usuarios unicos</p>
        </div>
        <div style={cardStyle}>
          <p style={statNumber}>{data.devices.length}</p>
          <p style={statLabel}>Tipos de dispositivo</p>
        </div>
        <div style={cardStyle}>
          <p style={statNumber}>
            {data.peakHours.length > 0 ? `${data.peakHours[0].hour}h` : '-'}
          </p>
          <p style={statLabel}>Horario de pico</p>
        </div>
      </div>

      {/* Grid: Devices + Difficulty + Top Lessons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* Devices */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
            Dispositivos
          </h2>
          {data.devices.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Sem dados</p>
          ) : (
            data.devices.map((d) => (
              <div
                key={d.device_type}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <span>{d.device_type}</span>
                <span style={{ color: colors.accent, fontWeight: 600 }}>{d.count}</span>
              </div>
            ))
          )}
        </div>

        {/* Difficulty */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
            Dificuldade mais usada
          </h2>
          {data.difficulties.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Sem dados</p>
          ) : (
            data.difficulties.map((d) => (
              <div
                key={d.difficulty}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <span>{d.difficulty}</span>
                <span style={{ color: colors.accent, fontWeight: 600 }}>{d.count}</span>
              </div>
            ))
          )}
        </div>

        {/* Top Lessons */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
            Aulas mais acessadas (Top 10)
          </h2>
          {data.topLessons.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Sem dados</p>
          ) : (
            data.topLessons.map((l, i) => (
              <div
                key={l.nr_code}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <span>
                  <span style={{ color: colors.muted, marginRight: '0.5rem' }}>
                    {i + 1}.
                  </span>
                  {l.nr_code}
                </span>
                <span style={{ color: colors.accent, fontWeight: 600 }}>{l.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Peak Hours */}
      <div style={{ ...cardStyle, marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
          Distribuicao por horario
        </h2>
        {data.peakHours.length === 0 ? (
          <p style={{ color: colors.muted, margin: 0 }}>Sem dados</p>
        ) : (
          <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '120px' }}>
            {Array.from({ length: 24 }, (_, h) => {
              const found = data.peakHours.find((p) => p.hour === h)
              const count = found?.count || 0
              const max = data.peakHours[0]?.count || 1
              const heightPct = max > 0 ? (count / max) * 100 : 0
              return (
                <div
                  key={h}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(heightPct, 2)}%`,
                      backgroundColor: count > 0 ? colors.accent : colors.border,
                      borderRadius: '2px 2px 0 0',
                      opacity: count > 0 ? 0.8 : 0.3,
                    }}
                    title={`${h}h: ${count} eventos`}
                  />
                  <span
                    style={{
                      fontSize: '0.6rem',
                      color: colors.muted,
                      marginTop: '2px',
                    }}
                  >
                    {h}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Events Table */}
      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
          Ultimos 50 eventos
        </h2>
        {data.recentEvents.length === 0 ? (
          <p style={{ color: colors.muted, margin: 0 }}>Sem eventos registrados</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
            }}
          >
            <thead>
              <tr>
                {['Timestamp', 'Tipo', 'IP', 'Dispositivo', 'Metadata'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '0.6rem 0.75rem',
                      borderBottom: `1px solid ${colors.border}`,
                      color: colors.muted,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentEvents.map((ev) => (
                <tr key={ev.id}>
                  <td
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderBottom: `1px solid ${colors.border}`,
                      whiteSpace: 'nowrap',
                      color: colors.muted,
                    }}
                  >
                    {new Date(ev.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: 'rgba(34,211,238,0.15)',
                        color: colors.accent,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                      }}
                    >
                      {ev.type}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderBottom: `1px solid ${colors.border}`,
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                    }}
                  >
                    {ev.user_ip}
                  </td>
                  <td
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    {ev.device_type}
                  </td>
                  <td
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderBottom: `1px solid ${colors.border}`,
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: colors.muted,
                    }}
                  >
                    {JSON.stringify(ev.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

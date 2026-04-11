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
  device_os: string
  device_browser: string
  screen_width: number
  screen_height: number
  timezone: string
  connection_type: string
  dark_mode: boolean
  metadata: Record<string, unknown>
  created_at: string
}

interface DeviceRow { device_type: string; count: number }
interface LessonRow { nr_code: string; count: number }
interface DifficultyRow { difficulty: string; count: number }
interface HourRow { hour: number; count: number }
interface CountRow { label: string; count: number }

interface UserDrillDown {
  studentId: string
  lastAccess: string
  device: string
  os: string
  browser: string
  timezone: string
  location: string
  totalSessions: number
  nrsAccessed: string[]
  difficultyPreference: string
  completionRate: number
}

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

/* ── timezone → state mapping ── */
const timezoneToState: Record<string, string> = {
  'America/Sao_Paulo': 'Sao Paulo',
  'America/Bahia': 'Bahia',
  'America/Fortaleza': 'Ceara',
  'America/Recife': 'Pernambuco',
  'America/Manaus': 'Amazonas',
  'America/Belem': 'Para',
  'America/Cuiaba': 'Mato Grosso',
  'America/Porto_Velho': 'Rondonia',
  'America/Campo_Grande': 'Mato Grosso do Sul',
  'America/Rio_Branco': 'Acre',
  'America/Araguaina': 'Tocantins',
  'America/Maceio': 'Alagoas',
  'America/Noronha': 'Fernando de Noronha',
}

function resolveLocation(tz: string | null | undefined): string {
  if (!tz) return 'Desconhecido'
  return timezoneToState[tz] || tz
}

function groupAndCount(rows: { value: string }[]): CountRow[] {
  const map: Record<string, number> = {}
  for (const r of rows) {
    const v = r.value || 'unknown'
    map[v] = (map[v] || 0) + 1
  }
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

/* ── helpers ── */
async function queryAnalytics() {
  const db = getDb()

  const empty = {
    error: null as string | null,
    totalSessions: 0,
    uniqueUsers: 0,
    devices: [] as DeviceRow[],
    topLessons: [] as LessonRow[],
    difficulties: [] as DifficultyRow[],
    peakHours: [] as HourRow[],
    recentEvents: [] as UserEvent[],
    osDistribution: [] as CountRow[],
    browserDistribution: [] as CountRow[],
    geoDistribution: [] as CountRow[],
    connectionTypes: [] as CountRow[],
    screenResolutions: [] as CountRow[],
    darkModeStats: { dark: 0, light: 0 },
    completionRate: 0,
    avgDurationMs: 0,
    userDrillDown: [] as UserDrillDown[],
  }

  try {
    // Total sessions
    const { count: totalSessions } = await db
      .from('user_events')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'lesson_open')

    // Unique users (distinct user_ip)
    const { data: uniqueData } = await db
      .rpc('count_distinct_ips') as { data: { count: number }[] | null }
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

    // Fetch all events once for aggregation
    const { data: allEventsRaw } = await db
      .from('user_events')
      .select('type, device_type, device_os, device_browser, screen_width, screen_height, timezone, connection_type, dark_mode, metadata, created_at, session_id, user_ip')
      .order('created_at', { ascending: false })

    type RawEvent = {
      type: string
      device_type: string
      device_os: string
      device_browser: string
      screen_width: number
      screen_height: number
      timezone: string
      connection_type: string
      dark_mode: boolean
      metadata: Record<string, unknown>
      created_at: string
      session_id: string
      user_ip: string
    }
    const allEvents: RawEvent[] = (allEventsRaw as RawEvent[]) || []

    // Devices
    const deviceMap: Record<string, number> = {}
    for (const row of allEvents) {
      const dt = row.device_type || 'unknown'
      deviceMap[dt] = (deviceMap[dt] || 0) + 1
    }
    const devices: DeviceRow[] = Object.entries(deviceMap)
      .map(([device_type, count]) => ({ device_type, count }))
      .sort((a, b) => b.count - a.count)

    // Top lessons
    const lessonMap: Record<string, number> = {}
    for (const row of allEvents) {
      if (row.type !== 'lesson_open') continue
      const code = (row.metadata?.nr_code as string) || 'unknown'
      lessonMap[code] = (lessonMap[code] || 0) + 1
    }
    const topLessons: LessonRow[] = Object.entries(lessonMap)
      .map(([nr_code, count]) => ({ nr_code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Difficulty
    const diffMap: Record<string, number> = {}
    for (const row of allEvents) {
      if (row.type !== 'lesson_open') continue
      const diff = (row.metadata?.difficulty as string) || 'unknown'
      diffMap[diff] = (diffMap[diff] || 0) + 1
    }
    const difficulties: DifficultyRow[] = Object.entries(diffMap)
      .map(([difficulty, count]) => ({ difficulty, count }))
      .sort((a, b) => b.count - a.count)

    // Peak hours
    const hourMap: Record<number, number> = {}
    for (const row of allEvents) {
      const h = new Date(row.created_at).getHours()
      hourMap[h] = (hourMap[h] || 0) + 1
    }
    const peakHours: HourRow[] = Object.entries(hourMap)
      .map(([h, count]) => ({ hour: Number(h), count }))
      .sort((a, b) => b.count - a.count)

    // OS Distribution
    const osDistribution = groupAndCount(
      allEvents.map((r) => ({ value: r.device_os }))
    )

    // Browser Distribution
    const browserDistribution = groupAndCount(
      allEvents.map((r) => ({ value: r.device_browser }))
    )

    // Geographic Distribution (timezone → state)
    const geoDistribution = groupAndCount(
      allEvents.map((r) => ({ value: resolveLocation(r.timezone) }))
    )

    // Connection Types
    const connectionTypes = groupAndCount(
      allEvents.map((r) => ({ value: r.connection_type }))
    )

    // Screen Resolutions (top 10)
    const screenResolutions = groupAndCount(
      allEvents
        .filter((r) => r.screen_width && r.screen_height)
        .map((r) => ({ value: `${r.screen_width}x${r.screen_height}` }))
    ).slice(0, 10)

    // Dark mode stats
    let darkCount = 0
    let lightCount = 0
    for (const row of allEvents) {
      if (row.dark_mode === true) darkCount++
      else if (row.dark_mode === false) lightCount++
    }

    // Completion rate: lesson_open vs lesson_close with completed=true
    const openCount = allEvents.filter((r) => r.type === 'lesson_open').length
    const closedCompleted = allEvents.filter(
      (r) => r.type === 'lesson_close' && r.metadata?.completed === true
    ).length
    const completionRate = openCount > 0 ? Math.round((closedCompleted / openCount) * 100) : 0

    // Average duration from lesson_close events
    const durations = allEvents
      .filter((r) => r.type === 'lesson_close' && typeof r.metadata?.duration_ms === 'number')
      .map((r) => r.metadata.duration_ms as number)
    const avgDurationMs = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0

    // Per-user drill-down (group by studentId from metadata)
    const userMap = new Map<string, RawEvent[]>()
    for (const row of allEvents) {
      const sid = (row.metadata?.studentId as string) || (row.metadata?.student_id as string)
      if (!sid) continue
      if (!userMap.has(sid)) userMap.set(sid, [])
      userMap.get(sid)!.push(row)
    }

    const userDrillDown: UserDrillDown[] = []
    for (const [studentId, events] of Array.from(userMap.entries())) {
      const sorted = events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      const latest = sorted[0]
      const opens = events.filter((e) => e.type === 'lesson_open')
      const closes = events.filter((e) => e.type === 'lesson_close' && e.metadata?.completed === true)
      const nrsSet = new Set<string>()
      const diffPref: Record<string, number> = {}
      for (const e of opens) {
        const code = e.metadata?.nr_code as string
        if (code) nrsSet.add(code)
        const d = (e.metadata?.difficulty as string) || 'unknown'
        diffPref[d] = (diffPref[d] || 0) + 1
      }
      const topDiff = Object.entries(diffPref).sort((a, b) => b[1] - a[1])[0]
      const sessionsSet = new Set(events.map((e) => e.session_id).filter(Boolean))

      userDrillDown.push({
        studentId,
        lastAccess: latest.created_at,
        device: latest.device_type || '-',
        os: latest.device_os || '-',
        browser: latest.device_browser || '-',
        timezone: latest.timezone || '-',
        location: resolveLocation(latest.timezone),
        totalSessions: sessionsSet.size || 1,
        nrsAccessed: Array.from(nrsSet),
        difficultyPreference: topDiff ? topDiff[0] : '-',
        completionRate: opens.length > 0 ? Math.round((closes.length / opens.length) * 100) : 0,
      })
    }
    userDrillDown.sort((a, b) => new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime())

    // Recent events (last 50 with full fields)
    const { data: recentEvents } = await db
      .from('user_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    return {
      ...empty,
      totalSessions: totalSessions ?? 0,
      uniqueUsers,
      devices,
      topLessons,
      difficulties,
      peakHours,
      recentEvents: (recentEvents as UserEvent[]) || [],
      osDistribution,
      browserDistribution,
      geoDistribution,
      connectionTypes,
      screenResolutions,
      darkModeStats: { dark: darkCount, light: lightCount },
      completionRate,
      avgDurationMs,
      userDrillDown,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { ...empty, error: message.includes('user_events') || message.includes('relation') ? 'Tabela user_events nao encontrada' : message }
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
        <div style={cardStyle}>
          <p style={statNumber}>{data.completionRate}%</p>
          <p style={statLabel}>Taxa de conclusao</p>
        </div>
        <div style={cardStyle}>
          <p style={statNumber}>
            {data.avgDurationMs > 0
              ? data.avgDurationMs >= 60000
                ? `${Math.round(data.avgDurationMs / 60000)}min`
                : `${Math.round(data.avgDurationMs / 1000)}s`
              : '-'}
          </p>
          <p style={statLabel}>Tempo medio por aula</p>
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

      {/* Grid: OS + Browser + Connection + Dark Mode */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* OS Distribution */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
            Sistema Operacional
          </h2>
          {data.osDistribution.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Sem dados</p>
          ) : (
            data.osDistribution.map((d) => {
              const max = data.osDistribution[0]?.count || 1
              const pct = Math.round((d.count / max) * 100)
              return (
                <div key={d.label} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>{d.label}</span>
                    <span style={{ color: colors.accent, fontWeight: 600, fontSize: '0.85rem' }}>{d.count}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: colors.border, borderRadius: '3px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: colors.accent, borderRadius: '3px', opacity: 0.8 }} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Browser Distribution */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
            Navegador
          </h2>
          {data.browserDistribution.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Sem dados</p>
          ) : (
            data.browserDistribution.map((d) => {
              const max = data.browserDistribution[0]?.count || 1
              const pct = Math.round((d.count / max) * 100)
              return (
                <div key={d.label} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>{d.label}</span>
                    <span style={{ color: colors.accent, fontWeight: 600, fontSize: '0.85rem' }}>{d.count}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: colors.border, borderRadius: '3px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: colors.accent, borderRadius: '3px', opacity: 0.8 }} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Connection Types */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
            Tipo de Conexao
          </h2>
          {data.connectionTypes.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Sem dados</p>
          ) : (
            data.connectionTypes.map((d) => (
              <div
                key={d.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <span>{d.label}</span>
                <span style={{ color: colors.accent, fontWeight: 600 }}>{d.count}</span>
              </div>
            ))
          )}
        </div>

        {/* Dark Mode Stats */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
            Dark Mode
          </h2>
          {data.darkModeStats.dark + data.darkModeStats.light === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Sem dados</p>
          ) : (
            <>
              {[
                { label: 'Dark', count: data.darkModeStats.dark },
                { label: 'Light', count: data.darkModeStats.light },
              ].map((d) => {
                const total = data.darkModeStats.dark + data.darkModeStats.light
                const pct = total > 0 ? Math.round((d.count / total) * 100) : 0
                return (
                  <div key={d.label} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.85rem' }}>{d.label}</span>
                      <span style={{ color: colors.accent, fontWeight: 600, fontSize: '0.85rem' }}>{d.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: colors.border, borderRadius: '4px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: d.label === 'Dark' ? '#6366f1' : '#f59e0b', borderRadius: '4px', opacity: 0.85 }} />
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* Grid: Geographic + Screen Resolution */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* Geographic Distribution */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
            Distribuicao Geografica (por fuso)
          </h2>
          {data.geoDistribution.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Sem dados</p>
          ) : (
            data.geoDistribution.map((d, i) => (
              <div
                key={d.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <span>
                  <span style={{ color: colors.muted, marginRight: '0.5rem' }}>{i + 1}.</span>
                  {d.label}
                </span>
                <span style={{ color: colors.accent, fontWeight: 600 }}>{d.count}</span>
              </div>
            ))
          )}
        </div>

        {/* Screen Resolution */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
            Resolucao de Tela (Top 10)
          </h2>
          {data.screenResolutions.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Sem dados</p>
          ) : (
            data.screenResolutions.map((d, i) => (
              <div
                key={d.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <span>
                  <span style={{ color: colors.muted, marginRight: '0.5rem' }}>{i + 1}.</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{d.label}</span>
                </span>
                <span style={{ color: colors.accent, fontWeight: 600 }}>{d.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Per-User Drill-Down Table */}
      <div style={{ ...cardStyle, overflowX: 'auto', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: colors.accent }}>
          Detalhamento por Usuario
        </h2>
        {data.userDrillDown.length === 0 ? (
          <p style={{ color: colors.muted, margin: 0 }}>Sem dados de usuarios identificados</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8rem',
            }}
          >
            <thead>
              <tr>
                {['Aluno', 'Ultimo acesso', 'Dispositivo', 'OS', 'Navegador', 'Localizacao', 'Sessoes', 'NRs', 'Dificuldade', 'Conclusao'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '0.6rem 0.5rem',
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
              {data.userDrillDown.map((u) => (
                <tr key={u.studentId}>
                  <td style={{ padding: '0.5rem', borderBottom: `1px solid ${colors.border}`, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {u.studentId.length > 12 ? `${u.studentId.slice(0, 12)}...` : u.studentId}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: `1px solid ${colors.border}`, whiteSpace: 'nowrap', color: colors.muted }}>
                    {new Date(u.lastAccess).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: `1px solid ${colors.border}` }}>{u.device}</td>
                  <td style={{ padding: '0.5rem', borderBottom: `1px solid ${colors.border}` }}>{u.os}</td>
                  <td style={{ padding: '0.5rem', borderBottom: `1px solid ${colors.border}` }}>{u.browser}</td>
                  <td style={{ padding: '0.5rem', borderBottom: `1px solid ${colors.border}` }}>{u.location}</td>
                  <td style={{ padding: '0.5rem', borderBottom: `1px solid ${colors.border}`, textAlign: 'center', color: colors.accent, fontWeight: 600 }}>{u.totalSessions}</td>
                  <td style={{ padding: '0.5rem', borderBottom: `1px solid ${colors.border}`, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={u.nrsAccessed.join(', ')}
                  >
                    {u.nrsAccessed.length > 0 ? u.nrsAccessed.join(', ') : '-'}
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ backgroundColor: 'rgba(34,211,238,0.15)', color: colors.accent, padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                      {u.difficultyPreference}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: `1px solid ${colors.border}`, textAlign: 'center', fontWeight: 600, color: u.completionRate >= 50 ? '#22c55e' : colors.danger }}>
                    {u.completionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

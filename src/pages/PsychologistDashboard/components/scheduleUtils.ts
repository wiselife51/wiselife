export interface ScheduleBlockRow {
  id: string
  block_date: string
  start_time: string
  end_time: string
  reason: string | null
}

export type BlockScope = 'dia' | 'semana' | 'mes'

export const WEEKEND_REASONS = ['Domingo - Dia no laboral', 'Sabado - Dia no laboral']
export const MONTH_CLOSED_REASON = 'Mes bloqueado - Configura tu agenda'
export const AUTO_BLOCK_REASONS = [...WEEKEND_REASONS, MONTH_CLOSED_REASON]

export const FULL_DAY_START = '00:00'
export const FULL_DAY_END = '23:59'

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const pad2 = (n: number) => String(n).padStart(2, '0')

export const toKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
export const fromKey = (key: string) => new Date(`${key}T12:00:00`)
export const isWeekendKey = (key: string) => {
  const day = fromKey(key).getDay()
  return day === 0 || day === 6
}
export const addDaysKey = (key: string, amount: number) => {
  const d = fromKey(key)
  d.setDate(d.getDate() + amount)
  return toKey(d)
}
const timeOf = (t: string) => t.slice(0, 5)

/** Lunes y viernes de la semana que contiene `key`. */
export function getWorkWeek(key: string) {
  const d = fromKey(key)
  const monday = addDaysKey(key, -((d.getDay() + 6) % 7))
  return { monday, friday: addDaysKey(monday, 4) }
}

export function datesOfMonth(year: number, month: number) {
  const last = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: last }, (_, i) => `${year}-${pad2(month + 1)}-${pad2(i + 1)}`)
}

/** Dias que se bloquearian segun el alcance elegido (sin pasado ni dias ya bloqueados). */
export function buildBlockDates(scope: BlockScope, value: string, todayKey: string, alreadyBlocked: Set<string>) {
  let dates: string[] = []
  if (scope === 'dia') {
    dates = value ? [value] : []
  } else if (scope === 'semana') {
    if (value) {
      const { monday } = getWorkWeek(value)
      dates = Array.from({ length: 5 }, (_, i) => addDaysKey(monday, i))
    }
  } else if (value) {
    const [year, month] = value.split('-').map(Number)
    dates = datesOfMonth(year, month - 1).filter((key) => !isWeekendKey(key))
  }
  return dates.filter((key) => key >= todayKey && !alreadyBlocked.has(key))
}

export interface MonthState {
  key: string
  year: number
  month: number
  label: string
  total: number
  closed: number
  status: 'open' | 'closed' | 'partial'
}

/** Estado de los proximos 12 meses segun los bloqueos automaticos de "mes cerrado". */
export function getMonthStates(blocks: ScheduleBlockRow[], today: Date): MonthState[] {
  const todayKey = toKey(today)
  const closedDates = new Set(blocks.filter((b) => b.reason === MONTH_CLOSED_REASON).map((b) => b.block_date))
  return Array.from({ length: 12 }, (_, offset) => {
    const ref = new Date(today.getFullYear(), today.getMonth() + offset, 1)
    const year = ref.getFullYear()
    const month = ref.getMonth()
    const workDates = datesOfMonth(year, month).filter((key) => key >= todayKey && !isWeekendKey(key))
    const closed = workDates.filter((key) => closedDates.has(key)).length
    const total = workDates.length
    const status = closed === 0 ? 'open' : closed === total ? 'closed' : 'partial'
    return { key: `${year}-${pad2(month + 1)}`, year, month, label: `${MONTH_NAMES[month]} ${year}`, total, closed, status }
  })
}

export interface BlockGroup {
  key: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  reason: string
  ids: string[]
  days: number
  full: boolean
  kind: 'dia' | 'semana' | 'mes'
}

const isFullDay = (start: string, end: string) => start <= '07:00' && end >= '21:00'

/**
 * Agrupa los bloqueos creados por la psicologa: une horas contiguas de un mismo
 * dia y dias completos consecutivos (los fines de semana intermedios no cortan
 * el rango). Los bloqueos automaticos (fines de semana, meses cerrados) se ocultan.
 */
export function groupUserBlocks(blocks: ScheduleBlockRow[], todayKey: string): BlockGroup[] {
  const userBlocks = blocks.filter(
    (b) => b.block_date >= todayKey && !AUTO_BLOCK_REASONS.includes(b.reason ?? ''),
  )
  const byDate = new Map<string, ScheduleBlockRow[]>()
  for (const block of userBlocks) {
    byDate.set(block.block_date, [...(byDate.get(block.block_date) ?? []), block])
  }

  type DayEntry = { date: string; start: string; end: string; reason: string; ids: string[] }
  const entries: DayEntry[] = []
  for (const [date, rows] of [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const sorted = [...rows].sort((a, b) => timeOf(a.start_time).localeCompare(timeOf(b.start_time)))
    let current: DayEntry | null = null
    for (const row of sorted) {
      const start = timeOf(row.start_time)
      const end = timeOf(row.end_time)
      if (current && start <= current.end) {
        if (end > current.end) current.end = end
        current.ids.push(row.id)
        if (!current.reason && row.reason) current.reason = row.reason
      } else {
        current = { date, start, end, reason: row.reason ?? '', ids: [row.id] }
        entries.push(current)
      }
    }
  }

  const groups: BlockGroup[] = []
  const makeGroup = (entry: DayEntry): BlockGroup => ({
    key: `${entry.date}-${entry.start}-${entry.ids[0]}`,
    startDate: entry.date,
    endDate: entry.date,
    startTime: entry.start,
    endTime: entry.end,
    reason: entry.reason,
    ids: [...entry.ids],
    days: 1,
    full: isFullDay(entry.start, entry.end),
    kind: 'dia',
  })

  let open: BlockGroup | null = null
  const onlyWeekendsBetween = (from: string, to: string) => {
    for (let key = addDaysKey(from, 1); key < to; key = addDaysKey(key, 1)) {
      if (!isWeekendKey(key)) return false
    }
    return true
  }

  for (const entry of entries) {
    const group = makeGroup(entry)
    if (
      open && open.full && group.full &&
      open.reason === group.reason &&
      onlyWeekendsBetween(open.endDate, group.startDate)
    ) {
      open.endDate = group.startDate
      open.ids.push(...group.ids)
      open.days += 1
      continue
    }
    groups.push(group)
    open = group.full ? group : null
  }

  return groups.map((group) => {
    const span = Math.round((fromKey(group.endDate).getTime() - fromKey(group.startDate).getTime()) / 86400000) + 1
    return { ...group, kind: span > 7 ? 'mes' : span > 1 ? 'semana' : 'dia' }
  })
}

const shortDate = (key: string, withWeekday = false) =>
  fromKey(key).toLocaleDateString('es-CO', {
    ...(withWeekday ? { weekday: 'short' as const } : {}),
    day: 'numeric',
    month: 'short',
  }).replace('.', '')

export function formatGroupTitle(group: BlockGroup) {
  if (group.startDate === group.endDate) return shortDate(group.startDate, true)
  return `${shortDate(group.startDate)} - ${shortDate(group.endDate)}`
}

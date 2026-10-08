import { useMemo, useState } from 'react'
import { DashboardModuleHeader } from './DashboardModuleHeader'
import {
  MONTH_NAMES,
  buildBlockDates,
  formatGroupTitle,
  getWorkWeek,
  groupUserBlocks,
  isWeekendKey,
  toKey,
  type BlockGroup,
  type BlockScope,
  type ScheduleBlockRow,
} from './scheduleUtils'

type Filter = 'todos' | BlockScope

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'dia', label: 'Días' },
  { value: 'semana', label: 'Semanas' },
  { value: 'mes', label: 'Meses' },
]

const SCOPES: { value: BlockScope; label: string }[] = [
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
]

const KIND_LABEL: Record<BlockGroup['kind'], string> = { dia: 'Día', semana: 'Semana', mes: 'Mes' }

export interface CreateBlocksInput {
  dates: string[]
  start: string
  end: string
  reason: string
}

interface BlocksModuleProps {
  blocks: ScheduleBlockRow[]
  today: Date
  hourOptions: string[]
  onMenu: () => void
  menuOpen: boolean
  onCreate: (input: CreateBlocksInput) => Promise<void>
  onDelete: (ids: string[]) => Promise<void>
}

export function BlocksModule({ blocks, today, hourOptions, onMenu, menuOpen, onCreate, onDelete }: BlocksModuleProps) {
  const todayKey = toKey(today)
  const [filter, setFilter] = useState<Filter>('todos')
  const [confirmKey, setConfirmKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [scope, setScope] = useState<BlockScope>('dia')
  const [dateValue, setDateValue] = useState('')
  const [monthValue, setMonthValue] = useState(todayKey.slice(0, 7))
  const [allDay, setAllDay] = useState(true)
  const [start, setStart] = useState('08:00')
  const [end, setEnd] = useState('09:00')
  const [reason, setReason] = useState('')

  const groups = useMemo(() => groupUserBlocks(blocks, todayKey), [blocks, todayKey])
  const visible = filter === 'todos' ? groups : groups.filter((g) => g.kind === filter)

  const fullyBlocked = useMemo(
    () => new Set(
      blocks
        .filter((b) => b.start_time.slice(0, 5) <= '07:00' && b.end_time.slice(0, 5) >= '21:00')
        .map((b) => b.block_date),
    ),
    [blocks],
  )

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => {
      const ref = new Date(today.getFullYear(), today.getMonth() + i, 1)
      return { value: `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, '0')}`, label: `${MONTH_NAMES[ref.getMonth()]} ${ref.getFullYear()}` }
    }),
    [today],
  )

  const formValue = scope === 'mes' ? monthValue : dateValue
  const targetDates = buildBlockDates(scope, formValue, todayKey, fullyBlocked)
  const invalidRange = !allDay && end <= start
  const weekRange = scope === 'semana' && dateValue ? getWorkWeek(dateValue) : null
  const canSave = targetDates.length > 0 && !invalidRange && !busy

  const run = async (task: () => Promise<void>) => {
    setBusy(true)
    try {
      await task()
    } finally {
      setBusy(false)
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setDateValue('')
    setReason('')
    setAllDay(true)
  }

  const submit = () =>
    run(async () => {
      await onCreate({
        dates: targetDates,
        start: allDay ? '00:00' : start,
        end: allDay ? '23:59' : end,
        reason: reason.trim(),
      })
      closeForm()
    })

  const handleDelete = (group: BlockGroup) => {
    if (confirmKey !== group.key) {
      setConfirmKey(group.key)
      return
    }
    setConfirmKey(null)
    run(() => onDelete(group.ids))
  }

  const helper = () => {
    if (!formValue) return scope === 'mes' ? '' : 'Elige una fecha para continuar.'
    if (targetDates.length === 0) return 'Esas fechas ya están bloqueadas o pertenecen al pasado.'
    if (scope === 'dia') return isWeekendKey(targetDates[0]) ? 'Se bloqueará este día.' : 'Se bloqueará 1 día.'
    return `Se bloquearán ${targetDates.length} días hábiles (los fines de semana ya están bloqueados).`
  }

  return (
    <section className="psy-alert-page psy-macro-page" aria-busy={busy}>
      <DashboardModuleHeader
        title="Bloqueos de horario"
        subtitle="Bloquea días, semanas o meses en los que no atenderás."
        count={groups.length}
        onMenu={onMenu}
        menuOpen={menuOpen}
      />

      <div className="psy-macro-toolbar">
        <div className="psy-segmented" role="tablist" aria-label="Filtrar bloqueos">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              className={`psy-segmented-btn${filter === item.value ? ' psy-segmented-btn--active' : ''}`}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button type="button" className="psy-macro-add" onClick={() => setShowForm(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span>Bloquear</span>
        </button>
      </div>

      <div className="psy-alert-list psy-macro-body">
        <p className="psy-macro-note">Los fines de semana y los meses cerrados se bloquean automáticamente. Los meses se gestionan desde Mi Agenda.</p>

        {visible.length === 0 ? (
          <div className="psy-dash-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
            <p>{groups.length === 0 ? 'No tienes bloqueos configurados.' : 'No hay bloqueos de este tipo.'}</p>
          </div>
        ) : (
          visible.map((group) => (
            <div key={group.key} className="psy-macro-row psy-macro-row--block">
              <span className="psy-macro-day-name">
                <strong>{formatGroupTitle(group)}</strong>
                <small>
                  {group.full ? `Todo el día${group.days > 1 ? ` · ${group.days} días` : ''}` : `${group.startTime} - ${group.endTime}`}
                  {group.reason ? ` · ${group.reason}` : ''}
                </small>
              </span>
              <span className="psy-macro-chip psy-macro-chip--off">{KIND_LABEL[group.kind]}</span>
              <button
                type="button"
                className={`psy-macro-icon-btn psy-macro-icon-btn--danger${confirmKey === group.key ? ' psy-macro-icon-btn--confirm' : ''}`}
                aria-label={confirmKey === group.key ? 'Confirmar eliminación' : 'Eliminar bloqueo'}
                title={confirmKey === group.key ? 'Toca de nuevo para confirmar' : 'Eliminar'}
                disabled={busy}
                onBlur={() => setConfirmKey((current) => (current === group.key ? null : current))}
                onClick={() => handleDelete(group)}
              >
                {confirmKey === group.key ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="psy-dash-modal-backdrop" onClick={closeForm}>
          <div className="psy-dash-modal" role="dialog" aria-modal="true" aria-label="Bloquear horario" onClick={(e) => e.stopPropagation()}>
            <h3>Bloquear horario</h3>
            <div className="psy-segmented psy-segmented--full" role="tablist" aria-label="Alcance del bloqueo">
              {SCOPES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={scope === item.value}
                  className={`psy-segmented-btn${scope === item.value ? ' psy-segmented-btn--active' : ''}`}
                  onClick={() => setScope(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="psy-dash-modal-fields">
              {scope === 'mes' ? (
                <div className="psy-dash-modal-field">
                  <label htmlFor="block-month">Mes</label>
                  <select id="block-month" value={monthValue} onChange={(e) => setMonthValue(e.target.value)}>
                    {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              ) : (
                <div className="psy-dash-modal-field">
                  <label htmlFor="block-date">{scope === 'semana' ? 'Un día de la semana' : 'Fecha'}</label>
                  <input id="block-date" type="date" value={dateValue} min={todayKey} onChange={(e) => setDateValue(e.target.value)} />
                  {weekRange && <small className="psy-macro-hint">Lun {weekRange.monday.slice(5).split('-').reverse().join('/')} al Vie {weekRange.friday.slice(5).split('-').reverse().join('/')}</small>}
                </div>
              )}

              <div className="psy-macro-toggle-row">
                <label htmlFor="block-allday">Todo el día</label>
                <button
                  id="block-allday"
                  type="button"
                  role="switch"
                  aria-checked={allDay}
                  className={`psy-switch${allDay ? ' psy-switch--on' : ''}`}
                  onClick={() => setAllDay((v) => !v)}
                >
                  <span className="psy-switch-thumb" />
                </button>
              </div>

              {!allDay && (
                <div className="psy-dash-modal-row">
                  <div className="psy-dash-modal-field">
                    <label htmlFor="block-start">Desde</label>
                    <select id="block-start" value={start} onChange={(e) => setStart(e.target.value)}>
                      {hourOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="psy-dash-modal-field">
                    <label htmlFor="block-end">Hasta</label>
                    <select id="block-end" value={end} onChange={(e) => setEnd(e.target.value)}>
                      {hourOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {invalidRange && <small className="psy-macro-hint psy-macro-hint--error">La hora final debe ser posterior a la inicial.</small>}

              <div className="psy-dash-modal-field">
                <label htmlFor="block-reason">Razón (opcional)</label>
                <input id="block-reason" type="text" value={reason} maxLength={80} onChange={(e) => setReason(e.target.value)} placeholder="Vacaciones, capacitación..." />
              </div>
              <small className="psy-macro-hint">{helper()}</small>
            </div>

            <div className="psy-dash-modal-actions">
              <button type="button" className="psy-dash-btn-ghost" onClick={closeForm}>Cancelar</button>
              <button type="button" className="psy-dash-btn-primary" onClick={submit} disabled={!canSave}>
                {busy ? 'Guardando...' : targetDates.length > 1 ? `Bloquear ${targetDates.length} días` : 'Bloquear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

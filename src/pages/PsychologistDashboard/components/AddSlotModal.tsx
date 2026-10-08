import { useEffect, useMemo, useState } from 'react'
import { getMonthStates, type ScheduleBlockRow } from './scheduleUtils'

export interface AvailabilitySlotLike {
  day_of_week: number
  start_time: string
  end_time: string
}

export interface CreateSlotsInput {
  days: number[]
  start: string
  end: string
  months: { year: number; month: number }[]
}

type SlotScope = 'dia' | 'semana' | 'mes'

const SCOPES: { value: SlotScope; label: string }[] = [
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
]

const DAYS = [
  { value: 1, short: 'Lun', full: 'lunes' },
  { value: 2, short: 'Mar', full: 'martes' },
  { value: 3, short: 'Mié', full: 'miércoles' },
  { value: 4, short: 'Jue', full: 'jueves' },
  { value: 5, short: 'Vie', full: 'viernes' },
  { value: 6, short: 'Sáb', full: 'sábado' },
  { value: 0, short: 'Dom', full: 'domingo' },
]

const WORK_DAYS = [1, 2, 3, 4, 5]
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 0]

const SHORT_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const SCOPE_HINT: Record<SlotScope, string> = {
  dia: 'Elige un día y el rango de horas. Se repite cada semana.',
  semana: 'Elige uno o varios días de la semana con el mismo rango de horas.',
  mes: 'Aplica el horario a los días elegidos y abre los meses seleccionados.',
}

const timeOf = (t: string) => t.slice(0, 5)

interface AddSlotModalProps {
  initialDay: number
  availability: AvailabilitySlotLike[]
  blocks: ScheduleBlockRow[]
  today: Date
  hourOptions: string[]
  onClose: () => void
  onSave: (input: CreateSlotsInput) => Promise<void>
}

export function AddSlotModal({ initialDay, availability, blocks, today, hourOptions, onClose, onSave }: AddSlotModalProps) {
  const [scope, setScope] = useState<SlotScope>('dia')
  const [days, setDays] = useState<number[]>([initialDay])
  const [start, setStart] = useState('08:00')
  const [end, setEnd] = useState('09:00')
  const [months, setMonths] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const monthStates = useMemo(() => getMonthStates(blocks, today), [blocks, today])
  const endOptions = hourOptions.filter((h) => h > start)
  const validRange = end > start

  const changeScope = (next: SlotScope) => {
    setScope(next)
    if (next === 'dia') setDays((current) => [current[0] ?? initialDay])
    if (next === 'mes' && days.length < 2) setDays(WORK_DAYS)
  }

  const toggleDay = (value: number) => {
    if (scope === 'dia') {
      setDays([value])
      return
    }
    setDays((current) => (current.includes(value) ? current.filter((d) => d !== value) : [...current, value]))
  }

  const toggleMonth = (key: string) =>
    setMonths((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]))

  const changeStart = (value: string) => {
    setStart(value)
    if (end <= value) {
      const next = hourOptions.find((h) => h > value)
      if (next) setEnd(next)
    }
  }

  const overlaps = (day: number) =>
    availability.some((slot) => slot.day_of_week === day && timeOf(slot.start_time) < end && timeOf(slot.end_time) > start)

  const freeDays = days.filter((d) => !overlaps(d))
  const skipped = days.length - freeDays.length
  const selectedMonths = monthStates.filter((m) => months.includes(m.key) && m.status !== 'open')
  const canSave = validRange && !saving && (freeDays.length > 0 || selectedMonths.length > 0)

  const daysLabel = DAYS.filter((d) => freeDays.includes(d.value)).map((d) => d.short).join(', ')

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await onSave({
        days: freeDays,
        start,
        end,
        months: selectedMonths.map((m) => ({ year: m.year, month: m.month })),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="psy-dash-modal-backdrop" onClick={onClose}>
      <div
        className="psy-dash-modal psy-slot-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="psy-slot-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="psy-slot-head">
          <div className="psy-slot-head-text">
            <h3 id="psy-slot-title">Agregar horario</h3>
            <p>{SCOPE_HINT[scope]}</p>
          </div>
          <button type="button" className="psy-macro-icon-btn" aria-label="Cerrar" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="psy-segmented psy-segmented--full" role="tablist" aria-label="Alcance del horario">
          {SCOPES.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={scope === item.value}
              className={`psy-segmented-btn${scope === item.value ? ' psy-segmented-btn--active' : ''}`}
              onClick={() => changeScope(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="psy-slot-section">
          <div className="psy-slot-label-row">
            <span className="psy-slot-label">{scope === 'dia' ? 'Día' : 'Días de la semana'}</span>
            {scope !== 'dia' && (
              <span className="psy-slot-quick">
                <button type="button" onClick={() => setDays(WORK_DAYS)}>Lun - Vie</button>
                <button type="button" onClick={() => setDays(ALL_DAYS)}>Todos</button>
                <button type="button" onClick={() => setDays([])}>Ninguno</button>
              </span>
            )}
          </div>
          <div className="psy-macro-days" role="group" aria-label="Días de la semana">
            {DAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                aria-pressed={days.includes(d.value)}
                className={`psy-macro-day${days.includes(d.value) ? ' psy-macro-day--active' : ''}`}
                onClick={() => toggleDay(d.value)}
              >
                <span>{d.short}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="psy-slot-section">
          <span className="psy-slot-label">Horas</span>
          <div className="psy-dash-modal-row psy-slot-hours">
            <div className="psy-dash-modal-field">
              <label htmlFor="psy-slot-start">Inicio</label>
              <select id="psy-slot-start" value={start} onChange={(e) => changeStart(e.target.value)}>
                {hourOptions.slice(0, -1).map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="psy-dash-modal-field">
              <label htmlFor="psy-slot-end">Fin</label>
              <select id="psy-slot-end" value={end} onChange={(e) => setEnd(e.target.value)}>
                {endOptions.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>

        {scope === 'mes' && (
          <div className="psy-slot-section">
            <div className="psy-slot-label-row">
              <span className="psy-slot-label">Meses a abrir</span>
              <span className="psy-slot-quick">
                <button type="button" onClick={() => setMonths(monthStates.filter((m) => m.status !== 'open').map((m) => m.key))}>Todos</button>
                <button type="button" onClick={() => setMonths([])}>Ninguno</button>
              </span>
            </div>
            <div className="psy-slot-months" role="group" aria-label="Meses">
              {monthStates.map((m) => {
                const isOpen = m.status === 'open'
                return (
                  <button
                    key={m.key}
                    type="button"
                    disabled={isOpen || m.total === 0}
                    aria-pressed={months.includes(m.key)}
                    className={`psy-slot-month${months.includes(m.key) ? ' psy-slot-month--active' : ''}`}
                    onClick={() => toggleMonth(m.key)}
                  >
                    <span>{SHORT_MONTHS[m.month]}</span>
                    <small>{isOpen ? 'Abierto' : m.year}</small>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className={`psy-slot-summary${!validRange || (freeDays.length === 0 && selectedMonths.length === 0) ? ' psy-slot-summary--warn' : ''}`} aria-live="polite">
          {!validRange ? (
            <span>La hora de fin debe ser posterior a la de inicio.</span>
          ) : freeDays.length === 0 && selectedMonths.length === 0 ? (
            <span>{days.length === 0 ? 'Selecciona al menos un día.' : 'Esos días ya tienen un horario en ese rango.'}</span>
          ) : (
            <>
              {freeDays.length > 0 && <strong>{daysLabel} · {start} - {end}</strong>}
              {selectedMonths.length > 0 && <span>Se abrirán {selectedMonths.length} {selectedMonths.length === 1 ? 'mes' : 'meses'}.</span>}
              {skipped > 0 && <span>{skipped} {skipped === 1 ? 'día omitido' : 'días omitidos'} por horario existente.</span>}
            </>
          )}
        </div>

        <div className="psy-dash-modal-actions">
          <button type="button" className="psy-dash-btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="button" className="psy-dash-btn-primary" onClick={handleSave} disabled={!canSave}>
            {saving ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

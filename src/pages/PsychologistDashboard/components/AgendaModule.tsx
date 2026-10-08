import { useState } from 'react'
import { DashboardModuleHeader } from './DashboardModuleHeader'
import { getMonthStates, type ScheduleBlockRow } from './scheduleUtils'

interface AvailabilitySlotRow {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

type AgendaScope = 'dia' | 'semana' | 'mes'

const SCOPES: { value: AgendaScope; label: string }[] = [
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
]

const DAYS = [
  { value: 1, short: 'Lun', full: 'Lunes' },
  { value: 2, short: 'Mar', full: 'Martes' },
  { value: 3, short: 'Mié', full: 'Miércoles' },
  { value: 4, short: 'Jue', full: 'Jueves' },
  { value: 5, short: 'Vie', full: 'Viernes' },
  { value: 6, short: 'Sáb', full: 'Sábado' },
  { value: 0, short: 'Dom', full: 'Domingo' },
]

const MONTH_STATUS_LABEL = { open: 'Abierto', closed: 'Cerrado', partial: 'Parcial' } as const

interface AgendaModuleProps {
  availability: AvailabilitySlotRow[]
  blocks: ScheduleBlockRow[]
  today: Date
  selectedDay: number
  onSelectDay: (day: number) => void
  onMenu: () => void
  menuOpen: boolean
  onAddSlot: (day: number) => void
  onToggleSlot: (id: string, current: boolean) => Promise<void>
  onDeleteSlot: (id: string) => Promise<void>
  onSetDays: (days: number[], available: boolean) => Promise<void>
  onSetMonthOpen: (year: number, month: number, open: boolean) => Promise<void>
}

function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`psy-switch${checked ? ' psy-switch--on' : ''}`}
      onClick={onChange}
    >
      <span className="psy-switch-thumb" />
    </button>
  )
}

export function AgendaModule({
  availability,
  blocks,
  today,
  selectedDay,
  onSelectDay,
  onMenu,
  menuOpen,
  onAddSlot,
  onToggleSlot,
  onDeleteSlot,
  onSetDays,
  onSetMonthOpen,
}: AgendaModuleProps) {
  const [scope, setScope] = useState<AgendaScope>('dia')
  const [busy, setBusy] = useState(false)

  const run = async (task: () => Promise<void>) => {
    setBusy(true)
    try {
      await task()
    } finally {
      setBusy(false)
    }
  }

  const activeCount = availability.filter((s) => s.is_available).length
  const daySlots = availability
    .filter((s) => s.day_of_week === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
  const dayActive = daySlots.filter((s) => s.is_available).length
  const selectedDayInfo = DAYS.find((d) => d.value === selectedDay) ?? DAYS[0]
  const allDays = DAYS.map((d) => d.value)
  const months = getMonthStates(blocks, today)

  const statsOf = (day: number) => {
    const slots = availability.filter((s) => s.day_of_week === day)
    return { total: slots.length, active: slots.filter((s) => s.is_available).length }
  }

  return (
    <section className="psy-alert-page psy-macro-page" aria-busy={busy}>
      <DashboardModuleHeader
        title="Mi Agenda"
        subtitle="Activa tus horarios por día, semana o mes completo."
        count={activeCount}
        onMenu={onMenu}
        menuOpen={menuOpen}
      />

      <div className="psy-macro-toolbar">
        <div className="psy-segmented" role="tablist" aria-label="Alcance de la agenda">
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
        <button type="button" className="psy-macro-add" onClick={() => onAddSlot(selectedDay)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span>Horario</span>
        </button>
      </div>

      <div className="psy-alert-list psy-macro-body">
        {scope === 'dia' && (
          <>
            <div className="psy-macro-days" role="group" aria-label="Día de la semana">
              {DAYS.map((d) => {
                const { active } = statsOf(d.value)
                return (
                  <button
                    key={d.value}
                    type="button"
                    aria-pressed={selectedDay === d.value}
                    className={`psy-macro-day${selectedDay === d.value ? ' psy-macro-day--active' : ''}`}
                    onClick={() => onSelectDay(d.value)}
                  >
                    <span>{d.short}</span>
                    {active > 0 && <small>{active}</small>}
                  </button>
                )
              })}
            </div>

            <div className="psy-macro-summary">
              <div>
                <strong>{selectedDayInfo.full}</strong>
                <small>{dayActive} de {daySlots.length} horarios activos</small>
              </div>
              <div className="psy-macro-summary-actions">
                <button type="button" disabled={busy || daySlots.length === 0 || dayActive === daySlots.length} onClick={() => run(() => onSetDays([selectedDay], true))}>Activar todo</button>
                <button type="button" disabled={busy || dayActive === 0} onClick={() => run(() => onSetDays([selectedDay], false))}>Desactivar</button>
              </div>
            </div>

            {daySlots.length === 0 ? (
              <div className="psy-dash-empty">
                <p>No hay horarios configurados para este día.</p>
                <button type="button" className="psy-dash-btn-outline" onClick={() => onAddSlot(selectedDay)}>Agregar horario</button>
              </div>
            ) : (
              daySlots.map((slot) => (
                <div key={slot.id} className={`psy-macro-row${slot.is_available ? '' : ' psy-macro-row--off'}`}>
                  <span className="psy-macro-time">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                  <span className={`psy-macro-chip psy-macro-chip--${slot.is_available ? 'ok' : 'off'}`}>{slot.is_available ? 'Disponible' : 'No disponible'}</span>
                  <Switch
                    checked={slot.is_available}
                    disabled={busy}
                    label={slot.is_available ? 'Desactivar horario' : 'Activar horario'}
                    onChange={() => run(() => onToggleSlot(slot.id, slot.is_available))}
                  />
                  <button type="button" className="psy-macro-icon-btn psy-macro-icon-btn--danger" aria-label="Eliminar horario" title="Eliminar" disabled={busy} onClick={() => run(() => onDeleteSlot(slot.id))}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {scope === 'semana' && (
          <>
            <div className="psy-macro-summary">
              <div>
                <strong>Semana tipo</strong>
                <small>Se repite cada semana</small>
              </div>
              <div className="psy-macro-summary-actions">
                <button type="button" disabled={busy || availability.length === 0 || activeCount === availability.length} onClick={() => run(() => onSetDays(allDays, true))}>Activar semana</button>
                <button type="button" disabled={busy || activeCount === 0} onClick={() => run(() => onSetDays(allDays, false))}>Desactivar</button>
              </div>
            </div>
            {DAYS.map((d) => {
              const { total, active } = statsOf(d.value)
              return (
                <div key={d.value} className={`psy-macro-row${total > 0 && active === 0 ? ' psy-macro-row--off' : ''}`}>
                  <span className="psy-macro-day-name">
                    <strong>{d.full}</strong>
                    <small>{total === 0 ? 'Sin horarios' : `${active} de ${total} activos`}</small>
                  </span>
                  <button
                    type="button"
                    className="psy-macro-icon-btn"
                    aria-label={`Editar horarios del ${d.full}`}
                    title="Ver horarios"
                    onClick={() => { onSelectDay(d.value); setScope('dia') }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                  <Switch
                    checked={total > 0 && active === total}
                    disabled={busy || total === 0}
                    label={active === total && total > 0 ? `Desactivar ${d.full}` : `Activar ${d.full}`}
                    onChange={() => run(() => onSetDays([d.value], !(total > 0 && active === total)))}
                  />
                </div>
              )
            })}
          </>
        )}

        {scope === 'mes' && (
          <>
            <p className="psy-macro-note">Abre o cierra meses completos. Un mes cerrado no recibe reservas; los fines de semana se mantienen bloqueados.</p>
            {months.map((m) => (
              <div key={m.key} className={`psy-macro-row${m.status === 'closed' ? ' psy-macro-row--off' : ''}`}>
                <span className="psy-macro-day-name">
                  <strong>{m.label}</strong>
                  <small>{m.total} días hábiles</small>
                </span>
                <span className={`psy-macro-chip psy-macro-chip--${m.status === 'open' ? 'ok' : m.status === 'partial' ? 'warn' : 'off'}`}>{MONTH_STATUS_LABEL[m.status]}</span>
                <Switch
                  checked={m.status === 'open'}
                  disabled={busy || m.total === 0}
                  label={m.status === 'open' ? `Cerrar ${m.label}` : `Abrir ${m.label}`}
                  onChange={() => run(() => onSetMonthOpen(m.year, m.month, m.status !== 'open'))}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  )
}

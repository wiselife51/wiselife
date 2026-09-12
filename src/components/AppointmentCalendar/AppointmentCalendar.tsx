import React, { useEffect, useMemo, useState } from 'react';
import { toDateStr } from '../../lib/date';
import { STATUS_META } from './status';
import type { CalendarAppointment, CalendarView } from './status';
import './AppointmentCalendar.css';

const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const DAY_FULL = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);

function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length < 42) cells.push(null);
  return cells;
}

function weekGrid(anchor: Date): Date[] {
  const start = new Date(anchor);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ap = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ap}`;
}

interface AppointmentCalendarProps {
  appointments: CalendarAppointment[];
  /** Fechas YYYY-MM-DD bloqueadas por el profesional (vista mes). */
  blockedDates?: string[];
  /** Indica si una hora puntual de un dia esta bloqueada (vistas semana/dia). */
  isHourBlocked?: (dateKey: string, hour: number) => boolean;
  /** Alterna el bloqueo de una hora puntual al hacer click en una celda vacia (vistas semana/dia). */
  onToggleHourBlock?: (dateKey: string, hour: number) => void;
  /** Si se pasa, se habilita arrastrar una cita a otro dia. */
  onReschedule?: (appointment: CalendarAppointment, newDate: string) => Promise<void> | void;
  /** Acciones rapidas del panel lateral, propias de cada panel. */
  renderActions?: (appointment: CalendarAppointment) => React.ReactNode;
  /** Acciones sobre la jornada completa (bloquear el dia, anadir hueco...). Solo se usan en la vista mes. */
  renderDayActions?: (dateKey: string) => React.ReactNode;
  onSelect?: (appointment: CalendarAppointment) => void;
  emptyLabel?: string;
  onVisibleAppointmentsChange?: (appointments: CalendarAppointment[]) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  blockedDates = [],
  isHourBlocked,
  onToggleHourBlock,
  onReschedule,
  renderActions,
  renderDayActions,
  onSelect,
  emptyLabel = 'Sin citas en esta fecha.',
  onVisibleAppointmentsChange,
}) => {
  const [view, setView] = useState<CalendarView>('month');
  const [cursor, setCursor] = useState(new Date());
  // El panel lateral (lista de citas + bloquear/abrir el dia) solo aplica a
  // la vista mes: en semana y dia, el bloqueo se hace celda por hora.
  const [panelDay, setPanelDay] = useState<string | null>(null);

  const changeView = (v: CalendarView) => {
    setView(v);
    if (v !== 'month') setPanelDay(null);
  };

  const [dragging, setDragging] = useState<CalendarAppointment | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [pending, setPending] = useState<{ appt: CalendarAppointment; date: string } | null>(null);
  const [saving, setSaving] = useState(false);
  // Al hacer click en una celda vacia (semana/dia) no se alterna el bloqueo
  // de inmediato: se pide confirmacion con el mismo lenguaje visual que el
  // resto de acciones de agenda (bloquear/abrir), para evitar bloqueos por
  // error con un solo click.
  const [hourDialog, setHourDialog] = useState<{ dateKey: string; hour: number } | null>(null);

  const todayKey = toDateStr(new Date());

  const visible = useMemo(() => appointments, [appointments]);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    for (const a of visible) {
      const list = map.get(a.appointment_date) || [];
      list.push(a);
      map.set(a.appointment_date, list);
    }
    for (const list of map.values()) list.sort((x, y) => x.start_time.localeCompare(y.start_time));
    return map;
  }, [visible]);

  const blocked = useMemo(() => new Set(blockedDates), [blockedDates]);

  const visibleAppointments = useMemo(() => {
    if (view === 'month') {
      const month = cursor.getMonth();
      const year = cursor.getFullYear();
      return visible.filter((appointment) => {
        const date = new Date(`${appointment.appointment_date}T12:00:00`);
        return date.getFullYear() === year && date.getMonth() === month;
      });
    }
    if (view === 'week') {
      const keys = new Set(weekGrid(cursor).map(toDateStr));
      return visible.filter((appointment) => keys.has(appointment.appointment_date));
    }
    const key = toDateStr(cursor);
    return visible.filter((appointment) => appointment.appointment_date === key);
  }, [cursor, view, visible]);

  useEffect(() => {
    onVisibleAppointmentsChange?.(visibleAppointments);
  }, [onVisibleAppointmentsChange, visibleAppointments]);

  const shift = (dir: -1 | 1) => {
    const d = new Date(cursor);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCursor(d);
  };

  const heading = () => {
    if (view === 'month') return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    if (view === 'week') {
      const w = weekGrid(cursor);
      return `${w[0].getDate()} - ${w[6].getDate()} ${MONTHS[w[6].getMonth()]} ${w[6].getFullYear()}`;
    }
    return `${DAY_FULL[cursor.getDay()]} ${cursor.getDate()} de ${MONTHS[cursor.getMonth()]}`;
  };

  const handleDrop = (dateKey: string) => {
    setDragOver(null);
    if (!dragging || !onReschedule) return;
    if (dragging.appointment_date === dateKey) {
      setDragging(null);
      return;
    }
    setPending({ appt: dragging, date: dateKey });
    setDragging(null);
  };

  const confirmMove = async () => {
    if (!pending || !onReschedule) return;
    setSaving(true);
    await onReschedule(pending.appt, pending.date);
    setSaving(false);
    setPending(null);
  };

  const dayCellProps = (key: string) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!onReschedule || !dragging) return;
      e.preventDefault();
      setDragOver(key);
    },
    onDragLeave: () => setDragOver((prev) => (prev === key ? null : prev)),
    onDrop: () => handleDrop(key),
  });

  const panelAppts = panelDay ? byDate.get(panelDay) || [] : [];

  return (
    <div className="cal">
      <header className="cal__bar">
        <div className="cal__nav">
          <button type="button" className="cal__icon-btn" onClick={() => shift(-1)} aria-label="Anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h2 className="cal__heading">{heading()}</h2>
          <button type="button" className="cal__icon-btn" onClick={() => shift(1)} aria-label="Siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <button type="button" className="cal__today" onClick={() => setCursor(new Date())}>Hoy</button>
        </div>

        <div className="cal__views">
          {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              className={`cal__view ${view === v ? 'cal__view--active' : ''}`}
              onClick={() => changeView(v)}
            >
              {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>
      </header>

      {view === 'month' && (
        <section className="cal-month-new" aria-label="Calendario mensual">
          <div className="cal-month-new__grid">
            {DAY_SHORT.map((day) => <span key={day} className="cal-month-new__weekday">{day}</span>)}
            {monthGrid(cursor.getFullYear(), cursor.getMonth()).map((date, index) => {
              if (!date) return <span key={`empty-${index}`} className="cal-month-new__empty" />;
              const dateKey = toDateStr(date);
              const dayAppointments = byDate.get(dateKey) || [];
              const total = dayAppointments.length;
              const hasConfirmedAppointments = dayAppointments.some((appointment) => appointment.status === 'confirmada');
              const hasCompletedAppointments = dayAppointments.length > 0 && dayAppointments.every((appointment) => appointment.status === 'completada');
              const isBlockedDay = blocked.has(dateKey);
              return (
                <button
                  key={dateKey}
                  type="button"
                  className={`psy-dash-upcoming-item ${isBlockedDay ? 'cal-month-new__day--blocked' : ''} ${hasConfirmedAppointments ? 'cal-month-new__day--confirmed' : ''} ${hasCompletedAppointments ? 'cal-month-new__day--completed' : ''} ${!isBlockedDay && total === 0 ? 'cal-month-new__day--available' : ''}`}
                  onClick={() => { setCursor(date); setPanelDay(dateKey); }}
                >
                  <span className="cal-month-new__number">{date.getDate()}</span>
                  {total > 0 && <span className="cal-month-new__count">{total}</span>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== Vista mes ===== */}
      {view === 'month' && (
        <div className="cal__month cal__legacy-view">
          {DAY_SHORT.map((d) => (
            <div key={d} className="cal__weekday">{d}</div>
          ))}
          {monthGrid(cursor.getFullYear(), cursor.getMonth()).map((d, i) => {
            if (!d) return <div key={`e${i}`} className="cal__cell cal__cell--empty" />;
            const key = toDateStr(d);
            const list = byDate.get(key) || [];
            return (
              <div
                key={key}
                className={[
                  'cal__cell',
                  key === todayKey ? 'cal__cell--today' : '',
                  blocked.has(key) ? 'cal__cell--blocked' : '',
                  dragOver === key ? 'cal__cell--dragover' : '',
                  panelDay === key ? 'cal__cell--selected' : '',
                ].join(' ')}
                onClick={() => { setCursor(d); setPanelDay(key); setView('day'); }}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setCursor(d); setPanelDay(key); setView('day'); } }}
                role="button"
                tabIndex={0}
                aria-label={`Ver citas del ${d.getDate()} de ${MONTHS[d.getMonth()]}`}
                {...dayCellProps(key)}
              >
                <span className="cal__daynum">{d.getDate()}</span>
                <div className="cal__cell-statuses" aria-label={`${list.length} citas`}>
                  {Object.entries(STATUS_META).map(([status, meta]) => {
                    const total = list.filter((appointment) => appointment.status === status).length;
                    return total > 0 ? <span key={status} className={`cal__status-total cal__status-total--${meta.key}`} title={meta.label}>{total}</span> : null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Vista semana ===== */}
      {view === 'week' && (
        <div className="cal-week-new">
          <div className="cal__week-head">
            <div className="cal__gutter" />
            {weekGrid(cursor).map((d) => {
              const key = toDateStr(d);
              return (
                <div key={key} className={`cal__week-day ${key === todayKey ? 'cal__week-day--today' : ''}`}>
                  <span>{DAY_SHORT[d.getDay()]}</span>
                  <strong>{d.getDate()}</strong>
                </div>
              );
            })}
          </div>
          <div className="cal__week-body">
            {HOURS.map((h) => (
              <React.Fragment key={h}>
                <div className="cal__gutter cal__hour">{`${h}:00`}</div>
                {weekGrid(cursor).map((d) => {
                  const key = toDateStr(d);
                  const list = (byDate.get(key) || []).filter((a) => parseInt(a.start_time.slice(0, 2), 10) === h);
                  const hourBlocked = isHourBlocked ? isHourBlocked(key, h) : blocked.has(key);
                  return (
                    <div
                      key={`${key}-${h}`}
                      className={`cal__slot psy-dash-upcoming-item ${dragOver === key ? 'cal__slot--dragover' : ''} ${hourBlocked ? 'cal-month-new__day--blocked' : ''} ${list.some((a) => a.status === 'confirmada') ? 'cal-month-new__day--confirmed' : ''} ${list.length > 0 && list.every((a) => a.status === 'completada') ? 'cal-month-new__day--completed' : ''} ${!hourBlocked && list.length === 0 ? 'cal-month-new__day--available' : ''}`}
                      onClick={() => {
                        if (list[0]) {
                          onSelect?.(list[0]);
                          return;
                        }
                        if (onToggleHourBlock) setHourDialog({ dateKey: key, hour: h });
                      }}
                      {...dayCellProps(key)}
                    >
                      {list.length > 0 && (
                        <>
                          <span className="cal-month-new__name cal-week-new__name" title={list.map((a) => a.title).join(', ')}>
                            {list.map((a) => a.title.trim().split(/\s+/)[0]).join(', ')}
                          </span>
                          <span className="cal-week-new__count" aria-hidden="true">
                            {list.length}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ===== Vista dia ===== */}
      {view === 'day' && (
        <div className="cal-day-new">
          <div className="cal-day-new__head">
            <span>{DAY_SHORT[cursor.getDay()]}</span>
            <strong>{cursor.getDate()}</strong>
          </div>
          {HOURS.map((h) => {
            const key = toDateStr(cursor);
            const list = (byDate.get(key) || []).filter((a) => parseInt(a.start_time.slice(0, 2), 10) === h);
            const hourBlocked = isHourBlocked ? isHourBlocked(key, h) : blocked.has(key);
            return (
              <div key={h} className="cal__day-row">
                <div className="cal__hour">{`${h}:00`}</div>
                <div
                  className={`cal__day-slot psy-dash-upcoming-item ${dragOver === key ? 'cal__slot--dragover' : ''} ${hourBlocked ? 'cal-month-new__day--blocked' : ''} ${list.some((a) => a.status === 'confirmada') ? 'cal-month-new__day--confirmed' : ''} ${list.length > 0 && list.every((a) => a.status === 'completada') ? 'cal-month-new__day--completed' : ''} ${!hourBlocked && list.length === 0 ? 'cal-month-new__day--available' : ''}`}
                  onClick={() => {
                    if (list[0]) {
                      onSelect?.(list[0]);
                      return;
                    }
                    if (onToggleHourBlock) setHourDialog({ dateKey: key, hour: h });
                  }}
                  {...dayCellProps(key)}
                >
                  {list.length > 0 && (
                    <span className="cal-month-new__name" title={list.map((a) => a.title).join(', ')}>
                      {list.map((a) => a.title.trim().split(/\s+/)[0]).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Panel lateral del dia (solo vista mes: en semana/dia el
          bloqueo se hace celda por hora, sin este panel) ===== */}
      {panelDay && (
        <aside className="cal-panel" aria-label="Detalle del dia">
          <header className="cal-panel__head">
            <div className="cal-panel__head-row">
              <div className="cal-panel__titles">
                <p className="cal-panel__date">{panelDay.split('-').reverse().join('/')}</p>
                <p className="cal-panel__count">
                  {panelAppts.length === 0 ? 'Sin citas' : `${panelAppts.length} cita${panelAppts.length > 1 ? 's' : ''}`}
                </p>
              </div>
              <button type="button" className="cal__icon-btn" onClick={() => setPanelDay(null)} aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {renderDayActions && <div className="cal-panel__dayactions">{renderDayActions(panelDay)}</div>}
          </header>

          <div className="cal-panel__body">
            {panelAppts.length === 0 ? (
              <p className="cal-panel__empty">{emptyLabel}</p>
            ) : (
              <ul className="cal-panel__list">
                {panelAppts.map((a) => (
                  <li key={a.id} className={`cal-panel__item cal-panel__item--${STATUS_META[a.status]?.key || 'other'}`}>
                    <div className="cal-panel__item-head">
                      <div>
                        <p className="cal-panel__name">{a.title}</p>
                        <p className="cal-panel__time">
                          {fmtTime(a.start_time)} - {fmtTime(a.end_time)}
                        </p>
                        {a.subtitle && <p className="cal-panel__sub">{a.subtitle}</p>}
                      </div>
                      <span className={`cal-panel__badge cal-panel__badge--${STATUS_META[a.status]?.key || 'other'}`}>
                        {STATUS_META[a.status]?.label || a.status}
                      </span>
                    </div>
                    {renderActions && <div className="cal-panel__actions">{renderActions(a)}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      )}

      {/* ===== Confirmacion de reprogramacion ===== */}
      {pending && (
        <div className="cal-confirm" role="dialog" aria-modal="true">
          <div className="cal-confirm__backdrop" onClick={() => !saving && setPending(null)} />
          <div className="cal-confirm__box">
            <h3>Reprogramar cita</h3>
            <p>
              Mover la cita de <strong>{pending.appt.title}</strong> del{' '}
              {pending.appt.appointment_date.split('-').reverse().join('/')} al{' '}
              <strong>{pending.date.split('-').reverse().join('/')}</strong>, manteniendo la hora{' '}
              {fmtTime(pending.appt.start_time)}.
            </p>
            <div className="cal-confirm__actions">
              <button type="button" className="cal-confirm__cancel" disabled={saving} onClick={() => setPending(null)}>
                Cancelar
              </button>
              <button type="button" className="cal-confirm__ok" disabled={saving} onClick={confirmMove}>
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Confirmacion de bloqueo/habilitacion de una hora (semana/dia) ===== */}
      {hourDialog && (() => {
        const alreadyBlocked = isHourBlocked ? isHourBlocked(hourDialog.dateKey, hourDialog.hour) : false;
        return (
          <div className="cal-confirm" role="dialog" aria-modal="true">
            <div className="cal-confirm__backdrop" onClick={() => setHourDialog(null)} />
            <div className="cal-confirm__box">
              <h3>{alreadyBlocked ? 'Habilitar esta hora' : 'Bloquear esta hora'}</h3>
              <p>
                {alreadyBlocked ? 'Los pacientes podran reservar' : 'Los pacientes no podran reservar'} el{' '}
                <strong>{hourDialog.dateKey.split('-').reverse().join('/')}</strong> de las{' '}
                <strong>{fmtTime(`${hourDialog.hour.toString().padStart(2, '0')}:00`)}</strong> a las{' '}
                {fmtTime(`${(hourDialog.hour + 1).toString().padStart(2, '0')}:00`)}.
              </p>
              <div className="cal-confirm__actions">
                <button type="button" className="cal-confirm__cancel" onClick={() => setHourDialog(null)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`cal-confirm__ok ${alreadyBlocked ? 'cal-confirm__ok--unblock' : 'cal-confirm__ok--block'}`}
                  onClick={() => {
                    onToggleHourBlock?.(hourDialog.dateKey, hourDialog.hour);
                    setHourDialog(null);
                  }}
                >
                  {alreadyBlocked ? 'Habilitar hora' : 'Bloquear hora'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AppointmentCalendar;

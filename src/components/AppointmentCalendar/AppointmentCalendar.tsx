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
  /** Fechas YYYY-MM-DD bloqueadas por el profesional. */
  blockedDates?: string[];
  /** Si se pasa, se habilita arrastrar una cita a otro dia. */
  onReschedule?: (appointment: CalendarAppointment, newDate: string) => Promise<void> | void;
  /** Acciones rapidas del panel lateral, propias de cada panel. */
  renderActions?: (appointment: CalendarAppointment) => React.ReactNode;
  /** Acciones sobre la jornada completa (bloquear el dia, anadir hueco...). */
  renderDayActions?: (dateKey: string) => React.ReactNode;
  onSelect?: (appointment: CalendarAppointment) => void;
  emptyLabel?: string;
  onVisibleAppointmentsChange?: (appointments: CalendarAppointment[]) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  blockedDates = [],
  onReschedule,
  renderActions,
  renderDayActions,
  onSelect,
  emptyLabel = 'Sin citas en esta fecha.',
  onVisibleAppointmentsChange,
}) => {
  const [view, setView] = useState<CalendarView>('month');
  const [cursor, setCursor] = useState(new Date());
  const [panelDay, setPanelDay] = useState<string | null>(null);

  const [dragging, setDragging] = useState<CalendarAppointment | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [pending, setPending] = useState<{ appt: CalendarAppointment; date: string } | null>(null);
  const [saving, setSaving] = useState(false);

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

  const chip = (a: CalendarAppointment, compact = false) => (
    <div
      key={a.id}
      className={`cal-chip cal-chip--${STATUS_META[a.status]?.key || 'other'} ${compact ? 'cal-chip--compact' : ''}`}
      draggable={Boolean(onReschedule)}
      onDragStart={() => setDragging(a)}
      onDragEnd={() => setDragging(null)}
      onPointerUp={(e) => {
        e.stopPropagation();
        onSelect?.(a);
      }}
      title={`${fmtTime(a.start_time)} · ${a.title}`}
    >
      {!compact && <span className="cal-chip__time">{fmtTime(a.start_time)}</span>}
      <span className="cal-chip__name">{compact ? a.title.trim().split(/\s+/)[0] : a.title}</span>
    </div>
  );

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
              onClick={() => setView(v)}
            >
              {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>
      </header>

      <section className="cal__proposal" aria-label="Propuesta de calendario">
        {view === 'month' ? (
          <div className="cal__proposal-month">
            {DAY_SHORT.map((day) => <span key={day} className="cal__proposal-weekday">{day}</span>)}
            {monthGrid(cursor.getFullYear(), cursor.getMonth()).map((date, index) => {
              if (!date) return <span key={`empty-${index}`} className="cal__proposal-day cal__proposal-day--empty" />;
              const dateKey = toDateStr(date);
              const total = (byDate.get(dateKey) || []).length;
              return (
                <button
                  key={dateKey}
                  type="button"
                  className={`cal__proposal-day ${dateKey === todayKey ? 'cal__proposal-day--today' : ''}`}
                  onClick={() => { setCursor(date); setPanelDay(dateKey); }}
                >
                  <span className="cal__proposal-number">{date.getDate()}</span>
                  {total > 0 && <span className="cal__proposal-count">{total}</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="cal__proposal-placeholder">
            <strong>{view === 'week' ? 'Calendario semanal' : 'Calendario diario'}</strong>
            <span>Espacio reservado para esta vista.</span>
          </div>
        )}
      </section>

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
        <div className="cal__week cal__legacy-view">
          <div className="cal__week-head">
            <div className="cal__gutter" />
            {weekGrid(cursor).map((d) => {
              const key = toDateStr(d);
              return (
                <div
                  key={key}
                  className={`cal__week-day ${key === todayKey ? 'cal__week-day--today' : ''}`}
                  onClick={() => setPanelDay(key)}
                >
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
                  return (
                    <div
                      key={`${key}-${h}`}
                      className={`cal__slot ${dragOver === key ? 'cal__slot--dragover' : ''} ${blocked.has(key) ? 'cal__slot--blocked' : ''}`}
                      onClick={() => setPanelDay(key)}
                      {...dayCellProps(key)}
                    >
                      {list.map((a) => chip(a, true))}
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
        <div className="cal__day cal__legacy-view">
          {HOURS.map((h) => {
            const key = toDateStr(cursor);
            const list = (byDate.get(key) || []).filter((a) => parseInt(a.start_time.slice(0, 2), 10) === h);
            return (
              <div key={h} className="cal__day-row">
                <div className="cal__hour">{`${h}:00`}</div>
                <div
                  className={`cal__day-slot ${dragOver === key ? 'cal__slot--dragover' : ''}`}
                  {...dayCellProps(key)}
                >
                  {list.length === 0 ? <span className="cal__free">Libre</span> : list.map((a) => chip(a))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Panel lateral del dia ===== */}
      {panelDay && (
        <aside className="cal-panel" aria-label="Detalle del dia">
          <header className="cal-panel__head">
            <div>
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
          </header>

          {renderDayActions && <div className="cal-panel__dayactions">{renderDayActions(panelDay)}</div>}

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
    </div>
  );
};

export default AppointmentCalendar;

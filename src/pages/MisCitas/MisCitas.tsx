import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import './MisCitas.css';

interface AppointmentWithPsy {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_amount: number | null;
  psychologist: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    specialties: string[];
  } | null;
}

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const HOURS_RANGE = Array.from({ length: 14 }, (_, i) => i + 7);

type CalView = 'month' | 'week' | 'day';

function formatTime(t: string): string {
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ap = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ap}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getWeekStart(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay());
  return r;
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  return cells;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'confirmada': return 'Confirmada';
    case 'pendiente_pago': return 'Pago pendiente';
    case 'completada': return 'Completada';
    case 'cancelada': return 'Cancelada';
    default: return status;
  }
}

const MisCitas: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<AppointmentWithPsy[]>([]);
  const [loading, setLoading] = useState(true);
  const [calView, setCalView] = useState<CalView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppt, setSelectedAppt] = useState<AppointmentWithPsy | null>(null);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchAppts = async () => {
      if (!user) return;

      const { data: apptData } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false })
        .order('start_time');

      const enriched: AppointmentWithPsy[] = [];
      if (apptData) {
        for (const a of apptData) {
          const { data: psy } = await supabase
            .from('psychologists')
            .select('id, full_name, avatar_url, phone, specialties')
            .eq('id', a.psychologist_id)
            .single();

          enriched.push({
            ...a,
            psychologist: psy || null,
          });
        }
      }
      setAppointments(enriched);
      setLoading(false);
    };

    if (user) fetchAppts();
  }, [user]);

  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    const d = new Date(currentDate);
    if (calView === 'month') d.setMonth(d.getMonth() - 1);
    else if (calView === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const goNext = () => {
    const d = new Date(currentDate);
    if (calView === 'month') d.setMonth(d.getMonth() + 1);
    else if (calView === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const monthDays = useMemo(() => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), [currentDate]);
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  }), [weekStart]);

  const getApptsForDate = (d: Date) => {
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return appointments.filter((a) => a.appointment_date === ds);
  };

  const handleOpenWhatsApp = (phone: string | null | undefined, psyName: string) => {
    if (!phone) {
      alert('Este psicologo no tiene numero registrado.');
      return;
    }
    const clean = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hola ${psyName}, tengo una cita agendada contigo en Vida Sabia. `);
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  const calTitle = calView === 'month'
    ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : calView === 'week'
      ? `${weekDays[0].getDate()} ${MONTH_NAMES[weekDays[0].getMonth()].substring(0, 3)} - ${weekDays[6].getDate()} ${MONTH_NAMES[weekDays[6].getMonth()].substring(0, 3)} ${weekDays[6].getFullYear()}`
      : `${DAY_NAMES_FULL[currentDate.getDay()]} ${currentDate.getDate()} de ${MONTH_NAMES[currentDate.getMonth()]}`;

  const upcomingAppts = appointments.filter(
    (a) => a.appointment_date >= today.toISOString().split('T')[0] && (a.status === 'confirmada' || a.status === 'pendiente_pago')
  );

  if (authLoading || loading) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-loading-spinner" />
        <p>Cargando tus citas...</p>
      </div>
    );
  }

  return (
    <DashboardLayout pageTitle="Mis Citas">
      <div className="mc-page">
        {/* Stats */}
        <div className="mc-stats">
          <div className="mc-stat">
            <span className="mc-stat-num">{upcomingAppts.length}</span>
            <span className="mc-stat-label">Proximas</span>
          </div>
          <div className="mc-stat">
            <span className="mc-stat-num">{appointments.filter((a) => a.status === 'completada').length}</span>
            <span className="mc-stat-label">Completadas</span>
          </div>
          <div className="mc-stat">
            <span className="mc-stat-num">{appointments.length}</span>
            <span className="mc-stat-label">Total</span>
          </div>
        </div>

        {/* Calendar controls */}
        <div className="mc-cal-controls">
          <div className="mc-cal-nav">
            <button className="mc-cal-nav-btn" onClick={goPrev} type="button" aria-label="Anterior">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <h2 className="mc-cal-title">{calTitle}</h2>
            <button className="mc-cal-nav-btn" onClick={goNext} type="button" aria-label="Siguiente">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <button className="mc-cal-today-btn" onClick={goToday} type="button">Hoy</button>
          </div>
          <div className="mc-cal-views">
            {(['month', 'week', 'day'] as CalView[]).map((v) => (
              <button key={v} className={`mc-cal-view-btn ${calView === v ? 'mc-cal-view-btn--active' : ''}`} onClick={() => setCalView(v)} type="button">
                {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>
        </div>

        {/* MONTH VIEW */}
        {calView === 'month' && (
          <div className="mc-month">
            <div className="mc-month-header">
              {DAY_NAMES_SHORT.map((d) => <div key={d} className="mc-month-day-name">{d}</div>)}
            </div>
            <div className="mc-month-grid">
              {monthDays.map((d, i) => {
                if (!d) return <div key={`e-${i}`} className="mc-month-cell mc-month-cell--empty" />;
                const appts = getApptsForDate(d);
                const isToday = sameDay(d, today);
                return (
                  <div
                    key={d.toISOString()}
                    className={`mc-month-cell ${isToday ? 'mc-month-cell--today' : ''}`}
                    onClick={() => { setCurrentDate(d); setCalView('day'); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setCalView('day')}
                  >
                    <span className="mc-month-date">{d.getDate()}</span>
                    {appts.length > 0 && (
                      <div className="mc-month-dots">
                        {appts.slice(0, 2).map((a) => (
                          <span key={a.id} className={`mc-month-dot mc-month-dot--${a.status}`} />
                        ))}
                        {appts.length > 2 && <span className="mc-month-more">+{appts.length - 2}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {calView === 'week' && (
          <div className="mc-week">
            <div className="mc-week-header">
              <div className="mc-week-time-col" />
              {weekDays.map((d) => (
                <div
                  key={d.toISOString()}
                  className={`mc-week-day-col ${sameDay(d, today) ? 'mc-week-day-col--today' : ''}`}
                  onClick={() => { setCurrentDate(d); setCalView('day'); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setCalView('day')}
                >
                  <span className="mc-week-day-label">{DAY_NAMES_SHORT[d.getDay()]}</span>
                  <span className="mc-week-day-num">{d.getDate()}</span>
                </div>
              ))}
            </div>
            <div className="mc-week-body">
              {HOURS_RANGE.map((h) => (
                <div key={h} className="mc-week-row">
                  <div className="mc-week-time">{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</div>
                  {weekDays.map((d) => {
                    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const hourAppts = appointments.filter((a) => a.appointment_date === ds && parseInt(a.start_time.split(':')[0], 10) === h);
                    return (
                      <div key={`${ds}-${h}`} className="mc-week-cell">
                        {hourAppts.map((a) => (
                          <button key={a.id} className={`mc-week-appt mc-week-appt--${a.status}`} onClick={() => setSelectedAppt(a)} type="button">
                            <span>{a.psychologist?.full_name?.split(' ')[0] || 'Psy'}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DAY VIEW */}
        {calView === 'day' && (
          <div className="mc-day-view">
            {HOURS_RANGE.map((h) => {
              const ds = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
              const hourAppts = appointments.filter((a) => a.appointment_date === ds && parseInt(a.start_time.split(':')[0], 10) === h);

              return (
                <div key={h} className="mc-day-row">
                  <div className="mc-day-time">{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</div>
                  <div className="mc-day-content">
                    {hourAppts.map((a) => (
                      <button key={a.id} className={`mc-day-appt mc-day-appt--${a.status}`} onClick={() => setSelectedAppt(a)} type="button">
                        <div className="mc-day-appt-left">
                          <div className="mc-day-appt-avatar">
                            {a.psychologist?.avatar_url ? (
                              <img src={a.psychologist.avatar_url} alt="" crossOrigin="anonymous" />
                            ) : (
                              <span>{(a.psychologist?.full_name || 'P').charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <strong>{a.psychologist?.full_name || 'Psicologo'}</strong>
                            <p>{formatTime(a.start_time)} - {formatTime(a.end_time)}</p>
                          </div>
                        </div>
                        <span className={`mc-day-appt-badge mc-day-appt-badge--${a.status}`}>
                          {statusLabel(a.status)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {appointments.length === 0 && (
          <div className="mc-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3>No tienes citas aun</h3>
            <p>Busca un especialista y agenda tu primera sesion.</p>
            <button className="mc-empty-btn" onClick={() => navigate('/especialistas')} type="button">
              Buscar especialista
            </button>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div className="mc-modal-overlay" onClick={() => setSelectedAppt(null)}>
          <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mc-modal-header">
              <h3>Detalle de cita</h3>
              <button className="mc-modal-close" onClick={() => setSelectedAppt(null)} type="button" aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="mc-modal-body">
              <div className="mc-modal-psy">
                <div className="mc-modal-psy-avatar">
                  {selectedAppt.psychologist?.avatar_url ? (
                    <img src={selectedAppt.psychologist.avatar_url} alt="" crossOrigin="anonymous" />
                  ) : (
                    <span>{(selectedAppt.psychologist?.full_name || 'P').charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4>{selectedAppt.psychologist?.full_name || 'Psicologo'}</h4>
                  {selectedAppt.psychologist?.specialties && (
                    <div className="mc-modal-specs">
                      {selectedAppt.psychologist.specialties.slice(0, 3).map((s) => (
                        <span key={s} className="mc-modal-spec-tag">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mc-modal-details">
                <div className="mc-modal-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <span>{selectedAppt.appointment_date.split('-').reverse().join('/')}</span>
                </div>
                <div className="mc-modal-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span>{formatTime(selectedAppt.start_time)} - {formatTime(selectedAppt.end_time)}</span>
                </div>
                <div className="mc-modal-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  <span>${selectedAppt.payment_amount?.toLocaleString()} COP</span>
                  <span className={`mc-modal-pay-badge mc-modal-pay-badge--${selectedAppt.payment_status}`}>
                    {selectedAppt.payment_status === 'pagado' ? 'Pagado' : selectedAppt.payment_status === 'procesando' ? 'Procesando' : 'Pendiente'}
                  </span>
                </div>
                <div className="mc-modal-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <span className={`mc-modal-status mc-modal-status--${selectedAppt.status}`}>
                    {statusLabel(selectedAppt.status)}
                  </span>
                </div>
              </div>

              {/* WhatsApp - only if confirmed or completed */}
              {selectedAppt.psychologist?.phone && (selectedAppt.status === 'confirmada' || selectedAppt.status === 'completada') && (
                <button
                  className="mc-wa-btn"
                  onClick={() => handleOpenWhatsApp(selectedAppt.psychologist?.phone, selectedAppt.psychologist?.full_name || 'Psicologo')}
                  type="button"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chatear con tu psicologo por WhatsApp
                </button>
              )}

              {selectedAppt.status === 'pendiente_pago' && (
                <p className="mc-modal-note">Tu pago esta siendo verificado. Una vez confirmado podras chatear con tu psicologo.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MisCitas;

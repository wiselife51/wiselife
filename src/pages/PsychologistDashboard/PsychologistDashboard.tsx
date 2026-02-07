import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './PsychologistDashboard.css';

interface PsychologistProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  specialties: string[];
  session_duration: number;
  session_price: number;
  onboarding_completed: boolean;
}

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_reference: string | null;
  payment_amount: number | null;
  notes: string | null;
  patient: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface ScheduleBlock {
  id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

const DAYS_CONFIG = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mie' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sab' },
  { value: 0, label: 'Dom' },
];

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const HOUR_OPTIONS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 7;
  return `${h.toString().padStart(2, '0')}:00`;
});

const HOURS_RANGE = Array.from({ length: 14 }, (_, i) => i + 7);

type ActiveTab = 'calendario' | 'agenda' | 'bloqueos';
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

const PsychologistDashboard: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PsychologistProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Tabs and calendar
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendario');
  const [calView, setCalView] = useState<CalView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  // Appointment detail modal
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  // Block form
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockStart, setBlockStart] = useState('08:00');
  const [blockEnd, setBlockEnd] = useState('09:00');
  const [blockReason, setBlockReason] = useState('');
  const [savingBlock, setSavingBlock] = useState(false);

  // Add availability
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotDay, setNewSlotDay] = useState(1);
  const [newSlotStart, setNewSlotStart] = useState('08:00');
  const [newSlotEnd, setNewSlotEnd] = useState('09:00');
  const [savingSlot, setSavingSlot] = useState(false);

  // Quick add from calendar
  const handleQuickAdd = (dayOfWeek: number, hour: number) => {
    setNewSlotDay(dayOfWeek);
    setNewSlotStart(`${hour.toString().padStart(2, '0')}:00`);
    setNewSlotEnd(`${(hour + 1).toString().padStart(2, '0')}:00`);
    setShowAddSlot(true);
  };

  const today = useMemo(() => new Date(), []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);

    const { data: psyData } = await supabase
      .from('psychologists')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!psyData || !psyData.onboarding_completed) {
      navigate('/psicologo/onboarding');
      return;
    }

    setProfile(psyData as PsychologistProfile);

    // Fetch appointments
    const { data: apptData } = await supabase
      .from('appointments')
      .select('*')
      .eq('psychologist_id', psyData.id)
      .order('appointment_date')
      .order('start_time');

    // Enrich with patient profile data
    const enriched: Appointment[] = [];
    if (apptData) {
      for (const a of apptData) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, phone')
          .eq('id', a.patient_id)
          .single();

        enriched.push({
          ...a,
          patient: prof ? {
            id: a.patient_id,
            full_name: prof.full_name,
            avatar_url: prof.avatar_url,
            phone: prof.phone,
          } : { id: a.patient_id, full_name: null, avatar_url: null, phone: null },
        });
      }
    }
    setAppointments(enriched);

    const { data: availData } = await supabase
      .from('psychologist_availability')
      .select('*')
      .eq('psychologist_id', psyData.id)
      .order('day_of_week')
      .order('start_time');
    setAvailability((availData || []) as AvailabilitySlot[]);

    const { data: blocksData } = await supabase
      .from('schedule_blocks')
      .select('*')
      .eq('psychologist_id', psyData.id)
      .order('block_date')
      .order('start_time');
    setBlocks((blocksData || []) as ScheduleBlock[]);

    setLoadingData(false);
  }, [user, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/psicologo/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading, navigate, fetchData]);

  // Availability actions
  const handleAddSlot = async () => {
    if (!profile) return;
    setSavingSlot(true);
    await supabase.from('psychologist_availability').insert({
      psychologist_id: profile.id,
      day_of_week: newSlotDay,
      start_time: newSlotStart,
      end_time: newSlotEnd,
      is_available: true,
    });
    setShowAddSlot(false);
    setSavingSlot(false);
    fetchData();
  };

  const handleDeleteSlot = async (slotId: string) => {
    await supabase.from('psychologist_availability').delete().eq('id', slotId);
    fetchData();
  };

  const handleToggleSlot = async (slotId: string, currentState: boolean) => {
    await supabase.from('psychologist_availability').update({ is_available: !currentState }).eq('id', slotId);
    fetchData();
  };

  // Block actions
  const handleAddBlock = async () => {
    if (!profile || !blockDate) return;
    setSavingBlock(true);
    await supabase.from('schedule_blocks').insert({
      psychologist_id: profile.id,
      block_date: blockDate,
      start_time: blockStart,
      end_time: blockEnd,
      reason: blockReason || null,
    });
    setShowBlockForm(false);
    setBlockDate('');
    setBlockReason('');
    setSavingBlock(false);
    fetchData();
  };

  const handleDeleteBlock = async (blockId: string) => {
    await supabase.from('schedule_blocks').delete().eq('id', blockId);
    fetchData();
  };

  // Appointment actions
  const handleConfirmPayment = async (apptId: string) => {
    await supabase.from('appointments').update({
      status: 'confirmada',
      payment_status: 'pagado',
      updated_at: new Date().toISOString(),
    }).eq('id', apptId);
    setSelectedAppt(null);
    fetchData();
  };

  const handleCompleteAppt = async (apptId: string) => {
    await supabase.from('appointments').update({
      status: 'completada',
      updated_at: new Date().toISOString(),
    }).eq('id', apptId);
    setSelectedAppt(null);
    fetchData();
  };

  const handleOpenWhatsApp = (phone: string | null | undefined, patientName: string) => {
    if (!phone) {
      alert('Este paciente no tiene numero registrado.');
      return;
    }
    const clean = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hola ${patientName}, soy tu psicologo de Vida Sabia. `);
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Calendar navigation
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

  const getBlocksForDate = (d: Date) => {
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return blocks.filter((b) => b.block_date === ds);
  };

  const calTitle = calView === 'month'
    ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : calView === 'week'
      ? `${weekDays[0].getDate()} ${MONTH_NAMES[weekDays[0].getMonth()].substring(0, 3)} - ${weekDays[6].getDate()} ${MONTH_NAMES[weekDays[6].getMonth()].substring(0, 3)} ${weekDays[6].getFullYear()}`
      : `${DAY_NAMES_FULL[currentDate.getDay()]} ${currentDate.getDate()} de ${MONTH_NAMES[currentDate.getMonth()]}`;

  const daySlots = availability.filter((s) => s.day_of_week === selectedDay);

  const upcomingAppts = appointments.filter(
    (a) => a.appointment_date >= today.toISOString().split('T')[0] && (a.status === 'confirmada' || a.status === 'pendiente_pago')
  ).slice(0, 8);

  if (authLoading || loadingData) {
    return (
      <div className="psy-dash-loading">
        <div className="psy-dash-spinner" />
        <p>Cargando tu panel...</p>
      </div>
    );
  }

  return (
    <div className="psy-dash">
      {/* Sidebar */}
      <aside className="psy-dash-sidebar">
        <div className="psy-dash-sidebar-header">
          <div className="psy-dash-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <defs>
                <linearGradient id="dash-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4dd0e1" />
                  <stop offset="50%" stopColor="#42a5f5" />
                  <stop offset="100%" stopColor="#7e57c2" />
                </linearGradient>
              </defs>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#dash-logo-grad)" />
            </svg>
            <span>Vida Sabia</span>
          </div>
          <div className="psy-dash-badge">Profesional</div>
        </div>

        <div className="psy-dash-profile">
          <div className="psy-dash-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} crossOrigin="anonymous" />
            ) : (
              <span>{profile?.full_name?.charAt(0) || 'P'}</span>
            )}
          </div>
          <h3 className="psy-dash-name">{profile?.full_name}</h3>
          <p className="psy-dash-email">{profile?.email}</p>
        </div>

        <nav className="psy-dash-nav">
          <button type="button" className={`psy-dash-nav-item ${activeTab === 'calendario' ? 'psy-dash-nav-item--active' : ''}`} onClick={() => setActiveTab('calendario')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <span>Calendario</span>
          </button>
          <button type="button" className={`psy-dash-nav-item ${activeTab === 'agenda' ? 'psy-dash-nav-item--active' : ''}`} onClick={() => setActiveTab('agenda')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>Mi Agenda</span>
          </button>
          <button type="button" className={`psy-dash-nav-item ${activeTab === 'bloqueos' ? 'psy-dash-nav-item--active' : ''}`} onClick={() => setActiveTab('bloqueos')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
            <span>Bloqueos</span>
          </button>
        </nav>

        {/* Upcoming mini list */}
        {upcomingAppts.length > 0 && (
          <div className="psy-dash-upcoming-mini">
            <h4>Proximas citas</h4>
            {upcomingAppts.slice(0, 4).map((a) => (
              <button key={a.id} className="psy-dash-upcoming-item" onClick={() => { setActiveTab('calendario'); setSelectedAppt(a); }} type="button">
                <div className="psy-dash-upcoming-avatar-sm">
                  {a.patient?.avatar_url ? (
                    <img src={a.patient.avatar_url} alt="" crossOrigin="anonymous" />
                  ) : (
                    <span>{(a.patient?.full_name || 'P').charAt(0)}</span>
                  )}
                </div>
                <div className="psy-dash-upcoming-text">
                  <strong>{a.patient?.full_name?.split(' ')[0] || 'Paciente'}</strong>
                  <span>{a.appointment_date.split('-').reverse().join('/')} {formatTime(a.start_time)}</span>
                </div>
                <span className={`psy-dash-mini-status psy-dash-mini-status--${a.status}`}>
                  {a.status === 'confirmada' ? 'OK' : '$'}
                </span>
              </button>
            ))}
          </div>
        )}

        <button type="button" className="psy-dash-signout" onClick={handleSignOut}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          <span>Cerrar sesion</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="psy-dash-main">
        {/* CALENDARIO TAB */}
        {activeTab === 'calendario' && (
          <>
            {/* Calendar controls */}
            <div className="psy-cal-controls">
              <div className="psy-cal-nav">
                <button className="psy-cal-nav-btn" onClick={goPrev} type="button" aria-label="Anterior">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h2 className="psy-cal-title">{calTitle}</h2>
                <button className="psy-cal-nav-btn" onClick={goNext} type="button" aria-label="Siguiente">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
                <button className="psy-cal-today-btn" onClick={goToday} type="button">Hoy</button>
              </div>
              <div className="psy-cal-views">
                {(['month', 'week', 'day'] as CalView[]).map((v) => (
                  <button key={v} className={`psy-cal-view-btn ${calView === v ? 'psy-cal-view-btn--active' : ''}`} onClick={() => setCalView(v)} type="button">
                    {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Dia'}
                  </button>
                ))}
              </div>
            </div>

            {/* MONTH VIEW */}
            {calView === 'month' && (
              <div className="psy-month">
                <div className="psy-month-header">
                  {DAY_NAMES_SHORT.map((d) => <div key={d} className="psy-month-day-name">{d}</div>)}
                </div>
                <div className="psy-month-grid">
                  {monthDays.map((d, i) => {
                    if (!d) return <div key={`empty-${i}`} className="psy-month-cell psy-month-cell--empty" />;
                    const appts = getApptsForDate(d);
                    const dayBlocks = getBlocksForDate(d);
                    const isToday = sameDay(d, today);
                    return (
                      <div
                        key={d.toISOString()}
                        className={`psy-month-cell ${isToday ? 'psy-month-cell--today' : ''}`}
                        onClick={() => { setCurrentDate(d); setCalView('day'); }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setCalView('day')}
                      >
                        <span className="psy-month-date">{d.getDate()}</span>
                        <div className="psy-month-indicators">
                          {appts.length > 0 && <span className="psy-month-dot psy-month-dot--appt">{appts.length}</span>}
                          {dayBlocks.length > 0 && <span className="psy-month-dot psy-month-dot--block" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WEEK VIEW */}
            {calView === 'week' && (
              <div className="psy-week">
                <div className="psy-week-header">
                  <div className="psy-week-time-col" />
                  {weekDays.map((d) => (
                    <div
                      key={d.toISOString()}
                      className={`psy-week-day-col ${sameDay(d, today) ? 'psy-week-day-col--today' : ''}`}
                      onClick={() => { setCurrentDate(d); setCalView('day'); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setCalView('day')}
                    >
                      <span className="psy-week-day-label">{DAY_NAMES_SHORT[d.getDay()]}</span>
                      <span className="psy-week-day-num">{d.getDate()}</span>
                    </div>
                  ))}
                </div>
                <div className="psy-week-body">
                  {HOURS_RANGE.map((h) => (
                    <div key={h} className="psy-week-row">
                      <div className="psy-week-time">{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</div>
                      {weekDays.map((d) => {
                        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        const hourAppts = appointments.filter((a) => a.appointment_date === ds && parseInt(a.start_time.split(':')[0], 10) === h);
                        const hourBlocks = blocks.filter((b) => b.block_date === ds && parseInt(b.start_time.split(':')[0], 10) <= h && parseInt(b.end_time.split(':')[0], 10) > h);
                        const hasAvail = availability.some((av) => av.day_of_week === d.getDay() && parseInt(av.start_time.split(':')[0], 10) === h && av.is_available);
                        return (
                          <div
                            key={`${ds}-${h}`}
                            className={`psy-week-cell ${hourBlocks.length > 0 ? 'psy-week-cell--blocked' : ''} ${hourAppts.length === 0 && hourBlocks.length === 0 && !hasAvail ? 'psy-week-cell--addable' : ''}`}
                            onClick={() => {
                              if (hourAppts.length === 0 && hourBlocks.length === 0 && !hasAvail) {
                                handleQuickAdd(d.getDay(), h);
                              }
                            }}
                            role={hourAppts.length === 0 && hourBlocks.length === 0 && !hasAvail ? 'button' : undefined}
                            tabIndex={hourAppts.length === 0 && hourBlocks.length === 0 && !hasAvail ? 0 : undefined}
                            title={hourAppts.length === 0 && hourBlocks.length === 0 && !hasAvail ? 'Click para agregar disponibilidad' : undefined}
                          >
                            {hourAppts.map((a) => (
                              <button key={a.id} className={`psy-week-appt psy-week-appt--${a.status}`} onClick={(e) => { e.stopPropagation(); setSelectedAppt(a); }} type="button">
                                <span className="psy-week-appt-name">{a.patient?.full_name?.split(' ')[0] || 'Pac.'}</span>
                                <span className="psy-week-appt-time">{formatTime(a.start_time)}</span>
                              </button>
                            ))}
                            {hasAvail && hourAppts.length === 0 && hourBlocks.length === 0 && (
                              <span className="psy-week-avail-dot" title="Disponible" />
                            )}
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
              <div className="psy-day-view">
                {HOURS_RANGE.map((h) => {
                  const ds = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                  const hourAppts = appointments.filter((a) => a.appointment_date === ds && parseInt(a.start_time.split(':')[0], 10) === h);
                  const hourBlocks = blocks.filter((b) => b.block_date === ds && parseInt(b.start_time.split(':')[0], 10) <= h && parseInt(b.end_time.split(':')[0], 10) > h);
                  const dayAvail = availability.filter((av) => av.day_of_week === currentDate.getDay() && parseInt(av.start_time.split(':')[0], 10) === h && av.is_available);

                  return (
                    <div key={h} className={`psy-day-row ${hourBlocks.length > 0 ? 'psy-day-row--blocked' : ''}`}>
                      <div className="psy-day-time">{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</div>
                      <div className="psy-day-content">
                        {hourBlocks.length > 0 && (
                          <div className="psy-day-block-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                            Bloqueado {hourBlocks[0]?.reason ? `- ${hourBlocks[0].reason}` : ''}
                          </div>
                        )}
                        {hourAppts.map((a) => (
                          <button key={a.id} className={`psy-day-appt psy-day-appt--${a.status}`} onClick={() => setSelectedAppt(a)} type="button">
                            <div className="psy-day-appt-left">
                              <div className="psy-day-appt-avatar">
                                {a.patient?.avatar_url ? (
                                  <img src={a.patient.avatar_url} alt="" crossOrigin="anonymous" />
                                ) : (
                                  <span>{(a.patient?.full_name || 'P').charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <strong>{a.patient?.full_name || 'Paciente'}</strong>
                                <p>{formatTime(a.start_time)} - {formatTime(a.end_time)}</p>
                              </div>
                            </div>
                            <span className={`psy-day-appt-badge psy-day-appt-badge--${a.status}`}>
                              {a.status === 'confirmada' ? 'Confirmada' : a.status === 'pendiente_pago' ? 'Pago pendiente' : a.status === 'completada' ? 'Completada' : a.status}
                            </span>
                          </button>
                        ))}
                        {hourAppts.length === 0 && hourBlocks.length === 0 && dayAvail.length > 0 && (
                          <div className="psy-day-avail-label">Disponible</div>
                        )}
                        {hourAppts.length === 0 && hourBlocks.length === 0 && dayAvail.length === 0 && (
                          <button
                            className="psy-day-add-btn"
                            onClick={() => handleQuickAdd(currentDate.getDay(), h)}
                            type="button"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Agregar disponibilidad
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* AGENDA TAB - availability config */}
        {activeTab === 'agenda' && (
          <>
            <div className="psy-dash-header">
              <h1>Mi Agenda</h1>
              <button type="button" className="psy-dash-btn-primary" onClick={() => setShowAddSlot(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Agregar horario
              </button>
            </div>

            <div className="psy-dash-days">
              {DAYS_CONFIG.map((d) => {
                const count = availability.filter((s) => s.day_of_week === d.value).length;
                return (
                  <button key={d.value} type="button" className={`psy-dash-day ${selectedDay === d.value ? 'psy-dash-day--active' : ''}`} onClick={() => setSelectedDay(d.value)}>
                    <span className="psy-dash-day-label">{d.label}</span>
                    {count > 0 && <span className="psy-dash-day-count">{count}</span>}
                  </button>
                );
              })}
            </div>

            <div className="psy-dash-slots">
              <h3>{DAY_NAMES_FULL[selectedDay]}</h3>
              {daySlots.length === 0 ? (
                <div className="psy-dash-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <p>No hay horarios configurados para este dia.</p>
                  <button type="button" className="psy-dash-btn-outline" onClick={() => { setNewSlotDay(selectedDay); setShowAddSlot(true); }}>
                    Agregar horario
                  </button>
                </div>
              ) : (
                <div className="psy-dash-slot-list">
                  {daySlots.map((slot) => (
                    <div key={slot.id} className={`psy-dash-slot ${!slot.is_available ? 'psy-dash-slot--disabled' : ''}`}>
                      <div className="psy-dash-slot-time">
                        <span className="psy-dash-slot-badge">{slot.start_time.slice(0, 5)}</span>
                        <span className="psy-dash-slot-sep">-</span>
                        <span className="psy-dash-slot-badge">{slot.end_time.slice(0, 5)}</span>
                      </div>
                      <div className="psy-dash-slot-status">
                        {slot.is_available ? (
                          <span className="psy-dash-status psy-dash-status--available">Disponible</span>
                        ) : (
                          <span className="psy-dash-status psy-dash-status--unavailable">No disponible</span>
                        )}
                      </div>
                      <div className="psy-dash-slot-actions">
                        <button type="button" className="psy-dash-slot-toggle" onClick={() => handleToggleSlot(slot.id, slot.is_available)} title={slot.is_available ? 'Desactivar' : 'Activar'}>
                          {slot.is_available ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                          )}
                        </button>
                        <button type="button" className="psy-dash-slot-delete" onClick={() => handleDeleteSlot(slot.id)} title="Eliminar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showAddSlot && (
              <div className="psy-dash-modal-backdrop" onClick={() => setShowAddSlot(false)}>
                <div className="psy-dash-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Agregar horario disponible</h3>
                  <div className="psy-dash-modal-fields">
                    <div className="psy-dash-modal-field">
                      <label>Dia</label>
                      <select value={newSlotDay} onChange={(e) => setNewSlotDay(parseInt(e.target.value))}>
                        {DAYS_CONFIG.map((d) => <option key={d.value} value={d.value}>{DAY_NAMES_FULL[d.value]}</option>)}
                      </select>
                    </div>
                    <div className="psy-dash-modal-row">
                      <div className="psy-dash-modal-field">
                        <label>Inicio</label>
                        <select value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)}>
                          {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div className="psy-dash-modal-field">
                        <label>Fin</label>
                        <select value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)}>
                          {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="psy-dash-modal-actions">
                    <button type="button" className="psy-dash-btn-ghost" onClick={() => setShowAddSlot(false)}>Cancelar</button>
                    <button type="button" className="psy-dash-btn-primary" onClick={handleAddSlot} disabled={savingSlot}>
                      {savingSlot ? 'Guardando...' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* BLOQUEOS TAB */}
        {activeTab === 'bloqueos' && (
          <>
            <div className="psy-dash-header">
              <h1>Bloqueos de horario</h1>
              <button type="button" className="psy-dash-btn-primary" onClick={() => setShowBlockForm(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Bloquear fecha
              </button>
            </div>

            <p className="psy-dash-block-desc">Bloquea fechas y horas especificas cuando no puedas atender.</p>

            {blocks.filter((b) => b.block_date >= today.toISOString().split('T')[0]).length === 0 ? (
              <div className="psy-dash-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                <p>No tienes bloqueos configurados.</p>
              </div>
            ) : (
              <div className="psy-dash-block-list">
                {blocks.filter((b) => b.block_date >= today.toISOString().split('T')[0]).map((block) => (
                  <div key={block.id} className="psy-dash-block-item">
                    <div className="psy-dash-block-info">
                      <span className="psy-dash-block-date">{new Date(block.block_date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      <span className="psy-dash-block-time">{block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}</span>
                      {block.reason && <span className="psy-dash-block-reason">{block.reason}</span>}
                    </div>
                    <button type="button" className="psy-dash-slot-delete" onClick={() => handleDeleteBlock(block.id)} title="Eliminar bloqueo">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showBlockForm && (
              <div className="psy-dash-modal-backdrop" onClick={() => setShowBlockForm(false)}>
                <div className="psy-dash-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Bloquear horario</h3>
                  <div className="psy-dash-modal-fields">
                    <div className="psy-dash-modal-field">
                      <label>Fecha</label>
                      <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} min={today.toISOString().split('T')[0]} />
                    </div>
                    <div className="psy-dash-modal-row">
                      <div className="psy-dash-modal-field">
                        <label>Desde</label>
                        <select value={blockStart} onChange={(e) => setBlockStart(e.target.value)}>
                          {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div className="psy-dash-modal-field">
                        <label>Hasta</label>
                        <select value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)}>
                          {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="psy-dash-modal-field">
                      <label>Razon (opcional)</label>
                      <input type="text" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Vacaciones, cita personal..." />
                    </div>
                  </div>
                  <div className="psy-dash-modal-actions">
                    <button type="button" className="psy-dash-btn-ghost" onClick={() => setShowBlockForm(false)}>Cancelar</button>
                    <button type="button" className="psy-dash-btn-primary" onClick={handleAddBlock} disabled={savingBlock || !blockDate}>
                      {savingBlock ? 'Guardando...' : 'Bloquear'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div className="psy-dash-modal-backdrop" onClick={() => setSelectedAppt(null)}>
          <div className="psy-dash-modal psy-dash-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="psy-appt-modal-header">
              <h3>Detalle de cita</h3>
              <button className="psy-appt-modal-close" onClick={() => setSelectedAppt(null)} type="button" aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="psy-appt-modal-body">
              {/* Patient section */}
              <div className="psy-appt-patient">
                <div className="psy-appt-patient-avatar">
                  {selectedAppt.patient?.avatar_url ? (
                    <img src={selectedAppt.patient.avatar_url} alt="" crossOrigin="anonymous" />
                  ) : (
                    <span>{(selectedAppt.patient?.full_name || 'P').charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4>{selectedAppt.patient?.full_name || 'Paciente'}</h4>
                  {selectedAppt.patient?.phone && <p className="psy-appt-phone">Tel: {selectedAppt.patient.phone}</p>}
                </div>
              </div>

              <div className="psy-appt-details">
                <div className="psy-appt-detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <span>{selectedAppt.appointment_date.split('-').reverse().join('/')}</span>
                </div>
                <div className="psy-appt-detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span>{formatTime(selectedAppt.start_time)} - {formatTime(selectedAppt.end_time)}</span>
                </div>
                <div className="psy-appt-detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  <span>${selectedAppt.payment_amount?.toLocaleString()} COP</span>
                  <span className={`psy-appt-pay-badge psy-appt-pay-badge--${selectedAppt.payment_status}`}>
                    {selectedAppt.payment_status === 'pagado' ? 'Pagado' : selectedAppt.payment_status === 'procesando' ? 'Procesando' : 'Pendiente'}
                  </span>
                </div>
                {selectedAppt.payment_reference && (
                  <div className="psy-appt-detail-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    <span>Ref: {selectedAppt.payment_reference} ({selectedAppt.payment_method})</span>
                  </div>
                )}
                <div className="psy-appt-detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <span>Estado: </span>
                  <span className={`psy-appt-status-badge psy-appt-status-badge--${selectedAppt.status}`}>
                    {selectedAppt.status === 'confirmada' ? 'Confirmada' : selectedAppt.status === 'pendiente_pago' ? 'Pendiente de pago' : selectedAppt.status === 'completada' ? 'Completada' : selectedAppt.status}
                  </span>
                </div>
              </div>

              <div className="psy-appt-actions">
                {selectedAppt.patient?.phone && (
                  <button className="psy-wa-btn" onClick={() => handleOpenWhatsApp(selectedAppt.patient?.phone, selectedAppt.patient?.full_name || 'Paciente')} type="button">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Chatear por WhatsApp
                  </button>
                )}
                {selectedAppt.status === 'pendiente_pago' && selectedAppt.payment_status === 'procesando' && (
                  <button className="psy-confirm-pay-btn" onClick={() => handleConfirmPayment(selectedAppt.id)} type="button">
                    Confirmar pago recibido
                  </button>
                )}
                {selectedAppt.status === 'confirmada' && (
                  <button className="psy-complete-btn" onClick={() => handleCompleteAppt(selectedAppt.id)} type="button">
                    Marcar como completada
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PsychologistDashboard;

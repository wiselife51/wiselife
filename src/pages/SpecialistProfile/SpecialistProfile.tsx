import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import './SpecialistProfile.css';

interface Psychologist {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  specialties: string[];
  bio: string | null;
  education: string | null;
  session_price: number;
  session_duration: number;
  modality: string[];
  city: string | null;
  country: string | null;
  years_experience: number;
  languages: string[];
  license_number: string;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface ScheduleBlock {
  block_date: string;
  start_time: string;
  end_time: string;
}

interface ExistingAppointment {
  appointment_date: string;
  start_time: string;
}

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getMonthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  return cells;
}

function getNextDaysForWeek(): { date: Date; dayOfWeek: number; label: string }[] {
  const days: { date: Date; dayOfWeek: number; label: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      dayOfWeek: d.getDay(),
      label: i === 0 ? 'Hoy' : i === 1 ? 'Manana' : `${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
    });
  }
  return days;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function formatDateLong(date: Date): string {
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

type BookingStep = 'select' | 'confirm' | 'payment' | 'success';

const SpecialistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [psy, setPsy] = useState<Psychologist | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [existingAppts, setExistingAppts] = useState<ExistingAppointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ date: Date; dayOfWeek: number; label: string } | null>(null);

  // Booking flow
  const [bookingStep, setBookingStep] = useState<BookingStep>('select');
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [createdApptId, setCreatedApptId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');

  // Schedule view state
  const [scheduleView, setScheduleView] = useState<'list' | 'month'>('list');
  const [calMonth, setCalMonth] = useState(new Date());
  const monthDays = getMonthDays(calMonth.getFullYear(), calMonth.getMonth());
  const todayDate = new Date();

  const getAvailDaysInMonth = () => {
    const availDays = new Set(availability.map((a) => a.day_of_week));
    return monthDays.filter((d) => d && availDays.has(d.getDay()) && d >= todayDate);
  };

  const handleMonthDayClick = (d: Date) => {
    const dayAvail = availability.some((a) => a.day_of_week === d.getDay());
    if (!dayAvail || d < todayDate) return;
    const matchingNext = nextDays.find((nd) => nd.date.toDateString() === d.toDateString());
    if (matchingNext) {
      setSelectedDay(matchingNext);
      setScheduleView('list');
    } else {
      // For dates beyond 14 days, just show they're available
      setSelectedDay({ date: d, dayOfWeek: d.getDay(), label: `${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}` });
      setScheduleView('list');
    }
  };

  const nextDays = getNextDaysForWeek();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const { data: psyData, error: psyError } = await supabase
        .from('psychologists')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (psyError || !psyData) {
        navigate('/especialistas');
        return;
      }
      setPsy(psyData);

      const { data: availData } = await supabase
        .from('psychologist_availability')
        .select('*')
        .eq('psychologist_id', id)
        .eq('is_available', true)
        .order('day_of_week')
        .order('start_time');

      setAvailability(availData || []);

      const today = new Date();
      const twoWeeks = new Date(today);
      twoWeeks.setDate(today.getDate() + 14);

      const { data: blockData } = await supabase
        .from('schedule_blocks')
        .select('block_date, start_time, end_time')
        .eq('psychologist_id', id)
        .gte('block_date', today.toISOString().split('T')[0])
        .lte('block_date', twoWeeks.toISOString().split('T')[0]);

      setBlocks(blockData || []);

      // Fetch existing appointments to filter out taken slots
      const { data: apptData } = await supabase
        .from('appointments')
        .select('appointment_date, start_time')
        .eq('psychologist_id', id)
        .in('status', ['pendiente_pago', 'confirmada'])
        .gte('appointment_date', today.toISOString().split('T')[0])
        .lte('appointment_date', twoWeeks.toISOString().split('T')[0]);

      setExistingAppts(apptData || []);
      setLoadingData(false);

      if (availData && availData.length > 0) {
        const availableDayNumbers = [...new Set(availData.map((a: AvailabilitySlot) => a.day_of_week))];
        const allDays = getNextDaysForWeek();
        const firstAvail = allDays.find((d) => availableDayNumbers.includes(d.dayOfWeek));
        if (firstAvail) setSelectedDay(firstAvail);
      }
    };

    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const getSlotsForDay = (day: { date: Date; dayOfWeek: number } | null) => {
    if (!day) return [];
    const daySlots = availability.filter((a) => a.day_of_week === day.dayOfWeek);
    const dateStr = day.date.toISOString().split('T')[0];

    return daySlots.filter((slot) => {
      const isBlocked = blocks.some(
        (b) => b.block_date === dateStr && b.start_time <= slot.start_time && b.end_time >= slot.end_time
      );
      const isTaken = existingAppts.some(
        (a) => a.appointment_date === dateStr && a.start_time === slot.start_time
      );
      return !isBlocked && !isTaken;
    });
  };

  const handleSlotClick = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setBookingStep('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!user || !psy || !selectedSlot || !selectedDay) return;
    setBookingLoading(true);

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        psychologist_id: psy.id,
        patient_id: user.id,
        appointment_date: selectedDay.date.toISOString().split('T')[0],
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        status: 'pendiente_pago',
        payment_amount: psy.session_price,
        payment_status: 'pendiente',
      })
      .select('id')
      .single();

    setBookingLoading(false);

    if (error) {
      alert('Error al crear la cita. Intenta de nuevo.');
      return;
    }

    setCreatedApptId(data.id);
    setBookingStep('payment');
  };

  const handleNequiPayment = () => {
    const amount = psy?.session_price || 0;
    // Usar el numero configurado del negocio (variable de entorno) o el del psicologo
    const nequiPhone = import.meta.env.VITE_NEQUI_PHONE || psy?.phone || '';
    const ref = createdApptId || 'cita';

    // Detectar si es movil para usar deep link de la app Nequi
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Deep link que abre directamente la app Nequi instalada
      // Si no esta instalada, abre la pagina web de Nequi
      const deepLink = `nequi://payments?phoneNumber=${nequiPhone}&amount=${amount}&reference=${ref}`;
      const webFallback = `https://recarga.nequi.com.co/bdigitalpay?phone=${nequiPhone}&value=${amount}&reference=${ref}`;

      // Intentar abrir la app, si falla ir al web
      const timeout = setTimeout(() => {
        window.open(webFallback, '_blank');
      }, 2500);

      window.location.href = deepLink;

      // Si la app se abrio, cancelar el fallback
      window.addEventListener('blur', () => clearTimeout(timeout), { once: true });
    } else {
      // En desktop: abrir la pagina web de Nequi
      const webUrl = `https://recarga.nequi.com.co/bdigitalpay?phone=${nequiPhone}&value=${amount}&reference=${ref}`;
      window.open(webUrl, '_blank');
    }
  };

  const handleConfirmPayment = async () => {
    if (!createdApptId || !paymentRef.trim()) return;
    setBookingLoading(true);

    await supabase
      .from('appointments')
      .update({
        payment_method: 'nequi',
        payment_reference: paymentRef.trim(),
        payment_status: 'procesando',
        status: 'confirmada',
        updated_at: new Date().toISOString(),
      })
      .eq('id', createdApptId);

    setBookingLoading(false);
    setBookingStep('success');
  };

  const handleCloseBooking = () => {
    setBookingStep('select');
    setSelectedSlot(null);
    setCreatedApptId(null);
    setPaymentRef('');
  };

  const availableSlots = getSlotsForDay(selectedDay);

  if (authLoading || loadingData) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-loading-spinner" />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!psy) return null;

  return (
    <DashboardLayout pageTitle="Perfil del Especialista">
      <div className="sp-page">
        <button className="sp-back-btn" onClick={() => navigate('/especialistas')} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Volver a especialistas</span>
        </button>

        <div className="sp-content">
          {/* Left: Profile */}
          <div className="sp-profile">
            <div className="sp-profile-card">
              <div className="sp-profile-header">
                <div className="sp-avatar">
                  {psy.avatar_url ? (
                    <img src={psy.avatar_url} alt={psy.full_name} crossOrigin="anonymous" />
                  ) : (
                    <span>{psy.full_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="sp-profile-info">
                  <h2>{psy.full_name}</h2>
                  <p className="sp-profile-license">Lic. {psy.license_number}</p>
                  <div className="sp-profile-meta">
                    {psy.city && <span>{psy.city}, {psy.country}</span>}
                    <span>{psy.years_experience} anios exp.</span>
                  </div>
                </div>
              </div>

              {psy.bio && (
                <div className="sp-section">
                  <h3>Sobre mi</h3>
                  <p>{psy.bio}</p>
                </div>
              )}

              {psy.education && (
                <div className="sp-section">
                  <h3>Formacion</h3>
                  <p>{psy.education}</p>
                </div>
              )}

              <div className="sp-section">
                <h3>Especialidades</h3>
                <div className="sp-specialties">
                  {(psy.specialties || []).map((s) => (
                    <span key={s} className="sp-specialty-tag">{s}</span>
                  ))}
                </div>
              </div>

              <div className="sp-section">
                <h3>Detalles</h3>
                <div className="sp-details-grid">
                  <div className="sp-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{psy.session_duration} min por sesion</span>
                  </div>
                  <div className="sp-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span>${psy.session_price?.toLocaleString()} COP por sesion</span>
                  </div>
                  <div className="sp-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{(psy.modality || []).join(', ')}</span>
                  </div>
                  <div className="sp-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>{(psy.languages || []).join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Schedule */}
          <div className="sp-schedule">
            <div className="sp-schedule-card">
              <div className="sp-schedule-header">
                <div>
                  <h3 className="sp-schedule-title">Agenda disponible</h3>
                  <p className="sp-schedule-sub">Selecciona un dia y horario para agendar</p>
                </div>
                <div className="sp-view-toggle">
                  <button
                    className={`sp-view-btn ${scheduleView === 'list' ? 'sp-view-btn--active' : ''}`}
                    onClick={() => setScheduleView('list')}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                  </button>
                  <button
                    className={`sp-view-btn ${scheduleView === 'month' ? 'sp-view-btn--active' : ''}`}
                    onClick={() => setScheduleView('month')}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </button>
                </div>
              </div>

              <div className="sp-price-banner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Valor de la sesion: <strong>${psy.session_price?.toLocaleString()} COP</strong></span>
              </div>

              {/* MONTH VIEW */}
              {scheduleView === 'month' && (
                <div className="sp-month-view">
                  <div className="sp-month-nav">
                    <button
                      className="sp-month-nav-btn"
                      onClick={() => { const d = new Date(calMonth); d.setMonth(d.getMonth() - 1); setCalMonth(d); }}
                      type="button"
                      aria-label="Mes anterior"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <span className="sp-month-title">{MONTH_NAMES[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
                    <button
                      className="sp-month-nav-btn"
                      onClick={() => { const d = new Date(calMonth); d.setMonth(d.getMonth() + 1); setCalMonth(d); }}
                      type="button"
                      aria-label="Mes siguiente"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                  <div className="sp-month-header">
                    {DAY_NAMES_SHORT.map((d) => <div key={d} className="sp-month-day-label">{d}</div>)}
                  </div>
                  <div className="sp-month-grid">
                    {monthDays.map((d, i) => {
                      if (!d) return <div key={`empty-${i}`} className="sp-month-cell sp-month-cell--empty" />;
                      const isAvailable = availability.some((a) => a.day_of_week === d.getDay()) && d >= todayDate;
                      const isToday = d.toDateString() === todayDate.toDateString();
                      const isSelected = selectedDay?.date.toDateString() === d.toDateString();
                      return (
                        <button
                          key={d.toISOString()}
                          className={`sp-month-cell ${isAvailable ? 'sp-month-cell--available' : 'sp-month-cell--unavailable'} ${isToday ? 'sp-month-cell--today' : ''} ${isSelected ? 'sp-month-cell--selected' : ''}`}
                          onClick={() => isAvailable && handleMonthDayClick(d)}
                          disabled={!isAvailable}
                          type="button"
                        >
                          <span className="sp-month-date">{d.getDate()}</span>
                          {isAvailable && <span className="sp-month-avail-dot" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="sp-month-legend">Los dias con punto verde tienen horarios disponibles. Haz click para ver.</p>
                </div>
              )}

              {/* LIST VIEW */}
              {scheduleView === 'list' && (
                <>
                  {/* Day selector */}
                  <div className="sp-days-scroll">
                    {nextDays.map((day) => {
                      const hasSlots = availability.some((a) => a.day_of_week === day.dayOfWeek);
                      return (
                        <button
                          key={day.date.toISOString()}
                          className={`sp-day-btn ${selectedDay?.date.toDateString() === day.date.toDateString() ? 'sp-day-btn--active' : ''} ${!hasSlots ? 'sp-day-btn--disabled' : ''}`}
                          onClick={() => hasSlots && setSelectedDay(day)}
                          disabled={!hasSlots}
                          type="button"
                        >
                          <span className="sp-day-name">{DAY_NAMES[day.dayOfWeek].substring(0, 3)}</span>
                          <span className="sp-day-num">{day.date.getDate()}</span>
                          {day.label === 'Hoy' && <span className="sp-day-today">Hoy</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time slots */}
                  {selectedDay && (
                    <div className="sp-slots-section">
                      <h4 className="sp-slots-date">
                        {selectedDay.label === 'Hoy' || selectedDay.label === 'Manana'
                          ? selectedDay.label
                          : DAY_NAMES[selectedDay.dayOfWeek]}{' '}
                        {selectedDay.date.getDate()}/{selectedDay.date.getMonth() + 1}/{selectedDay.date.getFullYear()}
                      </h4>

                      {availableSlots.length === 0 ? (
                        <div className="sp-slots-empty">
                          <p>No hay horarios disponibles este dia.</p>
                        </div>
                      ) : (
                        <div className="sp-slots-grid">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.id}
                              className={`sp-slot-btn ${selectedSlot?.id === slot.id ? 'sp-slot-btn--active' : ''}`}
                              type="button"
                              onClick={() => handleSlotClick(slot)}
                            >
                              <span className="sp-slot-time">{formatTime(slot.start_time)}</span>
                              <span className="sp-slot-separator">-</span>
                              <span className="sp-slot-time">{formatTime(slot.end_time)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!selectedDay && availability.length > 0 && (
                    <div className="sp-slots-empty">
                      <p>Selecciona un dia para ver los horarios disponibles.</p>
                    </div>
                  )}
                </>
              )}

              {availability.length === 0 && (
                <div className="sp-slots-empty">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p>Este especialista aun no ha configurado su agenda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingStep !== 'select' && selectedSlot && selectedDay && (
        <div className="sp-modal-overlay" onClick={bookingStep === 'success' ? handleCloseBooking : undefined}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            {/* Step: Confirm */}
            {bookingStep === 'confirm' && (
              <>
                <div className="sp-modal-header">
                  <h3>Confirmar cita</h3>
                  <button className="sp-modal-close" onClick={handleCloseBooking} type="button" aria-label="Cerrar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="sp-modal-body">
                  <div className="sp-booking-summary">
                    <div className="sp-booking-psy">
                      <div className="sp-booking-avatar">
                        {psy.avatar_url ? (
                          <img src={psy.avatar_url} alt={psy.full_name} crossOrigin="anonymous" />
                        ) : (
                          <span>{psy.full_name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <strong>{psy.full_name}</strong>
                        <p>Lic. {psy.license_number}</p>
                      </div>
                    </div>
                    <div className="sp-booking-details">
                      <div className="sp-booking-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <span>{formatDateLong(selectedDay.date)}</span>
                      </div>
                      <div className="sp-booking-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span>{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</span>
                      </div>
                      <div className="sp-booking-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span>Duracion: {psy.session_duration} minutos</span>
                      </div>
                    </div>
                    <div className="sp-booking-price">
                      <span>Total a pagar</span>
                      <strong>${psy.session_price?.toLocaleString()} COP</strong>
                    </div>
                  </div>
                </div>
                <div className="sp-modal-footer">
                  <button className="sp-btn-secondary" onClick={handleCloseBooking} type="button">Cancelar</button>
                  <button className="sp-btn-primary" onClick={handleConfirmBooking} disabled={bookingLoading} type="button">
                    {bookingLoading ? 'Creando cita...' : 'Continuar al pago'}
                  </button>
                </div>
              </>
            )}

            {/* Step: Payment */}
            {bookingStep === 'payment' && (
              <>
                <div className="sp-modal-header">
                  <h3>Pago con Nequi</h3>
                  <button className="sp-modal-close" onClick={handleCloseBooking} type="button" aria-label="Cerrar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="sp-modal-body">
                  <div className="sp-payment-section">
                    <div className="sp-nequi-logo">
                      <div className="sp-nequi-badge">Nequi</div>
                    </div>
                    <p className="sp-payment-amount">${psy.session_price?.toLocaleString()} COP</p>

                    <div className="sp-nequi-dest">
                      <span className="sp-nequi-dest-label">Enviar a Nequi:</span>
                      <span className="sp-nequi-dest-phone">{import.meta.env.VITE_NEQUI_PHONE || psy?.phone || 'No configurado'}</span>
                    </div>

                    <div className="sp-payment-steps">
                      <div className="sp-payment-step">
                        <span className="sp-step-num">1</span>
                        <div>
                          <strong>Haz click en "Pagar con Nequi"</strong>
                          <p>Se abrira Nequi automaticamente en tu celular</p>
                        </div>
                      </div>
                      <div className="sp-payment-step">
                        <span className="sp-step-num">2</span>
                        <div>
                          <strong>Confirma el pago en Nequi</strong>
                          <p>Envia exactamente ${psy.session_price?.toLocaleString()} COP al numero indicado</p>
                        </div>
                      </div>
                      <div className="sp-payment-step">
                        <span className="sp-step-num">3</span>
                        <div>
                          <strong>Ingresa la referencia aqui</strong>
                          <p>Copia el numero de transaccion que te da Nequi</p>
                        </div>
                      </div>
                    </div>

                    <button className="sp-nequi-btn" onClick={handleNequiPayment} type="button">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Pagar con Nequi
                    </button>

                    <div className="sp-payment-divider">
                      <span>Despues de pagar</span>
                    </div>

                    <div className="sp-payment-ref">
                      <label htmlFor="payment-ref">Numero de referencia / transaccion Nequi</label>
                      <input
                        id="payment-ref"
                        type="text"
                        placeholder="Ej: NQI123456789"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                      />
                      <span className="sp-payment-ref-help">Lo encuentras en el comprobante de Nequi despues de pagar</span>
                    </div>
                  </div>
                </div>
                <div className="sp-modal-footer">
                  <button className="sp-btn-secondary" onClick={handleCloseBooking} type="button">Cancelar</button>
                  <button className="sp-btn-primary" onClick={handleConfirmPayment} disabled={bookingLoading || !paymentRef.trim()} type="button">
                    {bookingLoading ? 'Confirmando...' : 'Confirmar pago'}
                  </button>
                </div>
              </>
            )}

            {/* Step: Success */}
            {bookingStep === 'success' && (
              <>
                <div className="sp-modal-body sp-success-body">
                  <div className="sp-success-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3>Cita agendada con exito</h3>
                  <p>Tu cita con <strong>{psy.full_name}</strong> ha sido confirmada.</p>
                  <div className="sp-success-details">
                    <span>{formatDateLong(selectedDay.date)}</span>
                    <span>{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</span>
                  </div>
                  <p className="sp-success-note">El psicologo verificara tu pago y recibiras una confirmacion. Podras comunicarte por WhatsApp desde la seccion "Mis citas".</p>
                </div>
                <div className="sp-modal-footer">
                  <button className="sp-btn-primary sp-btn-full" onClick={() => navigate('/mis-citas')} type="button">
                    Ver mis citas
                  </button>
                  <button className="sp-btn-secondary sp-btn-full" onClick={handleCloseBooking} type="button">
                    Seguir explorando
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SpecialistProfile;

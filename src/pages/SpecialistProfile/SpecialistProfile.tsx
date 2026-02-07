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

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

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

const SpecialistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [psy, setPsy] = useState<Psychologist | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ date: Date; dayOfWeek: number; label: string } | null>(null);

  const nextDays = getNextDaysForWeek();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Fetch psychologist profile
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

      // Fetch availability
      const { data: availData } = await supabase
        .from('psychologist_availability')
        .select('*')
        .eq('psychologist_id', id)
        .eq('is_available', true)
        .order('day_of_week')
        .order('start_time');

      setAvailability(availData || []);

      // Fetch blocks for the next 14 days
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
      setLoadingData(false);

      // Set first available day
      if (availData && availData.length > 0) {
        const availableDayNumbers = [...new Set(availData.map((a) => a.day_of_week))];
        const firstAvail = nextDays.find((d) => availableDayNumbers.includes(d.dayOfWeek));
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

    // Filter out blocked slots
    return daySlots.filter((slot) => {
      const isBlocked = blocks.some(
        (b) =>
          b.block_date === dateStr &&
          b.start_time <= slot.start_time &&
          b.end_time >= slot.end_time
      );
      return !isBlocked;
    });
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
        {/* Back button */}
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
                    <span>${psy.session_price?.toLocaleString()} por sesion</span>
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
              <h3 className="sp-schedule-title">Agenda disponible</h3>
              <p className="sp-schedule-sub">Selecciona un dia para ver los horarios</p>

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
                          className="sp-slot-btn"
                          type="button"
                          onClick={() => {
                            // Futuro: aqui se conectara con el sistema de reservas
                            alert(`Proximamente: Agendar cita ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)} con ${psy.full_name}`);
                          }}
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
    </DashboardLayout>
  );
};

export default SpecialistProfile;

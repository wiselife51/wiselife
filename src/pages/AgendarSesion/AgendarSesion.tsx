import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toDateStr } from '../../lib/date';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import BookingModal from './BookingModal';
import ReviewsModal from './ReviewsModal';
import ProfileModal from './ProfileModal';
import StarRating from '../../components/StarRating/StarRating';
import { fetchRatingSummaries } from '../../lib/reviews';
import type { RatingSummary } from '../../lib/reviews';
import {
  DAY_NAMES,
  MODALITY_LABELS,
  PATIENT_TYPE_LABELS,
  SPECIALTY_FILTERS,
  formatTime,
  getAvailableModalities,
  getPatientTypesForModality,
  getPriceFor,
  getUpcomingDays,
  normalizeTime,
} from './booking';
import type {
  AvailabilitySlot,
  BookingDay,
  BookingPsychologist,
  ExistingAppointment,
  ScheduleBlock,
} from './booking';
import './BookingShared.css';
import './AgendarSesion.css';

const STEPS = ['Especialista', 'Horario', 'Pago'];

const AgendarSesion: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [psychologists, setPsychologists] = useState<BookingPsychologist[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState(() => searchParams.get('especialidad') || '');
  const [ratings, setRatings] = useState<Record<string, RatingSummary>>({});
  const [reviewsFor, setReviewsFor] = useState<BookingPsychologist | null>(null);
  const [profileFor, setProfileFor] = useState<BookingPsychologist | null>(null);

  const [selected, setSelected] = useState<BookingPsychologist | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [existing, setExisting] = useState<ExistingAppointment[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState(false);

  const [modality, setModality] = useState('');
  const [patientType, setPatientType] = useState('');
  const [day, setDay] = useState<BookingDay | null>(null);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);

  const days = useMemo(() => getUpcomingDays(), []);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchList = async () => {
      const { data } = await supabase
        .from('psychologists')
        .select('id, full_name, avatar_url, phone, specialties, session_price, session_prices, session_duration, modality, city, years_experience, license_number, profile_text, bio, languages')
        .eq('is_active', true)
        .eq('onboarding_completed', true)
        .order('full_name');
      const list = (data || []) as BookingPsychologist[];
      setRatings(await fetchRatingSummaries());
      setPsychologists(list);
      setLoadingList(false);

      const preselected = searchParams.get('especialista');
      const match = preselected ? list.find((p) => p.id === preselected) : null;
      if (match) chooseSpecialist(match);
    };
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return psychologists.filter((p) => {
      const matchesName = !term || p.full_name.toLowerCase().includes(term);
      const matchesSpecialty =
        !specialty || (p.specialties || []).some((s) => s.toLowerCase().includes(specialty.toLowerCase()));
      return matchesName && matchesSpecialty;
    });
  }, [psychologists, search, specialty]);

  const loadAgenda = async (psy: BookingPsychologist) => {
    setLoadingAgenda(true);
    const today = new Date();
    const limit = new Date(today);
    limit.setDate(today.getDate() + 14);

    const [availRes, blockRes, apptRes] = await Promise.all([
      supabase
        .from('psychologist_availability')
        .select('*')
        .eq('psychologist_id', psy.id)
        .eq('is_available', true)
        .order('day_of_week')
        .order('start_time'),
      supabase
        .from('schedule_blocks')
        .select('block_date, start_time, end_time')
        .eq('psychologist_id', psy.id)
        .gte('block_date', toDateStr(today))
        .lte('block_date', toDateStr(limit)),
      supabase
        .from('appointments')
        .select('appointment_date, start_time')
        .eq('psychologist_id', psy.id)
        .in('status', ['pendiente_pago', 'confirmada'])
        .gte('appointment_date', toDateStr(today))
        .lte('appointment_date', toDateStr(limit)),
    ]);

    const avail = (availRes.data || []) as AvailabilitySlot[];
    setAvailability(avail);
    setBlocks((blockRes.data || []) as ScheduleBlock[]);
    setExisting((apptRes.data || []) as ExistingAppointment[]);
    const firstDay = days.find((d) => avail.some((a) => a.day_of_week === d.dayOfWeek)) || null;
    setDay(firstDay);
    setLoadingAgenda(false);
  };

  const chooseSpecialist = (psy: BookingPsychologist) => {
    const defaultModality = getAvailableModalities(psy)[0];
    setSelected(psy);
    setModality(defaultModality);
    setPatientType(getPatientTypesForModality(psy, defaultModality)[0]);
    setSlot(null);
    setDay(null);
    loadAgenda(psy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToList = () => {
    setSelected(null);
    setSlot(null);
    setDay(null);
  };

  const slotsForDay = useMemo(() => {
    if (!day) return [];
    const dateStr = toDateStr(day.date);
    const now = new Date();
    const isToday = day.date.toDateString() === now.toDateString();
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return availability
      .filter((a) => a.day_of_week === day.dayOfWeek)
      .filter((s) => {
        const blocked = blocks.some(
          (b) => b.block_date === dateStr && b.start_time <= s.start_time && b.end_time >= s.end_time,
        );
        const taken = existing.some(
          (a) => a.appointment_date === dateStr && normalizeTime(a.start_time) === normalizeTime(s.start_time),
        );
        const past = isToday && normalizeTime(s.start_time) <= nowTime;
        return !blocked && !taken && !past;
      });
  }, [day, availability, blocks, existing]);

  const price = selected ? getPriceFor(selected, modality, patientType) : 0;
  const activeStep = slot ? 2 : selected ? 1 : 0;

  const handleSlotTaken = () => {
    if (day && slot) {
      setExisting((current) => [
        ...current,
        { appointment_date: toDateStr(day.date), start_time: slot.start_time },
      ]);
    }
    setSlot(null);
  };

  if (authLoading) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-loading-spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <DashboardLayout pageTitle="Agendar sesión" subtitle="Elige tu especialista, el horario y confirma en minutos">
      <div className="ag-page">
        <ol className="ag-stepper" aria-label="Pasos para agendar">
          {STEPS.map((label, index) => (
            <li
              key={label}
              className={`ag-step ${index === activeStep ? 'ag-step--active' : ''} ${index < activeStep ? 'ag-step--done' : ''}`}
              aria-current={index === activeStep ? 'step' : undefined}
            >
              <span className="ag-step-num">{index + 1}</span>
              <span className="ag-step-label">{label}</span>
            </li>
          ))}
        </ol>

        {!selected && (
          <section className="ag-card" aria-labelledby="ag-choose-title">
            <div className="ag-card-head">
              <h2 id="ag-choose-title">Elige tu especialista</h2>
              <p>Filtra por nombre o especialidad y selecciona con quién quieres agendar.</p>
            </div>

            <div className="ag-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar especialista por nombre"
              />
            </div>

            <div className="ag-chips" role="group" aria-label="Filtrar por especialidad">
              <button type="button" className={`ag-chip ${specialty === '' ? 'ag-chip--active' : ''}`} onClick={() => setSpecialty('')}>
                Todas
              </button>
              {SPECIALTY_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`ag-chip ${specialty === s ? 'ag-chip--active' : ''}`}
                  onClick={() => setSpecialty(specialty === s ? '' : s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {loadingList ? (
              <div className="ag-state"><div className="dash-loading-spinner" /></div>
            ) : filtered.length === 0 ? (
              <div className="ag-state">
                <p>No encontramos especialistas con esos filtros.</p>
                <button type="button" className="ag-link-btn" onClick={() => { setSearch(''); setSpecialty(''); }}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <ul className="ag-list">
                {filtered.map((psy) => (
                  <li key={psy.id}>
                    <article className="ag-psy">
                      <div className="ag-psy-top">
                        <span className="ag-psy-avatar">
                          {psy.avatar_url ? (
                            <img src={psy.avatar_url} alt="" crossOrigin="anonymous" />
                          ) : (
                            <span>{psy.full_name.charAt(0).toUpperCase()}</span>
                          )}
                        </span>
                        <div className="ag-psy-info">
                          <strong>{psy.full_name}</strong>
                          {(psy.specialties || [])[0] && (
                            <p className="ag-specialty">{psy.specialties.slice(0, 2).join(' · ')}</p>
                          )}
                        </div>
                      </div>

                      <div className="ag-psy-rating">
                        <StarRating value={ratings[psy.id]?.rating_avg || 0} size={16} />
                        <span className="ag-psy-rating-text">
                          {ratings[psy.id]
                            ? `${ratings[psy.id].rating_avg.toFixed(1)} (${ratings[psy.id].rating_count})`
                            : 'Sin opiniones'}
                        </span>
                      </div>

                      <dl className="ag-psy-facts">
                        <div>
                          <dt>Experiencia</dt>
                          <dd>{psy.years_experience} años</dd>
                        </div>
                        <div>
                          <dt>Sesión</dt>
                          <dd>{psy.session_duration} min</dd>
                        </div>
                        <div>
                          <dt>Desde</dt>
                          <dd>${(psy.session_price || 0).toLocaleString('es-CO')}</dd>
                        </div>
                      </dl>

                      <div className="ag-psy-actions">
                        <button type="button" className="ag-psy-btn" onClick={() => setProfileFor(psy)}>
                          Perfil
                        </button>
                        <button type="button" className="ag-psy-btn" onClick={() => setReviewsFor(psy)}>
                          Opiniones
                        </button>
                        <button type="button" className="ag-psy-btn" onClick={() => chooseSpecialist(psy)}>
                          Agendar
                        </button>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {selected && (
          <section className="ag-card" aria-labelledby="ag-schedule-title">
            <div className="ag-selected">
              <span className="ag-psy-avatar">
                {selected.avatar_url ? (
                  <img src={selected.avatar_url} alt="" crossOrigin="anonymous" />
                ) : (
                  <span>{selected.full_name.charAt(0).toUpperCase()}</span>
                )}
              </span>
              <div className="ag-selected-info">
                <h2 id="ag-schedule-title">{selected.full_name}</h2>
                <span>{(selected.specialties || []).slice(0, 2).join(' · ')}</span>
              </div>
              <button type="button" className="ag-change-btn" onClick={backToList}>Cambiar</button>
            </div>

            <div className="sp-pricing-selector">
              <div className="sp-pricing-group">
                <span className="sp-pricing-label">Modalidad</span>
                <div className="sp-pricing-options">
                  {getAvailableModalities(selected).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`sp-pricing-chip ${modality === key ? 'sp-pricing-chip--active' : ''}`}
                      onClick={() => {
                        setModality(key);
                        setPatientType(getPatientTypesForModality(selected, key)[0]);
                      }}
                    >
                      {MODALITY_LABELS[key] || key}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sp-pricing-group">
                <span className="sp-pricing-label">Tipo de consulta</span>
                <div className="sp-pricing-options">
                  {getPatientTypesForModality(selected, modality).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`sp-pricing-chip ${patientType === key ? 'sp-pricing-chip--active' : ''}`}
                      onClick={() => setPatientType(key)}
                    >
                      {PATIENT_TYPE_LABELS[key] || key}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sp-price-banner">
              <span>Valor de la sesión: <strong>${price.toLocaleString('es-CO')} COP</strong></span>
            </div>

            {loadingAgenda ? (
              <div className="ag-state"><div className="dash-loading-spinner" /></div>
            ) : availability.length === 0 ? (
              <div className="ag-state">
                <p>Este especialista aún no ha configurado su agenda.</p>
                <button type="button" className="ag-link-btn" onClick={backToList}>Elegir otro especialista</button>
              </div>
            ) : (
              <>
                <h3 className="ag-subtitle">Elige el día</h3>
                <div className="sp-days-scroll">
                  {days.map((d) => {
                    const hasSlots = availability.some((a) => a.day_of_week === d.dayOfWeek);
                    const active = day?.date.toDateString() === d.date.toDateString();
                    return (
                      <button
                        key={d.date.toISOString()}
                        type="button"
                        className={`sp-day-btn ${active ? 'sp-day-btn--active' : ''} ${!hasSlots ? 'sp-day-btn--disabled' : ''}`}
                        disabled={!hasSlots}
                        onClick={() => { setDay(d); setSlot(null); }}
                      >
                        <span className="sp-day-name">{DAY_NAMES[d.dayOfWeek].substring(0, 3)}</span>
                        <span className="sp-day-num">{d.date.getDate()}</span>
                        {d.label === 'Hoy' && <span className="sp-day-today">Hoy</span>}
                      </button>
                    );
                  })}
                </div>

                <h3 className="ag-subtitle">Elige la hora</h3>
                {slotsForDay.length === 0 ? (
                  <div className="ag-state"><p>No hay horarios disponibles este día.</p></div>
                ) : (
                  <div className="sp-slots-grid">
                    {slotsForDay.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`sp-slot-btn ${slot?.id === s.id ? 'sp-slot-btn--active' : ''}`}
                        onClick={() => setSlot(s)}
                      >
                        <span className="sp-slot-time">{formatTime(s.start_time)}</span>
                        <span className="sp-slot-separator">-</span>
                        <span className="sp-slot-time">{formatTime(s.end_time)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>

      {profileFor && (
        <ProfileModal
          psy={profileFor}
          summary={ratings[profileFor.id]}
          onClose={() => setProfileFor(null)}
          onSchedule={() => {
            const target = profileFor;
            setProfileFor(null);
            chooseSpecialist(target);
          }}
        />
      )}

      {reviewsFor && (
        <ReviewsModal
          psy={reviewsFor}
          summary={ratings[reviewsFor.id]}
          onClose={() => setReviewsFor(null)}
        />
      )}

      {selected && day && slot && user && (
        <BookingModal
          patientId={user.id}
          psy={selected}
          day={day}
          slot={slot}
          modality={modality}
          patientType={patientType}
          amount={price}
          onClose={() => setSlot(null)}
          onSlotTaken={handleSlotTaken}
        />
      )}
    </DashboardLayout>
  );
};

export default AgendarSesion;

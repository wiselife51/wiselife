import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './PsychologistDashboard.css';

interface PsychologistProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  specialties: string[];
  session_duration: number;
  session_price: number;
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

const DAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mie' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sab' },
  { value: 0, label: 'Dom' },
];

const DAY_FULL: Record<number, string> = {
  0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miercoles',
  4: 'Jueves', 5: 'Viernes', 6: 'Sabado',
};

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 7;
  return `${h.toString().padStart(2, '0')}:00`;
});

const PsychologistDashboard: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PsychologistProfile | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'agenda' | 'bloqueos'>('agenda');

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

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);

    const { data: psyData } = await supabase
      .from('psychologists')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!psyData) {
      navigate('/psicologo/onboarding');
      return;
    }

    setProfile(psyData as PsychologistProfile);

    const { data: availData } = await supabase
      .from('psychologist_availability')
      .select('*')
      .eq('psychologist_id', psyData.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    setAvailability((availData || []) as AvailabilitySlot[]);

    const { data: blocksData } = await supabase
      .from('schedule_blocks')
      .select('*')
      .eq('psychologist_id', psyData.id)
      .gte('block_date', new Date().toISOString().split('T')[0])
      .order('block_date', { ascending: true })
      .order('start_time', { ascending: true });

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const daySlots = availability.filter((s) => s.day_of_week === selectedDay);

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

        {/* Profile summary */}
        <div className="psy-dash-profile">
          <div className="psy-dash-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} />
            ) : (
              <span>{profile?.full_name?.charAt(0) || 'P'}</span>
            )}
          </div>
          <h3 className="psy-dash-name">{profile?.full_name}</h3>
          <p className="psy-dash-email">{profile?.email}</p>
        </div>

        {/* Nav */}
        <nav className="psy-dash-nav">
          <button type="button" className={`psy-dash-nav-item ${activeTab === 'agenda' ? 'psy-dash-nav-item--active' : ''}`} onClick={() => setActiveTab('agenda')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <span>Mi Agenda</span>
          </button>
          <button type="button" className={`psy-dash-nav-item ${activeTab === 'bloqueos' ? 'psy-dash-nav-item--active' : ''}`} onClick={() => setActiveTab('bloqueos')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
            <span>Bloqueos</span>
          </button>
        </nav>

        <button type="button" className="psy-dash-signout" onClick={handleSignOut}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          <span>Cerrar sesion</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="psy-dash-main">
        {activeTab === 'agenda' && (
          <>
            <div className="psy-dash-header">
              <h1>Mi Agenda</h1>
              <button type="button" className="psy-dash-btn-primary" onClick={() => setShowAddSlot(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Agregar horario
              </button>
            </div>

            {/* Day selector */}
            <div className="psy-dash-days">
              {DAYS.map((d) => {
                const count = availability.filter((s) => s.day_of_week === d.value).length;
                return (
                  <button key={d.value} type="button" className={`psy-dash-day ${selectedDay === d.value ? 'psy-dash-day--active' : ''}`} onClick={() => setSelectedDay(d.value)}>
                    <span className="psy-dash-day-label">{d.label}</span>
                    {count > 0 && <span className="psy-dash-day-count">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Slots for selected day */}
            <div className="psy-dash-slots">
              <h3>{DAY_FULL[selectedDay]}</h3>
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

            {/* Add slot modal */}
            {showAddSlot && (
              <div className="psy-dash-modal-backdrop" onClick={() => setShowAddSlot(false)}>
                <div className="psy-dash-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Agregar horario disponible</h3>
                  <div className="psy-dash-modal-fields">
                    <div className="psy-dash-modal-field">
                      <label>Dia</label>
                      <select value={newSlotDay} onChange={(e) => setNewSlotDay(parseInt(e.target.value))}>
                        {DAYS.map((d) => <option key={d.value} value={d.value}>{DAY_FULL[d.value]}</option>)}
                      </select>
                    </div>
                    <div className="psy-dash-modal-row">
                      <div className="psy-dash-modal-field">
                        <label>Inicio</label>
                        <select value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)}>
                          {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div className="psy-dash-modal-field">
                        <label>Fin</label>
                        <select value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)}>
                          {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
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

        {activeTab === 'bloqueos' && (
          <>
            <div className="psy-dash-header">
              <h1>Bloqueos de horario</h1>
              <button type="button" className="psy-dash-btn-primary" onClick={() => setShowBlockForm(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Bloquear fecha
              </button>
            </div>

            <p className="psy-dash-block-desc">Bloquea fechas y horas especificas cuando no puedas atender citas.</p>

            {blocks.length === 0 ? (
              <div className="psy-dash-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                <p>No tienes bloqueos configurados.</p>
              </div>
            ) : (
              <div className="psy-dash-block-list">
                {blocks.map((block) => (
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

            {/* Block form modal */}
            {showBlockForm && (
              <div className="psy-dash-modal-backdrop" onClick={() => setShowBlockForm(false)}>
                <div className="psy-dash-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Bloquear horario</h3>
                  <div className="psy-dash-modal-fields">
                    <div className="psy-dash-modal-field">
                      <label>Fecha</label>
                      <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="psy-dash-modal-row">
                      <div className="psy-dash-modal-field">
                        <label>Desde</label>
                        <select value={blockStart} onChange={(e) => setBlockStart(e.target.value)}>
                          {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div className="psy-dash-modal-field">
                        <label>Hasta</label>
                        <select value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)}>
                          {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
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
    </div>
  );
};

export default PsychologistDashboard;
